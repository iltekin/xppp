import React from 'react';
import { PreviewTab } from '../../types';

interface SegmentedNavProps {
  activeTab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
}

export const SegmentedNav: React.FC<SegmentedNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: PreviewTab; label: string; avatarSize: string }[] = [
    { id: 'profile', label: 'Profile', avatarSize: '134px' },
    { id: 'post', label: 'Post', avatarSize: '40px' },
    { id: 'reply', label: 'Reply', avatarSize: '40px' },
    { id: 'search', label: 'Search', avatarSize: '40px' },
    { id: 'notification', label: 'Notification', avatarSize: '32px' },
  ];

  return (
    <div className="w-full flex items-center justify-between border-b border-inherit px-6 pt-3 pb-0 bg-inherit">
      <div className="flex space-x-1 sm:space-x-4 overflow-x-auto w-full no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative pb-3 px-3 text-sm font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-normal transition-colors ${
                isActive ? 'bg-xblue/20 text-xblue border border-xblue/30' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {tab.avatarSize}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-xblue rounded-t-full shadow-[0_-2px_8px_rgba(29,155,240,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
