// สคริปต์สำหรับสร้าง JWT Secret ที่ปลอดภัย
const crypto = require('crypto');

function generateSecureSecret() {
  // สร้าง random bytes 64 ตัว และแปลงเป็น hex
  const secret = crypto.randomBytes(64).toString('hex');
  
  console.log('🔐 JWT Secrets ที่แนะนำ:');
  console.log('');
  console.log('สำหรับ JWT_SECRET:');
  console.log(secret);
  console.log('');
  console.log('สำหรับ NEXTAUTH_SECRET:');
  console.log(crypto.randomBytes(32).toString('hex'));
  console.log('');
  console.log('📝 วิธีใช้:');
  console.log('1. คัดลอก secret ข้างบน');
  console.log('2. แทนที่ใน .env.local:');
  console.log(`JWT_SECRET="${secret}"`);
  console.log(`NEXTAUTH_SECRET="${crypto.randomBytes(32).toString('hex')}"`);
  console.log('');
  console.log('⚠️ หมายเหตุ: ใช้ secret ที่แตกต่างกันสำหรับ production!');
}

// รันเมื่อไฟล์ถูกเรียกโดยตรง
if (require.main === module) {
  generateSecureSecret();
}

module.exports = { generateSecureSecret };
