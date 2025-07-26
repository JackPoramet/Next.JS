# 📡 IoT Devices API Testing with Postman

## 🚀 Setup

1. **เริ่ม Development Server**
   ```bash
   npm run dev
   ```
   Server จะรันที่ `http://localhost:3000`

2. **Base URL**
   ```
   http://localhost:3000/api/devices
   ```

## 📋 API Endpoints Testing Guide

### 1. 📊 GET All Devices + Statistics
**Method:** `GET`
**URL:** `http://localhost:3000/api/devices`

**Headers:**
```
Content-Type: application/json
```

**Expected Response:**
```json
{
  "devices": [
    {
      "id": 1,
      "name": "Energy Meter #001",
      "faculty": "engineering",
      "meter_type": "digital",
      "status": "active",
      "timestamp": "2025-01-26T10:30:00.000+07:00",
      "position": "Building A - Floor 1",
      "created_at": "2025-01-26T10:30:00.000+07:00",
      "updated_at": "2025-01-26T10:30:00.000+07:00"
    }
  ],
  "stats": {
    "total_devices": "6",
    "active_devices": "5",
    "inactive_devices": "1",
    "digital_meters": "4",
    "analog_meters": "2",
    "engineering_devices": "1",
    "institution_devices": "1",
    "liberal_arts_devices": "1",
    "business_devices": "1",
    "architecture_devices": "1",
    "industrial_devices": "1"
  }
}
```

### 2. 🔍 GET Devices with Filters
**Method:** `GET`
**URL:** `http://localhost:3000/api/devices?faculty=engineering&status=active`

**Query Parameters:**
- `faculty`: institution, engineering, liberal_arts, business_administration, architecture, industrial_education
- `status`: active, inactive
- `meter_type`: digital, analog

**Examples:**
```
GET /api/devices?faculty=engineering
GET /api/devices?status=active
GET /api/devices?meter_type=digital
GET /api/devices?faculty=engineering&status=active
```

### 3. 📱 GET Single Device
**Method:** `GET`
**URL:** `http://localhost:3000/api/devices/1`

**Expected Response:**
```json
{
  "device": {
    "id": 1,
    "name": "Energy Meter #001",
    "faculty": "engineering",
    "meter_type": "digital",
    "status": "active",
    "timestamp": "2025-01-26T10:30:00.000+07:00",
    "position": "Building A - Floor 1",
    "created_at": "2025-01-26T10:30:00.000+07:00",
    "updated_at": "2025-01-26T10:30:00.000+07:00"
  }
}
```

### 4. ➕ POST Create New Device
**Method:** `POST`
**URL:** `http://localhost:3000/api/devices`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Smart Meter #007",
  "faculty": "engineering",
  "meter_type": "digital",
  "status": "active",
  "position": "Engineering Building - Floor 2"
}
```

**Required Fields:**
- `name` (string)
- `faculty` (enum: institution, engineering, liberal_arts, business_administration, architecture, industrial_education)
- `meter_type` (enum: digital, analog)

**Optional Fields:**
- `status` (enum: active, inactive) - default: "active"
- `position` (string)

### 5. ✏️ PUT Update Device
**Method:** `PUT`
**URL:** `http://localhost:3000/api/devices/1`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON) - อัปเดตเฉพาะฟิลด์ที่ต้องการ:**
```json
{
  "name": "Updated Energy Meter #001",
  "status": "inactive",
  "position": "New Location - Building B"
}
```

### 6. 🗑️ DELETE Device
**Method:** `DELETE`
**URL:** `http://localhost:3000/api/devices/1`

**Expected Response:**
```json
{
  "message": "IoT device deleted successfully",
  "device": {
    "id": 1,
    "name": "Energy Meter #001"
  }
}
```

## 🧪 Testing Scenarios

### Scenario 1: Create and Test New Device
1. **POST** สร้างอุปกรณ์ใหม่
2. **GET** ดึงข้อมูลทั้งหมดเพื่อเช็คว่าถูกสร้าง
3. **GET** ดึงข้อมูลอุปกรณ์เฉพาะตัวที่สร้าง
4. **PUT** อัปเดตข้อมูล
5. **DELETE** ลบอุปกรณ์

### Scenario 2: Filter Testing
1. **GET** `/api/devices?faculty=engineering`
2. **GET** `/api/devices?status=active`
3. **GET** `/api/devices?meter_type=digital`

### Scenario 3: Error Testing
1. **GET** `/api/devices/999` (device not found)
2. **POST** with invalid faculty
3. **PUT** with invalid data

## ❌ Common Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid faculty"
}
```

### 404 Not Found
```json
{
  "error": "IoT device not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch IoT device"
}
```

## 🔧 Postman Collection Setup

1. สร้าง Collection ใหม่ชื่อ "IoT Devices API"
2. สร้าง Environment Variables:
   - `baseUrl`: `http://localhost:3000`
   - `apiPath`: `/api/devices`
3. สร้าง Requests ตามตารางด้านบน
4. ใช้ `{{baseUrl}}{{apiPath}}` ใน URL

## 🚀 Quick Start Commands

```bash
# 1. เริ่ม server
npm run dev

# 2. ทดสอบด้วย curl (ถ้าไม่มี Postman)
curl http://localhost:3000/api/devices

# 3. ทดสอบสร้างอุปกรณ์ใหม่
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Device","faculty":"engineering","meter_type":"digital"}'
```
