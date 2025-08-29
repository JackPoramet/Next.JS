# Testing Approved Device Behavior

## 🧪 **การทดสอบ Approved Device**

### **Step 1: เตรียมไฟล์ทดสอบ**
```json
// ESP32_ENGR_LAB_001_prop.json
{
  "saved_timestamp": "2025-08-29T00:48:28.509959+00:00",
  "device_id": "ESP32_ENGR_LAB_001",
  "status": "approved",  // ← เปลี่ยนเป็น approved
  "prop_data": {
    "device_id": "ESP32_ENGR_LAB_001",
    "device_name": "Computer Engineering Lab Meter",
    // ... prop data อื่นๆ
  },
  "submission_count": 6
}
```

### **Step 2: รัน Virtual Device**
```bash
python virtual_device_with_config_file.py
```

### **Step 3: ผลลัพธ์ที่คาดหวัง**
```
🚀 เริ่มต้น Virtual Device
📱 Device ID: ESP32_ENGR_LAB_001
🌐 MQTT Broker: iot666.ddns.net:1883
💾 Config File: ESP32_ENGR_LAB_001_config.json
📋 Prop File: ESP32_ENGR_LAB_001_prop.json

📂 โหลด prop data จากไฟล์: ESP32_ENGR_LAB_001_prop.json
📊 Status: approved
📝 Submission count: 6
💾 บันทึกเมื่อ: 2025-08-29T00:48:28.509959+00:00
✅ อุปกรณ์ได้รับการอนุมัติแล้ว - จะข้าม prop phase และส่ง /data เลย

✅ เชื่อมต่อ MQTT สำเร็จ
📡 Subscribe: devices/engineering/ESP32_ENGR_LAB_001/config
🔄 เริ่ม Data Phase (อุปกรณ์ลงทะเบียนแล้ว)

📊 ส่ง /data: 28.5kW | 380.1V | 45.2A (14:30:45)
📊 ส่ง /data: 29.1kW | 379.8V | 46.1A (14:31:00)
```

---

## ✅ **สิ่งที่เกิดขึ้น:**

### **🔄 Workflow ใหม่:**
1. **โหลด prop.json** → เช็คสถานะ
2. **status = "approved"** → ตั้ง `is_registered = True`
3. **เชื่อมต่อ MQTT** → ข้าม prop phase
4. **เริ่ม data phase** → ส่ง /data ทันที

### **🚫 สิ่งที่ไม่เกิดขึ้น:**
- ไม่ส่ง /prop อีกแล้ว
- ไม่รอการอนุมัติใหม่
- ไม่เสียเวลาใน prop phase

---

## 📋 **การตรวจสอบ:**

### **1. Log Messages:**
```
✅ อุปกรณ์ได้รับการอนุมัติแล้ว - จะข้าม prop phase และส่ง /data เลย
🔄 เริ่ม Data Phase (อุปกรณ์ลงทะเบียนแล้ว)
```

### **2. MQTT Topics:**
- ✅ Subscribe: `devices/engineering/ESP32_ENGR_LAB_001/config`
- ✅ Publish: `devices/engineering/ESP32_ENGR_LAB_001/data`
- ❌ ไม่ Publish: `devices/engineering/ESP32_ENGR_LAB_001/prop`

### **3. Data Frequency:**
- ✅ ส่ง /data ทุก 15 วินาที (ตาม data_interval)
- ❌ ไม่ส่ง /prop ทุก 30 วินาที

---

## 🎯 **Use Cases:**

### **Case 1: อุปกรณ์ใหม่**
```
prop.json ไม่มี → ส่ง /prop → รอการอนุมัติ
```

### **Case 2: อุปกรณ์ที่ pending**
```
prop.json status="pending" → ส่ง /prop ต่อ → รอการอนุมัติ
```

### **Case 3: อุปกรณ์ที่ approved แล้ว** ← **นี่คือที่เราต้องการ**
```
prop.json status="approved" → ข้าม /prop → ส่ง /data เลย
```

---

## 🛠️ **การ Debug:**

### **เปลี่ยนกลับเป็น pending:**
```json
{
  "status": "pending"  // เปลี่ยนจาก approved
}
```

### **ลบไฟล์เพื่อทดสอบ fresh start:**
```bash
del ESP32_ENGR_LAB_001_prop.json
del ESP32_ENGR_LAB_001_config.json
python virtual_device_with_config_file.py
```

---

## ✅ **ประโยชน์:**

1. **⚡ Fast Startup** - อุปกรณ์ approved ส่งข้อมูลได้ทันที
2. **🚫 No Redundant Requests** - ไม่ส่ง prop ซ้ำ
3. **🔄 Smart Resume** - จำสถานะและดำเนินการต่อ
4. **💾 Persistent State** - สถานะคงอยู่แม้รีสตาร์ท
5. **📊 Immediate Data** - ส่งข้อมูลไฟฟ้าได้ทันที
