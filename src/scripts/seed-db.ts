// ================================
// Seed Database Script
// ================================
// ไฟล์สำหรับเติมข้อมูลตัวอย่างลงในฐานข้อมูล

import { query } from '../lib/database';
import { promises as fs } from 'fs';
import path from 'path';

async function seedDatabase() {
  try {
    console.log('🌱 เริ่มต้นการ seed ฐานข้อมูล...');
    
    // อ่านไฟล์ meter_models.sql
    const meterModelsSqlPath = path.join(__dirname, '../db/seeds/meter_models.sql');
    const meterModelsSql = await fs.readFile(meterModelsSqlPath, 'utf8');
    
    // ทำการ execute SQL
    await query(meterModelsSql);
    
    console.log('✅ Seed ข้อมูล meter models สำเร็จ!');
    
    // สามารถเพิ่มการ seed ข้อมูลอื่นๆ ที่นี่
    
    console.log('🎉 การ seed ฐานข้อมูลเสร็จสมบูรณ์!');
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการ seed ฐานข้อมูล:', error);
  }
}

// รันฟังก์ชัน seed
seedDatabase();
