import React from 'react';
import { UserProfile, ThemeMode } from '../../types';
import { VerifiedBadge, ReplyIcon, RepostIcon, LikeIcon, ViewsIcon, BookmarkIcon, ShareIcon } from '../Icons';

interface PostPreviewProps {
  avatarUrl: string;
  user: UserProfile;
  theme: ThemeMode;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ avatarUrl, user, theme }) => {
  const isLight = theme === 'light';
  const isDim = theme === 'dim';

  const containerBg = isLight ? 'bg-white text-[#0f1419]' : isDim ? 'bg-[#15202b] text-[#f7f9f9]' : 'bg-black text-[#e7e9ea]';
  const borderCol = isLight ? 'border-[#eff3f4]' : isDim ? 'border-[#38444d]' : 'border-[#2f3336]';
  const mutedText = isLight ? 'text-[#536471]' : isDim ? 'text-[#8b98a5]' : 'text-[#71767b]';
  const hoverBg = isLight ? 'hover:bg-neutral-100' : isDim ? 'hover:bg-[#1e2732]' : 'hover:bg-[#080808]';

  return (
    <div className={`w-full rounded-2xl border ${borderCol} ${containerBg} overflow-hidden font-chirp shadow-xl transition-all duration-200`}>
      {/* Context Badge header */}
      <div className={`px-4 py-2 border-b ${borderCol} flex items-center justify-between`}>
        <span className={`text-xs font-semibold ${mutedText}`}>Timeline Post Feed</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${borderCol} font-mono ${mutedText}`}>
          Avatar size: 40px
        </span>
      </div>

      <div className={`p-4 ${hoverBg} transition-colors cursor-default`}>
        <div className="flex space-x-3">
          {/* 40px Circular Avatar */}
          <div className="flex-shrink-0 relative group">
            <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden ring-1 ring-white/10 shadow-sm relative">
              <img
                src={avatarUrl}
                alt={user.displayName}
                className="w-full h-full object-cover select-none"
              />
            </div>
            <div className="absolute -bottom-2 -right-1 bg-xblue text-white text-[9px] font-bold px-1 rounded-full shadow">
              40px
            </div>
          </div>

          {/* Post Body */}
          <div className="flex-1 min-w-0">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 flex-wrap truncate">
                <span className="font-bold text-sm hover:underline cursor-pointer">{user.displayName}</span>
                {user.isVerified && <VerifiedBadge className="w-4 h-4 text-xblue flex-shrink-0" />}
                <span className={`text-sm ${mutedText}`}>@{user.username}</span>
                <span className={`text-sm ${mutedText}`}>·</span>
                <span className={`text-sm ${mutedText} hover:underline`}>2m</span>
              </div>
              <button
                type="button"
                className={`p-1 rounded-full ${mutedText} hover:text-xblue transition-colors`}
                aria-label="More"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
            </div>

            {/* Post text */}
            <div className="mt-1 text-[15px] leading-relaxed break-words">
              Just tested out my new profile picture with{' '}
              <span className="text-xblue font-medium">X Profile Picture Preview</span>!
              It’s crucial to make sure details remain recognizable at 40px resolution before locking it in. ✨
            </div>

            {/* Metrics and Action Bar */}
            <div className={`mt-3 flex items-center justify-between text-xs ${mutedText} max-w-md pt-1`}>
              {/* Reply */}
              <div className="flex items-center space-x-1.5 group hover:text-xblue transition-colors cursor-pointer">
                <div className="p-1.5 rounded-full group-hover:bg-xblue/10 transition-colors">
                  <ReplyIcon className="w-4 h-4 text-inherit" />
                </div>
                <span>14</span>
              </div>

              {/* Repost */}
              <div className="flex items-center space-x-1.5 group hover:text-xgreen transition-colors cursor-pointer">
                <div className="p-1.5 rounded-full group-hover:bg-xgreen/10 transition-colors">
                  <RepostIcon className="w-4 h-4 text-inherit" />
                </div>
                <span>38</span>
              </div>

              {/* Like */}
              <div className="flex items-center space-x-1.5 group hover:text-xpink transition-colors cursor-pointer">
                <div className="p-1.5 rounded-full group-hover:bg-xpink/10 transition-colors">
                  <LikeIcon className="w-4 h-4 text-inherit" />
                </div>
                <span>219</span>
              </div>

              {/* Views */}
              <div className="flex items-center space-x-1.5 group hover:text-xblue transition-colors cursor-pointer">
                <div className="p-1.5 rounded-full group-hover:bg-xblue/10 transition-colors">
                  <ViewsIcon className="w-4 h-4 text-inherit" />
                </div>
                <span>5.2K</span>
              </div>

              {/* Bookmark & Share */}
              <div className="flex items-center space-x-1">
                <div className="p-1.5 rounded-full hover:bg-xblue/10 hover:text-xblue transition-colors cursor-pointer">
                  <BookmarkIcon className="w-4 h-4 text-inherit" />
                </div>
                <div className="p-1.5 rounded-full hover:bg-xblue/10 hover:text-xblue transition-colors cursor-pointer">
                  <ShareIcon className="w-4 h-4 text-inherit" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
