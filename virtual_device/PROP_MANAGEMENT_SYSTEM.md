# Device Property Management System

## 🎯 **ระบบจัดการไฟล์ Prop**

### 📋 **ไฟล์ที่สร้างขึ้น:**

#### **1. `{DEVICE_ID}_prop.json`** - เก็บข้อมูล Properties และสถานะ
#### **2. `{DEVICE_ID}_config.json`** - เก็บข้อมูล Configuration หลังอนุมัติ

---

## 🔄 **ขั้นตอนการทำงาน:**

### **Phase 1: Device Startup**
```
1. โหลดไฟล์ prop (ตรวจสอบสถานะก่อน)
   ├─ status="approved" → set is_registered=True
   └─ status="pending" → set is_registered=False
   
2. โหลดไฟล์ config (ถ้ามี)

3. เชื่อมต่อ MQTT และเลือก Phase
   ├─ is_registered=True → เริ่ม Data Phase
   └─ is_registered=False → เริ่ม Prop Phase
```

### **Phase 2: Prop Submission (ถ้า pending)**
```
1. ส่ง /prop ทุก 30 วินาที  
2. บันทึกข้อมูล prop ลงไฟล์
3. รอการอนุมัติ
```

### **Phase 3: Data Transmission (ถ้า approved)**
```
1. รับ /config จาก server (ถ้ายังไม่มี)
2. อัปเดตสถานะ prop เป็น "approved"
3. บันทึก config ลงไฟล์
4. ส่ง /data ทันที
```

---

## 📄 **รูปแบบไฟล์ prop.json:**

```json
{
  "saved_timestamp": "2025-08-29T14:30:25.000Z",
  "device_id": "ESP32_ENGR_LAB_001",
  "status": "pending",
  "prop_data": {
    "device_id": "ESP32_ENGR_LAB_001",
    "device_name": "Computer Engineering Lab Meter",
    "data_collection_interval": 15,
    "status": "online",
    "timestamp": "2025-08-29T14:30:25.000Z",
    "device_prop": {
      "device_type": "digital_meter",
      "installation_date": "2024-01-15",
      "connection_type": "wifi",
      "ip_address": "192.168.100.205",
      "mac_address": "AA:BB:CC:DD:EE:FF",
      "firmware_version": "2.1.3"
    }
  },
  "submission_count": 1,
  "status_updated_at": null
}
```

---

## 📊 **สถานะ (Status) ที่มี:**

### **🟡 pending**
- อุปกรณ์ส่ง prop แล้ว รอการอนุมัติ
- ยังคงส่ง /prop ทุก 30 วินาที
- ยังไม่ส่ง /data

### **🟢 approved** 
- อุปกรณ์ได้รับการอนุมัติแล้ว
- หยุดส่ง /prop
- เริ่มส่ง /data ตามช่วงเวลาที่กำหนด

### **🔴 rejected**
- อุปกรณ์ถูกปฏิเสธ (ในอนาคต)
- สามารถส่ง prop ใหม่ได้

---

## 🛠️ **ฟังก์ชันที่เพิ่ม:**

### **1. save_prop_to_file(prop_data)**
```python
- บันทึก prop data ลงไฟล์
- อัปเดต submission_count อัตโนมัติ
- เก็บ timestamp การบันทึก
```

### **2. load_prop_from_file()**
```python
- โหลด prop data จากไฟล์
- แสดงสถานะและจำนวนครั้งที่ส่ง
- คืนค่า prop data หรือ None
```

### **3. update_prop_status(status)**
```python
- อัปเดตสถานะ prop
- บันทึก timestamp การอัปเดต
- ใช้เมื่อได้รับการอนุมัติ/ปฏิเสธ
```

---

## 🚀 **การทดสอบ:**

### **Run 1 (ครั้งแรก):**
```
📝 ไม่พบไฟล์ prop data - จะสร้างใหม่
🔄 เริ่ม Prop Phase (รอการอนุมัติ)
📤 ส่ง /prop: ESP32_ENGR_LAB_001 (รอการอนุมัติ...)
✅ Prop data บันทึกแล้ว: ESP32_ENGR_LAB_001_prop.json
```

### **Run 2 (รีสตาร์ท):**
```
📂 โหลด prop data จากไฟล์: ESP32_ENGR_LAB_001_prop.json
📊 Status: pending
📝 Submission count: 2
💾 บันทึกเมื่อ: 2025-08-29T14:30:25.000Z
```

### **เมื่อได้รับการอนุมัติ:**
```
🎉 อุปกรณ์ได้รับการอนุมัติแล้ว!
✅ อัปเดตสถานะ prop เป็น: approved
✅ Config บันทึกแล้ว: ESP32_ENGR_LAB_001_config.json
```

---

## 📁 **ไฟล์ที่เกิดขึ้น:**

```
virtual_device/
├── ESP32_ENGR_LAB_001_prop.json     # Properties & Status
├── ESP32_ENGR_LAB_001_config.json   # Configuration (หลังอนุมัติ)
├── virtual_device_with_config_file.py
└── .env                             # Environment variables
```

---

## ✅ **ประโยชน์:**

1. **📊 Status Tracking** - ทราบสถานะ pending/approved/rejected
2. **🔄 Resume Capability** - รีสตาร์ทแล้วดำเนินการต่อได้
3. **📈 Submission Counter** - นับจำนวนครั้งที่ส่ง prop
4. **📝 Audit Trail** - มีประวัติการบันทึกและอัปเดต
5. **🛠️ Debug Friendly** - ตรวจสอบข้อมูลและสถานะได้ง่าย
6. **💾 Persistent Storage** - ข้อมูลไม่หายเมื่อรีสตาร์ท
