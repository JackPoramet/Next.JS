-- ================================
-- IOT DEVICES TABLE CREATION
-- ================================

-- สร้างตาราง iot_devices สำหรับจัดเก็บข้อมูล IoT devices
CREATE TABLE IF NOT EXISTS iot_devices (
    -- Primary Key
    id SERIAL PRIMARY KEY,
    
    -- Device Information
    name VARCHAR(255) NOT NULL,
    device_id VARCHAR(100) UNIQUE, -- รหัสอุปกรณ์ที่ไม่ซ้ำ
    
    -- Location Information
    faculty VARCHAR(100) NOT NULL,
    building VARCHAR(100),
    floor VARCHAR(50),
    room VARCHAR(50),
    position TEXT, -- คำอธิบายตำแหน่งอื่นๆ
    
    -- Device Specifications
    meter_type VARCHAR(50) NOT NULL DEFAULT 'digital', -- 'digital' หรือ 'analog'
    device_model VARCHAR(100),
    manufacturer VARCHAR(100),
    
    -- Device Status
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'maintenance'
    
    -- Network Information
    ip_address INET,
    mac_address VARCHAR(17),
    network_status VARCHAR(50) DEFAULT 'offline', -- 'online', 'offline', 'error'
    
    -- Installation Information
    installation_date DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    
    -- Energy Data (latest readings)
    current_reading DECIMAL(10,2),
    voltage DECIMAL(8,2),
    current_amperage DECIMAL(8,2),
    power_factor DECIMAL(4,3),
    
    -- Data Collection
    data_collection_interval INTEGER DEFAULT 60, -- seconds
    last_data_received TIMESTAMP,
    
    -- Configuration
    settings JSONB, -- JSON สำหรับการตั้งค่าเพิ่มเติม
    
    -- Notes
    description TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Faculty index สำหรับกรองตาม faculty
CREATE INDEX IF NOT EXISTS idx_iot_devices_faculty ON iot_devices(faculty);

-- Status index สำหรับกรองตามสถานะ
CREATE INDEX IF NOT EXISTS idx_iot_devices_status ON iot_devices(status);

-- Device type index
CREATE INDEX IF NOT EXISTS idx_iot_devices_meter_type ON iot_devices(meter_type);

-- Network status index
CREATE INDEX IF NOT EXISTS idx_iot_devices_network_status ON iot_devices(network_status);

-- Location composite index
CREATE INDEX IF NOT EXISTS idx_iot_devices_location ON iot_devices(faculty, building, floor);

-- Last data received index สำหรับการติดตาม
CREATE INDEX IF NOT EXISTS idx_iot_devices_last_data ON iot_devices(last_data_received);

-- Device ID index สำหรับการค้นหาอย่างรวดเร็ว
CREATE INDEX IF NOT EXISTS idx_iot_devices_device_id ON iot_devices(device_id);

-- ================================
-- TRIGGERS
-- ================================

-- Trigger สำหรับ auto-update updated_at
CREATE OR REPLACE TRIGGER update_iot_devices_updated_at 
    BEFORE UPDATE ON iot_devices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SAMPLE DATA
-- ================================

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO iot_devices (
    name, device_id, faculty, building, floor, room, position, 
    meter_type, device_model, manufacturer, status, 
    ip_address, installation_date, description
) VALUES 
-- Institution (สำนักงาน/บริหาร)
('Smart Meter 001', 'SM001', 'institution', 'Admin Building', '1', '101', 'Main Administrative Panel', 
 'digital', 'SM-2000', 'PowerTech', 'active', 
 '192.168.1.101', '2024-01-15', 'ระบบไฟฟ้าหลักสำนักงานบริหาร'),

('Smart Meter 002', 'SM002', 'institution', 'Admin Building', '2', '205', 'IT Server Room', 
 'digital', 'SM-3000', 'PowerTech', 'active', 
 '192.168.1.102', '2024-01-20', 'ห้องเซิร์ฟเวอร์และ IT'),

-- Engineering (วิศวกรรมศาสตร์)
('Smart Meter 003', 'SM003', 'engineering', 'Engineering Building A', '1', '101', 'Workshop Power Panel', 
 'digital', 'SM-2500', 'PowerTech', 'active', 
 '192.168.1.103', '2024-01-25', 'ห้องปฏิบัติการวิศวกรรม'),

('Analog Meter 004', 'AM004', 'engineering', 'Engineering Building A', '3', '305', 'Heavy Machinery Area', 
 'analog', 'AM-2000', 'IndusPower', 'active', 
 NULL, '2024-02-01', 'พื้นที่เครื่องจักรหนัก'),

('Smart Meter 005', 'SM005', 'engineering', 'Engineering Building B', '2', '201', 'Electronics Lab', 
 'digital', 'SM-2000', 'PowerTech', 'active', 
 '192.168.1.105', '2024-02-10', 'ห้องปฏิบัติการอิเล็กทรอนิกส์'),

-- Liberal Arts (ศิลปศาสตร์)
('Smart Meter 006', 'SM006', 'liberal_arts', 'Liberal Arts Building', '1', '110', 'Art Studio Panel', 
 'digital', 'SM-2500', 'PowerTech', 'active', 
 '192.168.1.106', '2024-02-15', 'สตูดิโอศิลปะและการออกแบบ'),

('Analog Meter 007', 'AM007', 'liberal_arts', 'Liberal Arts Building', '2', '201', 'Music Room', 
 'analog', 'AM-1800', 'ArtPower', 'active', 
 NULL, '2024-01-30', 'ห้องดนตรีและการแสดง'),

-- Business Administration (บริหารธุรกิจ)
('Smart Meter 008', 'SM008', 'business_administration', 'Business Building', '1', '105', 'Conference Room Panel', 
 'digital', 'SM-3000', 'PowerTech', 'active', 
 '192.168.1.108', '2024-02-20', 'ห้องประชุมและสัมมนา'),

('Smart Meter 009', 'SM009', 'business_administration', 'Business Building', '3', '301', 'Computer Lab', 
 'digital', 'SM-2500', 'PowerTech', 'active', 
 '192.168.1.109', '2024-02-25', 'ห้องปฏิบัติการคอมพิวเตอร์'),

-- Architecture (สถาปัตยกรรมศาสตร์)
('Smart Meter 010', 'SM010', 'architecture', 'Architecture Building', '1', '101', 'Design Studio Panel', 
 'digital', 'SM-2000', 'PowerTech', 'active', 
 '192.168.1.110', '2024-03-01', 'สตูดิโอออกแบบสถาปัตยกรรม'),

('Analog Meter 011', 'AM011', 'architecture', 'Architecture Building', '2', '205', 'Model Workshop', 
 'analog', 'AM-2500', 'CraftPower', 'maintenance', 
 NULL, '2024-01-10', 'ห้องทำโมเดลและงานฝีมือ - ซ่อมบำรุง'),

-- Industrial Education (ศึกษาศาสตร์อุตสาหกรรม)
('Smart Meter 012', 'SM012', 'industrial_education', 'Industrial Education Building', '1', '115', 'Training Workshop', 
 'digital', 'SM-3500', 'PowerTech', 'active', 
 '192.168.1.112', '2024-03-05', 'ห้องฝึกงานอุตสาหกรรม'),

('Smart Meter 013', 'SM013', 'industrial_education', 'Industrial Education Building', '2', '201', 'Automation Lab', 
 'digital', 'SM-2500', 'PowerTech', 'active', 
 '192.168.1.113', '2024-03-10', 'ห้องปฏิบัติการระบบอัตโนมัติ'),

('Analog Meter 014', 'AM014', 'industrial_education', 'Industrial Education Building', '3', '305', 'Mechanical Workshop', 
 'analog', 'AM-3000', 'IndusPower', 'inactive', 
 NULL, '2023-12-15', 'ห้องปฏิบัติการเครื่องกล - ปิดซ่อมบำรุง')

ON CONFLICT (device_id) DO NOTHING;

-- ================================
-- COMMENTS & DOCUMENTATION
-- ================================

COMMENT ON TABLE iot_devices IS 'ตารางข้อมูล IoT devices สำหรับระบบตรวจสอบการใช้พลังงานไฟฟ้า';
COMMENT ON COLUMN iot_devices.id IS 'รหัสอุปกรณ์ (Primary Key)';
COMMENT ON COLUMN iot_devices.name IS 'ชื่ออุปกรณ์';
COMMENT ON COLUMN iot_devices.device_id IS 'รหัสอุปกรณ์ที่ไม่ซ้ำ';
COMMENT ON COLUMN iot_devices.faculty IS 'คณะที่ติดตั้ง';
COMMENT ON COLUMN iot_devices.meter_type IS 'ประเภทมิเตอร์ (digital/analog)';
COMMENT ON COLUMN iot_devices.status IS 'สถานะอุปกรณ์ (active/inactive/maintenance)';
COMMENT ON COLUMN iot_devices.network_status IS 'สถานะการเชื่อมต่อเครือข่าย';
COMMENT ON COLUMN iot_devices.settings IS 'การตั้งค่าเพิ่มเติมในรูปแบบ JSON';
