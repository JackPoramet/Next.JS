'use client';

import React, { useState, useEffect } from 'react';

export default function CookieTestPage() {
  const [cookies, setCookies] = useState('');
  const [testCookie, setTestCookie] = useState('');

  useEffect(() => {
    setCookies(document.cookie);
  }, []);

  const setTestCookieHandler = () => {
    document.cookie = 'test-cookie=test-value;path=/;SameSite=Lax';
    setCookies(document.cookie);
  };

  const clearCookies = () => {
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'test-cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setCookies(document.cookie);
  };

  const getCookieValue = (name: string) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Cookie Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">All Cookies:</h3>
            <p className="text-sm font-mono break-all">
              {cookies || 'No cookies found'}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Auth Token:</h3>
            <p className="text-sm font-mono break-all">
              {getCookieValue('auth-token') || 'No auth token'}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-semibold mb-2">Test Cookie:</h3>
            <p className="text-sm font-mono break-all">
              {getCookieValue('test-cookie') || 'No test cookie'}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={setTestCookieHandler}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Set Test Cookie
            </button>
            <button
              onClick={() => setCookies(document.cookie)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Refresh
            </button>
            <button
              onClick={clearCookies}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear All
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
