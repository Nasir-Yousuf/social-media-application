import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 rounded-lg cf-btn-transition cf-focus-ring cursor-pointer ${
        isDark
          ? 'text-[var(--color-cfd-amber)] hover:bg-[var(--color-cfd-amber-soft)]'
          : 'text-[var(--color-cf-text-muted)] hover:bg-[var(--color-cf-surface)]'
      } ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-[18px] h-[18px]" />
      ) : (
        <Moon className="w-[18px] h-[18px]" />
      )}
    </button>
  );
};

export default ThemeToggle;
