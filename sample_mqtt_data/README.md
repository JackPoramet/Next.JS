# 🔧 Device Registration Concept & MQTT Topics

## 📋 Overview
ระบบการลงทะเบียนอุปกรณ์ ESP32 ที่เชื่อมต่อกับ Energy Meter ผ่าน MQTT

## 🔄 Registration Flow

### Phase 1: Device Discovery (ยังไม่ลงทะเบียน)
1. **ESP32** ส่งเฉพาะ **`/prop`** topic
2. **System** ตรวจพบอุปกรณ์ใหม่
3. **Notification Bell** แสดงการแจ้งเตือน
4. **Admin** ดูรายละเอียดและตัดสินใจอนุมัติ

### Phase 2: Manual Registration (Admin Approval)
1. **Admin** คลิกอนุมัติอุปกรณ์
2. **Form** ขึ้นให้กรอกข้อมูล:
   - Meter Properties (ยี่ห้อ, รุ่น, สเปค)
   - Location (คณะ, อาคาร, ชั้น, ห้อง)
   - Device Model & Configuration
3. **System** บันทึกข้อมูลลงฐานข้อมูล
4. **System** ส่งข้อมูลการลงทะเบียนกลับไปยัง Device

### Phase 3: Operational Mode (ลงทะเบียนแล้ว)
1. **Device** เริ่มส่ง **`/data`** topic 
2. **System** เก็บข้อมูล real-time และ historical data
3. **Dashboard** แสดงข้อมูลการใช้พลังงาน

## 📡 MQTT Topic Structure

### Discovery Topic (ก่อนลงทะเบียน)
```
devices/{faculty}/{device_id}/prop
```

**Example:** 
- `devices/engineering/ESP32_ENGR_001/prop`

### Data Topic (หลังลงทะเบียนแล้ว)  
```
devices/{faculty}/{device_id}/data
```

**Example:**
- `devices/engineering/ESP32_ENGR_001/data`

### Registration Response Topic (ส่งกลับไปยัง Device)
```
devices/{faculty}/{device_id}/config
```

**Example:**
- `devices/engineering/ESP32_ENGR_001/config`

## 📄 Sample JSON Files

### 1. `device_prop_example.json` - Discovery Message
- Device identification & capabilities  
- Network information (IP, MAC, WiFi)
- Meter connection details
- Location hints for easier registration

### 2. `device_data_example.json` - Operational Data
- Real-time electrical measurements
- 3-phase support (if applicable)  
- Device health monitoring
- Communication status with meter

## 🎯 Key Features

### Auto-Discovery
- ✅ Automatic device detection via `/prop` messages
- ✅ Real-time notification system
- ✅ Device capability analysis

### Manual Approval Process  
- ✅ Admin review & approval workflow
- ✅ Detailed device information form
- ✅ Meter specification mapping
- ✅ Location assignment

### Data Collection
- ✅ Real-time data streaming via `/data` 
- ✅ Historical data archiving
- ✅ Device health monitoring
- ✅ Communication quality tracking

## 🔧 Database Integration

### Tables Used:
- **`devices_pending`** - อุปกรณ์รอการอนุมัติ
- **`devices_prop`** - อุปกรณ์ที่ลงทะเบียนแล้ว  
- **`meter_prop`** - คุณสมบัติของมิเตอร์
- **`devices_data`** - ข้อมูล real-time
- **`devices_history`** - ข้อมูลประวัติศาสตร์

## ⚡ Next Steps

1. **Test MQTT Publishing** - ทดสอบส่ง `/prop` messages
2. **Verify Auto-Discovery** - ดูว่าระบบตรวจพบอุปกรณ์ได้ไหม  
3. **Test Approval Flow** - ทดสอบขั้นตอนการอนุมัติ
4. **Implement Config Response** - ส่งข้อมูลกลับไปยัง Device
5. **Test Data Collection** - ทดสอบการส่ง `/data` messages

## 📝 Notes

- อุปกรณ์จะไม่ส่ง `/data` จนกว่าจะได้รับการอนุมัติ
- ระบบจะส่งข้อมูลการลงทะเบียนกลับไปให้อุปกรณ์ทราบ
- รองรับทั้ง single-phase และ 3-phase measurements
- มี error handling และ device health monitoring
