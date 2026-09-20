import React, { useState, useEffect } from 'react';
import { PreviewImageState, UserProfile, ThemeMode } from '../types';
import { extractCurrentXUserProfile, detectXTheme } from '../utils/xDomSelectors';
import { OverlayModal } from '../components/Modal/OverlayModal';
import { FloatingButton } from '../components/FloatingButton';
import { XProfileImageDetector } from './detector';

// Default sleek placeholder image for demo/fallback when none selected yet
const DEFAULT_SAMPLE_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231d9bf0"/><circle cx="100" cy="80" r="40" fill="white"/><path d="M40 180 C40 130 160 130 160 180 Z" fill="white"/></svg>';

export const App: React.FC = () => {
  const [imageState, setImageState] = useState<PreviewImageState | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => extractCurrentXUserProfile());
  const [theme, setTheme] = useState<ThemeMode>(() => detectXTheme());

  useEffect(() => {
    // Re-check profile & theme on mount
    setUserProfile(extractCurrentXUserProfile());
    setTheme(detectXTheme());

    // Setup detector for X's native image upload dialog
    const detector = new XProfileImageDetector((detectedState, autoOpen) => {
      setImageState(detectedState);
      if (autoOpen) {
        setIsModalOpen(true);
      }
    });

    detector.start();

    // Listen for custom launch event (e.g. from popup or DOM)
    const handleLaunchMessage = (e: any) => {
      if (e.detail?.action === 'open_preview') {
        if (e.detail?.imageState) {
          setImageState(e.detail.imageState);
        }
        setIsModalOpen(true);
      }
    };
    window.addEventListener('xppp_open_preview', handleLaunchMessage);

    return () => {
      detector.stop();
      window.removeEventListener('xppp_open_preview', handleLaunchMessage);
    };
  }, []);

  const handleImageSelected = (newImage: PreviewImageState) => {
    setImageState(newImage);
    setIsModalOpen(true);
  };

  const handleOpenFallbackModal = () => {
    if (!imageState) {
      setImageState({
        url: userProfile.avatarUrl || DEFAULT_SAMPLE_AVATAR,
        fileName: 'Default Profile Avatar',
      });
    }
    setIsModalOpen(true);
  };

  const activeImage = imageState || {
    url: userProfile.avatarUrl || DEFAULT_SAMPLE_AVATAR,
    fileName: 'Current Avatar Preview',
  };

  return (
    <>
      {/* Fallback & quick-access floating button */}
      <FloatingButton
        onImageSelected={handleImageSelected}
        onOpenEmptyModal={handleOpenFallbackModal}
        hasActiveImage={Boolean(imageState?.url)}
      />

      {/* Main Multi-Context Overlay Modal */}
      {isModalOpen && (
        <OverlayModal
          imageState={activeImage}
          user={userProfile}
          initialTheme={theme}
          onClose={() => setIsModalOpen(false)}
          onImageChange={(newImage) => setImageState(newImage)}
          onUserChange={(updated) => setUserProfile(updated)}
        />
      )}
    </>
  );
};
