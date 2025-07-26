import { UserModel } from '@/models/User';
import { query } from '@/lib/database';

/**
 * Script สำหรับสร้างข้อมูลเริ่มต้นในระบบ
 */
async function seedDatabase() {
  try {
    console.log('🌱 เริ่มต้น seed database...');

    // สร้าง admin user
    console.log('👤 สร้าง admin user...');
    try {
      const adminUser = await UserModel.create({
        email: 'admin@example.com',
        password: 'admin123',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      });
      console.log('✅ สร้าง admin user สำเร็จ:', adminUser.email);
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        console.log('ℹ️ Admin user มีอยู่แล้ว');
      } else {
        throw error;
      }
    }

    // สร้าง test user
    console.log('👤 สร้าง test user...');
    try {
      const testUser = await UserModel.create({
        email: 'user@example.com',
        password: 'user123',
        first_name: 'Test',
        last_name: 'User',
        role: 'user'
      });
      console.log('✅ สร้าง test user สำเร็จ:', testUser.email);
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        console.log('ℹ️ Test user มีอยู่แล้ว');
      } else {
        throw error;
      }
    }

    console.log('🎉 Seed database สำเร็จ!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดใน seed database:', error);
    process.exit(1);
  }
}

// รัน script เมื่อเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🏁 เสร็จสิ้น');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

export { seedDatabase };
