'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PendingDevice {
  id: string;
  device_id: string;
  device_name?: string;
  device_type?: string;
  ip_address?: string;
  mac_address?: string;
  firmware_version?: string;
  installation_date?: string;
  connection_type?: string;
  data_collection_interval?: number;
  status?: string;
  discovered_at?: string;
  mqtt_topic?: string;
  raw_mqtt_data?: any;
  created_at?: string;
}

interface NotificationBellProps {
  onDeviceApproved?: () => void;
  onNavigateToDeviceApproval?: () => void;
}

export default function NotificationBell({ onDeviceApproved, onNavigateToDeviceApproval }: NotificationBellProps) {
  const [pendingDevices, setPendingDevices] = useState<PendingDevice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch pending devices from database
  const fetchPendingDevices = async () => {
    try {
      const response = await fetch('/api/admin/pending-devices');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newDevices = data.devices || [];
          
          // Show browser notification for new devices
          if (newDevices.length > pendingDevices.length && pendingDevices.length > 0) {
            if (Notification.permission === 'granted') {
              new Notification(`อุปกรณ์ใหม่รอการอนุมัติ`, {
                body: `มีอุปกรณ์ใหม่ ${newDevices.length - pendingDevices.length} เครื่องที่ต้องการอนุมัติ`,
                icon: '/favicon.ico'
              });
            }
          }
          
          setPendingDevices(newDevices);
        }
      }
    } catch (error) {
      console.error('Error fetching pending devices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initial fetch
    fetchPendingDevices();
    
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchPendingDevices, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update comparison for browser notifications
  }, [pendingDevices]);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleDeviceClick = (device: PendingDevice) => {
    setIsOpen(false);
    // Navigate to dashboard device-approval section
    if (onNavigateToDeviceApproval) {
      onNavigateToDeviceApproval();
    } else {
      // Fallback to direct navigation if callback not provided
      router.push(`/admin/device-approval?deviceId=${device.device_id}`);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    // Navigate to dashboard device-approval section
    if (onNavigateToDeviceApproval) {
      onNavigateToDeviceApproval();
    } else {
      // Fallback to direct navigation if callback not provided
      router.push('/admin/device-approval');
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-label="การแจ้งเตือนอุปกรณ์ใหม่"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {pendingDevices.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {pendingDevices.length > 9 ? '9+' : pendingDevices.length}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">
                อุปกรณ์รอการอนุมัติ
              </h3>
              <p className="text-xs text-gray-500">
                {loading ? 'กำลังโหลด...' : `${pendingDevices.length} อุปกรณ์`}
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  กำลังโหลดข้อมูล...
                </div>
              ) : pendingDevices.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  ไม่มีอุปกรณ์รอการอนุมัติ
                </div>
              ) : (
                pendingDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => handleDeviceClick(device)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm5 2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {device.device_name || device.device_id}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {device.device_type || 'Unknown Type'} • {device.ip_address || 'No IP'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {device.discovered_at ? new Date(device.discovered_at).toLocaleString('th-TH') : 'เมื่อสักครู่'}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          รอการอนุมัติ
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {pendingDevices.length > 0 && (
              <div className="border-t border-gray-200">
                <button
                  onClick={handleViewAll}
                  className="w-full text-center px-4 py-2 text-sm text-indigo-600 hover:text-indigo-500 hover:bg-gray-50"
                >
                  ดูทั้งหมด
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
