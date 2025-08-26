import { NextRequest, NextResponse } from 'next/server';
import { DeviceInfo, DevicesStats } from '@/lib/deviceModels';

// GET /api/devices/list - รายการอุปกรณ์ทั้งหมดแบบใหม่ (ปิดใช้งานตาราง devices)
export async function GET(_request: NextRequest) {
  try {
    console.log('[INFO] Devices List API - Returning empty device list (device tables disabled)');

    // ส่งข้อมูลว่างแทนการ query จากฐานข้อมูล
    const devices: DeviceInfo[] = [];

    // สถิติข้อมูลว่าง
    const devicesByFaculty: {[faculty: string]: number} = {};
    const devicesByType: {[meterType: string]: number} = {};

    const stats: DevicesStats = {
      totalDevices: 0,
      activeDevices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      errorDevices: 0,
      devicesByFaculty,
      devicesByType
    };

    console.log('[INFO] Devices List API - Returned empty device list successfully');

    return NextResponse.json({
      success: true,
      message: 'No devices configured (device tables disabled)',
      data: {
        devices,
        stats
      }
    });

  } catch (error) {
    console.error('[ERROR] Devices List API - Error:', error);
    
    // ส่งข้อมูลว่างเมื่อเกิด error
    return NextResponse.json({
      success: true,
      message: 'Device tables disabled',
      data: {
        devices: [],
        stats: {
          totalDevices: 0,
          activeDevices: 0,
          onlineDevices: 0,
          offlineDevices: 0,
          errorDevices: 0,
          devicesByFaculty: {},
          devicesByType: {}
        }
      }
    });
  }
}
