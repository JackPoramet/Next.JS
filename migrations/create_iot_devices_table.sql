-- ================================
-- CREATE IOT_DEVICES TABLE
-- ================================

-- สร้างตาราง iot_devices สำหรับจัดเก็บข้อมูลอุปกรณ์ IoT
CREATE TABLE IF NOT EXISTS iot_devices (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- ข้อมูลอุปกรณ์พื้นฐาน
    name VARCHAR(255) NOT NULL,
    device_id VARCHAR(100) UNIQUE,
    
    -- ข้อมูลตำแหน่งที่ตั้ง
    faculty VARCHAR(100) NOT NULL,
    building VARCHAR(100),
    floor VARCHAR(50),
    room VARCHAR(50),
    position TEXT,
    
    -- ข้อมูลรุ่นและประเภทอุปกรณ์
    meter_type VARCHAR(50) DEFAULT 'digital',
    device_model VARCHAR(100),
    manufacturer VARCHAR(100),
    
    -- สถานะอุปกรณ์
    status VARCHAR(50) DEFAULT 'active',
    
    -- ข้อมูลเครือข่าย
    ip_address INET,
    mac_address VARCHAR(17),
    network_status VARCHAR(50) DEFAULT 'offline',
    
    -- ข้อมูลการติดตั้งและบำรุงรักษา
    installation_date DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    
    -- ข้อมูลการใช้พลังงาน (ค่าล่าสุด)
    current_reading DECIMAL(10,2),
    voltage DECIMAL(8,2),
    current_amperage DECIMAL(8,2),
    power_factor DECIMAL(4,3),
    
    -- การเก็บรวบรวมข้อมูล
    data_collection_interval INTEGER DEFAULT 60,
    last_data_received TIMESTAMP,
    
    -- การตั้งค่าและหมายเหตุ
    settings JSONB,
    description TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Device ID index สำหรับค้นหาอุปกรณ์
CREATE INDEX IF NOT EXISTS idx_iot_devices_device_id ON iot_devices(device_id);

-- Faculty index สำหรับกรองตามคณะ
CREATE INDEX IF NOT EXISTS idx_iot_devices_faculty ON iot_devices(faculty);

-- Status index สำหรับกรองตามสถานะ
CREATE INDEX IF NOT EXISTS idx_iot_devices_status ON iot_devices(status);

-- Meter type index สำหรับกรองตามประเภทมิเตอร์
CREATE INDEX IF NOT EXISTS idx_iot_devices_meter_type ON iot_devices(meter_type);

-- Network status index สำหรับกรองตามสถานะเครือข่าย
CREATE INDEX IF NOT EXISTS idx_iot_devices_network_status ON iot_devices(network_status);

-- Location composite index สำหรับค้นหาตามที่ตั้ง
CREATE INDEX IF NOT EXISTS idx_iot_devices_location ON iot_devices(faculty, building, floor);

-- Last data received index สำหรับติดตามข้อมูลล่าสุด
CREATE INDEX IF NOT EXISTS idx_iot_devices_last_data ON iot_devices(last_data_received);

-- Active devices index สำหรับกรองอุปกรณ์ที่ใช้งาน
CREATE INDEX IF NOT EXISTS idx_iot_devices_active ON iot_devices(status) WHERE status = 'active';

-- ================================
-- TRIGGERS
-- ================================

-- Trigger สำหรับ auto-update updated_at เมื่อมีการแก้ไขข้อมูล
CREATE OR REPLACE TRIGGER update_iot_devices_updated_at 
    BEFORE UPDATE ON iot_devices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SAMPLE DATA
-- ================================

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO iot_devices (
    name, device_id, faculty, building, floor, room, 
    meter_type, status, network_status, 
    current_reading, voltage, current_amperage, power_factor,
    description
) VALUES 
(
    'มิเตอร์ไฟหลัก - อาคารวิศวกรรม', 
    'ENG_MAIN_001', 
    'engineering', 
    'Engineering Building', 
    '1', 
    'Main Electrical Room',
    'digital', 
    'active', 
    'online',
    1250.50,
    220.0,
    5.68,
    0.95,
    'มิเตอร์ไฟหลักสำหรับอาคารวิศวกรรมศาสตร์'
),
(
    'มิเตอร์ห้องปฏิบัติการ - วิศวคอม', 
    'ENG_LAB_CS01', 
    'engineering', 
    'Engineering Building', 
    '3', 
    'CS Lab 301',
    'digital', 
    'active', 
    'online',
    85.25,
    220.0,
    0.39,
    0.92,
    'มิเตอร์สำหรับห้องปฏิบัติการคอมพิวเตอร์'
),
(
    'มิเตอร์อาคารศิลปศาสตร์', 
    'LA_MAIN_001', 
    'liberal_arts', 
    'Liberal Arts Building', 
    '1', 
    'Main Power Room',
    'digital', 
    'active', 
    'offline',
    980.75,
    220.0,
    4.46,
    0.98,
    'มิเตอร์หลักอาคารศิลปศาสตร์'
);

-- ================================
-- COMMENTS & DOCUMENTATION
-- ================================

COMMENT ON TABLE iot_devices IS 'ตารางอุปกรณ์ IoT สำหรับตรวจสอบการใช้พลังงานไฟฟ้า';
COMMENT ON COLUMN iot_devices.id IS 'รหัสอุปกรณ์ (Primary Key)';
COMMENT ON COLUMN iot_devices.name IS 'ชื่ออุปกรณ์';
COMMENT ON COLUMN iot_devices.device_id IS 'รหัสอุปกรณ์ที่ไม่ซ้ำ';
COMMENT ON COLUMN iot_devices.faculty IS 'คณะที่ติดตั้ง';
COMMENT ON COLUMN iot_devices.building IS 'อาคาร';
COMMENT ON COLUMN iot_devices.floor IS 'ชั้น';
COMMENT ON COLUMN iot_devices.room IS 'ห้อง';
COMMENT ON COLUMN iot_devices.position IS 'คำอธิบายตำแหน่งอื่นๆ';
COMMENT ON COLUMN iot_devices.meter_type IS 'ประเภทมิเตอร์ (digital/analog)';
COMMENT ON COLUMN iot_devices.device_model IS 'รุ่นอุปกรณ์';
COMMENT ON COLUMN iot_devices.manufacturer IS 'ผู้ผลิต';
COMMENT ON COLUMN iot_devices.status IS 'สถานะอุปกรณ์ (active/inactive/maintenance)';
COMMENT ON COLUMN iot_devices.ip_address IS 'ที่อยู่ IP';
COMMENT ON COLUMN iot_devices.mac_address IS 'MAC Address';
COMMENT ON COLUMN iot_devices.network_status IS 'สถานะเครือข่าย (online/offline/error)';
COMMENT ON COLUMN iot_devices.installation_date IS 'วันที่ติดตั้ง';
COMMENT ON COLUMN iot_devices.last_maintenance IS 'วันที่บำรุงรักษาล่าสุด';
COMMENT ON COLUMN iot_devices.next_maintenance IS 'วันที่บำรุงรักษาครั้งถัดไป';
COMMENT ON COLUMN iot_devices.current_reading IS 'การอ่านค่าปัจจุบัน';
COMMENT ON COLUMN iot_devices.voltage IS 'แรงดันไฟฟ้า';
COMMENT ON COLUMN iot_devices.current_amperage IS 'กระแสไฟฟ้า';
COMMENT ON COLUMN iot_devices.power_factor IS 'ตัวประกอบกำลัง';
COMMENT ON COLUMN iot_devices.data_collection_interval IS 'ช่วงเวลาเก็บข้อมูล (วินาที)';
COMMENT ON COLUMN iot_devices.last_data_received IS 'เวลาที่รับข้อมูลล่าสุด';
COMMENT ON COLUMN iot_devices.settings IS 'การตั้งค่าเพิ่มเติมในรูปแบบ JSON';
COMMENT ON COLUMN iot_devices.description IS 'คำอธิบายอุปกรณ์';
COMMENT ON COLUMN iot_devices.notes IS 'หมายเหตุเพิ่มเติม';
COMMENT ON COLUMN iot_devices.created_at IS 'เวลาที่สร้างข้อมูล';
COMMENT ON COLUMN iot_devices.updated_at IS 'เวลาที่แก้ไขล่าสุด';
