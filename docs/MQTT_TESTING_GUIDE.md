# MQTT Testing Guide

## การทดสอบระบบ MQTT กับ Dashboard

### 1. ไฟล์สำหรับทดสอบ

#### Python MQTT Publisher (`scripts/mqtt-test-publisher.py`)
- **วัตถุประสงค์**: ส่งข้อมูลทดสอบไปยัง MQTT topics
- **การใช้งาน**: รันเพื่อจำลองข้อมูลจาก IoT devices
- **Topics**: ครอบคลุมทุกแผนกที่กำหนดไว้

#### Node.js MQTT Tester (`scripts/test-mqtt-connection.js`)
- **วัตถุประสงค์**: ทดสอบการเชื่อมต่อ MQTT และ subscribe topics
- **การใช้งาน**: ตรวจสอบว่าระบบสามารถรับข้อมูลได้หรือไม่

### 2. วิธีการทดสอบ

#### Step 1: เตรียมสภาพแวดล้อม
```bash
# ติดตั้ง dependencies สำหรับ Python
pip install paho-mqtt

# ติดตั้ง dependencies สำหรับ Node.js (ถ้าจำเป็น)
npm install mqtt
```

#### Step 2: ทดสอบการรับข้อมูล (Subscriber)
```bash
# รัน Node.js MQTT tester
node scripts/test-mqtt-connection.js

# หรือรัน Python subscriber ที่คุณมี
python3 your_mqtt_subscriber.py
```

#### Step 3: ส่งข้อมูลทดสอบ (Publisher)
```bash
# รัน Python test publisher
python3 scripts/mqtt-test-publisher.py
```

#### Step 4: ตรวจสอบ Dashboard
1. เปิด Next.js dashboard: `http://localhost:3000`
2. ไปที่ **Real-time Monitor**: `http://localhost:3000/realtime`
3. ไปที่ **System Check**: `http://localhost:3000/dashboard` (MQTT Topic Monitor section)

### 3. สิ่งที่ควรเห็นในการทดสอบ

#### ใน Real-time Dashboard:
- Device cards แสดงข้อมูลแยกตามแผนก
- ข้อมูล voltage, current, power อัปเดตแบบ real-time
- แสดงชื่อแผนก (department) ใต้ชื่อ device

#### ใน System Check MQTT Monitor:
- แสดง topics ทั้งหมดที่มีข้อมูลส่งมา
- นับจำนวน messages ของแต่ละ topic
- แสดงข้อมูล JSON ล่าสุดของแต่ละ topic
- สถานะการเชื่อมต่อ WebSocket

#### ใน Console/Terminal:
```
📡 Broadcasting MQTT data to X clients
📋 Topic: devices/engineering/ENG_001
📊 Data: {
  "device_id": "ENG_001",
  "voltage": 220.5,
  "current": 15.2,
  "power": 3351.6,
  ...
}
```

### 4. Topics ที่ระบบรองรับ

```
devices/institution/+           - สถาบัน
devices/engineering/+           - วิศวกรรม  
devices/liberal_arts/+          - ศิลปศาสตร์
devices/business_administration/+ - บริหารธุรกิจ
devices/architecture/+          - สถาปัตยกรรม
devices/industrial_education/+  - ศึกษาอุตสาหกรรม
```

### 5. การ Troubleshooting

#### ปัญหา: MQTT connection failed
```bash
# ตรวจสอบการเชื่อมต่อ
ping iot666.ddns.net
telnet iot666.ddns.net 1883
```

#### ปัญหา: WebSocket ไม่เชื่อมต่อ
```bash
# ตรวจสอบ WebSocket server
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: test" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:8080/
```

#### ปัญหา: ไม่มีข้อมูลใน Dashboard
1. ตรวจสอบ Console logs ใน browser
2. ตรวจสอบ Terminal logs ของ Next.js server
3. ตรวจสอบว่า MQTT publisher ส่งข้อมูลหรือไม่

### 6. ข้อมูลตัวอย่างสำหรับทดสอบ

#### Device Data Format:
```json
{
  "device_id": "ENG_001",
  "timestamp": "2025-07-30T10:30:00Z",
  "voltage": 220.5,
  "current": 15.2,
  "power": 3351.6,
  "energy": 125.8,
  "frequency": 50.1,
  "power_factor": 0.98,
  "temperature": 35.2,
  "status": "online"
}
```

#### Manual Testing (mosquitto_pub):
```bash
# ส่งข้อมูลทดสอบด้วยตนเอง
mosquitto_pub -h iot666.ddns.net -p 1883 \
  -u electric_energy -P energy666 \
  -t "devices/engineering/test_device" \
  -m '{"device_id":"test_device","voltage":220,"current":10,"power":2200,"status":"online","timestamp":"2025-07-30T10:30:00Z"}'
```

### 7. การตรวจสอบผลลัพธ์

#### Success Indicators:
✅ MQTT client เชื่อมต่อสำเร็จ  
✅ WebSocket server ทำงานบน port 8080  
✅ Data แสดงใน Real-time Dashboard  
✅ Topics ปรากฏใน System Check Monitor  
✅ Message counts เพิ่มขึ้นเมื่อมีข้อมูลใหม่  

#### คำสั่งสำหรับ Debug:
```bash
# ดู WebSocket connections
netstat -an | grep 8080

# ดู MQTT connections  
netstat -an | grep 1883

# ดู logs ของ Next.js
npm run dev

# ตรวจสอบ MQTT service
curl http://localhost:3000/api/start-services
```
