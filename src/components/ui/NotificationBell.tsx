'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSSE } from '@/hooks/useSSE';

interface NewDeviceNotification {
  type: string;
  device_id: string;
  topic: string;
  sample_data: {
    voltage?: number;
    current?: number;
    power?: number;
    frequency?: number;
    temperature?: number;
  };
  timestamp: string;
  message: string;
}

interface NotificationBellProps {
  onDeviceApproved?: () => void;
}

export default function NotificationBell({ onDeviceApproved }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NewDeviceNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingDevices, setProcessingDevices] = useState<Set<string>>(new Set());
  const bellRef = useRef<HTMLDivElement>(null);

  // SSE connection สำหรับรับการแจ้งเตือน
  const { connect, disconnect, isConnected } = useSSE({
    url: '/api/sse',
    onMessage: (data: unknown) => {
      // ตรวจสอบการแจ้งเตือนอุปกรณ์ใหม่
      const parsedData = data as { topic?: string; data?: NewDeviceNotification };
      if (parsedData.topic === 'admin/new-device-notification') {
        const notification = parsedData.data as NewDeviceNotification;
        
        // เพิ่มการแจ้งเตือนใหม่
        setNotifications(prev => {
          const exists = prev.some(n => n.device_id === notification.device_id);
          if (!exists) {
            // แสดง browser notification ถ้าได้รับอนุญาต
            if (Notification.permission === 'granted') {
              new Notification('อุปกรณ์ใหม่ตรวจพบ', {
                body: `ตรวจพบอุปกรณ์ใหม่: ${notification.device_id}`,
                icon: '/favicon.ico'
              });
            }
            
            return [notification, ...prev].slice(0, 10);
          }
          return prev;
        });
      }
    },
    onError: (error: unknown) => {
      console.error('SSE Error:', error);
    }
  });

  useEffect(() => {
    connect();
    
    // ขออนุญาติใช้ notification
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQuickApprove = async (notification: NewDeviceNotification) => {
    if (processingDevices.has(notification.device_id)) {
      return;
    }

    setProcessingDevices(prev => new Set(prev).add(notification.device_id));
    setLoading(true);
    
    try {
      const facultyFromTopic = notification.topic ? notification.topic.split('/')[1] || 'engineering' : 'engineering';
      
      const locationMap: { [key: string]: string } = {
        'engineering': 'คณะวิศวกรรมศาสตร์',
        'architecture': 'คณะสถาปัตยกรรมศาสตร์', 
        'institution': 'สถาบัน/หน่วยงาน',
        'library': 'ห้องสมุด',
        'science': 'คณะวิทยาศาสตร์'
      };
      
      const roomTypeMap: { [key: string]: string } = {
        'LAB': 'ห้องปฏิบัติการ',
        'MAIN': 'ห้องหลัก',
        'STUDIO': 'ห้องสตูดิโอ',
        'OFFICE': 'ห้องทำงาน',
        'CLASSROOM': 'ห้องเรียน'
      };
      
      const deviceParts = notification.device_id.split('_');
      const roomType = deviceParts[1] || 'DEVICE';
      const location = deviceParts[2] || 'ROOM';
      const number = deviceParts[3] || '01';
      
      const facultyName = locationMap[facultyFromTopic] || facultyFromTopic;
      const roomTypeName = roomTypeMap[roomType] || roomType;
      
      const deviceName = `${facultyName} - ${roomTypeName} ${location} (${number})`;
      
      const response = await fetch('/api/admin/approve-new-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_id: notification.device_id,
          device_name: deviceName,
          faculty: facultyFromTopic,
          meter_model_id: 'SM-300-3P',
          building: 'Auto-detected Building',
          floor: '1',
          room: 'Auto-detected Room',
          position: 'Auto-assigned Position',
          admin_notes: `Auto-approved device from MQTT topic: ${notification.topic}`
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // ลบการแจ้งเตือนที่อนุมัติแล้ว
        setNotifications(prev => 
          prev.filter(n => n.device_id !== notification.device_id)
        );
        
        // เรียก callback เพื่อ refresh devices list
        if (onDeviceApproved) {
          onDeviceApproved();
        }
      } else {
        if (result.message.includes('มีอยู่ในระบบแล้ว')) {
          setNotifications(prev => 
            prev.filter(n => n.device_id !== notification.device_id)
          );
        } else {
          alert(`เกิดข้อผิดพลาด: ${result.message}`);
        }
      }
    } catch (_error) {
      alert('เกิดข้อผิดพลาดในการอนุมัติอุปกรณ์');
    } finally {
      setProcessingDevices(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.device_id);
        return newSet;
      });
      setLoading(false);
    }
  };

  const dismissNotification = (device_id: string) => {
    setNotifications(prev => prev.filter(n => n.device_id !== device_id));
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

  const notificationCount = notifications.length;

  return (
    <div className="relative" ref={bellRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all duration-200 hover:bg-gray-100 ${
          notificationCount > 0 ? 'text-orange-600' : 'text-gray-600'
        }`}
        title={`การแจ้งเตือนอุปกรณ์ใหม่ (${notificationCount})`}
      >
        {/* Bell Icon */}
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Notification Badge */}
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
        
        {/* Pulse Animation */}
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 animate-ping opacity-75"></span>
        )}
        
        {/* Connection Status Indicator */}
        <div className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <span className="text-orange-500 mr-2">🔔</span>
                อุปกรณ์ใหม่รออนุมัติ
                {notificationCount > 0 && (
                  <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </h3>
              {notificationCount > 0 && (
                <button
                  onClick={dismissAllNotifications}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  ลบทั้งหมด
                </button>
              )}
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center mt-1">
              <div className={`h-2 w-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
              </span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notificationCount === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm">ไม่มีการแจ้งเตือน</p>
                <p className="text-xs text-gray-400 mt-1">อุปกรณ์ใหม่จะปรากฏที่นี่</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={`${notification.device_id}-${index}`} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <span className="text-sm">⚡</span>
                        <h4 className="text-sm font-medium text-gray-900 ml-1 truncate">
                          {notification.device_id}
                        </h4>
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                          ใหม่
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(notification.timestamp).toLocaleString('th-TH')}
                      </p>
                      
                      {notification.sample_data && (
                        <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                          {notification.sample_data.voltage && (
                            <span>⚡ {notification.sample_data.voltage}V</span>
                          )}
                          {notification.sample_data.power && (
                            <span>🔋 {notification.sample_data.power}W</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-1 ml-2">
                      <button
                        onClick={() => handleQuickApprove(notification)}
                        disabled={loading || processingDevices.has(notification.device_id)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingDevices.has(notification.device_id) ? '...' : '✓'}
                      </button>
                      
                      <button
                        onClick={() => dismissNotification(notification.device_id)}
                        className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          {notificationCount > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                คลิก ✓ เพื่ออนุมัติ หรือ ✕ เพื่อยกเลิก
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-full">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}