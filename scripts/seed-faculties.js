const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DATABASE || 'iot_energy_management',
  password: process.env.POSTGRES_PASSWORD || 'your_password',
  port: process.env.POSTGRES_PORT || 5432,
});

async function seedFaculties() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding faculties data...');
    
    await client.query('BEGIN');
    
    // Insert faculties with contact information
    const facultiesData = [
      {
        code: 'institution',
        name: 'หน่วยงานและพื้นที่บริการ',
        email: 'admin@university.ac.th',
        phone: '053-943-001'
      },
      {
        code: 'engineering',
        name: 'คณะวิศวกรรมศาสตร์',
        email: 'eng@university.ac.th',
        phone: '053-943-002'
      },
      {
        code: 'liberal_arts',
        name: 'คณะศิลปศาสตร์',
        email: 'liberal@university.ac.th',
        phone: '053-943-003'
      },
      {
        code: 'business_administration',
        name: 'คณะบริหารธุรกิจ',
        email: 'business@university.ac.th',
        phone: '053-943-004'
      },
      {
        code: 'architecture',
        name: 'คณะสถาปัตยกรรมศาสตร์',
        email: 'arch@university.ac.th',
        phone: '053-943-005'
      },
      {
        code: 'industrial_education',
        name: 'ครุศาสตร์อุตสาหกรรมและเทคโนโลยี',
        email: 'industrial@university.ac.th',
        phone: '053-943-006'
      }
    ];
    
    for (const faculty of facultiesData) {
      await client.query(`
        INSERT INTO faculties (faculty_code, faculty_name, contact_email, contact_phone)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (faculty_code) DO UPDATE SET
          faculty_name = EXCLUDED.faculty_name,
          contact_email = EXCLUDED.contact_email,
          contact_phone = EXCLUDED.contact_phone,
          updated_at = CURRENT_TIMESTAMP
      `, [faculty.code, faculty.name, faculty.email, faculty.phone]);
      
      console.log(`✅ Added faculty: ${faculty.name}`);
    }
    
    await client.query('COMMIT');
    console.log('🎉 Faculties seeded successfully!');
    
    // Show current faculties
    const result = await client.query('SELECT * FROM faculties ORDER BY faculty_code');
    console.log('\n📋 Current faculties:');
    result.rows.forEach(row => {
      console.log(`- ${row.faculty_code}: ${row.faculty_name} (${row.contact_email}, ${row.contact_phone})`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding faculties:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the seeding
seedFaculties()
  .then(() => {
    console.log('✅ Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
