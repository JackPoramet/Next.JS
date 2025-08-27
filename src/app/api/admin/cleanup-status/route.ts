import { NextRequest, NextResponse } from 'next/server';
import { getCleanupService } from '@/lib/cleanup-service';

/**
 * GET /api/admin/cleanup-status
 * ดูสถานะของ cleanup service
 */
export async function GET() {
  try {
    const cleanupService = getCleanupService();
    const status = cleanupService.getStatus();
    const inactiveDevices = await cleanupService.getInactiveDevices();
    const allDevices = await cleanupService.getAllDevicesStatus();

    return NextResponse.json({
      success: true,
      data: {
        service: status,
        inactiveDevices,
        allDevices,
        summary: {
          totalDevices: allDevices.length,
          activeDevices: allDevices.filter(d => d.status === 'active').length,
          inactiveDevices: inactiveDevices.length
        }
      }
    });

  } catch (error) {
    console.error('Error getting cleanup status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/cleanup-status
 * ควบคุม cleanup service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, deviceTimeout, cleanupInterval } = body;

    const cleanupService = getCleanupService();

    switch (action) {
      case 'force_cleanup':
        await cleanupService.forceCleanup();
        return NextResponse.json({
          success: true,
          message: 'Forced cleanup completed'
        });

      case 'set_one_minute_timeout':
        cleanupService.setOneMinuteTimeout();
        return NextResponse.json({
          success: true,
          message: 'Device timeout set to exactly 1 minute (60 seconds)'
        });

      case 'set_device_timeout':
        if (!deviceTimeout || deviceTimeout < 10) {
          return NextResponse.json(
            { success: false, message: 'Device timeout must be at least 10 seconds' },
            { status: 400 }
          );
        }
        cleanupService.setDeviceTimeout(deviceTimeout * 1000);
        return NextResponse.json({
          success: true,
          message: `Device timeout updated to ${deviceTimeout} seconds`
        });

      case 'set_cleanup_interval':
        if (!cleanupInterval || cleanupInterval < 5) {
          return NextResponse.json(
            { success: false, message: 'Cleanup interval must be at least 5 seconds' },
            { status: 400 }
          );
        }
        cleanupService.setCleanupInterval(cleanupInterval * 1000);
        return NextResponse.json({
          success: true,
          message: `Cleanup interval updated to ${cleanupInterval} seconds`
        });

      case 'restart':
        cleanupService.stop();
        setTimeout(() => cleanupService.start(), 100);
        return NextResponse.json({
          success: true,
          message: 'Cleanup service restarted'
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error controlling cleanup service:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
