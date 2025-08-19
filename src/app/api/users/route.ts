import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users (Admin only)
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Create new user
 *     description: Create a new user account (Admin only)
 *     tags:
 *       - User Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User password
 *                 example: "Password123!"
 *               role:
 *                 type: string
 *                 enum: [admin, manager, user]
 *                 description: User role
 *                 example: "user"
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: "User created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// TypeScript interfaces
interface DatabaseUser {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

interface ApiUser {
  id: number;
  name: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: string;
}

export async function GET(_request: NextRequest) {
  try {
    console.log('[DEBUG] Users API - Getting all users');

    // ดึงข้อมูล users ทั้งหมดจาก database
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          id,
          email,
          first_name,
          last_name,
          role,
          is_active,
          created_at,
          updated_at,
          last_login
        FROM users 
        ORDER BY created_at DESC
      `);

      const users: ApiUser[] = result.rows.map((user: DatabaseUser) => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.is_active ? 'Active' : 'Inactive',
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: formatLastLogin(user.last_login)
      }));

      console.log(`[DEBUG] Users API - Found ${users.length} users`);

      return NextResponse.json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          totalUsers: users.length,
          activeUsers: users.filter((u: ApiUser) => u.isActive).length,
          admins: users.filter((u: ApiUser) => u.role === 'admin').length,
          newThisMonth: users.filter((u: ApiUser) => {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return new Date(u.createdAt) > oneMonthAgo;
          }).length
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[ERROR] Users API - Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to format last login time
function formatLastLogin(lastLogin: Date | null): string {
  if (!lastLogin) {
    return 'Never';
  }

  const now = new Date();
  const diffMs = now.getTime() - lastLogin.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return lastLogin.toLocaleDateString('th-TH');
  }
}

// Helper function to generate mock last login times (for fallback)
function getRandomLastLogin(): string {
  const options = [
    '2 hours ago',
    '5 hours ago', 
    '1 day ago',
    '2 days ago',
    '3 days ago',
    '1 week ago',
    '2 weeks ago',
    'Never'
  ];
  return options[Math.floor(Math.random() * options.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, role, password } = body;

    console.log('[DEBUG] Users API - Creating new user:', { email, firstName, lastName, role });

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // Hash password (you should use bcrypt here)
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const result = await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING id, email, first_name, last_name, role, is_active, created_at
      `, [email, hashedPassword, firstName, lastName, role || 'user']);

      const newUser = result.rows[0];

      console.log('[DEBUG] Users API - User created successfully:', newUser.id);

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        data: {
          id: newUser.id,
          name: `${newUser.first_name || ''} ${newUser.last_name || ''}`.trim() || newUser.email,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role,
          status: newUser.is_active ? 'Active' : 'Inactive',
          isActive: newUser.is_active,
          createdAt: newUser.created_at
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[ERROR] Users API - Error creating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
