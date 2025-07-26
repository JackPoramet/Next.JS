// Simple seed script in JavaScript
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function seedDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🌱 เริ่มต้น seed database...');

    // สร้าง admin user
    console.log('👤 สร้าง admin user...');
    try {
      const adminPasswordHash = await bcrypt.hash('admin123', 12);
      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        ['admin@example.com', adminPasswordHash, 'Admin', 'User', 'admin']
      );
      console.log('✅ สร้าง admin user สำเร็จ: admin@example.com');
    } catch (error) {
      console.log('ℹ️ Admin user อาจมีอยู่แล้ว');
    }

    // สร้าง test user
    console.log('👤 สร้าง test user...');
    try {
      const userPasswordHash = await bcrypt.hash('user123', 12);
      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        ['user@example.com', userPasswordHash, 'Test', 'User', 'user']
      );
      console.log('✅ สร้าง test user สำเร็จ: user@example.com');
    } catch (error) {
      console.log('ℹ️ Test user อาจมีอยู่แล้ว');
    }

    console.log('🎉 Seed database สำเร็จ!');
    console.log('');
    console.log('📝 ข้อมูลสำหรับทดสอบ:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User: user@example.com / user123');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดใน seed database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
