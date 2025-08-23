-- ================================================================
-- TABLE 4: DEVICES_HISTORY (Historical Time-Series Data)
-- ================================================================
-- วัตถุประสงค์: เก็บข้อมูลประวัติสำหรับการวิเคราะห์และรายงาน
-- ลักษณะข้อมูล: Time-Series, Historical Data  
-- ความถี่การเปลี่ยนแปลง: เพิ่มข้อมูลใหม่ตลอดเวลา (ไม่เปลี่ยนข้อมูลเก่า)

CREATE TABLE IF NOT EXISTS devices_history (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Foreign Key to devices_prop
    device_id VARCHAR(100) NOT NULL,
    
    -- Timestamp for this historical record
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Current Electrical Readings (ค่าไฟฟ้าปัจจุบัน)
    voltage DECIMAL(8,2) CHECK (voltage >= 0), -- แรงดันไฟฟ้าเฟส A หรือค่าเฉลี่ย (V)
    current_amperage DECIMAL(8,2) CHECK (current_amperage >= 0), -- กระแสไฟฟ้าเฟส A หรือค่าเฉลี่ย (A)
    power_factor DECIMAL(4,3) CHECK (power_factor BETWEEN -1 AND 1), -- ตัวประกอบกำลังเฟส A หรือค่าเฉลี่ย
    frequency DECIMAL(5,2) CHECK (frequency BETWEEN 40 AND 70), -- ความถี่ (Hz)
    
    -- 3-Phase Specific Readings (สำหรับระบบ 3 เฟสเท่านั้น)
    voltage_phase_b DECIMAL(8,2) CHECK (voltage_phase_b IS NULL OR voltage_phase_b >= 0), -- แรงดันไฟฟ้าเฟส B (V)
    voltage_phase_c DECIMAL(8,2) CHECK (voltage_phase_c IS NULL OR voltage_phase_c >= 0), -- แรงดันไฟฟ้าเฟส C (V)
    current_phase_b DECIMAL(8,2) CHECK (current_phase_b IS NULL OR current_phase_b >= 0), -- กระแสไฟฟ้าเฟส B (A)
    current_phase_c DECIMAL(8,2) CHECK (current_phase_c IS NULL OR current_phase_c >= 0), -- กระแสไฟฟ้าเฟส C (A)
    power_factor_phase_b DECIMAL(4,3) CHECK (power_factor_phase_b IS NULL OR power_factor_phase_b BETWEEN -1 AND 1), -- ตัวประกอบกำลังเฟส B
    power_factor_phase_c DECIMAL(4,3) CHECK (power_factor_phase_c IS NULL OR power_factor_phase_c BETWEEN -1 AND 1), -- ตัวประกอบกำลังเฟส C
    
    -- Power Measurements (การวัดกำลัง)
    active_power DECIMAL(12,2) CHECK (active_power >= 0), -- กำลังจริงรวม (W)
    reactive_power DECIMAL(12,2), -- กำลังรีแอกทีฟรวม (VAR)
    apparent_power DECIMAL(12,2) CHECK (apparent_power >= 0), -- กำลังปรากฏรวม (VA)
    
    -- 3-Phase Power Measurements
    active_power_phase_a DECIMAL(12,2) CHECK (active_power_phase_a IS NULL OR active_power_phase_a >= 0), -- กำลังจริงเฟส A (W)
    active_power_phase_b DECIMAL(12,2) CHECK (active_power_phase_b IS NULL OR active_power_phase_b >= 0), -- กำลังจริงเฟส B (W)
    active_power_phase_c DECIMAL(12,2) CHECK (active_power_phase_c IS NULL OR active_power_phase_c >= 0), -- กำลังจริงเฟส C (W)
    
    -- Energy Measurements (การวัดพลังงาน)
    total_energy_import DECIMAL(15,3) DEFAULT 0, -- พลังงานรวมที่นำเข้า (kWh)
    total_energy_export DECIMAL(15,3) DEFAULT 0, -- พลังงานรวมที่ส่งออก (kWh)
    
    -- Environmental Monitoring (การตรวจสอบสิ่งแวดล้อม)
    device_temperature DECIMAL(5,2) CHECK (device_temperature BETWEEN -40 AND 85), -- อุณหภูมิอุปกรณ์ (°C)
    
    -- Connection Quality
    connection_quality INTEGER DEFAULT 0 CHECK (connection_quality BETWEEN 0 AND 100), -- % คุณภาพสัญญาณ
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraint
    CONSTRAINT fk_devices_history_device_id 
        FOREIGN KEY (device_id) 
        REFERENCES devices_prop(device_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Primary index for device_id and time-based queries
CREATE INDEX IF NOT EXISTS idx_devices_history_device_time ON devices_history(device_id, recorded_at DESC);

-- Index for time-range queries
CREATE INDEX IF NOT EXISTS idx_devices_history_recorded_at ON devices_history(recorded_at DESC);

-- Index for device-specific queries
CREATE INDEX IF NOT EXISTS idx_devices_history_device_id ON devices_history(device_id);

-- Partial index for recent data (last 30 days) - for better performance on frequent queries
CREATE INDEX IF NOT EXISTS idx_devices_history_recent ON devices_history(device_id, recorded_at DESC) 
WHERE recorded_at > NOW() - INTERVAL '30 days';

-- Index for power analysis
CREATE INDEX IF NOT EXISTS idx_devices_history_power ON devices_history(device_id, active_power, recorded_at DESC);

-- ================================
-- PARTITIONING SETUP (Optional)
-- ================================

-- For large-scale deployments, consider partitioning by time
-- This is commented out by default but can be enabled for high-volume systems

/*
-- Create monthly partitions for better performance
-- Example for 2025
CREATE TABLE devices_history_2025_01 PARTITION OF devices_history
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE devices_history_2025_02 PARTITION OF devices_history
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Add more partitions as needed...
*/

-- ================================
-- UTILITY FUNCTIONS
-- ================================

-- Function to get device energy consumption for a specific period
CREATE OR REPLACE FUNCTION get_device_energy_consumption(
    device_id_param VARCHAR(100),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
    device_id VARCHAR(100),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    total_energy DECIMAL(15,3),
    average_power DECIMAL(12,2),
    peak_power DECIMAL(12,2),
    min_power DECIMAL(12,2),
    data_points BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dh.device_id,
        start_date as period_start,
        end_date as period_end,
        COALESCE(MAX(dh.total_energy_import) - MIN(dh.total_energy_import), 0) as total_energy,
        COALESCE(AVG(dh.active_power), 0) as average_power,
        COALESCE(MAX(dh.active_power), 0) as peak_power,
        COALESCE(MIN(dh.active_power), 0) as min_power,
        COUNT(*) as data_points
    FROM devices_history dh
    WHERE dh.device_id = device_id_param
        AND dh.recorded_at BETWEEN start_date AND end_date
    GROUP BY dh.device_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old historical data
CREATE OR REPLACE FUNCTION cleanup_old_device_history(
    retention_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * retention_days;
    
    DELETE FROM devices_history 
    WHERE recorded_at < cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    RAISE NOTICE 'Cleaned up % old device history records older than %', deleted_count, cutoff_date;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- COMMENTS & DOCUMENTATION
-- ================================

-- Table Comments
COMMENT ON TABLE devices_history IS 'ข้อมูลประวัติแบบ time-series สำหรับการวิเคราะห์และรายงาน - เพิ่มข้อมูลใหม่ตลอดเวลา';

-- Column Comments
COMMENT ON COLUMN devices_history.device_id IS 'รหัสอุปกรณ์ (Foreign Key) - เก็บข้อมูลประวัติ';
COMMENT ON COLUMN devices_history.recorded_at IS 'เวลาที่บันทึกข้อมูลประวัติ - สำคัญสำหรับ time-series analysis';
COMMENT ON COLUMN devices_history.active_power IS 'กำลังจริงที่บันทึกในช่วงเวลานั้น (W)';
COMMENT ON COLUMN devices_history.total_energy_import IS 'พลังงานสะสมที่นำเข้า ณ เวลานั้น (kWh)';
COMMENT ON COLUMN devices_history.device_temperature IS 'อุณหภูมิอุปกรณ์ ณ เวลานั้น (°C)';

-- Index Comments
COMMENT ON INDEX idx_devices_history_device_time IS 'Index หลักสำหรับ time-series queries - สำคัญสำหรับประสิทธิภาพ';
COMMENT ON INDEX idx_devices_history_recent IS 'Index สำหรับข้อมูลล่าสุด 30 วัน - เพิ่มประสิทธิภาพการดึงข้อมูลเร็ว';

-- Function Comments  
COMMENT ON FUNCTION get_device_energy_consumption IS 'ฟังก์ชันคำนวณการใช้พลังงานของอุปกรณ์ในช่วงเวลาที่กำหนด';
COMMENT ON FUNCTION cleanup_old_device_history IS 'ฟังก์ชันลบข้อมูลประวัติเก่าเพื่อประหยัดพื้นที่ storage';

-- ================================
-- SAMPLE USAGE QUERIES
-- ================================

/*
-- Example queries for using the devices_history table:

-- 1. Get last 24 hours of data for a specific device
SELECT * FROM devices_history 
WHERE device_id = 'DEV001' 
  AND recorded_at > NOW() - INTERVAL '24 hours'
ORDER BY recorded_at DESC;

-- 2. Get energy consumption for last week
SELECT * FROM get_device_energy_consumption('DEV001', NOW() - INTERVAL '7 days', NOW());

-- 3. Get hourly averages for the last day
SELECT 
    device_id,
    DATE_TRUNC('hour', recorded_at) as hour,
    AVG(active_power) as avg_power,
    AVG(voltage) as avg_voltage,
    AVG(device_temperature) as avg_temperature
FROM devices_history 
WHERE device_id = 'DEV001' 
  AND recorded_at > NOW() - INTERVAL '24 hours'
GROUP BY device_id, DATE_TRUNC('hour', recorded_at)
ORDER BY hour DESC;

-- 4. Find peak power usage periods
SELECT 
    device_id,
    recorded_at,
    active_power,
    device_temperature
FROM devices_history 
WHERE device_id = 'DEV001'
  AND active_power = (
    SELECT MAX(active_power) 
    FROM devices_history 
    WHERE device_id = 'DEV001' 
      AND recorded_at > NOW() - INTERVAL '30 days'
  );

-- 5. Clean up data older than 1 year
SELECT cleanup_old_device_history(365);
*/