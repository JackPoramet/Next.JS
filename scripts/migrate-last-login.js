#!/usr/bin/env node

/**
 * Database Migration Script: เพิ่ม last_login column
 * รันด้วย: npm run migrate:last-login
 */

const { Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();

  try {
    console.log('🚀 Starting migration: Add last_login column to users table');

    // ตรวจสอบว่า column last_login มีอยู่แล้วหรือไม่
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'last_login'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✅ Column last_login already exists in users table');
      return;
    }

    // เพิ่ม column last_login
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL
    `);

    console.log('✅ Added last_login column to users table');

    // เพิ่ม comment
    await client.query(`
      COMMENT ON COLUMN users.last_login IS 'วันเวลาที่ user เข้าสู่ระบบครั้งล่าสุด'
    `);

    console.log('✅ Added comment to last_login column');

    // เพิ่ม index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login)
    `);

    console.log('✅ Added index for last_login column');

    // อัปเดต last_login สำหรับ admin user (ถ้ามี)
    const updateResult = await client.query(`
      UPDATE users 
      SET last_login = NOW() 
      WHERE email = 'admin@example.com'
    `);

    if (updateResult.rowCount > 0) {
      console.log('✅ Updated last_login for admin user');
    }

    // แสดงโครงสร้างตารางใหม่
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Users table structure after migration:');
    console.table(tableInfo.rows);

    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// รัน migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
