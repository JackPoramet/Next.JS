import { NextResponse } from 'next/server';
import swaggerSpec from '@/lib/swagger';

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: Get Swagger/OpenAPI specification
 *     description: Returns the OpenAPI 3.0 specification for the IoT Energy Management API
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: OpenAPI 3.0 specification
 */
export async function GET() {
  try {
    return NextResponse.json(swaggerSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating Swagger spec:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate API documentation',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
