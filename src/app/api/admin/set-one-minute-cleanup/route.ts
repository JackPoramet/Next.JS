import { NextRequest, NextResponse } from 'next/server';
import { getCleanupService } from '@/lib/cleanup-service';

/**
 * POST /api/admin/set-one-minute-cleanup
 * ตั้งค่าให้ลบอุปกรณ์ pending อัตโนมัติหลังจาก 1 นาที
 */
export async function POST(request: NextRequest) {
  try {
    const cleanupService = getCleanupService();
    
    // ตั้งค่า timeout เป็น 1 นาทีพอดี
    cleanupService.setOneMinuteTimeout();
    
    // ตั้งค่า cleanup interval เป็น 15 วินาที (ตรวจสอบบ่อยขึ้น)
    cleanupService.setCleanupInterval(15 * 1000);
    
    // Restart service เพื่อให้การตั้งค่าใหม่มีผล
    cleanupService.stop();
    setTimeout(() => cleanupService.start(), 100);

    const status = cleanupService.getStatus();

    return NextResponse.json({
      success: true,
      message: 'Auto-delete configured successfully: Pending devices will be deleted after 1 minute of inactivity',
      data: {
        deviceTimeout: '60 seconds (1 minute)',
        cleanupInterval: '15 seconds',
        nextCleanup: status.nextCleanup,
        isRunning: status.isRunning
      }
    });

  } catch (error) {
    console.error('Error setting one minute cleanup:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to configure auto-delete settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/set-one-minute-cleanup  
 * ดูข้อมูลการตั้งค่าปัจจุบัน
 */
export async function GET() {
  try {
    const cleanupService = getCleanupService();
    const status = cleanupService.getStatus();
    const inactiveDevices = await cleanupService.getInactiveDevices();
    
    return NextResponse.json({
      success: true,
      data: {
        currentSettings: {
          deviceTimeout: `${status.deviceTimeout/1000} seconds`,
          cleanupInterval: `${status.cleanupInterval/1000} seconds`,
          isRunning: status.isRunning,
          nextCleanup: status.nextCleanup
        },
        devicesWillBeDeleted: inactiveDevices.length,
        inactiveDevices: inactiveDevices.map(device => ({
          device_id: device.device_id,
          device_name: device.device_name,
          last_seen_at: device.last_seen_at,
          inactive_for_seconds: Math.floor(device.seconds_inactive)
        }))
      }
    });

  } catch (error) {
    console.error('Error getting cleanup settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get cleanup settings' 
      },
      { status: 500 }
    );
  }
}
