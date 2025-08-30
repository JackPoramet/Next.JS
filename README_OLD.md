# 🌟 IoT Electric Energy Management System

> ระบบจัดการพลังงานไฟฟ้า IoT แบบ Full-Stack ด้วย Next.js 15, TypeScript และ PostgreSQL  
> **สถานะ**: Production Ready ✅ | **อัพเดทล่าสุด**: 29 สิงหาคม 2025

[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-000000?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.11-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![SSE](https://img.shields.io/badge/SSE-Real--time-orange?logo=firefox)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
[![MQTT](https://img.shields.io/badge/MQTT-IoT_Protocol-green?logo=mqtt)](https://mqtt.org/)

## 🆕 อัพเดทล่าสุด (29 สิงหาคม 2025)

### ✅ Production Ready Features

#### 🏗️ Build & Deployment Success
- **Build Status**: ✅ Production build สำเร็จ (29.2s compilation time)
- **Type Safety**: ✅ TypeScript compilation ผ่านทั้งหมด
- **Code Quality**: ⚠️ Minor linting warnings (non-blocking)
- **Bundle Optimization**: ✅ Route-based code splitting พร้อม

#### 🔔 IoT Device Discovery & Notification System 
- **Database-driven Notifications**: แจ้งเตือนอุปกรณ์ใหม่ผ่าน `devices_pending` table
- **Real-time Bell Icon**: กระดิ่งแจ้งเตือนแสดงจำนวนอุปกรณ์ที่รอการอนุมัติ (polling ทุก 10 วินาทีสำหรับ admin)
- **Smart Navigation**: คลิกกระดิ่งนำทางไป Device Approval page อัตโนมัติ
- **Auto Cleanup Service**: ลบอุปกรณ์ที่ไม่อัพเดทมานาน 60 วินาทีอัตโนมัติ (ทำงานทุก 15 วินาที)

#### 📡 Advanced MQTT & Real-time Integration
- **MQTT Broker**: เชื่อมต่อสำเร็จกับ `iot666.ddns.net:1883`
- **15 MQTT Topics**: Subscribe ครอบคลุม 6 คณะ พร้อม datas/prop/data topics
- **Virtual Device Simulator**: Python scripts จำลองอุปกรณ์ IoT ส่งข้อมูลแบบจริง
- **Nested JSON Processing**: แก้ไขการแปลง `device_prop` object จาก MQTT messages
- **SSE Broadcasting**: แจกจ่ายข้อมูล MQTT แบบ real-time ผ่าน Server-Sent Events

#### 🎛️ Complete Admin Dashboard
- **Device Management**: เชื่อมต่อฐานข้อมูลจริง แสดงข้อมูลอุปกรณ์ครบถ้วน
- **Responsible Persons**: จัดการบุคคลรับผิดชอบอุปกรณ์
- **Manufacturer Management**: จัดการข้อมูลผู้ผลิตอุปกรณ์
- **Faculty-based Organization**: จัดกลุ่มอุปกรณ์ตาม 6 คณะ
- **Real-time Status**: Online/Offline detection ตาม 60-second timeout

#### 🗄️ Production Database Schema
- **Device Approval Workflow**: Table `devices_pending` สำหรับอุปกรณ์ใหม่
- **Complete Relationships**: JOIN queries ทำงานถูกต้องกับทุก related tables
- **Auto Migration**: Database migration scripts พร้อมใช้งาน
- **Data Integrity**: Foreign key constraints และ data validation

### 🚀 Performance Metrics (Production Build)

| Metric | Value | Status |
|--------|--------|---------|
| **Build Time** | 29.2s | ✅ Optimized |
| **Total Routes** | 39 routes | ✅ Complete |
| **Static Pages** | 11 pages | ✅ Pre-rendered |
| **Bundle Size** | ~105KB average | ✅ Optimized |
| **MQTT Topics** | 15 active topics | ✅ Full coverage |
| **Database Tables** | 10+ tables | ✅ Normalized |

### 📊 System Architecture (Updated 2025)

```mermaid
graph TB
    subgraph "🐍 IoT Device Layer"
        VD[Virtual Device Simulator<br/>Python MQTT Scripts]
        RD[Real IoT Devices<br/>ESP32, Arduino, etc.]
    end
    
    subgraph "📡 Communication Layer"
        BROKER[MQTT Broker<br/>iot666.ddns.net:1883<br/>15 Active Topics]
        SSE[SSE Service<br/>Real-time Broadcasting<br/>Auto-reconnection]
    end
    
    subgraph "🌐 Next.js Application"
        API[API Routes<br/>39 Endpoints]
        MQTT_SRV[MQTT Service<br/>Auto-subscribing]
        CLEAN[Cleanup Service<br/>15s Intervals]
    end
    
    subgraph "� Data Layer"
        PG[(PostgreSQL<br/>Production Ready<br/>Connection Pooling)]
        PENDING[(devices_pending<br/>Auto Discovery)]
        DEVICES[(devices<br/>Registered Devices)]
    end
    
    subgraph "🎨 Frontend Layer"
        DASH[Real-time Dashboard<br/>Faculty-based Filtering]
        ADMIN[Admin Panel<br/>Device Management]
        NOTIF[Notification Bell<br/>10s Polling]
    end
    
    VD --> BROKER
    RD --> BROKER
    BROKER --> MQTT_SRV
    MQTT_SRV --> SSE
    MQTT_SRV --> PENDING
    CLEAN --> PENDING
    SSE --> DASH
    API --> PG
    API --> DEVICES
    PENDING --> NOTIF
    NOTIF --> ADMIN
```

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
- [� การตรวจสอบประสิทธิภาพ](#-การตรวจสอบประสิทธิภาพ-performance-monitoring)
- [�🚀 การ Deploy](#-การ-deploy)
- [📞 การสนับสนุน](#-การสนับสนุน)

---

## 🚀 เกี่ยวกับโปรเจค

**IoT Electric Energy Management System** เป็นระบบจัดการพลังงานไฟฟ้าแบบครบวงจร ที่พัฒนาด้วยเทคโนโลยีที่ทันสมัยที่สุด เพื่อตอบสนองความต้องการในการติดตามและจัดการการใช้พลังงานไฟฟ้าในองค์กรขนาดใหญ่

### 🎯 วัตถุประสงค์
- ✅ **จัดการผู้ใช้** - ระบบ CRUD ผู้ใช้แบบครบถ้วน พร้อม Role-based Access Control
- ✅ **ติดตามอุปกรณ์ IoT** - จัดการและติดตาม Smart Meter และอุปกรณ์วัดพลังงาน
- ✅ **Dashboard แบบ Real-time** - แสดงข้อมูลการใช้พลังงานแบบเรียลไทม์ด้วย SSE (Server-Sent Events)
- ✅ **ระบบรักษาความปลอดภัย** - Authentication และ Authorization ระดับ Enterprise
- ✅ **รองรับ Multi-Faculty** - จัดการข้อมูลแบบแยกตามหน่วยงาน/คณะ (6 คณะ)
- ✅ **SSE Real-time Communication** - Server-Sent Events สำหรับการสื่อสารแบบ Real-time
- ✅ **MQTT Integration** - รองรับการรับส่งข้อมูลจากอุปกรณ์ IoT แบบ Real-time ผ่าน MQTT Protocol
- ✅ **Dual Topic Structure** - แยกข้อมูล properties (`/prop`) และ sensor data (`/datas`) เพื่อการจัดการที่มีประสิทธิภาพ
- ✅ **60-Second Timeout Logic** - ตรวจสอบสถานะอุปกรณ์ Online/Offline ตาม timestamp
- ✅ **🔔 IoT Device Discovery** - ระบบค้นพบอุปกรณ์ใหม่ผ่าน MQTT และแจ้งเตือน admin แบบ real-time
- ✅ **🎛️ Device Approval Workflow** - ระบบอนุมัติอุปกรณ์ใหม่สำหรับ admin พร้อม auto cleanup
- ✅ **🔄 Database-driven Notifications** - ระบบแจ้งเตือนที่ดึงข้อมูลจาก database แทน SSE

### 🏛️ กรณีการใช้งาน
- **มหาวิทยาลัย** - จัดการพลังงานไฟฟ้าของหลายคณะ/อาคาร (Engineering, Institution, Liberal Arts, Business Administration, Architecture, Industrial Education)
- **โรงงานอุตสาหกรรม** - ติดตามการใช้พลังงานของหลายหน่วยผลิต
- **อาคารสำนักงาน** - จัดการพลังงานของหลายชั้น/ฝ่าย
- **Smart City** - ระบบจัดการพลังงานในชุมชน

### 🆕 อัพเดทล่าสุด (สิงหาคม 2025)
- **โครงสร้าง MQTT Topic ใหม่**: `devices/{faculty}/{device}/datas` และ `devices/{faculty}/{device}/prop`
- **SSE Integration**: Server-Sent Events สำหรับ Real-time communication แทน WebSocket
- **ระบบ Status แบบ Simplified**: Online/Offline detection ตาม timestamp (60 วินาที)
- **ข้อมูล Environmental แบบ Simplified**: เหลือเฉพาะ temperature
- **Python MQTT Devices**: อุปกรณ์จำลองสำหรับทดสอบระบบ (3 simulators)
- **Dashboard ปรับปรุงใหม่**: Real-time monitoring และ System Check
- **Icon Enhancement**: ใช้ ⚡ แทน 📱 สำหรับ IoT Devices Management
- **Build Optimization**: แก้ไข TypeScript compilation errors และ ESLint warnings

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
- **Server-Sent Events (SSE)** - การสื่อสารแบบ Real-time ผ่าน HTTP streaming
- **MQTT Integration** - รองรับโปรโตคอล MQTT สำหรับอุปกรณ์ IoT
- **Dual Topic Architecture** - แยก `/datas` และ `/prop` topics สำหรับประสิทธิภาพ
- **Multi-device Support** - รองรับการเชื่อมต่อหลายอุปกรณ์พร้อมกัน
- **Auto-reconnection** - ระบบเชื่อมต่อใหม่อัตโนมัติเมื่อขาดการเชื่อมต่อ
- **Connection Fallback** - ระบบ Fallback เมื่อเชื่อมต่อผิดพลาด
- **Heartbeat Monitoring** - ตรวจสอบสถานะการเชื่อมต่อแบบ Real-time
- **Cross-origin Support** - รองรับการเข้าถึงจากอุปกรณ์ต่างเครือข่าย
- **Rate Limiting** - จำกัดการเชื่อมต่อต่อ IP เพื่อป้องกัน DoS
- **60-Second Timeout** - ตรวจสอบสถานะ Online/Offline ตาม timestamp

### 📊 Dashboard และการแสดงผล
- **Real-time IoT Dashboard** - แสดงข้อมูลอุปกรณ์แบบเรียลไทม์ผ่าน SSE
- **Faculty-based Filtering** - กรองข้อมูลตามคณะ/หน่วยงาน
- **Multi-section Dashboard** - แบ่งส่วนแสดงผลตาม Role
- **Responsive Design** - รองรับทุกขนาดหน้าจอ (Mobile-First)
- **Interactive Navigation** - เมนูแบบ Slide Navigation
- **Statistics Cards** - แสดงสถิติแบบ Visual
- **Device Status Monitoring** - ติดตามสถานะอุปกรณ์แบบเรียลไทม์ผ่าน SSE

### 🏭 การจัดการอุปกรณ์ IoT
- **Device Registration** - ลงทะเบียนอุปกรณ์ Smart Meter
- **🔔 Device Discovery & Notifications** - ค้นพบอุปกรณ์ใหม่ผ่าน MQTT และแจ้งเตือน admin แบบ real-time
- **🎛️ Admin Device Approval** - หน้าจัดการอนุมัติอุปกรณ์ใหม่สำหรับ admin เท่านั้น
- **⚡ Auto Cleanup Service** - ลบอุปกรณ์ที่ไม่มีการอัพเดทมานาน 60 วินาทีอัตโนมัติ (ทำงานทุก 30 วินาที)
- **Faculty-based Organization** - จัดกลุ่มอุปกรณ์ตาม 6 คณะ (Engineering, Institution, Liberal Arts, Business Administration, Architecture, Industrial Education)
- **Dual Topic Structure** - แยกข้อมูล Properties (`/prop`) และ Sensor Data (`/datas`)
- **Real-time Status Monitoring** - ติดตามสถานะ Online/Offline ตาม timestamp (60 วินาที)
- **Energy Data Display** - แสดงข้อมูล Voltage, Current, Power, Energy, Frequency, Power Factor
- **Temperature Monitoring** - ติดตามอุณหภูมิอุปกรณ์ (environmental data simplified)
- **Location Tracking** - จัดเก็บตำแหน่งติดตั้งอุปกรณ์ใน Properties topic
- **Python Device Simulators** - อุปกรณ์จำลองสำหรับทดสอบระบบ (3 simulators + virtual device)
- **⚡ Visual Enhancement** - ใช้ไอคอนฟ้าผ่า (⚡) สำหรับ IoT Devices Management
- **🔄 Database-driven Workflow** - ข้อมูลอุปกรณ์ใหม่บันทึกลง `devices_pending` table ผ่าน MQTT

### 🔧 System Management
- **SSE Service Control** - ควบคุมและเริ่มต้น Server-Sent Events Service
- **MQTT Broker Integration** - เชื่อมต่อและจัดการ MQTT Broker (`iot666.ddns.net:1883`)
- **Service Health Check** - ตรวจสอบสถานะระบบ Database, MQTT, SSE, API
- **Error Handling** - จัดการข้อผิดพลาดอย่างเหมาะสม
- **Connection Statistics** - สถิติการเชื่อมต่อ SSE และการใช้งาน
- **Debug Tools** - เครื่องมือ Debug สำหรับพัฒนา
- **Topic Filtering** - กรองข้อมูล MQTT ตาม Faculty และ Device type
- **Real-time Broadcasting** - แจกจ่ายข้อมูลแบบ Real-time ผ่าน SSE

---

### 🛠️ เทคโนโลยีที่ใช้

#### 🖥️ Frontend
```json
{
  "framework": "Next.js 15.5.0",
  "ui_library": "React 19.1.0", 
  "language": "TypeScript 5.8.3",
  "styling": "Tailwind CSS 4.1.11",
  "state_management": "Zustand 5.0.6",
  "features": ["App Router", "Turbopack", "Server Components", "SSR", "Static Generation"]
}
```

#### ⚙️ Backend
```json
{
  "runtime": "Node.js 18+",
  "api": "Next.js API Routes (39 endpoints)",
  "database": "PostgreSQL 16+",
  "orm": "Raw SQL with pg 8.16.3",
  "authentication": "JWT + bcrypt",
  "realtime": ["Server-Sent Events (SSE)", "MQTT 5.13.3"],
  "mqtt_broker": "iot666.ddns.net:1883"
}
```

#### 📡 Real-time Technologies
```json
{
  "sse": "Server-Sent Events HTTP Streaming",
  "mqtt": "mqtt.js v5.13.3",
  "broker": "iot666.ddns.net:1883",
  "protocols": ["SSE", "MQTT", "HTTP"],
  "topics": 15,
  "faculty_support": 6,
  "features": ["Auto-reconnection", "Rate Limiting", "Multi-client Support", "Cross-origin", "60s Timeout"]
}
```

#### 🛠️ Development Tools
```json
{
  "typescript": "5.8.3",
  "linting": "ESLint 9.32.0",
  "bundler": "Turbopack (Next.js 15)",
  "package_manager": "npm",
  "environment": "dotenv 17.2.1",
  "testing": "Manual + Postman Collection"
}
```

#### 🔧 Infrastructure
```json
{
  "hosting": "Vercel Ready / Self-hosted",
  "database": "PostgreSQL Cloud / Local",
  "sse_endpoint": "/api/sse (HTTP Streaming)",
  "mqtt_broker": "iot666.ddns.net:1883 (15 topics)",
  "cdn": "Next.js Built-in",
  "build_size": "~105KB average per route"
}
```

---

## 🏗️ สถาปัตยกรรมระบบ

### 🏢 MQTT Topic Architecture (Updated 2025)

```mermaid
graph LR
    %% Python Devices
    PY1[🐍 digital_device_1.py<br/>Engineering Lab] 
    PY2[🐍 digital_device_2.py<br/>Institution Library]
    PY3[🐍 analog_device_1.py<br/>Architecture Studio]
    
    %% MQTT Topics
    PY1 -->|Publish| T1[📡 devices/engineering/lab_sensor_01/datas]
    PY1 -->|Publish| T2[📡 devices/engineering/lab_sensor_01/prop]
    PY2 -->|Publish| T3[📡 devices/institution/library_meter/datas]
    PY2 -->|Publish| T4[📡 devices/institution/library_meter/prop]
    PY3 -->|Publish| T5[📡 devices/architecture/studio_sensor/datas]
    PY3 -->|Publish| T6[📡 devices/architecture/studio_sensor/prop]
    
    %% Next.js Subscription
    T1 -->|Subscribe| MQTT[🔔 Next.js MQTT Service]
    T2 -->|Subscribe| MQTT
    T3 -->|Subscribe| MQTT
    T4 -->|Subscribe| MQTT
    T5 -->|Subscribe| MQTT
    T6 -->|Subscribe| MQTT
    
    %% SSE Broadcasting
    MQTT -->|Broadcast| SSE[⚡ SSE Service]
    SSE -->|Stream| DASH1[📊 Real-time Dashboard]
    SSE -->|Stream| DASH2[🔧 System Check Dashboard]
    
    classDef python fill:#3776ab,stroke:#2d5aa0,stroke-width:2px,color:#fff
    classDef topic fill:#ff6b35,stroke:#e55a2b,stroke-width:2px,color:#fff
    classDef nextjs fill:#000000,stroke:#000000,stroke-width:2px,color:#fff
    classDef sse fill:#00d4aa,stroke:#00bfa0,stroke-width:2px,color:#fff
    classDef dashboard fill:#667eea,stroke:#5a6fd8,stroke-width:2px,color:#fff
    
    class PY1,PY2,PY3 python
    class T1,T2,T3,T4,T5,T6 topic
    class MQTT nextjs
    class SSE sse
    class DASH1,DASH2 dashboard
```

### 📊 Faculty Data Organization

| Faculty | Topic Pattern | Example Device | Status Logic |
|---------|--------------|----------------|--------------|
| 🏗️ Engineering | `devices/engineering/{device}/datas` | lab_sensor_01 | Online if data < 60s |
| 🏛️ Institution | `devices/institution/{device}/datas` | library_meter | Online if data < 60s |
| 🎨 Liberal Arts | `devices/liberal_arts/{device}/datas` | classroom_a101 | Online if data < 60s |
| 💼 Business Admin | `devices/business_administration/{device}/datas` | office_b205 | Online if data < 60s |
| 🏛️ Architecture | `devices/architecture/{device}/datas` | studio_c301 | Online if data < 60s |
| ⚙️ Industrial Education | `devices/industrial_education/{device}/datas` | workshop_d101 | Online if data < 60s |

### 🔄 Real-time System Architecture

```mermaid
graph TB
    %% IoT Device Layer
    IoT[🏭 Python MQTT Devices<br/>Smart Meters & Sensors] --> MQTT[📡 MQTT Broker<br/>iot666.ddns.net:1883<br/>Dual Topics: /datas & /prop]
    
    %% Data Processing Layer  
    MQTT --> SSE_SERVICE[⚡ SSE Service<br/>Server-Sent Events<br/>Real-time Stream<br/>60s Timeout Logic]
    SSE_SERVICE --> FRONTEND[🌐 Next.js Frontend<br/>React 19 + TypeScript<br/>Port 3000]
    
    %% Client Layer
    FRONTEND --> BROWSER[💻 Desktop Browser<br/>Chrome, Firefox, Safari]
    FRONTEND --> TABLET[📱 Tablet Devices<br/>iPad, Android Tablets]
    FRONTEND --> MOBILE[📱 Mobile Devices<br/>iOS, Android]
    
    %% API Layer
    BROWSER --> API[🔗 API Routes<br/>RESTful APIs<br/>/api/*]
    TABLET --> API
    MOBILE --> API
    
    %% Authentication & Security Layer
    API --> AUTH[🔐 Authentication Middleware<br/>JWT + Role-based Access<br/>bcrypt Password Hashing]
    
    %% Database Layer
    AUTH --> DB[(🗄️ PostgreSQL Database<br/>Users, Devices, Energy Data<br/>Connection Pooling)]
    
    %% Application Modules
    API --> USERS[👥 User Dashboard<br/>Role-based Interface<br/>Admin/Manager/User]
    API --> ADMIN[⚙️ Admin Panel<br/>System Management<br/>User & Device Control] 
    API --> DEVICES[🏭 Device Monitor<br/>Real-time Status<br/>Energy Analytics<br/>Faculty-based View]
    API --> ENERGY[⚡ Energy Analytics<br/>Live Data Visualization<br/>Temperature Monitoring<br/>Online/Offline Detection]
    
    %% Real-time Data Flow
    SSE_SERVICE -.->|📊 Live Updates| USERS
    SSE_SERVICE -.->|🔄 Status Stream| DEVICES
    SSE_SERVICE -.->|⚡ Energy Data| ENERGY
    SSE_SERVICE -.->|📈 Real-time Stats| ADMIN
    
    %% System Health Monitoring
    API --> HEALTH[🏥 System Health<br/>Connection Monitoring<br/>Performance Metrics<br/>MQTT Status Check]
    
    %% Rate Limiting & Security
    SSE_SERVICE --> RATE[🛡️ Rate Limiting<br/>Connection Limits<br/>Per IP Protection]
    
    %% Styling for better visualization
    classDef iotDevice fill:#e1f5fe,stroke:#01579b,stroke-width:3px,color:#000
    classDef network fill:#f3e5f5,stroke:#4a148c,stroke-width:3px,color:#000
    classDef frontend fill:#e8f5e8,stroke:#1b5e20,stroke-width:3px,color:#000
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:3px,color:#000
    classDef database fill:#ffebee,stroke:#b71c1c,stroke-width:3px,color:#000
    classDef realtime fill:#f1f8e9,stroke:#33691e,stroke-width:3px,color:#000
    classDef security fill:#fce4ec,stroke:#880e4f,stroke-width:3px,color:#000
    
    class IoT iotDevice
    class MQTT,SSE_SERVICE network
    class FRONTEND,BROWSER,TABLET,MOBILE frontend
    class API,USERS,ADMIN,DEVICES,ENERGY,HEALTH api
    class DB database
    class RATE,AUTH security
```

### 🔄 Data Flow Architecture

```mermaid
sequenceDiagram
    participant IoT as 🏭 IoT Device
    participant MQTT as 📡 MQTT Broker
    participant SSE as ⚡ SSE Service
    participant API as 🔗 API Routes
    participant DB as 🗄️ PostgreSQL
    participant Client as 💻 Client Browser
    
    Note over IoT,Client: Real-time Energy Data Flow
    
    %% IoT Data Publishing
    IoT->>MQTT: 📊 Publish Energy Data<br/>(Voltage, Current, Power)
    Note right of MQTT: Topics:<br/>devices/engineering/*<br/>devices/institution/*<br/>devices/liberal_arts/*
    
    %% Real-time Processing
    MQTT->>SSE: 📥 Subscribe to Topics<br/>Process & Format Data
    SSE->>SSE: 🔄 Rate Limiting<br/>Connection Management
    SSE->>Client: 📡 Server-Sent Events<br/>JSON Data Stream
    Client->>Client: 🎨 Update UI Real-time<br/>Charts & Statistics
    
    Note over API,DB: Standard API Flow
    
    %% Authentication Flow
    Client->>API: 🔐 Login Request<br/>Email + Password
    API->>DB: 🔍 Verify Credentials<br/>bcrypt Hash Check
    DB->>API: ✅ User Data + Role
    API->>Client: 🎫 JWT Token<br/>HttpOnly Cookie
    
    %% Data Retrieval
    Client->>API: 📊 Request Dashboard Data<br/>Bearer Token
    API->>AUTH: 🛡️ Validate JWT<br/>Check Permissions
    AUTH->>DB: 📋 Query User Data<br/>Role-based Access
    DB->>API: 📊 Return Filtered Data
    API->>Client: 📱 JSON Response<br/>Dashboard Content
```

### 🌐 Real-time Communication Architecture

```mermaid
graph LR
    %% MQTT Topic Sources
    subgraph "🏛️ MQTT Topics by Faculty"
        ENG[🔧 Engineering<br/>devices/engineering/*]
        INST[🏛️ Institution<br/>devices/institution/*]
        LA[📚 Liberal Arts<br/>devices/liberal_arts/*]
        BA[💼 Business Admin<br/>devices/business/*]
        ARCH[🏗️ Architecture<br/>devices/architecture/*]
        IE[⚙️ Industrial Ed<br/>devices/industrial/*]
    end
    
    %% Central MQTT Broker
    ENG --> BROKER[📡 MQTT Broker<br/>iot666.ddns.net:1883<br/>Message Queue]
    INST --> BROKER
    LA --> BROKER
    BA --> BROKER
    ARCH --> BROKER
    IE --> BROKER
    
    %% SSE Processing Layer
    BROKER --> SSE[⚡ SSE Service<br/>Message Processing<br/>JSON Formatting<br/>Rate Limiting]
    
    %% Multiple SSE Connections
    SSE --> CONN1[📡 SSE Connection 1<br/>Admin Dashboard]
    SSE --> CONN2[📡 SSE Connection 2<br/>Manager Dashboard]
    SSE --> CONN3[📡 SSE Connection 3<br/>User Dashboard]
    SSE --> CONN4[📡 SSE Connection N<br/>Mobile/Tablet]
    
    %% Client Applications
    CONN1 --> DASH1[👨‍💼 Admin Panel<br/>System Overview<br/>All Faculties]
    CONN2 --> DASH2[👩‍💼 Manager Dashboard<br/>Department Focus<br/>Device Control]
    CONN3 --> DASH3[👤 User Dashboard<br/>Basic Monitoring<br/>Read-only View]
    CONN4 --> DASH4[📱 Mobile Interface<br/>Responsive Design<br/>Touch Optimized]
    
    %% Connection Management
    SSE --> RATE[🛡️ Rate Limiting<br/>Max Connections per IP<br/>Reconnection Logic]
    SSE --> HEALTH[🏥 Health Check<br/>Connection Status<br/>Heartbeat Monitor]
    
    %% Styling
    classDef mqtt fill:#e3f2fd,stroke:#0277bd,stroke-width:2px,color:#000
    classDef sse fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#000
    classDef client fill:#fce4ec,stroke:#ad1457,stroke-width:2px,color:#000
    classDef management fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    
    class ENG,INST,LA,BA,ARCH,IE,BROKER mqtt
    class SSE,CONN1,CONN2,CONN3,CONN4 sse
    class DASH1,DASH2,DASH3,DASH4 client
    class RATE,HEALTH management
```

### 🏢 System Component Architecture

```mermaid
graph TD
    subgraph "🖥️ Frontend Layer"
        UI[🎨 React Components<br/>Tailwind CSS<br/>Responsive Design]
        STATE[📊 State Management<br/>Zustand Store<br/>Authentication State]
        HOOKS[🪝 Custom Hooks<br/>useSSE, useUsers<br/>useDevices, useAuth]
    end
    
    subgraph "🔗 API Layer"
        AUTH_API[🔐 Authentication APIs<br/>Login, Logout, Register<br/>JWT Token Management]
        USER_API[👥 User Management<br/>CRUD Operations<br/>Role-based Access]
        DEVICE_API[🏭 Device Management<br/>IoT Device Control<br/>Status Monitoring]
        ADMIN_API[⚙️ Admin APIs<br/>System Statistics<br/>Health Monitoring]
    end
    
    subgraph "🛡️ Security Layer"
        JWT[🎫 JWT Middleware<br/>Token Validation<br/>Role Verification]
        BCRYPT[🔒 Password Security<br/>bcrypt Hashing<br/>Salt Rounds: 12]
        CORS[🌐 CORS Protection<br/>Cross-origin Policy<br/>Allowed Origins]
    end
    
    subgraph "🗄️ Data Layer"
        PG[🐘 PostgreSQL<br/>Connection Pooling<br/>ACID Transactions]
        USERS_TBL[(👥 Users Table<br/>Authentication Data<br/>Role Management)]
        DEVICES_TBL[(🏭 Devices Table<br/>IoT Device Registry<br/>Status & Location)]
        ENERGY_TBL[(⚡ Energy Data<br/>Real-time Readings<br/>Historical Records)]
    end
    
    subgraph "📡 Real-time Layer"
        SSE_SERVER[⚡ SSE Server<br/>Event Streaming<br/>Connection Pool]
        MQTT_CLIENT[📡 MQTT Client<br/>Topic Subscription<br/>Message Processing]
        RATE_LIMITER[🛡️ Rate Limiter<br/>Connection Limits<br/>DDoS Protection]
    end
    
    %% Connections
    UI --> STATE
    STATE --> HOOKS
    HOOKS --> AUTH_API
    HOOKS --> USER_API
    HOOKS --> DEVICE_API
    
    AUTH_API --> JWT
    USER_API --> JWT
    DEVICE_API --> JWT
    ADMIN_API --> JWT
    
    JWT --> BCRYPT
    JWT --> CORS
    
    JWT --> PG
    PG --> USERS_TBL
    PG --> DEVICES_TBL
    PG --> ENERGY_TBL
    
    HOOKS --> SSE_SERVER
    SSE_SERVER --> MQTT_CLIENT
    SSE_SERVER --> RATE_LIMITER
    
    %% Styling
    classDef frontend fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef security fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef database fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    classDef realtime fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    
    class UI,STATE,HOOKS frontend
    class AUTH_API,USER_API,DEVICE_API,ADMIN_API api
    class JWT,BCRYPT,CORS security
    class PG,USERS_TBL,DEVICES_TBL,ENERGY_TBL database
    class SSE_SERVER,MQTT_CLIENT,RATE_LIMITER realtime
```

### 📁 Architecture Patterns
- **MVC Pattern** - Model-View-Controller สำหรับ API
- **Component-based Architecture** - React Components แบบ Modular
- **State Management** - Zustand สำหรับ Global State
- **Database Layer** - Raw SQL Queries พร้อม Connection Pooling
- **Authentication Flow** - JWT Token + Cookie Session
- **Real-time Architecture** - SSE + MQTT Integration
- **Event-driven Pattern** - Server-Sent Events สำหรับ Real-time Communication

### 🗄️ Database Schema Updates

#### 📊 New Tables Added
```sql
-- Device Pending Table (IoT Device Discovery)
CREATE TABLE devices_pending (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) NOT NULL UNIQUE,
  device_name VARCHAR(255),
  device_type VARCHAR(100),
  ip_address INET,
  mac_address VARCHAR(17),
  firmware_version VARCHAR(50),
  connection_type VARCHAR(50),
  approval_status_id INTEGER DEFAULT 1,
  mqtt_data JSONB,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  discovery_source VARCHAR(50) DEFAULT 'mqtt'
);

-- Auto cleanup trigger (removes devices inactive > 60 seconds)
-- Runs every 30 seconds via cleanup-service.ts
```

#### 🔧 Database Workflow
```
MQTT Device Discovery → devices_pending → Admin Notification → Device Approval
                           ↓
                    Auto Cleanup (60s timeout)
```

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

# SSE & Real-time Configuration
NEXT_PUBLIC_SSE_URL="http://localhost:3000/api/sse"
SSE_MAX_CONNECTIONS_PER_IP="10"
SSE_HEARTBEAT_INTERVAL="30000"

# MQTT Configuration 
MQTT_BROKER_URL="mqtt://iot666.ddns.net:1883"
MQTT_USERNAME="your-mqtt-username"
MQTT_PASSWORD="your-mqtt-password"
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
# Start Next.js และ SSE Service
npm run dev
```

🎉 **เปิดเบราว์เซอร์** ไปที่ `http://localhost:3000`

### 🔔 Testing IoT Device Discovery (New 2025 Feature)

#### 1. Run Virtual Device Simulator
```bash
# เข้าไปในโฟลเดอร์ Virtual Device
cd virtual_device

# ติดตั้ง Python dependencies
pip install -r requirements.txt

# รัน Virtual Device Simulator (แนะนำ)
python virtual_device_with_config_file.py

# หรือรัน Virtual Device แบบพื้นฐาน
python virtual_device.py
```

#### 2. Monitor Admin Notifications
- Login เป็น admin (`admin@iot-energy.com` / `Admin123!`)
- ดูกระดิ่งแจ้งเตือนด้านบนขวา (จะแสดงจำนวนอุปกรณ์ใหม่)
- คลิกกระดิ่งจะนำไปหน้า Device Approval อัตโนมัติ
- อนุมัติอุปกรณ์และดูการทำงานแบบ real-time

#### 3. Verify MQTT Integration
- ไปที่ `/realtime` เพื่อดูข้อมูล real-time จากอุปกรณ์
- ตรวจสอบ `/dashboard` สำหรับ System Check และ MQTT status
- ดู 15 MQTT topics ที่ active และรับข้อมูลจากอุปกรณ์จริง

### 🔧 Network Configuration

#### สำหรับการใช้งานข้ามอุปกรณ์:
```bash
# ตรวจสอบ IP Address ของเครื่อง
ipconfig  # Windows
ifconfig  # macOS/Linux

# อัปเดต SSE URL ใน .env
NEXT_PUBLIC_SSE_URL="http://YOUR_IP_ADDRESS:3000/api/sse"

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
- ดูข้อมูลอุปกรณ์ IoT แบบเรียลไทม์ผ่าน SSE (Server-Sent Events)
- กรองข้อมูลตามคณะ/หน่วยงาน
- สถานะการเชื่อมต่อ SSE แบบ Real-time
- ข้อมูลการใช้พลังงาน (Voltage, Current, Power, Energy)
- ข้อมูล MQTT Topics จากอุปกรณ์ IoT ต่างๆ

#### 4. User Management (Admin เท่านั้น)
- เพิ่มผู้ใช้ใหม่ผ่าน Modal
- แก้ไขข้อมูลผู้ใช้
- ลบผู้ใช้ (ไม่สามารถลบตัวเองได้)
- ดูสถิติการใช้งาน

#### 5. SSE & System Monitoring
- ตรวจสอบสถานะ Database, MQTT, SSE, API
- ดูจำนวน SSE connections ที่ active
- ติดตาม MQTT message throughput
- จัดการการเชื่อมต่อใหม่อัตโนมัติ
- ทดสอบ API endpoints แบบ Interactive

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

### ⚡ SSE (Server-Sent Events) Configuration
```javascript
// SSE Service Configuration
{
  "endpoint": "/api/sse",
  "protocol": "HTTP Streaming",
  "format": "text/event-stream",
  "maxConnections": 10,
  "heartbeatInterval": "30s",
  "reconnection": "auto",
  "crossOrigin": true
}
```

### 🔄 SSE Connection Flow
```
Client → HTTP GET /api/sse → EventSource Connection → MQTT Integration → Real-time Data Stream
```

### 📊 Real-time Features
- **Live MQTT Data** - ข้อมูล IoT จาก MQTT Broker แบบเรียลไทม์
- **Device Status** - สถานะอุปกรณ์ Online/Offline ผ่าน SSE
- **Connection Monitoring** - ติดตามจำนวน SSE connections
- **Auto-reconnection** - เชื่อมต่อใหม่อัตโนมัติเมื่อขาดการเชื่อมต่อ
- **Multi-device Support** - รองรับหลายอุปกรณ์พร้อมกัน
- **Cross-platform** - ทำงานได้บน PC, Tablet, Mobile
- **Rate Limiting** - จำกัดการเชื่อมต่อต่อ IP

### 🔧 SSE API Usage
```javascript
// เชื่อมต่อ SSE
const eventSource = new EventSource('/api/sse');

// รับข้อมูลแบบ Real-time
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'data' && data.data.topic) {
    // จัดการข้อมูลจาก MQTT
    console.log('MQTT Topic:', data.data.topic);
    console.log('Data:', data.data.data);
  }
};

// จัดการ errors
eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
  // ระบบจะ reconnect อัตโนมัติ
};
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

// MQTT Broker Configuration
const mqttConfig = {
  broker: 'iot666.ddns.net',
  port: 1883,
  protocol: 'mqtt',
  keepalive: 60,
  clean: true
};
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
| GET | `/api/start-services` | เริ่มต้น SSE และ MQTT Services | ✅ |
| GET | `/api/sse-status` | สถานะ SSE Service | ✅ |
| GET | `/api/mqtt-status` | สถานะ MQTT Broker | ✅ |
| POST | `/api/test-broadcast` | ทดสอบส่งข้อมูล Real-time | ✅ Admin |

### 📊 Admin APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard` | สถิติ Dashboard สำหรับ Admin | ✅ Admin |
| GET | `/api/admin/login-stats` | สถิติการ Login | ✅ Admin |
| GET | `/api/profile` | ดูข้อมูล Profile | ✅ |
| PUT | `/api/profile` | แก้ไข Profile | ✅ |

### 📚 API Documentation

#### 🔗 Swagger UI
- **URL**: `/swagger`
- **Interactive API Testing**: ✅
- **Authentication**: Bearer Token Support
- **Try It Out**: Test APIs directly from browser

```bash
# เข้าถึง Swagger UI
http://localhost:3000/swagger

# Swagger JSON Spec
http://localhost:3000/api/swagger
```

#### 📋 Features
- **OpenAPI 3.0 Specification**
- **Interactive API Testing**
- **Authentication Integration** (JWT Bearer Token)
- **Request/Response Examples**
- **Schema Validation**
- **Try It Out functionality**

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
| **Development** | `npm run dev` | เริ่ม development server + SSE |
| **Build** | `npm run build` | Build production |
| **Start** | `npm run start` | เริ่ม production server |
| **Lint** | `npm run lint` | ตรวจสอบ code style |
| **Database** | `npm run db:check` | ตรวจสอบ database connection |
| **Reset DB** | `npm run db:fresh` | รีเซ็ต database ใหม่ |
| **List Users** | `npm run db:list-users` | แสดงรายการผู้ใช้ |

### 🐍 Python MQTT Device Testing

#### สำหรับทดสอบระบบ MQTT Real-time
```bash
# 1. เริ่ม Python MQTT devices
cd mqtt_test_devices

# Engineering Lab Device
python digital_device_1.py

# Institution Library Device  
python digital_device_2.py

# Architecture Studio Device
python analog_device_1.py
```

#### Topic ที่ถูกส่งโดยอุปกรณ์:
```bash
# Engineering
devices/engineering/lab_sensor_01/datas
devices/engineering/lab_sensor_01/prop

# Institution
devices/institution/library_meter/datas
devices/institution/library_meter/prop

# Architecture
devices/architecture/studio_sensor/datas
devices/architecture/studio_sensor/prop
```

### ✅ Manual Testing Checklist

#### Authentication Testing
- [ ] Login ด้วย admin credentials
- [ ] Login ด้วย user credentials
- [ ] Login ด้วย credentials ผิด (ต้อง error)
- [ ] Logout และตรวจสอบ redirect
- [ ] Refresh หน้าหลัง login (ต้องยังคง login อยู่)
- [ ] เข้า `/dashboard` โดยไม่ login (ต้อง redirect ไป login)

#### Real-time MQTT & SSE Testing
- [ ] เริ่ม Python MQTT devices
- [ ] เข้า `/realtime` และดู SSE status (ต้องแสดง "Connected")
- [ ] ตรวจสอบข้อมูลจาก Python devices แสดงใน dashboard
- [ ] ทดสอบ Online/Offline status (หยุด Python device แล้วรอ 60 วินาที)
- [ ] ตรวจสอบ auto-reconnection เมื่อขาดการเชื่อมต่อ SSE
- [ ] ดูข้อมูล Real-time ตาม faculty (Engineering, Institution, Architecture)
- [ ] ตรวจสอบ `/dashboard` สำหรับ System Check
- [ ] ดู MQTT message details และ topic filtering

#### MQTT Topic Structure Testing
- [ ] ตรวจสอบ `/datas` topics แสดงในหน้า Real-time
- [ ] ตรวจสอบ `/prop` topics แสดงในหน้า System Check
- [ ] กรองข้อมูลตามคณะ (Engineering, Institution, Architecture)
- [ ] ตรวจสอบ timestamp และ status logic (online < 60s, offline > 60s)

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

## � การตรวจสอบประสิทธิภาพ (Performance Monitoring)

### 🖥️ การวัดทรัพยากรฝั่ง Client

#### 🌐 Browser DevTools Performance Analysis

```javascript
// เปิด Browser DevTools (F12) และใช้ Performance Tab
// 1. กด Record button
// 2. ทำการใช้งานแอปพลิเคชัน
// 3. หยุด Recording และวิเคราะห์ผล

// ตัวอย่างการวัด Performance ใน Console
console.time('Page Load');
window.addEventListener('load', () => {
  console.timeEnd('Page Load');
  
  // วัด Memory Usage
  if (performance.memory) {
    console.log('Memory Usage:', {
      used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
});
```

#### 📱 Real-time Performance Monitor

```mermaid
graph LR
    subgraph "Client Performance Metrics"
        CPU[🔥 CPU Usage]
        MEM[💾 Memory Usage] 
        NET[🌐 Network]
        RENDER[🎨 Rendering]
        SSE[📡 SSE Performance]
    end
    
    subgraph "Monitoring Tools"
        DEVTOOLS[Browser DevTools]
        LIGHTHOUSE[Lighthouse]
        CUSTOM[Custom Metrics]
        PROFILER[React Profiler]
    end
    
    subgraph "Key Metrics"
        FCP[First Contentful Paint]
        LCP[Largest Contentful Paint]
        CLS[Cumulative Layout Shift]
        FID[First Input Delay]
        TTFB[Time to First Byte]
    end
    
    CPU --> DEVTOOLS
    MEM --> DEVTOOLS
    NET --> DEVTOOLS
    RENDER --> LIGHTHOUSE
    SSE --> CUSTOM
    
    DEVTOOLS --> FCP
    LIGHTHOUSE --> LCP
    CUSTOM --> CLS
    PROFILER --> FID
```

#### 🛠️ การติดตั้ง Performance Monitor

1. **เพิ่ม Performance Component**
```typescript
// src/components/ui/PerformanceMonitor.tsx
'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  memoryUsage: {
    used: string;
    total: string;
    limit: string;
  } | null;
  loadTime: number;
  renderTime: number;
  sseConnections: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: null,
    loadTime: 0,
    renderTime: 0,
    sseConnections: 0
  });

  useEffect(() => {
    // Monitor Memory Usage
    const updateMetrics = () => {
      if (performance.memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: {
            used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
            total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
            limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
          }
        }));
      }
    };

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial call

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <h4 className="font-bold mb-2">🔧 Performance Monitor</h4>
      {metrics.memoryUsage && (
        <div className="space-y-1">
          <div>Memory Used: {metrics.memoryUsage.used}</div>
          <div>Memory Total: {metrics.memoryUsage.total}</div>
          <div>Memory Limit: {metrics.memoryUsage.limit}</div>
        </div>
      )}
    </div>
  );
}
```

2. **เพิ่มใน Layout**
```typescript
// src/app/layout.tsx
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
      </body>
    </html>
  );
}
```

#### 📈 เครื่องมือวัดประสิทธิภาพ

| เครื่องมือ | วิธีการใช้ | สิ่งที่วัดได้ |
|-----------|-----------|-------------|
| **Browser DevTools** | F12 → Performance Tab | CPU, Memory, Network, Rendering |
| **Lighthouse** | F12 → Lighthouse Tab | Performance Score, Core Web Vitals |
| **React DevTools Profiler** | Extension → Profiler Tab | Component Render Time |
| **Web Vitals Extension** | Chrome Extension | Real-time Core Web Vitals |
| **Task Manager** | Shift+Esc ใน Chrome | Memory & CPU per Tab |

#### 🎯 Performance Benchmarks

```bash
# ติดตั้ง Web Vitals
npm install web-vitals

# ติดตั้ง Lighthouse CI
npm install -g @lhci/cli

# รัน Lighthouse Analysis
lhci autorun

# ทดสอบ Bundle Size
npm install -g bundlephobia
bundlephobia analyze package.json
```

#### 📊 การวิเคราะห์ Performance

```javascript
// การวัด Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// ส่งข้อมูลไปยัง Analytics
function sendToAnalytics(metric) {
  console.log('Performance Metric:', metric);
  
  // ส่งไปยัง Google Analytics หรือ Custom Analytics
  // gtag('event', metric.name, {
  //   value: Math.round(metric.value),
  //   metric_id: metric.id,
  // });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

#### 🚨 Performance Alerts

| Metric | Good | Needs Improvement | Poor |
|--------|------|------------------|------|
| **First Contentful Paint (FCP)** | < 1.8s | 1.8s - 3.0s | > 3.0s |
| **Largest Contentful Paint (LCP)** | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **First Input Delay (FID)** | < 100ms | 100ms - 300ms | > 300ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **Time to First Byte (TTFB)** | < 600ms | 600ms - 1.5s | > 1.5s |

#### 🔧 การ Optimize Performance

```mermaid
graph TD
    subgraph "Frontend Optimization"
        A[Code Splitting] --> A1[Dynamic Imports]
        A --> A2[Lazy Loading]
        
        B[Bundle Optimization] --> B1[Tree Shaking]
        B --> B2[Minimize Bundle Size]
        
        C[Asset Optimization] --> C1[Image Optimization]
        C --> C2[Font Loading]
        
        D[Caching Strategy] --> D1[Service Worker]
        D --> D2[Browser Cache]
    end
    
    subgraph "Real-time Optimization"
        E[SSE Optimization] --> E1[Connection Pooling]
        E --> E2[Message Filtering]
        
        F[State Management] --> F1[Minimize Re-renders]
        F --> F2[Memoization]
    end
    
    subgraph "Monitoring & Alerts"
        G[Performance Budget] --> G1[Bundle Size Limits]
        G --> G2[Runtime Metrics]
        
        H[Continuous Monitoring] --> H1[Lighthouse CI]
        H --> H2[Real User Monitoring]
    end
```

#### 💡 Performance Tips

**Client-side Optimization:**
```typescript
// 1. ใช้ React.memo เพื่อป้องกัน unnecessary re-renders
const MemoizedComponent = React.memo(function Component() {
  return <div>Heavy Component</div>;
});

// 2. ใช้ useMemo สำหรับ expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// 3. ใช้ useCallback สำหรับ event handlers
const handleClick = useCallback(() => {
  doSomething();
}, []);

// 4. Lazy load components
const LazyComponent = lazy(() => import('./HeavyComponent'));

// 5. Optimize SSE connections
const useOptimizedSSE = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const eventSource = new EventSource('/api/sse');
    
    // Add message filtering
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      
      // Only update if data actually changed
      setData(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          return newData;
        }
        return prevData;
      });
    };
    
    return () => eventSource.close();
  }, []);
  
  return data;
};
```

#### 🔍 Performance Debugging

```bash
# 1. วิเคราะห์ Bundle Size
npm run build
npx bundle-analyzer

# 2. ตรวจสอบ Memory Leaks
# เปิด DevTools → Performance → Memory tab
# Record memory usage ระหว่างการใช้งาน

# 3. Network Performance
# DevTools → Network tab
# ดู Request/Response times
# ตรวจสอบ SSE connection stability

# 4. CPU Profiling
# DevTools → Performance tab
# Record CPU usage ขณะใช้งาน Real-time features
```

#### 📱 Mobile Performance Testing

```javascript
// เลียนแบบ Mobile Network
// DevTools → Network → Throttling → Slow 3G

// ทดสอบบน Device จริง
// Chrome DevTools → Remote Debugging
// หรือใช้ BrowserStack/Sauce Labs

// Performance บน Mobile
if (navigator.userAgent.includes('Mobile')) {
  // ลด frequency ของ SSE updates
  // ลดจำนวน components ที่ render
  // ใช้ Virtual Scrolling สำหรับ large lists
}
```

---

## �🚀 การ Deploy

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
