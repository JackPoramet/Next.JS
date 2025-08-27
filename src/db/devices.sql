-- ================================================================
-- NORMALIZED DATABASE SCHEMA FOR ENERGY MONITORING SYSTEM (FIXED)
-- ================================================================
-- Normalization Level: 3NF (Third Normal Form)
-- Architecture: Proper normalized relationships with lookup tables
-- Fixed Issues:
-- 1. Removed non-existent column references
-- 2. Fixed foreign key constraints
-- 3. Added missing indexes
-- 4. Corrected view definitions
-- 5. Fixed trigger functions
-- ================================================================

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

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_devices_prop_updated_at ON devices_prop CASCADE;
DROP TRIGGER IF EXISTS update_devices_data_updated_at ON devices_data CASCADE;
DROP TRIGGER IF EXISTS trigger_create_initial_device_data ON devices_prop CASCADE;
DROP TRIGGER IF EXISTS trigger_archive_device_data ON devices_data CASCADE;

-- Drop tables in correct order (child tables first)
DROP TABLE IF EXISTS device_approval_history CASCADE;
DROP TABLE IF EXISTS devices_rejected CASCADE;
DROP TABLE IF EXISTS devices_pending CASCADE;
DROP TABLE IF EXISTS devices_history CASCADE;
DROP TABLE IF EXISTS devices_data CASCADE;
DROP TABLE IF EXISTS devices_prop CASCADE;
DROP TABLE IF EXISTS meter_prop CASCADE;
DROP TABLE IF EXISTS device_models CASCADE;
DROP TABLE IF EXISTS manufacturers CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS responsible_persons CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;
DROP TABLE IF EXISTS power_specifications CASCADE;
DROP TABLE IF EXISTS device_approval_status CASCADE;

-- Drop ENUM types
DROP TYPE IF EXISTS device_status_enum CASCADE;
DROP TYPE IF EXISTS network_status_enum CASCADE;
DROP TYPE IF EXISTS meter_type_enum CASCADE;
DROP TYPE IF EXISTS connection_type_enum CASCADE;
DROP TYPE IF EXISTS power_phase_enum CASCADE;

-- ================================
-- CREATE ENUM TYPES
-- ================================
CREATE TYPE device_status_enum AS ENUM ('active', 'inactive', 'maintenance', 'error');
CREATE TYPE network_status_enum AS ENUM ('online', 'offline', 'error');
CREATE TYPE meter_type_enum AS ENUM ('digital', 'analog');
CREATE TYPE connection_type_enum AS ENUM ('wifi', 'ethernet');
CREATE TYPE power_phase_enum AS ENUM ('single', 'three');

-- ================================
-- CREATE IMMUTABLE FUNCTIONS FIRST
-- ================================
CREATE OR REPLACE FUNCTION immutable_date_trunc_day(timestamp with time zone)
RETURNS date AS $$
BEGIN
    RETURN $1::date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION immutable_date_trunc_hour(timestamp with time zone)
RETURNS timestamp with time zone AS $$
BEGIN
    RETURN date_trunc('hour', $1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================
-- CREATE TRIGGER FUNCTION
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- NORMALIZED LOOKUP TABLES (1NF, 2NF, 3NF)
-- ================================================================

-- TABLE: DEVICE_APPROVAL_STATUS (Normalized status reference) - CREATE FIRST
CREATE TABLE device_approval_status (
    id SERIAL PRIMARY KEY,
    status_code VARCHAR(20) UNIQUE NOT NULL,
    status_name VARCHAR(100) NOT NULL,
    status_description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default approval statuses
INSERT INTO device_approval_status (status_code, status_name, status_description, sort_order) VALUES
('pending', 'Pending Approval', 'Device is waiting for admin approval', 1),
('approved', 'Approved', 'Device has been approved and is operational', 2),
('rejected', 'Rejected', 'Device has been rejected by admin', 3);

-- Add table comments
COMMENT ON TABLE device_approval_status IS 'ตารางเก็บสถานะการอนุมัติอุปกรณ์ IoT (รออนุมัติ, อนุมัติแล้ว, ปฏิเสธ)';

-- TABLE: MANUFACTURERS (Normalized - eliminates redundancy)
CREATE TABLE manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(50),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE manufacturers IS 'ตารางเก็บข้อมูลผู้ผลิตอุปกรณ์ IoT และเครื่องวัดพลังงาน';

-- TABLE: POWER_SPECIFICATIONS (Normalized - separates power specs)
CREATE TABLE power_specifications (
    id SERIAL PRIMARY KEY,
    rated_voltage DECIMAL(8, 2) NOT NULL CHECK (rated_voltage > 0),
    rated_current DECIMAL(8, 2) NOT NULL CHECK (rated_current > 0),
    rated_power DECIMAL(10, 2) NOT NULL CHECK (rated_power > 0),
    power_phase power_phase_enum NOT NULL DEFAULT 'single',
    frequency DECIMAL(5, 2) DEFAULT 50.0,
    accuracy VARCHAR(10),
    -- Create unique constraint for common combinations
    CONSTRAINT unique_power_spec UNIQUE (rated_voltage, rated_current, rated_power, power_phase),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE power_specifications IS 'ตารางเก็บข้อมูลสเปคด้านไฟฟ้าของเครื่องวัดพลังงาน (แรงดัน กระแส กำลังไฟ)';

-- TABLE: DEVICE_MODELS (Normalized - separates device model info)
CREATE TABLE device_models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    manufacturer_id INTEGER NOT NULL,
    supported_connections connection_type_enum[],
    -- Create unique constraint
    CONSTRAINT unique_device_model UNIQUE (model_name, manufacturer_id),
    -- Foreign Keys
    CONSTRAINT fk_device_models_manufacturer 
        FOREIGN KEY (manufacturer_id) 
        REFERENCES manufacturers(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE device_models IS 'ตารางเก็บข้อมูลรุ่นและโมเดลของอุปกรณ์ IoT แต่ละประเภท';

-- TABLE: FACULTIES (Normalized - separates faculty info)
CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    faculty_code VARCHAR(30) UNIQUE NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE faculties IS 'ตารางเก็บข้อมูลคณะและหน่วยงานต่างๆ ในมหาวิทยาลัย';

-- ================================================================
-- TABLE: RESPONSIBLE_PERSONS (ผู้รับผิดชอบ/ผู้ดูแลอุปกรณ์)
-- ================================================================
CREATE TABLE IF NOT EXISTS responsible_persons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    faculty_id INTEGER REFERENCES faculties(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance on responsible_persons
CREATE INDEX IF NOT EXISTS idx_responsible_persons_faculty_id ON responsible_persons(faculty_id);
CREATE INDEX IF NOT EXISTS idx_responsible_persons_is_active ON responsible_persons(is_active);
CREATE INDEX IF NOT EXISTS idx_responsible_persons_email ON responsible_persons(email);

-- Create trigger to update updated_at timestamp for responsible_persons
CREATE OR REPLACE FUNCTION update_responsible_persons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_responsible_persons_updated_at
    BEFORE UPDATE ON responsible_persons
    FOR EACH ROW
    EXECUTE FUNCTION update_responsible_persons_updated_at();

-- Add comments for responsible_persons table
COMMENT ON TABLE responsible_persons IS 'ตารางเก็บข้อมูลผู้รับผิดชอบอุปกรณ์ IoT';
COMMENT ON COLUMN responsible_persons.name IS 'ชื่อ-นามสกุล ผู้รับผิดชอบ';
COMMENT ON COLUMN responsible_persons.email IS 'อีเมล (ใช้เป็น unique identifier)';
COMMENT ON COLUMN responsible_persons.phone IS 'หมายเลขโทรศัพท์';
COMMENT ON COLUMN responsible_persons.department IS 'ภาควิชา/หน่วยงาน';
COMMENT ON COLUMN responsible_persons.position IS 'ตำแหน่ง';
COMMENT ON COLUMN responsible_persons.faculty_id IS 'รหัสคณะที่สังกัด';
COMMENT ON COLUMN responsible_persons.is_active IS 'สถานะการใช้งาน';

-- TABLE: LOCATIONS (Normalized - hierarchical location structure)
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(50),
    room VARCHAR(50),
    -- Create unique constraint for location combination
    CONSTRAINT unique_location UNIQUE (faculty_id, building, floor, room),
    -- Foreign Keys
    CONSTRAINT fk_locations_faculty 
        FOREIGN KEY (faculty_id) 
        REFERENCES faculties(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE locations IS 'ตารางเก็บข้อมูลตำแหน่งที่ตั้งของอุปกรณ์ (อาคาร ชั้น ห้อง)';

-- ================================================================
-- MAIN NORMALIZED TABLES
-- ================================================================

-- TABLE: METER_PROP (Normalized - includes meter model information)
CREATE TABLE meter_prop (
    -- Primary Key
    meter_id SERIAL PRIMARY KEY,
    -- Meter Model Information
    model_name VARCHAR(255) NOT NULL,
    manufacturer_id INTEGER NOT NULL,
    power_spec_id INTEGER NOT NULL,
    meter_type meter_type_enum NOT NULL DEFAULT 'digital',
    -- Additional meter properties
    manufacture_date DATE,
    -- Create unique constraint for model name and manufacturer
    CONSTRAINT unique_meter_prop_model UNIQUE (model_name, manufacturer_id),
    -- Foreign Keys
    CONSTRAINT fk_meter_prop_manufacturer 
        FOREIGN KEY (manufacturer_id) 
        REFERENCES manufacturers(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_meter_prop_power_spec 
        FOREIGN KEY (power_spec_id) 
        REFERENCES power_specifications(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE meter_prop IS 'ตารางเก็บข้อมูลคุณสมบัติและสเปคของเครื่องวัดพลังงาน';

-- TABLE: DEVICES_PROP (Normalized - references lookup tables)
CREATE TABLE devices_prop (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    -- Device Identification
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    -- Foreign Keys to normalized tables
    device_model_id INTEGER,
    meter_id INTEGER UNIQUE, -- 1:1 relationship maintained
    location_id INTEGER,
    -- Installation Information
    install_date DATE,
    -- Network Configuration
    ip_address INET,
    mac_address MACADDR,
    connection_type connection_type_enum DEFAULT 'wifi',
    -- Device Configuration
    data_collection_interval INTEGER DEFAULT 60,
    -- Administrative Information
    responsible_person VARCHAR(255),
    contact_info VARCHAR(255),
    -- Current Status
    status device_status_enum NOT NULL DEFAULT 'active',
    is_enabled BOOLEAN DEFAULT true,
    -- Approval and Responsibility
    approval_status_id INTEGER DEFAULT 2, -- Default to 'approved'
    responsible_person_id INTEGER,
    -- Additional fields for MQTT data and device type
    device_type VARCHAR(100),
    firmware_version VARCHAR(50),
    mqtt_data JSONB,
    -- Foreign Key Constraints
    CONSTRAINT fk_devices_prop_device_model 
        FOREIGN KEY (device_model_id) 
        REFERENCES device_models(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_devices_prop_meter 
        FOREIGN KEY (meter_id) 
        REFERENCES meter_prop(meter_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_devices_prop_location 
        FOREIGN KEY (location_id) 
        REFERENCES locations(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_devices_prop_approval_status 
        FOREIGN KEY (approval_status_id) 
        REFERENCES device_approval_status(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_devices_prop_responsible_person 
        FOREIGN KEY (responsible_person_id) 
        REFERENCES responsible_persons(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE devices_prop IS 'ตารางเก็บข้อมูลคุณสมบัติและการกำหนดค่าของอุปกรณ์ IoT แต่ละตัว';

-- TABLE: DEVICES_DATA (Real-time Current Data)
CREATE TABLE devices_data (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    -- Foreign Key to devices_prop
    device_id VARCHAR(100) NOT NULL,
    -- Network Status
    network_status network_status_enum DEFAULT 'offline',
    connection_quality INTEGER DEFAULT 0 CHECK (connection_quality BETWEEN 0 AND 100),
    signal_strength INTEGER CHECK (signal_strength BETWEEN -120 AND 0),
    -- Current Electrical Readings
    voltage DECIMAL(8, 2) CHECK (voltage >= 0),
    current_amperage DECIMAL(8, 2) CHECK (current_amperage >= 0),
    power_factor DECIMAL(4, 3) CHECK (power_factor BETWEEN -1 AND 1),
    frequency DECIMAL(5, 2) CHECK (frequency BETWEEN 40 AND 70),
    -- 3-Phase Specific Readings
    voltage_phase_b DECIMAL(8, 2) CHECK (voltage_phase_b IS NULL OR voltage_phase_b >= 0),
    voltage_phase_c DECIMAL(8, 2) CHECK (voltage_phase_c IS NULL OR voltage_phase_c >= 0),
    current_phase_b DECIMAL(8, 2) CHECK (current_phase_b IS NULL OR current_phase_b >= 0),
    current_phase_c DECIMAL(8, 2) CHECK (current_phase_c IS NULL OR current_phase_c >= 0),
    power_factor_phase_b DECIMAL(4, 3) CHECK (power_factor_phase_b IS NULL OR power_factor_phase_b BETWEEN -1 AND 1),
    power_factor_phase_c DECIMAL(4, 3) CHECK (power_factor_phase_c IS NULL OR power_factor_phase_c BETWEEN -1 AND 1),
    -- Power Measurements
    active_power DECIMAL(12, 2) CHECK (active_power >= 0),
    reactive_power DECIMAL(12, 2),
    apparent_power DECIMAL(12, 2) CHECK (apparent_power >= 0),
    -- 3-Phase Power Measurements
    active_power_phase_a DECIMAL(12, 2) CHECK (active_power_phase_a IS NULL OR active_power_phase_a >= 0),
    active_power_phase_b DECIMAL(12, 2) CHECK (active_power_phase_b IS NULL OR active_power_phase_b >= 0),
    active_power_phase_c DECIMAL(12, 2) CHECK (active_power_phase_c IS NULL OR active_power_phase_c >= 0),
    -- Environmental Monitoring
    device_temperature DECIMAL(5, 2) CHECK (device_temperature BETWEEN -40 AND 85),
    -- Energy Measurements
    total_energy DECIMAL(15, 3) DEFAULT 0,
    daily_energy DECIMAL(10, 3) DEFAULT 0,
    -- Device Health Indicators
    uptime_hours BIGINT DEFAULT 0,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    -- Data Collection Information
    last_data_received TIMESTAMP WITH TIME ZONE,
    data_collection_count BIGINT DEFAULT 0,
    -- Error Information
    last_error_code VARCHAR(50),
    last_error_message TEXT,
    last_error_time TIMESTAMP WITH TIME ZONE,
    error_count_today INTEGER DEFAULT 0,
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

COMMENT ON TABLE devices_data IS 'ตารางเก็บข้อมูลการทำงานและค่าวัดแบบ Real-time ของอุปกรณ์ IoT';

-- TABLE: DEVICES_HISTORY (Historical Time-Series Data)
CREATE TABLE devices_history (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    -- Foreign Key to devices_prop
    device_id VARCHAR(100) NOT NULL,
    -- Timestamp for this historical record
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Current Electrical Readings
    voltage DECIMAL(8, 2) CHECK (voltage >= 0),
    current_amperage DECIMAL(8, 2) CHECK (current_amperage >= 0),
    power_factor DECIMAL(4, 3) CHECK (power_factor BETWEEN -1 AND 1),
    frequency DECIMAL(5, 2) CHECK (frequency BETWEEN 40 AND 70),
    -- 3-Phase Specific Readings
    voltage_phase_b DECIMAL(8, 2) CHECK (voltage_phase_b IS NULL OR voltage_phase_b >= 0),
    voltage_phase_c DECIMAL(8, 2) CHECK (voltage_phase_c IS NULL OR voltage_phase_c >= 0),
    current_phase_b DECIMAL(8, 2) CHECK (current_phase_b IS NULL OR current_phase_b >= 0),
    current_phase_c DECIMAL(8, 2) CHECK (current_phase_c IS NULL OR current_phase_c >= 0),
    power_factor_phase_b DECIMAL(4, 3) CHECK (power_factor_phase_b IS NULL OR power_factor_phase_b BETWEEN -1 AND 1),
    power_factor_phase_c DECIMAL(4, 3) CHECK (power_factor_phase_c IS NULL OR power_factor_phase_c BETWEEN -1 AND 1),
    -- Power Measurements
    active_power DECIMAL(12, 2) CHECK (active_power >= 0),
    reactive_power DECIMAL(12, 2),
    apparent_power DECIMAL(12, 2) CHECK (apparent_power >= 0),
    -- 3-Phase Power Measurements
    active_power_phase_a DECIMAL(12, 2) CHECK (active_power_phase_a IS NULL OR active_power_phase_a >= 0),
    active_power_phase_b DECIMAL(12, 2) CHECK (active_power_phase_b IS NULL OR active_power_phase_b >= 0),
    active_power_phase_c DECIMAL(12, 2) CHECK (active_power_phase_c IS NULL OR active_power_phase_c >= 0),
    -- Energy Measurements
    total_energy DECIMAL(15, 3) DEFAULT 0,
    daily_energy DECIMAL(10, 3) DEFAULT 0,
    total_energy_import DECIMAL(15, 3) DEFAULT 0,
    total_energy_export DECIMAL(15, 3) DEFAULT 0,
    -- Environmental Monitoring
    device_temperature DECIMAL(5, 2) CHECK (device_temperature BETWEEN -40 AND 85),
    -- Connection Quality
    connection_quality INTEGER DEFAULT 0 CHECK (connection_quality BETWEEN 0 AND 100),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Foreign Key Constraint
    CONSTRAINT fk_devices_history_device_id 
        FOREIGN KEY (device_id) 
        REFERENCES devices_prop(device_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

COMMENT ON TABLE devices_history IS 'ตารางเก็บข้อมูลประวัติการทำงานและค่าวัดแบบ Time-series ของอุปกรณ์ IoT';

-- ================================
-- CREATE INDEXES FOR PERFORMANCE
-- ================================

-- Indexes for lookup tables
CREATE INDEX idx_device_approval_status_code ON device_approval_status(status_code);
CREATE INDEX idx_device_approval_status_active ON device_approval_status(is_active) WHERE is_active = true;
CREATE INDEX idx_manufacturers_name ON manufacturers(name);
CREATE INDEX idx_device_models_manufacturer ON device_models(manufacturer_id);
CREATE INDEX idx_faculties_code ON faculties(faculty_code);
CREATE INDEX idx_locations_faculty ON locations(faculty_id);
CREATE INDEX idx_locations_building ON locations(faculty_id, building);

-- Indexes for main tables
CREATE INDEX idx_meter_prop_manufacturer ON meter_prop(manufacturer_id);
CREATE INDEX idx_meter_prop_power_spec ON meter_prop(power_spec_id);
CREATE INDEX idx_meter_prop_model_name ON meter_prop(model_name);

CREATE INDEX idx_devices_prop_device_id ON devices_prop(device_id);
CREATE INDEX idx_devices_prop_meter_id ON devices_prop(meter_id);
CREATE INDEX idx_devices_prop_device_model ON devices_prop(device_model_id);
CREATE INDEX idx_devices_prop_location ON devices_prop(location_id);
CREATE INDEX idx_devices_prop_status ON devices_prop(status, is_enabled);

CREATE INDEX idx_devices_data_device_id ON devices_data(device_id);
CREATE INDEX idx_devices_data_network_status ON devices_data(network_status);
CREATE INDEX idx_devices_data_last_data_received ON devices_data(last_data_received DESC);
CREATE INDEX idx_devices_data_updated_at ON devices_data(updated_at DESC);
CREATE INDEX idx_devices_data_active_power ON devices_data(active_power);
CREATE INDEX idx_devices_data_device_temp ON devices_data(device_temperature);
CREATE INDEX idx_devices_data_voltage_current ON devices_data(voltage, current_amperage);

CREATE INDEX idx_devices_history_device_time ON devices_history(device_id, recorded_at DESC);
CREATE INDEX idx_devices_history_recorded_at ON devices_history(recorded_at DESC);
CREATE INDEX idx_devices_history_device_id ON devices_history(device_id);
CREATE INDEX idx_devices_history_power ON devices_history(device_id, active_power, recorded_at DESC);

-- ================================
-- CREATE TRIGGERS FOR ALL TABLES
-- ================================

-- Triggers for lookup tables
CREATE TRIGGER trigger_device_approval_status_updated_at
    BEFORE UPDATE ON device_approval_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_manufacturers_updated_at
    BEFORE UPDATE ON manufacturers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_power_specifications_updated_at
    BEFORE UPDATE ON power_specifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_device_models_updated_at
    BEFORE UPDATE ON device_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_faculties_updated_at
    BEFORE UPDATE ON faculties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for main tables
CREATE TRIGGER trigger_meter_prop_updated_at
    BEFORE UPDATE ON meter_prop
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_devices_prop_updated_at
    BEFORE UPDATE ON devices_prop
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_data_updated_at 
    BEFORE UPDATE ON devices_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- CREATE TRIGGER FUNCTIONS
-- ================================

-- Trigger function for creating initial device data
CREATE OR REPLACE FUNCTION create_initial_device_data()
RETURNS trigger AS $$
BEGIN
    INSERT INTO devices_data (device_id, network_status, created_at, updated_at)
    VALUES (NEW.device_id, 'offline', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for archiving device data
CREATE OR REPLACE FUNCTION archive_device_data()
RETURNS trigger AS $$
BEGIN
    -- Archive significant changes only
    IF (OLD.active_power IS DISTINCT FROM NEW.active_power
        OR OLD.voltage IS DISTINCT FROM NEW.voltage
        OR OLD.current_amperage IS DISTINCT FROM NEW.current_amperage) THEN
        
        INSERT INTO devices_history (
            device_id, voltage, current_amperage, active_power, 
            power_factor, recorded_at
        )
        VALUES (
            NEW.device_id, NEW.voltage, NEW.current_amperage, NEW.active_power,
            NEW.power_factor, NEW.updated_at
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- CREATE TRIGGERS
-- ================================

CREATE TRIGGER trigger_create_initial_device_data
    AFTER INSERT ON devices_prop
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_device_data();

CREATE TRIGGER trigger_archive_device_data
    AFTER UPDATE ON devices_data
    FOR EACH ROW
    EXECUTE FUNCTION archive_device_data();

-- ================================
-- CREATE UTILITY FUNCTIONS
-- ================================

-- Function for calculating energy consumption
CREATE OR REPLACE FUNCTION calculate_energy_consumption(
    device_id_param VARCHAR(100),
    start_date DATE,
    end_date DATE
)
RETURNS TABLE(
    device_id VARCHAR(100),
    average_power DECIMAL(12, 2),
    peak_power DECIMAL(12, 2),
    data_points BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dh.device_id,
        AVG(dh.active_power) AS average_power,
        MAX(dh.active_power) AS peak_power,
        COUNT(*) AS data_points
    FROM devices_history dh
    WHERE dh.device_id = device_id_param
        AND dh.recorded_at::DATE BETWEEN start_date AND end_date
    GROUP BY dh.device_id;
END;
$$ LANGUAGE plpgsql;

-- Function for cleanup old history data
CREATE OR REPLACE FUNCTION cleanup_old_history_data(days_to_keep INTEGER DEFAULT 365)
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
-- CREATE NORMALIZED VIEWS
-- ================================

-- Complete device view with all normalized information
CREATE VIEW devices_complete AS
SELECT
    -- Device identification
    dp.id,
    dp.device_id,
    dp.device_name,
    -- Location information (denormalized for ease of use)
    f.faculty_name,
    f.faculty_code,
    l.building,
    l.floor,
    l.room,
    -- Device model information
    dm.model_name AS device_model_name,
    dm_mfg.name AS device_manufacturer,
    -- Meter information
    mp.meter_id,
    mp.model_name AS meter_model_name,
    mm_mfg.name AS meter_manufacturer,
    mp.meter_type,
    -- Power specifications
    ps.rated_voltage,
    ps.rated_current,
    ps.rated_power,
    ps.power_phase,
    ps.accuracy,
    -- Device status
    dp.status AS device_status,
    dp.is_enabled,
    -- Real-time data
    dd.network_status,
    dd.voltage,
    dd.current_amperage,
    dd.active_power,
    dd.device_temperature,
    dd.last_data_received,
    -- Timestamps
    dp.created_at,
    dp.updated_at,
    dd.updated_at AS data_updated_at
FROM devices_prop dp
INNER JOIN locations l ON dp.location_id = l.id
INNER JOIN faculties f ON l.faculty_id = f.id
INNER JOIN device_models dm ON dp.device_model_id = dm.id
INNER JOIN manufacturers dm_mfg ON dm.manufacturer_id = dm_mfg.id
INNER JOIN meter_prop mp ON dp.meter_id = mp.meter_id
INNER JOIN manufacturers mm_mfg ON mp.manufacturer_id = mm_mfg.id
INNER JOIN power_specifications ps ON mp.power_spec_id = ps.id
LEFT JOIN devices_data dd ON dp.device_id = dd.device_id;

-- Dashboard summary view (normalized)
CREATE VIEW devices_dashboard AS
SELECT
    dp.device_id,
    dp.device_name,
    f.faculty_name,
    l.building,
    dm_mfg.name AS device_manufacturer,
    dm.model_name AS device_model_name,
    mm_mfg.name AS meter_manufacturer,
    mp.model_name AS meter_model_name,
    ps.power_phase,
    dp.status,
    dd.network_status,
    dd.active_power,
    dd.last_data_received,
    -- Status indicators
    CASE
        WHEN dd.last_data_received > NOW() - INTERVAL '5 minutes' THEN 'recent'
        WHEN dd.last_data_received > NOW() - INTERVAL '1 hour' THEN 'delayed'
        ELSE 'stale'
    END AS data_freshness,
    CASE
        WHEN dp.status = 'active' AND dd.network_status = 'online' THEN 'healthy'
        WHEN dp.status = 'active' AND dd.network_status = 'offline' THEN 'offline'
        WHEN dp.status = 'maintenance' THEN 'maintenance'
        WHEN dp.status = 'error' THEN 'error'
        ELSE 'unknown'
    END AS overall_status
FROM devices_prop dp
INNER JOIN locations l ON dp.location_id = l.id
INNER JOIN faculties f ON l.faculty_id = f.id
INNER JOIN device_models dm ON dp.device_model_id = dm.id
INNER JOIN manufacturers dm_mfg ON dm.manufacturer_id = dm_mfg.id
INNER JOIN meter_prop mp ON dp.meter_id = mp.meter_id
INNER JOIN manufacturers mm_mfg ON mp.manufacturer_id = mm_mfg.id
INNER JOIN power_specifications ps ON mp.power_spec_id = ps.id
LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
WHERE dp.is_enabled = true;

-- View for monitoring and alerts (normalized)
CREATE VIEW devices_monitoring AS
SELECT
    dp.device_id,
    dp.device_name,
    f.faculty_name,
    l.building,
    dm_mfg.name AS device_manufacturer,
    dm.model_name AS device_model_name,
    mm_mfg.name AS meter_manufacturer,
    mp.model_name AS meter_model_name,
    dd.network_status,
    dd.active_power,
    dd.device_temperature,
    dd.last_data_received,
    -- Alert conditions
    CASE
        WHEN dd.device_temperature > 70 THEN true
        ELSE false
    END AS temperature_high,
    CASE
        WHEN dd.last_data_received < NOW() - INTERVAL '10 minutes' THEN true
        ELSE false
    END AS data_stale,
    -- Health indicators
    NOW() - dd.last_data_received AS data_age
FROM devices_prop dp
INNER JOIN locations l ON dp.location_id = l.id
INNER JOIN faculties f ON l.faculty_id = f.id
INNER JOIN device_models dm ON dp.device_model_id = dm.id
INNER JOIN manufacturers dm_mfg ON dm.manufacturer_id = dm_mfg.id
INNER JOIN meter_prop mp ON dp.meter_id = mp.meter_id
INNER JOIN manufacturers mm_mfg ON mp.manufacturer_id = mm_mfg.id
LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
WHERE dp.is_enabled = true AND dp.status = 'active';

-- ================================================================
-- SIMPLIFIED NORMALIZED DEVICE APPROVAL SYSTEM
-- ================================================================

-- TABLE: DEVICES_PENDING (อุปกรณ์ที่รออนุมัติ - เรียบง่าย)
CREATE TABLE devices_pending (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Device Identification
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    
    -- Approval Status (Foreign Key to normalized table)
    approval_status_id INTEGER NOT NULL DEFAULT 1, -- Default to 'pending'
    
    -- Device Information from MQTT Discovery
    device_type VARCHAR(100),
    firmware_version VARCHAR(50),
    mac_address MACADDR,
    ip_address INET,
    connection_type connection_type_enum DEFAULT 'wifi',
    
    -- Raw MQTT Data (เก็บข้อมูลดิบจาก MQTT /prop)
    mqtt_data JSONB NOT NULL,
    
    -- Discovery Information
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    discovery_source VARCHAR(50) DEFAULT 'mqtt',
    
    -- Foreign Key Constraints
    CONSTRAINT fk_devices_pending_approval_status 
        FOREIGN KEY (approval_status_id) 
        REFERENCES device_approval_status(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE devices_pending IS 'ตารางเก็บข้อมูลอุปกรณ์ IoT ที่รออนุมัติจากผู้ดูแลระบบ';

-- TABLE: DEVICES_REJECTED (อุปกรณ์ที่ถูกปฏิเสธ)
CREATE TABLE devices_rejected (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Device Identification (ข้อมูลจาก devices_pending)
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(100),
    firmware_version VARCHAR(50),
    mac_address MACADDR,
    ip_address INET,
    connection_type connection_type_enum,
    
    -- Approval Status (Foreign Key to normalized table)
    approval_status_id INTEGER NOT NULL DEFAULT 3, -- Default to 'rejected'
    
    -- Original MQTT Data
    original_mqtt_data JSONB,
    
    -- Rejection Information
    rejected_by_name VARCHAR(255), -- Store name instead of foreign key
    rejected_by_email VARCHAR(255), -- Store email for reference
    rejection_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rejection_reason TEXT,
    
    -- Original Discovery Information
    original_discovered_at TIMESTAMP WITH TIME ZONE,
    
    -- Resubmission tracking
    can_resubmit BOOLEAN DEFAULT true,
    resubmit_after TIMESTAMP WITH TIME ZONE,
    resubmission_count INTEGER DEFAULT 0,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_devices_rejected_approval_status 
        FOREIGN KEY (approval_status_id) 
        REFERENCES device_approval_status(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Constraints
    CHECK (resubmission_count >= 0),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE devices_rejected IS 'ตารางเก็บข้อมูลอุปกรณ์ IoT ที่ถูกปฏิเสธการอนุมัติ';

-- Update devices_prop to include approval_status_id and responsible_person_id
-- (These columns are already defined in the CREATE TABLE statement above)

-- TABLE: DEVICE_APPROVAL_HISTORY (ประวัติการอนุมัติ)
CREATE TABLE device_approval_history (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'discovered', 'approved', 'rejected', 'moved_to_operational'
    previous_status_id INTEGER,
    new_status_id INTEGER,
    performed_by_name VARCHAR(255), -- Store name instead of foreign key
    performed_by_email VARCHAR(255), -- Store email for reference
    action_reason TEXT,
    action_data JSONB, -- เก็บข้อมูลเพิ่มเติมของการกระทำ
    
    -- Foreign Keys
    CONSTRAINT fk_device_approval_history_previous_status 
        FOREIGN KEY (previous_status_id) 
        REFERENCES device_approval_status(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
        
    CONSTRAINT fk_device_approval_history_new_status 
        FOREIGN KEY (new_status_id) 
        REFERENCES device_approval_status(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE device_approval_history IS 'ตารางเก็บประวัติการอนุมัติและการปฏิเสธอุปกรณ์ IoT';

-- ================================
-- SIMPLIFIED FUNCTIONS FOR DEVICE APPROVAL WORKFLOW
-- ================================

-- Function to approve device and move to devices_prop
CREATE OR REPLACE FUNCTION approve_device(
    p_device_id VARCHAR(100),
    p_approved_by_name VARCHAR(255),
    p_approved_by_email VARCHAR(255) DEFAULT NULL,
    p_approval_notes TEXT DEFAULT NULL,
    p_location_id INTEGER DEFAULT NULL,
    p_meter_id INTEGER DEFAULT NULL,
    p_device_model_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    pending_device RECORD;
BEGIN
    -- Get pending device
    SELECT * INTO pending_device 
    FROM devices_pending 
    WHERE device_id = p_device_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Device % not found in pending devices', p_device_id;
    END IF;
    
    -- Insert into devices_prop
    INSERT INTO devices_prop (
        device_id,
        device_name,
        device_model_id,
        meter_id,
        location_id,
        install_date,
        ip_address,
        mac_address,
        connection_type,
        status,
        is_enabled,
        approval_status_id,
        device_type,
        firmware_version,
        mqtt_data
    ) VALUES (
        pending_device.device_id,
        pending_device.device_name,
        p_device_model_id,
        p_meter_id,
        p_location_id,
        CURRENT_DATE,
        pending_device.ip_address,
        pending_device.mac_address,
        pending_device.connection_type,
        'active',
        true,
        2, -- 'approved' status
        pending_device.device_type,
        pending_device.firmware_version,
        pending_device.mqtt_data
    );
    
    -- Create initial device_data record
    INSERT INTO devices_data (
        device_id,
        network_status,
        connection_quality
    ) VALUES (
        pending_device.device_id,
        'offline',
        0
    );
    
    -- Log approval history
    INSERT INTO device_approval_history (
        device_id,
        action,
        previous_status_id,
        new_status_id,
        performed_by_name,
        performed_by_email,
        action_reason,
        action_data
    ) VALUES (
        p_device_id,
        'approved',
        1, -- 'pending' status
        2, -- 'approved' status
        p_approved_by_name,
        p_approved_by_email,
        p_approval_notes,
        jsonb_build_object(
            'approved_at', CURRENT_TIMESTAMP,
            'moved_to_devices_prop', true,
            'location_id', p_location_id,
            'meter_id', p_meter_id,
            'device_model_id', p_device_model_id
        )
    );
    
    -- Remove from pending devices
    DELETE FROM devices_pending WHERE device_id = p_device_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reject device and move to devices_rejected
CREATE OR REPLACE FUNCTION reject_device(
    p_device_id VARCHAR(100),
    p_rejected_by_name VARCHAR(255),
    p_rejected_by_email VARCHAR(255) DEFAULT NULL,
    p_rejection_reason TEXT DEFAULT 'Device rejected by administrator',
    p_can_resubmit BOOLEAN DEFAULT true
)
RETURNS BOOLEAN AS $$
DECLARE
    pending_device RECORD;
BEGIN
    -- Get pending device
    SELECT * INTO pending_device 
    FROM devices_pending 
    WHERE device_id = p_device_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Device % not found in pending devices', p_device_id;
    END IF;
    
    -- Insert into devices_rejected
    INSERT INTO devices_rejected (
        device_id,
        device_name,
        device_type,
        firmware_version,
        mac_address,
        ip_address,
        connection_type,
        approval_status_id,
        original_mqtt_data,
        rejected_by_name,
        rejected_by_email,
        rejection_reason,
        original_discovered_at,
        can_resubmit
    ) VALUES (
        pending_device.device_id,
        pending_device.device_name,
        pending_device.device_type,
        pending_device.firmware_version,
        pending_device.mac_address,
        pending_device.ip_address,
        pending_device.connection_type,
        3, -- 'rejected' status
        pending_device.mqtt_data,
        p_rejected_by_name,
        p_rejected_by_email,
        p_rejection_reason,
        pending_device.discovered_at,
        p_can_resubmit
    );
    
    -- Log rejection history
    INSERT INTO device_approval_history (
        device_id,
        action,
        previous_status_id,
        new_status_id,
        performed_by_name,
        performed_by_email,
        action_reason,
        action_data
    ) VALUES (
        p_device_id,
        'rejected',
        1, -- 'pending' status
        3, -- 'rejected' status
        p_rejected_by_name,
        p_rejected_by_email,
        p_rejection_reason,
        jsonb_build_object(
            'can_resubmit', p_can_resubmit,
            'rejected_at', CURRENT_TIMESTAMP
        )
    );
    
    -- Remove from pending devices
    DELETE FROM devices_pending WHERE device_id = p_device_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Indexes already created above in appropriate sections

-- devices_pending indexes (simplified)
CREATE INDEX idx_devices_pending_device_id ON devices_pending(device_id);
CREATE INDEX idx_devices_pending_discovered_at ON devices_pending(discovered_at DESC);
CREATE INDEX idx_devices_pending_last_seen ON devices_pending(last_seen_at DESC);
CREATE INDEX idx_devices_pending_approval_status ON devices_pending(approval_status_id);
CREATE INDEX idx_devices_pending_device_type ON devices_pending(device_type);

-- GIN index for JSONB
CREATE INDEX idx_devices_pending_mqtt_data_gin ON devices_pending USING GIN (mqtt_data);

-- devices_rejected indexes
CREATE INDEX idx_devices_rejected_device_id ON devices_rejected(device_id);
CREATE INDEX idx_devices_rejected_rejection_date ON devices_rejected(rejection_date DESC);
CREATE INDEX idx_devices_rejected_rejected_by_name ON devices_rejected(rejected_by_name);
CREATE INDEX idx_devices_rejected_can_resubmit ON devices_rejected(can_resubmit) WHERE can_resubmit = true;

-- device_approval_history indexes
CREATE INDEX idx_device_approval_history_device_id ON device_approval_history(device_id);
CREATE INDEX idx_device_approval_history_created_at ON device_approval_history(created_at DESC);
CREATE INDEX idx_device_approval_history_action ON device_approval_history(action);
CREATE INDEX idx_device_approval_history_performed_by_name ON device_approval_history(performed_by_name) WHERE performed_by_name IS NOT NULL;

-- ================================
-- TRIGGERS
-- ================================

-- Update timestamp triggers (already created above)

CREATE TRIGGER trigger_devices_pending_updated_at
    BEFORE UPDATE ON devices_pending
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_devices_rejected_updated_at
    BEFORE UPDATE ON devices_rejected
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update last_seen_at when mqtt_data changes
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS trigger AS $$
BEGIN
    -- Update last_seen_at when mqtt_data is updated
    IF OLD.mqtt_data IS DISTINCT FROM NEW.mqtt_data THEN
        NEW.last_seen_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_devices_pending_last_seen
    BEFORE UPDATE ON devices_pending
    FOR EACH ROW EXECUTE FUNCTION update_device_last_seen();

-- ================================
-- SIMPLIFIED VIEWS FOR EASY QUERYING
-- ================================

-- View: devices_pending_complete (with status information)
CREATE VIEW devices_pending_complete AS
SELECT
    dp.id,
    dp.device_id,
    dp.device_name,
    dp.device_type,
    NULL as manufacturer,
    NULL as model_name,
    dp.firmware_version,
    dp.mac_address,
    dp.ip_address,
    dp.connection_type,
    dp.mqtt_data,
    dp.discovered_at,
    dp.last_seen_at,
    dp.discovery_source,
    
    -- Approval Status Information
    das.status_code,
    das.status_name,
    das.status_description,
    
    -- Status indicators
    CASE
        WHEN dp.last_seen_at > NOW() - INTERVAL '5 minutes' THEN 'online'
        WHEN dp.last_seen_at > NOW() - INTERVAL '1 hour' THEN 'recent'
        ELSE 'offline'
    END AS device_activity_status,
    
    NOW() - dp.discovered_at AS time_since_discovery,
    
    dp.created_at,
    dp.updated_at
    
FROM devices_pending dp
INNER JOIN device_approval_status das ON dp.approval_status_id = das.id;

-- View: devices_rejected_complete (with status information)
CREATE VIEW devices_rejected_complete AS
SELECT
    dr.id,
    dr.device_id,
    dr.device_name,
    dr.device_type,
    NULL as manufacturer,
    NULL as model_name,
    dr.firmware_version,
    dr.mac_address,
    dr.ip_address,
    dr.connection_type,
    dr.original_mqtt_data,
    
    -- Rejection Information
    dr.rejection_date,
    dr.rejection_reason,
    dr.can_resubmit,
    dr.resubmit_after,
    dr.resubmission_count,
    
    -- Approval Status Information
    das.status_code,
    das.status_name,
    das.status_description,
    
    -- Admin Information
    dr.rejected_by_name,
    dr.rejected_by_email,
    
    -- Timing
    dr.original_discovered_at,
    NOW() - dr.rejection_date AS time_since_rejection,
    
    dr.created_at,
    dr.updated_at
    
FROM devices_rejected dr
INNER JOIN device_approval_status das ON dr.approval_status_id = das.id;

-- View: devices_all_with_status (รวมทุกอุปกรณ์ทุกสถานะ)
CREATE VIEW devices_all_with_status AS
SELECT 
    'pending' as table_source,
    dp.device_id,
    dp.device_name,
    dp.device_type,
    NULL as manufacturer,
    NULL as model_name,
    dp.firmware_version,
    dp.discovered_at as source_date,
    das.status_code,
    das.status_name,
    NULL as rejected_by,
    NULL as rejection_reason
FROM devices_pending dp
INNER JOIN device_approval_status das ON dp.approval_status_id = das.id

UNION ALL

SELECT 
    'operational' as table_source,
    d.device_id,
    d.device_name,
    NULL as device_type, -- เพิ่มจาก MQTT data หากต้องการ
    NULL as manufacturer,
    NULL as model_name,
    NULL as firmware_version,
    d.created_at as source_date,
    das.status_code,
    das.status_name,
    NULL as rejected_by,
    NULL as rejection_reason
FROM devices_prop d
INNER JOIN device_approval_status das ON d.approval_status_id = das.id

UNION ALL

SELECT 
    'rejected' as table_source,
    dr.device_id,
    dr.device_name,
    dr.device_type,
    NULL as manufacturer,
    NULL as model_name,
    dr.firmware_version,
    dr.rejection_date as source_date,
    das.status_code,
    das.status_name,
    dr.rejected_by_name as rejected_by,
    dr.rejection_reason
FROM devices_rejected dr
INNER JOIN device_approval_status das ON dr.approval_status_id = das.id

ORDER BY source_date DESC;

-- View: devices_pending_summary (dashboard summary)
CREATE VIEW devices_pending_summary AS
WITH basic_stats AS (
    SELECT
        COUNT(*) AS total_pending,
        COUNT(CASE WHEN last_seen_at > NOW() - INTERVAL '1 hour' THEN 1 END) AS online_count,
        COUNT(CASE WHEN last_seen_at <= NOW() - INTERVAL '1 hour' THEN 1 END) AS offline_count,
        MIN(discovered_at) AS oldest_pending,
        MAX(discovered_at) AS newest_pending
    FROM devices_pending
),
device_types AS (
    SELECT json_object_agg(
        device_type, 
        device_count
    ) AS devices_by_type
    FROM (
        SELECT 
            COALESCE(device_type, 'Unknown') as device_type,
            COUNT(*) as device_count
        FROM devices_pending
        WHERE device_type IS NOT NULL AND device_type != ''
        GROUP BY device_type
    ) dt
)
SELECT
    bs.total_pending,
    bs.online_count,
    bs.offline_count,
    bs.oldest_pending,
    bs.newest_pending,
    dt.devices_by_type
FROM basic_stats bs
CROSS JOIN device_types dt;

-- View: devices_rejected_summary
CREATE VIEW devices_rejected_summary AS
SELECT
    COUNT(*) AS total_rejected,
    COUNT(CASE WHEN can_resubmit = true THEN 1 END) AS can_resubmit_count,
    COUNT(CASE WHEN rejection_date > NOW() - INTERVAL '30 days' THEN 1 END) AS recent_rejections
FROM devices_rejected;

-- ================================
-- SEED DATA: FACULTIES
-- ================================

-- เพิ่มข้อมูลคณะเริ่มต้นพร้อมข้อมูลการติดต่อ
INSERT INTO faculties (faculty_code, faculty_name, contact_email, contact_phone)
VALUES 
    ('institution', 'สำนักงานอธิการบดี', 'admin@university.ac.th', '053-943-001'),
    ('engineering', 'คณะวิศวกรรมศาสตร์', 'eng@university.ac.th', '053-943-002'),
    ('liberal_arts', 'คณะศิลปศาสตร์', 'liberal@university.ac.th', '053-943-003'),
    ('business_administration', 'คณะบริหารธุรกิจ', 'business@university.ac.th', '053-943-004'),
    ('architecture', 'คณะสถาปัตยกรรมศาสตร์', 'arch@university.ac.th', '053-943-005'),
    ('industrial_education', 'คณะครุศาสตร์อุตสาหกรรม', 'industrial@university.ac.th', '053-943-006')
ON CONFLICT (faculty_code) DO UPDATE SET
    faculty_name = EXCLUDED.faculty_name,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- DEVICE RESPONSIBLE PERSONS INTEGRATION COMPLETED
-- Note: All necessary columns and constraints are already defined above
-- ================================================================

-- สร้าง index เพื่อปรับปรุงประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_devices_prop_responsible_person_id ON devices_prop(responsible_person_id);

-- เพิ่ม comment อธิบายคอลัมน์
COMMENT ON COLUMN devices_prop.responsible_person_id IS 'ID ของผู้รับผิดชอบ/ผู้ดูแลอุปกรณ์นี้';

-- อัพเดทฟังก์ชัน approve_device เพื่อรองรับ responsible_person_id (Updated version)
CREATE OR REPLACE FUNCTION approve_device_with_responsible_person(
    p_device_id VARCHAR(100),
    p_approved_by_name VARCHAR(255),
    p_approved_by_email VARCHAR(255) DEFAULT NULL,
    p_approval_notes TEXT DEFAULT NULL,
    p_location_id INTEGER DEFAULT NULL,
    p_meter_id VARCHAR(50) DEFAULT NULL,
    p_device_model_id INTEGER DEFAULT NULL,
    p_responsible_person_id INTEGER DEFAULT NULL  -- กำหนด responsible person ในขณะอนุมัติ
) RETURNS BOOLEAN AS $$
DECLARE
    pending_device RECORD;
BEGIN
    -- Get pending device data
    SELECT * INTO pending_device 
    FROM devices_pending 
    WHERE device_id = p_device_id AND approval_status_id = 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Device % not found in pending approval', p_device_id;
    END IF;
    
    -- Insert into devices_prop with responsible person
    INSERT INTO devices_prop (
        device_id,
        device_name,
        device_type,
        ip_address,
        mac_address,
        firmware_version,
        connection_type,
        location_id,
        meter_id,
        device_model_id,
        responsible_person_id,  -- กำหนด responsible person ในขณะอนุมัติ
        approval_status_id,
        mqtt_data,
        is_enabled,
        status,
        created_at,
        updated_at
    ) VALUES (
        pending_device.device_id,
        pending_device.device_name,
        pending_device.device_type,
        pending_device.ip_address,
        pending_device.mac_address,
        pending_device.firmware_version,
        pending_device.connection_type,
        p_location_id,
        p_meter_id::INTEGER,
        p_device_model_id,
        p_responsible_person_id,  -- ใช้พารามิเตอร์ที่ระบุในขณะอนุมัติ
        2, -- 'approved' status
        pending_device.mqtt_data,
        true,
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    -- Create initial device_data record
    INSERT INTO devices_data (
        device_id,
        network_status,
        connection_quality
    ) VALUES (
        pending_device.device_id,
        'offline',
        0
    );
    
    -- Log approval history with responsible person info
    INSERT INTO device_approval_history (
        device_id,
        action,
        previous_status_id,
        new_status_id,
        performed_by_name,
        performed_by_email,
        action_reason,
        action_data
    ) VALUES (
        p_device_id,
        'approved',
        1, -- 'pending' status
        2, -- 'approved' status
        p_approved_by_name,
        p_approved_by_email,
        p_approval_notes,
        jsonb_build_object(
            'approved_at', CURRENT_TIMESTAMP,
            'moved_to_devices_prop', true,
            'location_id', p_location_id,
            'meter_id', p_meter_id,
            'device_model_id', p_device_model_id,
            'responsible_person_id', p_responsible_person_id
        )
    );
    
    -- Remove from pending devices
    DELETE FROM devices_pending WHERE device_id = p_device_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- VIEWS AND FUNCTIONS FOR DEVICE MANAGEMENT WITH RESPONSIBLE PERSONS
-- ================================

-- สร้าง view แสดงอุปกรณ์พร้อมข้อมูลผู้ดูแล
CREATE OR REPLACE VIEW v_devices_with_caretakers AS
SELECT 
    -- ข้อมูลอุปกรณ์
    dp.device_id,
    dp.device_name,
    dp.device_type,
    dp.ip_address,
    dp.mac_address,
    dp.firmware_version,
    dp.connection_type,
    dp.is_enabled,
    dp.status as device_status,
    dp.created_at as device_created_at,
    dp.updated_at as device_updated_at,
    
    -- ข้อมูลตำแหน่งที่ตั้ง
    CONCAT(
        COALESCE(l.building, ''), 
        CASE WHEN l.building IS NOT NULL AND l.floor IS NOT NULL THEN ' ชั้น ' ELSE '' END,
        COALESCE(l.floor, ''), 
        CASE WHEN l.room IS NOT NULL THEN ' ห้อง ' ELSE '' END,
        COALESCE(l.room, '')
    ) as location_name,
    l.building,
    l.floor,
    l.room,
    
    -- ข้อมูลคณะ
    f.faculty_name,
    f.faculty_code,
    f.contact_email as faculty_email,
    f.contact_phone as faculty_phone,
    
    -- ข้อมูลผู้ดูแล/ผู้รับผิดชอบ
    rp.id as caretaker_id,
    rp.name as caretaker_name,
    rp.email as caretaker_email,
    rp.phone as caretaker_phone,
    rp.department as caretaker_department,
    rp.position as caretaker_position,
    rp.is_active as caretaker_is_active,
    
    -- ข้อมูลสถานะอุปกรณ์ล่าสุด
    dd.voltage,
    dd.current_amperage,
    dd.power_factor,
    dd.frequency,
    dd.active_power,
    dd.reactive_power,
    dd.apparent_power,
    dd.network_status,
    dd.last_data_received,
    dd.connection_quality,
    dd.data_collection_count
    
FROM devices_prop dp
LEFT JOIN locations l ON dp.location_id = l.id
LEFT JOIN faculties f ON l.faculty_id = f.id
LEFT JOIN responsible_persons rp ON dp.responsible_person_id = rp.id
LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
WHERE dp.is_enabled = true
ORDER BY dp.device_name;

-- ฟังก์ชันค้นหาอุปกรณ์ตามผู้ดูแล
CREATE OR REPLACE FUNCTION get_devices_by_caretaker(
    p_responsible_person_id INTEGER
) RETURNS TABLE (
    device_id VARCHAR(100),
    device_name VARCHAR(255),
    device_type VARCHAR(100),
    location_info TEXT,
    faculty_name VARCHAR(255),
    network_status VARCHAR(20),
    last_data_received TIMESTAMP WITH TIME ZONE,
    connection_quality INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dp.device_id,
        dp.device_name,
        dp.device_type,
        CONCAT(
            COALESCE(l.building, ''), 
            CASE WHEN l.building IS NOT NULL THEN ' ชั้น ' ELSE '' END,
            COALESCE(l.floor, ''), 
            CASE WHEN l.room IS NOT NULL THEN ' ห้อง ' ELSE '' END,
            COALESCE(l.room, '')
        ) as location_info,
        f.faculty_name,
        COALESCE(dd.network_status, 'unknown') as network_status,
        dd.last_data_received,
        COALESCE(dd.connection_quality, 0) as connection_quality
    FROM devices_prop dp
    LEFT JOIN locations l ON dp.location_id = l.id
    LEFT JOIN faculties f ON l.faculty_id = f.id
    LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
    WHERE dp.responsible_person_id = p_responsible_person_id
    AND dp.is_enabled = true
    ORDER BY 
        f.faculty_name,
        l.building,
        l.floor,
        l.room,
        dp.device_name;
END;
$$ LANGUAGE plpgsql;

-- ฟังก์ชันสถิติอุปกรณ์ต่อผู้ดูแล
CREATE OR REPLACE FUNCTION get_caretaker_device_summary(
    p_responsible_person_id INTEGER DEFAULT NULL
) RETURNS TABLE (
    caretaker_id INTEGER,
    caretaker_name VARCHAR(255),
    caretaker_email VARCHAR(255),
    total_devices BIGINT,
    online_devices BIGINT,
    offline_devices BIGINT,
    unknown_status_devices BIGINT,
    avg_connection_quality NUMERIC,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    IF p_responsible_person_id IS NOT NULL THEN
        -- สถิติของผู้ดูแลคนใดคนหนึ่ง
        RETURN QUERY
        SELECT 
            rp.id as caretaker_id,
            rp.name as caretaker_name,
            rp.email as caretaker_email,
            COUNT(dp.device_id) as total_devices,
            COUNT(CASE WHEN dd.network_status = 'online' THEN 1 END) as online_devices,
            COUNT(CASE WHEN dd.network_status = 'offline' THEN 1 END) as offline_devices,
            COUNT(CASE WHEN dd.network_status IS NULL OR dd.network_status NOT IN ('online', 'offline') THEN 1 END) as unknown_status_devices,
            ROUND(AVG(COALESCE(dd.connection_quality, 0)), 2) as avg_connection_quality,
            MAX(dd.last_data_received) as last_activity
        FROM responsible_persons rp
        LEFT JOIN devices_prop dp ON rp.id = dp.responsible_person_id AND dp.is_enabled = true
        LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
        WHERE rp.id = p_responsible_person_id AND rp.is_active = true
        GROUP BY rp.id, rp.name, rp.email;
    ELSE
        -- สถิติของผู้ดูแลทุกคน
        RETURN QUERY
        SELECT 
            rp.id as caretaker_id,
            rp.name as caretaker_name,
            rp.email as caretaker_email,
            COUNT(dp.device_id) as total_devices,
            COUNT(CASE WHEN dd.network_status = 'online' THEN 1 END) as online_devices,
            COUNT(CASE WHEN dd.network_status = 'offline' THEN 1 END) as offline_devices,
            COUNT(CASE WHEN dd.network_status IS NULL OR dd.network_status NOT IN ('online', 'offline') THEN 1 END) as unknown_status_devices,
            ROUND(AVG(COALESCE(dd.connection_quality, 0)), 2) as avg_connection_quality,
            MAX(dd.last_data_received) as last_activity
        FROM responsible_persons rp
        LEFT JOIN devices_prop dp ON rp.id = dp.responsible_person_id AND dp.is_enabled = true
        LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
        WHERE rp.is_active = true
        GROUP BY rp.id, rp.name, rp.email
        ORDER BY total_devices DESC, caretaker_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ฟังก์ชันสำหรับกำหนดผู้ดูแลอุปกรณ์
CREATE OR REPLACE FUNCTION assign_device_caretaker(
    p_device_id VARCHAR(100),
    p_responsible_person_id INTEGER,
    p_assigned_by_name VARCHAR(255) DEFAULT NULL,
    p_assigned_by_email VARCHAR(255) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    device_exists BOOLEAN := FALSE;
    caretaker_exists BOOLEAN := FALSE;
BEGIN
    -- ตรวจสอบว่าอุปกรณ์มีอยู่จริง
    SELECT EXISTS(
        SELECT 1 FROM devices_prop 
        WHERE device_id = p_device_id AND is_enabled = true
    ) INTO device_exists;
    
    IF NOT device_exists THEN
        RAISE EXCEPTION 'อุปกรณ์ ID % ไม่พบหรือไม่ได้เปิดใช้งาน', p_device_id;
    END IF;
    
    -- ตรวจสอบว่าผู้ดูแลมีอยู่จริงและยังใช้งานอยู่
    SELECT EXISTS(
        SELECT 1 FROM responsible_persons 
        WHERE id = p_responsible_person_id AND is_active = true
    ) INTO caretaker_exists;
    
    IF NOT caretaker_exists THEN
        RAISE EXCEPTION 'ผู้ดูแล ID % ไม่พบหรือไม่ได้เปิดใช้งาน', p_responsible_person_id;
    END IF;
    
    -- อัพเดทผู้ดูแลอุปกรณ์
    UPDATE devices_prop 
    SET 
        responsible_person_id = p_responsible_person_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE device_id = p_device_id;
    
    -- บันทึก log การเปลี่ยนแปลง (ถ้ามีตาราง device_approval_history)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'device_approval_history') THEN
        INSERT INTO device_approval_history (
            device_id,
            action,
            performed_by_name,
            performed_by_email,
            action_reason,
            action_data
        ) VALUES (
            p_device_id,
            'caretaker_assigned',
            p_assigned_by_name,
            p_assigned_by_email,
            'กำหนดผู้ดูแลอุปกรณ์',
            jsonb_build_object(
                'responsible_person_id', p_responsible_person_id,
                'assigned_at', CURRENT_TIMESTAMP
            )
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ฟังก์ชันสำหรับการลบการมอบหมายผู้ดูแล
CREATE OR REPLACE FUNCTION unassign_device_caretaker(
    p_device_id VARCHAR(100),
    p_unassigned_by_name VARCHAR(255) DEFAULT NULL,
    p_unassigned_by_email VARCHAR(255) DEFAULT NULL,
    p_reason TEXT DEFAULT 'ยกเลิกการมอบหมายผู้ดูแล'
) RETURNS BOOLEAN AS $$
DECLARE
    current_caretaker_id INTEGER;
BEGIN
    -- ดึงข้อมูลผู้ดูแลปัจจุบัน
    SELECT responsible_person_id INTO current_caretaker_id
    FROM devices_prop 
    WHERE device_id = p_device_id AND is_enabled = true;
    
    IF current_caretaker_id IS NULL THEN
        RAISE NOTICE 'อุปกรณ์ % ไม่มีผู้ดูแลที่ถูกมอบหมาย', p_device_id;
        RETURN FALSE;
    END IF;
    
    -- ลบการมอบหมาย
    UPDATE devices_prop 
    SET 
        responsible_person_id = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE device_id = p_device_id;
    
    -- บันทึก log การเปลี่ยนแปลง
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'device_approval_history') THEN
        INSERT INTO device_approval_history (
            device_id,
            action,
            performed_by_name,
            performed_by_email,
            action_reason,
            action_data
        ) VALUES (
            p_device_id,
            'caretaker_unassigned',
            p_unassigned_by_name,
            p_unassigned_by_email,
            p_reason,
            jsonb_build_object(
                'previous_responsible_person_id', current_caretaker_id,
                'unassigned_at', CURRENT_TIMESTAMP
            )
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- เพิ่ม comments สำหรับ views และ functions
COMMENT ON VIEW v_devices_with_caretakers IS 'View แสดงข้อมูลอุปกรณ์ทั้งหมดพร้อมข้อมูลผู้ดูแล/ผู้รับผิดชอบ';
COMMENT ON FUNCTION assign_device_caretaker IS 'ฟังก์ชันสำหรับมอบหมายผู้ดูแลให้กับอุปกรณ์';
COMMENT ON FUNCTION unassign_device_caretaker IS 'ฟังก์ชันสำหรับยกเลิกการมอบหมายผู้ดูแลอุปกรณ์';
COMMENT ON FUNCTION get_devices_by_caretaker IS 'ฟังก์ชันค้นหาอุปกรณ์ที่อยู่ภายใต้การดูแลของผู้รับผิดชอบ';
COMMENT ON FUNCTION get_caretaker_device_summary IS 'ฟังก์ชันสรุปสถิติอุปกรณ์ของผู้ดูแลแต่ละคน';

-- ================================================================
-- TABLE COMMENTS SUMMARY
-- ================================================================
/*
ตารางทั้งหมดในระบบจัดการพลังงาน IoT:

1. device_approval_status - ตารางเก็บสถานะการอนุมัติอุปกรณ์ IoT (รออนุมัติ, อนุมัติแล้ว, ปฏิเสธ)
2. manufacturers - ตารางเก็บข้อมูลผู้ผลิตอุปกรณ์ IoT และเครื่องวัดพลังงาน
3. power_specifications - ตารางเก็บข้อมูลสเปคด้านไฟฟ้าของเครื่องวัดพลังงาน (แรงดัน กระแส กำลังไฟ)
4. device_models - ตารางเก็บข้อมูลรุ่นและโมเดลของอุปกรณ์ IoT แต่ละประเภท
5. faculties - ตารางเก็บข้อมูลคณะและหน่วยงานต่างๆ ในมหาวิทยาลัย
6. responsible_persons - ตารางเก็บข้อมูลผู้รับผิดชอบอุปกรณ์ IoT
7. locations - ตารางเก็บข้อมูลตำแหน่งที่ตั้งของอุปกรณ์ (อาคาร ชั้น ห้อง)
8. meter_prop - ตารางเก็บข้อมูลคุณสมบัติและสเปคของเครื่องวัดพลังงาน
9. devices_prop - ตารางเก็บข้อมูลคุณสมบัติและการกำหนดค่าของอุปกรณ์ IoT แต่ละตัว
10. devices_data - ตารางเก็บข้อมูลการทำงานและค่าวัดแบบ Real-time ของอุปกรณ์ IoT
11. devices_history - ตารางเก็บข้อมูลประวัติการทำงานและค่าวัดแบบ Time-series ของอุปกรณ์ IoT
12. devices_pending - ตารางเก็บข้อมูลอุปกรณ์ IoT ที่รออนุมัติจากผู้ดูแลระบบ
13. devices_rejected - ตารางเก็บข้อมูลอุปกรณ์ IoT ที่ถูกปฏิเสธการอนุมัติ
14. device_approval_history - ตารางเก็บประวัติการอนุมัติและการปฏิเสธอุปกรณ์ IoT

ระบบฐานข้อมูลนี้ออกแบบให้รองรับการจัดการอุปกรณ์ IoT สำหรับติดตามการใช้พลังงาน
ในระดับมหาวิทยาลัย โดยมีระบบอนุมัติ การจัดการผู้รับผิดชอบ และการเก็บข้อมูลแบบ Real-time
*/