'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/authStore';

export default function Home() {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ตรวจสอบ authentication เมื่อ component mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // แสดง loading ระหว่างรอ redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  );
}
