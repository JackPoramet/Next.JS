# 📡 MQTT Test Devices - Python Scripts

ชุดสคริปต์ Python สำหรับทดสอบการส่งข้อมูล MQTT จากอุปกรณ์ IoT จำลอง

## 🔧 Prerequisites

```bash
pip install paho-mqtt
pip install python-dateutil
```

## 🚀 การใช้งาน

### 1. ติดตั้ง Dependencies
```bash
cd mqtt_test_devices
pip install -r requirements.txt
```

### 2. รันอุปกรณ์ทดสอบ

#### Digital Device 1 - Smart Meter Engineering Lab
```bash
python digital_device_1.py
```

#### Digital Device 2 - Power Monitor Library  
```bash
python digital_device_2.py
```

#### Analog Device - Temperature/Humidity Sensor
```bash
python analog_device_1.py
```

#### รันทั้งหมดพร้อมกัน
```bash
python run_all_devices.py
```

#### ตรวจสอบข้อมูลแบบ Real-time
```bash
python mqtt_monitor.py
```

## 📊 อุปกรณ์ที่จำลอง

### 1. **Digital Device 1** - Smart Meter (Engineering Lab)
- 🆔 Device ID: `ENG_SM_LAB_01`
- 🏢 Faculty: `engineering`
- 📊 ข้อมูล: Voltage, Current, Power, Energy, Power Factor
- ⏱️ ช่วงส่งข้อมูล: ทุก 5 วินาที
- 🎯 จำลอง: การใช้ไฟฟ้าในห้องปฏิบัติการ มีการเปลี่ยนแปลงตามเวลา

### 2. **Digital Device 2** - Power Monitor (Library)
- 🆔 Device ID: `LIB_PM_MAIN_01`  
- 🏢 Faculty: `institution`
- 📊 ข้อมูล: Total Power, Reactive Power, Frequency, Power Quality
- ⏱️ ช่วงส่งข้อมูล: ทุก 3 วินาที
- 🎯 จำลอง: ระบบไฟฟ้าหลักห้องสมุด มีการตรวจสอบ Power Quality

### 3. **Analog Device** - Environmental Sensor (Architecture Studio)
- 🆔 Device ID: `ARC_ENV_STUDIO_01`
- 🏢 Faculty: `architecture`
- 📊 ข้อมูล: Temperature, Humidity, Light, Air Quality, Noise
- ⏱️ ช่วงส่งข้อมูล: ทุก 10 วินาที
- 🎯 จำลอง: สภาพแวดล้อมสตูดิโอสถาปัตยกรรม มีการประมาณจำนวนคน

## 🔗 MQTT Configuration

- **Broker**: `iot666.ddns.net:1883`
- **Username**: `electric_energy`
- **Password**: `energy666`
- **Topics**: `devices/{faculty}/{device_id}`

## 📈 Real-time Monitoring

เมื่อรันสคริปต์แล้ว ข้อมูลจะถูกส่งไปยัง MQTT broker และจะสามารถดูได้ที่:
- **Dashboard**: `http://localhost:3000/realtime`
- **WebSocket**: `ws://localhost:8080`
- **MQTT Monitor**: `python mqtt_monitor.py`

## 🎮 การควบคุม

### รันทีละตัว:
```bash
# Terminal 1
python digital_device_1.py

# Terminal 2  
python digital_device_2.py

# Terminal 3
python analog_device_1.py

# Terminal 4 (Monitor)
python mqtt_monitor.py
```

### รันทั้งหมดพร้อมกัน:
```bash
# Terminal 1
python run_all_devices.py

# Terminal 2 (Monitor)
python mqtt_monitor.py
```

## 📋 ข้อมูลที่ส่ง

### Smart Meter (Digital 1)
```json
{
  "device_id": "ENG_SM_LAB_01",
  "timestamp": "2025-08-19T14:30:00Z",
  "energy_data": {
    "voltage": 235.2,
    "current_amperage": 25.8,
    "active_power": 6067.16,
    "power_factor": 0.92,
    "total_energy": 1250.75
  },
  "device_status": {
    "status": "online",
    "network_status": "online"
  }
}
```

### Power Monitor (Digital 2)
```json
{
  "device_id": "LIB_PM_MAIN_01",
  "timestamp": "2025-08-19T14:30:00Z",
  "energy_data": {
    "voltage": 238.5,
    "current_amperage": 45.2,
    "active_power": 10780.2,
    "reactive_power": 3200.5
  },
  "power_quality": {
    "thd_voltage": 2.5,
    "thd_current": 4.8
  }
}
```

### Environmental Sensor (Analog)
```json
{
  "device_id": "ARC_ENV_STUDIO_01",
  "timestamp": "2025-08-19T14:30:00Z",
  "environmental_data": {
    "temperature": 28.5,
    "humidity": 65.2,
    "light_level": 450,
    "air_quality_ppm": 425,
    "noise_level_db": 45.5
  },
  "studio_context": {
    "estimated_occupancy": 15,
    "activity_factor": 0.85
  }
}
```

## 🛠️ การปรับแต่ง

แก้ไขค่าต่างๆ ในไฟล์ `config.py`:
- MQTT broker settings
- Device configurations  
- Data generation ranges
- Update intervals
- Simulation parameters

## 📊 Features

### ความเหมือนจริง:
- ✅ รูปแบบการใช้ไฟฟ้าตามเวลา
- ✅ Noise และ drift ในข้อมูล analog
- ✅ Power quality monitoring
- ✅ Environmental context awareness
- ✅ Device health monitoring
- ✅ Alert generation

### การจำลอง:
- ✅ Offline/online cycles
- ✅ Maintenance periods  
- ✅ Error conditions
- ✅ Calibration drift
- ✅ Seasonal variations
- ✅ Occupancy effects

## 🔧 Troubleshooting

### Connection Issues:
```bash
# Test MQTT connection
python -c "import paho.mqtt.client as mqtt; print('MQTT library OK')"

# Check broker connectivity
ping iot666.ddns.net
```

### Debug Mode:
แก้ไข `config.py`:
```python
SIMULATION_CONFIG = {
    "debug_mode": True,  # เปิด debug messages
    # ...
}
```

## 📝 Log Files

เมื่อเปิด `save_to_file = True` ใน config จะสร้างไฟล์ CSV:
- `digital_device_1_data.csv`
- `digital_device_2_data.csv`  
- `analog_device_1_data.csv`
