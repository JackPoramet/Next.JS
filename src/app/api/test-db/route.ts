import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ไม่ import pool ตรงนี้เพื่อหลีกเลี่ยง connection error
    const { Pool } = await import('pg');
    
    // สร้าง pool ใหม่เพื่อทดสอบ
    const testPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 1, // ใช้ connection เดียวสำหรับการทดสอบ
      connectionTimeoutMillis: 5000, // timeout 5 วินาที
    });

    console.log('Testing database connection...');
    
    // ทดสอบการเชื่อมต่อ
    const client = await testPool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    client.release();
    
    // ปิด pool
    await testPool.end();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        currentTime: result.rows[0].current_time,
        version: result.rows[0].version.substring(0, 50) + '...',
        connectionString: process.env.DATABASE_URL ? 'Configured ✅' : 'Missing ❌'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        connectionString: process.env.DATABASE_URL ? 'Configured' : 'Missing',
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
