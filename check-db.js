const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'iot_energy_management',
  user: 'postgres',
  password: 'password'
});

async function checkTables() {
  try {
    console.log('=== locations table structure ===');
    const locationsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'locations' 
      ORDER BY ordinal_position
    `);
    console.log(locationsResult.rows);

    console.log('\n=== faculties table structure ===');
    const facultiesResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'faculties' 
      ORDER BY ordinal_position
    `);
    console.log(facultiesResult.rows);

    console.log('\n=== Check available tables ===');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Available tables:', tablesResult.rows.map(r => r.table_name));

  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
