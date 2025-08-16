# 🌟 IoT Electric Energy Management System

> ระบบจัดการพลังงานไฟฟ้า IoT แบบ Full-Stack ด้วย Next.js 15, TypeScript และ PostgreSQL

[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-000000?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-orange?logo=websocket)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![MQTT](https://img.shields.io/badge/MQTT-IoT_Protocol-green?logo=mqtt)](https://mqtt.org/)

---

## 📋 สารบัญ

- [🚀 เกี่ยวกับโปรเจค](#-เกี่ยวกับโปรเจค)
- [⚡ คุณสมบัติหลัก](#-คุณสมบัติหลัก)
- [🛠️ เทคโนโลยีที่ใช้](#️-เทคโนโลยีที่ใช้)
- [🏗️ สถาปัตยกรรมระบบ](#️-สถาปัตยกรรมระบบ)
- [🔧 การติดตั้ง](#-การติดตั้ง)
- [📖 การใช้งาน](#-การใช้งาน)
- [🔐 ระบบ Authentication](#-ระบบ-authentication)
- [📡 ระบบ Real-time](#-ระบบ-real-time)
- [📱 API Documentation](#-api-documentation)
- [🗂️ โครงสร้างโปรเจค](#️-โครงสร้างโปรเจค)
- [🧪 การทดสอบ](#-การทดสอบ)
- [🚀 การ Deploy](#-การ-deploy)
- [📞 การสนับสนุน](#-การสนับสนุน)

---

## 🚀 เกี่ยวกับโปรเจค

**IoT Electric Energy Management System** เป็นระบบจัดการพลังงานไฟฟ้าแบบครบวงจร ที่พัฒนาด้วยเทคโนโลยีที่ทันสมัยที่สุด เพื่อตอบสนองความต้องการในการติดตามและจัดการการใช้พลังงานไฟฟ้าในองค์กรขนาดใหญ่

### 🎯 วัตถุประสงค์
- ✅ **จัดการผู้ใช้** - ระบบ CRUD ผู้ใช้แบบครบถ้วน พร้อม Role-based Access Control
- ✅ **ติดตามอุปกรณ์ IoT** - จัดการและติดตาม Smart Meter และอุปกรณ์วัดพลังงาน
- ✅ **Dashboard แบบ Real-time** - แสดงข้อมูลการใช้พลังงานแบบเรียลไทม์ด้วย WebSocket
- ✅ **ระบบรักษาความปลอดภัย** - Authentication และ Authorization ระดับ Enterprise
- ✅ **รองรับ Multi-Faculty** - จัดการข้อมูลแบบแยกตามหน่วยงาน/คณะ
- ✅ **MQTT Integration** - รองรับการรับส่งข้อมูลจากอุปกรณ์ IoT แบบ Real-time

### 🏛️ กรณีการใช้งาน
- **มหาวิทยาลัย** - จัดการพลังงานไฟฟ้าของหลายคณะ/อาคาร
- **โรงงานอุตสาหกรรม** - ติดตามการใช้พลังงานของหลายหน่วยผลิต
- **อาคารสำนักงาน** - จัดการพลังงานของหลายชั้น/ฝ่าย
- **Smart City** - ระบบจัดการพลังงานในชุมชน

---

## ⚡ คุณสมบัติหลัก

### 🔐 ระบบรักษาความปลอดภัย
- **JWT Bearer Token Authentication** - ระบบยืนยันตัวตนที่ปลอดภัย
- **Role-based Access Control** - จัดการสิทธิ์ตาม Role (Admin, Manager, User)
- **Password Hashing** - เข้ารหัสรหัสผ่านด้วย bcrypt
- **Session Management** - จัดการ Session ด้วย HttpOnly Cookies
- **Route Protection** - ป้องกันการเข้าถึงหน้าที่ต้องยืนยันตัวตน
- **Self-deletion Prevention** - ป้องกันการลบบัญชีตัวเอง

### 👥 การจัดการผู้ใช้
- **CRUD Operations** - เพิ่ม แก้ไข ลบ และดูข้อมูลผู้ใช้
- **User Roles** - Admin, Manager, User พร้อมสิทธิ์ที่แตกต่างกัน
- **Profile Management** - แก้ไขข้อมูลส่วนตัว
- **Login Tracking** - ติดตามการเข้าใช้งานล่าสุด
- **User Statistics** - สถิติการใช้งานของผู้ใช้

### 📡 ระบบ Real-time Communication
- **WebSocket Server** - การสื่อสารแบบ Real-time บน port 8080
- **MQTT Integration** - รองรับโปรโตคอล MQTT สำหรับอุปกรณ์ IoT
- **Multi-device Support** - รองรับการเชื่อมต่อหลายอุปกรณ์พร้อมกัน
- **Auto-reconnection** - ระบบเชื่อมต่อใหม่อัตโนมัติเมื่อขาดการเชื่อมต่อ
- **Connection Fallback** - ระบบ Fallback URL เมื่อเชื่อมต่อผิดพลาด
- **Ping/Pong Monitoring** - ตรวจสอบสถานะการเชื่อมต่อแบบ Real-time
- **Cross-origin Support** - รองรับการเข้าถึงจากอุปกรณ์ต่างเครือข่าย

### 📊 Dashboard และการแสดงผล
- **Real-time IoT Dashboard** - แสดงข้อมูลอุปกรณ์แบบเรียลไทม์
- **Faculty-based Filtering** - กรองข้อมูลตามคณะ/หน่วยงาน
- **Multi-section Dashboard** - แบ่งส่วนแสดงผลตาม Role
- **Responsive Design** - รองรับทุกขนาดหน้าจอ (Mobile-First)
- **Interactive Navigation** - เมนูแบบ Slide Navigation
- **Statistics Cards** - แสดงสถิติแบบ Visual
- **Device Status Monitoring** - ติดตามสถานะอุปกรณ์แบบเรียลไทม์

### 🏭 การจัดการอุปกรณ์ IoT
- **Device Registration** - ลงทะเบียนอุปกรณ์ Smart Meter
- **Faculty-based Organization** - จัดกลุ่มอุปกรณ์ตามหน่วยงาน
- **Real-time Status Monitoring** - ติดตามสถานะ Online/Offline แบบเรียลไทม์
- **Energy Data Display** - แสดงข้อมูล Voltage, Current, Power, Energy
- **Temperature Monitoring** - ติดตามอุณหภูมิอุปกรณ์
- **Frequency Monitoring** - ติดตามความถี่ไฟฟ้า
- **Location Tracking** - จัดเก็บตำแหน่งติดตั้งอุปกรณ์

### 🔧 System Management
- **WebSocket Server Control** - ควบคุมและเริ่มต้น WebSocket Server
- **Service Health Check** - ตรวจสอบสถานะระบบ
- **Error Handling** - จัดการข้อผิดพลาดอย่างเหมาะสม
- **Connection Statistics** - สถิติการเชื่อมต่อและการใช้งาน
- **Debug Tools** - เครื่องมือ Debug สำหรับพัฒนา

---

## 🛠️ เทคโนโลยีที่ใช้

### 🖥️ Frontend
```json
{
  "framework": "Next.js 15.4.4",
  "ui_library": "React 19.1.0", 
  "language": "TypeScript 5.8+",
  "styling": "Tailwind CSS 4.0",
  "state_management": "Zustand 5.0.6",
  "features": ["App Router", "Turbopack", "Server Components", "SSR"]
}
```

### ⚙️ Backend
```json
{
  "runtime": "Node.js 18+",
  "api": "Next.js API Routes",
  "database": "PostgreSQL 16+",
  "orm": "Raw SQL with pg",
  "authentication": "JWT + bcrypt",
  "realtime": ["WebSocket", "MQTT"]
}
```

### 📡 Real-time Technologies
```json
{
  "websocket": "ws library v8.0+",
  "mqtt": "mqtt.js v5.0+",
  "protocols": ["WebSocket", "MQTT"],
  "features": ["Auto-reconnection", "Ping/Pong", "Multi-client Support"]
}
```

### 🛠️ Development Tools
```json
{
  "typescript": "5.8.3",
  "linting": "ESLint 9",
  "bundler": "Turbopack",
  "package_manager": "npm",
  "environment": "dotenv"
}
```

### 🔧 Infrastructure
```json
{
  "hosting": "Vercel / Self-hosted",
  "database": "PostgreSQL Cloud / Local",
  "websocket_port": "8080",
  "mqtt_broker": "External MQTT Broker",
  "cdn": "Next.js Built-in"
}
```

---

## 🏗️ สถาปัตยกรรมระบบ

```mermaid
graph TB
    A[Client Browser] --> B[Next.js Frontend]
    B --> C[API Routes]
    C --> D[Authentication Middleware]
    D --> E[PostgreSQL Database]
    
    F[IoT Devices] --> G[MQTT Broker<br/>your-mqtt-broker:1883]
    G --> H[WebSocket Server<br/>Port 8080]
    H --> B
    
    I[Admin Panel] --> C
    J[User Dashboard] --> C
    K[Real-time Dashboard] --> H
    
    L[Mobile/Tablet] --> H
    M[Multiple Devices] --> H
```

### 📁 Architecture Patterns
- **MVC Pattern** - Model-View-Controller สำหรับ API
- **Component-based Architecture** - React Components แบบ Modular
- **State Management** - Zustand สำหรับ Global State
- **Database Layer** - Raw SQL Queries พร้อม Connection Pooling
- **Authentication Flow** - JWT Token + Cookie Session
- **Real-time Architecture** - WebSocket + MQTT Integration
- **Microservices Pattern** - แยก WebSocket Server เป็น Service อิสระ

---

## 🔧 การติดตั้ง

### 📋 System Requirements
- **Node.js** 18.0+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12.0+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **MQTT Broker** (Optional - สำหรับการทดสอบ IoT)

### 🚀 Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/iot-electric-energy.git
cd iot-electric-energy
```

#### 2. Install Dependencies
```bash
# ติดตั้ง dependencies ทั้งหมด
npm install

# หรือใช้ script อัตโนมัติ
node install-all.js
```

#### 3. Environment Setup
สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"

# JWT Secrets (ต้องเปลี่ยนให้ปลอดภัยใน production)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-change-this"
NEXTAUTH_SECRET="your-nextauth-secret-key-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# WebSocket & Real-time Configuration
NEXT_PUBLIC_WS_URL="ws://localhost:8080"
WS_PORT="8080"
WS_HOST="0.0.0.0"

# MQTT Configuration (Optional)
MQTT_BROKER_URL="mqtt://your-mqtt-broker:1883"
```

#### 4. Database Setup
```bash
# สร้างฐานข้อมูลและตาราง
npm run setup-db

# เพิ่มข้อมูลตัวอย่าง
npm run seed

# หรือรีเซ็ตฐานข้อมูลทั้งหมด
npm run db:fresh
```

#### 5. Start Development Server
```bash
# Start Next.js และ WebSocket Server
npm run dev
```

🎉 **เปิดเบราว์เซอร์** ไปที่ `http://localhost:3000`

### 🔧 Network Configuration

#### สำหรับการใช้งานข้ามอุปกรณ์:
```bash
# ตรวจสอบ IP Address ของเครื่อง
ipconfig  # Windows
ifconfig  # macOS/Linux

# อัปเดต NEXT_PUBLIC_WS_URL ใน .env
NEXT_PUBLIC_WS_URL="ws://YOUR_IP_ADDRESS:8080"

# อัปเดต next.config.ts สำหรับ Cross-origin
# ดูใน next.config.ts -> allowedDevOrigins
```

---

## 📖 การใช้งาน

### 👤 Default Users

| Role | Email | Password | สิทธิ์การใช้งาน |
|------|-------|----------|----------------|
| **Admin** | admin@iot-energy.com | Admin123! | จัดการระบบทั้งหมด |
| **Manager** | manager@iot-energy.com | Manager123! | จัดการอุปกรณ์และดู Dashboard |
| **User** | user@iot-energy.com | User123! | ดู Dashboard เบื้องต้น |

### 🖱️ การใช้งานพื้นฐาน

#### 1. เข้าสู่ระบบ
- เปิด `http://localhost:3000`
- กรอก Email และ Password
- ระบบจะ redirect ไป Dashboard ตาม Role

#### 2. Dashboard
- **Admin**: เข้าถึงได้ทุกส่วน (Users, Devices, Settings)
- **Manager**: จัดการ Devices และ Energy Monitoring
- **User**: ดู Dashboard และ Energy Statistics

#### 3. Real-time Dashboard
- เข้าใช้งานที่ `/realtime`
- ดูข้อมูลอุปกรณ์ IoT แบบเรียลไทม์
- กรองข้อมูลตามคณะ/หน่วยงาน
- สถานะการเชื่อมต่อ WebSocket
- ข้อมูลการใช้พลังงาน (Voltage, Current, Power, Energy)

#### 4. User Management (Admin เท่านั้น)
- เพิ่มผู้ใช้ใหม่ผ่าน Modal
- แก้ไขข้อมูลผู้ใช้
- ลบผู้ใช้ (ไม่สามารถลบตัวเองได้)
- ดูสถิติการใช้งาน

#### 5. WebSocket Monitoring
- ตรวจสอบสถานะการเชื่อมต่อ
- ดูจำนวน connections ที่ active
- ติดตาม ping/pong responses
- จัดการการเชื่อมต่อใหม่อัตโนมัติ

---

## 🔐 ระบบ Authentication

### 🔄 Authentication Flow
```
User Login → Credential Validation → JWT Generation → Cookie Storage → Dashboard Access
```

### 🛡️ Security Features
- **JWT Tokens** - ระบบ Token ที่ปลอดภัยและ Stateless
- **Password Hashing** - bcrypt กับ Salt Rounds 12
- **HttpOnly Cookies** - ป้องกัน XSS Attacks
- **Route Protection** - Middleware ป้องกันการเข้าถึงแบบไม่ได้รับอนุญาต
- **Role-based Authorization** - สิทธิ์การใช้งานตาม Role
- **Self-deletion Prevention** - ป้องกันการลบบัญชีตัวเอง

### 🧪 Testing Authentication
```bash
# ทดสอบการเข้าสู่ระบบ
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iot-energy.com","password":"Admin123!"}'

# ทดสอบ Protected Route
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📡 ระบบ Real-time

### 🌐 WebSocket Server
```javascript
// WebSocket Server Configuration
{
  "port": 8080,
  "host": "0.0.0.0",
  "maxPayload": "16MB",
  "backlog": 100,
  "clientTracking": true
}
```

### 🔄 Connection Flow
```
Client → WebSocket Connection → Authentication → MQTT Integration → Real-time Data
```

### 📊 Real-time Features
- **Live Energy Data** - ข้อมูลการใช้พลังงานแบบเรียลไทม์
- **Device Status** - สถานะอุปกรณ์ Online/Offline
- **Connection Monitoring** - ติดตามจำนวนการเชื่อมต่อ
- **Auto-reconnection** - เชื่อมต่อใหม่อัตโนมัติเมื่อขาดการเชื่อมต่อ
- **Multi-device Support** - รองรับหลายอุปกรณ์พร้อมกัน
- **Cross-platform** - ทำงานได้บน PC, Tablet, Mobile

### 🔧 WebSocket API
```javascript
// เชื่อมต่อ WebSocket
const ws = new WebSocket('ws://localhost:8080');

// รับข้อมูลแบบ Real-time
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // จัดการข้อมูลอุปกรณ์ IoT
};

// ส่ง Ping เพื่อตรวจสอบการเชื่อมต่อ
ws.send(JSON.stringify({
  type: 'ping',
  timestamp: new Date().toISOString()
}));
```

### 📱 MQTT Integration
```javascript
// MQTT Topics ที่รองรับ
const supportedTopics = [
  'devices/institution/+',
  'devices/engineering/+',
  'devices/liberal_arts/+',
  'devices/business_administration/+',
  'devices/architecture/+',
  'devices/industrial_education/+'
];
```

---

## 📱 API Documentation

### 🔐 Authentication APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | เข้าสู่ระบบ | ❌ |
| POST | `/api/auth/logout` | ออกจากระบบ | ✅ |
| GET | `/api/auth/me` | ดูข้อมูลผู้ใช้ปัจจุบัน | ✅ |
| POST | `/api/auth/register` | ลงทะเบียน (Admin เท่านั้น) | ✅ Admin |

### 👥 User Management APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | ดูรายการผู้ใช้ทั้งหมด | ✅ Admin |
| POST | `/api/users` | เพิ่มผู้ใช้ใหม่ | ✅ Admin |
| GET | `/api/users/[id]` | ดูข้อมูลผู้ใช้ตาม ID | ✅ Admin |
| PUT | `/api/users/[id]` | แก้ไขข้อมูลผู้ใช้ | ✅ Admin |
| DELETE | `/api/users/[id]` | ลบผู้ใช้ | ✅ Admin |

### 🏭 Device Management APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/devices` | ดูรายการอุปกรณ์ทั้งหมด | ✅ |
| POST | `/api/devices` | เพิ่มอุปกรณ์ใหม่ | ✅ Admin/Manager |
| GET | `/api/devices/[id]` | ดูข้อมูลอุปกรณ์ตาม ID | ✅ |
| PUT | `/api/devices/[id]` | แก้ไขข้อมูลอุปกรณ์ | ✅ Admin/Manager |
| DELETE | `/api/devices/[id]` | ลบอุปกรณ์ | ✅ Admin |

### 📡 Real-time APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/start-services` | เริ่มต้น WebSocket Server | ✅ |
| GET | `/api/websocket` | ข้อมูล WebSocket Status | ✅ |
| GET | `/api/mqtt-status` | สถานะ MQTT Broker | ✅ |
| POST | `/api/test-broadcast` | ทดสอบส่งข้อมูล Real-time | ✅ Admin |

### 📊 Admin APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard` | สถิติ Dashboard สำหรับ Admin | ✅ Admin |
| GET | `/api/admin/login-stats` | สถิติการ Login | ✅ Admin |
| GET | `/api/profile` | ดูข้อมูล Profile | ✅ |
| PUT | `/api/profile` | แก้ไข Profile | ✅ |

### 🔑 API Authentication
ทุก Protected API ต้องส่ง Authorization Header:
```bash
Authorization: Bearer <your_jwt_token>
```

หรือใช้ Cookie (แนะนำ):
```bash
Cookie: auth-token=<your_jwt_token>
```

---

## 🗂️ โครงสร้างโปรเจค

```
iot-electric-energy/
├── 📁 src/
│   ├── 📁 app/                     # Next.js 15 App Router
│   │   ├── 📄 page.tsx             # หน้าแรก (redirect)
│   │   ├── 📄 layout.tsx           # Layout หลัก
│   │   ├── 📁 login/               # Login page
│   │   ├── 📁 dashboard/           # Dashboard pages
│   │   ├── 📁 realtime/            # Real-time IoT Dashboard
│   │   ├── 📁 websocket-debug/     # WebSocket Debug Tools
│   │   ├── 📁 websocket-test/      # WebSocket Testing
│   │   └── 📁 api/                 # API Routes
│   │       ├── 📁 auth/            # Authentication APIs
│   │       ├── 📁 users/           # User management APIs
│   │       ├── 📁 devices/         # Device management APIs
│   │       ├── 📁 admin/           # Admin-only APIs
│   │       ├── 📄 start-services/  # WebSocket Server Control
│   │       ├── 📄 mqtt-status/     # MQTT Status API
│   │       └── 📄 test-broadcast/  # Real-time Testing
│   │
│   ├── 📁 components/              # React Components
│   │   ├── 📁 ui/                  # Reusable UI components
│   │   ├── 📁 layout/              # Layout components
│   │   ├── 📁 forms/               # Form components
│   │   └── 📁 dashboard/           # Dashboard specific
│   │       ├── 📄 RealtimeDashboard.tsx  # Main Real-time Dashboard
│   │       └── 📄 SystemCheckDashboard.tsx  # System Health Check
│   │
│   ├── 📁 lib/                     # Core libraries
│   │   ├── 📄 database.ts          # PostgreSQL connection
│   │   ├── 📄 auth.ts              # Authentication utilities
│   │   ├── 📄 jwt.ts               # JWT utilities
│   │   ├── 📄 ws-server.ts         # WebSocket Server
│   │   ├── 📄 mqtt-service.ts      # MQTT Service Integration
│   │   ├── 📄 userAPI.ts           # User API client
│   │   └── 📄 deviceAPI.ts         # Device API client
│   │
│   ├── 📁 store/                   # State management
│   │   └── 📄 authStore.ts         # Zustand auth store
│   │
│   ├── 📁 hooks/                   # Custom React hooks
│   │   ├── 📄 useUsers.ts          # User management hook
│   │   ├── 📄 useDevices.ts        # Device management hook
│   │   └── 📄 useTheme.ts          # Theme management hook
│   │
│   ├── 📁 types/                   # TypeScript definitions
│   ├── 📁 utils/                   # Utility functions
│   └── 📁 models/                  # Data models
│
├── 📁 public/                      # Static assets
├── 📁 docs/                        # Documentation
│   ├── 📄 JWT-BEARER-GUIDE.md      # JWT Authentication Guide
│   ├── 📄 MQTT_TESTING_GUIDE.md    # MQTT Testing Guide
│   ├── 📄 DATABASE-COMMANDS.md     # Database Commands
│   └── 📄 POSTMAN-API-TESTING.md   # API Testing Guide
├── 📁 scripts/                     # Database scripts
├── 📁 migrations/                  # Database migrations
├── 📄 package.json                 # Dependencies
├── 📄 tsconfig.json                # TypeScript config
├── 📄 tailwind.config.ts           # Tailwind config
├── 📄 next.config.ts               # Next.js config + WebSocket CORS
├── 📄 middleware.ts                # Next.js middleware
└── 📄 README.md                    # Documentation
```

---

## 🧪 การทดสอบ

### 🔧 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | `npm run dev` | เริ่ม development server + WebSocket |
| **Build** | `npm run build` | Build production |
| **Start** | `npm run start` | เริ่ม production server |
| **Lint** | `npm run lint` | ตรวจสอบ code style |
| **Database** | `npm run db:check` | ตรวจสอบ database connection |
| **Reset DB** | `npm run db:fresh` | รีเซ็ต database ใหม่ |
| **List Users** | `npm run db:list-users` | แสดงรายการผู้ใช้ |

### ✅ Manual Testing Checklist

#### Authentication Testing
- [ ] Login ด้วย admin credentials
- [ ] Login ด้วย user credentials
- [ ] Login ด้วย credentials ผิด (ต้อง error)
- [ ] Logout และตรวจสอบ redirect
- [ ] Refresh หน้าหลัง login (ต้องยังคง login อยู่)
- [ ] เข้า `/dashboard` โดยไม่ login (ต้อง redirect ไป login)

#### Real-time System Testing
- [ ] เข้า `/realtime` และดู WebSocket status
- [ ] ตรวจสอบการเชื่อมต่อ WebSocket (ต้องแสดง "connected")
- [ ] ทดสอบจากอุปกรณ์อื่น (tablet/mobile)
- [ ] ตรวจสอบ auto-reconnection เมื่อขาดการเชื่อมต่อ
- [ ] ดูข้อมูล Real-time ของอุปกรณ์ IoT
- [ ] กรองข้อมูลตามคณะ/หน่วยงาน
- [ ] ตรวจสอบ ping/pong responses

#### User Management Testing
- [ ] แสดงรายการผู้ใช้ทั้งหมด (Admin)
- [ ] เพิ่มผู้ใช้ใหม่ผ่าน modal
- [ ] แก้ไขข้อมูลผู้ใช้
- [ ] ลบผู้ใช้คนอื่น
- [ ] พยายามลบตัวเอง (ต้องถูกป้องกัน)

#### Cross-device Testing
- [ ] เปิดหน้าเว็บจาก PC และ Tablet พร้อมกัน
- [ ] ตรวจสอบ WebSocket connections จากหลายอุปกรณ์
- [ ] ทดสอบ Real-time data sharing ระหว่างอุปกรณ์
- [ ] ตรวจสอบ responsive design บนหน้าจอต่างขนาด

### 🐛 Debug Mode
```bash
# เปิด debug logs
DEBUG=* npm run dev

# ตรวจสอบใน Browser DevTools:
# - Console: Error messages และ WebSocket logs
# - Network: API requests และ WebSocket connections
# - Application: Cookies & LocalStorage
```

### 🌐 Network Testing
```bash
# ตรวจสอบ WebSocket Server
curl -I http://localhost:8080

# ทดสอบ API endpoints
curl http://localhost:3000/api/auth/me

# ตรวจสอบ CORS settings
curl -H "Origin: http://192.168.1.55:3000" http://localhost:3000/api/test
```

---

## 🚀 การ Deploy

### 🌐 Vercel Deployment (แนะนำ)

#### 1. Prepare for Production
```bash
# Build production
npm run build

# Test production build
npm run start
```

#### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXT_PUBLIC_WS_URL
```

#### 3. Database Setup
- สร้าง PostgreSQL database บน cloud (เช่น Neon, Supabase)
- อัปเดต `DATABASE_URL` ใน Vercel environment
- รัน migration scripts

#### 4. WebSocket Configuration
- WebSocket Server ต้อง deploy แยกหรือใช้ external service
- อัปเดต `NEXT_PUBLIC_WS_URL` ให้ชื้อไปยัง production WebSocket server
- ตั้งค่า CORS สำหรับ production domain

### 🐳 Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
EXPOSE 8080

CMD ["npm", "start"]
```

#### 2. Build และ Run
```bash
# Build image
docker build -t iot-energy-app .

# Run container
docker run -p 3000:3000 -p 8080:8080 \
  -e DATABASE_URL="your_db_url" \
  -e JWT_SECRET="your_secret" \
  -e NEXT_PUBLIC_WS_URL="ws://localhost:8080" \
  iot-energy-app
```

### 🔧 Environment Variables for Production

```env
# Database
DATABASE_URL="postgresql://username:password@hostname:5432/database_prod"

# Security (ต้องใช้ค่าที่ปลอดภัยและยาวกว่านี้)
JWT_SECRET="your-production-secret-minimum-32-characters-random-string"
NEXTAUTH_SECRET="your-nextauth-production-secret-minimum-32-characters"
NEXTAUTH_URL="https://yourdomain.com"

# App
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://yourdomain.com"

# WebSocket & Real-time
NEXT_PUBLIC_WS_URL="wss://your-websocket-server.com:8080"
WS_PORT="8080"
WS_HOST="0.0.0.0"

# MQTT (Optional)
MQTT_BROKER_URL="mqtt://your-mqtt-broker.com:1883"
```

---

## 📞 การสนับสนุน

### 📚 เอกสารเพิ่มเติม
- 📖 **API Documentation** - รายละเอียด API ทั้งหมด
- 🔐 **JWT Bearer Guide** - คู่มือระบบ Authentication
- 🗄️ **Database Schema** - โครงสร้างฐานข้อมูล
- 🎨 **UI Components** - คู่มือการใช้งาน Components
- 📡 **WebSocket Guide** - คู่มือการใช้งาน Real-time System
- 🏭 **MQTT Testing** - คู่มือทดสอบการเชื่อมต่อ IoT

### 🛠️ การแก้ปัญหา

#### ปัญหาที่พบบ่อย
1. **Database Connection Error**
   ```bash
   # ตรวจสอบ connection
   npm run db:check
   
   # ตรวจสอบ .env file
   cat .env
   ```

2. **WebSocket Connection Failed**
   ```bash
   # ตรวจสอบ WebSocket Server
   curl -I http://localhost:8080
   
   # ตรวจสอบ Firewall/Network
   telnet localhost 8080
   
   # ตรวจสอบ IP Address
   ipconfig  # Windows
   ifconfig  # macOS/Linux
   ```

3. **Authentication ไม่ทำงาน**
   ```bash
   # ล้าง cookies และ localStorage
   # ตรวจสอบ JWT_SECRET ใน .env
   # ดู Console errors ใน browser
   ```

4. **Build Error**
   ```bash
   # ล้าง cache
   rm -rf .next
   npm run build
   ```

5. **Cross-device Connection Issues**
   ```bash
   # อัปเดต WebSocket URL ใน .env
   NEXT_PUBLIC_WS_URL="ws://YOUR_IP:8080"
   
   # ตรวจสอบ Firewall settings
   # ตรวจสอบ next.config.ts allowedDevOrigins
   ```

### 💡 การพัฒนาต่อ

#### 🎯 Roadmap
- [ ] **Real-time Charts** - กราฟแสดงข้อมูลเรียลไทม์ด้วย Chart.js
- [ ] **Mobile App** - แอพมือถือ React Native
- [ ] **Advanced IoT Integration** - เชื่อมต่อกับอุปกรณ์จริงผ่าน MQTT
- [ ] **Data Analytics** - การวิเคราะห์ข้อมูลขั้นสูงด้วย AI/ML
- [ ] **Notification System** - ระบบแจ้งเตือนแบบ Real-time
- [ ] **Multi-tenant Support** - รองรับหลายองค์กรในระบบเดียว
- [ ] **Energy Prediction** - ทำนายการใช้พลังงานด้วย Machine Learning
- [ ] **Alarm System** - ระบบเตือนภัยเมื่อพลังงานเกินกำหนด

#### 🤝 Contributing
1. Fork repository
2. สร้าง feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

---

## 📄 License

โปรเจคนี้พัฒนาเพื่อการศึกษาและใช้งานภายในองค์กร

---

## 🏆 สรุป

### ✨ ความสำเร็จที่ได้รับ
- ✅ **Authentication System** - ระบบยืนยันตัวตนแบบครบถ้วนพร้อม Role-based Access
- ✅ **User Management** - CRUD ผู้ใช้พร้อมการป้องกันการลบตัวเอง
- ✅ **Real-time Dashboard** - Dashboard แสดงข้อมูล IoT แบบเรียลไทม์
- ✅ **WebSocket Integration** - ระบบ WebSocket รองรับหลายอุปกรณ์
- ✅ **MQTT Integration** - รองรับการรับส่งข้อมูลจากอุปกรณ์ IoT
- ✅ **Cross-device Support** - ใช้งานได้บน PC, Tablet, Mobile
- ✅ **Modern UI/UX** - Interface ที่ทันสมัยและ Responsive
- ✅ **Database Integration** - PostgreSQL พร้อม Connection Pooling
- ✅ **API Architecture** - RESTful APIs ที่มีมาตรฐาน
- ✅ **Security Implementation** - ความปลอดภัยระดับ Production
- ✅ **TypeScript Integration** - Type Safety ทั้งระบบ
- ✅ **Auto-reconnection** - ระบบเชื่อมต่อใหม่อัตโนมัติ
- ✅ **Error Handling** - จัดการข้อผิดพลาดอย่างครอบคลุม

### 📊 สถิติโปรเจค
- **📁 Total Files**: 70+ files
- **💻 Lines of Code**: 6,000+ lines
- **🧩 Components**: 25+ React components
- **🔌 API Endpoints**: 20+ REST APIs
- **🗄️ Database Tables**: 3+ tables with relationships
- **🔐 Security Features**: JWT + bcrypt + RBAC + Self-deletion Prevention
- **📡 Real-time Features**: WebSocket + MQTT + Auto-reconnection
- **📱 Responsive Design**: Mobile-first approach
- **🌐 Cross-platform**: PC + Tablet + Mobile support

### 🚀 Production Ready Features
ระบบพร้อมใช้งานจริงใน Production Environment พร้อมด้วย:
- **Scalable Architecture** - สถาปัตยกรรมที่รองรับการขยายตัว
- **Security Best Practices** - มาตรฐานความปลอดภัย Enterprise
- **Performance Optimization** - ปรับแต่งประสิทธิภาพ
- **Comprehensive Error Handling** - จัดการข้อผิดพลาดครอบคลุม
- **Responsive Design** - รองรับทุกขนาดหน้าจอ
- **TypeScript Type Safety** - ความปลอดภัยในการเขียนโค้ด
- **Real-time Capabilities** - ความสามารถในการทำงานแบบเรียลไทม์
- **Multi-device Support** - รองรับการใช้งานข้ามอุปกรณ์
- **Auto-failover** - ระบบสำรองเมื่อเกิดปัญหา
- **Production Build** - พร้อม Deploy ไปยัง Production

### 🔮 Technology Highlights
- **Next.js 15.4.4** with App Router และ Turbopack
- **React 19.1.0** with Server Components
- **TypeScript 5.8+** สำหรับ Type Safety
- **WebSocket Real-time** สำหรับการสื่อสารแบบทันที
- **MQTT Integration** สำหรับการเชื่อมต่อ IoT
- **PostgreSQL** สำหรับจัดเก็บข้อมูล
- **JWT Authentication** สำหรับความปลอดภัย
- **Tailwind CSS** สำหรับ Styling
- **Responsive Design** สำหรับทุกขนาดหน้าจอ

---

<div align="center">

**🌟 ขอบคุณที่ใช้งาน IoT Electric Energy Management System!**

*Developed with ❤️ using cutting-edge technologies*

[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by TypeScript](https://img.shields.io/badge/Powered%20by-TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![WebSocket Enabled](https://img.shields.io/badge/WebSocket-Enabled-orange?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

**📧 สำหรับคำถามและการสนับสนุน กรุณาติดต่อทีมพัฒนา**

**🚀 System Status: Production Ready ✅**

</div>

---

## 📋 สารบัญ

- [🚀 เกี่ยวกับโปรเจค](#-เกี่ยวกับโปรเจค)
- [⚡ คุณสมบัติหลัก](#-คุณสมบัติหลัก)
- [🛠️ เทคโนโลยีที่ใช้](#️-เทคโนโลยีที่ใช้)
- [🏗️ สถาปัตยกรรมระบบ](#️-สถาปัตยกรรมระบบ)
- [🔧 การติดตั้ง](#-การติดตั้ง)
- [📖 การใช้งาน](#-การใช้งาน)
- [🔐 ระบบ Authentication](#-ระบบ-authentication)
- [📱 API Documentation](#-api-documentation)
- [🗂️ โครงสร้างโปรเจค](#️-โครงสร้างโปรเจค)
- [🧪 การทดสอบ](#-การทดสอบ)
- [🚀 การ Deploy](#-การ-deploy)
- [📞 การสนับสนุน](#-การสนับสนุน)

---

## 🚀 เกี่ยวกับโปรเจค

**IoT Electric Energy Management System** เป็นระบบจัดการพลังงานไฟฟ้าแบบครบวงจร ที่พัฒนาด้วยเทคโนโลยีที่ทันสมัยที่สุด เพื่อตอบสนองความต้องการในการติดตามและจัดการการใช้พลังงานไฟฟ้าในองค์กรขนาดใหญ่

### 🎯 วัตถุประสงค์
- ✅ **จัดการผู้ใช้** - ระบบ CRUD ผู้ใช้แบบครบถ้วน พร้อม Role-based Access Control
- ✅ **ติดตามอุปกรณ์ IoT** - จัดการและติดตาม Smart Meter และอุปกรณ์วัดพลังงาน
- ✅ **Dashboard แบบ Real-time** - แสดงข้อมูลการใช้พลังงานแบบเรียลไทม์
- ✅ **ระบบรักษาความปลอดภัย** - Authentication และ Authorization ระดับ Enterprise
- ✅ **รองรับ Multi-Faculty** - จัดการข้อมูลแบบแยกตามหน่วยงาน/คณะ

### 🏛️ กรณีการใช้งาน
- **มหาวิทยาลัย** - จัดการพลังงานไฟฟ้าของหลายคณะ/อาคาร
- **โรงงานอุตสาหกรรม** - ติดตามการใช้พลังงานของหลายหน่วยผลิต
- **อาคารสำนักงาน** - จัดการพลังงานของหลายชั้น/ฝ่าย
- **Smart City** - ระบบจัดการพลังงานในชุมชน

---

## ⚡ คุณสมบัติหลัก

### 🔐 ระบบรักษาความปลอดภัย
- **JWT Bearer Token Authentication** - ระบบยืนยันตัวตนที่ปลอดภัย
- **Role-based Access Control** - จัดการสิทธิ์ตาม Role (Admin, Manager, User)
- **Password Hashing** - เข้ารหัสรหัสผ่านด้วย bcrypt
- **Session Management** - จัดการ Session ด้วย HttpOnly Cookies
- **Route Protection** - ป้องกันการเข้าถึงหน้าที่ต้องยืนยันตัวตน

### 👥 การจัดการผู้ใช้
- **CRUD Operations** - เพิ่ม แก้ไข ลบ และดูข้อมูลผู้ใช้
- **User Roles** - Admin, Manager, User พร้อมสิทธิ์ที่แตกต่างกัน
- **Profile Management** - แก้ไขข้อมูลส่วนตัว
- **Login Tracking** - ติดตามการเข้าใช้งานล่าสุด
- **Self-deletion Prevention** - ป้องกันการลบบัญชีตัวเอง

### 📊 Dashboard และการแสดงผล
- **Multi-section Dashboard** - แบ่งส่วนแสดงผลตาม Role
- **Real-time Data** - แสดงข้อมูลแบบเรียลไทม์
- **Responsive Design** - รองรับทุกขนาดหน้าจอ (Mobile-First)
- **Interactive Navigation** - เมนูแบบ Slide Navigation
- **Statistics Cards** - แสดงสถิติแบบ Visual

### 🏭 การจัดการอุปกรณ์ IoT
- **Device Registration** - ลงทะเบียนอุปกรณ์ Smart Meter
- **Faculty-based Organization** - จัดกลุ่มอุปกรณ์ตามหน่วยงาน
- **Status Monitoring** - ติดตามสถานะ Online/Offline
- **Meter Type Support** - รองรับ Digital และ Analog Meter
- **Location Tracking** - จัดเก็บตำแหน่งติดตั้งอุปกรณ์

### 📡 ระบบ Real-time Communication
- **WebSocket Integration** - การสื่อสารแบบ Real-time
- **MQTT Support** - รองรับโปรโตคอล MQTT สำหรับ IoT
- **Auto-reconnection** - ระบบเชื่อมต่อใหม่อัตโนมัติ
- **Error Handling** - จัดการข้อผิดพลาดอย่างเหมาะสม

---

## 🛠️ เทคโนโลยีที่ใช้

### 🖥️ Frontend
```json
{
  "framework": "Next.js 15.4.4",
  "ui_library": "React 19.1.0", 
  "language": "TypeScript 5.8+",
  "styling": "Tailwind CSS 4.0",
  "state_management": "Zustand 5.0.6",
  "features": ["App Router", "Turbopack", "Server Components"]
}
```

### ⚙️ Backend
```json
{
  "runtime": "Node.js",
  "api": "Next.js API Routes",
  "database": "PostgreSQL 16+",
  "orm": "Raw SQL with pg",
  "authentication": "JWT + bcrypt",
  "realtime": ["WebSocket", "MQTT"]
}
```

### 🛠️ Development Tools
```json
{
  "typescript": "5.8.3",
  "linting": "ESLint 9",
  "bundler": "Turbopack",
  "package_manager": "npm",
  "environment": "dotenv"
}
```

### 🔧 Infrastructure
```json
{
  "hosting": "Vercel / Self-hosted",
  "database": "PostgreSQL Cloud / Local",
  "cdn": "Next.js Built-in",
  "monitoring": "Console Logging"
}
```

---

## 🏗️ สถาปัตยกรรมระบบ

```mermaid
graph TB
    A[Client Browser] --> B[Next.js Frontend]
    B --> C[API Routes]
    C --> D[Authentication Middleware]
    D --> E[PostgreSQL Database]
    
    F[IoT Devices] --> G[MQTT Broker]
    G --> H[WebSocket Server]
    H --> B
    
    I[Admin Panel] --> C
    J[User Dashboard] --> C
    K[Device Monitor] --> C
```

### 📁 Architecture Patterns
- **MVC Pattern** - Model-View-Controller สำหรับ API
- **Component-based Architecture** - React Components แบบ Modular
- **State Management** - Zustand สำหรับ Global State
- **Database Layer** - Raw SQL Queries พร้อม Connection Pooling
- **Authentication Flow** - JWT Token + Cookie Session

---

## 🔧 การติดตั้ง

### 📋 System Requirements
- **Node.js** 18.0+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12.0+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

### 🚀 Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/iot-electric-energy.git
cd iot-electric-energy
```

#### 2. Install Dependencies
```bash
# ติดตั้ง dependencies ทั้งหมด
npm install

# หรือใช้ script อัตโนมัติ
node install-all.js
```

#### 3. Environment Setup
สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"

# JWT Secrets (ต้องเปลี่ยนให้ปลอดภัยใน production)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-change-this"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# WebSocket & MQTT (Optional)
WEBSOCKET_PORT=8080
MQTT_BROKER_URL="mqtt://localhost:1883"
```

#### 4. Database Setup
```bash
# สร้างฐานข้อมูลและตาราง
npm run setup-db

# เพิ่มข้อมูลตัวอย่าง
npm run seed

# หรือรีเซ็ตฐานข้อมูลทั้งหมด
npm run db:fresh
```

#### 5. Start Development Server
```bash
npm run dev
```

🎉 **เปิดเบราว์เซอร์** ไปที่ `http://localhost:3000`

---

## 📖 การใช้งาน

### 👤 Default Users

| Role | Email | Password | สิทธิ์การใช้งาน |
|------|-------|----------|----------------|
| **Admin** | admin@iot-energy.com | Admin123! | จัดการระบบทั้งหมด |
| **Manager** | manager@iot-energy.com | Manager123! | จัดการอุปกรณ์และดู Dashboard |
| **User** | user@iot-energy.com | User123! | ดู Dashboard เบื้องต้น |

### 🖱️ การใช้งานพื้นฐาน

#### 1. เข้าสู่ระบบ
- เปิด `http://localhost:3000`
- กรอก Email และ Password
- ระบบจะ redirect ไป Dashboard ตาม Role

#### 2. Dashboard
- **Admin**: เข้าถึงได้ทุกส่วน (Users, Devices, Settings)
- **Manager**: จัดการ Devices และ Energy Monitoring
- **User**: ดู Dashboard และ Energy Statistics

#### 3. User Management (Admin เท่านั้น)
- เพิ่มผู้ใช้ใหม่ผ่าน Modal
- แก้ไขข้อมูลผู้ใช้
- ลบผู้ใช้ (ไม่สามารถลบตัวเองได้)
- ดูสถิติการใช้งาน

#### 4. Device Management
- ลงทะเบียนอุปกรณ์ใหม่
- ตั้งค่าตำแหน่งและประเภทมิเตอร์
- ติดตามสถานะการเชื่อมต่อ
- กรองอุปกรณ์ตามคณะ/หน่วยงาน

---

## 🔐 ระบบ Authentication

### 🔄 Authentication Flow
```
User Login → Credential Validation → JWT Generation → Cookie Storage → Dashboard Access
```

### 🛡️ Security Features
- **JWT Tokens** - ระบบ Token ที่ปลอดภัยและ Stateless
- **Password Hashing** - bcrypt กับ Salt Rounds 12
- **HttpOnly Cookies** - ป้องกัน XSS Attacks
- **Route Protection** - Middleware ป้องกันการเข้าถึงแบบไม่ได้รับอนุญาต
- **Role-based Authorization** - สิทธิ์การใช้งานตาม Role

### 🧪 Testing Authentication
```bash
# ทดสอบการเข้าสู่ระบบ
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iot-energy.com","password":"Admin123!"}'

# ทดสอบ Protected Route
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📱 API Documentation

### 🔐 Authentication APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | เข้าสู่ระบบ | ❌ |
| POST | `/api/auth/logout` | ออกจากระบบ | ✅ |
| GET | `/api/auth/me` | ดูข้อมูลผู้ใช้ปัจจุบัน | ✅ |
| POST | `/api/auth/register` | ลงทะเบียน (Admin เท่านั้น) | ✅ Admin |

### 👥 User Management APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | ดูรายการผู้ใช้ทั้งหมด | ✅ Admin |
| POST | `/api/users` | เพิ่มผู้ใช้ใหม่ | ✅ Admin |
| GET | `/api/users/[id]` | ดูข้อมูลผู้ใช้ตาม ID | ✅ Admin |
| PUT | `/api/users/[id]` | แก้ไขข้อมูลผู้ใช้ | ✅ Admin |
| DELETE | `/api/users/[id]` | ลบผู้ใช้ | ✅ Admin |

### 🏭 Device Management APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/devices` | ดูรายการอุปกรณ์ทั้งหมด | ✅ |
| POST | `/api/devices` | เพิ่มอุปกรณ์ใหม่ | ✅ Admin/Manager |
| GET | `/api/devices/[id]` | ดูข้อมูลอุปกรณ์ตาม ID | ✅ |
| PUT | `/api/devices/[id]` | แก้ไขข้อมูลอุปกรณ์ | ✅ Admin/Manager |
| DELETE | `/api/devices/[id]` | ลบอุปกรณ์ | ✅ Admin |

### 📊 Admin APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard` | สถิติ Dashboard สำหรับ Admin | ✅ Admin |
| GET | `/api/admin/login-stats` | สถิติการ Login | ✅ Admin |
| GET | `/api/profile` | ดูข้อมูล Profile | ✅ |
| PUT | `/api/profile` | แก้ไข Profile | ✅ |

### 🔑 API Authentication
ทุก Protected API ต้องส่ง Authorization Header:
```bash
Authorization: Bearer <your_jwt_token>
```

หรือใช้ Cookie (แนะนำ):
```bash
Cookie: auth-token=<your_jwt_token>
```

---

## 🗂️ โครงสร้างโปรเจค

```
iot-electric-energy/
├── 📁 src/
│   ├── 📁 app/                     # Next.js 15 App Router
│   │   ├── 📄 page.tsx             # หน้าแรก (redirect)
│   │   ├── 📄 layout.tsx           # Layout หลัก
│   │   ├── 📁 login/               # Login page
│   │   ├── 📁 dashboard/           # Dashboard pages
│   │   └── 📁 api/                 # API Routes
│   │       ├── 📁 auth/            # Authentication APIs
│   │       ├── 📁 users/           # User management APIs
│   │       ├── 📁 devices/         # Device management APIs
│   │       └── 📁 admin/           # Admin-only APIs
│   │
│   ├── 📁 components/              # React Components
│   │   ├── 📁 ui/                  # Reusable UI components
│   │   ├── 📁 layout/              # Layout components
│   │   ├── 📁 forms/               # Form components
│   │   └── 📁 dashboard/           # Dashboard specific
│   │
│   ├── 📁 lib/                     # Core libraries
│   │   ├── 📄 database.ts          # PostgreSQL connection
│   │   ├── 📄 auth.ts              # Authentication utilities
│   │   ├── 📄 jwt.ts               # JWT utilities
│   │   ├── 📄 userAPI.ts           # User API client
│   │   └── 📄 deviceAPI.ts         # Device API client
│   │
│   ├── 📁 store/                   # State management
│   │   └── 📄 authStore.ts         # Zustand auth store
│   │
│   ├── 📁 hooks/                   # Custom React hooks
│   │   ├── 📄 useUsers.ts          # User management hook
│   │   └── 📄 useDevices.ts        # Device management hook
│   │
│   ├── 📁 types/                   # TypeScript definitions
│   ├── 📁 utils/                   # Utility functions
│   └── 📁 models/                  # Data models
│
├── 📁 public/                      # Static assets
├── 📁 docs/                        # Documentation
├── 📁 scripts/                     # Database scripts
├── 📄 package.json                 # Dependencies
├── 📄 tsconfig.json                # TypeScript config
├── 📄 tailwind.config.ts           # Tailwind config
├── 📄 middleware.ts                # Next.js middleware
└── 📄 README.md                    # Documentation
```

---

## 🧪 การทดสอบ

### 🔧 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Development** | `npm run dev` | เริ่ม development server |
| **Build** | `npm run build` | Build production |
| **Start** | `npm run start` | เริ่ม production server |
| **Lint** | `npm run lint` | ตรวจสอบ code style |
| **Database** | `npm run db:check` | ตรวจสอบ database connection |
| **Reset DB** | `npm run db:fresh` | รีเซ็ต database ใหม่ |
| **List Users** | `npm run db:list-users` | แสดงรายการผู้ใช้ |

### ✅ Manual Testing Checklist

#### Authentication Testing
- [ ] Login ด้วย admin credentials
- [ ] Login ด้วย user credentials
- [ ] Login ด้วย credentials ผิด (ต้อง error)
- [ ] Logout และตรวจสอบ redirect
- [ ] Refresh หน้าหลัง login (ต้องยังคง login อยู่)
- [ ] เข้า `/dashboard` โดยไม่ login (ต้อง redirect ไป login)

#### User Management Testing
- [ ] แสดงรายการผู้ใช้ทั้งหมด (Admin)
- [ ] เพิ่มผู้ใช้ใหม่ผ่าน modal
- [ ] แก้ไขข้อมูลผู้ใช้
- [ ] ลบผู้ใช้คนอื่น
- [ ] พยายามลบตัวเอง (ต้องถูกป้องกัน)

#### Dashboard Testing
- [ ] Dashboard หลักแสดงสถิติถูกต้อง
- [ ] เมนู Sidebar ทำงานปกติ
- [ ] หน้า Energy แสดงข้อมูล
- [ ] หน้า Devices แสดงรายการอุปกรณ์
- [ ] Responsive design บนมือถือ

### 🐛 Debug Mode
```bash
# เปิด debug logs
DEBUG=* npm run dev

# ตรวจสอบใน Browser DevTools:
# - Console: Error messages
# - Network: API requests
# - Application: Cookies & LocalStorage
```

---

## 🚀 การ Deploy

### 🌐 Vercel Deployment (แนะนำ)

#### 1. Prepare for Production
```bash
# Build production
npm run build

# Test production build
npm run start
```

#### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
```

#### 3. Database Setup
- สร้าง PostgreSQL database บน cloud (เช่น Neon, Supabase)
- อัปเดต `DATABASE_URL` ใน Vercel environment
- รัน migration scripts

### 🐳 Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. Build และ Run
```bash
# Build image
docker build -t iot-energy-app .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your_db_url" \
  -e JWT_SECRET="your_secret" \
  iot-energy-app
```

### 🔧 Environment Variables for Production

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db_prod"

# Security
JWT_SECRET="your-production-secret-minimum-32-characters"
NEXTAUTH_SECRET="your-nextauth-production-secret"
NEXTAUTH_URL="https://yourdomain.com"

# App
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
```

---

## 📞 การสนับสนุน

### 📚 เอกสารเพิ่มเติม
- 📖 **API Documentation** - รายละเอียด API ทั้งหมด
- 🔐 **Authentication Guide** - คู่มือระบบ Authentication
- 🗄️ **Database Schema** - โครงสร้างฐานข้อมูล
- 🎨 **UI Components** - คู่มือการใช้งาน Components

### 🛠️ การแก้ปัญหา

#### ปัญหาที่พบบ่อย
1. **Database Connection Error**
   ```bash
   # ตรวจสอบ connection
   npm run db:check
   
   # ตรวจสอบ .env file
   cat .env
   ```

2. **Authentication ไม่ทำงาน**
   ```bash
   # ล้าง cookies และ localStorage
   # ตรวจสอบ JWT_SECRET ใน .env
   # ดู Console errors ใน browser
   ```

3. **Build Error**
   ```bash
   # ล้าง cache
   rm -rf .next
   npm run build
   ```

### 💡 การพัฒนาต่อ

#### 🎯 Roadmap
- [ ] **Real-time Charts** - กราฟแสดงข้อมูลเรียลไทม์
- [ ] **Mobile App** - แอพมือถือ React Native
- [ ] **IoT Device Integration** - เชื่อมต่อกับอุปกรณ์จริง
- [ ] **Advanced Analytics** - การวิเคราะห์ข้อมูลขั้นสูง
- [ ] **Notification System** - ระบบแจ้งเตือน
- [ ] **Multi-tenant Support** - รองรับหลายองค์กร

#### 🤝 Contributing
1. Fork repository
2. สร้าง feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

---

## 📄 License

โปรเจคนี้พัฒนาเพื่อการศึกษาและใช้งานภายในองค์กร

---

## 🏆 สรุป

### ✨ ความสำเร็จที่ได้รับ
- ✅ **Authentication System** - ระบบยืนยันตัวตนแบบครบถ้วน
- ✅ **User Management** - CRUD ผู้ใช้พร้อม Role-based Access
- ✅ **Modern UI/UX** - Interface ที่ทันสมัยและ Responsive
- ✅ **Database Integration** - PostgreSQL พร้อม Optimization
- ✅ **API Architecture** - RESTful APIs ที่มีมาตรฐาน
- ✅ **Security Implementation** - ความปลอดภัยระดับ Production
- ✅ **TypeScript Integration** - Type Safety ทั้งระบบ

### 📊 สถิติโปรเจค
- **📁 Total Files**: 50+ files
- **💻 Lines of Code**: 4,000+ lines
- **🧩 Components**: 20+ React components
- **🔌 API Endpoints**: 15+ REST APIs
- **🗄️ Database Tables**: 3+ tables with relationships
- **🔐 Security Features**: JWT + bcrypt + RBAC

### 🚀 Production Ready
ระบบพร้อมใช้งานจริงใน Production Environment พร้อมด้วย:
- Scalable Architecture
- Security Best Practices  
- Performance Optimization
- Comprehensive Error Handling
- Responsive Design
- TypeScript Type Safety

---

<div align="center">

**🌟 ขอบคุณที่ใช้งาน IoT Electric Energy Management System!**

*Developed with ❤️ using cutting-edge technologies*

[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by TypeScript](https://img.shields.io/badge/Powered%20by-TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**📧 สำหรับคำถามและการสนับสนุน กรุณาติดต่อทีมพัฒนา**

</div>
