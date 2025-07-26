// Script สำหรับตรวจสอบการเชื่อมต่อ database
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env' });

async function checkDatabaseConnection() {
  console.log('🔍 กำลังตรวจสอบการเชื่อมต่อ database...');
  console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@') || 'ไม่พบ DATABASE_URL');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // ทดสอบการเชื่อมต่อ
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ เชื่อมต่อ database สำเร็จ!');
    console.log('⏰ เวลาปัจจุบันใน database:', result.rows[0].current_time);
    console.log('🗄️ PostgreSQL Version:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);

    // ตรวจสอบ database name
    const dbResult = await pool.query('SELECT current_database() as db_name');
    console.log('📊 Database Name:', dbResult.rows[0].db_name);

    // ตรวจสอบ tables ที่มีอยู่
    const tablesResult = await pool.query(`
      SELECT tablename, schemaname 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    if (tablesResult.rows.length > 0) {
      console.log('📋 Tables ที่พบใน database:');
      tablesResult.rows.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.tablename}`);
      });

      // ตรวจสอบ table users
      const usersResult = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);

      if (usersResult.rows.length > 0) {
        console.log('👤 Structure ของ table users:');
        usersResult.rows.forEach((col) => {
          console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
        });

        // นับจำนวน users
        const countResult = await pool.query('SELECT COUNT(*) as user_count FROM users');
        console.log(`👥 จำนวน users ในระบบ: ${countResult.rows[0].user_count} คน`);
      }
    } else {
      console.log('📋 ไม่พบ table ใดๆ ใน database');
      console.log('💡 คุณอาจต้องรัน: npm run setup-db');
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ database:');
    console.error('   Message:', error.message);
    
    if (error.code) {
      console.error('   Error Code:', error.code);
    }

    // แนะนำการแก้ไข
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 การแก้ไข:');
      console.error('   1. ตรวจสอบว่า PostgreSQL service เปิดอยู่');
      console.error('   2. ตรวจสอบ host และ port ใน DATABASE_URL');
      console.error('   3. ตรวจสอบ firewall settings');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 การแก้ไข:');
      console.error('   1. ตรวจสอบ username และ password ใน DATABASE_URL');
      console.error('   2. ตรวจสอบสิทธิ์การเข้าถึง database');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n💡 การแก้ไข:');
      console.error('   1. สร้าง database ใหม่');
      console.error('   2. ตรวจสอบชื่อ database ใน DATABASE_URL');
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 การแก้ไข:');
      console.error('   1. ตรวจสอบ network connection');
      console.error('   2. ตรวจสอบว่า database server ตอบสนอง');
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// แสดงข้อมูล environment
console.log('🌍 Environment Information:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('   Platform:', process.platform);
console.log('   Node Version:', process.version);
console.log('');

checkDatabaseConnection();
