import React, { createContext, useContext, useState } from 'react';
import { LightTheme, DarkTheme, Theme } from './index';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: LightTheme,
  mode: 'light',
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const isDark = mode === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;
  const toggleTheme = () => setMode(m => (m === 'light' ? 'dark' : 'light'));
  return (
    <ThemeContext.Provider value={{ theme, mode, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
