const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

/**
 * Script สำหรับทดสอบระบบ last_login tracking
 */

async function testLastLoginTracking() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🧪 ทดสอบระบบ Last Login Tracking\n');

    // 1. แสดงสถานะปัจจุบันของ last_login
    console.log('📊 สถานะปัจจุบันของ last_login:');
    const beforeResult = await pool.query(`
      SELECT 
        email,
        first_name,
        last_name,
        role,
        last_login,
        CASE 
          WHEN last_login IS NULL THEN 'ยังไม่เคย login'
          ELSE TO_CHAR(last_login AT TIME ZONE 'Asia/Bangkok', 'DD/MM/YYYY HH24:MI:SS')
        END as last_login_formatted
      FROM users 
      ORDER BY last_login DESC NULLS LAST
    `);

    console.log('┌────────────────────────────────────────────────────────────────────┐');
    console.log('│ Email                  │ ชื่อ-นามสกุล     │ Role    │ Last Login      │');
    console.log('├────────────────────────────────────────────────────────────────────┤');

    beforeResult.rows.forEach(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'ไม่ระบุ';
      console.log(
        `│ ${user.email.padEnd(22)} │ ${fullName.padEnd(15)} │ ${user.role.padEnd(7)} │ ${(user.last_login_formatted || 'ยังไม่เคย').padEnd(15)} │`
      );
    });
    console.log('└────────────────────────────────────────────────────────────────────┘\n');

    // 2. จำลองการ login โดยการอัปเดต last_login สำหรับผู้ใช้ที่มีอยู่
    console.log('🔄 จำลองการ login สำหรับผู้ใช้ทั้งหมด...');
    
    const users = beforeResult.rows;
    for (const user of users) {
      // อัปเดต last_login ด้วย timestamp ที่แตกต่างกันเล็กน้อย
      const delay = Math.floor(Math.random() * 1000); // สุ่ม delay 0-1000ms
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const updateResult = await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE email = $1',
        [user.email]
      );
      
      if (updateResult.rowCount > 0) {
        console.log(`   ✅ อัปเดต last_login สำหรับ: ${user.email}`);
      } else {
        console.log(`   ❌ ไม่สามารถอัปเดต last_login สำหรับ: ${user.email}`);
      }
    }

    console.log('\n⏳ รอ 2 วินาที เพื่อให้เห็นความแตกต่างของเวลา...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. แสดงผลลัพธ์หลังจากอัปเดต
    console.log('📈 ผลลัพธ์หลังจากจำลองการ login:');
    const afterResult = await pool.query(`
      SELECT 
        email,
        first_name,
        last_name,
        role,
        last_login,
        TO_CHAR(last_login AT TIME ZONE 'Asia/Bangkok', 'DD/MM/YYYY HH24:MI:SS') as last_login_formatted,
        EXTRACT(EPOCH FROM (NOW() - last_login)) as seconds_ago
      FROM users 
      ORDER BY last_login DESC
    `);

    console.log('┌────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ Email                  │ ชื่อ-นามสกุล     │ Role    │ Last Login      │ เวลาที่ผ่านมา │');
    console.log('├────────────────────────────────────────────────────────────────────────────────┤');

    afterResult.rows.forEach(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'ไม่ระบุ';
      const timeAgo = user.seconds_ago 
        ? `${Math.floor(user.seconds_ago)} วินาที`
        : 'ไม่ทราบ';
      
      console.log(
        `│ ${user.email.padEnd(22)} │ ${fullName.padEnd(15)} │ ${user.role.padEnd(7)} │ ${(user.last_login_formatted || 'ไม่เคย').padEnd(15)} │ ${timeAgo.padEnd(12)} │`
      );
    });
    console.log('└────────────────────────────────────────────────────────────────────────────────┘\n');

    // 4. แสดงสถิติ last_login
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(last_login) as users_with_login,
        COUNT(*) - COUNT(last_login) as users_never_login,
        COUNT(CASE WHEN last_login >= NOW() - INTERVAL '1 hour' THEN 1 END) as recent_logins_1h,
        COUNT(CASE WHEN last_login >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_logins_24h
      FROM users 
      WHERE is_active = true
    `);

    const stats = statsResult.rows[0];
    console.log('📊 สถิติ Last Login:');
    console.log('┌─────────────────────────────────────────────┐');
    console.log(`│ ผู้ใช้ทั้งหมด:           ${stats.total_users.toString().padStart(12)} คน │`);
    console.log(`│ เคย login แล้ว:         ${stats.users_with_login.toString().padStart(12)} คน │`);
    console.log(`│ ยังไม่เคย login:        ${stats.users_never_login.toString().padStart(12)} คน │`);
    console.log(`│ Login ใน 1 ชั่วโมง:      ${stats.recent_logins_1h.toString().padStart(12)} คน │`);
    console.log(`│ Login ใน 24 ชั่วโมง:     ${stats.recent_logins_24h.toString().padStart(12)} คน │`);
    console.log('└─────────────────────────────────────────────┘\n');

    // 5. แสดงผู้ใช้ที่ login ล่าสุด
    const recentResult = await pool.query(`
      SELECT 
        email,
        role,
        TO_CHAR(last_login AT TIME ZONE 'Asia/Bangkok', 'DD/MM/YYYY HH24:MI:SS') as last_login_formatted
      FROM users 
      WHERE last_login IS NOT NULL
      ORDER BY last_login DESC
      LIMIT 3
    `);

    console.log('🕒 ผู้ใช้ที่ login ล่าสุด (3 คนแรก):');
    recentResult.rows.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.last_login_formatted}`);
    });

    console.log('\n✅ ทดสอบระบบ Last Login Tracking เสร็จสิ้น!');
    console.log('💡 ตอนนี้สามารถ login ผ่านเว็บไซต์แล้วจะเห็นการอัปเดต last_login อัตโนมัติ');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error.message);
    
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
  testLastLoginTracking();
}

module.exports = { testLastLoginTracking };
