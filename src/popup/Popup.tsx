import React, { useState, useEffect } from 'react';
import { StoredAvatarPreview } from '../types';
import { loadAvatarPreview, clearAvatarPreview } from '../utils/storage';
import { CropModal } from '../components/Modal/CropModal';

export const Popup: React.FC = () => {
  const [activePreview, setActivePreview] = useState<StoredAvatarPreview | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => {
    loadAvatarPreview().then((saved) => {
      setActivePreview(saved);
    });
  }, []);

  const openXProfile = () => {
    chrome.tabs.create({ url: 'https://x.com' });
  };

  const handleRemove = async () => {
    await clearAvatarPreview();
    setActivePreview(null);
  };

  return (
    <div className="w-[360px] p-5 font-chirp bg-black text-[#e7e9ea] select-none">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <img
          src="/icons/icon48.png"
          alt="X Profile Picture Preview"
          className="w-9 h-9 rounded-xl shadow-md object-contain"
        />
        <div>
          <h1 className="text-base font-bold tracking-tight">X Profile Picture Preview</h1>
          <p className="text-xs text-[#1d9bf0] font-medium">Preview without losing your Blue Checkmark</p>
        </div>
      </div>

      {/* Active Preview Status Card */}
      {activePreview?.enabled && activePreview.dataUrl ? (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3 mb-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-400 shadow flex-shrink-0">
              <img src={activePreview.dataUrl} alt="Active preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Preview Active</span>
              </div>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Your profile pictures across X are replaced with this preview.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1 border-t border-emerald-500/20">
            <button
              type="button"
              onClick={() => setIsCropModalOpen(true)}
              className="flex-1 py-1.5 px-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-[11px] transition-colors"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="py-1.5 px-3 rounded-full text-red-400 hover:bg-red-500/10 border border-red-500/20 font-semibold text-[11px] transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 mb-4 text-xs">
          <p className="text-neutral-300">
            Test new avatars in realistic contexts across X <strong>without triggering review or risking losing your Blue Checkmark</strong>.
          </p>
          <p className="text-[11px] text-neutral-400">
            Find the <strong>Profile Picture Preview</strong> button on your profile, or adjust directly from here:
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setIsCropModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span>Select & Adjust Photo (Resize / Pan)</span>
        </button>

        <button
          type="button"
          onClick={openXProfile}
          className="w-full py-2 px-4 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
        >
          <span>Go to X (x.com)</span>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" x2="21" y1="14" y2="3" />
          </svg>
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-800 text-center space-y-1">
        <p className="text-[10px] text-neutral-500">
          100% Client-Side • Never uploaded to any server • Safe
        </p>
        <p className="text-[11px] text-neutral-400">
          Created by{' '}
          <a
            href="https://x.com/sezeriltekin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1d9bf0] font-semibold hover:underline"
          >
            @sezeriltekin
          </a>
        </p>
      </div>

      {/* Crop Modal when open */}
      {isCropModalOpen && (
        <CropModal
          initialPreview={activePreview}
          currentTheme="dark"
          userHandle={activePreview?.userHandle || null}
          onClose={() => setIsCropModalOpen(false)}
          onApplied={(applied) => {
            setActivePreview(applied);
            setIsCropModalOpen(false);
          }}
          onReset={() => {
            setActivePreview(null);
            setIsCropModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
