import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set ✅' : 'Missing ❌',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set ✅' : 'Missing ❌',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set ✅' : 'Missing ❌',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Missing ❌',
    // Show first few characters for debugging
    DATABASE_URL_PREVIEW: process.env.DATABASE_URL?.substring(0, 20) + '...',
    JWT_SECRET_PREVIEW: process.env.JWT_SECRET?.substring(0, 10) + '...'
  };

  return NextResponse.json({
    success: true,
    message: 'Environment check',
    environment: envVars,
    timestamp: new Date().toISOString()
  });
}
