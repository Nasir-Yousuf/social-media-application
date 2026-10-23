import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light' | 'dim' | 'emerald';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('pulse518_theme') as ThemeMode;
      if (['dark', 'light', 'dim', 'emerald'].includes(saved)) {
        return saved;
      }
    }
    return 'dark';
  });

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('pulse518_theme', mode);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'theme-dim', 'theme-emerald');

    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.add('dark');
      if (theme === 'dim') {
        root.classList.add('theme-dim');
      } else if (theme === 'emerald') {
        root.classList.add('theme-emerald');
      }
    }
  }, [theme]);

  const isDark = theme !== 'light';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
