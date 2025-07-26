const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

/**
 * Seed data for users table
 * Run this script to populate initial users
 */

const seedUsers = async (pool) => {
  try {
    console.log('🌱 Starting user seed...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const userPassword = await bcrypt.hash('User123!', 10);

    // Sample users data
    const users = [
      {
        email: 'admin@iot-energy.com',
        password_hash: adminPassword,
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        is_active: true,
      },
      {
        email: 'user@iot-energy.com',
        password_hash: userPassword,
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
        is_active: true,
      },
      {
        email: 'manager@iot-energy.com',
        password_hash: await bcrypt.hash('Manager123!', 10),
        first_name: 'Energy',
        last_name: 'Manager',
        role: 'manager',
        is_active: true,
      },
    ];

    // Insert users
    for (const user of users) {
      try {
        await pool.query(`
          INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (email) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = CURRENT_TIMESTAMP
        `, [
          user.email,
          user.password_hash,
          user.first_name,
          user.last_name,
          user.role,
          user.is_active,
        ]);
        
        console.log(`✅ User ${user.email} seeded successfully`);
      } catch (error) {
        console.error(`❌ Error seeding user ${user.email}:`, error.message);
      }
    }

    console.log('🎉 User seed completed!');
    return true;
  } catch (error) {
    console.error('❌ Error in user seed:', error);
    return false;
  }
};

module.exports = { seedUsers };

// Run directly if called as script
if (require.main === module) {
  const { Pool } = require('pg');
  
  const runSeed = async () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
      await seedUsers(pool);
    } finally {
      await pool.end();
    }
  };

  runSeed();
}
