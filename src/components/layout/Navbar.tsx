'use client';

import React, { useState } from 'react';
import NotificationBell from '../ui/NotificationBell';

interface NavbarProps {
  userEmail: string;
  userRole?: string;
  onToggleSidebar: () => void;
  notifications?: number;
  onDeviceApproved?: () => void;
  onNavigateToDeviceApproval?: () => void;
}

export default function Navbar({ 
  userEmail,
  userRole,
  onToggleSidebar, 
  notifications: _notifications = 0,
  onDeviceApproved,
  onNavigateToDeviceApproval
}: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚡</span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                <span className="hidden sm:inline">IoT Electric Energy</span>
                <span className="sm:hidden">IoT Energy</span>
              </h1>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">System Online</span>
            </div>
            
            {/* Admin Notifications Bell */}
            {userRole === 'admin' && (
              <NotificationBell 
                onDeviceApproved={onDeviceApproved}
                onNavigateToDeviceApproval={onNavigateToDeviceApproval}
              />
            )}
            
            {/* API Documentation */}
            <a
              href="/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
              title="API Documentation"
            >
              <svg className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </a>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="เปิดเมนูผู้ใช้"
                aria-expanded={isUserMenuOpen}
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {getInitials(userEmail)}
                </div>
                {/* User Info - Hidden on mobile */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
                    {userEmail.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {userRole}
                  </p>
                </div>
                {/* Dropdown Arrow */}
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={closeUserMenu}
                    aria-hidden="true"
                  />
                  
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-slide-down">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{userEmail}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole} User</p>
                    </div>
                    <div className="py-2">
                      <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                        <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        โปรไฟล์
                      </a>
                      <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                        <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        การตั้งค่า
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Menu Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
              aria-label="เปิด/ปิดเมนู"
            >
              <svg className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
