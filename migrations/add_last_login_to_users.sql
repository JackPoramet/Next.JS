-- Migration: เพิ่ม last_login column ในตาราง users
-- File: migrations/add_last_login_to_users.sql

ALTER TABLE users 
ADD COLUMN last_login TIMESTAMP NULL DEFAULT NULL;

-- เพิ่ม comment สำหรับ column
COMMENT ON COLUMN users.last_login IS 'วันเวลาที่ user เข้าสู่ระบบครั้งล่าสุด';

-- เพิ่ม index เพื่อเพิ่มประสิทธิภาพในการ query
CREATE INDEX idx_users_last_login ON users(last_login);

-- ตัวอย่างการ update last_login สำหรับ admin user ที่มีอยู่
UPDATE users 
SET last_login = NOW() 
WHERE email = 'admin@example.com';

-- แสดงโครงสร้างตารางหลังจากเพิ่ม column
\d users;
