import { query, closePool } from '@/lib/database';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Script สำหรับเตรียม database schema
 */
async function setupDatabase() {
  try {
    console.log('🗄️ เริ่มต้นตั้งค่า database...');

    // อ่านไฟล์ SQL schema
    const schemaPath = join(process.cwd(), 'src', 'db', 'schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf-8');

    console.log('📄 รัน SQL schema...');
    
    // แบ่ง SQL statements และรันทีละคำสั่ง
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      try {
        await query(statement);
        console.log('✅ รัน statement สำเร็จ');
      } catch (error) {
        // ข้ามข้อผิดพลาดที่เป็น warning เช่น table ที่มีอยู่แล้ว
        if (error instanceof Error && !error.message.includes('already exists')) {
          throw error;
        }
        console.log('ℹ️ Statement ถูกข้าม (อาจจะมีอยู่แล้ว)');
      }
    }

    console.log('🎉 ตั้งค่า database สำเร็จ!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตั้งค่า database:', error);
    
    // ตรวจสอบ connection error
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('💡 ไม่สามารถเชื่อมต่อ PostgreSQL ได้ กรุณาตรวจสอบ:');
        console.error('   - PostgreSQL service กำลังทำงานหรือไม่');
        console.error('   - ค่า DATABASE_URL ใน .env.local ถูกต้องหรือไม่');
      } else if (error.message.includes('authentication failed')) {
        console.error('💡 การ authentication ล้มเหลว กรุณาตรวจสอบ username/password ใน DATABASE_URL');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.error('💡 Database ไม่พบ กรุณาสร้าง database ก่อน:');
        console.error('   CREATE DATABASE iot_energy_db;');
      }
    }
    
    process.exit(1);
  } finally {
    await closePool();
  }
}

// รัน script เมื่อเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🏁 เสร็จสิ้น');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

export { setupDatabase };
