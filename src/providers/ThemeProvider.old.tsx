import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettingsContext } from '@/providers/SettingsProvider';
import { useAppearanceSettings } from '@/hooks/useEnhancedSettings';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useSettingsContext();
  const appearance = useAppearanceSettings();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Get colors from enhanced settings with fallbacks
  const primaryColor = appearance.primaryColor || '#f97316'; // orange-500
  const secondaryColor = appearance.secondaryColor || '#ef4444'; // red-500
  const accentColor = appearance.primaryColor || '#3b82f6'; // blue-500

  // Initialize theme from localStorage, settings, or system preference
  useEffect(() => {
    if (loading) return; // Wait for settings to load
    
    const savedTheme = localStorage.getItem('theme');
    const settingsDarkMode = appearance.darkMode;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Priority: saved theme > settings > system preference
    const initialTheme = savedTheme || 
      (settingsDarkMode ? 'dark' : null) || 
      (systemPrefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme as 'light' | 'dark');
    
    // Apply theme to document
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [loading, appearance.darkMode]);

  // Apply custom CSS variables for dynamic colors
  useEffect(() => {
    const root = document.documentElement;
    
    // Convert hex to RGB for CSS variables
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '251, 115, 22'; // fallback to orange-500
    };

    // Set CSS custom properties
    root.style.setProperty('--color-primary', hexToRgb(primaryColor));
    root.style.setProperty('--color-secondary', hexToRgb(secondaryColor));
    root.style.setProperty('--color-accent', hexToRgb(accentColor));
  }, [primaryColor, secondaryColor, accentColor]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        primaryColor,
        secondaryColor,
        accentColor,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};