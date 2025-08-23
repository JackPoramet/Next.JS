// src/scripts/view-data.ts
// สคริปต์สำหรับดูข้อมูลจาก View ในฐานข้อมูล
import { query } from '../lib/database';

async function viewData(viewName: string, limit: number = 10) {
  try {
    if (!viewName) {
      console.error('❌ กรุณาระบุชื่อ View');
      console.log('วิธีใช้: npx ts-node src/scripts/view-data.ts [view_name] [limit_rows]');
      
      // แสดงรายชื่อ View ที่มีอยู่ในฐานข้อมูล
      console.log('\n📋 View ที่มีอยู่ในฐานข้อมูล:');
      const viewsResult = await query(`
        SELECT table_name AS view_name
        FROM information_schema.views
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      if (viewsResult.rows.length === 0) {
        console.log('ไม่พบ View ในฐานข้อมูล');
      } else {
        console.table(viewsResult.rows);
      }
      
      return;
    }

    console.log(`🔍 กำลังแสดงข้อมูลจาก View "${viewName}"...`);
    
    // ตรวจสอบว่า View มีอยู่จริงหรือไม่
    const checkViewResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [viewName]);
    
    if (!checkViewResult.rows[0].exists) {
      console.error(`❌ ไม่พบ View "${viewName}" ในฐานข้อมูล`);
      return;
    }
    
    // แสดงโครงสร้างของ View
    console.log(`\n📊 โครงสร้างของ View ${viewName}:`);
    const columnsResult = await query(`
      SELECT 
        column_name, 
        data_type,
        character_maximum_length
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public' AND 
        table_name = $1
      ORDER BY 
        ordinal_position;
    `, [viewName]);
    
    console.table(columnsResult.rows);
    
    // แสดงข้อมูลใน View
    console.log(`\n📝 ข้อมูล ${limit} แถวแรกใน View ${viewName}:`);
    const dataResult = await query(`
      SELECT * FROM "${viewName}" LIMIT $1;
    `, [limit]);
    
    console.table(dataResult.rows);
    
    // แสดงจำนวนแถวทั้งหมดใน View
    const countResult = await query(`
      SELECT COUNT(*) FROM "${viewName}";
    `);
    
    console.log(`\n📊 จำนวนแถวทั้งหมดใน View ${viewName}: ${countResult.rows[0].count}`);
    
    // ถ้าเป็น View สำหรับ Dashboard แสดงผลสรุปเพิ่มเติม
    if (viewName.toLowerCase().includes('dashboard')) {
      console.log('\n📈 สรุปสถานะอุปกรณ์:');
      const statusResult = await query(`
        SELECT device_status, COUNT(*) 
        FROM "${viewName}" 
        GROUP BY device_status;
      `);
      console.table(statusResult.rows);
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
}

// รับ arguments จาก command line
const viewName = process.argv[2];
const limit = parseInt(process.argv[3] || '10', 10);

// รันฟังก์ชัน
viewData(viewName, limit);
