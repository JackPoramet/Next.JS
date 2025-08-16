import pool from './database';

/**
 * Helper functions สำหรับจัดการ User authentication
 */

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * ค้นหาผู้ใช้จาก email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

/**
 * อัปเดต last_login timestamp สำหรับผู้ใช้
 */
export async function updateLastLogin(userId: number): Promise<void> {
  try {
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
    
    console.log(`[DEBUG] Updated last_login for user ID: ${userId}`);
  } catch (error) {
    console.error('Error updating last_login:', error);
    throw error;
  }
}

/**
 * อัปเดต last_login โดยใช้ email
 */
export async function updateLastLoginByEmail(email: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE email = $1 AND is_active = true',
      [email]
    );
    
    const updated = (result.rowCount || 0) > 0;
    console.log(`[DEBUG] Updated last_login for email: ${email}, success: ${updated}`);
    
    return updated;
  } catch (error) {
    console.error('Error updating last_login by email:', error);
    throw error;
  }
}

/**
 * ตรวจสอบและอัปเดต last_login ด้วย helper function
 */
export async function authenticateAndUpdateLogin(email: string, password: string): Promise<{
  success: boolean;
  user?: Omit<User, 'password_hash'>;
  message?: string;
}> {
  const bcrypt = await import('bcryptjs');
  
  try {
    // ค้นหาผู้ใช้
    const user = await findUserByEmail(email);
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // ตรวจสอบสถานะ active
    if (!user.is_active) {
      return { success: false, message: 'Account is inactive' };
    }
    
    // ตรวจสอบรหัสผ่าน
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // อัปเดต last_login
    await updateLastLogin(user.id);
    
    // ส่งข้อมูลผู้ใช้กลับ (ไม่รวม password_hash)
    const { password_hash, ...userWithoutPassword } = user;
    
    return { 
      success: true, 
      user: userWithoutPassword,
      message: 'Authentication successful'
    };
    
  } catch (error) {
    console.error('Error in authenticateAndUpdateLogin:', error);
    return { success: false, message: 'Internal server error' };
  }
}

/**
 * ดึงข้อมูลผู้ใช้ที่ login ล่าสุด
 */
export async function getRecentlyLoggedInUsers(limit: number = 10): Promise<User[]> {
  try {
    const result = await pool.query(
      `SELECT * FROM users 
       WHERE last_login IS NOT NULL 
       ORDER BY last_login DESC 
       LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting recently logged in users:', error);
    throw error;
  }
}

/**
 * ดึงสถิติการ login
 */
export async function getLoginStats(): Promise<{
  totalUsers: number;
  usersWithLogin: number;
  usersNeverLoggedIn: number;
  recentLogins: number; // login ในช่วง 24 ชั่วโมงที่ผ่านมา
}> {
  try {
    const [totalResult, loginResult, recentResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
      pool.query('SELECT COUNT(*) as count FROM users WHERE last_login IS NOT NULL AND is_active = true'),
      pool.query('SELECT COUNT(*) as count FROM users WHERE last_login >= NOW() - INTERVAL \'24 hours\' AND is_active = true')
    ]);
    
    const totalUsers = parseInt(totalResult.rows[0].count);
    const usersWithLogin = parseInt(loginResult.rows[0].count);
    const recentLogins = parseInt(recentResult.rows[0].count);
    
    return {
      totalUsers,
      usersWithLogin,
      usersNeverLoggedIn: totalUsers - usersWithLogin,
      recentLogins
    };
  } catch (error) {
    console.error('Error getting login stats:', error);
    throw error;
  }
}
