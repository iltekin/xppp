import React from 'react';
import { UserProfile, ThemeMode } from '../../types';
import { VerifiedBadge } from '../Icons';

interface SearchPreviewProps {
  avatarUrl: string;
  user: UserProfile;
  theme: ThemeMode;
}

export const SearchPreview: React.FC<SearchPreviewProps> = ({ avatarUrl, user, theme }) => {
  const isLight = theme === 'light';
  const isDim = theme === 'dim';

  const containerBg = isLight ? 'bg-white text-[#0f1419]' : isDim ? 'bg-[#15202b] text-[#f7f9f9]' : 'bg-black text-[#e7e9ea]';
  const borderCol = isLight ? 'border-[#eff3f4]' : isDim ? 'border-[#38444d]' : 'border-[#2f3336]';
  const mutedText = isLight ? 'text-[#536471]' : isDim ? 'text-[#8b98a5]' : 'text-[#71767b]';
  const searchInputBg = isLight ? 'bg-[#eff3f4]' : isDim ? 'bg-[#202e3a]' : 'bg-[#202327]';
  const followBtnBg = isLight ? 'bg-black text-white' : 'bg-white text-black';

  return (
    <div className={`w-full rounded-2xl border ${borderCol} ${containerBg} overflow-hidden font-chirp shadow-xl transition-all duration-200`}>
      {/* Search Header Bar */}
      <div className={`p-3 border-b ${borderCol} space-y-3`}>
        {/* Realistic Search Input */}
        <div className={`flex items-center px-4 py-2 rounded-full ${searchInputBg} space-x-3`}>
          <svg viewBox="0 0 24 24" className={`w-4 h-4 ${mutedText}`} fill="currentColor">
            <path d="M10.25 3.75a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm-8.5 6.5a8.5 8.5 0 1 1 15.176 5.262l4.781 4.781-1.414 1.414-4.781-4.781A8.5 8.5 0 0 1 1.75 10.25Z" />
          </svg>
          <span className="text-sm font-normal text-inherit">{user.displayName}</span>
        </div>

        {/* Search Category Tabs */}
        <div className={`flex space-x-6 text-xs font-semibold px-2 ${mutedText}`}>
          <span className="hover:text-inherit cursor-pointer">Top</span>
          <span className="hover:text-inherit cursor-pointer">Latest</span>
          <span className="text-xblue border-b-2 border-xblue pb-1">People</span>
          <span className="hover:text-inherit cursor-pointer">Media</span>
          <span className="hover:text-inherit cursor-pointer">Lists</span>
        </div>
      </div>

      {/* Realistic Search Result User Card */}
      <div className="p-4 hover:bg-neutral-500/5 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex space-x-3 min-w-0 flex-1 pr-3">
            {/* 44px/40px Avatar in search */}
            <div className="relative group flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-neutral-800 overflow-hidden shadow-sm ring-1 ring-white/10">
                <img
                  src={avatarUrl}
                  alt={user.displayName}
                  className="w-full h-full object-cover select-none"
                />
              </div>
              <div className="absolute -bottom-2 -right-1 bg-xblue text-white text-[9px] font-bold px-1 rounded-full shadow">
                44px
              </div>
            </div>

            {/* User details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 truncate">
                <span className="font-bold text-sm hover:underline cursor-pointer">{user.displayName}</span>
                {user.isVerified && <VerifiedBadge className="w-4 h-4 text-xblue flex-shrink-0" />}
              </div>
              <div className={`text-xs ${mutedText}`}>@{user.username}</div>

              {/* Bio in search snippet */}
              <p className="mt-1.5 text-xs line-clamp-2 leading-normal text-inherit">
                {user.bio}
              </p>

              {/* Follower metadata */}
              <div className={`mt-2 flex items-center space-x-1 text-[11px] ${mutedText}`}>
                <span className="font-semibold text-inherit">{user.followersCount}</span>
                <span>Followers</span>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <button
            type="button"
            className={`px-4 py-1.5 rounded-full font-bold text-xs ${followBtnBg} hover:opacity-90 transition-opacity flex-shrink-0 shadow-sm`}
          >
            Follow
          </button>
        </div>
      </div>
    </div>
  );
};
