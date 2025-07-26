// Script สำหรับลบทุก table แบบไม่ต้องยืนยัน (ใช้ระวัง!)
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function forceDropAllTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🗑️ กำลังลบทุก table โดยไม่ต้องยืนยัน...');

    // ลบทุก table ในครั้งเดียว
    await pool.query(`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `);

    // ลบ functions
    await pool.query(`DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`);

    console.log('✅ ลบทุก table และ function สำเร็จ');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

forceDropAllTables();
