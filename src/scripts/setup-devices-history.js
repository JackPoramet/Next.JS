#!/usr/bin/env node

/**
 * Setup script for devices_history table
 * Run this to create the devices_history table if it doesn't exist
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import pool, { query, closePool } from '../lib/database.js';

async function setupDevicesHistory() {
  try {
    console.log('🗄️ Setting up devices_history table...');

    // Read the devices_history SQL file
    const sqlPath = join(process.cwd(), 'src', 'db', 'devices_history.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    console.log('📄 Executing devices_history SQL...');
    
    // Split SQL statements and run them one by one
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    for (const statement of statements) {
      try {
        if (statement.includes('COMMENT ON') || statement.includes('CREATE OR REPLACE')) {
          // Skip comments and function recreations for now
          console.log('ℹ️ Skipping comment/function statement');
          continue;
        }
        await query(statement);
        console.log('✅ SQL statement executed successfully');
      } catch (error) {
        // Skip errors for things that already exist
        if (error instanceof Error && 
            (error.message.includes('already exists') || 
             error.message.includes('does not exist'))) {
          console.log('ℹ️ Statement skipped (may already exist)');
        } else {
          console.warn('⚠️ Warning in statement execution:', error.message);
        }
      }
    }

    // Test the table
    console.log('🧪 Testing devices_history table...');
    const testResult = await query('SELECT COUNT(*) FROM devices_history');
    console.log(`✅ devices_history table is ready with ${testResult.rows[0].count} records`);

    console.log('🎉 devices_history table setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up devices_history table:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('💡 Cannot connect to PostgreSQL. Please check:');
        console.error('   - PostgreSQL service is running');
        console.error('   - DATABASE_URL in .env is correct');
      } else if (error.message.includes('authentication failed')) {
        console.error('💡 Authentication failed. Please check username/password in DATABASE_URL');
      }
    }
    
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run the setup if this file is executed directly
if (process.argv[1].endsWith('setup-devices-history.js')) {
  setupDevicesHistory()
    .then(() => {
      console.log('🏁 Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

export default setupDevicesHistory;