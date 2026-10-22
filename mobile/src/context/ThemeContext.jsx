import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEMES = [
  {
    id: 'dark',
    name: 'Lights Out',
    subtitle: 'Pure OLED Black',
    bg: '#000000',
    background: '#000000',
    surface: '#16181c',
    elevated: '#202327',
    border: '#2f3336',
    borderLight: '#1f2226',
    text: '#e7e9ea',
    textSecondary: '#71767b',
    accent: '#1d9bf0',
    badge: 'Night',
    type: 'dark',
    statusBar: 'light',
  },
  {
    id: 'dim',
    name: 'Dim Navy',
    subtitle: 'Midnight Twilight Blue',
    bg: '#15202b',
    background: '#15202b',
    surface: '#1e2732',
    elevated: '#273340',
    border: '#38444d',
    borderLight: '#2c3640',
    text: '#f7f9f9',
    textSecondary: '#8b98a5',
    accent: '#1d9bf0',
    badge: 'Dim',
    type: 'dark',
    statusBar: 'light',
  },
  {
    id: 'light',
    name: 'Day',
    subtitle: 'Crisp & Clean Light',
    bg: '#ffffff',
    background: '#ffffff',
    surface: '#f7f9f9',
    elevated: '#ffffff',
    border: '#eff3f4',
    borderLight: '#e5e7eb',
    text: '#0f1419',
    textSecondary: '#536471',
    accent: '#1d9bf0',
    badge: 'Daylight',
    type: 'light',
    statusBar: 'dark',
  },
  {
    id: 'emerald',
    name: 'CodeHub Matrix',
    subtitle: 'Obsidian & Neon Emerald',
    bg: '#080f0c',
    background: '#080f0c',
    surface: '#0f1d17',
    elevated: '#152b22',
    border: '#1b382b',
    borderLight: '#142a20',
    text: '#ecfdf5',
    textSecondary: '#6ee7b7',
    accent: '#10b981',
    badge: 'CodeHub',
    type: 'dark',
    statusBar: 'light',
  },
  {
    id: 'sunset',
    name: 'Dusk Sunset',
    subtitle: 'Deep Amethyst & Amber',
    bg: '#141113',
    background: '#141113',
    surface: '#1f1a1d',
    elevated: '#2a2227',
    border: '#3a2e36',
    borderLight: '#2e252b',
    text: '#fdf4ff',
    textSecondary: '#c084fc',
    accent: '#f97316',
    badge: 'Sunset',
    type: 'dark',
    statusBar: 'light',
  },
  {
    id: 'hacker',
    name: 'Cyber Hacker',
    subtitle: 'Matrix CRT & Phosphor Green',
    bg: '#020603',
    background: '#020603',
    surface: '#051007',
    elevated: '#0a1d0d',
    border: '#0f3818',
    borderLight: '#0b2912',
    text: '#34d399',
    textSecondary: '#059669',
    accent: '#00ff66',
    badge: 'Matrix',
    type: 'dark',
    statusBar: 'light',
  },
];

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('clearfeed-theme');
        if (saved && THEMES.some((t) => t.id === saved)) {
          setThemeState(saved);
        }
      } catch {}
    };
    loadTheme();
  }, []);

  const setTheme = async (newThemeId) => {
    if (!THEMES.some((t) => t.id === newThemeId)) return;
    setThemeState(newThemeId);
    try {
      await AsyncStorage.setItem('clearfeed-theme', newThemeId);
    } catch {}
  };

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme,
        currentColors: currentTheme,
        colors: currentTheme,
        themes: THEMES,
        setTheme,
        isDark: currentTheme.type === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Graceful fallback to default dark theme
    return {
      theme: 'dark',
      currentTheme: THEMES[0],
      currentColors: THEMES[0],
      colors: THEMES[0],
      themes: THEMES,
      setTheme: () => {},
      isDark: true,
    };
  }
  return ctx;
};

export default ThemeContext;
