'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AdminData {
  totalUsers: number;
  totalEnergy: number;
  systemStatus: string;
  lastUpdate: string;
}

const BearerTokenExample: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: 'admin@example.com',
    password: 'admin123'
  });

  useEffect(() => {
    setIsAuthenticated(apiClient.isAuthenticated());
    if (apiClient.isAuthenticated()) {
      loadUserProfile();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.login(loginForm.email, loginForm.password);
      console.log('Login successful:', response);
      
      setIsAuthenticated(true);
      await loadUserProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
      setAdminData(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProfile();
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.getAdminDashboard();
      if (response.success) {
        setAdminData(response.data.adminData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const testCurrentUser = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.getCurrentUser();
      console.log('Current user:', response);
      alert(JSON.stringify(response, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get current user');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">JWT Bearer Token Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Test Accounts:</strong></p>
          <p>Admin: admin@example.com / admin123</p>
          <p>User: user@example.com / user123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">JWT Bearer Token Demo</h2>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Current Token Display */}
        <div className="mb-6 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Current Bearer Token:</h3>
          <code className="text-xs break-all text-gray-700">
            {apiClient.getToken()}
          </code>
        </div>

        {/* User Profile */}
        {user && (
          <div className="mb-6 p-4 bg-green-50 rounded-md">
            <h3 className="font-semibold mb-2">User Profile:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Name:</strong> {user.first_name} {user.last_name}</div>
              <div><strong>Role:</strong> {user.role}</div>
            </div>
          </div>
        )}

        {/* API Testing Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={loadUserProfile}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Get Profile
          </button>
          
          <button
            onClick={testCurrentUser}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Test /api/auth/me
          </button>
          
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Load Admin Data
          </button>
        </div>

        {/* Admin Data */}
        {adminData && (
          <div className="mb-6 p-4 bg-purple-50 rounded-md">
            <h3 className="font-semibold mb-2">Admin Dashboard Data:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Total Users:</strong> {adminData.totalUsers}</div>
              <div><strong>Total Energy:</strong> {adminData.totalEnergy} kWh</div>
              <div><strong>System Status:</strong> {adminData.systemStatus}</div>
              <div><strong>Last Update:</strong> {new Date(adminData.lastUpdate).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center text-gray-600">
            Loading...
          </div>
        )}

        {/* API Testing Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-md">
          <h3 className="font-semibold mb-2">📝 Testing Instructions:</h3>
          <ul className="text-sm space-y-1">
            <li>• Token จะถูกเก็บใน localStorage และ auto-attach ใน Authorization header</li>
            <li>• เมื่อ token หมดอายุ ระบบจะ auto-logout</li>
            <li>• Admin account สามารถเข้าถึง Admin Data ได้</li>
            <li>• User account จะได้รับ 403 error เมื่อพยายามเข้าถึง Admin Data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BearerTokenExample;
