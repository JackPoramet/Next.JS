import { Pool } from 'pg';

// สร้าง connection pool สำหรับ PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ปิด SSL เนื่องจาก database server ไม่รองรับ
  ssl: false,
  //สำหรับเปิด SSL
  //ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // จำนวน connection สูงสุด
  idleTimeoutMillis: 30000, // ปิด idle connection หลัง 30 วินาที
  connectionTimeoutMillis: 10000, // timeout สำหรับการเชื่อมต่อ (10 วินาที)
  query_timeout: 15000, // timeout สำหรับ query (15 วินาที)
  statement_timeout: 15000, // timeout สำหรับ statement
});

// ฟังก์ชันสำหรับ query database พร้อม retry mechanism
export const query = async (text: string, params?: any[], retries: number = 3) => {
  const start = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    let client;
    
    try {
      console.log(`Database query attempt ${attempt}/${retries}`);
      client = await pool.connect();
      
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query successfully', { 
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), 
        duration, 
        rows: res.rowCount,
        attempt 
      });
      return res;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`Database query error (attempt ${attempt}/${retries}):`, {
        error: lastError.message,
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        attempt
      });
      
      // ถ้ายังไม่ใช่ attempt สุดท้าย ให้รอก่อน retry
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } finally {
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          console.error('Error releasing client:', releaseError);
        }
      }
    }
  }
  
  // ถ้า retry ครบแล้วยังผิดพลาด
  console.error('All database query attempts failed');
  throw lastError || new Error('Database connection failed after all retries');
};

// ฟังก์ชันสำหรับปิด connection pool
export const closePool = async () => {
  await pool.end();
};

// ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ database
export const testConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
  try {
    console.log('Testing database connection...');
    const start = Date.now();
    
    const result = await query('SELECT NOW() as current_time, version() as db_version');
    const duration = Date.now() - start;
    
    if (result.rows && result.rows.length > 0) {
      const { current_time, db_version } = result.rows[0];
      console.log('Database connection test successful', { duration });
      
      return {
        success: true,
        message: 'Database connection successful',
        details: {
          current_time,
          db_version: db_version.split(' ')[0], // เอาแค่ version number
          connection_time: `${duration}ms`,
          pool_total: pool.totalCount,
          pool_idle: pool.idleCount,
          pool_waiting: pool.waitingCount
        }
      };
    } else {
      return {
        success: false,
        message: 'Database connection test failed - no results'
      };
    }
  } catch (error) {
    console.error('Database connection test failed:', error);
    return {
      success: false,
      message: 'Database connection failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        pool_total: pool.totalCount,
        pool_idle: pool.idleCount,
        pool_waiting: pool.waitingCount
      }
    };
  }
};

export default pool;
