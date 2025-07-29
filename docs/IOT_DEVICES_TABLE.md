# 📊 โครงสร้างตาราง iot_devices

## 🗃️ ภาพรวมตาราง

ตาราง `iot_devices` เป็นตารางสำหรับจัดเก็บข้อมูลอุปกรณ์ IoT ที่ใช้ในการตรวจสอบการใช้พลังงานไฟฟ้าในมหาวิทยาลัย

## 📋 รายละเอียดคอลัมน์ทั้งหมด

### 🆔 Primary Key
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย |
|---------|-------------|----------|
| `id` | SERIAL PRIMARY KEY | รหัสอุปกรณ์ (Auto increment) |

### 📱 ข้อมูลอุปกรณ์พื้นฐาน
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย | ข้อจำกัด |
|---------|-------------|----------|----------|
| `name` | VARCHAR(255) | ชื่ออุปกรณ์ | NOT NULL |
| `device_id` | VARCHAR(100) | รหัสอุปกรณ์ที่ไม่ซ้ำ | UNIQUE |

### 📍 ข้อมูลตำแหน่งที่ตั้ง
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย | ข้อจำกัด |
|---------|-------------|----------|----------|
| `faculty` | VARCHAR(100) | คณะที่ติดตั้ง | NOT NULL |
| `building` | VARCHAR(100) | อาคาร | - |
| `floor` | VARCHAR(50) | ชั้น | - |
| `room` | VARCHAR(50) | ห้อง | - |
| `position` | TEXT | คำอธิบายตำแหน่งอื่นๆ | - |

### ⚙️ ข้อมูลรุ่นและประเภทอุปกรณ์
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย | ค่าเริ่มต้น |
|---------|-------------|----------|------------|
| `meter_type` | VARCHAR(50) | ประเภทมิเตอร์ (digital/analog) | 'digital' |
| `device_model` | VARCHAR(100) | รุ่นอุปกรณ์ | - |
| `manufacturer` | VARCHAR(100) | ผู้ผลิต | - |

### 🔧 สถานะอุปกรณ์
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย | ค่าเริ่มต้น |
|---------|-------------|----------|------------|
| `status` | VARCHAR(50) | สถานะอุปกรณ์ (active/inactive/maintenance) | 'active' |

### 🌐 ข้อมูลเครือข่าย
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย | ค่าเริ่มต้น |
|---------|-------------|----------|------------|
| `ip_address` | INET | ที่อยู่ IP | - |
| `mac_address` | VARCHAR(17) | MAC Address | - |
| `network_status` | VARCHAR(50) | สถานะเครือข่าย (online/offline/error) | 'offline' |

### 🔧 ข้อมูลการติดตั้งและบำรุงรักษา
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย |
|---------|-------------|----------|
| `installation_date` | DATE | วันที่ติดตั้ง |
| `last_maintenance` | DATE | วันที่บำรุงรักษาล่าสุด |
| `next_maintenance` | DATE | วันที่บำรุงรักษาครั้งถัดไป |

### ⚡ ข้อมูลการใช้พลังงาน (ค่าล่าสุด)
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย |
|---------|-------------|----------|
| `current_reading` | DECIMAL(10,2) | การอ่านค่าปัจจุบัน |
| `voltage` | DECIMAL(8,2) | แรงดันไฟฟ้า |
| `current_amperage` | DECIMAL(8,2) | กระแสไฟฟ้า |
| `power_factor` | DECIMAL(4,3) | ตัวประกอบกำลัง |

### 📊 การเก็บรวบรวมข้อมูล
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย | ค่าเริ่มต้น |
|---------|-------------|----------|------------|
| `data_collection_interval` | INTEGER | ช่วงเวลาเก็บข้อมูล (วินาที) | 60 |
| `last_data_received` | TIMESTAMP | เวลาที่รับข้อมูลล่าสุด | - |

### ⚙️ การตั้งค่าและหมายเหตุ
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย |
|---------|-------------|----------|
| `settings` | JSONB | การตั้งค่าเพิ่มเติมในรูปแบบ JSON |
| `description` | TEXT | คำอธิบายอุปกรณ์ |
| `notes` | TEXT | หมายเหตุเพิ่มเติม |

### 🕐 Timestamps
| คอลัมน์ | ประเภทข้อมูล | คำอธิบาย | ค่าเริ่มต้น |
|---------|-------------|----------|------------|
| `created_at` | TIMESTAMP WITH TIME ZONE | เวลาที่สร้างข้อมูล | CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP WITH TIME ZONE | เวลาที่แก้ไขล่าสุด | CURRENT_TIMESTAMP |

## 📈 Indexes สำหรับประสิทธิภาพ

| Index Name | คอลัมน์ | จุดประสงค์ |
|------------|---------|----------|
| `idx_iot_devices_faculty` | faculty | กรองตามคณะ |
| `idx_iot_devices_status` | status | กรองตามสถานะ |
| `idx_iot_devices_meter_type` | meter_type | กรองตามประเภทมิเตอร์ |
| `idx_iot_devices_network_status` | network_status | กรองตามสถานะเครือข่าย |
| `idx_iot_devices_location` | faculty, building, floor | ค้นหาตามที่ตั้ง |
| `idx_iot_devices_last_data` | last_data_received | ติดตามข้อมูลล่าสุด |
| `idx_iot_devices_device_id` | device_id | ค้นหาด้วย device_id |

## 🎯 ตัวอย่างข้อมูลในตาราง

### 📊 Faculty ที่รองรับ
- `institution` - สำนักงาน/บริหาร
- `engineering` - วิศวกรรมศาสตร์  
- `liberal_arts` - ศิลปศาสตร์
- `business_administration` - บริหารธุรกิจ
- `architecture` - สถาปัตยกรรมศาสตร์
- `industrial_education` - ศึกษาศาสตร์อุตสาหกรรม

### ⚙️ Meter Types
- `digital` - มิเตอร์ดิจิทัล (มีการเชื่อมต่อเครือข่าย)
- `analog` - มิเตอร์แอนาล็อก (อ่านค่าด้วยตา)

### 🔧 Device Status
- `active` - ใช้งานปกติ
- `inactive` - ปิดใช้งาน
- `maintenance` - อยู่ระหว่างซ่อมบำรุง

### 🌐 Network Status
- `online` - เชื่อมต่อเครือข่ายได้
- `offline` - ไม่ได้เชื่อมต่อเครือข่าย
- `error` - เชื่อมต่อผิดพลาด

## 📝 ตัวอย่างการใช้งาน SQL

### ดึงอุปกรณ์ทั้งหมดของคณะวิศวกรรม:
```sql
SELECT * FROM iot_devices 
WHERE faculty = 'engineering' 
ORDER BY building, floor, room;
```

### ดึงอุปกรณ์ที่ออนไลน์:
```sql
SELECT name, device_id, faculty, network_status 
FROM iot_devices 
WHERE network_status = 'online';
```

### ดึงอุปกรณ์ที่ต้องบำรุงรักษา:
```sql
SELECT name, device_id, status, last_maintenance 
FROM iot_devices 
WHERE status = 'maintenance' 
   OR next_maintenance < CURRENT_DATE;
```

### นับจำนวนอุปกรณ์ตามคณะ:
```sql
SELECT faculty, COUNT(*) as device_count 
FROM iot_devices 
GROUP BY faculty 
ORDER BY device_count DESC;
```

### ดึงอุปกรณ์ที่ไม่ได้ส่งข้อมูลนานกว่า 1 ชั่วโมง:
```sql
SELECT name, device_id, last_data_received 
FROM iot_devices 
WHERE last_data_received < NOW() - INTERVAL '1 hour' 
   OR last_data_received IS NULL;
```

## 🔄 Triggers

### Auto-update Timestamp
มี trigger ที่จะอัปเดต `updated_at` อัตโนมัติเมื่อมีการแก้ไขข้อมูล:

```sql
CREATE OR REPLACE TRIGGER update_iot_devices_updated_at 
    BEFORE UPDATE ON iot_devices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

---

📝 **หมายเหตุ:** ตารางนี้ออกแบบมาเพื่อรองรับการใช้งานในมหาวิทยาลัยที่มีหลายคณะและหลายประเภทอุปกรณ์
