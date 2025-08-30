'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function SimpleThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // ดึงค่า theme จาก localStorage
    const savedTheme = localStorage.getItem('simple-theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      applyDarkMode();
    } else {
      setIsDark(false);
      applyLightMode();
    }
  }, []);

  const applyDarkMode = () => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    localStorage.setItem('simple-theme', 'dark');
  };

  const applyLightMode = () => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('simple-theme', 'light');
  };

  const toggleTheme = () => {
    if (isDark) {
      setIsDark(false);
      applyLightMode();
    } else {
      setIsDark(true);
      applyDarkMode();
    }
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-lg
        bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500
      `}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <SunIcon className="w-5 h-5 text-amber-500" />
      ) : (
        <MoonIcon className="w-5 h-5 text-blue-600" />
      )}
    </button>
  );
}
