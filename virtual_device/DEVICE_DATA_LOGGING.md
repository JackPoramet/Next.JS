# Data Logging System for Virtual Device

## 🎯 **ระบบบันทึกข้อมูลลง devices_data**

### 📋 **ขั้นตอนการทำงาน:**

#### 1. **Virtual Device ส่งข้อมูล**
```json
{
  "device_id": "ESP32_ENGR_LAB_001",
  "timestamp": "2025-08-29T14:30:25.123Z",
  "network_status": "online",
  "electrical_measurements": {
    "voltage": 380.5,
    "current_amperage": 45.8,
    "power_factor": 0.88,
    "active_power": 28450.5,
    "reactive_power": 12250.2
  },
  "three_phase_measurements": {
    "voltage_phase_b": 379.8,
    "voltage_phase_c": 381.2
  },
  "environmental_monitoring": {
    "device_temperature": 35.2
  }
}
```

#### 2. **MQTT Service รับและประมวลผล**
```typescript
// ใน mqtt-service.ts
if (topic.includes('/data')) {
  await this.checkNewDevice(data, topic);
  // ↓ ตรวจสอบว่า device อนุมัติแล้วหรือไม่
  // ↓ ถ้าอนุมัติแล้ว → เรียก updateDeviceData()
}
```

#### 3. **บันทึกลงฐานข้อมูล**
```sql
UPDATE devices_data SET 
  -- Network Status
  network_status = 'online',
  connection_quality = 85,
  signal_strength = -55,
  
  -- Electrical Measurements
  voltage = 380.5,
  current_amperage = 45.8,
  power_factor = 0.88,
  frequency = 50.1,
  active_power = 28450.5,
  reactive_power = 12250.2,
  
  -- 3-Phase Data
  voltage_phase_b = 379.8,
  voltage_phase_c = 381.2,
  
  -- Environmental
  device_temperature = 35.2,
  
  -- System Updates
  last_data_received = CURRENT_TIMESTAMP,
  data_collection_count = data_collection_count + 1,
  updated_at = CURRENT_TIMESTAMP
WHERE device_id = 'ESP32_ENGR_LAB_001';
```

## 📊 **ข้อมูลที่บันทึก**

### **Basic Electrical:**
- `voltage`, `current_amperage`, `power_factor`, `frequency`
- `active_power`, `reactive_power`, `apparent_power`

### **3-Phase Measurements:**
- `voltage_phase_b`, `voltage_phase_c`
- `current_phase_b`, `current_phase_c`  
- `power_factor_phase_b`, `power_factor_phase_c`
- `active_power_phase_a/b/c`

### **Environmental:**
- `device_temperature`

### **System Health:**
- `uptime_hours`, `data_collection_count`
- `last_data_received`, `network_status`

### **Energy Measurements:**
- `total_energy`, `daily_energy`

## 🔍 **การตรวจสอบ**

### **1. ตรวจสอบใน Database:**
```sql
SELECT 
  device_id, 
  network_status,
  voltage, 
  current_amperage, 
  active_power,
  device_temperature,
  last_data_received,
  data_collection_count
FROM devices_data 
WHERE device_id = 'ESP32_ENGR_LAB_001'
ORDER BY updated_at DESC 
LIMIT 1;
```

### **2. ตรวจสอบ Console Logs:**
```
📊 Processing /data message for device: ESP32_ENGR_LAB_001
📋 Device ESP32_ENGR_LAB_001 already approved - updating device data
🔄 Updating devices_data for device: ESP32_ENGR_LAB_001
✅ Successfully updated devices_data for ESP32_ENGR_LAB_001
📊 Power: 28.5kW | Voltage: 380.5V | Current: 45.8A
```

## 🚀 **การทดสอบ**

### **Step 1: รันระบบ**
```bash
# Terminal 1: Next.js Server
npm run dev

# Terminal 2: Virtual Device
python virtual_device_with_config_file.py
```

### **Step 2: ตรวจสอบการทำงาน**
1. ✅ Virtual Device ส่งข้อมูลเรียบร้อย
2. ✅ MQTT Service รับข้อมูลและประมวลผล
3. ✅ ข้อมูลถูกบันทึกลง `devices_data`
4. ✅ Network status เป็น 'online'
5. ✅ Dashboard แสดงข้อมูลเรียลไทม์

## ✅ **ประโยชน์**

1. **ข้อมูลครบถ้วน** - บันทึกทุก field ที่ Virtual Device ส่งมา
2. **Real-time Updates** - อัปเดตทันทีที่ได้รับข้อมูล
3. **Network Status** - อัปเดตสถานะ online/offline อัตโนมัติ
4. **Data Quality** - ตรวจสอบและ log การทำงาน
5. **3-Phase Support** - รองรับข้อมูลระบบไฟ 3 เฟส
6. **Performance** - ใช้ COALESCE เพื่อไม่เขียนทับข้อมูลเก่าหากข้อมูลใหม่เป็น null
