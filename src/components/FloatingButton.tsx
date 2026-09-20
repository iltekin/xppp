import React, { useRef } from 'react';
import { PreviewImageState } from '../types';
import { processImageFile } from '../utils/imageProcessor';

interface FloatingButtonProps {
  onImageSelected: (image: PreviewImageState) => void;
  onOpenEmptyModal: () => void;
  hasActiveImage: boolean;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onImageSelected,
  onOpenEmptyModal,
  hasActiveImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const processed = await processImageFile(file);
      onImageSelected(processed);
    } catch (err: any) {
      alert(err.message || 'Error processing image');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2147483646] font-chirp select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      <div className="group relative flex items-center">
        {/* Tooltip */}
        <div className="absolute right-full mr-3 hidden group-hover:flex items-center whitespace-nowrap bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-neutral-800 pointer-events-none transition-all">
          <span>Preview profile picture across X before saving</span>
        </div>

        {/* Floating Capsule Button */}
        <div className="flex items-center rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700/80 shadow-2xl p-1.5 pl-3 transition-all transform hover:scale-105 active:scale-95 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              if (hasActiveImage) {
                onOpenEmptyModal();
              } else {
                fileInputRef.current?.click();
              }
            }}
            className="flex items-center space-x-2 text-xs font-bold mr-2 text-left"
          >
            <div className="w-6 h-6 rounded-full bg-xblue flex items-center justify-center text-white flex-shrink-0 shadow">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="tracking-tight pr-1">X Profile Picture Preview</span>
          </button>

          {/* Quick upload icon button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload image directly"
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition-colors border border-neutral-600/50"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
