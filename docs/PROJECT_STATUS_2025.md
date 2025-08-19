# 📊 IoT Electric Energy Management System - Project Status (August 2025)

## 🎯 Current Project Status

### ✅ Completed Features

#### 🔐 Authentication System
- **JWT-based Authentication** with HttpOnly cookies
- **Role-based Access Control** (Admin/User roles)
- **Protected Routes** with middleware validation
- **Login/Logout** functionality
- **Password Security** with bcrypt hashing

#### 📊 Dashboard System
- **Real-time Dashboard** (`/realtime`) - Faculty-based device monitoring
- **System Check Dashboard** (`/dashboard`) - MQTT debugging and monitoring
- **Responsive Design** with Tailwind CSS
- **Dark/Light Theme** support

#### 📡 MQTT Integration
- **Dual Topic Structure**: 
  - `devices/{faculty}/{device}/datas` - Real-time sensor data
  - `devices/{faculty}/{device}/prop` - Device metadata
- **Faculty Support**: Engineering, Institution, Liberal Arts, Business Admin, Architecture, Industrial Education
- **Auto-reconnection** and error handling
- **Message Broadcasting** via SSE

#### ⚡ Real-time Communication
- **Server-Sent Events (SSE)** for live data streaming
- **Automatic Status Detection** (online/offline based on 60-second timeout)
- **Multi-client Support** with connection management
- **Data Filtering** by topic types

#### 🗄️ Database System
- **PostgreSQL Integration** with connection pooling
- **User Management** CRUD operations
- **Device Registration** support
- **Migration Scripts** for schema updates

#### 🛠️ Development Tools
- **Python MQTT Test Devices** for simulation
- **API Testing** with Postman collections
- **TypeScript** throughout the project
- **ESLint Configuration** for code quality

### 🔧 Technical Architecture

#### Frontend (Next.js 15)
```
src/
├── app/                    # App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # System monitoring
│   ├── realtime/          # Real-time data display
│   └── login/             # Authentication
├── components/            # Reusable components
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Layout components
│   └── ui/                # UI components
├── lib/                   # Core services
│   ├── mqtt-service.ts    # MQTT subscription service
│   ├── sse-service.ts     # Server-Sent Events
│   ├── auth.ts            # Authentication logic
│   └── database.ts        # Database utilities
└── hooks/                 # Custom React hooks
```

#### Backend Services
- **MQTT Broker**: `iot666.ddns.net:1883`
- **Database**: PostgreSQL with connection pooling
- **SSE Server**: Real-time event streaming
- **Authentication**: JWT with HTTP-only cookies

#### Python MQTT Devices
```
mqtt_test_devices/
├── config.py              # Shared configuration
├── digital_device_1.py    # Smart meter simulation (Engineering)
├── digital_device_2.py    # Power monitor (Institution)
└── analog_device_1.py     # Environmental sensor (Architecture)
```

### 📈 Data Flow Architecture

```mermaid
graph TD
    A[Python MQTT Devices] -->|Publish| B[MQTT Broker]
    B -->|Subscribe| C[Next.js MQTT Service]
    C -->|Forward| D[SSE Service]
    D -->|Broadcast| E[Dashboard Components]
    
    F[Users] -->|HTTP| G[API Routes]
    G -->|Query| H[PostgreSQL Database]
    
    I[Authentication] -->|JWT| J[Protected Routes]
    J -->|Access| E
```

### 🏢 Faculty Structure

| Faculty Code | Description | Example Devices |
|--------------|-------------|-----------------|
| `engineering` | คณะวิศวกรรมศาสตร์ | lab_sensor_01, workshop_meter |
| `institution` | หน่วยงานสถาบัน | library_meter_001, admin_power |
| `liberal_arts` | คณะศิลปศาสตร์ | classroom_a101, office_power |
| `business_administration` | คณะบริหารธุรกิจ | office_b205, conference_meter |
| `architecture` | คณะสถาปัตยกรรมศาสตร์ | studio_c301, workshop_sensor |
| `industrial_education` | คณะครุศาสตร์อุตสาหกรรม | workshop_d101, lab_power |

### 🔍 MQTT Topic Examples

#### Device Properties (Configuration)
```bash
devices/engineering/lab_sensor_01/prop
devices/institution/library_meter_001/prop
devices/architecture/studio_c301/prop
```

#### Sensor Data (Real-time)
```bash
devices/engineering/lab_sensor_01/datas
devices/institution/library_meter_001/datas
devices/architecture/studio_c301/datas
```

### 📊 Data Formats

#### Property Data (Registration)
```json
{
  "device_id": "lab_sensor_01",
  "name": "Engineering Lab Smart Meter",
  "faculty": "engineering",
  "building": "Engineering Building A",
  "floor": "2",
  "room": "Lab 201",
  "device_type": "smart_meter",
  "timestamp": "2025-08-19T10:30:00Z"
}
```

#### Sensor Data (Real-time)
```json
{
  "device_id": "lab_sensor_01",
  "timestamp": "2025-08-19T14:30:00Z",
  "voltage": 235.2,
  "current": 45.8,
  "power": 10760.5,
  "energy": 1248.75,
  "frequency": 50.1,
  "power_factor": 0.92,
  "temperature": 28.5,
  "status": "online"
}
```

### ⚙️ Configuration

#### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/iot_energy_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# MQTT
MQTT_BROKER_URL=mqtt://iot666.ddns.net:1883
MQTT_USERNAME=electric_energy
MQTT_PASSWORD=energy666
```

### 🚀 Deployment Status

#### Development Environment
- ✅ Local PostgreSQL database
- ✅ MQTT broker connection
- ✅ SSE real-time updates
- ✅ Python device simulators

#### Production Readiness
- ✅ Environment variable configuration
- ✅ Error handling and logging
- ✅ Security implementations
- ✅ Database migrations
- ⚠️ Needs production MQTT broker setup
- ⚠️ Needs SSL/TLS certificates

### 🔧 Known Issues & Improvements

#### Resolved Issues
- ✅ Topic structure standardized
- ✅ Environmental data simplified (temperature only)
- ✅ Status logic simplified (online/offline)
- ✅ Dashboard timeout logic implemented

#### Future Enhancements
- 🔄 Add device registration UI
- 🔄 Implement data persistence for historical analysis
- 🔄 Add email notifications for offline devices
- 🔄 Create energy consumption reports
- 🔄 Add device health monitoring
- 🔄 Implement device control commands

### 📞 Support & Documentation

#### Available Documentation
- [MQTT Topics Guide](./MQTT_TOPICS_GUIDE.md)
- [MQTT Data Format](./MQTT_DATA_FORMAT.md)
- [JWT Bearer Guide](./JWT-BEARER-GUIDE.md)
- [Database Commands](./DATABASE-COMMANDS.md)
- [API Testing Guide](./POSTMAN-API-TESTING.md)

#### Development Tools
- **VS Code** with TypeScript support
- **Postman** for API testing
- **MQTT Explorer** for topic monitoring
- **PostgreSQL** client tools

---

**Last Updated**: August 19, 2025  
**Project Version**: 2.0.0  
**Status**: Development Complete, Ready for Production Deployment
