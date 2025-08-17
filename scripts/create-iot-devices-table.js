#!/usr/bin/env node

/**
 * สคริปต์สำหรับสร้างตาราง iot_devices
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// โหลด environment variables
require('dotenv').config();

async function createIoTDevicesTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false, // ปิด SSL ตาม config เดิม
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  try {
    console.log('🔗 กำลังเชื่อมต่อฐานข้อมูล...');
    
    // อ่านไฟล์ SQL
    const sqlPath = path.join(__dirname, '..', 'migrations', 'create_iot_devices_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 อ่านไฟล์ SQL สำเร็จ');
    
    // รัน SQL
    const client = await pool.connect();
    
    try {
      console.log('⚡ กำลังสร้างตาราง iot_devices...');
      await client.query(sqlContent);
      console.log('✅ สร้างตาราง iot_devices สำเร็จ!');
      
      // ตรวจสอบข้อมูลที่เพิ่มเข้าไป
      console.log('📊 ตรวจสอบข้อมูลในตาราง...');
      const result = await client.query('SELECT COUNT(*) as count FROM iot_devices');
      console.log(`📈 พบอุปกรณ์ทั้งหมด: ${result.rows[0].count} อุปกรณ์`);
      
      // แสดงรายชื่ออุปกรณ์
      const devices = await client.query(`
        SELECT id, name, device_id, faculty, status, network_status 
        FROM iot_devices 
        ORDER BY id
      `);
      
      console.log('\n📋 รายการอุปกรณ์:');
      devices.rows.forEach(device => {
        console.log(`  ${device.id}. ${device.name} (${device.device_id})`);
        console.log(`     📍 ${device.faculty} | 📶 ${device.network_status} | 🔧 ${device.status}`);
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    
    if (error.code === '42P07') {
      console.log('ℹ️ ตาราง iot_devices มีอยู่แล้ว - ข้ามการสร้าง');
    } else if (error.code === '23505') {
      console.log('ℹ️ ข้อมูลตัวอย่างมีอยู่แล้ว - ข้ามการเพิ่มข้อมูล');
    } else {
      process.exit(1);
    }
  } finally {
    await pool.end();
    console.log('🔚 ปิดการเชื่อมต่อฐานข้อมูลแล้ว');
  }
}

// เรียกใช้ฟังก์ชัน
if (require.main === module) {
  createIoTDevicesTable()
    .then(() => {
      console.log('🎉 การสร้างตาราง iot_devices เสร็จสิ้น!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 เกิดข้อผิดพลาดที่ไม่คาดคิด:', error);
      process.exit(1);
    });
}

module.exports = { createIoTDevicesTable };
