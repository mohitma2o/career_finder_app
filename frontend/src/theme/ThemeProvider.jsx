import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Lock to dark mode for the premium space aesthetic
  const isDarkMode = true;

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const toggleTheme = () => {}; // Disabled

  const themeValue = { isDarkMode, toggleTheme };

  return (
    <ThemeContext.Provider value={themeValue}>
      <StyledThemeProvider theme={{ mode: isDarkMode ? 'dark' : 'light' }}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
