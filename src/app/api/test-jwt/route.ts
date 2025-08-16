import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ทดสอบ JWT creation
    const jwt = await import('jsonwebtoken');
    
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return NextResponse.json({
        success: false,
        message: 'JWT_SECRET is missing',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    if (jwtSecret.length < 32) {
      return NextResponse.json({
        success: false,
        message: `JWT_SECRET too short (${jwtSecret.length} chars, need min 32)`,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // ทดสอบสร้าง JWT token
    const testToken = jwt.sign(
      { test: true, timestamp: Date.now() },
      jwtSecret,
      { expiresIn: '1h' }
    );
    
    // ทดสอบ verify token
    const decoded = jwt.verify(testToken, jwtSecret);
    
    return NextResponse.json({
      success: true,
      message: 'JWT test successful',
      data: {
        jwtSecretLength: jwtSecret.length,
        tokenCreated: !!testToken,
        tokenVerified: !!decoded,
        tokenPreview: testToken.substring(0, 20) + '...'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('JWT test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'JWT test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
