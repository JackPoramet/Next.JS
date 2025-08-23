'use client';

import React from 'react';
import NewDeviceManager from '@/components/admin/NewDeviceManager';

export default function NewDeviceApprovalDemo() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ระบบอนุมัติอุปกรณ์ใหม่
          </h1>
          <p className="text-gray-600">
            เมื่อมีอุปกรณ์ใหม่ส่งข้อมูลผ่าน MQTT ระบบจะแจ้งเตือนให้อนุมัติก่อนบันทึกลงฐานข้อมูล
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <NewDeviceManager />
        </div>
        
        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">วิธีการทดสอบ:</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>เปิดหน้านี้ไว้ (ระบบจะเชื่อมต่อ SSE อัตโนมัติ)</li>
            <li>ใช้ MQTT test client ส่งข้อมูลไปยัง topic: <code className="bg-blue-100 px-1 rounded">devices/engineering/TEST001/datas</code></li>
            <li>ส่งข้อมูลตัวอย่าง JSON:</li>
          </ol>
          
          <div className="mt-4 bg-white p-4 rounded border">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`{
  "device_id": "TEST001",
  "voltage": 220.5,
  "current": 5.2,
  "power": 1146.6,
  "frequency": 50.0,
  "temperature": 25.3,
  "timestamp": "2025-08-20T10:30:00Z"
}`}
            </pre>
          </div>
          
          <p className="mt-4 text-blue-800">
            <strong>หมายเหตุ:</strong> หาก device_id ใหม่ (ไม่มีในฐานข้อมูล) ระบบจะแสดงการแจ้งเตือนด้านบน
          </p>
        </div>
      </div>
    </div>
  );
}
