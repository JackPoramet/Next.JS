// src/scripts/list-views.ts
// สคริปต์สำหรับแสดงรายการ View ทั้งหมดในฐานข้อมูล
import { query } from '../lib/database';

async function listViews() {
  try {
    console.log('🔍 กำลังค้นหา View ในฐานข้อมูล...');
    
    // ค้นหา View ทั้งหมดในฐานข้อมูล
    const viewsResult = await query(`
      SELECT 
        v.table_name AS view_name,
        pg_catalog.pg_get_viewdef(c.oid, true) AS view_definition
      FROM 
        information_schema.views v
      JOIN 
        pg_catalog.pg_class c ON v.table_name = c.relname
      JOIN 
        pg_catalog.pg_namespace n ON c.relnamespace = n.oid AND n.nspname = v.table_schema
      WHERE 
        v.table_schema = 'public'
      ORDER BY 
        v.table_name;
    `);
    
    if (viewsResult.rows.length === 0) {
      console.log('ไม่พบ View ในฐานข้อมูล');
      return;
    }
    
    console.log(`\n📋 พบ ${viewsResult.rows.length} View ในฐานข้อมูล:`);
    
    // แสดงรายการ View
    for (let i = 0; i < viewsResult.rows.length; i++) {
      const view = viewsResult.rows[i];
      console.log(`\n----- View #${i + 1}: ${view.view_name} -----`);
      
      // แสดงโครงสร้างคอลัมน์ของ View
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
      `, [view.view_name]);
      
      console.log(`\nคอลัมน์ของ ${view.view_name}:`);
      console.table(columnsResult.rows);
      
      // แสดงตัวอย่างข้อมูล
      try {
        const sampleResult = await query(`
          SELECT * FROM "${view.view_name}" LIMIT 3;
        `);
        
        console.log(`\nตัวอย่างข้อมูลจาก ${view.view_name}:`);
        if (sampleResult.rows.length > 0) {
          console.table(sampleResult.rows);
        } else {
          console.log('(ไม่มีข้อมูล)');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.log('ไม่สามารถดึงข้อมูลตัวอย่างได้:', errorMessage);
      }
      
      // แสดง SQL ที่ใช้ในการสร้าง View (definition)
      console.log(`\nSQL Definition ของ ${view.view_name}:`);
      console.log(view.view_definition);
      
      console.log('\n' + '-'.repeat(50));
    }
    
    console.log('\n✅ วิธีเรียกใช้งาน View:');
    console.log('- ใช้คำสั่ง SQL: SELECT * FROM view_name;');
    console.log('- ใช้สคริปต์: npx ts-node src/scripts/view-data.ts view_name [limit]');
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ เกิดข้อผิดพลาด:', errorMessage);
  }
}

// รันฟังก์ชัน
listViews();
