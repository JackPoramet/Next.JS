const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

/**
 * Script สำหรับแสดงรายชื่อ Users ในฐานข้อมูล
 */

async function listUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔍 กำลังดึงรายชื่อผู้ใช้จากฐานข้อมูล...\n');

    // Query ข้อมูลผู้ใช้
    const result = await pool.query(`
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
      ORDER BY created_at ASC
    `);

    if (result.rows.length === 0) {
      console.log('❌ ไม่พบข้อมูลผู้ใช้ในระบบ');
      return;
    }

    // แสดงสถิติรวม
    const totalUsers = result.rows.length;
    const activeUsers = result.rows.filter(user => user.is_active).length;
    const adminUsers = result.rows.filter(user => user.role === 'admin').length;
    const usersWithLogin = result.rows.filter(user => user.last_login).length;

    console.log('📊 สถิติผู้ใช้งาน:');
    console.log(`   ◦ จำนวนผู้ใช้ทั้งหมด: ${totalUsers} คน`);
    console.log(`   ◦ ผู้ใช้ที่ Active: ${activeUsers} คน`);
    console.log(`   ◦ ผู้ดูแลระบบ (Admin): ${adminUsers} คน`);
    console.log(`   ◦ เคย Login แล้ว: ${usersWithLogin} คน\n`);

    // แสดงรายชื่อผู้ใช้
    console.log('👥 รายชื่อผู้ใช้ในระบบ:');
    console.log('━'.repeat(100));
    console.log('ID │ Email                    │ ชื่อ-นามสกุล        │ Role    │ Active │ Last Login');
    console.log('━'.repeat(100));

    result.rows.forEach(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'ไม่ระบุ';
      const lastLogin = user.last_login 
        ? new Date(user.last_login).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'ยังไม่เคย';
      
      const status = user.is_active ? '✅' : '❌';
      
      console.log(
        `${user.id.toString().padEnd(2)} │ ${user.email.padEnd(24)} │ ${fullName.padEnd(18)} │ ${user.role.padEnd(7)} │ ${status.padEnd(6)} │ ${lastLogin}`
      );
    });

    console.log('━'.repeat(100));

    // แสดงข้อมูลผู้ใช้แต่ละ Role
    const roles = [...new Set(result.rows.map(user => user.role))];
    console.log('\n📋 จัดกลุ่มตาม Role:');
    
    roles.forEach(role => {
      const usersInRole = result.rows.filter(user => user.role === role);
      console.log(`\n🏷️  ${role.toUpperCase()} (${usersInRole.length} คน):`);
      usersInRole.forEach(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        const status = user.is_active ? '🟢' : '🔴';
        console.log(`   ${status} ${user.email} ${fullName ? `(${fullName})` : ''}`);
      });
    });

    // แสดงผู้ใช้ที่ไม่ active
    const inactiveUsers = result.rows.filter(user => !user.is_active);
    if (inactiveUsers.length > 0) {
      console.log(`\n⚠️  ผู้ใช้ที่ไม่ active (${inactiveUsers.length} คน):`);
      inactiveUsers.forEach(user => {
        console.log(`   🔴 ${user.email}`);
      });
    }

    // แสดงผู้ใช้ที่ยังไม่เคย login
    const neverLoggedIn = result.rows.filter(user => !user.last_login);
    if (neverLoggedIn.length > 0) {
      console.log(`\n🚫 ผู้ใช้ที่ยังไม่เคย login (${neverLoggedIn.length} คน):`);
      neverLoggedIn.forEach(user => {
        console.log(`   ⭕ ${user.email}`);
      });
    }

    console.log('\n✅ แสดงข้อมูลเสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 ไม่สามารถเชื่อมต่อฐานข้อมูลได้ ตรวจสอบ PostgreSQL server');
    } else if (error.code === '42P01') {
      console.error('💡 ไม่พบตาราง users ให้รัน: npm run setup-db');
    }
  } finally {
    await pool.end();
  }
}

// เรียกใช้ฟังก์ชัน
if (require.main === module) {
  listUsers();
}

module.exports = { listUsers };
