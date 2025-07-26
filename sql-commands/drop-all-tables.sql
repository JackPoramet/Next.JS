-- คำสั่ง SQL สำหรับลบทุก table ใน PostgreSQL Database

-- ===== วิธีที่ 1: ลบทีละ table (ปลอดภัยกว่า) =====

-- 1.1 ดูรายชื่อ table ทั้งหมดก่อน
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 1.2 ลบ table users (ถ้ามี)
DROP TABLE IF EXISTS users CASCADE;

-- 1.3 ลบ table อื่นๆ ที่อาจมี (เพิ่มตามต้องการ)
-- DROP TABLE IF EXISTS devices CASCADE;
-- DROP TABLE IF EXISTS energy_data CASCADE;
-- DROP TABLE IF EXISTS sessions CASCADE;

-- ===== วิธีที่ 2: ลบทุก table ในครั้งเดียว (ระวัง!) =====

-- 2.1 สร้าง function สำหรับลบทุก table
DO $$ DECLARE
    r RECORD;
BEGIN
    -- Loop ผ่านทุก table ใน public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- ===== วิธีที่ 3: ลบทั้ง schema และสร้างใหม่ =====

-- 3.1 ลบ public schema (ระวัง: จะลบทุกอย่างใน schema)
-- DROP SCHEMA public CASCADE;

-- 3.2 สร้าง public schema ใหม่
-- CREATE SCHEMA public;

-- 3.3 ให้สิทธิ์ใช้งาน schema
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;

-- ===== วิธีที่ 4: Reset ทั้ง Database =====

-- หมายเหตุ: คำสั่งเหล่านี้ต้องรันจาก psql หรือ database client อื่น
-- ไม่สามารถรันจากภายใน database ที่ต้องการลบได้

-- 4.1 เชื่อมต่อไปยัง database อื่น (เช่น postgres)
-- \c postgres

-- 4.2 ลบ database ทั้งหมด
-- DROP DATABASE IF EXISTS iot_energy_db;

-- 4.3 สร้าง database ใหม่
-- CREATE DATABASE iot_energy_db;

-- ===== คำสั่ง psql สำหรับ Terminal =====

-- ดู database ทั้งหมด
-- \l

-- เชื่อมต่อไปยัง database
-- \c iot_energy_db

-- ดู table ทั้งหมด
-- \dt

-- ออกจาก psql
-- \q
