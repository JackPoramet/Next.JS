import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set ✅' : 'Missing ❌',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set ✅' : 'Missing ❌',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set ✅' : 'Missing ❌',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Missing ❌',
    };

    return NextResponse.json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
