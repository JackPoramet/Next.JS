# Virtual IoT Device Simulator

## Overview
จำลองอุปกรณ์ IoT ที่ทำงานในสถานการณ์จริง:

### Phase 1: Unregistered Device (ยังไม่ลงทะเบียน)
- ส่งข้อมูล **Device Properties** ไปที่ topic `/prop`
- รอการอนุมัติจากระบบเว็บ
- ส่งข้อมูลทุก 30 วินาที

### Phase 2: Registered Device (ลงทะเบียนแล้ว)  
- รับข้อมูลการลงทะเบียนจาก topic `/config`
- เปลี่ยนเป็นส่งข้อมูล **Measurement Data** ไปที่ topic `/data`
- ส่งข้อมูลทุก 15 วินาที

## MQTT Topics Structure

```
devices/{faculty}/{device_id}/prop     -> อุปกรณ์ส่งข้อมูล properties
devices/{faculty}/{device_id}/config   -> เว็บส่งข้อมูลการลงทะเบียน
devices/{faculty}/{device_id}/data     -> อุปกรณ์ส่งข้อมูลการวัด
```

### Example Topics:
- **Prop**: `devices/engineering/ESP32_ENGR_LAB_001/prop`
- **Config**: `devices/engineering/ESP32_ENGR_LAB_001/config`  
- **Data**: `devices/engineering/ESP32_ENGR_LAB_001/data`

## Data Structure

### 1. Device Properties (/prop)
อุปกรณ์ส่งเฉพาะข้อมูลที่มันรู้จริงๆ:
```json
{
  "device_id": "ESP32_ENGR_LAB_001",
  "device_name": "Computer Engineering Lab Meter",
  "device_prop": {
    "device_type": "digital_meter",
    "ip_address": "192.168.100.205",
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "firmware_version": "2.1.3"
  }
}
```

**หมายเหตุ:** ไม่ส่ง `location_suggestion` หรือ `power_specifications` เพราะเป็นข้อมูลที่ admin ต้องกรอกเองในเว็บ

### 2. Config Response (/config)
เว็บส่งข้อมูลการลงทะเบียนกลับมา:
```json
{
  "device_id": "ESP32_ENGR_LAB_001",
  "approved": true,
  "meter_model_name": "PowerLogic PM8000",
  "meter_manufacturer": "Schneider Electric",
  "building": "อาคารวิศวกรรมศาสตร์", 
  "floor": "3",
  "room": "ห้องปฏิบัติการคอมพิวเตอร์",
  "rated_power": 82000,
  "responsible_person": "อ.สมชาย ใจดี"
}
```

### 3. Measurement Data (/data)
อุปกรณ์ส่งข้อมูลการวัดจริง (3 เฟส):
```json
{
  "device_id": "ESP32_ENGR_LAB_001",
  "timestamp": "2025-08-26T10:30:00Z",
  "electrical_measurements": {
    "voltage": {
      "voltage_l1": 220.5,
      "voltage_l2": 221.2,
      "voltage_l3": 219.8
    },
    "current": {
      "current_l1": 75.2,
      "current_l2": 73.8,
      "current_l3": 76.1
    },
    "power": {
      "active_power_l1": 14500,
      "active_power_l2": 14200,
      "active_power_l3": 14800
    }
  }
}
```

## Usage

### 1. Install Dependencies
```bash
pip install paho-mqtt
```

### 2. Run Virtual Device
```bash
python virtual_device.py
```

### 3. Expected Output
```
🚀 เริ่มต้น Virtual Device
📱 Device ID: ESP32_ENGR_LAB_001
🌐 MQTT Broker: iot666.ddns.net:1883
✅ เชื่อมต่อ MQTT สำเร็จ

📋 Workflow:
1. ส่ง /prop (Device Properties) ทุก 30 วินาที
2. รอรับ /config (การอนุมัติจากเว็บ)  
3. เมื่อได้รับอนุมัติ -> ส่ง /data (ข้อมูลจริง) ทุก 15 วินาที

📤 ส่ง /prop: ESP32_ENGR_LAB_001 (รอการอนุมัติ...)
📤 ส่ง /prop: ESP32_ENGR_LAB_001 (รอการอนุมัติ...)
...

📨 รับข้อมูล config จาก: devices/engineering/ESP32_ENGR_LAB_001/config
🎉 อุปกรณ์ได้รับการอนุมัติแล้ว!

📊 ส่ง /data: 43.5kW (10:30:15)
📊 ส่ง /data: 44.1kW (10:30:30)
```

## Integration with Web System

### 1. Web System listens to `/prop` messages
### 2. Shows notification to admin for approval  
### 3. Admin fills out device/meter/location details
### 4. Web sends `/config` message back to device
### 5. Device switches to sending `/data` messages

## Key Benefits

1. **ข้อมูลแยกหน้าที่ชัดเจน**: Device ส่งแค่สิ่งที่รู้ เว็บจัดการข้อมูล admin
2. **Workflow จริง**: จำลองกระบวนการลงทะเบียนที่เป็นไปได้จริง
3. **Database Compliant**: ข้อมูลสอดคล้องกับ schema ใน devices.sql 100%
4. **Scalable**: รองรับอุปกรณ์หลายตัวพร้อมกัน
