import React, { useState, useRef } from 'react';
import { PreviewTab, ThemeMode, UserProfile, PreviewImageState } from '../../types';
import { SegmentedNav } from './SegmentedNav';
import { ThemeSelector } from '../ThemeSelector';
import { ProfilePreview } from '../Previews/ProfilePreview';
import { PostPreview } from '../Previews/PostPreview';
import { ReplyPreview } from '../Previews/ReplyPreview';
import { SearchPreview } from '../Previews/SearchPreview';
import { NotificationPreview } from '../Previews/NotificationPreview';
import { processImageFile, formatFileSize } from '../../utils/imageProcessor';

interface OverlayModalProps {
  imageState: PreviewImageState;
  user: UserProfile;
  initialTheme: ThemeMode;
  onClose: () => void;
  onImageChange: (newImage: PreviewImageState) => void;
  onUserChange?: (updatedUser: UserProfile) => void;
}

export const OverlayModal: React.FC<OverlayModalProps> = ({
  imageState,
  user,
  initialTheme,
  onClose,
  onImageChange,
  onUserChange,
}) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('profile');
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const [currentUser, setCurrentUser] = useState<UserProfile>(user);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const processed = await processImageFile(file);
      onImageChange(processed);
    } catch (err: any) {
      alert(err.message || 'Error processing image');
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenProfile = () => {
    window.open(`https://x.com/${currentUser.username}`, '_blank', 'noopener,noreferrer');
  };

  // Color mapping based on theme
  const isLight = theme === 'light';
  const isDim = theme === 'dim';

  const modalBg = isLight ? 'bg-white text-[#0f1419]' : isDim ? 'bg-[#15202b] text-[#f7f9f9]' : 'bg-black text-[#e7e9ea]';
  const headerBg = isLight ? 'bg-white/95 border-b border-[#eff3f4]' : isDim ? 'bg-[#15202b]/95 border-b border-[#38444d]' : 'bg-black/95 border-b border-[#2f3336]';
  const footerBg = isLight ? 'bg-[#f7f9f9] border-t border-[#eff3f4]' : isDim ? 'bg-[#1e2732] border-t border-[#38444d]' : 'bg-[#16181c] border-t border-[#2f3336]';
  const mutedText = isLight ? 'text-[#536471]' : isDim ? 'text-[#8b98a5]' : 'text-[#71767b]';

  return (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      {/* Hidden file input for "Change image" */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl ${modalBg} border ${
          isLight ? 'border-neutral-200' : isDim ? 'border-[#38444d]' : 'border-[#2f3336]'
        } shadow-2xl overflow-hidden flex flex-col max-h-[92vh] xppp-modal-animate`}
        role="dialog"
        aria-label="X Profile Picture Preview Modal"
      >
        {/* Top Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${headerBg} backdrop-blur sticky top-0 z-30`}>
          <div className="flex items-center space-x-3">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-neutral-500/15 transition-colors ${mutedText} hover:text-white`}
              title="Close Preview"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div>
              <h2 className="font-bold text-base leading-tight tracking-tight flex items-center space-x-2">
                <span>X Profile Picture Preview</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-xblue/10 text-xblue border border-xblue/20 px-2 py-0.5 rounded-full">
                  Sandbox
                </span>
              </h2>
              <p className={`text-xs ${mutedText}`}>
                {imageState.fileName ? `${imageState.fileName} (${formatFileSize(imageState.fileSize)})` : 'Real-time multi-context preview'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={headerBg}>
          <SegmentedNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Safety & Non-destructive Notice Banner */}
        <div className="px-6 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>
              <strong>Safe Preview:</strong> 100% client-side. Your actual X profile picture is completely untouched.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingInfo(!isEditingInfo)}
            className="text-[11px] underline font-medium hover:text-emerald-300 ml-2"
          >
            {isEditingInfo ? 'Hide Customizer' : 'Customize Details'}
          </button>
        </div>

        {/* Optional Customizer Drawer */}
        {isEditingInfo && (
          <div className={`px-6 py-3 border-b ${isLight ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-800 bg-neutral-900/50'} text-xs space-y-2`}>
            <div className="font-semibold text-neutral-300">Preview Profile Data Customizer</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={currentUser.displayName}
                  onChange={(e) => {
                    const updated = { ...currentUser, displayName: e.target.value };
                    setCurrentUser(updated);
                    onUserChange?.(updated);
                  }}
                  className="w-full px-2.5 py-1 rounded-lg bg-black/20 border border-neutral-700 text-xs text-inherit focus:outline-none focus:border-xblue"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Username (@handle)</label>
                <input
                  type="text"
                  value={currentUser.username}
                  onChange={(e) => {
                    const updated = { ...currentUser, username: e.target.value.replace('@', '') };
                    setCurrentUser(updated);
                    onUserChange?.(updated);
                  }}
                  className="w-full px-2.5 py-1 rounded-lg bg-black/20 border border-neutral-700 text-xs text-inherit focus:outline-none focus:border-xblue"
                />
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <label className="flex items-center space-x-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={currentUser.isVerified}
                    onChange={(e) => {
                      const updated = { ...currentUser, isVerified: e.target.checked };
                      setCurrentUser(updated);
                      onUserChange?.(updated);
                    }}
                    className="rounded text-xblue focus:ring-0"
                  />
                  <span>Verification Badge</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Preview Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-full max-w-xl">
            {activeTab === 'profile' && (
              <ProfilePreview avatarUrl={imageState.url} user={currentUser} theme={theme} />
            )}
            {activeTab === 'post' && (
              <PostPreview avatarUrl={imageState.url} user={currentUser} theme={theme} />
            )}
            {activeTab === 'reply' && (
              <ReplyPreview avatarUrl={imageState.url} user={currentUser} theme={theme} />
            )}
            {activeTab === 'search' && (
              <SearchPreview avatarUrl={imageState.url} user={currentUser} theme={theme} />
            )}
            {activeTab === 'notification' && (
              <NotificationPreview avatarUrl={imageState.url} user={currentUser} theme={theme} />
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className={`px-6 py-3.5 flex items-center justify-between ${footerBg} sticky bottom-0 z-20`}>
          <div className="flex items-center space-x-2">
            {/* Change Image button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full text-xs font-bold bg-neutral-500/20 hover:bg-neutral-500/30 text-inherit border border-neutral-600/40 transition-colors flex items-center space-x-1.5"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span>Change image</span>
            </button>

            {/* Open Profile button */}
            <button
              type="button"
              onClick={handleOpenProfile}
              className={`px-3 py-2 rounded-full text-xs font-medium ${mutedText} hover:text-inherit transition-colors flex items-center space-x-1`}
            >
              <span>Open profile</span>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-bold bg-xblue hover:bg-xblue-hover text-white shadow-md transition-colors"
            >
              Done Previewing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
