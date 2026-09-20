import React, { useState, useEffect } from 'react';
import { StoredAvatarPreview, ThemeMode } from '../types';
import { detectXTheme, extractCurrentXUserProfile } from '../utils/xDomSelectors';
import { CropModal } from '../components/Modal/CropModal';
import { loadAvatarPreview, subscribeToAvatarUpdates } from '../utils/storage';

export const App: React.FC = () => {
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<StoredAvatarPreview | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => detectXTheme());
  const [userHandle, setUserHandle] = useState<string | null>(null);

  useEffect(() => {
    // Initial loads
    setTheme(detectXTheme());
    const profile = extractCurrentXUserProfile();
    if (profile.username && profile.username !== 'preview_user') {
      setUserHandle(profile.username);
    }

    // Load active preview from storage
    loadAvatarPreview().then((saved) => {
      setActivePreview(saved);
    });

    // Subscribe to storage updates
    const unsubscribe = subscribeToAvatarUpdates((updated) => {
      setActivePreview(updated);
    });

    // Listen for custom launch event (e.g. from profile button or popup)
    const handleOpenModal = () => {
      setTheme(detectXTheme());
      const currentProf = extractCurrentXUserProfile();
      if (currentProf.username && currentProf.username !== 'preview_user') {
        setUserHandle(currentProf.username);
      }
      setIsCropModalOpen(true);
    };

    window.addEventListener('xppp_open_crop_modal', handleOpenModal);

    return () => {
      unsubscribe();
      window.removeEventListener('xppp_open_crop_modal', handleOpenModal);
    };
  }, []);

  return (
    <>
      {isCropModalOpen && (
        <CropModal
          initialPreview={activePreview}
          currentTheme={theme}
          userHandle={userHandle}
          onClose={() => setIsCropModalOpen(false)}
          onApplied={(applied) => {
            setActivePreview(applied);
            setIsCropModalOpen(false);
            if ((window as any).__xppp_avatar_replacer) {
              if (applied.userHandle || applied.userAvatarSignature) {
                (window as any).__xppp_avatar_replacer.setUserDetails(
                  applied.userHandle || null,
                  applied.userAvatarSignature || null
                );
              }
              (window as any).__xppp_avatar_replacer.scanAndReplace();
            }
          }}
          onReset={() => {
            setActivePreview(null);
            setIsCropModalOpen(false);
            if ((window as any).__xppp_avatar_replacer) {
              (window as any).__xppp_avatar_replacer.revertAllReplacements();
            }
          }}
        />
      )}
    </>
  );
};
