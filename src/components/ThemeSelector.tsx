import React from 'react';
import { ThemeMode } from '../types';

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const themes: { id: ThemeMode; label: string; bgClass: string; borderClass: string }[] = [
    { id: 'dark', label: 'Dark', bgClass: 'bg-black text-white', borderClass: 'border-neutral-700' },
    { id: 'dim', label: 'Dim', bgClass: 'bg-[#15202b] text-white', borderClass: 'border-[#38444d]' },
    { id: 'light', label: 'Light', bgClass: 'bg-white text-black', borderClass: 'border-neutral-300' },
  ];

  return (
    <div className="flex items-center space-x-1.5 p-1 bg-black/20 dark:bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">
      {themes.map((theme) => {
        const isActive = currentTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onThemeChange(theme.id)}
            className={`px-3 py-1 rounded-full transition-all duration-150 flex items-center space-x-1.5 ${
              isActive
                ? 'bg-xblue text-white shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full border ${theme.bgClass} ${theme.borderClass}`}
            />
            <span>{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
};
