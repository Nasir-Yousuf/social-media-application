import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'light',
    name: 'Day',
    subtitle: 'Crisp & Clean Light',
    bg: '#ffffff',
    cardBg: '#f7f9f9',
    border: '#e5e7eb',
    previewText: '#111827',
    badge: 'Daylight',
    accentColor: '#1d9bf0',
    type: 'light',
  },
  {
    id: 'dark',
    name: 'Lights Out',
    subtitle: 'Pure OLED Black',
    bg: '#000000',
    cardBg: '#121519',
    border: '#27272a',
    previewText: '#ffffff',
    badge: 'Night',
    accentColor: '#1d9bf0',
    type: 'dark',
  },
  {
    id: 'dim',
    name: 'Dim Navy',
    subtitle: 'Midnight Twilight Blue',
    bg: '#15202b',
    cardBg: '#1e2732',
    border: '#38444d',
    previewText: '#f7f9f9',
    badge: 'Dim',
    accentColor: '#1d9bf0',
    type: 'dark',
  },
  {
    id: 'emerald',
    name: 'CodeHub Matrix',
    subtitle: 'Obsidian & Neon Emerald',
    bg: '#080f0c',
    cardBg: '#0f1d17',
    border: '#1b382b',
    previewText: '#ecfdf5',
    badge: 'CodeHub',
    accentColor: '#10b981',
    type: 'dark',
  },
  {
    id: 'sunset',
    name: 'Dusk Sunset',
    subtitle: 'Deep Amethyst & Amber',
    bg: '#141113',
    cardBg: '#1f1a1d',
    border: '#3a2e36',
    previewText: '#fdf4ff',
    badge: 'Sunset',
    accentColor: '#f97316',
    type: 'dark',
  },
  {
    id: 'hacker',
    name: 'Cyber Hacker',
    subtitle: 'Matrix CRT & Phosphor Green',
    bg: '#020603',
    cardBg: '#051007',
    border: '#0f3818',
    previewText: '#34d399',
    badge: 'Matrix',
    accentColor: '#00ff66',
    type: 'dark',
  },
];

const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clearfeed-theme');
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved;
      }
      return 'dark'; // Default to Twitter Lights Out
    }
    return 'dark';
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[1];
  const isDark = currentTheme.type === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    // Remove all previous theme classes
    root.classList.remove(
      'theme-light',
      'theme-dark',
      'theme-dim',
      'theme-emerald',
      'theme-sunset',
      'theme-hacker'
    );

    if (currentTheme.type === 'dark') {
      root.classList.add('dark');
      root.classList.add(`theme-${currentTheme.id}`);
    } else {
      root.classList.remove('dark');
      root.classList.add('theme-light');
    }

    localStorage.setItem('clearfeed-theme', currentTheme.id);
  }, [theme, currentTheme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const idx = THEMES.findIndex((t) => t.id === prev);
      const nextIdx = (idx + 1) % THEMES.length;
      return THEMES[nextIdx].id;
    });
  };

  const openThemeModal = () => setIsThemeModalOpen(true);
  const closeThemeModal = () => setIsThemeModalOpen(false);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme,
        themes: THEMES,
        isDark,
        setTheme,
        toggleTheme,
        isThemeModalOpen,
        openThemeModal,
        closeThemeModal,
        setIsThemeModalOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
