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
DROP TABLE IF EXISTS devices_history CASCADE;
DROP TABLE IF EXISTS devices_data CASCADE;
DROP TABLE IF EXISTS devices_prop CASCADE;
DROP TABLE IF EXISTS meter_prop CASCADE;
DROP TABLE IF EXISTS device_models CASCADE;
DROP TABLE IF EXISTS manufacturers CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;
DROP TABLE IF EXISTS power_specifications CASCADE;

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

-- TABLE: MANUFACTURERS (Normalized - eliminates redundancy)
CREATE TABLE manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(50),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- TABLE: FACULTIES (Normalized - separates faculty info)
CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    faculty_code VARCHAR(20) UNIQUE NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- TABLE: DEVICES_PROP (Normalized - references lookup tables)
CREATE TABLE devices_prop (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    -- Device Identification
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    -- Foreign Keys to normalized tables
    device_model_id INTEGER NOT NULL,
    meter_id INTEGER UNIQUE NOT NULL, -- 1:1 relationship maintained
    location_id INTEGER NOT NULL,
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
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- ================================
-- CREATE INDEXES FOR PERFORMANCE
-- ================================

-- Indexes for lookup tables
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

-- TABLE: DEVICE_APPROVAL_STATUS (Normalized status reference)
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
    rejected_by INTEGER NOT NULL,
    rejection_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
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
        
    CONSTRAINT fk_devices_rejected_rejected_by 
        FOREIGN KEY (rejected_by) 
        REFERENCES users(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Constraints
    CHECK (resubmission_count >= 0),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update devices_prop to include approval_status_id
ALTER TABLE devices_prop 
ADD COLUMN approval_status_id INTEGER DEFAULT 2; -- Default to 'approved'

ALTER TABLE devices_prop
ADD CONSTRAINT fk_devices_prop_approval_status 
    FOREIGN KEY (approval_status_id) 
    REFERENCES device_approval_status(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- TABLE: DEVICE_APPROVAL_HISTORY (ประวัติการอนุมัติ)
CREATE TABLE device_approval_history (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'discovered', 'approved', 'rejected', 'moved_to_operational'
    previous_status_id INTEGER,
    new_status_id INTEGER,
    performed_by INTEGER,
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
        
    CONSTRAINT fk_device_approval_history_performed_by 
        FOREIGN KEY (performed_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- SIMPLIFIED FUNCTIONS FOR DEVICE APPROVAL WORKFLOW
-- ================================

-- Function to approve device and move to devices_prop
CREATE OR REPLACE FUNCTION approve_device(
    p_device_id VARCHAR(100),
    p_approved_by INTEGER,
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
        approval_status_id
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
        2 -- 'approved' status
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
        performed_by,
        action_reason,
        action_data
    ) VALUES (
        p_device_id,
        'approved',
        1, -- 'pending' status
        2, -- 'approved' status
        p_approved_by,
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
    p_rejected_by INTEGER,
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
        rejected_by,
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
        p_rejected_by,
        pending_device.discovered_at,
        p_can_resubmit
    );
    
    -- Log rejection history
    INSERT INTO device_approval_history (
        device_id,
        action,
        previous_status_id,
        new_status_id,
        performed_by,
        action_reason,
        action_data
    ) VALUES (
        p_device_id,
        'rejected',
        1, -- 'pending' status
        3, -- 'rejected' status
        p_rejected_by,
        p_rejection_reason,
        jsonb_build_object(
            'rejection_category', p_rejection_category,
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

-- device_approval_status indexes
CREATE INDEX idx_device_approval_status_code ON device_approval_status(status_code);
CREATE INDEX idx_device_approval_status_active ON device_approval_status(is_active) WHERE is_active = true;

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
CREATE INDEX idx_devices_rejected_rejected_by ON devices_rejected(rejected_by);
CREATE INDEX idx_devices_rejected_can_resubmit ON devices_rejected(can_resubmit) WHERE can_resubmit = true;

-- device_approval_history indexes
CREATE INDEX idx_device_approval_history_device_id ON device_approval_history(device_id);
CREATE INDEX idx_device_approval_history_created_at ON device_approval_history(created_at DESC);
CREATE INDEX idx_device_approval_history_action ON device_approval_history(action);
CREATE INDEX idx_device_approval_history_performed_by ON device_approval_history(performed_by) WHERE performed_by IS NOT NULL;

-- ================================
-- TRIGGERS
-- ================================

-- Update timestamp triggers
CREATE TRIGGER trigger_device_approval_status_updated_at
    BEFORE UPDATE ON device_approval_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
    dr.can_resubmit,
    dr.resubmit_after,
    dr.resubmission_count,
    
    -- Approval Status Information
    das.status_code,
    das.status_name,
    das.status_description,
    
    -- Admin Information
    u.first_name || ' ' || u.last_name AS rejected_by_name,
    u.email AS rejected_by_email,
    
    -- Timing
    dr.original_discovered_at,
    NOW() - dr.rejection_date AS time_since_rejection,
    
    dr.created_at,
    dr.updated_at
    
FROM devices_rejected dr
INNER JOIN device_approval_status das ON dr.approval_status_id = das.id
INNER JOIN users u ON dr.rejected_by = u.id;

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
    u.first_name || ' ' || u.last_name as rejected_by,
    NULL as rejection_reason
FROM devices_rejected dr
INNER JOIN device_approval_status das ON dr.approval_status_id = das.id
INNER JOIN users u ON dr.rejected_by = u.id

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