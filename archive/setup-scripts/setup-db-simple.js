// Simple setup database script in JavaScript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🗄️ เริ่มต้นตั้งค่า database...');

    // Read SQL schema
    const schemaPath = path.join(__dirname, 'src', 'db', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📄 รัน SQL schema...');
    
    // รัน SQL แบบเดียวเลย แทนการแบ่ง statements
    try {
      await pool.query(schemaSQL);
      console.log('✅ รัน schema สำเร็จ');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('ℹ️ Schema บางส่วนมีอยู่แล้ว');
    }

    console.log('🎉 ตั้งค่า database สำเร็จ!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตั้งค่า database:', error);
    
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

setupDatabase();
