import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';

/**
 * @swagger
 * /api/test-db:
 *   get:
 *     summary: Test database connection
 *     description: Test PostgreSQL database connection and return connection details
 *     tags:
 *       - System Health
 *     responses:
 *       200:
 *         description: Database connection test results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Database connection successful"
 *                 details:
 *                   type: object
 *       500:
 *         description: Database connection failed
 */
export async function GET() {
  try {
    console.log('API test-db called - testing database connection');
    
    const connectionTest = await testConnection();
    
    if (connectionTest.success) {
      return NextResponse.json({
        success: true,
        message: connectionTest.message,
        data: connectionTest.details,
        timestamp: new Date().toISOString()
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: connectionTest.message,
        error: connectionTest.details,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in test-db API:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        connectionString: process.env.DATABASE_URL ? 'Configured' : 'Missing',
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
