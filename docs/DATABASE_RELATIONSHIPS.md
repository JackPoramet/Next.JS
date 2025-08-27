# 🗄️ Database Schema และความสัมพันธ์ - IoT Electric Energy Management System

## 📋 ภาพรวมฐานข้อมูล

ระบบ IoT Electric Energy Management ใช้ฐานข้อมูล **PostgreSQL 15** เป็นหลัก ประกอบด้วย **14 ตารางหลัก**, **6 Views**, **13 Functions** และ **หลาย Triggers** สำหรับการจัดการข้อมูลอุปกรณ์ IoT และการติดตามพลังงาน

---

## 🏗️ โครงสร้างตารางหลัก (Core Tables)

### 👥 กลุ่มการจัดการผู้ใช้และการอนุมัติ (User & Approval Management)

#### 1. `users` - ตารางผู้ใช้งานระบบ
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,        -- อีเมลสำหรับ login
    password_hash VARCHAR(255) NOT NULL,       -- รหัสผ่านที่เข้ารหัสแล้ว
    first_name VARCHAR(100),                   -- ชื่อจริง  
    last_name VARCHAR(100),                    -- นามสกุล
    role VARCHAR(50) DEFAULT 'user',           -- บทบาทผู้ใช้ (user, admin)
    is_active BOOLEAN DEFAULT true,            -- สถานะการใช้งาน
    last_login TIMESTAMP,                      -- เวลา login ครั้งล่าสุด
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `device_approval_status` - สถานะการอนุมัติอุปกรณ์
```sql
CREATE TABLE device_approval_status (
    id SERIAL PRIMARY KEY,
    status_code VARCHAR(20) UNIQUE NOT NULL,   -- รหัสสถานะ (pending, approved, rejected)
    status_name VARCHAR(100) NOT NULL,         -- ชื่อสถานะ
    status_description TEXT,                   -- คำอธิบายสถานะ
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `device_approval_history` - ประวัติการอนุมัติอุปกรณ์
```sql
CREATE TABLE device_approval_history (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,               -- การกระทำ (approved, rejected, etc.)
    previous_status_id INTEGER,
    new_status_id INTEGER,
    performed_by_name VARCHAR(255),            -- ผู้ดำเนินการ
    performed_by_email VARCHAR(255),
    action_reason TEXT,                        -- เหตุผลการดำเนินการ
    action_data JSONB,                         -- ข้อมูลเพิ่มเติม
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 🏢 กลุ่มข้อมูลองค์กรและที่ตั้ง (Organization & Location)

#### 4. `faculties` - ตารางคณะและหน่วยงาน
```sql
CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    faculty_code VARCHAR(30) UNIQUE NOT NULL,  -- รหัสคณะ
    faculty_name VARCHAR(255) NOT NULL,        -- ชื่อคณะ
    contact_email VARCHAR(255),                -- อีเมลติดต่อ
    contact_phone VARCHAR(50),                 -- เบอร์โทรติดต่อ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. `locations` - ตารางตำแหน่งที่ตั้งอุปกรณ์
```sql
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES faculties(id),
    building VARCHAR(100) NOT NULL,            -- อาคาร
    floor VARCHAR(50),                         -- ชั้น
    room VARCHAR(50),                          -- ห้อง
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faculty_id, building, floor, room)
);
```

#### 6. `responsible_persons` - ตารางผู้รับผิดชอบอุปกรณ์
```sql
CREATE TABLE responsible_persons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,                -- ชื่อ-นามสกุล ผู้รับผิดชอบ
    email VARCHAR(255) UNIQUE NOT NULL,        -- อีเมล (unique identifier)
    phone VARCHAR(20),                         -- หมายเลขโทรศัพท์
    department VARCHAR(100),                   -- ภาควิชา/หน่วยงาน
    position VARCHAR(100),                     -- ตำแหน่ง
    faculty_id INTEGER REFERENCES faculties(id), -- รหัสคณะที่สังกัด
    is_active BOOLEAN DEFAULT true,            -- สถานะการใช้งาน
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 🏭 กลุ่มข้อมูลอุปกรณ์และผู้ผลิต (Equipment & Manufacturer)

#### 7. `manufacturers` - ตารางผู้ผลิตอุปกรณ์
```sql
CREATE TABLE manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,         -- ชื่อผู้ผลิต
    country VARCHAR(50),                       -- ประเทศ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. `device_models` - ตารางรุ่นและโมเดลอุปกรณ์ IoT
```sql
CREATE TABLE device_models (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,          -- ชื่อรุ่น
    manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id),
    supported_connections connection_type_enum[], -- ประเภทการเชื่อมต่อที่รองรับ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_name, manufacturer_id)
);
```

#### 9. `power_specifications` - ตารางสเปคด้านไฟฟ้า
```sql
CREATE TABLE power_specifications (
    id SERIAL PRIMARY KEY,
    rated_voltage NUMERIC(8,2) NOT NULL,       -- แรงดันไฟฟ้าที่กำหนด
    rated_current NUMERIC(8,2) NOT NULL,       -- กระแสไฟฟ้าที่กำหนด
    rated_power NUMERIC(10,2) NOT NULL,        -- กำลังไฟฟ้าที่กำหนด
    power_phase power_phase_enum NOT NULL DEFAULT 'single', -- เฟสไฟฟ้า (single/three)
    frequency NUMERIC(5,2) DEFAULT 50.0,       -- ความถี่ (Hz)
    accuracy VARCHAR(10),                       -- ความแม่นยำ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rated_voltage, rated_current, rated_power, power_phase)
);
```

#### 10. `meter_prop` - ตารางคุณสมบัติเครื่องวัดพลังงาน
```sql
CREATE TABLE meter_prop (
    meter_id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,          -- ชื่อรุ่นเครื่องวัด
    manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id),
    power_spec_id INTEGER NOT NULL REFERENCES power_specifications(id),
    meter_type meter_type_enum NOT NULL DEFAULT 'digital', -- ประเภทเครื่องวัด
    manufacture_date DATE,                     -- วันที่ผลิต
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_name, manufacturer_id)
);
```

### 📱 กลุ่มข้อมูลอุปกรณ์ IoT (IoT Device Management)

#### 11. `devices_prop` - ตารางคุณสมบัติอุปกรณ์ IoT ที่อนุมัติแล้ว
```sql
CREATE TABLE devices_prop (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,    -- รหัสอุปกรณ์
    device_name VARCHAR(255) NOT NULL,         -- ชื่ออุปกรณ์
    device_model_id INTEGER REFERENCES device_models(id),
    meter_id INTEGER UNIQUE REFERENCES meter_prop(meter_id),
    location_id INTEGER REFERENCES locations(id),
    responsible_person_id INTEGER REFERENCES responsible_persons(id),
    install_date DATE,                         -- วันที่ติดตั้ง
    ip_address INET,                          -- IP Address
    mac_address MACADDR,                      -- MAC Address
    connection_type connection_type_enum DEFAULT 'wifi',
    data_collection_interval INTEGER DEFAULT 60, -- ช่วงเวลาการเก็บข้อมูล (วินาที)
    device_type VARCHAR(100),                 -- ประเภทอุปกรณ์
    firmware_version VARCHAR(50),             -- เวอร์ชั่น firmware
    status device_status_enum DEFAULT 'active' NOT NULL, -- สถานะอุปกรณ์
    is_enabled BOOLEAN DEFAULT true,          -- เปิด/ปิด การใช้งาน
    approval_status_id INTEGER DEFAULT 2 REFERENCES device_approval_status(id),
    mqtt_data JSONB,                         -- ข้อมูล MQTT
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 12. `devices_pending` - ตารางอุปกรณ์รออนุมัติ
```sql
CREATE TABLE devices_pending (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,    -- รหัสอุปกรณ์
    device_name VARCHAR(255),                  -- ชื่ออุปกรณ์
    approval_status_id INTEGER DEFAULT 1 NOT NULL REFERENCES device_approval_status(id),
    device_type VARCHAR(100),                  -- ประเภทอุปกรณ์
    firmware_version VARCHAR(50),              -- เวอร์ชั่น firmware
    mac_address MACADDR,                       -- MAC Address
    ip_address INET,                          -- IP Address
    connection_type connection_type_enum DEFAULT 'wifi',
    mqtt_data JSONB NOT NULL,                 -- ข้อมูล MQTT
    discovered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- เวลาที่ค้นพบ
    last_seen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,  -- เห็นครั้งล่าสุด
    discovery_source VARCHAR(50) DEFAULT 'mqtt', -- แหล่งที่มา
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 13. `devices_rejected` - ตารางอุปกรณ์ที่ถูกปฏิเสธ
```sql
CREATE TABLE devices_rejected (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,    -- รหัสอุปกรณ์
    device_name VARCHAR(255),                  -- ชื่ออุปกรณ์
    device_type VARCHAR(100),                  -- ประเภทอุปกรณ์
    firmware_version VARCHAR(50),              -- เวอร์ชั่น firmware
    mac_address MACADDR,                       -- MAC Address
    ip_address INET,                          -- IP Address
    connection_type connection_type_enum,
    approval_status_id INTEGER DEFAULT 3 NOT NULL REFERENCES device_approval_status(id),
    original_mqtt_data JSONB,                 -- ข้อมูล MQTT เดิม
    rejected_by_name VARCHAR(255),            -- ผู้ปฏิเสธ
    rejected_by_email VARCHAR(255),           -- อีเมลผู้ปฏิเสธ
    rejection_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    rejection_reason TEXT,                    -- เหตุผลการปฏิเสธ
    original_discovered_at TIMESTAMPTZ,       -- เวลาที่ค้นพบเดิม
    can_resubmit BOOLEAN DEFAULT true,        -- สามารถส่งใหม่ได้หรือไม่
    resubmit_after TIMESTAMPTZ,              -- ส่งใหม่ได้หลังจาก
    resubmission_count INTEGER DEFAULT 0,     -- จำนวนครั้งที่ส่งใหม่
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 📊 กลุ่มข้อมูลการทำงานและประวัติ (Operation & History Data)

#### 14. `devices_data` - ตารางข้อมูล Real-time อุปกรณ์ IoT
```sql
CREATE TABLE devices_data (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL REFERENCES devices_prop(device_id),
    
    -- สถานะเครือข่าย
    network_status network_status_enum DEFAULT 'offline',
    connection_quality INTEGER DEFAULT 0,     -- คุณภาพสัญญาณ (0-100)
    signal_strength INTEGER,                   -- ความแรงสัญญาณ (-120 ถึง 0 dBm)
    
    -- ข้อมูลไฟฟ้าเฟสเดียว
    voltage NUMERIC(8,2),                      -- แรงดันไฟฟ้า (V)
    current_amperage NUMERIC(8,2),             -- กระแสไฟฟ้า (A)
    power_factor NUMERIC(4,3),                 -- ตัวประกอบกำลัง
    frequency NUMERIC(5,2),                    -- ความถี่ (Hz)
    
    -- ข้อมูลไฟฟ้าสามเฟส
    voltage_phase_b NUMERIC(8,2),              -- แรงดันเฟส B
    voltage_phase_c NUMERIC(8,2),              -- แรงดันเฟส C
    current_phase_b NUMERIC(8,2),              -- กระแสเฟส B
    current_phase_c NUMERIC(8,2),              -- กระแสเฟส C
    power_factor_phase_b NUMERIC(4,3),         -- ตัวประกอบกำลังเฟส B
    power_factor_phase_c NUMERIC(4,3),         -- ตัวประกอบกำลังเฟส C
    
    -- ข้อมูลพลังงาน
    active_power NUMERIC(12,2),                -- กำลังไฟฟ้าจริง (W)
    reactive_power NUMERIC(12,2),              -- กำลังไฟฟ้าเสมือน (VAR)
    apparent_power NUMERIC(12,2),              -- กำลังไฟฟ้าปรากฏ (VA)
    active_power_phase_a NUMERIC(12,2),        -- กำลังไฟฟ้าจริงเฟส A
    active_power_phase_b NUMERIC(12,2),        -- กำลังไฟฟ้าจริงเฟส B
    active_power_phase_c NUMERIC(12,2),        -- กำลังไฟฟ้าจริงเฟส C
    
    -- ข้อมูลสิ่งแวดล้อมและอื่นๆ
    device_temperature NUMERIC(5,2),           -- อุณหภูมิอุปกรณ์ (°C)
    total_energy NUMERIC(15,3) DEFAULT 0,      -- พลังงานรวม (kWh)
    daily_energy NUMERIC(10,3) DEFAULT 0,      -- พลังงานรายวัน (kWh)
    uptime_hours BIGINT DEFAULT 0,             -- เวลาการทำงาน (ชั่วโมง)
    
    -- ข้อมูลการบำรุงรักษาและข้อผิดพลาด
    last_maintenance TIMESTAMPTZ,              -- การบำรุงรักษาล่าสุด
    last_data_received TIMESTAMPTZ,            -- ข้อมูลล่าสุดที่ได้รับ
    data_collection_count BIGINT DEFAULT 0,    -- จำนวนครั้งการเก็บข้อมูล
    last_error_code VARCHAR(50),               -- รหัส error ล่าสุด
    last_error_message TEXT,                   -- ข้อความ error ล่าสุด
    last_error_time TIMESTAMPTZ,               -- เวลา error ล่าสุด
    error_count_today INTEGER DEFAULT 0,       -- จำนวน error วันนี้
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 15. `devices_history` - ตารางข้อมูลประวัติแบบ Time-series
```sql
CREATE TABLE devices_history (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL REFERENCES devices_prop(device_id),
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- ข้อมูลไฟฟ้าที่บันทึก
    voltage NUMERIC(8,2),
    current_amperage NUMERIC(8,2),
    power_factor NUMERIC(4,3),
    frequency NUMERIC(5,2),
    
    -- ข้อมูลสามเฟส
    voltage_phase_b NUMERIC(8,2),
    voltage_phase_c NUMERIC(8,2),
    current_phase_b NUMERIC(8,2),
    current_phase_c NUMERIC(8,2),
    power_factor_phase_b NUMERIC(4,3),
    power_factor_phase_c NUMERIC(4,3),
    
    -- ข้อมูลพลังงาน
    active_power NUMERIC(12,2),
    reactive_power NUMERIC(12,2),
    apparent_power NUMERIC(12,2),
    active_power_phase_a NUMERIC(12,2),
    active_power_phase_b NUMERIC(12,2),
    active_power_phase_c NUMERIC(12,2),
    
    -- ข้อมูลพลังงานรวม
    total_energy NUMERIC(15,3) DEFAULT 0,
    daily_energy NUMERIC(10,3) DEFAULT 0,
    total_energy_import NUMERIC(15,3) DEFAULT 0, -- พลังงานนำเข้า
    total_energy_export NUMERIC(15,3) DEFAULT 0, -- พลังงานส่งออก
    
    device_temperature NUMERIC(5,2),
    connection_quality INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔗 ความสัมพันธ์ระหว่างตาราง (Table Relationships)

### 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   faculties     │    │ manufacturers   │    │device_approval_ │
│                 │    │                 │    │     status      │
│ • id (PK)       │    │ • id (PK)       │    │ • id (PK)       │
│ • faculty_code  │    │ • name          │    │ • status_code   │
│ • faculty_name  │    │ • country       │    │ • status_name   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │ 1:N                  │ 1:N                  │ 1:N
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│   locations     │    │ device_models   │    │devices_pending  │
│                 │    │                 │    │                 │
│ • id (PK)       │    │ • id (PK)       │    │ • id (PK)       │
│ • faculty_id    │    │ • model_name    │    │ • device_id     │
│ • building      │    │ • manufacturer  │    │ • approval_sta  │
│ • floor         │    │   _id (FK)      │    │   tus_id (FK)   │
│ • room          │    │ • supported_con │    │ • device_name   │
└─────────┬───────┘    │   nections      │    │ • mqtt_data     │
          │            └─────────┬───────┘    └─────────────────┘
          │ 1:N                  │ 1:N
          │                      │
          │         ┌────────────┴───────┐
          │         │                    │
┌─────────▼───────┐ │        ┌─────────▼───────┐
│responsible_     │ │        │ power_specifi   │
│   persons       │ │        │    cations      │
│                 │ │        │                 │
│ • id (PK)       │ │        │ • id (PK)       │
│ • name          │ │        │ • rated_voltage │
│ • email         │ │        │ • rated_current │
│ • faculty_id    │ │        │ • rated_power   │
│   (FK)          │ │        │ • power_phase   │
└─────────┬───────┘ │        └─────────┬───────┘
          │         │                  │
          │ 1:N     │                  │ 1:N
          │         │                  │
          │    ┌────▼────┐    ┌─────────▼───────┐
          │    │         │    │   meter_prop    │
          │    │         │    │                 │
          │    │         │    │ • meter_id (PK) │
          │    │         │    │ • model_name    │
          │    │         │    │ • manufacturer  │
          │    │         │    │   _id (FK)      │
          │    │         │    │ • power_spec    │
          │    │         │    │   _id (FK)      │
          │    │         │    │ • meter_type    │
          │    │         │    └─────────┬───────┘
          │    │         │              │
          │    │         │              │ 1:1
          │    │         │              │
┌─────────▼────▼─────────▼──────────────▼───────┐
│              devices_prop               │
│                                         │
│ • id (PK)                              │
│ • device_id (UK)                       │
│ • device_name                          │
│ • device_model_id (FK)                 │
│ • meter_id (FK)                        │
│ • location_id (FK)                     │
│ • responsible_person_id (FK)           │
│ • approval_status_id (FK)              │
│ • device_type, firmware_version        │
│ • status, is_enabled                   │
│ • mqtt_data                            │
└─────────┬───────────────────────────────────┘
          │
          │ 1:1
          │
┌─────────▼───────┐    ┌─────────────────┐
│  devices_data   │    │ devices_history │
│                 │    │                 │
│ • id (PK)       │    │ • id (PK)       │
│ • device_id     │    │ • device_id     │
│   (FK)          │    │   (FK)          │
│ • network_      │    │ • recorded_at   │
│   status        │    │ • voltage       │
│ • voltage       │    │ • current_      │
│ • current_      │    │   amperage      │
│   amperage      │    │ • active_power  │
│ • active_power  │    │ • total_energy  │
│ • device_       │    │ • device_       │
│   temperature   │    │   temperature   │
│ • total_energy  │    └─────────────────┘
│ • last_data_    │
│   received      │
└─────────────────┘
```

### 🔑 Primary Keys และ Foreign Keys

**Primary Keys (PK)**
- ทุกตารางมี `id` เป็น SERIAL PRIMARY KEY
- `meter_prop` ใช้ `meter_id` เป็น PK แทน
- `devices_prop.device_id` เป็น UNIQUE constraint

**Foreign Key Relationships**
```sql
-- Organizational Structure
locations.faculty_id → faculties.id
responsible_persons.faculty_id → faculties.id

-- Equipment Structure  
device_models.manufacturer_id → manufacturers.id
meter_prop.manufacturer_id → manufacturers.id
meter_prop.power_spec_id → power_specifications.id

-- Device Management
devices_prop.device_model_id → device_models.id
devices_prop.meter_id → meter_prop.meter_id
devices_prop.location_id → locations.id
devices_prop.responsible_person_id → responsible_persons.id
devices_prop.approval_status_id → device_approval_status.id

-- Device Data
devices_data.device_id → devices_prop.device_id
devices_history.device_id → devices_prop.device_id

-- Approval Process
devices_pending.approval_status_id → device_approval_status.id
devices_rejected.approval_status_id → device_approval_status.id
device_approval_history.previous_status_id → device_approval_status.id
device_approval_history.new_status_id → device_approval_status.id
```

---

## 📈 Views สำคัญ (Important Views)

### 1. `devices_complete` - ข้อมูลอุปกรณ์แบบครบถ้วน
```sql
-- แสดงข้อมูลอุปกรณ์ทั้งหมด รวมคณะ, อาคาร, ผู้ผลิต, ข้อมูลเซ็นเซอร์
SELECT dp.device_id, dp.device_name, f.faculty_name, l.building, 
       dm.model_name, mfg.name AS manufacturer,
       dd.voltage, dd.active_power, dd.last_data_received
FROM devices_prop dp
JOIN locations l ON dp.location_id = l.id
JOIN faculties f ON l.faculty_id = f.id
JOIN device_models dm ON dp.device_model_id = dm.id
JOIN manufacturers mfg ON dm.manufacturer_id = mfg.id
LEFT JOIN devices_data dd ON dp.device_id = dd.device_id;
```

### 2. `devices_dashboard` - ข้อมูลสำหรับ Dashboard
```sql
-- แสดงข้อมูลสำคัญสำหรับหน้า dashboard พร้อมสถานะความเป็นปัจจุบันของข้อมูล
SELECT device_id, device_name, faculty_name, building,
       device_manufacturer, meter_manufacturer,
       active_power, last_data_received,
       CASE 
           WHEN last_data_received > (now() - interval '5 minutes') THEN 'recent'
           WHEN last_data_received > (now() - interval '1 hour') THEN 'delayed' 
           ELSE 'stale'
       END AS data_freshness
FROM devices_complete;
```

### 3. `devices_monitoring` - ข้อมูลสำหรับการติดตาม
```sql
-- เฉพาะอุปกรณ์ที่ active และมีการแจ้งเตือนเมื่ออุณหภูมิสูงหรือข้อมูลล่าช้า
SELECT device_id, device_name, faculty_name, building,
       device_temperature, last_data_received,
       CASE WHEN device_temperature > 70 THEN true ELSE false END AS temperature_high,
       CASE WHEN last_data_received < (now() - interval '10 minutes') THEN true ELSE false END AS data_stale
FROM devices_complete 
WHERE status = 'active' AND is_enabled = true;
```

### 4. `v_devices_with_caretakers` - อุปกรณ์พร้อมข้อมูลผู้ดูแล
```sql
-- แสดงข้อมูลอุปกรณ์พร้อมรายละเอียดผู้รับผิดชอบ
SELECT dp.device_id, dp.device_name, l.building, f.faculty_name,
       rp.name AS caretaker_name, rp.email AS caretaker_email,
       dd.network_status, dd.active_power, dd.last_data_received
FROM devices_prop dp
JOIN locations l ON dp.location_id = l.id
JOIN faculties f ON l.faculty_id = f.id
LEFT JOIN responsible_persons rp ON dp.responsible_person_id = rp.id
LEFT JOIN devices_data dd ON dp.device_id = dd.device_id;
```

### 5. `devices_pending_complete` - อุปกรณ์รออนุมัติแบบครบถ้วน
```sql
-- แสดงข้อมูลอุปกรณ์ที่รออนุมัติพร้อมสถานะ
SELECT dp.device_id, dp.device_name, dp.device_type,
       das.status_name, dp.discovered_at, dp.last_seen_at,
       CASE 
           WHEN last_seen_at > (now() - interval '5 minutes') THEN 'online'
           WHEN last_seen_at > (now() - interval '1 hour') THEN 'recent'
           ELSE 'offline'
       END AS device_activity_status
FROM devices_pending dp
JOIN device_approval_status das ON dp.approval_status_id = das.id;
```

### 6. `devices_all_with_status` - รวมอุปกรณ์ทุกสถานะ
```sql
-- UNION ข้อมูลจากทุกตาราง: pending, operational, rejected
SELECT 'pending' AS table_source, device_id, device_name, status_name
FROM devices_pending dp JOIN device_approval_status das ON dp.approval_status_id = das.id
UNION ALL
SELECT 'operational', device_id, device_name, status_name  
FROM devices_prop d JOIN device_approval_status das ON d.approval_status_id = das.id
UNION ALL
SELECT 'rejected', device_id, device_name, status_name
FROM devices_rejected dr JOIN device_approval_status das ON dr.approval_status_id = das.id;
```

---

## ⚙️ Functions และ Stored Procedures

### 🔧 Device Approval Functions

#### 1. `approve_device()` - อนุมัติอุปกรณ์
```sql
-- ย้ายอุปกรณ์จาก devices_pending ไป devices_prop
SELECT approve_device(
    'ESP32_ENGR_LAB_001',          -- device_id
    'Admin Name',                   -- approved_by_name  
    'admin@university.ac.th',      -- approved_by_email
    'อุปกรณ์ผ่านการตรวจสอบแล้ว',    -- approval_notes
    1,                             -- location_id
    1001,                          -- meter_id
    1,                             -- device_model_id
    1                              -- responsible_person_id
);
```

#### 2. `reject_device()` - ปฏิเสธอุปกรณ์
```sql
-- ย้ายอุปกรณ์จาก devices_pending ไป devices_rejected
SELECT reject_device(
    'ESP32_UNKNOWN_999',           -- device_id
    'Admin Name',                  -- rejected_by_name
    'admin@university.ac.th',      -- rejected_by_email
    'อุปกรณ์ไม่ผ่านมาตรฐานความปลอดภัย', -- rejection_reason
    true                          -- can_resubmit
);
```

### 👥 Caretaker Management Functions

#### 3. `assign_device_caretaker()` - มอบหมายผู้ดูแล
```sql
-- กำหนดผู้ดูแลให้กับอุปกรณ์
SELECT assign_device_caretaker(
    'ESP32_ENGR_LAB_001',          -- device_id
    5,                             -- responsible_person_id
    'Admin Name',                  -- assigned_by_name
    'admin@university.ac.th'       -- assigned_by_email
);
```

#### 4. `get_devices_by_caretaker()` - ค้นหาอุปกรณ์ตามผู้ดูแล
```sql
-- ดึงรายการอุปกรณ์ที่อยู่ภายใต้การดูแล
SELECT * FROM get_devices_by_caretaker(5); -- responsible_person_id
```

#### 5. `get_caretaker_device_summary()` - สรุปสถิติผู้ดูแล
```sql
-- สถิติอุปกรณ์ของผู้ดูแลแต่ละคน
SELECT * FROM get_caretaker_device_summary(); -- ทุกคน
SELECT * FROM get_caretaker_device_summary(5); -- คนใดคนหนึ่ง
```

### 📊 Analytics Functions

#### 6. `calculate_energy_consumption()` - คำนวณการใช้พลังงาน
```sql
-- คำนวณการใช้พลังงานในช่วงเวลาที่กำหนด
SELECT * FROM calculate_energy_consumption(
    'ESP32_ENGR_LAB_001',          -- device_id
    '2025-08-01'::DATE,            -- start_date
    '2025-08-31'::DATE             -- end_date
);
```

### 🧹 Maintenance Functions

#### 7. `cleanup_old_history_data()` - ทำความสะอาดข้อมูลเก่า
```sql
-- ลบข้อมูลประวัติที่เก่ากว่า 365 วัน (default)
SELECT cleanup_old_history_data();        -- 365 วัน
SELECT cleanup_old_history_data(180);     -- 180 วัน
```

#### 8. `cleanup_old_pending_devices()` - ลบอุปกรณ์รอที่เก่า
```sql
-- ลบอุปกรณ์รอที่ไม่มีการอัพเดทนาน
SELECT cleanup_old_pending_devices();     -- 30 วัน (default)  
SELECT cleanup_old_pending_devices(7);    -- 7 วัน
```

### 🔐 User Management Functions

#### 9. `update_user_last_login()` - อัพเดทเวลา login ล่าสุด
```sql
-- อัพเดทเวลา login ล่าสุดของผู้ใช้
SELECT update_user_last_login('user@example.com');
```

---

## 🚀 Triggers และ Automation

### 📅 Auto-Timestamp Triggers
```sql
-- อัพเดท updated_at อัตโนมัติเมื่อมีการแก้ไข
CREATE TRIGGER trigger_users_updated_at 
BEFORE UPDATE ON users FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_devices_prop_updated_at 
BEFORE UPDATE ON devices_prop FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

### 🎯 Device Data Triggers
```sql
-- สร้างข้อมูล devices_data เริ่มต้นเมื่อเพิ่มอุปกรณ์ใหม่
CREATE TRIGGER trigger_create_initial_device_data 
AFTER INSERT ON devices_prop FOR EACH ROW 
EXECUTE FUNCTION create_initial_device_data();

-- บันทึกข้อมูลลง devices_history เมื่อมีการเปลี่ยนแปลงสำคัญ
CREATE TRIGGER trigger_archive_device_data 
AFTER UPDATE ON devices_data FOR EACH ROW 
EXECUTE FUNCTION archive_device_data();
```

### ⏰ MQTT Data Triggers
```sql
-- อัพเดท last_seen_at เมื่อได้รับข้อมูล MQTT ใหม่
CREATE TRIGGER trigger_devices_pending_last_seen 
BEFORE UPDATE ON devices_pending FOR EACH ROW 
EXECUTE FUNCTION update_device_last_seen();
```

---

## 📊 Indexes สำคัญ

### 🔍 Performance Indexes
```sql
-- User Management
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Device Management  
CREATE INDEX idx_devices_prop_device_id ON devices_prop(device_id);
CREATE INDEX idx_devices_prop_status ON devices_prop(status, is_enabled);
CREATE INDEX idx_devices_data_device_id ON devices_data(device_id);
CREATE INDEX idx_devices_data_last_data_received ON devices_data(last_data_received DESC);

-- Location and Organization
CREATE INDEX idx_locations_faculty ON locations(faculty_id);
CREATE INDEX idx_locations_building ON locations(faculty_id, building);

-- Time-series Data
CREATE INDEX idx_devices_history_device_time ON devices_history(device_id, recorded_at DESC);
CREATE INDEX idx_devices_history_power ON devices_history(device_id, active_power, recorded_at DESC);

-- MQTT and Pending Devices
CREATE INDEX idx_devices_pending_discovered_at ON devices_pending(discovered_at DESC);
CREATE INDEX idx_devices_pending_last_seen ON devices_pending(last_seen_at DESC);
CREATE INDEX idx_devices_pending_mqtt_data_gin ON devices_pending USING gin(mqtt_data);
```

---

## 🎛️ Enums และ Custom Types

### 📝 Device Status Enums
```sql
-- สถานะการทำงานของอุปกรณ์
CREATE TYPE device_status_enum AS ENUM ('active', 'inactive', 'maintenance', 'error');

-- สถานะเครือข่าย
CREATE TYPE network_status_enum AS ENUM ('online', 'offline', 'error');

-- ประเภทการเชื่อมต่อ
CREATE TYPE connection_type_enum AS ENUM ('wifi', 'ethernet', 'cellular', 'lora', 'zigbee');

-- ประเภทมิเตอร์
CREATE TYPE meter_type_enum AS ENUM ('digital', 'analog');

-- จำนวนเฟสไฟฟ้า
CREATE TYPE power_phase_enum AS ENUM ('single', 'three');
```

---

## 🔒 Data Constraints และ Validation

### ✅ Business Rules Constraints
```sql
-- ข้อมูลไฟฟ้าต้องเป็นค่าบวก
ALTER TABLE devices_data ADD CONSTRAINT devices_data_voltage_check 
CHECK (voltage >= 0);

ALTER TABLE devices_data ADD CONSTRAINT devices_data_current_amperage_check 
CHECK (current_amperage >= 0);

ALTER TABLE devices_data ADD CONSTRAINT devices_data_active_power_check 
CHECK (active_power >= 0);

-- ตัวประกอบกำลังต้องอยู่ระหว่าง -1 ถึง 1
ALTER TABLE devices_data ADD CONSTRAINT devices_data_power_factor_check 
CHECK (power_factor >= -1 AND power_factor <= 1);

-- ความถี่ต้องอยู่ในช่วงที่เหมาะสม (40-70 Hz)
ALTER TABLE devices_data ADD CONSTRAINT devices_data_frequency_check 
CHECK (frequency >= 40 AND frequency <= 70);

-- อุณหภูมิอุปกรณ์ในช่วงที่สมเหตุสมผล (-40°C ถึง 85°C)
ALTER TABLE devices_data ADD CONSTRAINT devices_data_device_temperature_check 
CHECK (device_temperature >= -40 AND device_temperature <= 85);

-- คุณภาพการเชื่อมต่อ 0-100%
ALTER TABLE devices_data ADD CONSTRAINT devices_data_connection_quality_check 
CHECK (connection_quality >= 0 AND connection_quality <= 100);

-- ความแรงสัญญาณ -120 ถึง 0 dBm
ALTER TABLE devices_data ADD CONSTRAINT devices_data_signal_strength_check 
CHECK (signal_strength >= -120 AND signal_strength <= 0);
```

### 🔧 Unique Constraints
```sql
-- ป้องกันข้อมูลซ้ำ
ALTER TABLE faculties ADD CONSTRAINT faculties_faculty_code_key UNIQUE (faculty_code);
ALTER TABLE manufacturers ADD CONSTRAINT manufacturers_name_key UNIQUE (name);
ALTER TABLE locations ADD CONSTRAINT unique_location UNIQUE (faculty_id, building, floor, room);
ALTER TABLE devices_prop ADD CONSTRAINT devices_prop_device_id_key UNIQUE (device_id);
ALTER TABLE devices_prop ADD CONSTRAINT devices_prop_meter_id_key UNIQUE (meter_id);
ALTER TABLE responsible_persons ADD CONSTRAINT responsible_persons_email_key UNIQUE (email);
```

---

## 🎯 การใช้งานจริง (Practical Usage)

### 📋 Query Examples สำหรับงานทั่วไป

#### 1. ดึงข้อมูลอุปกรณ์ทั้งหมดในคณะใดคณะหนึ่ง
```sql
SELECT dc.device_id, dc.device_name, dc.building, dc.room,
       dc.device_manufacturer, dc.meter_manufacturer,
       dc.active_power, dc.last_data_received
FROM devices_complete dc
WHERE dc.faculty_name = 'คณะวิศวกรรมศาสตร์'
AND dc.is_enabled = true
ORDER BY dc.building, dc.room;
```

#### 2. ตรวจสอบอุปกรณ์ที่ offline นานเกิน 1 ชั่วโมง
```sql
SELECT device_id, device_name, faculty_name, building,
       last_data_received,
       AGE(NOW(), last_data_received) AS offline_duration
FROM devices_monitoring
WHERE data_stale = true
ORDER BY last_data_received ASC;
```

#### 3. หาอุปกรณ์ที่มีการใช้พลังงานสูงที่สุด 10 อันดับ
```sql
SELECT device_id, device_name, faculty_name, building,
       active_power, device_temperature
FROM devices_dashboard
WHERE active_power IS NOT NULL
ORDER BY active_power DESC
LIMIT 10;
```

#### 4. สถิติการใช้พลังงานตามคณะ
```sql
SELECT f.faculty_name,
       COUNT(dc.device_id) AS total_devices,
       AVG(dc.active_power) AS avg_power,
       SUM(dc.active_power) AS total_power,
       MAX(dc.active_power) AS max_power
FROM faculties f
LEFT JOIN locations l ON f.id = l.faculty_id
LEFT JOIN devices_prop dp ON l.id = dp.location_id
LEFT JOIN devices_data dd ON dp.device_id = dd.device_id
GROUP BY f.faculty_name
ORDER BY total_power DESC NULLS LAST;
```

#### 5. ข้อมูลอุปกรณ์ที่ต้องการบำรุงรักษา
```sql
SELECT device_id, device_name, faculty_name, building,
       device_temperature, last_data_received,
       CASE 
           WHEN device_temperature > 70 THEN 'High Temperature'
           WHEN last_data_received < NOW() - INTERVAL '1 hour' THEN 'Communication Lost'
           ELSE 'Check Required'
       END AS maintenance_reason
FROM devices_monitoring
WHERE temperature_high = true OR data_stale = true
ORDER BY device_temperature DESC;
```

---

## 📚 สรุปและข้อแนะนำ

### ✅ จุดแข็งของ Schema Design

1. **🔄 Normalized Design**: ออกแบบตาม Normal Forms เพื่อลดความซ้ำซ้อน
2. **🔗 Clear Relationships**: ความสัมพันธ์ชัดเจนด้วย Foreign Keys
3. **📊 Comprehensive Views**: Views ครอบคลุมการใช้งานจริง
4. **⚡ Optimized Indexes**: Indexes สำหรับ query patterns ที่สำคัญ
5. **🛡️ Data Integrity**: Constraints ป้องกันข้อมูลไม่ถูกต้อง
6. **🔧 Automation**: Triggers และ Functions ลดงานซ้ำๆ
7. **📈 Scalable**: ออกแบบรองรับการขยายในอนาคต

### 🎯 การใช้งานที่แนะนำ

1. **Real-time Monitoring**: ใช้ `devices_monitoring` view
2. **Dashboard Display**: ใช้ `devices_dashboard` view  
3. **Device Management**: ใช้ `devices_complete` view
4. **Approval Workflow**: ใช้ Functions approve/reject
5. **Analytics**: ใช้ `devices_history` table สำหรับการวิเคราะห์
6. **Maintenance**: ตั้งค่า Cron Jobs เรียก cleanup functions

### 🔮 แผนการพัฒนาต่อ

1. **Partitioning**: แบ่ง `devices_history` ตาม timestamp
2. **Data Archiving**: ย้ายข้อมูลเก่าไป Archive database
3. **Performance Monitoring**: เพิ่ม monitoring สำหรับ slow queries
4. **Backup Strategy**: กำหนด backup schedule และ retention policy

---

*เอกสารนี้สร้างขึ้นจากการวิเคราะห์โครงสร้างฐานข้อมูลจริงของระบบ IoT Electric Energy Management*
