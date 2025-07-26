import { query } from '@/lib/database';
import { hashPassword, comparePassword } from '@/lib/auth';

// Interface สำหรับ User
export interface User {
  id: number;
  email: string;
  password_hash?: string; // Optional เพราะไม่ควรส่งออกไป
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Interface สำหรับการสร้าง User ใหม่
export interface CreateUserData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

// Interface สำหรับ Login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Class สำหรับจัดการ User operations
export class UserModel {
  /**
   * ค้นหา user จาก email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0] as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * ค้นหา user จาก ID
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const result = await query(
        'SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE id = $1 AND is_active = true',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0] as User;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * สร้าง user ใหม่
   */
  static async create(userData: CreateUserData): Promise<User> {
    try {
      // ตรวจสอบว่า email ซ้ำหรือไม่
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // บันทึกลง database
      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`,
        [
          userData.email,
          hashedPassword,
          userData.first_name || null,
          userData.last_name || null,
          userData.role || 'user'
        ]
      );

      return result.rows[0] as User;
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  /**
   * ตรวจสอบ login credentials
   */
  static async authenticate(credentials: LoginCredentials): Promise<User | null> {
    try {
      // ค้นหา user (รวม password_hash)
      const result = await query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [credentials.email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0] as User;

      // ตรวจสอบ password
      const isValidPassword = await comparePassword(credentials.password, user.password_hash!);
      
      if (!isValidPassword) {
        return null;
      }

      // ลบ password_hash ออกก่อนส่งกลับ
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * อัพเดต user profile
   */
  static async updateProfile(id: number, updateData: Partial<CreateUserData>): Promise<User | null> {
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // สร้าง dynamic query
      if (updateData.first_name !== undefined) {
        updateFields.push(`first_name = $${paramIndex++}`);
        updateValues.push(updateData.first_name);
      }

      if (updateData.last_name !== undefined) {
        updateFields.push(`last_name = $${paramIndex++}`);
        updateValues.push(updateData.last_name);
      }

      if (updateData.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        updateValues.push(updateData.email);
      }

      if (updateData.password !== undefined) {
        const hashedPassword = await hashPassword(updateData.password);
        updateFields.push(`password_hash = $${paramIndex++}`);
        updateValues.push(hashedPassword);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateValues.push(id);

      const result = await query(
        `UPDATE users 
         SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex} AND is_active = true
         RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`,
        updateValues
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0] as User;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * ดึงรายการ users ทั้งหมด (สำหรับ admin)
   */
  static async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      // ดึงจำนวนทั้งหมด
      const countResult = await query('SELECT COUNT(*) FROM users WHERE is_active = true');
      const total = parseInt(countResult.rows[0].count);

      // ดึงข้อมูล users
      const result = await query(
        `SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at
         FROM users 
         WHERE is_active = true
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return {
        users: result.rows as User[],
        total
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  /**
   * ลบ user (soft delete)
   */
  static async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await query(
        'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );

      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }
}
