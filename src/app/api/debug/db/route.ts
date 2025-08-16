import { NextResponse } from 'next/server';
import pool from '@/lib/database';

export async function GET() {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      data: {
        currentTime: result.rows[0].current_time,
        postgresVersion: result.rows[0].postgres_version,
        connectionString: process.env.DATABASE_URL ? 'Configured' : 'Missing'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      connectionString: process.env.DATABASE_URL ? 'Configured' : 'Missing'
    }, { status: 500 });
  }
}
