# 📖 คู่มือการติดตั้งและใช้งาน Database Schema

## 🎯 ขั้นตอนการเริ่มต้น (สำหรับครั้งแรก)

### 1. ตรวจสอบการเชื่อมต่อ Database

ก่อนอื่นให้ตรวจสอบว่าเชื่อมต่อ PostgreSQL ได้หรือไม่:

```bash
# วิธีที่ 1: ใช้ npm script (แนะนำ)
npm run db:check

# วิธีที่ 2: ใช้ node command โดยตรง
node check-db-connection.js

# วิธีที่ 3: ตรวจสอบแบบ one-liner
node -e "
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(() => console.log('✅ Database connected!')).catch(e => console.error('❌ Connection failed:', e.message)).finally(() => pool.end());
"
```

> **📍 ที่ตั้งไฟล์**: `check-db-connection.js` อยู่ใน **root directory** ของโปรเจกต์

### 2. ติดตั้ง Dependencies (ถ้ายังไม่ได้ทำ)

```bash
# ติดตั้ง packages ที่จำเป็น
npm install

# ติดตั้ง database packages (ถ้ายังไม่มี)
npm install pg @types/pg bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken dotenv
```

### 3. ลบ Table เดิม (ถ้ามี) และสร้างใหม่

```bash
# วิธีที่ 1: ลบแล้วสร้างใหม่ทั้งหมด (แนะนำ)
npm run db:fresh

# วิธีที่ 2: ทำทีละขั้นตอน
npm run db:drop      # ลบ table เดิม
npm run setup-db     # สร้าง table ใหม่
npm run seed         # ใส่ข้อมูลทดสอบ
```

## 🔄 ขั้นตอนสำหรับการใช้งานประจำ

### คำสั่งที่ใช้บ่อยที่สุด

```bash
npm run db:check     # ตรวจสอบการเชื่อมต่อ database
npm run db:fresh     # ลบ + สร้าง + seed ทั้งหมดใหม่
npm run setup-db     # สร้าง/อัพเดต schema
npm run seed         # เพิ่มข้อมูลทดสอบ
```

### เมื่อต้องการ Reset Database

```bash
# Reset ทั้งหมด (ลบ + สร้าง + seed)
npm run db:fresh
```

### เมื่อต้องการ Update Schema

```bash
# 1. แก้ไขไฟล์ src/db/schema.sql
# 2. รัน command
npm run setup-db
```

### เมื่อต้องการเพิ่มข้อมูลทดสอบใหม่

```bash
npm run seed
```

## 📁 โครงสร้างไฟล์ Database

```
src/
├── db/
│   └── schema.sql          # Database schema หลัก
├── lib/
│   └── database.ts         # Database connection
├── models/
│   └── User.ts            # User model
└── scripts/
    ├── setup-db.ts        # TypeScript version
    └── seed.ts            # TypeScript version

# Root level (JavaScript versions - พร้อมใช้งาน)
├── setup-db-simple.js         # Setup database script
├── seed-simple.js              # Seed data script  
├── check-db-connection.js      # Database connection checker (npm run db:check)
├── drop-all-tables.js          # Drop tables (with confirmation)
├── force-drop-tables.js        # Drop tables (no confirmation)
├── DATABASE-COMMANDS.md        # Database commands guide
└── SCHEMA-SETUP-GUIDE.md       # This guide
```

## 🛠️ การแก้ไข Schema

### เพิ่ม Table ใหม่

1. แก้ไขไฟล์ `src/db/schema.sql`:

```sql
-- เพิ่ม table ใหม่
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

2. รัน command:
```bash
npm run setup-db
```

### เพิ่ม Column ใน Table ที่มีอยู่

```sql
-- เพิ่ม column ใหม่
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
END $$;
```

### สร้าง Index ใหม่

```sql
-- สร้าง index
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(device_type);
```

## 🔍 การตรวจสอบและ Debug

### ดู Table ทั้งหมด

```sql
-- รัน command นี้ใน psql หรือ database client
\dt

-- หรือใช้ SQL
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### ดู Structure ของ Table

```sql
-- ดู columns ของ table
\d users

-- หรือใช้ SQL
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';
```

### ตรวจสอบข้อมูลใน Table

```sql
-- ดูข้อมูลใน table users
SELECT * FROM users;

-- นับจำนวน records
SELECT COUNT(*) FROM users;
```

## 🚨 การแก้ไขปัญหาที่พบบ่อย

### 1. Connection Error

```bash
❌ error: ECONNREFUSED
```

**แก้ไข:**
- ตรวจสอบว่า PostgreSQL service เปิดอยู่
- ตรวจสอบ `DATABASE_URL` ใน `.env.local`
- ตรวจสอบ firewall และ network

### 2. Authentication Error

```bash
❌ error: authentication failed
```

**แก้ไข:**
- ตรวจสอบ username/password ใน `DATABASE_URL`
- ตรวจสอบสิทธิ์การเข้าถึง database

### 3. Table Already Exists

```bash
❌ error: relation "users" already exists
```

**แก้ไข:**
```bash
# ลบ table เดิมก่อน
npm run db:drop
npm run setup-db
```

### 4. Column Does Not Exist

```bash
❌ error: column "password_hash" does not exist
```

**แก้ไข:**
- Schema ไฟล์ได้ปรับปรุงให้รองรับ existing tables แล้ว
- รัน `npm run setup-db` ใหม่

## 📝 Best Practices

### 1. Backup ก่อนทำการเปลี่ยนแปลง

```bash
# Export ข้อมูลก่อน (ถ้าจำเป็น)
pg_dump DATABASE_URL > backup.sql
```

### 2. ใช้ Transaction สำหรับการเปลี่ยนแปลงใหญ่

```sql
BEGIN;
-- ทำการเปลี่ยนแปลง
ALTER TABLE users ADD COLUMN new_field VARCHAR(100);
-- ตรวจสอบผลลัพธ์
SELECT * FROM users LIMIT 1;
-- ถ้าถูกต้อง
COMMIT;
-- ถ้าผิดพลาด
-- ROLLBACK;
```

### 3. ใช้ IF NOT EXISTS เสมอ

```sql
-- ใช้แบบนี้
CREATE TABLE IF NOT EXISTS new_table (...);
CREATE INDEX IF NOT EXISTS idx_name ON table(column);

-- อย่าใช้แบบนี้ (จะ error ถ้ามีอยู่แล้ว)
CREATE TABLE new_table (...);
```

## 🎓 เทคนิคขั้นสูง

### Migration Scripts

สร้างไฟล์ migration แยกตามเวอร์ชัน:

```
src/db/migrations/
├── 001_create_users_table.sql
├── 002_add_phone_to_users.sql
└── 003_create_devices_table.sql
```

### Environment-specific Configs

```javascript
// config สำหรับ environment ต่างๆ
const dbConfig = {
  development: {
    // local database
  },
  testing: {
    // test database
  },
  production: {
    // production database
  }
};
```

## 📞 การขอความช่วยเหลือ

หากประสบปัญหา:
1. ตรวจสอบ error message ใน console
2. ดูไฟล์ log ของ PostgreSQL
3. ทดสอบการเชื่อมต่อด้วย psql command line
4. ตรวจสอบไฟล์ `.env.local`
