-- ================================
-- 1. TABLES CREATION
-- ================================

-- สร้างตาราง users สำหรับระบบ authentication
CREATE TABLE IF NOT EXISTS users (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Authentication Fields
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- User Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    -- User Status & Role
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    
    -- Login Tracking
    last_login TIMESTAMP NULL DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- 2. BACKWARD COMPATIBILITY
-- เพิ่ม columns สำหรับ database ที่มีอยู่แล้ว
-- ================================

-- Function สำหรับเพิ่ม column อย่างปลอดภัย
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    table_name_param text,
    column_name_param text,
    column_definition text
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = table_name_param 
        AND column_name = column_name_param
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', 
                      table_name_param, column_name_param, column_definition);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- เพิ่ม columns ที่อาจจะขาดหายไป
SELECT add_column_if_not_exists('users', 'password_hash', 'VARCHAR(255)');
SELECT add_column_if_not_exists('users', 'first_name', 'VARCHAR(100)');
SELECT add_column_if_not_exists('users', 'last_name', 'VARCHAR(100)');
SELECT add_column_if_not_exists('users', 'role', 'VARCHAR(50) DEFAULT ''user''');
SELECT add_column_if_not_exists('users', 'is_active', 'BOOLEAN DEFAULT true');
SELECT add_column_if_not_exists('users', 'last_login', 'TIMESTAMP NULL DEFAULT NULL');

-- ================================
-- 3. INDEXES FOR PERFORMANCE
-- ================================

-- Email index สำหรับ authentication และค้นหา user
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Last login index สำหรับ reporting และ user activity tracking  
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Role index สำหรับ authorization queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Active users index สำหรับกรอง user ที่ active
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

-- ================================
-- 4. FUNCTIONS & TRIGGERS
-- ================================

-- Function สำหรับ auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger สำหรับ auto-update updated_at เมื่อมีการแก้ไขข้อมูล
CREATE OR REPLACE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 5. HELPER FUNCTIONS
-- ================================

-- Function สำหรับอัปเดต last_login
CREATE OR REPLACE FUNCTION update_user_last_login(user_email VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE email = user_email AND is_active = true;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function สำหรับ clean up helper function
DROP FUNCTION IF EXISTS add_column_if_not_exists(text, text, text);

-- ================================
-- 6. COMMENTS & DOCUMENTATION
-- ================================

COMMENT ON TABLE users IS 'ตารางผู้ใช้งานระบบ IoT Electric Energy Monitoring';
COMMENT ON COLUMN users.id IS 'รหัสผู้ใช้ (Primary Key)';
COMMENT ON COLUMN users.email IS 'อีเมลสำหรับ login (Unique)';
COMMENT ON COLUMN users.password_hash IS 'รหัสผ่านที่เข้ารหัสแล้ว';
COMMENT ON COLUMN users.first_name IS 'ชื่อจริง';
COMMENT ON COLUMN users.last_name IS 'นามสกุล';
COMMENT ON COLUMN users.role IS 'บทบาทผู้ใช้ (user, admin, etc.)';
COMMENT ON COLUMN users.is_active IS 'สถานะการใช้งาน (active/inactive)';
COMMENT ON COLUMN users.last_login IS 'เวลา login ครั้งล่าสุด';
COMMENT ON COLUMN users.created_at IS 'เวลาที่สร้างบัญชี';
COMMENT ON COLUMN users.updated_at IS 'เวลาที่แก้ไขข้อมูลล่าสุด';
