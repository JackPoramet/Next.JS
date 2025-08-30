'use client';

import React from 'react';
import NotificationBell from '../ui/NotificationBell';
import Link from 'next/link';

interface MobileNavBarProps {
  readonly userRole?: string;
  readonly onToggleSidebar: () => void;
  readonly activeMenu: string;
  readonly onNavigateToDeviceApproval?: () => void;
}

export default function MobileNavBar({ 
  userRole,
  onToggleSidebar,
  activeMenu,
  onNavigateToDeviceApproval
}: MobileNavBarProps) {
  const quickActions = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { id: 'realtime', name: 'Monitor', icon: '📡', path: '/realtime' },
    { id: 'devices', name: 'Devices', icon: '📱', path: '/devices' }
  ];
  
  const adminActions = userRole === 'admin' 
    ? [{ id: 'device-approval', name: 'Approve', icon: '✅', path: '/admin/device-approval' }]
    : [];
  
  const allQuickActions = [...quickActions, ...adminActions];

  return (
    <>
      {/* Top Navigation Bar */}
  <nav className="fixed top-0 left-0 right-0 bg-white z-40 border-b border-gray-200 shadow-sm pt-[env(safe-area-inset-top)]" aria-label="Mobile top navigation">
        <div className="flex justify-between items-center h-14 px-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <h1 className="text-sm font-semibold text-foreground">
              IoT Energy
            </h1>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-1">
            {/* Admin Notifications */}
            {userRole === 'admin' && (
              <NotificationBell 
                onNavigateToDeviceApproval={onNavigateToDeviceApproval}
              />
            )}
            
            {/* Menu Button */}
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="เปิด/ปิดเมนู"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
  </nav>
      
      {/* Bottom Quick Navigation */}
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-[env(safe-area-inset-bottom)]" aria-label="Mobile bottom navigation">
        <div className="flex justify-around items-center h-16">
          {allQuickActions.map((action) => (
            <Link 
              href={action.path} 
              key={action.id}
              aria-current={activeMenu === action.id ? 'page' : undefined}
        className={`flex flex-col items-center justify-center w-1/4 h-full transition-colors ${
                activeMenu === action.id 
          ? 'text-primary font-semibold' 
          : 'text-gray-500 hover:text-gray-900'
              }`}
              aria-label={action.name}
            >
              <span className={`text-xl mb-0.5 ${activeMenu === action.id ? 'scale-105' : ''}`}>{action.icon}</span>
              <span className="text-xs font-medium">{action.name}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Add padding for content */}
      <div className="pt-14 pb-16" />
    </>
  );
}
