'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    toggleTheme();
    
    // Animation delay
    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`
        relative inline-flex items-center justify-center
        w-12 h-12 rounded-xl
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        border border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        ${isToggling ? 'scale-95' : 'hover:scale-105'}
        group
      `}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Light mode icon */}
      <SunIcon 
        className={`
          absolute w-5 h-5 text-amber-500 transition-all duration-300 ease-in-out
          ${theme === 'light' 
            ? 'rotate-0 scale-100 opacity-100' 
            : 'rotate-90 scale-0 opacity-0'
          }
        `} 
      />
      
      {/* Dark mode icon */}
      <MoonIcon 
        className={`
          absolute w-5 h-5 text-blue-600 dark:text-blue-400 transition-all duration-300 ease-in-out
          ${theme === 'dark' 
            ? 'rotate-0 scale-100 opacity-100' 
            : 'rotate-90 scale-0 opacity-0'
          }
        `} 
      />
      
      {/* Loading state */}
      {isToggling && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Glow effect */}
      <div 
        className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          ${theme === 'light' 
            ? 'bg-gradient-to-r from-amber-400/20 to-orange-400/20' 
            : 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
          }
        `} 
      />
    </button>
  );
}