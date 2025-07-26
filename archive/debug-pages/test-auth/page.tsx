'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      console.log('🧪 Test Auth State:', {
        user,
        isAuthenticated,
        isLoading,
        timestamp: new Date().toISOString()
      });
    }
  }, [user, isAuthenticated, isLoading, mounted]);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Auth State Test</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-800">isLoading</h3>
            <p className={`text-lg font-mono ${isLoading ? 'text-orange-600' : 'text-green-600'}`}>
              {isLoading.toString()}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-semibold text-green-800">isAuthenticated</h3>
            <p className={`text-lg font-mono ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {isAuthenticated.toString()}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded mb-6">
          <h3 className="font-semibold mb-2">User Object:</h3>
          <pre className="text-sm bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-yellow-50 rounded mb-6">
          <h3 className="font-semibold mb-2">localStorage:</h3>
          <p className="text-sm font-mono break-all">
            Token: {localStorage.getItem('auth-token') || 'No token found'}
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear & Reload
          </button>
        </div>
      </div>
    </div>
  );
}
