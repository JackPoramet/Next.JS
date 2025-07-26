# ชุดคำสั่งสำหรับลบทุก Table ใน PostgreSQL

## 🎯 วิธีการต่างๆ ในการลบ Table

### 1. ใช้ npm scripts (แนะนำ)

```bash
# ลบทุก table แบบมีการยืนยัน
npm run db:drop

# ลบทุก table แล้วสร้างใหม่ทันทีพร้อม seed data
npm run db:fresh

# หรือทำทีละขั้นตอน
npm run setup-db    # สร้าง table ใหม่
npm run seed        # ใส่ข้อมูลทดสอบ
npm run db:reset    # รัน setup-db และ seed พร้อมกัน
```

### 2. ใช้ไฟล์ JavaScript โดยตรง

```bash
# แบบมีการยืนยัน (ปลอดภัย)
node drop-all-tables.js

# แบบไม่ต้องยืนยัน (ระวัง!)
node force-drop-tables.js
```

### 3. ใช้คำสั่ง SQL โดยตรง

เปิดไฟล์ `sql-commands/drop-all-tables.sql` และคัดลอกคำสั่งที่ต้องการ

**วิธีที่ 1: ลบทีละ table**
```sql
DROP TABLE IF EXISTS users CASCADE;
```

**วิธีที่ 2: ลบทุก table ในครั้งเดียว**
```sql
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
```

### 4. ใช้ psql command line

```bash
# เชื่อมต่อ database
psql -h your-host -U your-username -d your-database

# ดู table ทั้งหมด
\dt

# ลบ table ทีละตัว
DROP TABLE users CASCADE;

# หรือรันคำสั่งจากไฟล์
\i sql-commands/drop-all-tables.sql

# ออกจาก psql
\q
```

## ⚠️ คำเตือนสำคัญ

1. **สำรองข้อมูลก่อนลบ**: ข้อมูลที่ลบแล้วจะกู้คืนไม่ได้
2. **ตรวจสอบ DATABASE_URL**: ให้แน่ใจว่าเชื่อมต่อกับ database ที่ถูกต้อง
3. **ใช้ CASCADE อย่างระวัง**: จะลบทั้ง foreign key relationships

## 🔄 Workflow แนะนำ

### สำหรับการพัฒนา (Development)
```bash
# รีเซ็ต database ใหม่หมด
npm run db:fresh
```

### สำหรับการทดสอบ (Testing)
```bash
# ลบทุก table
npm run db:drop

# สร้างใหม่
npm run setup-db

# ใส่ข้อมูลทดสอบ
npm run seed
```

### สำหรับ Production (ระวัง!)
```bash
# ไม่ควรใช้คำสั่งเหล่านี้ใน production
# ควรใช้ migration scripts แทน
```

## 📋 ตรวจสอบสถานะ Database

```bash
# ดู table ที่มีอยู่
psql -c "\dt" DATABASE_URL

# นับจำนวน table
psql -c "SELECT count(*) FROM pg_tables WHERE schemaname = 'public';" DATABASE_URL

# ดูขนาด database
psql -c "SELECT pg_size_pretty(pg_database_size('your_database_name'));" DATABASE_URL
```

## 🚨 กรณีฉุกเฉิน

หาก script ไม่ทำงาน สามารถใช้คำสั่งนี้:

```sql
-- ลบทุกอย่างใน public schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## 📝 หมายเหตุ

- ไฟล์ทั้งหมดอยู่ในโฟลเดอร์ root ของโปรเจกต์
- scripts จะอ่านการตั้งค่าจาก `.env.local`
- ใช้ `CASCADE` เพื่อลบ dependencies ด้วย
- scripts มี error handling และ logging แล้ว
