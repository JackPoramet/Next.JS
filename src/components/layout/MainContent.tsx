'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/authStore';
import { useUsers } from '@/hooks/useUsers';
import { useDevices } from '@/hooks/useDevices';
import { userAPI } from '@/lib/userAPI';
import { deviceAPI, FACULTY_NAMES, METER_TYPE_NAMES, STATUS_NAMES } from '@/lib/deviceAPI';
import UserModal from '@/components/ui/UserModal';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';
import RealtimeDashboard from '@/components/dashboard/RealtimeDashboard';
import SystemCheckDashboard from '@/components/dashboard/SystemCheckDashboard';

interface MainContentProps {
  activeMenu: string;
}

export default function MainContent({ activeMenu }: MainContentProps) {
  const { user } = useAuth();
  const { users, stats, isLoading: usersLoading, error: usersError, refreshUsers } = useUsers();
  const { devices, stats: deviceStats, isLoading: devicesLoading, error: devicesError, refreshDevices } = useDevices();
  
  // Filter states for devices
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  
  // API Test states
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [requestMethod, setRequestMethod] = useState<string>('GET');
  const [requestBody, setRequestBody] = useState<string>('');
  const [requestHeaders, setRequestHeaders] = useState<string>('{"Content-Type": "application/json"}');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseTime, setResponseTime] = useState<number>(0);
  
  // Modal states
  const [userModal, setUserModal] = useState({
    isOpen: false,
    mode: 'add' as 'add' | 'edit',
    user: null as any
  });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null as any,
    isLoading: false
  });

  // Modal handlers
  const handleAddUser = () => {
    setUserModal({
      isOpen: true,
      mode: 'add',
      user: null
    });
  };

  const handleEditUser = (userToEdit: any) => {
    setUserModal({
      isOpen: true,
      mode: 'edit',
      user: userToEdit
    });
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (userModal.mode === 'add') {
        await userAPI.createUser(userData);
      } else {
        const { password, confirmPassword, ...updateData } = userData;
        if (password) {
          updateData.password = password;
        }
        await userAPI.updateUser(userModal.user.id, updateData);
      }
      
      // Refresh users list
      await refreshUsers();
      
      // Close modal
      setUserModal({ isOpen: false, mode: 'add', user: null });
    } catch (error: any) {
      throw error; // Let the modal handle the error display
    }
  };

  const handleCloseModal = () => {
    setUserModal({ isOpen: false, mode: 'add', user: null });
  };

  const handleDeleteUser = async (userToDelete: any) => {
    // ป้องกันไม่ให้ลบตัวเอง
    if (userToDelete.id === user?.id || userToDelete.email === user?.email) {
      alert('❌ ไม่สามารถลบบัญชีของตัวเองได้');
      return;
    }

    // เปิด delete confirmation modal
    setDeleteModal({
      isOpen: true,
      user: userToDelete,
      isLoading: false
    });
  };

  // Handle actual delete action after confirmation
  const handleConfirmDelete = async () => {
    if (!deleteModal.user) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      await userAPI.deleteUser(deleteModal.user.id);
      await refreshUsers();
      
      // Close modal and show success
      setDeleteModal({ isOpen: false, user: null, isLoading: false });
      
      // Optional: Show success message (could use a toast notification)
      setTimeout(() => {
        alert('✅ ลบผู้ใช้เรียบร้อยแล้ว');
      }, 100);
    } catch (error: any) {
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
      alert('❌ เกิดข้อผิดพลาดในการลบผู้ใช้: ' + (error.message || 'Unknown error'));
      console.error('Delete user error:', error);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, user: null, isLoading: false });
  };

  const renderDashboard = () => (
    <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🏠 Dashboard หลัก
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          ระบบแสดงผลการใช้พลังงานไฟฟ้าในมหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Authentication ทำงานสำเร็จ!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  • Login ผ่าน API สำเร็จ<br/>
                  • Token ถูกตั้งค่าใน Cookie<br/>
                  • Slide Navigation พร้อมใช้งาน<br/>
                  • Client-side authentication check ผ่าน
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      ผู้ใช้งาน
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user?.email}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      สถานะ
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      เชื่อมต่อแล้ว
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      บทบาท
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user?.role}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnergy = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">⚡ Energy Monitor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Consumption</h3>
            <p className="text-3xl font-bold text-blue-900">1,234 kWh</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Current Usage</h3>
            <p className="text-3xl font-bold text-green-900">45.6 kW</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Peak Today</h3>
            <p className="text-3xl font-bold text-yellow-900">67.8 kW</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Cost Today</h3>
            <p className="text-3xl font-bold text-purple-900">฿456</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDevices = () => {
    // Filter devices based on selected faculty
    const filteredDevices = selectedFaculty === 'all' 
      ? devices 
      : devices.filter(device => device.faculty === selectedFaculty);

    // Group devices by faculty
    const devicesByFaculty = filteredDevices.reduce((acc, device) => {
      const faculty = device.faculty;
      if (!acc[faculty]) {
        acc[faculty] = [];
      }
      acc[faculty].push(device);
      return acc;
    }, {} as Record<string, typeof devices>);

    const faculties = Object.keys(devicesByFaculty).sort();
    
    // Get all available faculties for filter dropdown
    const allFaculties = [...new Set(devices.map(device => device.faculty))].sort();

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">📱 IoT Devices Management</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button 
                onClick={refreshDevices}
                disabled={devicesLoading}
                className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <button 
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New Device</span>
              </button>
            </div>
          </div>

          {/* Faculty Filter */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label htmlFor="faculty-filter" className="text-sm font-medium text-gray-700">
                🏫 Filter by Faculty:
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <select
                  id="faculty-filter"
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="block w-full sm:w-64 pl-3 pr-10 py-2 text-sm sm:text-base bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-400 focus:border-blue-400 rounded-md"
                >
                  <option value="all" className="bg-white text-gray-900">🌍 All Faculties ({devices.length} devices)</option>
                  {allFaculties.map((faculty) => (
                    <option key={faculty} value={faculty} className="bg-white text-gray-900">
                      {FACULTY_NAMES[faculty as keyof typeof FACULTY_NAMES] || faculty} 
                      ({devices.filter(d => d.faculty === faculty).length} devices)
                    </option>
                  ))}
                </select>
                {selectedFaculty !== 'all' && (
                  <button
                    onClick={() => setSelectedFaculty('all')}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </div>

        {/* Error Display */}
        {devicesError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading devices
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{devicesError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Devices Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-xs sm:text-sm font-medium text-blue-800">
              {selectedFaculty === 'all' ? 'Total Devices' : 'Filtered Devices'}
            </h3>
            <p className="text-lg sm:text-2xl font-bold text-blue-900">
              {devicesLoading ? '...' : filteredDevices.length}
            </p>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-xs sm:text-sm font-medium text-green-800">Active Devices</h3>
            <p className="text-lg sm:text-2xl font-bold text-green-900">
              {devicesLoading ? '...' : filteredDevices.filter(d => d.status === 'active').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-xs sm:text-sm font-medium text-yellow-800">Digital Meters</h3>
            <p className="text-lg sm:text-2xl font-bold text-yellow-900">
              {devicesLoading ? '...' : filteredDevices.filter(d => d.meter_type === 'digital').length}
            </p>
          </div>
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-xs sm:text-sm font-medium text-purple-800">Analog Meters</h3>
            <p className="text-lg sm:text-2xl font-bold text-purple-900">
              {devicesLoading ? '...' : filteredDevices.filter(d => d.meter_type === 'analog').length}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {devicesLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading devices...</p>
          </div>
        )}
      </div>

      {/* Faculty Sections */}
      {!devicesLoading && !devicesError && (
        <>
          {faculties.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-12 text-gray-500">
                {selectedFaculty === 'all' 
                  ? 'No devices found' 
                  : `No devices found in ${FACULTY_NAMES[selectedFaculty as keyof typeof FACULTY_NAMES] || selectedFaculty}`
                }
                {selectedFaculty !== 'all' && (
                  <div className="mt-4">
                    <button
                      onClick={() => setSelectedFaculty('all')}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View all faculties
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {selectedFaculty !== 'all' && (
                <div className="bg-blue-600 border border-blue-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-blue-100 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-blue-100">
                      Showing devices for: <strong className="text-white">{FACULTY_NAMES[selectedFaculty as keyof typeof FACULTY_NAMES] || selectedFaculty}</strong>
                      {' '}({filteredDevices.length} devices)
                    </p>
                  </div>
                </div>
              )}
              
              {faculties.map((faculty) => (
              <div key={faculty} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mr-3">
                      {devicesByFaculty[faculty].length} devices
                    </span>
                    🏫 {FACULTY_NAMES[faculty as keyof typeof FACULTY_NAMES] || faculty}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      devicesByFaculty[faculty].filter(d => d.status === 'active').length === devicesByFaculty[faculty].length
                        ? 'bg-green-100 text-green-800'
                        : devicesByFaculty[faculty].filter(d => d.status === 'active').length > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {devicesByFaculty[faculty].filter(d => d.status === 'active').length} / {devicesByFaculty[faculty].length} Active
                    </span>
                  </div>
                </div>

                {/* Desktop Table - Hidden on mobile */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Meter Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Update
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {devicesByFaculty[faculty].map((device) => (
                        <tr key={device.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{device.name}</div>
                                <div className="text-sm text-gray-500">ID: {device.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              device.meter_type === 'digital' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {METER_TYPE_NAMES[device.meter_type] || device.meter_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              device.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {STATUS_NAMES[device.status] || device.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.position || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(device.updated_at).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-900" 
                                title="Edit device"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900" 
                                title="Delete device"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              <button 
                                className="text-green-600 hover:text-green-900" 
                                title="View details"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards - Visible only on mobile */}
                <div className="md:hidden space-y-3">
                  {devicesByFaculty[faculty].map((device) => (
                    <div key={device.id} className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{device.name}</h3>
                            <p className="text-xs text-gray-500 truncate">ID: {device.id}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                device.meter_type === 'digital' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {METER_TYPE_NAMES[device.meter_type] || device.meter_type}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                device.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {STATUS_NAMES[device.status] || device.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-2">
                          <button 
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full" 
                            title="Edit device"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full" 
                            title="Delete device"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button 
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full" 
                            title="View details"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Position: {device.position || 'N/A'}</span>
                          <span>Updated: {new Date(device.updated_at).toLocaleDateString('th-TH')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
          )}
        </>
      )}
    </div>
  );
}

  const renderUsers = () => {
    return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">👥 Users Management</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button 
              onClick={refreshUsers}
              disabled={usersLoading}
              className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            <button 
              onClick={handleAddUser}
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add New User</span>
            </button>
          </div>
        </div>

      {/* Error Display */}
      {usersError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading users
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{usersError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm font-medium text-blue-800">Total Users</h3>
          <p className="text-lg sm:text-2xl font-bold text-blue-900">
            {usersLoading ? '...' : stats.totalUsers}
          </p>
        </div>
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm font-medium text-green-800">Active Users</h3>
          <p className="text-lg sm:text-2xl font-bold text-green-900">
            {usersLoading ? '...' : stats.activeUsers}
          </p>
        </div>
        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm font-medium text-yellow-800">Admins</h3>
          <p className="text-lg sm:text-2xl font-bold text-yellow-900">
            {usersLoading ? '...' : stats.admins}
          </p>
        </div>
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm font-medium text-purple-800">New This Month</h3>
          <p className="text-lg sm:text-2xl font-bold text-purple-900">
            {usersLoading ? '...' : stats.newThisMonth}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {usersLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      )}

      {/* Users Display */}
      {!usersLoading && !usersError && (
        <>
          {users.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table - Hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {userItem.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                              <div className="text-sm text-gray-500">{userItem.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                            userItem.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userItem.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {userItem.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userItem.lastLogin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(userItem.createdAt).toLocaleDateString('th-TH')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditUser(userItem)}
                              className="text-blue-600 hover:text-blue-900" 
                              title="Edit user"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(userItem)}
                              className={`${
                                userItem.id === user?.id || userItem.email === user?.email 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-red-600 hover:text-red-900'
                              }`}
                              title={
                                userItem.id === user?.id || userItem.email === user?.email 
                                  ? 'ไม่สามารถลบบัญชีของตัวเองได้' 
                                  : 'Delete user'
                              }
                              disabled={userItem.id === user?.id || userItem.email === user?.email}
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Visible only on mobile */}
              <div className="md:hidden space-y-3">
                {users.map((userItem) => (
                  <div key={userItem.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {userItem.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{userItem.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{userItem.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                              userItem.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {userItem.role}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userItem.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {userItem.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <button 
                          onClick={() => handleEditUser(userItem)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full" 
                          title="Edit user"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(userItem)}
                          className={`p-2 rounded-full ${
                            userItem.id === user?.id || userItem.email === user?.email 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                          }`}
                          title={
                            userItem.id === user?.id || userItem.email === user?.email 
                              ? 'ไม่สามารถลบบัญชีของตัวเองได้' 
                              : 'Delete user'
                          }
                          disabled={userItem.id === user?.id || userItem.email === user?.email}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Last Login: {userItem.lastLogin}</span>
                        <span>Created: {new Date(userItem.createdAt).toLocaleDateString('th-TH')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  </div>
  );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Analytics</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-500">Charts and graphs will be displayed here</p>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📈 Reports</h2>
        <div className="space-y-4">
          {['Daily Report', 'Weekly Report', 'Monthly Report', 'Annual Report'].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div>
                <h3 className="font-semibold">{report}</h3>
                <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString('th-TH')}</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ Settings</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h3>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Email notifications
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                SMS alerts
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Push notifications
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiTest = () => {
    const apiEndpoints = [
      // Auth Endpoints
      { category: 'Authentication', endpoint: '/api/auth/login', method: 'POST', description: 'User Login' },
      { category: 'Authentication', endpoint: '/api/auth/logout', method: 'POST', description: 'User Logout' },
      { category: 'Authentication', endpoint: '/api/auth/verify', method: 'GET', description: 'Verify Token' },
      
      // Users Endpoints
      { category: 'Users', endpoint: '/api/users', method: 'GET', description: 'Get All Users' },
      { category: 'Users', endpoint: '/api/users', method: 'POST', description: 'Create User' },
      { category: 'Users', endpoint: '/api/users/[id]', method: 'GET', description: 'Get User by ID' },
      { category: 'Users', endpoint: '/api/users/[id]', method: 'PUT', description: 'Update User' },
      { category: 'Users', endpoint: '/api/users/[id]', method: 'DELETE', description: 'Delete User' },
      
      // Devices Endpoints
      { category: 'Devices', endpoint: '/api/devices', method: 'GET', description: 'Get All Devices' },
      { category: 'Devices', endpoint: '/api/devices', method: 'POST', description: 'Create Device' },
      { category: 'Devices', endpoint: '/api/devices/[id]', method: 'GET', description: 'Get Device by ID' },
      { category: 'Devices', endpoint: '/api/devices/[id]', method: 'PUT', description: 'Update Device' },
      { category: 'Devices', endpoint: '/api/devices/[id]', method: 'DELETE', description: 'Delete Device' },
      
      // Profile Endpoints
      { category: 'Profile', endpoint: '/api/profile', method: 'GET', description: 'Get Profile' },
      { category: 'Profile', endpoint: '/api/profile', method: 'PUT', description: 'Update Profile' },
      
      // Admin Endpoints
      { category: 'Admin', endpoint: '/api/admin/users', method: 'GET', description: 'Admin Get Users' },
      { category: 'Admin', endpoint: '/api/admin/stats', method: 'GET', description: 'Get System Stats' },
    ];

    const groupedEndpoints = apiEndpoints.reduce((acc, endpoint) => {
      if (!acc[endpoint.category]) {
        acc[endpoint.category] = [];
      }
      acc[endpoint.category].push(endpoint);
      return acc;
    }, {} as Record<string, typeof apiEndpoints>);

    const handleTestApi = async () => {
      if (!selectedEndpoint) {
        alert('กรุณาเลือก API Endpoint');
        return;
      }

      setIsLoading(true);
      const startTime = Date.now();
      
      try {
        let url = selectedEndpoint;
        // Replace [id] with actual ID for testing
        if (url.includes('[id]')) {
          url = url.replace('[id]', '1'); // Use ID 1 for testing
        }

        let requestOptions: RequestInit = {
          method: requestMethod,
          headers: {
            ...JSON.parse(requestHeaders),
          },
          credentials: 'include', // Include cookies for authentication
        };

        if (requestMethod !== 'GET' && requestBody) {
          requestOptions.body = requestBody;
        }

        const response = await fetch(url, requestOptions);
        const endTime = Date.now();
        setResponseTime(endTime - startTime);

        const contentType = response.headers.get('content-type');
        let responseData;
        
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        setResponse({
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData,
          ok: response.ok
        });

      } catch (error: any) {
        const endTime = Date.now();
        setResponseTime(endTime - startTime);
        setResponse({
          error: true,
          message: error.message,
          status: 'Network Error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    const getMethodColor = (method: string) => {
      switch (method) {
        case 'GET': return 'bg-green-100 text-green-800';
        case 'POST': return 'bg-blue-100 text-blue-800';
        case 'PUT': return 'bg-yellow-100 text-yellow-800';
        case 'DELETE': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getExampleBody = (endpoint: string, method: string) => {
      if (method === 'GET') return '';
      
      if (endpoint.includes('/auth/login')) {
        return JSON.stringify({
          email: "admin@example.com",
          password: "password123"
        }, null, 2);
      }
      
      if (endpoint.includes('/users') && method === 'POST') {
        return JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
          role: "user"
        }, null, 2);
      }
      
      if (endpoint.includes('/devices') && method === 'POST') {
        return JSON.stringify({
          name: "Test Device",
          faculty: "engineering",
          position: "Building A - Floor 1",
          meter_type: "digital"
        }, null, 2);
      }

      return '{}';
    };

    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔧 API Testing Tool</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Configuration</h3>
              
              {/* Endpoint Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select API Endpoint
                </label>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => {
                    setSelectedEndpoint(e.target.value);
                    const endpoint = apiEndpoints.find(ep => ep.endpoint === e.target.value);
                    if (endpoint) {
                      setRequestMethod(endpoint.method);
                      setRequestBody(getExampleBody(endpoint.endpoint, endpoint.method));
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="" className="text-gray-900">Select an endpoint...</option>
                  {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
                    <optgroup key={category} label={category} className="text-gray-900">
                      {endpoints.map((endpoint) => (
                        <option key={`${endpoint.method}-${endpoint.endpoint}`} value={endpoint.endpoint} className="text-gray-900">
                          {endpoint.method} - {endpoint.endpoint} ({endpoint.description})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTTP Method
                </label>
                <select
                  value={requestMethod}
                  onChange={(e) => setRequestMethod(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="GET" className="text-gray-900">GET</option>
                  <option value="POST" className="text-gray-900">POST</option>
                  <option value="PUT" className="text-gray-900">PUT</option>
                  <option value="DELETE" className="text-gray-900">DELETE</option>
                </select>
              </div>

              {/* Headers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headers (JSON)
                </label>
                <textarea
                  value={requestHeaders}
                  onChange={(e) => setRequestHeaders(e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                  placeholder='{"Content-Type": "application/json"}'
                />
              </div>

              {/* Request Body */}
              {requestMethod !== 'GET' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Body (JSON)
                  </label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={8}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                    placeholder="Enter JSON request body..."
                  />
                </div>
              )}

              {/* Test Button */}
              <button
                onClick={handleTestApi}
                disabled={isLoading || !selectedEndpoint}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Response Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Response</h3>
              
              {response && (
                <div className="space-y-4">
                  {/* Response Status */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        response.error ? 'bg-red-100 text-red-800' :
                        response.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {response.status} {response.statusText}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {responseTime}ms
                    </div>
                  </div>

                  {/* Response Headers */}
                  {response.headers && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Response Headers</h4>
                      <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-32 text-gray-900">
                        {JSON.stringify(response.headers, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Response Body */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Response Body</h4>
                    <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-96 whitespace-pre-wrap text-gray-900">
                      {response.error 
                        ? response.message 
                        : typeof response.data === 'string' 
                          ? response.data 
                          : JSON.stringify(response.data, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              )}

              {!response && (
                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md">
                  <div className="text-center text-gray-500">
                    <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Response will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Endpoints Reference */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Available API Endpoints</h3>
          <div className="space-y-4">
            {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
              <div key={category}>
                <h4 className="text-md font-medium text-gray-800 mb-2">{category}</h4>
                <div className="space-y-2">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm text-gray-800">{endpoint.endpoint}</code>
                      </div>
                      <span className="text-sm text-gray-600">{endpoint.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  switch (activeMenu) {
    case 'dashboard':
      return (
        <>
          {renderDashboard()}
        </>
      );
    case 'realtime':
      return (
        <>
          <RealtimeDashboard />
        </>
      );
    case 'energy':
      return (
        <>
          {renderEnergy()}
        </>
      );
    case 'devices':
      return (
        <>
          {renderDevices()}
        </>
      );
    case 'users':
      return (
        <>
          {renderUsers()}
          
          {/* User Modal */}
          <UserModal
            isOpen={userModal.isOpen}
            onClose={handleCloseModal}
            onSave={handleSaveUser}
            user={userModal.user}
            mode={userModal.mode}
          />

          {/* Delete Confirmation Modal */}
          <ConfirmDeleteModal
            isOpen={deleteModal.isOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            userName={deleteModal.user?.name || ''}
            userEmail={deleteModal.user?.email || ''}
            isLoading={deleteModal.isLoading}
          />
        </>
      );
    case 'system-check':
      return (
        <>
          <SystemCheckDashboard />
        </>
      );
    case 'websocket-debug':
      return (
        <>
          <div className="p-6">
            <iframe 
              src="/websocket-debug" 
              className="w-full h-screen border-0 rounded-lg"
              title="WebSocket Debug Monitor"
            />
          </div>
        </>
      );
    case 'analytics':
      return (
        <>
          {renderAnalytics()}
        </>
      );
    case 'reports':
      return (
        <>
          {renderReports()}
        </>
      );
    case 'settings':
      return (
        <>
          {renderSettings()}
        </>
      );
    default:
      return (
        <>
          {renderDashboard()}
        </>
      );
  }
}
