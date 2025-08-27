import React from 'react';
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
  return (
    <nav className="bg-white shadow border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              IoT Electric Energy Dashboard
            </h1>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <span className="text-gray-800 hidden sm:block">
              สวัสดี, <span className="font-medium">{userEmail}</span>
            </span>
            
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
              className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="API Documentation"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </a>
            
            {/* Menu Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="เปิด/ปิดเมนู"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
