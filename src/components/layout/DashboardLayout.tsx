'use client';

import { useState, ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNavBar from './MobileNavBar';

interface DashboardLayoutProps {
  readonly children: ReactNode;
  readonly userEmail: string;
  readonly userRole: string;
  readonly activeMenu: string;
  readonly onMenuChange: (menuId: string) => void;
  readonly onLogout: () => void;
  readonly onDeviceApproved?: () => void;
  readonly onNavigateToDeviceApproval?: () => void;
}

export default function DashboardLayout({
  children,
  userEmail,
  userRole,
  activeMenu,
  onMenuChange,
  onLogout,
  onDeviceApproved,
  onNavigateToDeviceApproval
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar 
          userEmail={userEmail}
          userRole={userRole}
          onToggleSidebar={toggleSidebar}
          onDeviceApproved={onDeviceApproved}
          onNavigateToDeviceApproval={onNavigateToDeviceApproval}
        />
      </div>

      {/* Mobile Top/Bottom Navigation */}
      <div className="md:hidden">
        <MobileNavBar
          userRole={userRole}
          onToggleSidebar={toggleSidebar}
          activeMenu={activeMenu}
          onNavigateToDeviceApproval={onNavigateToDeviceApproval}
        />
      </div>

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
      <main className="max-w-7xl mx-auto transition-all px-3 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-0 md:pb-0">
        <div className="py-4 md:py-6 text-gray-900">
          {children}
        </div>
      </main>
    </div>
  );
}
