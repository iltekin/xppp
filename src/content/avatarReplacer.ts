import { StoredAvatarPreview } from '../types';
import { loadAvatarPreview, saveAvatarPreview, subscribeToAvatarUpdates } from '../utils/storage';
import { detectLoggedUser, extractAvatarSignature } from '../utils/xDomSelectors';

export class XAvatarReplacer {
  private activePreview: StoredAvatarPreview | null = null;
  private observer: MutationObserver | null = null;
  private scanTimer: number | null = null;
  private userHandle: string | null = null;
  private userAvatarSignature: string | null = null;
  private isScanning = false;
  private unsubscribeStorage: (() => void) | null = null;

  constructor() {
    this.handleUrlChange = this.handleUrlChange.bind(this);
  }

  public async start(): Promise<void> {
    // 1. Initial load from storage
    this.activePreview = await loadAvatarPreview();
    if (this.activePreview?.userHandle) {
      this.userHandle = this.activePreview.userHandle.toLowerCase();
    }
    if (this.activePreview?.userAvatarSignature) {
      this.userAvatarSignature = this.activePreview.userAvatarSignature;
    }

    // 2. Subscribe to storage updates
    this.unsubscribeStorage = subscribeToAvatarUpdates((updated) => {
      const wasEnabled = Boolean(this.activePreview?.enabled && this.activePreview?.dataUrl);
      const isNowEnabled = Boolean(updated?.enabled && updated?.dataUrl);

      this.activePreview = updated;
      if (updated?.userHandle) {
        this.userHandle = updated.userHandle.toLowerCase();
      }
      if (updated?.userAvatarSignature) {
        this.userAvatarSignature = updated.userAvatarSignature;
      }

      if (isNowEnabled) {
        this.startScanningLoop();
        this.scheduleScanAndReplace();
      } else if (wasEnabled && !isNowEnabled) {
        this.stopScanningLoop();
        this.revertAllReplacements();
      }
    });

    // 3. Detect user details from DOM
    this.detectUserDetails();

    // 4. Start DOM observer
    this.startObserver();

    // 5. Watch for SPA URL navigation
    window.addEventListener('popstate', this.handleUrlChange);
    this.wrapHistoryMethods();

    // 6. If already active, kick off scanning loop and replace immediately
    if (this.activePreview?.enabled && this.activePreview.dataUrl) {
      this.startScanningLoop();
      this.scheduleScanAndReplace();
    }
  }

  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.stopScanningLoop();
    if (this.unsubscribeStorage) {
      this.unsubscribeStorage();
      this.unsubscribeStorage = null;
    }
    window.removeEventListener('popstate', this.handleUrlChange);
    this.revertAllReplacements();
  }

  public setActivePreview(preview: StoredAvatarPreview | null): void {
    this.activePreview = preview;
    if (preview?.userHandle) {
      this.userHandle = preview.userHandle.toLowerCase();
    }
    if (preview?.userAvatarSignature) {
      this.userAvatarSignature = preview.userAvatarSignature;
    }
    if (preview?.enabled && preview?.dataUrl) {
      this.startScanningLoop();
      this.scanAndReplace();
      // Fast follow-up passes to catch any elements rendering after modal unmounts
      setTimeout(() => this.scanAndReplace(), 40);
      setTimeout(() => this.scanAndReplace(), 120);
      setTimeout(() => this.scanAndReplace(), 300);
    } else {
      this.stopScanningLoop();
      this.revertAllReplacements();
    }
  }

  public setUserDetails(handle: string | null, signature: string | null): void {
    if (handle) this.userHandle = handle.toLowerCase();
    if (signature) this.userAvatarSignature = signature;
  }

  public getUserHandle(): string | null {
    if (!this.userHandle) this.detectUserDetails();
    return this.userHandle;
  }

  public getUserAvatarSignature(): string | null {
    if (!this.userAvatarSignature) this.detectUserDetails();
    return this.userAvatarSignature;
  }

  private startScanningLoop(): void {
    if (this.scanTimer !== null) return;
    this.scanTimer = window.setInterval(() => {
      if (this.activePreview?.enabled && this.activePreview?.dataUrl) {
        this.scanAndReplace();
      } else {
        this.stopScanningLoop();
      }
    }, 500);
  }

  private stopScanningLoop(): void {
    if (this.scanTimer !== null) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  }

  private wrapHistoryMethods(): void {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args: any[]) => {
      originalPushState.apply(history, args as any);
      this.handleUrlChange();
    };

    history.replaceState = (...args: any[]) => {
      originalReplaceState.apply(history, args as any);
      this.handleUrlChange();
    };
  }

  private handleUrlChange(): void {
    this.detectUserDetails();
    if (this.activePreview?.enabled && this.activePreview.dataUrl) {
      this.scheduleScanAndReplace();
    }
  }

  /**
   * Scrapes current logged-in user handle and avatar signature from the page
   */
  public detectUserDetails(): void {
    const detected = detectLoggedUser();
    let updated = false;

    if (detected.username && detected.username !== this.userHandle) {
      this.userHandle = detected.username.toLowerCase();
      updated = true;
    }

    if (detected.signature && detected.signature !== this.userAvatarSignature) {
      this.userAvatarSignature = detected.signature;
      updated = true;
    }

    // Persist discovered details to storage so they survive future reloads
    if (updated && this.activePreview) {
      const clone = {
        ...this.activePreview,
        userHandle: this.userHandle || undefined,
        userAvatarSignature: this.userAvatarSignature || undefined,
        originalAvatarUrl: detected.avatarUrl || this.activePreview.originalAvatarUrl,
      };
      this.activePreview = clone;
      saveAvatarPreview(clone).catch(() => {});
    }
  }

  private startObserver(): void {
    this.observer = new MutationObserver(() => {
      if (!this.activePreview?.enabled || !this.activePreview.dataUrl) {
        return;
      }
      this.scheduleScanAndReplace();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset'],
    });
  }

  public scheduleScanAndReplace(): void {
    if (this.isScanning) return;
    this.isScanning = true;
    requestAnimationFrame(() => {
      this.scanAndReplace();
      this.isScanning = false;
    });
  }

  /**
   * Scans document for user avatars and replaces them
   */
  public scanAndReplace(): void {
    if (!this.activePreview?.enabled || !this.activePreview.dataUrl) {
      return;
    }

    const previewUrl = this.activePreview.dataUrl;

    // Refresh user details if missing
    if (!this.userHandle || !this.userAvatarSignature) {
      this.detectUserDetails();
    }

    const username = this.userHandle;
    const signature = this.userAvatarSignature;

    // 1. Process <img> elements
    const images = document.querySelectorAll('img');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (this.isUserAvatar(img, username, signature)) {
        this.replaceSingleImage(img, previewUrl);
      }
    }

    // 2. Process background-image containers (some avatars on X use background-image)
    if (signature) {
      const bgElements = document.querySelectorAll<HTMLElement>('[style*="background-image"], [style*="background:"]');
      for (let i = 0; i < bgElements.length; i++) {
        const el = bgElements[i];
        const style = el.getAttribute('style') || '';
        if (style.includes(signature) && !style.includes(previewUrl)) {
          el.setAttribute('data-xppp-original-style', style);
          el.style.backgroundImage = `url("${previewUrl}")`;
          el.setAttribute('data-xppp-replaced', 'true');
        }
      }
    }
  }

  /**
   * Robust test to check whether an <img> is the logged-in user's avatar
   */
  private isUserAvatar(
    img: HTMLImageElement,
    username: string | null,
    signature: string | null
  ): boolean {
    const src = img.currentSrc || img.src || '';
    const srcset = img.srcset || '';
    const originalSrc = img.getAttribute('data-xppp-original-src') || src;
    const originalSrcset = img.getAttribute('data-xppp-original-srcset') || srcset;

    // Check if this img is inside our extension modal or host
    if (img.closest('#x-profile-picture-preview-root')) {
      return false;
    }

    // A. Match by unique avatar signature (100% accurate for any size of this avatar)
    if (signature && (originalSrc.includes(signature) || originalSrcset.includes(signature))) {
      return true;
    }

    // B. Account switcher in sidebar
    if (img.closest('[data-testid="SideNav_AccountSwitcher_Button"]')) {
      this.learnSignatureFromImage(img);
      return true;
    }

    // C. User's own profile header avatar
    const isOwnProfile = document.querySelector(
      '[data-testid="editProfileButton"], a[href="/settings/profile"], a[href$="/settings/profile"]'
    );
    if (isOwnProfile) {
      if (
        img.closest('[data-testid="primaryColumn"]') &&
        !img.closest('article[data-testid="tweet"]')
      ) {
        if (
          originalSrc.includes('profile_images') ||
          originalSrc.includes('default_profile') ||
          img.closest('a[href*="/photo"]') ||
          img.closest('[data-testid="UserAvatar-Container"]')
        ) {
          this.learnSignatureFromImage(img);
          return true;
        }
      }
    }

    // D. Tweet compose box avatars (where logged in user is drafting a post)
    if (
      img.closest('[data-testid="tweetTextarea_0_container"]') ||
      img.closest('[data-testid="tweetTextarea_0"]') ||
      img.closest('[data-testid="tweetButtonInline"]')
    ) {
      if (originalSrc.includes('profile_images') || originalSrc.includes('default_profile')) {
        this.learnSignatureFromImage(img);
        return true;
      }
    }

    // E. Tweets or replies in timeline authored by the current user
    if (username) {
      const tweet = img.closest('article[data-testid="tweet"]');
      if (tweet) {
        // Must match author in User-Name header
        const authorLink = tweet.querySelector(
          `div[data-testid="User-Name"] a[href="/${username}" i], a[role="link"][href="/${username}" i]`
        );
        if (authorLink && img.closest('[data-testid="Tweet-User-Avatar"]')) {
          this.learnSignatureFromImage(img);
          return true;
        }
      }
    }

    return false;
  }

  private learnSignatureFromImage(img: HTMLImageElement): void {
    if (this.userAvatarSignature) return;
    const rawSrc = img.getAttribute('data-xppp-original-src') || img.currentSrc || img.src;
    if (rawSrc && !rawSrc.startsWith('data:')) {
      const sig = extractAvatarSignature(rawSrc);
      if (sig) {
        this.userAvatarSignature = sig;
        if (this.activePreview) {
          const clone = { ...this.activePreview, userAvatarSignature: sig };
          this.activePreview = clone;
          saveAvatarPreview(clone).catch(() => {});
        }
      }
    }
  }

  private replaceSingleImage(img: HTMLImageElement, newUrl: string): void {
    // If already replaced with this specific URL and no srcset, no-op
    if (
      img.getAttribute('data-xppp-active-url') === newUrl &&
      img.src === newUrl &&
      !img.hasAttribute('srcset') &&
      img.getAttribute('data-xppp-replaced') === 'true'
    ) {
      return;
    }

    // Store original values before first replacement
    if (!img.hasAttribute('data-xppp-original-src')) {
      img.setAttribute('data-xppp-original-src', img.currentSrc || img.src);
      if (img.srcset) {
        img.setAttribute('data-xppp-original-srcset', img.srcset);
      }
    }

    img.setAttribute('data-xppp-replaced', 'true');
    img.setAttribute('data-xppp-active-url', newUrl);

    // CRITICAL: Remove srcset completely so the browser loads src directly.
    // Setting srcset with a data URL causes browser parsers to split on commas inside the base64 string, resulting in blank/white images!
    img.removeAttribute('srcset');
    img.src = newUrl;
  }

  private revertAllReplacements(): void {
    // 1. Revert <img> elements
    const replacedImgs = document.querySelectorAll('img[data-xppp-replaced="true"]');
    replacedImgs.forEach((el) => {
      const img = el as HTMLImageElement;
      const originalSrc = img.getAttribute('data-xppp-original-src');
      const originalSrcset = img.getAttribute('data-xppp-original-srcset');

      if (originalSrc) {
        img.src = originalSrc;
      }
      if (originalSrcset) {
        img.srcset = originalSrcset;
      } else {
        img.removeAttribute('srcset');
      }

      img.removeAttribute('data-xppp-replaced');
      img.removeAttribute('data-xppp-active-url');
      img.removeAttribute('data-xppp-original-src');
      img.removeAttribute('data-xppp-original-srcset');
    });

    // 2. Revert background-image elements
    const replacedBgs = document.querySelectorAll('[data-xppp-original-style]');
    replacedBgs.forEach((el) => {
      const orig = el.getAttribute('data-xppp-original-style');
      if (orig) {
        el.setAttribute('style', orig);
      }
      el.removeAttribute('data-xppp-original-style');
      el.removeAttribute('data-xppp-replaced');
    });
  }
}
