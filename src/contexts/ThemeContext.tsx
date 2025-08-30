'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    // ดึง theme จาก localStorage หรือใช้ light เป็นค่าเริ่มต้น
    const savedTheme = localStorage.getItem('independent-theme') as Theme;
    const initialTheme = savedTheme || 'light';
    
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // ลบ class เก่า
    root.classList.remove('light', 'dark');
    
    // เพิ่ม class ใหม่
    root.classList.add(newTheme);
    
    // เซ็ต data attribute
    root.setAttribute('data-theme', newTheme);
    
    // เซ็ต color-scheme
    root.style.colorScheme = newTheme;
    
    console.log(`Theme applied: ${newTheme}`);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('independent-theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme
  }), [theme]);

  // ป้องกัน hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
