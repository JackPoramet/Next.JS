const { execSync } = require('child_process');
const path = require('path');

// ฟังก์ชันสำหรับรัน TypeScript files
function runTsScript(scriptPath) {
  try {
    console.log(`🚀 Running ${scriptPath}...`);
    
    // ใช้ npx tsx เพื่อรัน TypeScript files
    execSync(`npx tsx ${scriptPath}`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log(`✅ ${scriptPath} completed successfully!`);
  } catch (error) {
    console.error(`❌ Error running ${scriptPath}:`, error.message);
    process.exit(1);
  }
}

// รัน setup-db script
if (process.argv[2] === 'setup-db') {
  runTsScript('src/scripts/setup-db.ts');
}

// รัน seed script
if (process.argv[2] === 'seed') {
  runTsScript('src/scripts/seed.ts');
}

// รัน ทั้งสองอย่าง
if (process.argv[2] === 'reset') {
  runTsScript('src/scripts/setup-db.ts');
  console.log('📊 Setting up database completed, now seeding...');
  runTsScript('src/scripts/seed.ts');
}
