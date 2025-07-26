// Script สำหรับลบทุก table ใน PostgreSQL
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function dropAllTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🗑️ เริ่มต้นลบทุก table...');

    // ดูรายชื่อ table ทั้งหมดก่อน
    console.log('📋 กำลังตรวจสอบ table ที่มีอยู่...');
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    const tables = tablesResult.rows;
    
    if (tables.length === 0) {
      console.log('ℹ️ ไม่พบ table ใดๆ ใน database');
      return;
    }

    console.log('📦 พบ table ต่อไปนี้:');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tablename}`);
    });

    // ลบทุก table
    console.log('\n🗑️ กำลังลบ table ทั้งหมด...');
    
    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table.tablename} CASCADE`);
        console.log(`✅ ลบ table "${table.tablename}" สำเร็จ`);
      } catch (error) {
        console.error(`❌ ไม่สามารถลบ table "${table.tablename}":`, error.message);
      }
    }

    // ลบ functions และ triggers ที่อาจเหลืออยู่
    console.log('\n🧹 กำลังลบ functions และ triggers...');
    try {
      await pool.query(`DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`);
      console.log('✅ ลบ functions สำเร็จ');
    } catch (error) {
      console.log('ℹ️ ไม่มี functions ที่ต้องลบ');
    }

    // ตรวจสอบว่าลบหมดแล้วหรือไม่
    const remainingTablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    if (remainingTablesResult.rows.length === 0) {
      console.log('\n🎉 ลบทุก table สำเร็จแล้ว! Database ว่างเปล่าแล้ว');
    } else {
      console.log('\n⚠️ ยังมี table เหลืออยู่:');
      remainingTablesResult.rows.forEach((table) => {
        console.log(`   - ${table.tablename}`);
      });
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการลบ table:', error);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 ไม่สามารถเชื่อมต่อ PostgreSQL ได้');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 การ authentication ล้มเหลว');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// เพิ่มการยืนยันก่อนลบ
function askForConfirmation() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('⚠️ คุณแน่ใจหรือไม่ที่จะลบทุก table? ข้อมูลทั้งหมดจะหายไป! (พิมพ์ "YES" เพื่อยืนยัน): ', (answer) => {
      rl.close();
      resolve(answer === 'YES');
    });
  });
}

async function main() {
  console.log('🚨 DANGER ZONE: กำลังจะลบทุก table ใน database!');
  console.log('📍 Database:', process.env.DATABASE_URL?.split('@')[1] || 'ไม่ระบุ');
  
  const confirmed = await askForConfirmation();
  
  if (confirmed) {
    await dropAllTables();
  } else {
    console.log('❌ ยกเลิกการลบ table');
  }
}

// รัน script ถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { dropAllTables };
