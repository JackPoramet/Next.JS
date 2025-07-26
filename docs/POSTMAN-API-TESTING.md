# 🧪 คู่มือการทดสอบ API ด้วย Postman

## 🚀 การเตรียมตัวก่อนทดสอบ

### 1. เริ่มต้น Development Server

```bash
# เช็คการเชื่อมต่อ database ก่อน
npm run db:check

# ถ้ายังไม่มีข้อมูล ให้ setup database
npm run db:fresh

# เริ่ม server
npm run dev
```

เซิร์ฟเวอร์จะรันที่: `http://localhost:3000`

### 2. ตรวจสอบข้อมูลทดสอบ

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**User Account:**
- Email: `user@example.com`
- Password: `user123`

## 📝 การทดสอบ API Endpoints

### 🔄 Authentication Flow Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   1. Login      │    │   2. Get Token   │    │  3. Use Token   │
│  (No Auth)      │───▶│   (Response)     │───▶│  (Auth Required)│
│                 │    │                  │    │                 │
│ email+password  │    │  JWT Token       │    │ Bearer Token    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**เหตุผลที่ Login ไม่ต้องการ Auth:**
- 🚪 เป็นประตูเข้าสู่ระบบ - ผู้ใช้ยังไม่มี token
- 🔑 ใช้ email/password แทน token เพื่อพิสูจน์ตัวตน
- 🎯 จุดประสงค์คือเพื่อ**สร้าง** token ไม่ใช่**ใช้** token

### 📋 สรุป API Endpoints และ Authentication Requirements

| Endpoint | Method | Auth Required | เหตุผล |
|----------|--------|---------------|--------|
| `/api/auth/login` | POST | ❌ | ใช้เพื่อขอ token ครั้งแรก - ผู้ใช้ยังไม่มี token |
| `/api/auth/register` | POST | ❌ | สร้างบัญชีใหม่ - ผู้ใช้ยังไม่มี token |
| `/api/auth/me` | GET | ✅ | ดูข้อมูลตัวเอง - ต้องพิสูจน์ว่าเป็นใคร |
| `/api/auth/logout` | POST | ✅ | ยกเลิก token - ต้องยืนยันว่ามี token ที่ valid |
| `/api/profile` | GET | ✅ | ข้อมูลส่วนตัว - ต้องพิสูจน์ตัวตน |

### 1. 🔐 Login API (🚫 No Auth Required)

**Endpoint:** `POST http://localhost:3000/api/auth/login`

> **💡 สำคัญ:** Endpoint นี้ไม่ต้องการ Bearer Token เพราะเป็นการขอ token ครั้งแรก

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Expected Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Expected Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 2. 📝 Register API (🚫 No Auth Required)

**Endpoint:** `POST http://localhost:3000/api/auth/register`

> **💡 สำคัญ:** Endpoint นี้ไม่ต้องการ Bearer Token เพราะเป็นการสร้างบัญชีใหม่ - ผู้ใช้ยังไม่มีบัญชีในระบบ

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "newuser@example.com",
  "password": "NewUser123!",
  "first_name": "New",
  "last_name": "User"
}
```

**Expected Response (Success - 201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 3,
      "email": "newuser@example.com",
      "first_name": "New",
      "last_name": "User",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 👤 Get User Info API (ต้องมี Token)

**Endpoint:** `GET http://localhost:3000/api/auth/me`

> **💡 หมายเหตุ:** Endpoint นี้ต้องการ Bearer Token เพราะใช้สำหรับดึงข้อมูลของ user ที่ login แล้ว

**Headers:**
```
Authorization: Bearer <token_from_login>
Content-Type: application/json
```

**Expected Response (Success - 200):**
```json
{
  "success": true,
  "message": "Authenticated",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin"
    }
  }
}
```

### 4. 🚪 Logout API (✅ Auth Required)

**Endpoint:** `POST http://localhost:3000/api/auth/logout`

> **💡 สำคัญ:** Endpoint นี้ต้องการ Bearer Token เพื่อยืนยันว่าผู้ใช้มี session ที่ active และต้องการยกเลิก token นั้น

**Headers:**
```
Authorization: Bearer <token_from_login>
Content-Type: application/json
```

**Expected Response (Success - 200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## 🔧 ขั้นตอนการทดสอบใน Postman

### Step 1: ทดสอบ Login

1. เปิด Postman
2. สร้าง Request ใหม่
3. เลือก method **POST**
4. ใส่ URL: `http://localhost:3000/api/auth/login`
5. ไปที่ tab **Headers** เพิ่ม:
   ```
   Content-Type: application/json
   ```
6. ไปที่ tab **Body** เลือก **raw** และ **JSON**
7. ใส่ข้อมูล:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```
8. กด **Send**

### Step 2: คัดลอก Token

จาก response ที่ได้ ให้คัดลอก token ใน `data.token`

### Step 3: ทดสอบ Protected Route

1. สร้าง Request ใหม่
2. เลือก method **GET**
3. ใส่ URL: `http://localhost:3000/api/auth/me`
4. ไปที่ tab **Headers** เพิ่ม:
   ```
   Authorization: Bearer <paste_token_here>
   Content-Type: application/json
   ```
5. กด **Send**

## 🧪 Test Cases ที่ควรทดสอบ

### ✅ Positive Test Cases

1. **Login สำเร็จ** - ใช้ email/password ที่ถูกต้อง
2. **Register สำเร็จ** - สร้าง user ใหม่
3. **Get user info สำเร็จ** - ใช้ valid token
4. **Logout สำเร็จ** - ไม่ต้องใช้ token

### ❌ Negative Test Cases

1. **Login ผิดพลาด** - email/password ไม่ถูกต้อง
2. **Register ผิดพลาด** - email ซ้ำหรือ password อ่อน
3. **Get user info ผิดพลาด** - ไม่ใส่ token หรือ token ผิด
4. **Invalid JSON** - ส่งข้อมูลไม่ครบหรือผิดรูปแบบ

## 📋 Postman Collection

### ตัวอย่าง Collection JSON

```json
{
  "info": {
    "name": "IoT Energy Authentication API",
    "description": "API collection for testing authentication endpoints"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"admin123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"newuser@example.com\",\n  \"password\": \"NewUser123!\",\n  \"first_name\": \"New\",\n  \"last_name\": \"User\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "Get User Info",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/auth/me",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "me"]
        }
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/api/auth/logout",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "auth", "logout"]
        }
      }
    }
  ]
}
```

## 🔍 การ Debug ปัญหา

### 🔐 Security Concepts ที่สำคัญ

#### 1. **Public Endpoints (ไม่ต้องการ Authentication)**
```
/api/auth/login    ← รับ email+password, ส่ง token กลับ
/api/auth/register ← สร้างบัญชีใหม่, ส่ง token กลับ
```
**เหตุผล:** ผู้ใช้ยังไม่มี token เพราะยังไม่ได้เข้าสู่ระบบ

#### 2. **Protected Endpoints (ต้องการ Authentication)**
```
/api/auth/me       ← ต้องมี token เพื่อระบุตัวตน
/api/auth/logout   ← ต้องมี token เพื่อยกเลิก session
/api/profile       ← ต้องมี token เพื่อดูข้อมูลส่วนตัว
```
**เหตุผล:** ต้องพิสูจน์ตัวตนก่อนเข้าถึงข้อมูลที่มีความละเอียดอ่อน

#### 3. **Authentication vs Credentials**
- **Login:** ใช้ email+password (credentials) เพื่อรับ token
- **Protected APIs:** ใช้ token (authentication) เพื่อเข้าถึงข้อมูล

### ถ้าได้ Error 500

```json
{
  "success": false,
  "message": "Internal server error"
}
```

**แก้ไข:**
1. ตรวจสอบ console ของ server (`npm run dev`)
2. ตรวจสอบการเชื่อมต่อ database (`npm run db:check`)
3. ตรวจสอบว่า JWT_SECRET ถูกตั้งค่าใน `.env.local`

### ถ้าได้ Error 401

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**แก้ไข:**
1. ตรวจสอบ email/password ให้ถูกต้อง
2. ตรวจสอบว่ามี user ในระบบ (`npm run seed`)

### ถ้าได้ CORS Error

**แก้ไข:**
- ตรวจสอบว่า server รันที่ `localhost:3000`
- ใช้ Postman แทน browser (CORS ไม่เป็นปัญหาใน Postman)

## 💡 Tips การใช้งาน

### ❓ FAQ - คำถามที่พบบ่อย

**Q: ทำไม Login API ไม่ต้องการ Bearer Token?**
A: เพราะ Login เป็นจุดเริ่มต้นเพื่อ**รับ** token ครั้งแรก ถ้าต้องการ token เพื่อขอ token ก็จะเป็นวงจรที่ไม่จบ

**Q: Register API ต้องการ Auth ไหม?**
A: ไม่ต้องการ เพราะเป็นการสร้างบัญชีใหม่ ผู้ใช้ยังไม่มีบัญชีในระบบ

**Q: ทำไม Logout API ถึงต้องการ Auth?**
A: เพื่อความปลอดภัย - ระบบต้องยืนยันว่าคุณมี valid session จริงก่อนจะยกเลิก token

**Q: Token หมดอายุเมื่อไหร่?**
A: Token จะหมดอายุใน 24 ชั่วโมง หลังจากนั้นต้อง login ใหม่

**Q: ถ้า Token หมดอายุจะเกิดอะไรขึ้น?**
A: จะได้รับ Error 401 และต้อง login ใหม่เพื่อรับ token ใหม่

1. **บันทึก Token** - ใน Postman สามารถใช้ Variables เพื่อเก็บ token
2. **Environment Variables** - ตั้งค่า `{{baseUrl}}` เป็น `http://localhost:3000`
3. **Pre-request Scripts** - ใช้เพื่อ auto-generate data
4. **Tests** - เขียน test scripts เพื่อตรวจสอบ response
5. **Collection Runner** - รัน test ทั้งหมดในครั้งเดียว

## 🏃‍♂️ Quick Start

```bash
# 1. เริ่ม server
npm run dev

# 2. เปิด Postman
# 3. ส่ง POST request ไปที่:
#    http://localhost:3000/api/auth/login
#    Body: {"email": "admin@example.com", "password": "admin123"}
# 4. คัดลอก token จาก response
# 5. ใช้ token ใน Authorization header สำหรับ protected routes
```
