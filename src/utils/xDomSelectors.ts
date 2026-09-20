import { ThemeMode, UserProfile } from '../types';

/**
 * Isolated DOM selectors for X (x.com).
 */
export const X_SELECTORS = {
  // Dialogs & edit profile
  dialog: 'div[role="dialog"]',
  fileInput: 'input[type="file"][accept*="image"]',
  avatarInputContainer: '[data-testid="fileInput"], [aria-label*="avatar" i], [aria-label*="profile photo" i]',
  cropperContainer: 'div[data-testid="cropperContainer"]',
  cropperSaveButton: 'button[data-testid="applyButton"], button[data-testid="saveButton"]',

  // Profile actions
  editProfileButton: '[data-testid="editProfileButton"], a[href="/settings/profile"], a[href$="/settings/profile"]',

  // User profile metadata from the current page
  accountSwitcher: '[data-testid="SideNav_AccountSwitcher_Button"]',
  profileNavLinks: 'a[data-testid="AppTabBar_Profile_Link"], a[href^="/"][aria-label*="Profile" i], a[href^="/"][aria-label*="Profil" i]',
  profileHeaderUserName: 'div[data-testid="UserName"]',
  primaryColumn: 'div[data-testid="primaryColumn"]',
  userAvatarImg: 'img[src*="profile_images"]',
  userBio: 'div[data-testid="UserDescription"]',
  headerProfilePhoto: 'a[href$="/photo"] img, a[href*="/photo"] img, [data-testid="UserAvatar-Container"] img',
};

/**
 * Extracts unique image key/signature from X's avatar URLs.
 * e.g. "https://pbs.twimg.com/profile_images/1832049283920199680/abcd1234_normal.jpg"
 * -> "1832049283920199680/abcd1234"
 */
export function extractAvatarSignature(url: string | null | undefined): string | null {
  if (!url) return null;
  // Never treat default avatars as a unique user signature (prevents matching other default users)
  if (url.includes('default_profile') || url.includes('sticky/default_profile_images')) {
    return null;
  }
  // Standard pattern: profile_images/<id>/<hash>
  const match = url.match(/profile_images\/(\d+\/[^_.?#]+)/);
  if (match) {
    return match[1];
  }
  // Generic fallback: profile_images/<id_or_hash>/<id_or_hash>
  const genericMatch = url.match(/profile_images\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)/);
  if (genericMatch) {
    return genericMatch[1].replace(/_(normal|bigger|mini|\d+x\d+)$/, '');
  }
  return null;
}

/**
 * Detects the current active theme mode on x.com.
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

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

/**
 * Detects the logged-in user handle and avatar image directly from DOM.
 */
export function detectLoggedUser(): { username: string | null; avatarUrl: string | null; signature: string | null } {
  let username: string | null = null;
  let avatarUrl: string | null = null;

  // 1. Check account switcher in sidebar
  const switcher = document.querySelector(X_SELECTORS.accountSwitcher);
  if (switcher) {
    const text = switcher.textContent || '';
    const match = text.match(/@([a-zA-Z0-9_]{1,15})/);
    if (match) {
      username = match[1].toLowerCase();
    }
    const img = switcher.querySelector('img') as HTMLImageElement | null;
    if (img) {
      const src = img.getAttribute('data-xppp-original-src') || img.currentSrc || img.src;
      if (src && !src.startsWith('data:')) {
        avatarUrl = src;
      }
    }
  }

  // 2. Check sidebar navigation profile link (e.g. <a href="/myhandle">)
  if (!username) {
    const navLinks = document.querySelectorAll(X_SELECTORS.profileNavLinks);
    for (let i = 0; i < navLinks.length; i++) {
      const href = navLinks[i].getAttribute('href') || '';
      const clean = href.replace(/^\/+/, '').split('/')[0].split('?')[0].toLowerCase();
      if (clean && !['home', 'explore', 'notifications', 'messages', 'i', 'compose'].includes(clean)) {
        username = clean;
        break;
      }
    }
  }

  // 3. If on own profile (edit profile button present)
  const isOwnProfile = document.querySelector(X_SELECTORS.editProfileButton);
  if (isOwnProfile) {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && !['home', 'explore', 'notifications', 'messages', 'i'].includes(pathParts[0].toLowerCase())) {
      username = pathParts[0].toLowerCase();
    }

    // Try finding the profile avatar in the header
    const headerAvatar = document.querySelector(X_SELECTORS.headerProfilePhoto) as HTMLImageElement | null;
    if (headerAvatar) {
      const src = headerAvatar.getAttribute('data-xppp-original-src') || headerAvatar.currentSrc || headerAvatar.src;
      if (src && !src.startsWith('data:')) {
        avatarUrl = src;
      }
    }
  }

  const signature = extractAvatarSignature(avatarUrl);
  return { username, avatarUrl, signature };
}

/**
 * Attempts to scrape the current user's profile info from the active X page.
 */
export function extractCurrentXUserProfile(): UserProfile {
  const detected = detectLoggedUser();

  const fallbackProfile: UserProfile = {
    displayName: detected.username ? `@${detected.username}` : 'Profile User',
    username: detected.username || 'preview_user',
    avatarUrl: detected.avatarUrl || null,
    bio: 'Previewing profile pictures realistically across X before saving.',
    location: '',
    website: 'https://x.com',
    joinedDate: 'Joined recently',
    followingCount: '150',
    followersCount: '1.2K',
    isVerified: true,
    bannerUrl: null,
  };

  try {
    const switcher = document.querySelector(X_SELECTORS.accountSwitcher);
    if (switcher) {
      const textLines = (switcher.textContent || '').trim().split('\n').map((s) => s.trim()).filter(Boolean);
      if (textLines.length >= 2) {
        fallbackProfile.displayName = textLines[0];
      }
    }

    const userNameEl = document.querySelector(X_SELECTORS.profileHeaderUserName);
    if (userNameEl) {
      const lines = (userNameEl.textContent || '').split('\n').map((s) => s.trim()).filter(Boolean);
      if (lines.length > 0) {
        fallbackProfile.displayName = lines[0];
      }
    }

    const bioEl = document.querySelector(X_SELECTORS.userBio);
    if (bioEl && bioEl.textContent) {
      fallbackProfile.bio = bioEl.textContent.trim();
    }
  } catch (err) {
    // ignore
  }

  return fallbackProfile;
}
