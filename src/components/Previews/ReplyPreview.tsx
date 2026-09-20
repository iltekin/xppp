import React from 'react';
import { UserProfile, ThemeMode } from '../../types';
import { VerifiedBadge, ReplyIcon, RepostIcon, LikeIcon, ViewsIcon, ShareIcon } from '../Icons';

interface ReplyPreviewProps {
  avatarUrl: string;
  user: UserProfile;
  theme: ThemeMode;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({ avatarUrl, user, theme }) => {
  const isLight = theme === 'light';
  const isDim = theme === 'dim';

  const containerBg = isLight ? 'bg-white text-[#0f1419]' : isDim ? 'bg-[#15202b] text-[#f7f9f9]' : 'bg-black text-[#e7e9ea]';
  const borderCol = isLight ? 'border-[#eff3f4]' : isDim ? 'border-[#38444d]' : 'border-[#2f3336]';
  const mutedText = isLight ? 'text-[#536471]' : isDim ? 'text-[#8b98a5]' : 'text-[#71767b]';
  const threadLineCol = isLight ? 'bg-[#cfd9de]' : isDim ? 'bg-[#38444d]' : 'bg-[#333639]';

  return (
    <div className={`w-full rounded-2xl border ${borderCol} ${containerBg} overflow-hidden font-chirp shadow-xl transition-all duration-200`}>
      {/* Header */}
      <div className={`px-4 py-2 border-b ${borderCol} flex items-center justify-between`}>
        <span className={`text-xs font-semibold ${mutedText}`}>Thread Reply Context</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${borderCol} font-mono ${mutedText}`}>
          Avatar size: 40px in thread
        </span>
      </div>

      <div className="p-4 space-y-0">
        {/* Parent Tweet */}
        <div className="relative flex space-x-3 pb-4">
          {/* Connector line */}
          <div
            className={`absolute left-5 top-12 bottom-0 w-0.5 ${threadLineCol} -translate-x-1/2`}
            aria-hidden="true"
          />

          {/* Parent Avatar */}
          <div className="flex-shrink-0 z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow">
              Alex
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="font-bold text-sm">Alex Rivera</span>
              <VerifiedBadge className="w-4 h-4 text-xblue flex-shrink-0" />
              <span className={`text-sm ${mutedText}`}>@alexrivera</span>
              <span className={`text-sm ${mutedText}`}>·</span>
              <span className={`text-sm ${mutedText}`}>1h</span>
            </div>
            <p className="mt-1 text-[15px] leading-relaxed">
              Thinking about updating my profile photo today. Any tips for keeping it crisp across both desktop and mobile feeds?
            </p>
          </div>
        </div>

        {/* User's Reply */}
        <div className="flex space-x-3 pt-2">
          {/* 40px Circular Avatar for User */}
          <div className="flex-shrink-0 relative group z-10">
            <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden ring-2 ring-xblue/50 shadow-md relative">
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

          {/* User Reply Body */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="font-bold text-sm">{user.displayName}</span>
              {user.isVerified && <VerifiedBadge className="w-4 h-4 text-xblue flex-shrink-0" />}
              <span className={`text-sm ${mutedText}`}>@{user.username}</span>
              <span className={`text-sm ${mutedText}`}>·</span>
              <span className={`text-sm ${mutedText}`}>Just now</span>
            </div>

            <div className={`text-xs ${mutedText} mt-0.5`}>
              Replying to <span className="text-xblue">@alexrivera</span>
            </div>

            <div className="mt-1.5 text-[15px] leading-relaxed">
              Definitely preview it at 40px before saving! Centered subjects with high-contrast backgrounds look best in tight reply threads like this.
            </div>

            {/* Metrics */}
            <div className={`mt-3 flex items-center justify-between text-xs ${mutedText} max-w-sm`}>
              <div className="flex items-center space-x-1 hover:text-xblue transition-colors">
                <ReplyIcon className="w-4 h-4 text-inherit" />
                <span>2</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-xgreen transition-colors">
                <RepostIcon className="w-4 h-4 text-inherit" />
                <span>5</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-xpink transition-colors">
                <LikeIcon className="w-4 h-4 text-inherit" />
                <span>27</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-xblue transition-colors">
                <ViewsIcon className="w-4 h-4 text-inherit" />
                <span>840</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-xblue transition-colors">
                <ShareIcon className="w-4 h-4 text-inherit" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
