'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DebugAuthPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [cookieToken, setCookieToken] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Cookie helper function
  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    setAuthToken(localStorage.getItem('auth-token'));
    setCookieToken(getCookie('auth-token'));
  }, []);

  // Debug logging
  useEffect(() => {
    if (isMounted) {
      console.log('🔍 Debug Page - Auth State:', {
        user,
        isAuthenticated,
        isLoading,
        userType: typeof user,
        userValue: user,
        token: authToken,
        cookieToken: cookieToken
      });
    }
  }, [user, isAuthenticated, isLoading, isMounted, authToken]);

  // Auto-refresh time every second
  useEffect(() => {
    if (!isMounted) return;
    
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, [isMounted]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Debug Authentication</h1>
        <p className="text-center text-sm text-gray-500 mb-4">
          Current Time: {isMounted ? currentTime : '--:--:--'}
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Authentication Status:</h3>
            <p><strong>isLoading:</strong> <span className={isLoading ? 'text-orange-600' : 'text-green-600'}>{isLoading ? 'true' : 'false'}</span></p>
            <p><strong>isAuthenticated:</strong> <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? 'true' : 'false'}</span></p>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">User Data:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">localStorage Token:</h3>
            <p className="text-xs break-all">
              {isMounted ? (authToken || 'No token') : 'Loading...'}
            </p>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Cookie Token:</h3>
            <p className="text-xs break-all">
              {isMounted ? (cookieToken || 'No cookie') : 'Loading...'}
            </p>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Debug Info:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Mounted:</strong> {isMounted ? 'Yes' : 'No'}</p>
              <p><strong>Current Path:</strong> {isMounted ? window.location.pathname : 'Loading...'}</p>
              <p><strong>Has Token:</strong> {isMounted ? (authToken ? 'Yes' : 'No') : 'Loading...'}</p>
              <p><strong>Has Cookie:</strong> {isMounted ? (cookieToken ? 'Yes' : 'No') : 'Loading...'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User Role:</strong> {user?.role || 'None'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Link 
              href="/login" 
              className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </Link>
            <Link 
              href="/dashboard" 
              className="block w-full text-center py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to Dashboard
            </Link>
            <Link 
              href="/" 
              className="block w-full text-center py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
