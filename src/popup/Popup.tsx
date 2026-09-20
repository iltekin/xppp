import React, { useState, useRef } from 'react';
import { PreviewImageState, UserProfile } from '../types';
import { processImageFile } from '../utils/imageProcessor';
import { OverlayModal } from '../components/Modal/OverlayModal';

export const Popup: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<PreviewImageState | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultUser: UserProfile = {
    displayName: 'Preview User',
    username: 'preview_user',
    avatarUrl: null,
    bio: 'Previewing profile pictures realistically across X before saving.',
    location: 'San Francisco, CA',
    website: 'https://x.com',
    joinedDate: 'Joined September 2021',
    followingCount: '342',
    followersCount: '8.9K',
    isVerified: true,
    bannerUrl: null,
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const state = await processImageFile(file);
      setSelectedImage(state);
      setIsModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Error loading image');
    }
  };

  const openXProfile = () => {
    chrome.tabs.create({ url: 'https://x.com' });
  };

  return (
    <div className="w-[360px] p-5 font-chirp bg-black text-[#e7e9ea] select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFile}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-xblue flex items-center justify-center text-white font-bold shadow-md">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">X Profile Picture Preview</h1>
          <p className="text-xs text-neutral-400">Realistic multi-context preview on X</p>
        </div>
      </div>

      {/* Description Card */}
      <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 mb-4 text-xs">
        <div className="flex items-start space-x-2 text-neutral-300">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>
            Prevents losing your blue verification badge accidentally by letting you preview your new photo across all X contexts first.
          </span>
        </div>
      </div>

      {/* Features list */}
      <div className="text-xs text-neutral-400 space-y-1.5 mb-5 pl-1">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-xblue" />
          <span>Profile (134px avatar & banner)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-xblue" />
          <span>Timeline Post (40px avatar)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-xblue" />
          <span>Thread Reply (40px connected)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-xblue" />
          <span>Search Results & Notifications</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 px-4 rounded-full bg-xblue hover:bg-xblue-hover text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span>Choose Image to Preview</span>
        </button>

        <button
          type="button"
          onClick={openXProfile}
          className="w-full py-2 px-4 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
        >
          <span>Open X (x.com)</span>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" x2="21" y1="14" y2="3" />
          </svg>
        </button>
      </div>

      {/* Footer info */}
      <p className="mt-4 text-[10px] text-neutral-500 text-center">
        100% Client-side • Zero uploads • Offline ready
      </p>

      {/* Modal Preview when activated */}
      {isModalOpen && selectedImage && (
        <OverlayModal
          imageState={selectedImage}
          user={defaultUser}
          initialTheme="dark"
          onClose={() => setIsModalOpen(false)}
          onImageChange={(newImg) => setSelectedImage(newImg)}
        />
      )}
    </div>
  );
};
