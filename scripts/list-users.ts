import { Pool } from 'pg';
import { dbConfig } from '../src/config/database';
import { formatDateTime, formatTimeAgo } from '../src/utils/date';

/**
 * TypeScript Script สำหรับแสดงรายชื่อ Users ในฐานข้อมูล
 * ใช้ config และ utils ที่จัดระเบียบแล้ว
 */

interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface UserStats {
  total: number;
  active: number;
  admin: number;
  managers: number;
  users: number;
  withLogin: number;
}

async function listUsersDetailed(): Promise<void> {
  const pool = new Pool(dbConfig);

  try {
    console.log('🔍 กำลังดึงรายชื่อผู้ใช้จากฐานข้อมูล...\n');

    // Query ข้อมูลผู้ใช้
    const result = await pool.query<User>(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        role,
        is_active,
        last_login,
        created_at,
        updated_at
      FROM users 
      ORDER BY 
        CASE role 
          WHEN 'admin' THEN 1 
          WHEN 'manager' THEN 2 
          WHEN 'user' THEN 3 
          ELSE 4 
        END,
        created_at ASC
    `);

    if (result.rows.length === 0) {
      console.log('❌ ไม่พบข้อมูลผู้ใช้ในระบบ');
      return;
    }

    const users = result.rows;
    
    // คำนวณสถิติ
    const stats: UserStats = {
      total: users.length,
      active: users.filter(user => user.is_active).length,
      admin: users.filter(user => user.role === 'admin').length,
      managers: users.filter(user => user.role === 'manager').length,
      users: users.filter(user => user.role === 'user').length,
      withLogin: users.filter(user => user.last_login).length,
    };

    // แสดงสถิติรวม
    displayStats(stats);
    
    // แสดงตารางผู้ใช้
    displayUsersTable(users);
    
    // แสดงการจัดกลุ่มตาม Role
    displayUsersByRole(users);
    
    // แสดงการวิเคราะห์เพิ่มเติม
    displayAnalytics(users);

    console.log('\n✅ แสดงข้อมูลเสร็จสิ้น!');

  } catch (error: any) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 ไม่สามารถเชื่อมต่อฐานข้อมูลได้ ตรวจสอบ PostgreSQL server');
      console.error('💡 หรือตรวจสอบ DATABASE_URL ใน .env');
    } else if (error.code === '42P01') {
      console.error('💡 ไม่พบตาราง users ให้รัน: npm run setup-db');
    } else if (error.code === '28P01') {
      console.error('💡 รหัสผ่านฐานข้อมูลไม่ถูกต้อง');
    }
  } finally {
    await pool.end();
  }
}

function displayStats(stats: UserStats): void {
  console.log('📊 สถิติผู้ใช้งาน:');
  console.log('┌─────────────────────────────────────┐');
  console.log(`│ จำนวนผู้ใช้ทั้งหมด: ${stats.total.toString().padStart(13)} คน │`);
  console.log(`│ ผู้ใช้ที่ Active:    ${stats.active.toString().padStart(13)} คน │`);
  console.log(`│ Admin:             ${stats.admin.toString().padStart(13)} คน │`);
  console.log(`│ Manager:           ${stats.managers.toString().padStart(13)} คน │`);
  console.log(`│ User:              ${stats.users.toString().padStart(13)} คน │`);
  console.log(`│ เคย Login แล้ว:     ${stats.withLogin.toString().padStart(13)} คน │`);
  console.log('└─────────────────────────────────────┘\n');
}

function displayUsersTable(users: User[]): void {
  console.log('👥 รายชื่อผู้ใช้ในระบบ:');
  console.log('━'.repeat(120));
  console.log('ID │ Email                      │ ชื่อ-นามสกุล              │ Role    │ Status │ Last Login');
  console.log('━'.repeat(120));

  users.forEach(user => {
    const fullName = getFullName(user);
    const lastLogin = user.last_login 
      ? formatTimeAgo(user.last_login)
      : 'ยังไม่เคย';
    
    const status = user.is_active ? '🟢 Active' : '🔴 Inactive';
    const roleIcon = getRoleIcon(user.role);
    
    console.log(
      `${user.id.toString().padEnd(2)} │ ${user.email.padEnd(26)} │ ${fullName.padEnd(24)} │ ${(roleIcon + user.role).padEnd(7)} │ ${status.padEnd(10)} │ ${lastLogin}`
    );
  });

  console.log('━'.repeat(120));
}

function displayUsersByRole(users: User[]): void {
  const roles = [...new Set(users.map(user => user.role))];
  
  console.log('\n📋 จัดกลุ่มตาม Role:');
  
  roles.forEach(role => {
    const usersInRole = users.filter(user => user.role === role);
    const activeCount = usersInRole.filter(user => user.is_active).length;
    const roleIcon = getRoleIcon(role);
    
    console.log(`\n${roleIcon} ${role.toUpperCase()} (${usersInRole.length} คน, Active: ${activeCount} คน):`);
    
    usersInRole.forEach(user => {
      const fullName = getFullName(user);
      const status = user.is_active ? '🟢' : '🔴';
      const lastLogin = user.last_login 
        ? `(Login: ${formatTimeAgo(user.last_login)})`
        : '(ยังไม่เคย login)';
      
      console.log(`   ${status} ${user.email} ${fullName ? `- ${fullName}` : ''} ${lastLogin}`);
    });
  });
}

function displayAnalytics(users: User[]): void {
  console.log('\n📈 การวิเคราะห์เพิ่มเติม:');
  
  // ผู้ใช้ที่ไม่ active
  const inactiveUsers = users.filter(user => !user.is_active);
  if (inactiveUsers.length > 0) {
    console.log(`\n⚠️  ผู้ใช้ที่ไม่ active (${inactiveUsers.length} คน):`);
    inactiveUsers.forEach(user => {
      const createdDate = formatDateTime(user.created_at);
      console.log(`   🔴 ${user.email} (สร้างเมื่อ: ${createdDate})`);
    });
  }

  // ผู้ใช้ที่ยังไม่เคย login
  const neverLoggedIn = users.filter(user => !user.last_login);
  if (neverLoggedIn.length > 0) {
    console.log(`\n🚫 ผู้ใช้ที่ยังไม่เคย login (${neverLoggedIn.length} คน):`);
    neverLoggedIn.forEach(user => {
      const createdDate = formatDateTime(user.created_at);
      console.log(`   ⭕ ${user.email} (สร้างเมื่อ: ${createdDate})`);
    });
  }

  // ผู้ใช้ที่ login ล่าสุด
  const recentUsers = users
    .filter(user => user.last_login)
    .sort((a, b) => new Date(b.last_login!).getTime() - new Date(a.last_login!).getTime())
    .slice(0, 5);

  if (recentUsers.length > 0) {
    console.log(`\n🕒 ผู้ใช้ที่ login ล่าสุด (5 คนแรก):`);
    recentUsers.forEach((user, index) => {
      const lastLogin = formatDateTime(user.last_login!);
      const timeAgo = formatTimeAgo(user.last_login!);
      console.log(`   ${index + 1}. ${user.email} - ${lastLogin} (${timeAgo})`);
    });
  }
}

function getFullName(user: User): string {
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return fullName || 'ไม่ระบุชื่อ';
}

function getRoleIcon(role: string): string {
  switch (role) {
    case 'admin': return '👑 ';
    case 'manager': return '👨‍💼 ';
    case 'user': return '👤 ';
    default: return '❓ ';
  }
}

// เรียกใช้ฟังก์ชัน
if (require.main === module) {
  listUsersDetailed().catch(console.error);
}

export { listUsersDetailed };
