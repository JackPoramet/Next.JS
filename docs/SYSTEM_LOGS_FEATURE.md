# System Logs Feature

## ภาพรวม
ระบบ System Logs เป็นฟีเจอร์ใหม่ที่เพิ่มเข้ามาใน IoT Electric Energy Management System เพื่อช่วยในการติดตามและตรวจสอบกิจกรรมต่างๆ ของระบบ

## ฟีเจอร์หลัก

### 1. การแสดงผล Logs
- **หน้าแสดง Logs**: `/logs` หรือเข้าผ่าน Dashboard → System Logs
- **แสดงรายละเอียด**: timestamp, log level, category, message, details
- **สถิติ**: แสดงจำนวน logs แยกตาม level (info, warn, error, debug, success)

### 2. การกรอง (Filtering)
- **ตามระดับ**: Error, Warning, Info, Success, Debug
- **ตามหมวดหมู่**: MQTT, Database, Authentication, API, SSE, Device, Admin
- **ค้นหาข้อความ**: ค้นหาใน message, category, source

### 3. การส่งออกข้อมูล
- **Export เป็น JSON**: ดาวน์โหลดข้อมูล logs ที่กรองแล้ว
- **รูปแบบไฟล์**: `system_logs_YYYY-MM-DD.json`

## โครงสร้างข้อมูล

### Log Entry Interface
```typescript
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  category: string;
  message: string;
  details?: any;
  source?: string;
  userId?: number;
  userEmail?: string;
}
```

### Log Categories
- **MQTT**: การเชื่อมต่อและข้อความจาก MQTT broker
- **Database**: การทำงานกับฐานข้อมูล
- **Authentication**: การเข้าสู่ระบบและออกจากระบบ
- **API**: การเรียกใช้ API endpoints
- **SSE**: Server-Sent Events สำหรับ real-time data
- **Device**: การจัดการอุปกรณ์ IoT
- **Admin**: การดำเนินงานของผู้ดูแลระบบ

## API Endpoints

### GET /api/logs
ดึงข้อมูล logs จากระบบ

**Query Parameters:**
- `level`: กรองตาม log level
- `category`: กรองตามหมวดหมู่
- `search`: ค้นหาข้อความ
- `limit`: จำนวนรายการสูงสุด (default: 100)
- `offset`: เริ่มต้นจากรายการที่ (default: 0)
- `startDate`: วันที่เริ่มต้น
- `endDate`: วันที่สิ้นสุด

**Response:**
```json
{
  "success": true,
  "message": "Logs retrieved successfully",
  "data": {
    "logs": [...],
    "total": 100,
    "limit": 100,
    "offset": 0
  }
}
```

### POST /api/logs
เพิ่ม log entry ใหม่ (สำหรับระบบ logging ภายใน)

**Request Body:**
```json
{
  "level": "info",
  "category": "API",
  "message": "User login successful",
  "details": { "userId": 1, "email": "user@example.com" },
  "source": "auth-service"
}
```

## การใช้งาน

### 1. เข้าถึงหน้า Logs
1. เข้าสู่ระบบ Dashboard
2. คลิกเมนู "System Logs" ในแถบด้านข้าง
3. หรือไปที่ URL: `http://localhost:3000/logs`

### 2. การกรองข้อมูล
1. ใช้ช่องค้นหาเพื่อหาข้อความที่ต้องการ
2. เลือก Log Level จากดรอปดาวน์
3. เลือก Category ที่สนใจ
4. คลิก Refresh เพื่ออัปเดตข้อมูล

### 3. การส่งออกข้อมูล
1. ตั้งค่า filters ตามต้องการ
2. คลิกปุ่ม "Export" 
3. ไฟล์ JSON จะถูกดาวน์โหลดอัตโนมัติ

## ไฟล์ที่เกี่ยวข้อง

### Frontend Components
- `src/app/logs/page.tsx` - หน้าหลักของ System Logs
- `src/components/layout/Sidebar.tsx` - เพิ่มเมนู System Logs
- `src/components/layout/MainContent.tsx` - เชื่อมต่อกับ logs page

### Backend API
- `src/app/api/logs/route.ts` - API endpoint สำหรับ logs

### UI Components
- ใช้ Shadcn UI components (Card, Badge, Button, ScrollArea, etc.)
- Responsive design ที่รองรับทั้ง desktop และ mobile

## การพัฒนาต่อ

### 1. Real Logging Service
- ปัจจุบันใช้ mock data
- ในอนาคตจะเชื่อมต่อกับ database หรือ logging service จริง
- เพิ่ม authentication middleware

### 2. Advanced Features
- Real-time log streaming ผ่าน WebSocket
- Log retention policies
- Advanced search และ filtering
- Log aggregation และ analytics
- Alert system สำหรับ critical errors

### 3. Performance Optimization
- Pagination สำหรับ logs จำนวนมาก
- Caching mechanism
- Background log processing

## การทดสอบ

### Mock Data
- ระบบจะสร้างข้อมูลจำลองสำหรับทดสอบ
- ข้อมูลครอบคลุมทุก category และ log level
- รวมข้อมูล details และ metadata

### การทดสอบฟีเจอร์
1. ทดสอบการแสดงผล logs
2. ทดสอบ filtering และ search
3. ทดสอบการ export ข้อมูล
4. ทดสอบ responsive design

## หมายเหตุ
- ฟีเจอร์นี้อยู่ในระยะเริ่มต้น และจะได้รับการพัฒนาต่อเนื่อง
- การเชื่อมต่อกับ logging service จริงจะถูกเพิ่มในเวอร์ชันถัดไป
- ข้อเสนอแนะและ feedback ยินดีรับฟัง
