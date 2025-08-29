# Virtual Device Data Format Update

## 📋 เปรียบเทียบรูปแบบข้อมูล

### ❌ **รูปแบบเดิม (ไม่ถูกต้อง):**
```json
{
  "device_id": "ESP32_ENGR_LAB_001",
  "timestamp": "2025-08-29T...",
  "status": "online",
  "electrical_measurements": {
    "voltage": {
      "voltage_l1": 220,
      "voltage_l2": 220,
      "voltage_l3": 220
    },
    "current": {
      "current_l1": 25,
      "current_l2": 25,
      "current_l3": 25
    },
    "power": {
      "active_power_l1": 5000,
      "active_power_l2": 5000,
      "active_power_l3": 5000
    }
  }
}
```

### ✅ **รูปแบบใหม่ (ตามมาตรฐาน):**
```json
{
  "device_id": "ESP32_ENGR_LAB_001",
  "timestamp": "2025-08-29T14:30:25.123Z",
  "measurement_interval": 15,
  "sequence_number": 1234,
  
  "network_status": "online",
  "connection_quality": 85,
  "signal_strength": -55,
  
  "electrical_measurements": {
    "voltage": 380.5,
    "current_amperage": 45.8,
    "power_factor": 0.88,
    "frequency": 50.1,
    "active_power": 28450.5,
    "reactive_power": 12250.2,
    "apparent_power": 31038.9,
    "total_energy": 856789.245,
    "daily_energy": 245.678
  },
  
  "three_phase_measurements": {
    "is_three_phase": true,
    "voltage_phase_b": 379.8,
    "voltage_phase_c": 381.2,
    "current_phase_b": 44.2,
    "current_phase_c": 46.5,
    "power_factor_phase_b": 0.85,
    "power_factor_phase_c": 0.90,
    "active_power_phase_a": 9480.5,
    "active_power_phase_b": 9120.8,
    "active_power_phase_c": 9849.2
  },
  
  "environmental_monitoring": {
    "device_temperature": 35.2
  },
  
  "device_health": {
    "uptime_hours": 24,
    "data_collection_count": 5760,
    "error_count_today": 0
  },
  
  "energy_measurements": {
    "total_energy_import": 856789.245,
    "total_energy_export": 125.5,
    "daily_energy_import": 245.678,
    "daily_energy_export": 12.5,
    "monthly_energy": 7356.789,
    "peak_demand": 35500.0
  }
}
```

## 🎯 **ความแตกต่างหลัก:**

### 1. **โครงสร้างข้อมูลไฟฟ้า**
- **เดิม**: แยกเป็น object ย่อย (`voltage: { voltage_l1, voltage_l2, voltage_l3 }`)
- **ใหม่**: ข้อมูลหลักอยู่ระดับบนสุด (`voltage: 380.5`) + ข้อมูล 3-phase แยกต่างหาก

### 2. **ข้อมูลเพิ่มเติม**
- **เดิม**: ข้อมูลพื้นฐานเท่านั้น
- **ใหม่**: ครบถ้วน รวมถึง:
  - Network status & signal strength
  - Device health monitoring  
  - Meter communication status
  - Energy measurements
  - Data quality indicators

### 3. **ชื่อ Field**
- **เดิม**: `current` → **ใหม่**: `current_amperage`
- **เดิม**: `status` → **ใหม่**: `network_status`
- **เดิม**: `temperature` → **ใหม่**: `device_temperature`

## 🚀 **การใช้งาน:**

```bash
# รันไฟล์ใหม่ที่อัปเดตแล้ว
python virtual_device_with_config_file.py
```

## 📊 **ผลลัพธ์:**
```
📊 ส่ง /data: 28.5kW | 380.1V | 45.2A (14:30:45)
📊 ส่ง /data: 29.1kW | 379.8V | 46.1A (14:31:00)
```

## ✅ **ประโยชน์:**
1. **ตรงตามมาตรฐาน** - เข้ากันได้กับ Backend
2. **ข้อมูลครบถ้วน** - รองรับการประมวลผลที่ซับซ้อน
3. **ง่ายต่อการ Debug** - มี sequence number และ timestamp ที่ชัดเจน
4. **รองรับอนาคต** - มีข้อมูล device health และ data quality
