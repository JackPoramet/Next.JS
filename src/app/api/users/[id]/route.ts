import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/users/[id] - Get single user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    console.log('[DEBUG] Users API - Getting user:', id);

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
        WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      const user = result.rows[0];

      return NextResponse.json({
        success: true,
        message: 'User retrieved successfully',
        data: {
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
          lastLogin: user.last_login
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[ERROR] Users API - Error getting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, email, role, status, password } = body;

    console.log('[DEBUG] Users API - Updating user:', id, { name, email, role, status });

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [id]
      );

      if (existingUser.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Check if email is already taken by another user
      const emailCheck = await client.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Email is already taken by another user' },
          { status: 409 }
        );
      }

      // Parse name into first_name and last_name
      const nameParts = name ? name.trim().split(' ') : [];
      const firstName = nameParts[0] || null;
      const lastName = nameParts.slice(1).join(' ') || null;
      const isActive = status === 'Active';

      let updateQuery = `
        UPDATE users 
        SET email = $1, first_name = $2, last_name = $3, role = $4, is_active = $5, updated_at = NOW()
      `;
      let queryParams = [email, firstName, lastName, role, isActive];

      // If password is provided, hash it and include in update
      if (password && password.trim()) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        updateQuery += `, password_hash = $6`;
        queryParams.push(hashedPassword);
        updateQuery += ` WHERE id = $7 RETURNING *`;
        queryParams.push(id);
      } else {
        updateQuery += ` WHERE id = $6 RETURNING *`;
        queryParams.push(id);
      }

      const result = await client.query(updateQuery, queryParams);
      const updatedUser = result.rows[0];

      console.log('[DEBUG] Users API - User updated successfully:', updatedUser.id);

      return NextResponse.json({
        success: true,
        message: 'User updated successfully',
        data: {
          id: updatedUser.id,
          name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim() || updatedUser.email,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          role: updatedUser.role,
          status: updatedUser.is_active ? 'Active' : 'Inactive',
          isActive: updatedUser.is_active,
          updatedAt: updatedUser.updated_at
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[ERROR] Users API - Error updating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    console.log('[DEBUG] Users API - Deleting user:', id);

    const client = await pool.connect();
    
    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id, email FROM users WHERE id = $1',
        [id]
      );

      if (existingUser.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Delete the user
      await client.query('DELETE FROM users WHERE id = $1', [id]);

      console.log('[DEBUG] Users API - User deleted successfully:', id);

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[ERROR] Users API - Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
