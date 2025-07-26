# JWT Bearer Authorization Guide

คู่มือการใช้งาน JWT Bearer Token สำหรับระบบ Electric Energy IoT

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [การตั้งค่า JWT Secret](#การตั้งค่า-jwt-secret)
3. [การ Login และรับ Token](#การ-login-และรับ-token)
4. [การใช้งาน Bearer Token](#การใช้งาน-bearer-token)
5. [ตัวอย่างการใช้งาน API](#ตัวอย่างการใช้งาน-api)
6. [Role-based Authorization](#role-based-authorization)
7. [การทดสอบด้วย Postman](#การทดสอบด้วย-postman)
8. [การจัดการ Error](#การจัดการ-error)

## 🔐 ภาพรวมระบบ

ระบบใช้ **JWT Bearer Token** สำหรับการ authentication และ authorization:

- **Authentication**: ใช้ Bearer Token ใน Authorization header
- **Token Format**: `Bearer <JWT_TOKEN>`
- **Token Expiry**: 24 ชั่วโมง
- **Role Support**: รองรับระบบ roles (user, admin)

## 🔑 การตั้งค่า JWT Secret

### 1. สร้าง JWT Secret ใหม่
```bash
npm run generate-secrets
```

### 2. อัพเดท .env.local
```env
JWT_SECRET="JWT_4f8e9c3a7b2d1e5f6a8c9b4d7e2f1a5c3b6d9e8f7a4c1b5e8d2f9c6a3b7e1d4f8c2a5b9e7f1d3c6a8b4e7d2f5c9a1b6e3d8f7c4a2b5e9d1f6c3a7b8e4d2f5c9a6b3e7d1f8c4a2b5e9d6f3c7a1b8e4d2f5c9a3b6e7d1f8c4a5b2e9d6f3c7a8b1e4d2f5c9a6b3e7d8f1c4a2b5e9d3f6c7a1b8e4d5f2c9a6b3e7d1f8c4a2b5e9d6f3c7a8b1e4d2f5c9a3b6e7d1f8c4a5b2e9d6f3c7a1b8e4d2f5c9a6b3e7d8f1c4a2b5e9d3f6c7a8b1e4d2f5c9a6b3e7d1f8c4a5b2e9d6f3c7a1b8e4d2f5c9a3b6e7d8f1c4a2b5e9d6f3c7a8b1e4d2f5c9a6b3e7d1f8c4a5b"
```

## 🚀 การ Login และรับ Token

### POST `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 🔒 การใช้งาน Bearer Token

### 1. Authorization Header Format
```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

### 2. ตัวอย่างการใช้งาน

#### JavaScript/Fetch
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

fetch('/api/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

#### cURL
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/profile
```

#### Axios
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ใช้งาน
api.get('/profile').then(response => {
  console.log(response.data);
});
```

## 📊 ตัวอย่างการใช้งาน API

### 1. Get User Profile (Protected)
```bash
GET /api/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-01-26T10:30:00.000Z",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user"
    },
    "message": "Profile retrieved successfully"
  }
}
```

### 2. Get Current User Info
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

### 3. Admin Dashboard (Role-based)
```bash
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

**Response (Admin only):**
```json
{
  "success": true,
  "timestamp": "2025-01-26T10:30:00.000Z",
  "data": {
    "adminData": {
      "totalUsers": 150,
      "totalEnergy": 25000,
      "systemStatus": "active",
      "lastUpdate": "2025-01-26T10:30:00.000Z"
    },
    "requestedBy": {
      "id": 1,
      "email": "admin@example.com",
      "role": "admin"
    },
    "message": "Admin data retrieved successfully"
  }
}
```

## 👥 Role-based Authorization

### Supported Roles:
- `user`: ผู้ใช้ทั่วไป
- `admin`: ผู้ดูแลระบบ

### การใช้งาน:
```typescript
// API สำหรับ admin เท่านั้น
export const GET = withRole(['admin'])(handlerFunction);

// API สำหรับหลาย roles
export const GET = withRole(['admin', 'moderator'])(handlerFunction);

// API สำหรับผู้ใช้ที่ login แล้ว (ไม่จำกัด role)
export const GET = withAuth(handlerFunction);
```

## 🧪 การทดสอบด้วย Postman

### 1. Setup Environment
**Variables:**
```
baseUrl: http://localhost:3000
token: (จะได้จากการ login)
```

### 2. Login Request
```
POST {{baseUrl}}/api/auth/login
Body (JSON):
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### 3. Save Token (ใน Tests tab)
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

### 4. Use Token in Protected Requests
```
Authorization: Bearer {{token}}
```

### 5. Pre-request Script (Auto-token)
```javascript
const token = pm.environment.get("token");
if (token) {
    pm.request.headers.add({
        key: 'Authorization',
        value: `Bearer ${token}`
    });
}
```

## ⚠️ การจัดการ Error

### Common Error Responses:

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Access denied. Please provide a valid Bearer token."
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "message": "Access denied. Required roles: admin"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid token format",
  "message": "Authorization header must be in format: Bearer <token>"
}
```

#### Token Expired
```json
{
  "success": false,
  "error": "Token has expired",
  "message": "Please login again to get a new token"
}
```

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. Token ไม่ถูกต้อง
- ตรวจสอบว่า header มี format: `Bearer <token>`
- ตรวจสอบว่า token ไม่ expired
- ตรวจสอบ JWT_SECRET ใน .env.local

### 2. Permission Denied
- ตรวจสอบ role ของ user
- ตรวจสอบว่า API endpoint ต้องการ role ใด

### 3. Token หาย
- Login ใหม่เพื่อรับ token ใหม่
- ตรวจสอบการเก็บ token ใน client

## 📚 Additional Resources

### Protected Routes ที่มีอยู่:
- `/api/profile` - Get user profile (Auth required)
- `/api/auth/me` - Get current user (Auth required)
- `/api/admin/dashboard` - Admin dashboard (Admin role required)

### Middleware Files:
- `src/lib/jwt.ts` - JWT utilities
- `src/lib/auth-middleware.ts` - Authentication middleware
- `src/middleware.ts` - Next.js middleware

### บันทึก:
- Token จะหมดอายุใน 24 ชั่วโมง
- ระบบรองรับทั้ง Bearer Token และ Cookies
- Token ถูกเก็บใน HttpOnly cookies สำหรับ web app
- Bearer Token ใช้สำหรับ API calls และ mobile apps
