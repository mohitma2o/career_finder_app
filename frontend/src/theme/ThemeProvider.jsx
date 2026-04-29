import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('cf_theme_aura') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.add('dark'); // Always keep dark class for overall aesthetic
    localStorage.setItem('cf_theme_aura', theme);
  }, [theme]);

  const themes = [
    { id: 'dark', name: 'Deep Space', color: '#818CF8' },
    { id: 'midnight', name: 'Midnight', color: '#38bdf8' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: '#f43f5e' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' }
  ];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      <StyledThemeProvider theme={{ mode: 'dark', aura: theme }}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
