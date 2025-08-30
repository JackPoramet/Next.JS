'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function ForcedThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [isToggling, setIsToggling] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // ดึง theme จาก localStorage
        const savedTheme = localStorage.getItem('forced-theme');
        const initialTheme = (savedTheme as 'light' | 'dark') || 'light';
        
        setCurrentTheme(initialTheme);
        forceApplyTheme(initialTheme);
        setMounted(true);
        
        console.log('Forced theme initialized:', initialTheme);
      } catch (error) {
        console.error('Theme initialization error:', error);
        setCurrentTheme('light');
        forceApplyTheme('light');
        setMounted(true);
      }
    };

    initializeTheme();
  }, []);

  const forceApplyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    
    // บังคับลบ class ทั้งหมด
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // บังคับเพิ่ม class ใหม่
    root.classList.add(theme);
    body.classList.add(theme);
    
    // บังคับ attributes
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-color-scheme', theme);
    
    // บังคับ style properties
    root.style.colorScheme = theme;
    body.style.colorScheme = theme;
    
    // บังคับ CSS custom properties
    if (theme === 'dark') {
      root.style.setProperty('--tw-bg-opacity', '1');
      root.style.setProperty('--tw-text-opacity', '1');
      body.style.backgroundColor = '#111827'; // gray-900
      body.style.color = '#f9fafb'; // gray-50
    } else {
      root.style.setProperty('--tw-bg-opacity', '1');
      root.style.setProperty('--tw-text-opacity', '1');
      body.style.backgroundColor = '#ffffff'; // white
      body.style.color = '#111827'; // gray-900
    }
    
    // บันทึกใน localStorage
    localStorage.setItem('forced-theme', theme);
    
    console.log(`Forced theme applied: ${theme}`);
  };

  const toggleTheme = () => {
    if (isToggling) return;
    
    setIsToggling(true);
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Force apply immediately
    forceApplyTheme(newTheme);
    setCurrentTheme(newTheme);
    
    // Reset toggling state
    setTimeout(() => {
      setIsToggling(false);
    }, 400);
  };

  const forceSetTheme = (theme: 'light' | 'dark') => {
    forceApplyTheme(theme);
    setCurrentTheme(theme);
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Quick theme buttons for testing */}
      <div className="hidden md:flex items-center space-x-1">
        <button
          onClick={() => forceSetTheme('light')}
          className={`
            px-2 py-1 text-xs rounded font-medium transition-all duration-200
            ${currentTheme === 'light' 
              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          Light
        </button>
        <button
          onClick={() => forceSetTheme('dark')}
          className={`
            px-2 py-1 text-xs rounded font-medium transition-all duration-200
            ${currentTheme === 'dark' 
              ? 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }
          `}
        >
          Dark
        </button>
      </div>

      {/* Main toggle button */}
      <button
        onClick={toggleTheme}
        disabled={isToggling}
        className={`
          relative inline-flex items-center justify-center
          w-12 h-12 rounded-xl
          bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
          border border-gray-200 dark:border-gray-600
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-800
          ${isToggling ? 'scale-95' : 'hover:scale-105'}
          group disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
      >
        {/* Light mode icon */}
        <SunIcon 
          className={`
            absolute w-5 h-5 text-amber-500 transition-all duration-300 ease-in-out
            ${currentTheme === 'light' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
            }
          `} 
        />
        
        {/* Dark mode icon */}
        <MoonIcon 
          className={`
            absolute w-5 h-5 text-blue-600 dark:text-blue-400 transition-all duration-300 ease-in-out
            ${currentTheme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
            }
          `} 
        />
        
        {/* Loading spinner */}
        {isToggling && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>
    </div>
  );
}
