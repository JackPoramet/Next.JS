// Database Configuration
// ใช้ค่าจาก .env ไฟล์โดยตรง
export const DATABASE_URL = process.env.DATABASE_URL;

// สำหรับกรณีที่ต้องการใช้ individual parameters
export const dbConfig = {
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Pool configuration
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};
