import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

export default function ToggleTheme() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div style={{
      position: 'absolute',
      top: '1.5rem',
      right: '2rem',
      zIndex: 1000,
      background: 'var(--surface)',
      backdropFilter: 'blur(10px)',
      padding: '8px',
      borderRadius: '50%',
      border: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}>
      <DarkModeSwitch
        checked={isDarkMode}
        onChange={toggleTheme}
        size={24}
        sunColor="var(--amber)"
        moonColor="var(--cyan)"
      />
    </div>
  );
}
