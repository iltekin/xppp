import { extractAvatarSignature } from '../utils/xDomSelectors';

/**
 * Injects a native-styled "Profile Picture Preview" button into the profile header
 * when the user is on their own X profile, with pixel-perfect alignment.
 */
export class XProfileButtonInjector {
  private onOpenModal: () => void;
  private observer: MutationObserver | null = null;
  private checkInterval: number | null = null;
  private readonly BUTTON_ID = 'xppp-profile-preview-btn';

  constructor(onOpenModal: () => void) {
    this.onOpenModal = onOpenModal;
    this.handleDOMChange = this.handleDOMChange.bind(this);
  }

  public start(): void {
    // 1. Observe DOM changes for SPA navigation
    this.observer = new MutationObserver(() => {
      this.handleDOMChange();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 2. Periodic check every 500ms for dynamic layout transitions and alignment
    this.checkInterval = window.setInterval(() => {
      this.handleDOMChange();
    }, 500);

    // 3. Initial check
    this.handleDOMChange();
  }

  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.removeInjectedButton();
  }

  private handleDOMChange(): void {
    // Look for own profile indicators
    const editBtn = document.querySelector(
      '[data-testid="editProfileButton"], a[href="/settings/profile"], a[href$="/settings/profile"]'
    );

    if (!editBtn) {
      return;
    }

    const targetElement = (editBtn.closest('a, button') || editBtn) as HTMLElement;

    // Check if button already exists and is connected to document
    const existing = document.getElementById(this.BUTTON_ID);
    if (existing && document.body.contains(existing)) {
      if (existing.parentElement === targetElement.parentElement) {
        // Re-check and enforce vertical alignment
        this.alignWithTarget(existing, targetElement);
        return;
      } else {
        existing.remove();
      }
    }

    // Find the container holding the action buttons
    const container = targetElement.parentElement;
    if (!container) return;

    // Clone targetElement to inherit X's 100% native component structure, classes, and layout rules
    const button = targetElement.cloneNode(true) as HTMLElement;
    button.id = this.BUTTON_ID;
    button.removeAttribute('data-testid');
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', 'Profile Picture Preview');

    // If it was an anchor, prevent standard navigation and behave as an accessible button
    if (button.tagName.toLowerCase() === 'a') {
      button.removeAttribute('href');
      button.removeAttribute('target');
      (button as HTMLAnchorElement).href = 'javascript:void(0);';
    }

    button.style.cursor = 'pointer';
    button.style.userSelect = 'none';
    button.style.textDecoration = 'none';
    button.style.flexShrink = '0';

    // Respect container gap or add standard 8px spacing
    const containerStyle = window.getComputedStyle(container);
    const hasGap =
      (containerStyle.gap && containerStyle.gap !== 'normal' && containerStyle.gap !== '0px') ||
      (containerStyle.columnGap && containerStyle.columnGap !== 'normal' && containerStyle.columnGap !== '0px');

    if (!hasGap) {
      button.style.marginRight = '8px';
    } else {
      button.style.marginRight = '0px';
    }

    // Replace inner content with camera icon + "Profile Picture Preview"
    const innerWrapper = button.firstElementChild as HTMLElement | null;
    const contentHtml = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; width: 100%;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-right: 6px; display: inline-block;">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <span style="font-weight: 700; font-size: inherit; line-height: 1; white-space: nowrap;">Profile Picture Preview</span>
      </div>
    `;

    if (innerWrapper) {
      innerWrapper.innerHTML = contentHtml;
    } else {
      button.innerHTML = contentHtml;
    }

    const isLightMode =
      window.getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)';
    const hoverBg = isLightMode ? 'rgba(15, 20, 25, 0.1)' : 'rgba(239, 243, 244, 0.1)';

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = hoverBg;
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'transparent';
    });

    button.addEventListener('mousedown', () => {
      const current = button.style.transform.replace(/\s*scale\([^)]+\)/g, '');
      button.style.transform = `${current} scale(0.98)`;
    });

    button.addEventListener('mouseup', () => {
      button.style.transform = button.style.transform.replace(/\s*scale\([^)]+\)/g, '');
    });

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Detect username from URL and profile header avatar
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const username = pathParts[0] || null;
      const headerAvatar = document.querySelector(
        'a[href$="/photo"] img, a[href*="/photo"] img, [data-testid="UserAvatar-Container"] img, [data-testid="primaryColumn"] img[src*="profile_images"]'
      ) as HTMLImageElement | null;

      const rawSrc =
        headerAvatar?.getAttribute('data-xppp-original-src') ||
        headerAvatar?.currentSrc ||
        headerAvatar?.src;
      const signature = extractAvatarSignature(rawSrc);

      if ((window as any).__xppp_avatar_replacer) {
        (window as any).__xppp_avatar_replacer.setUserDetails(username, signature);
      }

      this.onOpenModal();
    });

    // Insert right before the "Edit profile" button
    container.insertBefore(button, targetElement);

    // Immediately snap into pixel-perfect vertical alignment with targetElement
    this.alignWithTarget(button, targetElement);
    requestAnimationFrame(() => this.alignWithTarget(button, targetElement));
    setTimeout(() => this.alignWithTarget(button, targetElement), 40);
    setTimeout(() => this.alignWithTarget(button, targetElement), 120);
    setTimeout(() => this.alignWithTarget(button, targetElement), 300);
  }

  /**
   * Reads the rendered bounding client rects and applies an exact translateY offset
   * so both buttons have identical top coordinates regardless of flexbox rules.
   */
  private alignWithTarget(button: HTMLElement, targetElement: HTMLElement): void {
    const targetRect = targetElement.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    if (targetRect.height > 0 && buttonRect.height > 0) {
      // Ensure height is identical
      if (Math.abs(targetRect.height - buttonRect.height) > 0.5) {
        button.style.height = `${targetRect.height}px`;
        button.style.minHeight = `${targetRect.height}px`;
        button.style.maxHeight = `${targetRect.height}px`;
      }

      const diff = targetRect.top - buttonRect.top;
      if (Math.abs(diff) > 0.5) {
        const match = button.style.transform.match(/translateY\(([-\d.]+)px\)/);
        const currentY = match ? parseFloat(match[1]) : 0;
        const newY = Math.round((currentY + diff) * 10) / 10;
        const scaleMatch = button.style.transform.match(/scale\([^)]+\)/);
        const scaleStr = scaleMatch ? ` ${scaleMatch[0]}` : '';
        button.style.transform = `translateY(${newY}px)${scaleStr}`;
      }
    }
  }

  private removeInjectedButton(): void {
    const existing = document.getElementById(this.BUTTON_ID);
    if (existing) {
      existing.remove();
    }
  }
}
