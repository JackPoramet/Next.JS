-- ================================
-- DEVICES TABLES - 3 TABLE ARCHITECTURE
-- ================================
-- Architecture Overview:
-- 1. meter_prop: ข้อมูลมิเตอร์ (ข้อมูลทางเทคนิคและสเปค)
-- 2. devices_prop: ข้อมูลอุปกรณ์ที่ครอบคลุม (อุปกรณ์แต่ละตัว)
-- 3. devices_data: ข้อมูลปัจจุบันแบบ real-time (ข้อมูลล่าสุด)

-- ========================================
-- CLEAN UP EXISTING OBJECTS (IF EXISTS)
-- ========================================

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS devices_complete CASCADE;
DROP VIEW IF EXISTS devices_dashboard CASCADE;
DROP VIEW IF EXISTS devices_monitoring CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_energy_consumption(VARCHAR(100), DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_history_data(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS immutable_date_trunc_day(timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS immutable_date_trunc_hour(timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_initial_device_data() CASCADE;
DROP FUNCTION IF EXISTS archive_device_data() CASCADE;

-- Drop tables in correct order (child tables first)
DROP TABLE IF EXISTS devices_data CASCADE;
DROP TABLE IF EXISTS devices_prop CASCADE;
DROP TABLE IF EXISTS meter_prop CASCADE;

-- Drop ENUM types
DROP TYPE IF EXISTS device_status_enum CASCADE;
DROP TYPE IF EXISTS network_status_enum CASCADE;
DROP TYPE IF EXISTS meter_type_enum CASCADE;
DROP TYPE IF EXISTS connection_type_enum CASCADE;
DROP TYPE IF EXISTS power_phase_enum CASCADE;

-- สร้าง ENUM types สำหรับข้อมูลที่มีค่าจำกัด
CREATE TYPE device_status_enum AS ENUM ('active', 'inactive', 'maintenance', 'error');
CREATE TYPE network_status_enum AS ENUM ('online', 'offline', 'error');
CREATE TYPE meter_type_enum AS ENUM ('digital', 'analog');
CREATE TYPE connection_type_enum AS ENUM ('wifi', 'ethernet');
CREATE TYPE power_phase_enum AS ENUM ('single', 'three'); -- เพิ่มประเภทระบบไฟฟ้า (1 เฟส, 3 เฟส)

-- ================================================================
-- TABLE 1: METER_PROP (Meter Technical Specifications)
-- ================================================================
-- วัตถุประสงค์: เก็บข้อมูลสเปคทางเทคนิคของมิเตอร์แต่ละรุ่น
-- ใช้เป็น Master Data สำหรับรุ่นมิเตอร์ต่างๆ

CREATE TABLE meter_prop (
    -- Primary Key
    meter_model_id VARCHAR(50) PRIMARY KEY, -- รหัสรุ่นมิเตอร์ เช่น 'SM-2000', 'AM-150'
    
    -- Meter Technical Information
    model_name VARCHAR(255) NOT NULL, -- ชื่อรุ่น เช่น 'Smart Meter 2000'
    manufacturer VARCHAR(100) NOT NULL, -- ผู้ผลิต เช่น 'PowerTech', 'Schneider'
    meter_type meter_type_enum NOT NULL DEFAULT 'digital',
    power_phase power_phase_enum NOT NULL DEFAULT 'single', -- ระบบไฟฟ้า (1 เฟส หรือ 3 เฟส)
    
    -- Electrical Specifications (สเปคทางไฟฟ้า)
    rated_voltage DECIMAL(8,2) CHECK (rated_voltage > 0), -- แรงดันที่กำหนด (V)
    rated_current DECIMAL(8,2) CHECK (rated_current > 0), -- กระแสที่กำหนด (A)
    rated_power DECIMAL(10,2) CHECK (rated_power > 0), -- กำลังที่กำหนด (W)
    accuracy_class VARCHAR(10), -- ความแม่นยำ เช่น '1.0', '0.5S'
    frequency DECIMAL(5,2) DEFAULT 50.0, -- ความถี่ (Hz)

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- TABLE 2: DEVICES_PROP (Physical Device Properties)
-- ================================================================
-- วัตถุประสงค์: เก็บข้อมูลอุปกรณ์จริงแต่ละตัวที่ติดตั้งในสถานที่จริง
-- หนึ่ง device หนึ่ง record แต่ละตัวมี serial number เฉพาะตัว

CREATE TABLE devices_prop (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Device Identification
    device_id VARCHAR(100) UNIQUE NOT NULL, -- รหัสอุปกรณ์เฉพาะตัว เช่น 'DEV001', 'SM-ENG-001'
    device_name VARCHAR(255) NOT NULL, -- ชื่ออุปกรณ์ เช่น 'Smart Meter Engineering Lab 1'
    
    -- Reference to Meter Model
    meter_model_id VARCHAR(50), -- อ้างอิงไปยัง meter_prop (รุ่นมิเตอร์)
    
    -- Physical Device Information
    firmware_version VARCHAR(50), -- เวอร์ชันเฟิร์มแวร์ปัจจุบัน
    hardware_revision VARCHAR(50), -- รุ่นฮาร์ดแวร์
    
    -- Installation Information (ข้อมูลการติดตั้ง)
    faculty VARCHAR(100) NOT NULL, -- คณะที่ติดตั้ง
    building VARCHAR(100), -- ตึก
    floor VARCHAR(50), -- ชั้น
    room VARCHAR(50), -- ห้อง
    position TEXT, -- ตำแหน่งเฉพาะเจาะจง
    
    -- Network Configuration (การตั้งค่าเครือข่าย)
    ip_address INET, -- IP Address ที่กำหนด
    mac_address MACADDR, -- MAC Address
    connection_type connection_type_enum DEFAULT 'wifi',
    
    -- Installation & Maintenance
    install_date DATE, -- วันที่ติดตั้ง
    
    -- Device Configuration (การตั้งค่าอุปกรณ์)
    data_collection_interval INTEGER DEFAULT 60, -- ช่วงเวลาเก็บข้อมูล (วินาที)
    sampling_rate INTEGER DEFAULT 1, -- อัตราการสุ่มข้อมูล (ครั้งต่อวินาที)
    
    -- Administrative Information
    responsible_person VARCHAR(255), -- ผู้รับผิดชอบ
    contact_info VARCHAR(255), -- ข้อมูลติดต่อ
    notes TEXT, -- หมายเหตุเพิ่มเติม
    
    -- Current Status (สถานะปัจจุบัน)
    status device_status_enum NOT NULL DEFAULT 'active',
    is_enabled BOOLEAN DEFAULT true, -- เปิด/ปิดการใช้งาน
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraint
    CONSTRAINT fk_devices_prop_meter_model 
        FOREIGN KEY (meter_model_id) 
        REFERENCES meter_prop(meter_model_id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

-- ================================================================
-- TABLE 3: DEVICES_DATA (Real-time Current Data)
-- ================================================================
-- วัตถุประสงค์: เก็บข้อมูลปัจจุบัน/ล่าสุดของอุปกรณ์แต่ละตัว
-- อัปเดตบ่อย เก็บเฉพาะค่าล่าสุด (Latest State)

CREATE TABLE devices_data (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Foreign Key to devices_prop
    device_id VARCHAR(100) NOT NULL,
    
    -- Network Status (สถานะเครือข่าย)
    network_status network_status_enum DEFAULT 'offline',
    connection_quality INTEGER DEFAULT 0 CHECK (connection_quality BETWEEN 0 AND 100), -- % คุณภาพสัญญาณ
    signal_strength INTEGER CHECK (signal_strength BETWEEN -120 AND 0), -- dBm
    
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
    
    -- Environmental Monitoring (การตรวจสอบสิ่งแวดล้อม)
    device_temperature DECIMAL(5,2) CHECK (device_temperature BETWEEN -40 AND 85), -- อุณหภูมิอุปกรณ์ (°C)
    
    -- Device Health Indicators (ตัวชี้วัดสุขภาพอุปกรณ์)
    uptime_seconds BIGINT DEFAULT 0, -- เวลาการทำงาน (วินาที)
    
    -- Data Collection Information (ข้อมูลการเก็บข้อมูล)
    last_data_received TIMESTAMP WITH TIME ZONE, -- เวลาที่รับข้อมูลล่าสุด
    data_collection_count BIGINT DEFAULT 0, -- จำนวนครั้งที่เก็บข้อมูล
    
    -- Error Information (ข้อมูลข้อผิดพลาด)
    last_error_code VARCHAR(50), -- รหัสข้อผิดพลาดล่าสุด
    last_error_message TEXT, -- ข้อความข้อผิดพลาดล่าสุด
    last_error_time TIMESTAMP WITH TIME ZONE, -- เวลาข้อผิดพลาดล่าสุด
    error_count_today INTEGER DEFAULT 0, -- จำนวนข้อผิดพลาดวันนี้
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraint
    CONSTRAINT fk_devices_data_device_id 
        FOREIGN KEY (device_id) 
        REFERENCES devices_prop(device_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- ================================
-- ความแตกต่างระหว่างตารางทั้ง 3 ตาราง
-- ================================

/*
📋 สรุปความแตกต่างของตารางทั้ง 4:

1. 🔧 METER_PROP (Master Data - ข้อมูลรุ่นมิเตอร์)
   - วัตถุประสงค์: เก็บข้อมูลสเปคทางเทคนิคของรุ่นมิเตอร์
   - ลักษณะข้อมูล: Static, Master Data
   - ความถี่การเปลี่ยนแปลง: แทบไม่เปลี่ยน (เพิ่มเมื่อมีรุ่นใหม่)
   - ตัวอย่าง: รุ่น SM-2000 มีสเปค 220V, 10A, ความแม่นยำ 1.0%
   - Primary Key: meter_model_id (เช่น 'SM-2000')

2. 🏗️ DEVICES_PROP (Physical Device Information - ข้อมูลอุปกรณ์จริง)
   - วัตถุประสงค์: เก็บข้อมูลอุปกรณ์จริงแต่ละตัวที่ติดตั้ง
   - ลักษณะข้อมูล: Semi-Static, Configuration Data
   - ความถี่การเปลี่ยนแปลง: เปลี่ยนเป็นครั้งคราว (เมื่อย้าย/เปลี่ยนตั้งค่า)
   - ตัวอย่าง: อุปกรณ์ DEV001 ที่คณะวิศวกรรม ห้อง 101 ใช้รุ่น SM-2000
   - Primary Key: device_id (เช่น 'DEV001')

3. ⚡ DEVICES_DATA (Real-time Current Data - ข้อมูลปัจจุบัน)
   - วัตถุประสงค์: เก็บข้อมูล real-time/สถานะปัจจุบันของอุปกรณ์
   - ลักษณะข้อมูล: Dynamic, Real-time Data
   - ความถี่การเปลี่ยนแปลง: เปลี่ยนบ่อยมาก (ทุกนาที/ทุกวินาที)
   - ตัวอย่าง: อุปกรณ์ DEV001 มีแรงดัน 220V, กระแส 5A ณ ขณะนี้
   - ข้อมูลเฉพาะ: 1 device = 1 record (เก็บค่าล่าสุดเท่านั้น)

4. 📊 DEVICES_HISTORY (Historical Time-Series Data - ข้อมูลประวัติ)
   - วัตถุประสงค์: เก็บข้อมูลประวัติสำหรับการวิเคราะห์และรายงาน
   - ลักษณะข้อมูล: Time-Series, Historical Data
   - ความถี่การเปลี่ยนแปลง: เพิ่มข้อมูลใหม่ตลอดเวลา (ไม่เปลี่ยนข้อมูลเก่า)
   - ตัวอย่าง: อุปกรณ์ DEV001 มีแรงดัน 220V เมื่อ 10:30, 221V เมื่อ 10:31
   - ข้อมูลเฉพาะ: 1 device = หลาย records ตามเวลา

💡 การใช้งานร่วมกัน:
- meter_prop ← devices_prop: อุปกรณ์อ้างอิงรุ่นมิเตอร์
- devices_prop ← devices_data: ข้อมูล real-time ของอุปกรณ์
- devices_prop ← devices_history: ประวัติข้อมูลของอุปกรณ์
- devices_data → devices_history: ข้อมูลปัจจุบันถูกเก็บเป็นประวัติ

🎯 ตัวอย่างการใช้งาน:
- ดูสเปครุ่น: SELECT * FROM meter_prop WHERE meter_model_id = 'SM-2000'
- ดูอุปกรณ์ที่ติดตั้ง: SELECT * FROM devices_prop WHERE faculty = 'engineering'
- ดูสถานะปัจจุบัน: SELECT * FROM devices_data WHERE device_id = 'DEV001'
- ดูประวัติ 7 วัน: SELECT * FROM devices_history WHERE device_id = 'DEV001' AND recorded_at > NOW() - INTERVAL '7 days'
*/
-- ================================
-- UTILITY FUNCTIONS (สร้างก่อนใช้ใน INDEX)
-- ================================

-- สร้าง IMMUTABLE functions สำหรับ date truncation (สำหรับใช้ใน INDEX)
CREATE FUNCTION immutable_date_trunc_day(timestamp with time zone)
RETURNS date AS $$
BEGIN
    RETURN $1::date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION immutable_date_trunc_hour(timestamp with time zone)
RETURNS timestamp with time zone AS $$
BEGIN
    RETURN date_trunc('hour', $1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================
-- IMPROVED INDEXES FOR PERFORMANCE
-- ================================

-- Indexes for meter_prop table (Master Data)
CREATE INDEX idx_meter_prop_manufacturer ON meter_prop(manufacturer);
CREATE INDEX idx_meter_prop_meter_type ON meter_prop(meter_type);
CREATE INDEX idx_meter_prop_rated_power ON meter_prop(rated_power);

-- Indexes for devices_prop table (Device Configuration)
CREATE INDEX idx_devices_prop_device_id ON devices_prop(device_id);
CREATE INDEX idx_devices_prop_meter_model ON devices_prop(meter_model_id);
CREATE INDEX idx_devices_prop_faculty_building ON devices_prop(faculty, building);
CREATE INDEX idx_devices_prop_status_enabled ON devices_prop(status, is_enabled);
CREATE INDEX idx_devices_prop_install_date ON devices_prop(install_date);

-- Indexes for devices_data table (Real-time Data)
CREATE INDEX idx_devices_data_device_id ON devices_data(device_id);
CREATE INDEX idx_devices_data_network_status ON devices_data(network_status);
CREATE INDEX idx_devices_data_last_data_received ON devices_data(last_data_received DESC);
CREATE INDEX idx_devices_data_updated_at ON devices_data(updated_at DESC);
CREATE INDEX idx_devices_data_active_power ON devices_data(active_power);
CREATE INDEX idx_devices_data_device_temp ON devices_data(device_temperature);
CREATE INDEX idx_devices_data_voltage_current ON devices_data(voltage, current_amperage);

-- ================================
-- UTILITY FUNCTIONS (CONTINUED)
-- ================================

-- สร้าง function สำหรับ update timestamp
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger สำหรับ auto-update updated_at
CREATE TRIGGER update_devices_prop_updated_at 
    BEFORE UPDATE ON devices_prop 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_data_updated_at 
    BEFORE UPDATE ON devices_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger สำหรับสร้าง devices_data เมื่อเพิ่ม devices_prop ใหม่
CREATE FUNCTION create_initial_device_data()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO devices_data (device_id, network_status, created_at, updated_at)
    VALUES (NEW.device_id, 'offline', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_initial_device_data
    AFTER INSERT ON devices_prop
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_device_data();

-- Trigger สำหรับ auto-archive ข้อมูลเก่าไปยัง history table
CREATE FUNCTION archive_device_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Archive significant changes only
    IF (OLD.active_power IS DISTINCT FROM NEW.active_power OR 
        OLD.voltage IS DISTINCT FROM NEW.voltage OR
        OLD.current_amperage IS DISTINCT FROM NEW.current_amperage) THEN
        
        INSERT INTO devices_history (
            device_id, voltage, current_amperage, active_power, 
            power_factor, recorded_at
        ) VALUES (
            NEW.device_id, NEW.voltage, NEW.current_amperage, NEW.active_power,
            NEW.power_factor, NEW.updated_at
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_archive_device_data
    AFTER UPDATE ON devices_data
    FOR EACH ROW
    EXECUTE FUNCTION archive_device_data();

-- ================================
-- IMPROVED VIEWS
-- ================================

-- View รวมข้อมูลจาก 2 ตาราง (ปรับปรุง)
CREATE VIEW devices_complete AS
SELECT 
    -- From devices_prop
    dp.id as prop_id,
    dp.device_id,
    dp.device_name as name,
    dp.faculty,
    dp.building,
    dp.meter_model_id as meter_type,
    dp.connection_type,
    dp.hardware_revision as device_model,
    mp.manufacturer,
    dp.firmware_version,
    dp.install_date,
    dp.status as device_status,
    dp.is_enabled,
    dp.notes,
    
    -- From devices_data
    dd.id as data_id,
    dd.network_status,
    dd.connection_quality,
    dd.signal_strength,
    dd.voltage,
    dd.current_amperage,
    dd.power_factor,
    dd.frequency,
    dd.active_power,
    dd.device_temperature,
    dd.last_data_received,
    dd.data_collection_count,
    
    -- Calculated fields
    CASE 
        WHEN dd.last_data_received > NOW() - INTERVAL '5 minutes' THEN 'recent'
        WHEN dd.last_data_received > NOW() - INTERVAL '1 hour' THEN 'delayed' 
        ELSE 'stale'
    END as data_freshness,
    
    -- Overall health score (0-100)
    LEAST(100, GREATEST(0, 
        COALESCE(dd.connection_quality, 0) * 0.5 +
        CASE WHEN dp.status = 'active' THEN 50 ELSE 0 END
    ))::INTEGER as health_score,
    
    -- Timestamps
    dp.created_at as device_created_at,
    dp.updated_at as device_updated_at,
    dd.updated_at as data_updated_at

FROM devices_prop dp
LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
LEFT JOIN meter_prop mp ON dp.meter_model_id = mp.meter_model_id;

-- View สำหรับ dashboard (ปรับปรุง)
CREATE VIEW devices_dashboard AS
SELECT 
    dp.device_id,
    dp.device_name,
    dp.faculty,
    dp.building,
    dp.status as device_status,
    dd.network_status,
    dd.connection_quality,
    dd.voltage,
    dd.active_power,
    dd.device_temperature,
    dd.last_data_received,
    
    -- Status indicators
    CASE 
        WHEN dd.last_data_received > NOW() - INTERVAL '5 minutes' THEN 'recent'
        WHEN dd.last_data_received > NOW() - INTERVAL '1 hour' THEN 'delayed' 
        ELSE 'stale'
    END as data_freshness,
    
    CASE
        WHEN dp.status = 'active' AND dd.network_status = 'online' THEN 'healthy'
        WHEN dp.status = 'active' AND dd.network_status = 'offline' THEN 'offline'
        WHEN dp.status = 'maintenance' THEN 'maintenance'
        WHEN dp.status = 'error' THEN 'error'
        ELSE 'unknown'
    END as overall_status

FROM devices_prop dp
LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
WHERE dp.is_enabled = true;

-- View สำหรับ monitoring และ alerts
CREATE VIEW devices_monitoring AS
SELECT 
    dp.device_id,
    dp.device_name,
    dp.faculty,
    dd.network_status,
    dd.active_power,
    dd.device_temperature,
    dd.last_data_received,
    
    -- Alert conditions
    CASE WHEN dd.device_temperature > 70 THEN true ELSE false END as temperature_high,
    CASE WHEN dd.last_data_received < NOW() - INTERVAL '10 minutes' THEN true ELSE false END as data_stale,
    
    -- Health indicators
    NOW() - dd.last_data_received as data_age

FROM devices_prop dp
LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
WHERE dp.is_enabled = true AND dp.status = 'active';

-- ================================
-- UTILITY FUNCTIONS
-- ================================

-- Function สำหรับคำนวณพลังงานรวม
CREATE FUNCTION calculate_energy_consumption(
    device_id_param VARCHAR(100),
    start_date DATE,
    end_date DATE
)
RETURNS TABLE(
    device_id VARCHAR(100),
    average_power DECIMAL(12,2),
    peak_power DECIMAL(12,2),
    data_points BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dh.device_id,
        AVG(dh.active_power) as average_power,
        MAX(dh.active_power) as peak_power,
        COUNT(*) as data_points
    FROM devices_history dh
    WHERE dh.device_id = device_id_param
        AND dh.recorded_at::DATE BETWEEN start_date AND end_date
    GROUP BY dh.device_id;
END;
$$ LANGUAGE plpgsql;

-- Function สำหรับ cleanup ข้อมูลเก่า
CREATE FUNCTION cleanup_old_history_data(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM devices_history 
    WHERE recorded_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- SAMPLE DATA FOR TESTING
-- ================================

-- ข้อมูลตัวอย่างถูกย้ายไปยังไฟล์ seeds
-- See: ./seeds/meter_models.sql

-- ================================
-- ENHANCED COMMENTS & DOCUMENTATION
-- ================================

-- Table Comments
COMMENT ON TABLE meter_prop IS 'Master data ข้อมูลสเปคทางเทคนิคของรุ่นมิเตอร์ต่างๆ - ไม่เปลี่ยนแปลงบ่อย';
COMMENT ON TABLE devices_prop IS 'ข้อมูลอุปกรณ์จริงแต่ละตัวที่ติดตั้งในสถานที่ - เปลี่ยนแปลงเป็นครั้งคราว';
COMMENT ON TABLE devices_data IS 'ข้อมูล real-time/สถานะปัจจุบันของอุปกรณ์ - อัปเดตบ่อยมาก';
COMMENT ON TABLE devices_history IS 'ข้อมูลประวัติแบบ time-series สำหรับการวิเคราะห์ - เพิ่มข้อมูลใหม่ตลอดเวลา';

-- Column Comments สำหรับ meter_prop
COMMENT ON COLUMN meter_prop.meter_model_id IS 'รหัสรุ่นมิเตอร์ เช่น SM-2000, AM-150';
COMMENT ON COLUMN meter_prop.accuracy_class IS 'ความแม่นยำของมิเตอร์ เช่น 1.0, 0.5S';

-- Column Comments สำหรับ devices_prop  
COMMENT ON COLUMN devices_prop.device_id IS 'รหัสอุปกรณ์เฉพาะตัว เช่น DEV001, SM-ENG-001';
COMMENT ON COLUMN devices_prop.meter_model_id IS 'อ้างอิงไปยังรุ่นมิเตอร์ใน meter_prop';
COMMENT ON COLUMN devices_prop.faculty IS 'คณะที่ติดตั้งอุปกรณ์';
COMMENT ON COLUMN devices_prop.data_collection_interval IS 'ช่วงเวลาเก็บข้อมูล (วินาที)';

-- Column Comments สำหรับ devices_data
COMMENT ON COLUMN devices_data.device_id IS 'รหัสอุปกรณ์ (Foreign Key) - เก็บข้อมูลปัจจุบัน';
COMMENT ON COLUMN devices_data.active_power IS 'กำลังจริงปัจจุบัน (W)';
COMMENT ON COLUMN devices_data.last_data_received IS 'เวลาที่รับข้อมูลล่าสุด';

-- Column Comments สำหรับ devices_history
COMMENT ON COLUMN devices_history.device_id IS 'รหัสอุปกรณ์ (Foreign Key) - เก็บข้อมูลประวัติ';
COMMENT ON COLUMN devices_history.recorded_at IS 'เวลาที่บันทึกข้อมูลประวัติ';

-- View Comments (updated)
COMMENT ON VIEW devices_complete IS 'View รวมข้อมูลครบถ้วนจาก meter_prop, devices_prop และ devices_data';
COMMENT ON VIEW devices_dashboard IS 'View สำหรับ dashboard พร้อมสถานะและการแจ้งเตือน';
COMMENT ON VIEW devices_monitoring IS 'View สำหรับการตรวจสอบและเฝ้าระวังระบบ';

-- Performance hints
COMMENT ON INDEX idx_devices_history_device_time IS 'Index สำหรับ time-series queries - สำคัญสำหรับการวิเคราะห์ข้อมูลประวัติ';
COMMENT ON INDEX idx_devices_data_last_data_received IS 'Index สำหรับตรวจสอบอุปกรณ์ที่ไม่ส่งข้อมูล';
COMMENT ON INDEX idx_meter_prop_manufacturer IS 'Index สำหรับค้นหาตามผู้ผลิตมิเตอร์';

-- ================================
-- SAMPLE DATA AND TESTING QUERIES
-- ================================

-- Sample insert สำหรับทดสอบ (uncomment เพื่อใช้งาน)
/*
-- เพิ่มข้อมูล meter models ก่อน
INSERT INTO meter_prop (
    meter_model_id, model_name, manufacturer, meter_type, 
    rated_voltage, rated_current, rated_power, accuracy_class
) VALUES 
    ('SM001', 'Smart Meter 2000', 'PowerTech', 'digital', 220.0, 10.0, 2200.0, '1.0'),
    ('PM001', 'Power Monitor Pro', 'Schneider', 'digital', 380.0, 16.0, 6080.0, '0.5S');

-- เพิ่มข้อมูล devices
INSERT INTO devices_prop (
    device_id, device_name, faculty, building,
    meter_model_id, connection_type
) VALUES 
    ('DEV001', 'Smart Meter - Engineering Lab 1', 'Engineering', 'Building A', 'SM001', 'wifi'),
    ('DEV002', 'Power Monitor - Library', 'Liberal Arts', 'Library Building', 'PM001', 'ethernet');

-- Sample queries สำหรับทดสอบ
SELECT * FROM devices_dashboard WHERE faculty = 'Engineering';
SELECT * FROM devices_monitoring WHERE temperature_high = true;
SELECT * FROM calculate_energy_consumption('DEV001', '2025-01-01', '2025-01-31');
*/