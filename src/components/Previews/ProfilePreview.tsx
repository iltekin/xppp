import React from 'react';
import { UserProfile, ThemeMode } from '../../types';
import { VerifiedBadge, CalendarIcon, LinkIcon, MapPinIcon } from '../Icons';

interface ProfilePreviewProps {
  avatarUrl: string;
  user: UserProfile;
  theme: ThemeMode;
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ avatarUrl, user, theme }) => {
  const isLight = theme === 'light';
  const isDim = theme === 'dim';

  const containerBg = isLight ? 'bg-white text-[#0f1419]' : isDim ? 'bg-[#15202b] text-[#f7f9f9]' : 'bg-black text-[#e7e9ea]';
  const borderCol = isLight ? 'border-[#eff3f4]' : isDim ? 'border-[#38444d]' : 'border-[#2f3336]';
  const mutedText = isLight ? 'text-[#536471]' : isDim ? 'text-[#8b98a5]' : 'text-[#71767b]';
  const avatarBorder = isLight ? 'border-white' : isDim ? 'border-[#15202b]' : 'border-black';

  return (
    <div className={`w-full rounded-2xl border ${borderCol} ${containerBg} overflow-hidden font-chirp shadow-xl transition-all duration-200`}>
      {/* Profile Top Bar */}
      <div className={`px-4 py-2 border-b ${borderCol} flex items-center justify-between`}>
        <div className="flex items-center space-x-4">
          <div>
            <div className="flex items-center font-bold text-lg leading-tight">
              <span>{user.displayName}</span>
              {user.isVerified && <VerifiedBadge className="w-4 h-4 ml-1 text-xblue" />}
            </div>
            <span className={`text-xs ${mutedText}`}>1,429 posts</span>
          </div>
        </div>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${borderCol} font-mono ${mutedText}`}>
          Profile View
        </span>
      </div>

      {/* Banner */}
      <div className="w-full h-36 sm:h-44 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Avatar & Action Button Row */}
      <div className="px-5 relative pb-4">
        <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-3">
          {/* 134px Large Avatar */}
          <div className="relative group">
            <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 ${avatarBorder} bg-neutral-800 overflow-hidden shadow-lg relative`}>
              <img
                src={avatarUrl}
                alt="New Profile Avatar Preview"
                className="w-full h-full object-cover select-none"
              />
            </div>
            <div className="absolute -bottom-2 -right-1 bg-xblue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
              134px
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              className={`px-4 py-1.5 rounded-full font-bold text-sm border ${borderCol} hover:bg-neutral-500/10 transition-colors pointer-events-none opacity-80`}
            >
              Edit profile
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center">
              <span className="font-extrabold text-xl leading-tight">{user.displayName}</span>
              {user.isVerified && <VerifiedBadge className="w-5 h-5 ml-1 text-xblue" />}
            </div>
            <div className={`text-sm ${mutedText}`}>@{user.username}</div>
          </div>

          {/* Bio */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{user.bio}</p>

          {/* Metadata items */}
          <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs ${mutedText}`}>
            {user.location && (
              <div className="flex items-center space-x-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center space-x-1 text-xblue">
                <LinkIcon className="w-4 h-4 text-inherit" />
                <span>{user.website.replace('https://', '')}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{user.joinedDate}</span>
            </div>
          </div>

          {/* Following / Followers */}
          <div className="flex items-center space-x-4 text-xs pt-1">
            <div>
              <span className="font-bold">{user.followingCount}</span>
              <span className={`ml-1 ${mutedText}`}>Following</span>
            </div>
            <div>
              <span className="font-bold">{user.followersCount}</span>
              <span className={`ml-1 ${mutedText}`}>Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
