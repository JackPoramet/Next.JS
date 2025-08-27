const { query } = require('./src/lib/database.js');

async function checkTable() {
  try {
    const result = await query("SELECT tablename FROM pg_tables WHERE tablename = 'responsible_persons'");
    console.log(result.rows.length > 0 ? 'Table exists' : 'Table not found');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTable();
