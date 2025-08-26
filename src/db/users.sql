-- ================================
-- USERS TABLE SCHEMA
-- IoT Electric Energy Management System
-- ================================

-- Drop table if exists (for development only)
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table with all necessary fields
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
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    
    -- Login Tracking
    last_login TIMESTAMP NULL DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    CONSTRAINT users_password_check CHECK (length(password_hash) >= 6)
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Index for email lookups (login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index for active users
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Composite index for authentication
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(email, is_active);

-- ================================
-- TRIGGERS FOR UPDATED_AT
-- ================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before any update
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SAMPLE DATA (OPTIONAL)
-- ================================

-- Insert default admin user (commented out for security)
-- Password: admin123 (hashed with bcrypt)
/*
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active
) VALUES (
    'admin@example.com',
    '$2a$12$6ZlBLsAf8nTjCndfnOUw8.6PDe.tRuM4XQfJkEQtKnPaXGYd0qE1W',
    'System',
    'Administrator',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;
*/

-- ================================
-- UTILITY FUNCTIONS
-- ================================

-- Function to get user by email
CREATE OR REPLACE FUNCTION get_user_by_email(user_email VARCHAR)
RETURNS TABLE(
    user_id INTEGER,
    user_email VARCHAR,
    user_role VARCHAR,
    user_active BOOLEAN,
    user_first_name VARCHAR,
    user_last_name VARCHAR,
    user_last_login TIMESTAMP,
    user_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.role,
        u.is_active,
        u.first_name,
        u.last_name,
        u.last_login,
        u.created_at
    FROM users u
    WHERE u.email = user_email AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to update last login
CREATE OR REPLACE FUNCTION update_last_login(user_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE email = user_email AND is_active = true;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- COMMENTS FOR DOCUMENTATION
-- ================================

COMMENT ON TABLE users IS 'User accounts for IoT Electric Energy Management System';
COMMENT ON COLUMN users.id IS 'Primary key, auto-incrementing user ID';
COMMENT ON COLUMN users.email IS 'Unique email address for user authentication';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.role IS 'User role: admin, user, or moderator';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN users.last_login IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Last update timestamp (auto-updated)';

-- ================================
-- VERIFICATION QUERIES
-- ================================

-- Check if table was created successfully
-- SELECT 'users table created successfully' as status;

-- View table structure
-- \d users

-- Count initial records
-- SELECT COUNT(*) as user_count FROM users;
