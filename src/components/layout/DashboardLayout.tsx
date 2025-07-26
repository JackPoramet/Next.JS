'use client';

import { useState, ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail: string;
  userRole: string;
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
  onLogout: () => void;
}

export default function DashboardLayout({
  children,
  userEmail,
  userRole,
  activeMenu,
  onMenuChange,
  onLogout
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      {/* Navbar */}
      <Navbar 
        userEmail={userEmail} 
        onToggleSidebar={toggleSidebar} 
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        activeMenu={activeMenu}
        onMenuClick={onMenuChange}
        userEmail={userEmail}
        userRole={userRole}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}
