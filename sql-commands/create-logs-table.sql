-- สร้างตาราง system_logs สำหรับเก็บ log entries
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug', 'success')),
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    source VARCHAR(100),
    user_id INTEGER REFERENCES users(id),
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- สร้าง index สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);

-- สร้าง index สำหรับ full-text search
CREATE INDEX IF NOT EXISTS idx_system_logs_message_gin ON system_logs USING gin(to_tsvector('english', message));

-- เพิ่ม comment สำหรับ documentation
COMMENT ON TABLE system_logs IS 'System log entries for monitoring and debugging';
COMMENT ON COLUMN system_logs.level IS 'Log level: info, warn, error, debug, success';
COMMENT ON COLUMN system_logs.category IS 'Log category: MQTT, Database, Authentication, etc.';
COMMENT ON COLUMN system_logs.details IS 'Additional log details in JSON format';
COMMENT ON COLUMN system_logs.source IS 'Source component or service that generated the log';

-- สร้าง function สำหรับ automatic cleanup logs เก่า (เก็บไว้ 30 วัน)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM system_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Log การทำความสะอาด
    INSERT INTO system_logs (level, category, message, source)
    VALUES ('info', 'System', 'Old logs cleanup completed', 'cleanup-service');
END;
$$ LANGUAGE plpgsql;

-- สร้าง scheduled job สำหรับ cleanup (ถ้ามี pg_cron extension)
-- SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT cleanup_old_logs();');
