import { Pool } from 'pg';
import { pool } from '@/lib/database';

// Types สำหรับ logging system
export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

export interface LogEntry {
  id?: number;
  timestamp?: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: any;
  source?: string;
  userId?: number;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt?: string;
}

export interface LogQueryOptions {
  level?: LogLevel | 'all';
  category?: string | 'all';
  search?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  userId?: number;
}

export interface LogQueryResult {
  logs: LogEntry[];
  total: number;
  hasMore: boolean;
}

class LoggingService {
  private pool: Pool;
  private isEnabled: boolean = true;

  constructor() {
    this.pool = pool;
  }

  /**
   * เพิ่ม log entry ใหม่ลงในฐานข้อมูล
   */
  async addLog(entry: Omit<LogEntry, 'id' | 'timestamp' | 'createdAt'>): Promise<boolean> {
    if (!this.isEnabled) {
      console.warn('Logging service is disabled');
      return false;
    }

    try {
      const query = `
        INSERT INTO system_logs (
          level, category, message, details, source, 
          user_id, user_email, ip_address, user_agent, session_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, timestamp, created_at
      `;

      const values = [
        entry.level,
        entry.category,
        entry.message,
        entry.details || null, // PostgreSQL JSONB can handle JS objects directly
        entry.source,
        entry.userId,
        entry.userEmail,
        entry.ipAddress,
        entry.userAgent,
        entry.sessionId
      ];

      const result = await this.pool.query(query, values);
      
      if (result.rows.length > 0) {
        return true;
      }
      
      return false;
    } catch (error) {
      // ไม่ให้ logging error ทำให้ระบบล่ม
      console.error('Failed to save log entry:', error);
      return false;
    }
  }

  /**
   * ดึง logs จากฐานข้อมูลพร้อม filtering
   */
  async getLogs(options: LogQueryOptions = {}): Promise<LogQueryResult> {
    try {
      const {
        level = 'all',
        category = 'all', 
        search,
        limit = 100,
        offset = 0,
        startDate,
        endDate,
        userId
      } = options;

  const whereConditions: string[] = [];
  const queryParams: any[] = [];
      let paramIndex = 1;

      // Filter by level
      if (level && level !== 'all') {
        whereConditions.push(`level = $${paramIndex}`);
        queryParams.push(level);
        paramIndex++;
      }

      // Filter by category
      if (category && category !== 'all') {
        whereConditions.push(`category = $${paramIndex}`);
        queryParams.push(category);
        paramIndex++;
      }

      // Filter by user
      if (userId) {
        whereConditions.push(`user_id = $${paramIndex}`);
        queryParams.push(userId);
        paramIndex++;
      }

      // Filter by date range
      if (startDate) {
        whereConditions.push(`created_at >= $${paramIndex}`);
        queryParams.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        whereConditions.push(`created_at <= $${paramIndex}`);
        queryParams.push(endDate);
        paramIndex++;
      }

      // Full-text search
      if (search) {
        whereConditions.push(`(
          message ILIKE $${paramIndex} OR 
          category ILIKE $${paramIndex} OR 
          source ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM system_logs 
        ${whereClause}
      `;

      const countResult = await this.pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated results
      const dataQuery = `
        SELECT 
          id,
          timestamp,
          level,
          category,
          message,
          details,
          source,
          user_id as "userId",
          user_email as "userEmail",
          ip_address as "ipAddress", 
          user_agent as "userAgent",
          session_id as "sessionId",
          created_at as "createdAt"
        FROM system_logs
        ${whereClause}
        ORDER BY created_at DESC, id DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);
      const dataResult = await this.pool.query(dataQuery, queryParams);

      const logs: LogEntry[] = dataResult.rows.map(row => {
        let details = null;
        if (row.details) {
          try {
            details = typeof row.details === 'string' ? JSON.parse(row.details) : row.details;
          } catch (error) {
            console.warn('Failed to parse log details:', error);
            details = row.details;
          }
        }
        
        return {
          ...row,
          details
        };
      });

      return {
        logs,
        total,
        hasMore: (offset + limit) < total
      };

    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return {
        logs: [],
        total: 0,
        hasMore: false
      };
    }
  }

  /**
   * ลบ logs เก่าที่เกินระยะเวลาที่กำหนด
   */
  async cleanupOldLogs(olderThanDays: number = 30): Promise<number> {
    try {
      const query = `
        DELETE FROM system_logs 
        WHERE created_at < NOW() - INTERVAL '${olderThanDays} days'
        RETURNING id
      `;

      const result = await this.pool.query(query);
      const deletedCount = result.rows.length;

      // Log the cleanup operation
      if (deletedCount > 0) {
        await this.addLog({
          level: 'info',
          category: 'System',
          message: `Cleaned up ${deletedCount} old log entries (older than ${olderThanDays} days)`,
          source: 'logging-service',
          details: { deletedCount, olderThanDays }
        });
      }

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      return 0;
    }
  }

  /**
   * เปิด/ปิดการทำงานของ logging service
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * ตรวจสอบสถานะการทำงานของ logging service
   */
  isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Helper methods สำหรับ log levels ต่างๆ
   */
  async info(category: string, message: string, details?: any, metadata?: Partial<LogEntry>): Promise<boolean> {
    return this.addLog({
      level: 'info',
      category,
      message,
      details,
      ...metadata
    });
  }

  async warn(category: string, message: string, details?: any, metadata?: Partial<LogEntry>): Promise<boolean> {
    return this.addLog({
      level: 'warn', 
      category,
      message,
      details,
      ...metadata
    });
  }

  async error(category: string, message: string, details?: any, metadata?: Partial<LogEntry>): Promise<boolean> {
    return this.addLog({
      level: 'error',
      category,
      message,
      details,
      ...metadata
    });
  }

  async debug(category: string, message: string, details?: any, metadata?: Partial<LogEntry>): Promise<boolean> {
    return this.addLog({
      level: 'debug',
      category,
      message,
      details,
      ...metadata
    });
  }

  async success(category: string, message: string, details?: any, metadata?: Partial<LogEntry>): Promise<boolean> {
    return this.addLog({
      level: 'success',
      category,
      message,
      details,
      ...metadata
    });
  }
}

// สร้าง singleton instance
export const logger = new LoggingService();

// Helper function สำหรับสร้าง metadata จาก request
export function createLogMetadata(request?: any, user?: any): Partial<LogEntry> {
  const metadata: Partial<LogEntry> = {};

  if (request) {
    // Extract IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip;
    if (ip) metadata.ipAddress = ip;

    // Extract user agent
    const userAgent = request.headers.get('user-agent');
    if (userAgent) metadata.userAgent = userAgent;

    // Extract session ID (if available)
    const sessionId = request.headers.get('x-session-id') || request.cookies?.get('session')?.value;
    if (sessionId) metadata.sessionId = sessionId;
  }

  if (user) {
    metadata.userId = user.id;
    metadata.userEmail = user.email;
  }

  return metadata;
}

export default LoggingService;
