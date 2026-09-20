import { StoredAvatarPreview } from '../types';

const STORAGE_KEY = 'xppp_active_avatar_preview';

export async function saveAvatarPreview(preview: StoredAvatarPreview): Promise<void> {
  // 1. Try chrome.storage.local
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [STORAGE_KEY]: preview });
    }
  } catch (err) {
    console.warn('[XPPP] chrome.storage.local save failed, falling back to localStorage', err);
  }

  // 2. Also save to localStorage as backup / instant access
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preview));
  } catch (err) {
    console.warn('[XPPP] localStorage save failed', err);
  }

  // 3. Notify window listeners
  window.dispatchEvent(
    new CustomEvent('xppp_avatar_updated', {
      detail: preview,
    })
  );
}

export async function loadAvatarPreview(): Promise<StoredAvatarPreview | null> {
  // 1. Try chrome.storage.local
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result && result[STORAGE_KEY]) {
        return result[STORAGE_KEY] as StoredAvatarPreview;
      }
    }
  } catch (err) {
    console.warn('[XPPP] chrome.storage.local load failed', err);
  }

  // 2. Fallback to localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as StoredAvatarPreview;
    }
  } catch (err) {
    console.warn('[XPPP] localStorage load failed', err);
  }

  return null;
}

export async function clearAvatarPreview(): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.remove(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[XPPP] chrome.storage.local remove failed', err);
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[XPPP] localStorage remove failed', err);
  }

  window.dispatchEvent(
    new CustomEvent('xppp_avatar_updated', {
      detail: null,
    })
  );
}

export function subscribeToAvatarUpdates(callback: (preview: StoredAvatarPreview | null) => void): () => void {
  const domListener = (e: Event) => {
    const custom = e as CustomEvent<StoredAvatarPreview | null>;
    callback(custom.detail ?? null);
  };
  window.addEventListener('xppp_avatar_updated', domListener);

  let chromeListener: any = null;
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chromeListener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
        if (area === 'local' && changes[STORAGE_KEY]) {
          callback(changes[STORAGE_KEY].newValue ?? null);
        }
      };
      chrome.storage.onChanged.addListener(chromeListener);
    }
  } catch (err) {
    // ignore
  }

  return () => {
    window.removeEventListener('xppp_avatar_updated', domListener);
    if (chromeListener && typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.removeListener(chromeListener);
    }
  };
}
