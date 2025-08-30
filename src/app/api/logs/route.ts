import { NextRequest, NextResponse } from 'next/server';
import { logger, LogQueryOptions, createLogMetadata } from '@/lib/logging-service';

// ประเภทของ log levels
type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

// Interface สำหรับ log entry
interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: any;
  source?: string;
  userId?: number;
  userEmail?: string;
}

// GET /api/logs - ดึงข้อมูล logs จากฐานข้อมูล
export async function GET(request: NextRequest) {
  try {
    // ดึง query parameters
    const { searchParams } = new URL(request.url);
    const queryOptions: LogQueryOptions = {
      level: (searchParams.get('level') as LogLevel) || 'all',
      category: searchParams.get('category') || 'all',
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '100'),
      offset: parseInt(searchParams.get('offset') || '0'),
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    // ดึงข้อมูลจากฐานข้อมูล
    const result = await logger.getLogs(queryOptions);

    // Log การเข้าถึง API
    await logger.info('API', 'Logs API accessed', {
      queryOptions,
      resultCount: result.logs.length
    }, createLogMetadata(request));

    return NextResponse.json({
      success: true,
      message: 'Logs retrieved successfully',
      data: result
    });

  } catch (error) {
    // Log error
    await logger.error('API', 'Failed to fetch logs from database', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, createLogMetadata(request));

    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/logs - เพิ่ม log entry ใหม่ลงฐานข้อมูล
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, category, message, details, source } = body;

    // Validate required fields
    if (!level || !category || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: level, category, message' },
        { status: 400 }
      );
    }

    // สร้าง metadata จาก request
    const metadata = createLogMetadata(request);

    // บันทึกลงฐานข้อมูล
    const success = await logger.addLog({
      level,
      category,
      message,
      details,
      source,
      ...metadata
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Log entry created successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to create log entry' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating log entry:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
