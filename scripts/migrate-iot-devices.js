#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // ปิด SSL สำหรับการเชื่อมต่อ local/internal network
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting IoT Devices table migration...');
    
    // อ่านไฟล์ migration
    const migrationPath = path.join(__dirname, '../src/db/migrations/004_create_iot_devices.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // รัน migration
    await client.query(migrationSQL);
    
    console.log('✅ IoT Devices table created successfully!');
    
    // ตรวจสอบข้อมูลที่เพิ่มเข้าไป
    const result = await client.query('SELECT COUNT(*) as count FROM iot_devices');
    console.log(`📊 Total devices in database: ${result.rows[0].count}`);
    
    // แสดงข้อมูลแต่ละ faculty
    const facultyResult = await client.query(`
      SELECT 
        faculty, 
        COUNT(*) as device_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
      FROM iot_devices 
      GROUP BY faculty 
      ORDER BY faculty
    `);
    
    console.log('\n📋 Devices by Faculty:');
    facultyResult.rows.forEach(row => {
      console.log(`   ${row.faculty}: ${row.device_count} devices (${row.active_count} active)`);
    });
    
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// รันการ migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
