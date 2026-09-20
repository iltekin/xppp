import { processImageFile } from '../utils/imageProcessor';
import { PreviewImageState } from '../types';

export type OnImageDetectedCallback = (imageState: PreviewImageState, autoOpenModal?: boolean) => void;

/**
 * Detects image selection in X's edit profile flow and injects the 'Preview' action.
 */
export class XProfileImageDetector {
  private onImageDetected: OnImageDetectedCallback;
  private observer: MutationObserver | null = null;
  private lastDetectedImage: PreviewImageState | null = null;

  constructor(onImageDetected: OnImageDetectedCallback) {
    this.onImageDetected = onImageDetected;
  }

  public start(): void {
    this.attachFileInputListeners();
    this.startDOMObserver();
  }

  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Listen for native input[type="file"] change events across the page.
   * When user selects a profile image in X's Edit Profile dialog, we capture the File directly.
   */
  private attachFileInputListeners(): void {
    document.addEventListener(
      'change',
      async (event: Event) => {
        const target = event.target as HTMLInputElement | null;
        if (!target || target.type !== 'file' || !target.files || target.files.length === 0) {
          return;
        }

        const file = target.files[0];
        if (!file.type.startsWith('image/')) {
          return;
        }

        try {
          const imageState = await processImageFile(file);
          this.lastDetectedImage = imageState;
          console.debug('[X Profile Picture Preview] Successfully captured selected image file:', file.name);

          // Notify app with captured image and offer preview
          this.onImageDetected(imageState, true);

          // Also inject "Preview" button into X's active dialog
          setTimeout(() => {
            this.injectPreviewButtonIntoDialog(imageState);
          }, 300);
        } catch (err) {
          console.debug('[X Profile Picture Preview] Could not process captured image:', err);
        }
      },
      true // capture phase to intercept early
    );
  }

  /**
   * Observer that watches for X's dialog or cropper appearing in DOM.
   */
  private startDOMObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Check if dialog or cropper was added
          const dialog = document.querySelector('div[role="dialog"]');
          if (dialog) {
            this.handleDialogDetected(dialog as HTMLElement);
          }
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * When a dialog is active, check if it's an edit profile or avatar adjustment dialog
   * and inject our dedicated "Preview" button if not already present.
   */
  private handleDialogDetected(dialog: HTMLElement): void {
    // If we already injected button, do nothing
    if (dialog.querySelector('#xppp-dialog-preview-btn')) {
      return;
    }

    // Check if this is an Edit profile or Crop media dialog
    const textContent = dialog.textContent || '';
    const isEditProfileOrMedia =
      textContent.includes('Edit profile') ||
      textContent.includes('Edit media') ||
      textContent.includes('Crop media') ||
      textContent.includes('Apply') ||
      textContent.includes('Save') ||
      dialog.querySelector('input[type="file"][accept*="image"]');

    if (!isEditProfileOrMedia) {
      return;
    }

    // Also look for blob or canvas if image was set
    const blobImg = dialog.querySelector('img[src*="blob:"]') as HTMLImageElement | null;
    if (blobImg && blobImg.src && (!this.lastDetectedImage || this.lastDetectedImage.url !== blobImg.src)) {
      this.lastDetectedImage = {
        url: blobImg.src,
        fileName: 'Selected X Image',
      };
      this.onImageDetected(this.lastDetectedImage, false);
    }

    this.injectPreviewButtonIntoDialog(this.lastDetectedImage);
  }

  /**
   * Injects an elegant "Preview" button into X's dialog header/footer.
   */
  private injectPreviewButtonIntoDialog(imageState: PreviewImageState | null): void {
    const dialog = document.querySelector('div[role="dialog"]');
    if (!dialog || dialog.querySelector('#xppp-dialog-preview-btn')) {
      return;
    }

    // Try finding header or action button container
    const header = dialog.querySelector('div[data-testid="app-bar-back"], div[data-testid="close"]')
      ?.parentElement?.parentElement || dialog.firstElementChild;

    if (!header) return;

    const btn = document.createElement('button');
    btn.id = 'xppp-dialog-preview-btn';
    btn.type = 'button';
    btn.innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span>Preview in X Profile Picture Preview</span>
      </span>
    `;

    // High quality inline styles matching X dark/light aesthetics
    Object.assign(btn.style, {
      marginRight: '8px',
      padding: '5px 12px',
      fontSize: '12px',
      fontWeight: '700',
      color: '#ffffff',
      backgroundColor: '#1d9bf0',
      border: 'none',
      borderRadius: '9999px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      zIndex: '100',
      transition: 'opacity 0.2s',
      boxShadow: '0 2px 8px rgba(29, 155, 240, 0.4)',
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.opacity = '0.9';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.opacity = '1';
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (imageState) {
        this.onImageDetected(imageState, true);
      } else {
        // If image not captured yet, dispatch event to prompt image selection or open modal
        const emptyState: PreviewImageState = {
          url: '',
          fileName: 'Select Image to Preview',
        };
        this.onImageDetected(emptyState, true);
      }
    });

    // Insert near the save/apply buttons or header
    const applyOrSaveBtn = dialog.querySelector('button[data-testid="applyButton"], button[data-testid="saveButton"]');
    if (applyOrSaveBtn && applyOrSaveBtn.parentElement) {
      applyOrSaveBtn.parentElement.insertBefore(btn, applyOrSaveBtn);
    } else {
      header.appendChild(btn);
    }
  }
}
