import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ตรวจสอบ environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      
      // แสดงส่วนต้นของ DATABASE_URL เพื่อ debug (ปลอดภัย)
      databasePreview: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.substring(0, 15) + '...' : 'Missing',
      
      // แสดงความยาวของ JWT_SECRET
      jwtSecretLength: process.env.JWT_SECRET ? 
        `${process.env.JWT_SECRET.length} characters` : 'Missing'
    };

    return NextResponse.json({
      success: true,
      message: 'Environment check completed',
      environment: envCheck,
      timestamp: new Date().toISOString(),
      host: process.env.VERCEL_URL || 'localhost'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
