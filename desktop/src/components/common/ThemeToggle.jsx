import React from 'react';
import { Sun, Moon, CloudMoon, Terminal, Sunset, Palette } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ICONS = {
  light: Sun,
  dark: Moon,
  dim: CloudMoon,
  emerald: Terminal,
  sunset: Sunset,
};

export const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, currentTheme, isDark, openThemeModal } = useTheme();

  const IconComponent = ICONS[theme] || (isDark ? Moon : Sun);

  return (
    <button
      type="button"
      onClick={openThemeModal}
      title={`Theme: ${currentTheme.name} (Click to customize)`}
      className={`p-2 rounded-full transition-all duration-150 active:scale-90 cursor-pointer flex items-center gap-2 ${
        isDark
          ? 'text-neutral-300 hover:text-white hover:bg-neutral-800/80'
          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
      } ${className}`}
      aria-label="Customize theme"
    >
      <IconComponent
        className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12"
        style={{ color: currentTheme?.accentColor }}
      />
      {showLabel && (
        <span className="text-xs font-semibold">{currentTheme?.name}</span>
      )}
    </button>
  );
};

export default ThemeToggle;
