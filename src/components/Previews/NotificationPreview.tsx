import React from 'react';
import { UserProfile, ThemeMode } from '../../types';
import { VerifiedBadge } from '../Icons';

interface NotificationPreviewProps {
  avatarUrl: string;
  user: UserProfile;
  theme: ThemeMode;
}

export const NotificationPreview: React.FC<NotificationPreviewProps> = ({ avatarUrl, user, theme }) => {
  const isLight = theme === 'light';
  const isDim = theme === 'dim';

  const containerBg = isLight ? 'bg-white text-[#0f1419]' : isDim ? 'bg-[#15202b] text-[#f7f9f9]' : 'bg-black text-[#e7e9ea]';
  const borderCol = isLight ? 'border-[#eff3f4]' : isDim ? 'border-[#38444d]' : 'border-[#2f3336]';
  const mutedText = isLight ? 'text-[#536471]' : isDim ? 'text-[#8b98a5]' : 'text-[#71767b]';
  const hoverBg = isLight ? 'hover:bg-neutral-100' : isDim ? 'hover:bg-[#1e2732]' : 'hover:bg-[#080808]';

  return (
    <div className={`w-full rounded-2xl border ${borderCol} ${containerBg} overflow-hidden font-chirp shadow-xl transition-all duration-200`}>
      {/* Header */}
      <div className={`px-4 py-2 border-b ${borderCol} flex items-center justify-between`}>
        <span className={`text-xs font-semibold ${mutedText}`}>Notifications Feed</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${borderCol} font-mono ${mutedText}`}>
          Avatar size: 32px
        </span>
      </div>

      <div className="divide-y divide-inherit">
        {/* Notification 1: Follow Notification */}
        <div className={`p-4 ${hoverBg} transition-colors flex space-x-3`}>
          {/* Left indicator icon (Follow / Person) */}
          <div className="flex-shrink-0 w-8 flex justify-end pt-1">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-xblue" fill="currentColor">
              <path d="M17.863 13.445a6.5 6.5 0 1 0-11.726 0A9 9 0 0 0 1 21.5a.5.5 0 0 0 .5.5h21a.5.5 0 0 0 .5-.5 9 9 0 0 0-5.137-8.055Z" />
            </svg>
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* 32px circular avatar */}
            <div className="flex items-center space-x-2">
              <div className="relative group">
                <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden ring-1 ring-white/10 shadow-sm">
                  <img
                    src={avatarUrl}
                    alt={user.displayName}
                    className="w-full h-full object-cover select-none"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-xblue text-white text-[8px] font-bold px-1 rounded-full shadow">
                  32px
                </div>
              </div>
            </div>

            <div>
              <span className="font-bold text-sm hover:underline cursor-pointer">{user.displayName}</span>
              {user.isVerified && <VerifiedBadge className="w-3.5 h-3.5 text-xblue inline ml-1 align-baseline" />}
              <span className="text-sm"> followed you</span>
            </div>

            <p className={`text-xs ${mutedText} line-clamp-1`}>
              {user.bio}
            </p>
          </div>
        </div>

        {/* Notification 2: Like Notification */}
        <div className={`p-4 ${hoverBg} transition-colors flex space-x-3`}>
          {/* Left indicator icon (Like / Pink Heart) */}
          <div className="flex-shrink-0 w-8 flex justify-end pt-1">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-xpink" fill="currentColor">
              <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12Z" />
            </svg>
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* 32px circular avatar */}
            <div className="flex items-center space-x-2">
              <div className="relative group">
                <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden ring-1 ring-white/10 shadow-sm">
                  <img
                    src={avatarUrl}
                    alt={user.displayName}
                    className="w-full h-full object-cover select-none"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-xblue text-white text-[8px] font-bold px-1 rounded-full shadow">
                  32px
                </div>
              </div>
            </div>

            <div>
              <span className="font-bold text-sm hover:underline cursor-pointer">{user.displayName}</span>
              {user.isVerified && <VerifiedBadge className="w-3.5 h-3.5 text-xblue inline ml-1 align-baseline" />}
              <span className="text-sm"> liked your post</span>
            </div>

            <p className={`text-xs ${mutedText} italic border-l-2 ${borderCol} pl-2 mt-1`}>
              "Can't wait to preview profile photos before committing changes."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
