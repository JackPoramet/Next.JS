import { Pool } from 'pg';

// สร้าง connection pool สำหรับ PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // การตั้งค่าเพิ่มเติมสำหรับ production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // จำนวน connection สูงสุด
  idleTimeoutMillis: 30000, // ปิด idle connection หลัง 30 วินาที
  connectionTimeoutMillis: 2000, // timeout สำหรับการเชื่อมต่อ
});

// ฟังก์ชันสำหรับ query database
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const client = await pool.connect();
  
  try {
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ฟังก์ชันสำหรับปิด connection pool
export const closePool = async () => {
  await pool.end();
};

export default pool;
