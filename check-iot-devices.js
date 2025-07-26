const { Client } = require('pg');

// Load environment variables from .env file
require('dotenv').config();

async function checkDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'iot_energy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password123'
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    // Check if iot_devices table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'iot_devices'
      );
    `);

    console.log('Does iot_devices table exist?', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Check table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'iot_devices'
        ORDER BY ordinal_position;
      `);

      console.log('\n📋 Table structure:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });

      // Check data
      const dataCount = await client.query('SELECT COUNT(*) FROM iot_devices');
      console.log(`\n📊 Total records: ${dataCount.rows[0].count}`);
    } else {
      console.log('❌ Table iot_devices does not exist!');
    }

    // List all tables
    const allTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('\n📝 All tables in database:');
    allTables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Database check failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

checkDatabase();
