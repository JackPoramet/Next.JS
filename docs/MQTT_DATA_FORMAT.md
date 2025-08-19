# 📡 MQTT Data Format สำหรับ IoT Devices

## � Topic Structure

### 📋 ใหม่! Topic Organization
- **Device Data**: `devices/{faculty}/{device_id}/datas` - สำหรับข้อมูลจริงจากอุปกรณ์
- **Device Properties**: `devices/{faculty}/{device_id}/prop` - สำหรับข้อมูล metadata/การลงทะเบียน

### 🏢 Faculty/Department Codes
- `engineering` - คณะวิศวกรรมศาสตร์
- `institution` - หน่วยงานสถาบัน (ห้องสมุด, อาคารกลาง)
- `liberal_arts` - คณะศิลปศาสตร์
- `business_administration` - คณะบริหารธุรกิจ
- `architecture` - คณะสถาปัตยกรรมศาสตร์
- `industrial_education` - คณะครุศาสตร์อุตสาหกรรม

## �🔌 รูปแบบข้อมูลที่ส่งมาจาก MQTT

### 📊 1. Device Registration (การลงทะเบียนอุปกรณ์ใหม่)

**Topic:** `devices/{faculty}/{device_id}/prop`

```json
{
  "device_id": "ENG_SM_LAB_01",
  "name": "Smart Meter Engineering Lab 1",
  "faculty": "engineering",
  "building": "Engineering Building A",
  "floor": "2",
  "room": "Lab 201",
  "device_type": "smart_meter",
  "sensor_type": "digital",
  "manufacturer": "PowerTech",
  "model": "PM-4000",
  "firmware_version": "2.1.0",
  "installation_date": "2024-03-15",
  "data_collection_interval": 5,
  "sensors": [
    {"type": "voltage", "unit": "V", "range": "0-300", "accuracy": "±0.5%"},
    {"type": "current", "unit": "A", "range": "0-100", "accuracy": "±1.0%"},
    {"type": "power", "unit": "W", "range": "0-30000", "accuracy": "±1.5%"}
  ],
  "power_supply": "220V AC",
  "communication": "RS485/MQTT",
  "status": "online",
  "timestamp": "2024-08-19T10:30:00.000Z"
}
```

### ⚡ 2. Real-time Energy Data (ข้อมูลการใช้พลังงานแบบ Real-time)

**Topic:** `devices/{faculty}/{device_id}/datas`

```json
{
  "device_id": "ENG_SM_LAB_01",
  "timestamp": "2024-08-19T14:30:00.000Z",
  "energy_data": {
    "voltage": 235.2,
    "current": 45.8,
    "power_factor": 0.92,
    "frequency": 50.1,
    "total_power": 10760.5,
    "reactive_power": 4180.2,
    "apparent_power": 11540.8
  },
  "environmental": {
    "temperature": 28.5,
    "humidity": 65.2
  },
  "device_status": {
    "status": "active",
    "network_status": "online",
    "signal_strength": -45,
    "battery_level": 98
  }
}
```

### 📈 3. Bulk Energy Data (ข้อมูลย้อนหลังหลายจุด)

**Topic:** `iot/devices/{device_id}/energy/bulk`

```json
{
  "device_id": "SM015",
  "data_batch": [
    {
      "timestamp": "2024-07-27T14:25:00.000Z",
      "current_reading": 1248.20,
      "voltage": 234.8,
      "current_amperage": 45.2,
      "power_factor": 0.91
    },
    {
      "timestamp": "2024-07-27T14:26:00.000Z",
      "current_reading": 1249.45,
      "voltage": 235.0,
      "current_amperage": 45.5,
      "power_factor": 0.92
    },
    {
      "timestamp": "2024-07-27T14:27:00.000Z",
      "current_reading": 1250.10,
      "voltage": 235.1,
      "current_amperage": 45.6,
      "power_factor": 0.92
    }
  ]
}
```

### 🔧 4. Device Status Update (อัปเดตสถานะอุปกรณ์)

**Topic:** `iot/devices/{device_id}/status`

```json
{
  "device_id": "SM015",
  "timestamp": "2024-07-27T14:30:00.000Z",
  "status_update": {
    "status": "active",
    "network_status": "online",
    "last_maintenance": "2024-07-15",
    "next_maintenance": "2024-10-15",
    "ip_address": "192.168.1.115",
    "signal_quality": "good",
    "uptime": 2592000
  },
  "diagnostics": {
    "cpu_usage": 25.5,
    "memory_usage": 45.2,
    "disk_usage": 12.8,
    "temperature": 42.1
  }
}
```

### 🚨 5. Alert/Alarm Data (การแจ้งเตือน)

**Topic:** `iot/devices/{device_id}/alert`

```json
{
  "device_id": "SM015",
  "timestamp": "2024-07-27T14:30:00.000Z",
  "alert": {
    "type": "warning",
    "severity": "medium",
    "code": "VOLTAGE_HIGH",
    "message": "แรงดันไฟฟ้าสูงกว่าปกติ",
    "current_value": 245.8,
    "threshold_value": 240.0,
    "suggested_action": "ตรวจสอบระบบไฟฟ้า"
  },
  "energy_data": {
    "voltage": 245.8,
    "current_amperage": 52.1,
    "power_factor": 0.85
  }
}
```

### 📊 6. Configuration Update (อัปเดตการตั้งค่า)

**Topic:** `iot/devices/{device_id}/config`

```json
{
  "device_id": "SM015",
  "timestamp": "2024-07-27T14:30:00.000Z",
  "configuration": {
    "data_collection_interval": 30,
    "reporting_interval": 60,
    "alert_settings": {
      "voltage_min": 220,
      "voltage_max": 240,
      "current_max": 100,
      "power_factor_min": 0.8
    },
    "network_settings": {
      "wifi_ssid": "IoT_Network",
      "mqtt_broker": "192.168.1.100",
      "mqtt_port": 1883
    }
  }
}
```

### 🔄 7. Heartbeat (สัญญาณชีพ)

**Topic:** `iot/devices/{device_id}/heartbeat`

```json
{
  "device_id": "SM015",
  "timestamp": "2024-07-27T14:30:00.000Z",
  "status": "alive",
  "uptime": 2592000,
  "last_data_sent": "2024-07-27T14:29:30.000Z",
  "network_quality": {
    "signal_strength": -45,
    "latency": 12,
    "packet_loss": 0.1
  }
}
```

## 🗃️ การบันทึกลงฐานข้อมูล

### 📝 API Endpoint สำหรับรับข้อมูล MQTT

**POST** `/api/iot/data-ingestion`

```json
{
  "topic": "iot/devices/SM015/energy",
  "payload": {
    "device_id": "SM015",
    "timestamp": "2024-07-27T14:30:00.000Z",
    "energy_data": {
      "current_reading": 1250.75,
      "voltage": 235.2,
      "current_amperage": 45.8,
      "power_factor": 0.92
    },
    "device_status": {
      "status": "active",
      "network_status": "online"
    }
  }
}
```

### 💾 SQL Update สำหรับบันทึกข้อมูล (ตารางแยก)

```sql
-- อัปเดตข้อมูลพลังงานล่าสุด (devices_data)
UPDATE devices_data SET 
  current_reading = $1,
  voltage = $2,
  current_amperage = $3,
  power_factor = $4,
  network_status = $5,
  last_data_received = $6,
  updated_at = CURRENT_TIMESTAMP
WHERE device_id = $7;

-- อัปเดตสถานะอุปกรณ์ (devices_prop) - เฉพาะเมื่อจำเป็น
UPDATE devices_prop SET 
  status = $1,
  updated_at = CURRENT_TIMESTAMP
WHERE device_id = $2 AND status != $1;
```

### 📊 ตาราง energy_readings (สำหรับเก็บประวัติ)

```sql
CREATE TABLE energy_readings (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(100) REFERENCES devices_prop(device_id),
  timestamp TIMESTAMP WITH TIME ZONE,
  current_reading DECIMAL(10,2),
  voltage DECIMAL(8,2),
  current_amperage DECIMAL(8,2),
  power_factor DECIMAL(4,3),
  frequency DECIMAL(5,2),
  total_power DECIMAL(10,2),
  reactive_power DECIMAL(10,2),
  apparent_power DECIMAL(10,2),
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 MQTT Topic Patterns

### 📡 Topic Structure
```
iot/
├── devices/
│   ├── register                    # การลงทะเบียนอุปกรณ์ใหม่
│   ├── {device_id}/
│   │   ├── energy                  # ข้อมูลพลังงาน real-time
│   │   ├── energy/bulk             # ข้อมูลพลังงานแบบ batch
│   │   ├── status                  # สถานะอุปกรณ์
│   │   ├── config                  # การตั้งค่า
│   │   ├── alert                   # การแจ้งเตือน
│   │   └── heartbeat              # สัญญาณชีพ
│   └── discovery                   # ค้นหาอุปกรณ์ใหม่
└── system/
    ├── alerts                      # แจ้งเตือนระบบ
    └── status                      # สถานะระบบทั้งหมด
```

### 🎯 QoS Levels
- **QoS 0** - Heartbeat, Discovery
- **QoS 1** - Energy Data, Status Update
- **QoS 2** - Alerts, Critical Configuration

## 💡 ตัวอย่างการใช้งาน Node.js

### 📨 MQTT Client Example

```javascript
const mqtt = require('mqtt');
const { Pool } = require('pg');

const client = mqtt.connect('mqtt://192.168.1.100:1883');
const db = new Pool({ /* database config */ });

// รับข้อมูลพลังงาน
client.subscribe('iot/devices/+/energy');

client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const deviceId = topic.split('/')[2];
    
    // บันทึกข้อมูลลง devices_data (real-time data)
    await db.query(`
      UPDATE devices_data SET 
        current_reading = $1,
        voltage = $2,
        current_amperage = $3,
        power_factor = $4,
        network_status = $5,
        last_data_received = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE device_id = $7
    `, [
      data.energy_data.current_reading,
      data.energy_data.voltage,
      data.energy_data.current_amperage,
      data.energy_data.power_factor,
      data.device_status.network_status,
      data.timestamp,
      deviceId
    ]);
    
    // บันทึกประวัติลง energy_readings
    await db.query(`
      INSERT INTO energy_readings 
      (device_id, timestamp, current_reading, voltage, current_amperage, power_factor)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      deviceId,
      data.timestamp,
      data.energy_data.current_reading,
      data.energy_data.voltage,
      data.energy_data.current_amperage,
      data.energy_data.power_factor
    ]);
    
    console.log(`✅ บันทึกข้อมูลจาก ${deviceId} สำเร็จ`);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
});
```

### 🔄 API Endpoint for MQTT Integration

```javascript
// /api/iot/mqtt-webhook
export async function POST(request) {
  try {
    const { topic, payload } = await request.json();
    
    if (topic.includes('/energy')) {
      // บันทึกข้อมูลพลังงาน
      await updateEnergyData(payload);
    } else if (topic.includes('/status')) {
      // อัปเดตสถานะอุปกรณ์
      await updateDeviceStatus(payload);
    } else if (topic.includes('/register')) {
      // ลงทะเบียนอุปกรณ์ใหม่
      await registerNewDevice(payload);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MQTT Integration Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

## 🚨 Error Handling

### ❌ Invalid Data Format
```json
{
  "error": "INVALID_FORMAT",
  "message": "Missing required field: device_id",
  "received_data": { /* ข้อมูลที่รับมา */ }
}
```

### 🔍 Device Not Found
```json
{
  "error": "DEVICE_NOT_FOUND",
  "message": "Device SM999 not registered in system",
  "device_id": "SM999"
}
```

### ⚠️ Data Validation Error
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Voltage value out of acceptable range",
  "field": "voltage",
  "value": 300.5,
  "acceptable_range": "180-250"
}
```

---

📝 **หมายเหตุ:** รูปแบบข้อมูลนี้ออกแบบมาให้รองรับการทำงานแบบ real-time และสามารถขยายเพิ่มเติมได้ตามความต้องการ
