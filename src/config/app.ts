// Application Configuration
// ใช้ค่าจาก .env ไฟล์ที่ตั้งค่าไว้แล้ว
export const appConfig = {
  name: 'IoT Electric Energy Monitoring',
  version: '1.0.0',
  description: 'Smart IoT system for monitoring electric energy consumption',
  
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Server
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || 'localhost',
  
  // Authentication (ใช้ค่าจาก .env)
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // NextAuth (ใช้ค่าจาก .env)
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  
  // URLs (ใช้ค่าจาก .env)
  baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
};

export default appConfig;
