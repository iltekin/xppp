import { ThemeMode, UserProfile } from '../types';

/**
 * Isolated DOM selectors for X (x.com).
 * Keeping all brittle selectors here ensures easy updates when X updates its markup.
 */
export const X_SELECTORS = {
  // Dialogs & edit profile
  dialog: 'div[role="dialog"]',
  fileInput: 'input[type="file"][accept*="image"]',
  avatarInputContainer: '[data-testid="fileInput"], [aria-label*="avatar" i], [aria-label*="profile photo" i]',
  cropperContainer: 'div[data-testid="cropperContainer"]',
  cropperSaveButton: 'button[data-testid="applyButton"], button[data-testid="saveButton"]',
  
  // User profile metadata from the current page
  accountSwitcher: 'div[data-testid="SideNav_AccountSwitcher_Button"]',
  profileHeaderUserName: 'div[data-testid="UserName"]',
  primaryColumn: 'div[data-testid="primaryColumn"]',
  userAvatarImg: 'img[src*="profile_images"]',
  userBio: 'div[data-testid="UserDescription"]',
};

/**
 * Detects the current active theme mode on x.com.
 * X uses 3 themes: Default Dark (#000000), Dim (#15202b), and Light (#ffffff).
 */
export function detectXTheme(): ThemeMode {
  try {
    const bgColor = window.getComputedStyle(document.body).backgroundColor;
    if (bgColor === 'rgb(0, 0, 0)' || bgColor === 'rgba(0, 0, 0, 1)') {
      return 'dark';
    }
    if (bgColor === 'rgb(21, 32, 43)' || bgColor === 'rgba(21, 32, 43, 1)') {
      return 'dim';
    }
    if (bgColor === 'rgb(255, 255, 255)' || bgColor === 'rgba(255, 255, 255, 1)') {
      return 'light';
    }
  } catch {
    // ignore
  }

  // Check color-scheme or dark mode preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

/**
 * Attempts to scrape the current user's profile info (name, handle, existing avatar, bio)
 * from the active X page. Returns sensible defaults if not found.
 */
export function extractCurrentXUserProfile(): UserProfile {
  const fallbackProfile: UserProfile = {
    displayName: 'Preview User',
    username: 'preview_user',
    avatarUrl: null,
    bio: 'Building, creating, and experimenting on the web. Exploring high-fidelity previews on X.',
    location: 'San Francisco, CA',
    website: 'https://x.com',
    joinedDate: 'Joined September 2021',
    followingCount: '482',
    followersCount: '12.4K',
    isVerified: true,
    bannerUrl: null,
  };

  try {
    // 1. Try to read from side navigation account switcher
    const switcher = document.querySelector(X_SELECTORS.accountSwitcher);
    if (switcher) {
      const textLines = (switcher.textContent || '').trim().split('\n').map(s => s.trim()).filter(Boolean);
      if (textLines.length >= 2) {
        fallbackProfile.displayName = textLines[0];
        const handleLine = textLines.find(line => line.startsWith('@'));
        if (handleLine) {
          fallbackProfile.username = handleLine.replace('@', '');
        }
      }
      const avatarEl = switcher.querySelector('img') as HTMLImageElement | null;
      if (avatarEl && avatarEl.src) {
        fallbackProfile.avatarUrl = avatarEl.src;
      }
    }

    // 2. If on user's own profile page, try to extract bio and stats
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length === 1 && !['home', 'explore', 'notifications', 'messages', 'i'].includes(pathParts[0])) {
      fallbackProfile.username = pathParts[0];

      const userNameEl = document.querySelector(X_SELECTORS.profileHeaderUserName);
      if (userNameEl) {
        const lines = (userNameEl.textContent || '').split('\n').map(s => s.trim()).filter(Boolean);
        if (lines.length > 0) {
          fallbackProfile.displayName = lines[0];
        }
      }

      const bioEl = document.querySelector(X_SELECTORS.userBio);
      if (bioEl && bioEl.textContent) {
        fallbackProfile.bio = bioEl.textContent.trim();
      }
    }
  } catch (err) {
    console.debug('[X Profile Picture Preview] Note: using default profile placeholders', err);
  }

  return fallbackProfile;
}
