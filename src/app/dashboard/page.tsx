'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/authStore';
import { DashboardLayout, MainContent } from '@/components/layout';

// Define the interface for MainContent ref
interface MainContentRef {
  refreshDevices: () => void;
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout, checkAuth } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const mainContentRef = useRef<MainContentRef>(null);

  useEffect(() => {
    // ตรวจสอบ authentication เมื่อ component mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Redirect to login if not authenticated (after loading)
    if (!isLoading && !isAuthenticated) {
      console.log('[DEBUG] Dashboard - Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleMenuChange = (menuId: string) => {
    setActiveMenu(menuId);
  };

  const handleDeviceApproved = () => {
    // Force refresh of devices when a new device is approved
    if (mainContentRef.current?.refreshDevices) {
      mainContentRef.current.refreshDevices();
    }
    // Also refresh when on devices page
    if (activeMenu === 'devices') {
      setActiveMenu('devices'); // This will trigger a re-render
    }
  };

  const handleNavigateToDeviceApproval = () => {
    // Switch to device-approval menu when notification bell is clicked
    setActiveMenu('device-approval');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // จะ redirect ไป login
  }

  return (
    <DashboardLayout
      userEmail={user.email}
      userRole={user.role}
      activeMenu={activeMenu}
      onMenuChange={handleMenuChange}
      onLogout={handleLogout}
      onDeviceApproved={handleDeviceApproved}
      onNavigateToDeviceApproval={handleNavigateToDeviceApproval}
    >
      <div data-testid="dashboard">
        <MainContent 
          activeMenu={activeMenu} 
          ref={mainContentRef}
        />
      </div>
    </DashboardLayout>
  );
}
