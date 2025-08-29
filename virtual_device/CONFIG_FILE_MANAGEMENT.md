# Virtual Device Config File Management

## 🎯 การทำงาน

### เมื่อไม่มี Config File:
1. **Prop Phase**: ส่ง `/prop` ทุก 30 วินาที (รอการอนุมัติ)
2. **รับ Config**: ผ่าน MQTT topic `/config` 
3. **บันทึก Config**: สร้างไฟล์ `{DEVICE_ID}_config.json`
4. **Data Phase**: ส่ง `/data` ตามช่วงเวลาที่กำหนด

### เมื่อมี Config File:
1. **โหลด Config**: จากไฟล์ที่บันทึกไว้
2. **ข้าม Prop Phase**: ไม่ต้องรอการอนุมัติใหม่
3. **Data Phase**: ส่งข้อมูลไฟฟ้าทันที

## 📄 รูปแบบไฟล์ Config

```json
{
  "saved_timestamp": "2025-08-29T10:30:00.000Z",
  "device_id": "ESP32_ENGR_LAB_001",
  "config": {
    "registration_status": "approved",
    "device_id": "ESP32_ENGR_LAB_001",
    "assigned_location": {
      "building": "Computer Engineering Building",
      "floor": "2",
      "room": "Server Room A201"
    },
    "assigned_meter": {
      "meter_model": "Schneider EM6400 3-Phase",
      "power_specifications": {
        "rated_power": 65000.0
      }
    },
    "device_configuration": {
      "data_collection_interval": 60
    }
  }
}
```

## 🚀 การใช้งาน

```bash
# รันด้วยไฟล์ config เดิม
python virtual_device_with_config_file.py

# ลบไฟล์ config เพื่อเริ่มใหม่
del ESP32_ENGR_LAB_001_config.json
python virtual_device_with_config_file.py
```

## 🔧 ตัวแปร Environment

```env
DEVICE_ID=ESP32_ENGR_LAB_001
FACULTY=engineering
MQTT_BROKER_HOST=iot666.ddns.net
MQTT_BROKER_PORT=1883
MQTT_USERNAME=electric_energy
MQTT_PASSWORD=electric_energy
DATA_INTERVAL=15
```

## 📋 ผลลัพธ์

### กรณีมี Config File:
```
🚀 เริ่มต้น Virtual Device
📱 Device ID: ESP32_ENGR_LAB_001
🌐 MQTT Broker: iot666.ddns.net:1883
💾 Config File: ESP32_ENGR_LAB_001_config.json
📂 โหลด config จากไฟล์: ESP32_ENGR_LAB_001_config.json
💾 บันทึกเมื่อ: 2025-08-29T10:30:00.000Z
✅ อุปกรณ์ถูกลงทะเบียนแล้ว - จะข้าม prop phase
✅ เชื่อมต่อ MQTT สำเร็จ
🔄 เริ่ม Data Phase (อุปกรณ์ลงทะเบียนแล้ว)
📊 ส่ง /data: 15.2kW (14:30:45)
```

### กรณีไม่มี Config File:
```
📝 ไม่พบไฟล์ config - จะเริ่ม prop phase
🔄 เริ่ม Prop Phase (รอการอนุมัติ)
📤 ส่ง /prop: ESP32_ENGR_LAB_001 (รอการอนุมัติ...)
📨 ได้รับ Config:
🎉 อุปกรณ์ได้รับการอนุมัติแล้ว!
✅ Config บันทึกแล้ว: ESP32_ENGR_LAB_001_config.json
📊 ส่ง /data: 15.2kW (14:31:15)
```

## 💡 ข้อดี

1. **ไม่ต้องรอการอนุมัติใหม่** เมื่อรีสตาร์ท
2. **เก็บประวัติการตั้งค่า** สำหรับการตรวจสอบ
3. **รองรับการกู้คืน** กรณีเกิดปัญหา
4. **ลดภาระบน Server** ไม่ต้องประมวลผล prop ซ้ำ
