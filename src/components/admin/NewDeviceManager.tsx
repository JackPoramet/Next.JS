'use client';

import React, { useState, useEffect } from 'react';
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

interface NewDeviceManagerProps {
  className?: string;
  onDeviceApproved?: () => void; // Callback เมื่ออนุมัติอุปกรณ์สำเร็จ
}

export default function NewDeviceManager({ className = '', onDeviceApproved }: NewDeviceManagerProps) {
  const [notifications, setNotifications] = useState<NewDeviceNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingDevices, setProcessingDevices] = useState<Set<string>>(new Set()); // ป้องกันการอนุมัติซ้ำ
  
  // SSE connection สำหรับรับการแจ้งเตือน
  const { connect, disconnect, isConnected, lastMessage } = useSSE({
    url: '/api/sse',
    onMessage: (data: any) => {
      // ตรวจสอบการแจ้งเตือนอุปกรณ์ใหม่
      if (data.topic === 'admin/new-device-notification') {
        const notification = data.data as NewDeviceNotification;
        
        // เพิ่มการแจ้งเตือนใหม่
        setNotifications(prev => {
          // ตรวจสอบว่ามี device_id นี้แล้วหรือไม่ (ป้องกัน duplicate)
          const exists = prev.some(n => n.device_id === notification.device_id);
          if (!exists) {
            return [notification, ...prev].slice(0, 10); // เก็บแค่ 10 รายการล่าสุด
          } else {
            return prev;
          }
        });
        
        // แสดง browser notification ถ้าได้รับอนุญาต
        if (Notification.permission === 'granted') {
          new Notification('อุปกรณ์ใหม่ตรวจพบ', {
            body: `ตรวจพบอุปกรณ์ใหม่: ${notification.device_id}`,
            icon: '/favicon.ico'
          });
        }
      }
    },
    onError: (error: any) => {
      console.error('SSE Error:', error);
    }
  });
  
  useEffect(() => {
    // เชื่อมต่อ SSE เพื่อรับการแจ้งเตือน
    connect();
    
    // ขออนุญาติใช้ notification
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  const handleQuickApprove = async (notification: NewDeviceNotification) => {
    // ป้องกันการอนุมัติซ้ำ
    if (processingDevices.has(notification.device_id)) {
      return;
    }

    setProcessingDevices(prev => new Set(prev).add(notification.device_id));
    setLoading(true);
    
    try {
      // สร้างข้อมูลพื้นฐานจาก device_id และ topic
      const facultyFromTopic = notification.topic ? notification.topic.split('/')[1] || 'engineering' : 'engineering';
      
      // สร้างชื่ออุปกรณ์ที่มีความหมายมากกว่า
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
      
      // แยกชื่อจาก device_id เพื่อสร้างชื่อที่เข้าใจง่าย
      const deviceParts = notification.device_id.split('_');
      const faculty = deviceParts[0] || 'UNK';
      const roomType = deviceParts[1] || 'DEVICE';
      const location = deviceParts[2] || 'ROOM';
      const number = deviceParts[3] || '01';
      
      const facultyName = locationMap[facultyFromTopic] || facultyFromTopic;
      const roomTypeName = roomTypeMap[roomType] || roomType;
      
      const deviceName = `${facultyName} - ${roomTypeName} ${location} (${number})`;
      
      // ใช้ข้อมูลจากอุปกรณ์โดยตรง พร้อมข้อมูลที่จำเป็น
      const response = await fetch('/api/admin/approve-new-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_id: notification.device_id,
          device_name: deviceName,
          faculty: facultyFromTopic,
          meter_model_id: 'SM-300-3P', // ใช้ 3-Phase meter model ที่มีอยู่จริง
          building: 'Auto-detected Building',
          floor: '1',
          room: 'Auto-detected Room',
          position: 'Auto-assigned Position',
          admin_notes: `Auto-approved device from MQTT topic: ${notification.topic}`
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // แสดงข้อความสำเร็จ
        alert('อนุมัติอุปกรณ์เรียบร้อยแล้ว! ข้อมูลจะอัปเดตในรายการ IoT Devices Management');
        
        // ลบการแจ้งเตือนที่อนุมัติแล้ว
        setNotifications(prev => 
          prev.filter(n => n.device_id !== notification.device_id)
        );
        
        // เรียก callback เพื่อ refresh devices list
        if (onDeviceApproved) {
          onDeviceApproved();
        }
      } else {
        // หากเป็นข้อผิดพลาดเรื่องอุปกรณ์มีอยู่แล้ว ให้ลบการแจ้งเตือนออก
        if (result.message.includes('มีอยู่ในระบบแล้ว')) {
          setNotifications(prev => 
            prev.filter(n => n.device_id !== notification.device_id)
          );
          alert('อุปกรณ์นี้มีอยู่ในระบบแล้ว - ลบการแจ้งเตือนออกแล้ว');
        } else {
          alert(`เกิดข้อผิดพลาด: ${result.message}`);
        }
      }
    } catch (error) {
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

  if (notifications.length === 0) {
    return null; // ไม่แสดงอะไรถ้าไม่มีการแจ้งเตือน
  }

  return (
    <div className={`p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          🔔 อุปกรณ์ใหม่รออนุมัติ ({notifications.length})
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <div key={`${notification.device_id}-${index}`} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">⚡</span>
                  <h3 className="font-semibold text-gray-900">
                    อุปกรณ์ใหม่: {notification.device_id}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    ใหม่
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Topic:</strong> {notification.topic}</p>
                  <p><strong>เวลาที่ตรวจพบ:</strong> {new Date(notification.timestamp).toLocaleString('th-TH')}</p>
                  
                  {notification.sample_data && (
                    <div className="mt-2">
                      <p><strong>ข้อมูลตัวอย่าง:</strong></p>
                      <div className="grid grid-cols-2 gap-2 mt-1 text-xs bg-gray-50 p-2 rounded">
                        {notification.sample_data.voltage && (
                          <span>แรงดัน: {notification.sample_data.voltage} V</span>
                        )}
                        {notification.sample_data.current && (
                          <span>กระแส: {notification.sample_data.current} A</span>
                        )}
                        {notification.sample_data.power && (
                          <span>กำลัง: {notification.sample_data.power} W</span>
                        )}
                        {notification.sample_data.frequency && (
                          <span>ความถี่: {notification.sample_data.frequency} Hz</span>
                        )}
                        {notification.sample_data.temperature && (
                          <span>อุณหภูมิ: {notification.sample_data.temperature} °C</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => handleQuickApprove(notification)}
                  disabled={loading || processingDevices.has(notification.device_id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center space-x-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {processingDevices.has(notification.device_id) ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
                  </span>
                </button>
                
                <button
                  onClick={() => dismissNotification(notification.device_id)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm flex items-center space-x-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">กำลังดำเนินการ...</span>
          </div>
        </div>
      )}
    </div>
  );
}
