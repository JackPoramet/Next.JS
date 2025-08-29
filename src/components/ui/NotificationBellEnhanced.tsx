'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'device_approval' | 'alert' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  deviceId?: string;
  priority?: 'low' | 'medium' | 'high';
}

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
  raw_mqtt_data?: Record<string, unknown>;
  created_at?: string;
}

interface NotificationBellProps {
  onDeviceApproved?: () => void;
  onNavigateToDeviceApproval?: () => void;
}

export default function NotificationBellEnhanced({ 
  onDeviceApproved: _onDeviceApproved,
  onNavigateToDeviceApproval 
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingDevices, setPendingDevices] = useState<PendingDevice[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch pending devices and convert to notifications
  const fetchPendingDevices = useCallback(async () => {
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
          
          // Convert pending devices to notifications
          const deviceNotifications: Notification[] = newDevices.map((device: PendingDevice) => ({
            id: `device-${device.id}`,
            type: 'device_approval',
            title: 'อุปกรณ์รอการอนุมัติ',
            message: `${device.device_name || device.device_id} รอการอนุมัติจากแอดมิน`,
            timestamp: device.discovered_at || device.created_at || new Date().toISOString(),
            read: false,
            deviceId: device.device_id,
            priority: 'medium'
          }));
          
          setNotifications(deviceNotifications);
          setUnreadCount(deviceNotifications.length);
        }
      } else {
        console.error('Failed to fetch pending devices:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching pending devices:', error);
      // Set empty arrays on error to prevent crash
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [pendingDevices]);

  // Initialize component
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    fetchPendingDevices();
    
    // Polling for new devices every 30 seconds
    const interval = setInterval(fetchPendingDevices, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPendingDevices]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.type === 'device_approval') {
      if (onNavigateToDeviceApproval) {
        onNavigateToDeviceApproval();
      } else {
        router.push('/admin?tab=device-approval');
      }
    }
    
    closeDropdown();
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification['type'], priority?: string) => {
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center";
    
    switch (type) {
      case 'device_approval':
        return (
          <div className={`${baseClasses} ${priority === 'high' ? 'bg-blue-200 dark:bg-blue-800' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
            <svg className={`w-4 h-4 ${priority === 'high' ? 'text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'}`} 
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'alert':
        return (
          <div className={`${baseClasses} bg-red-100 dark:bg-red-900/20`}>
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className={`${baseClasses} bg-yellow-100 dark:bg-yellow-900/20`}>
            <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className={`${baseClasses} bg-green-100 dark:bg-green-900/20`}>
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'เมื่อกี้นี้';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} นาทีที่แล้ว`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getPriorityColor = (priority?: string, read?: boolean) => {
    if (read) return '';
    
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-400 bg-red-50 dark:bg-red-900/10';
      case 'medium':
        return 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low':
        return 'border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/10';
      default:
        return 'bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const getPriorityBadgeClass = (priority?: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
  };

  const getPriorityText = (priority?: string) => {
    if (priority === 'high') return 'สำคัญ';
    if (priority === 'medium') return 'ปานกลาง';
    return 'ต่ำ';
  };

  if (loading) {
    return (
      <div className="relative">
        <button className="relative p-2 rounded-lg text-gray-400 animate-pulse">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
        aria-label="แจ้งเตือน"
        aria-expanded={isDropdownOpen}
      >
        <svg className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" 
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeDropdown}
            aria-hidden="true"
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-slide-down">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">การแจ้งเตือน</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-150"
                >
                  ทำเครื่องหมายทั้งหมด
                </button>
              )}
            </div>
            
            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">ไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleNotificationClick(notification);
                      }
                    }}
                    className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      getPriorityColor(notification.priority, notification.read)
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type, notification.priority)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                          {notification.priority && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityBadgeClass(notification.priority)}`}>
                              {getPriorityText(notification.priority)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => {
                    router.push('/admin?tab=notifications');
                    closeDropdown();
                  }}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-150 py-1"
                >
                  ดูการแจ้งเตือนทั้งหมด
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
