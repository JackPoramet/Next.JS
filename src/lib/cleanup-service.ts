/**
 * Cleanup Service
 * ทำความสะอาดข้อมูลอุปกรณ์ที่ไม่ active ใน devices_pending table
 */

import pool from './database';

class CleanupService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private cleanupInterval = 30 * 1000; // รันทุก 30 วินาที
  private deviceTimeout = 60 * 1000; // ลบอุปกรณ์ที่ไม่ส่งข้อมูลมา 1 นาที

  constructor() {
    this.start();
  }

  /**
   * เริ่มต้น cleanup service
   */
  public start() {
    if (this.isRunning) {
      console.log('🧹 Cleanup service is already running');
      return;
    }

    this.isRunning = true;
    console.log('🧹 Starting cleanup service...');
    console.log(`⏰ Cleanup interval: ${this.cleanupInterval/1000}s`);
    console.log(`⏳ Device timeout: ${this.deviceTimeout/1000}s`);

    this.intervalId = setInterval(async () => {
      await this.cleanupInactiveDevices();
    }, this.cleanupInterval);
  }

  /**
   * หยุด cleanup service
   */
  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🧹 Cleanup service stopped');
  }

  /**
   * ลบอุปกรณ์ที่ไม่ active จาก devices_pending
   */
  private async cleanupInactiveDevices() {
    try {
      // ลบอุปกรณ์ที่ last_seen_at เก่ากว่า 1 นาที
      const result = await pool.query(`
        DELETE FROM devices_pending 
        WHERE last_seen_at < NOW() - INTERVAL '${this.deviceTimeout/1000} seconds'
        RETURNING device_id, device_name, last_seen_at
      `);

      if (result.rows.length > 0) {
        console.log('🧹 Cleaned up inactive devices:', result.rows.length);
        result.rows.forEach(device => {
          console.log(`   - ${device.device_id} (${device.device_name}) - last seen: ${device.last_seen_at}`);
        });
      } else {
        console.log('🧹 No inactive devices to clean up');
      }

    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  /**
   * ดูสถานะของ cleanup service
   */
  public getStatus() {
    return {
      isRunning: this.isRunning,
      cleanupInterval: this.cleanupInterval,
      deviceTimeout: this.deviceTimeout,
      nextCleanup: this.intervalId ? new Date(Date.now() + this.cleanupInterval) : null
    };
  }

  /**
   * ตั้งค่า timeout ใหม่ (milliseconds)
   */
  public setDeviceTimeout(timeoutMs: number) {
    this.deviceTimeout = timeoutMs;
    console.log(`🧹 Updated device timeout to: ${timeoutMs/1000}s`);
  }

  /**
   * ตั้งค่า cleanup interval ใหม่ (milliseconds)
   */
  public setCleanupInterval(intervalMs: number) {
    this.cleanupInterval = intervalMs;
    
    // Restart service with new interval
    this.stop();
    setTimeout(() => this.start(), 100);
    
    console.log(`🧹 Updated cleanup interval to: ${intervalMs/1000}s`);
  }

  /**
   * รัน cleanup ทันทีโดยไม่รอ interval
   */
  public async forceCleanup() {
    console.log('🧹 Running forced cleanup...');
    await this.cleanupInactiveDevices();
  }

  /**
   * ดูรายการอุปกรณ์ที่จะถูกลบในรอบถัดไป
   */
  public async getInactiveDevices() {
    try {
      const result = await pool.query(`
        SELECT 
          device_id, 
          device_name, 
          last_seen_at,
          EXTRACT(EPOCH FROM (NOW() - last_seen_at)) as seconds_inactive
        FROM devices_pending 
        WHERE last_seen_at < NOW() - INTERVAL '${this.deviceTimeout/1000} seconds'
        ORDER BY last_seen_at ASC
      `);

      return result.rows;
    } catch (error) {
      console.error('❌ Error getting inactive devices:', error);
      return [];
    }
  }

  /**
   * ดูรายการอุปกรณ์ทั้งหมดพร้อมสถานะ
   */
  public async getAllDevicesStatus() {
    try {
      const result = await pool.query(`
        SELECT 
          device_id, 
          device_name, 
          last_seen_at,
          EXTRACT(EPOCH FROM (NOW() - last_seen_at)) as seconds_inactive,
          CASE 
            WHEN last_seen_at > NOW() - INTERVAL '${this.deviceTimeout/1000} seconds' THEN 'active'
            ELSE 'will_be_deleted'
          END as status
        FROM devices_pending 
        ORDER BY last_seen_at DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('❌ Error getting all devices status:', error);
      return [];
    }
  }
}

// Singleton instance
let cleanupService: CleanupService | null = null;

export function getCleanupService(): CleanupService {
  if (!cleanupService) {
    cleanupService = new CleanupService();
  }
  return cleanupService;
}

export default CleanupService;
