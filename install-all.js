#!/usr/bin/env node

/**
 * 🚀 IoT Electric Energy Management System
 * Dependency Installer Script
 * ==================================================================================
 * สคริปติดตั้ง Dependencies ครบถ้วนสำหรับโปรเจค Next.js 15
 * รันได้ทุกระบบปฏิบัติการ (Windows, Linux, macOS)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// สีสำหรับ console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// ฟังก์ชันแสดงข้อความสี
const log = {
  info: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.magenta}${msg}${colors.reset}`)
};

// รายการ Dependencies
const dependencies = {
  production: {
    "next": "15.4.4",
    "react": "19.1.0", 
    "react-dom": "19.1.0",
    "zustand": "^5.0.6",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^3.0.2",
    "pg": "^8.16.3"
  },
  development: {
    "typescript": "^5",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/bcryptjs": "^2.4.6",
    "@types/pg": "^8.15.4",
    "eslint": "^9",
    "eslint-config-next": "15.4.4",
    "@eslint/eslintrc": "^3",
    "dotenv": "^17.2.1",
    "ts-node": "^10.9.2",
    "tsx": "^4.20.3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19"
  }
};

// ฟังก์ชันตรวจสอบ Node.js version
function checkNodeVersion() {
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    
    log.info(`🔍 ตรวจสอบ Node.js version...`);
    
    if (majorVersion < 18) {
      log.error(`❌ Node.js version ต้อง 18.0.0 หรือสูงกว่า (ปัจจุบัน: ${nodeVersion})`);
      process.exit(1);
    }
    
    log.success(`✅ Node.js version: ${nodeVersion} - รองรับ`);
    return true;
  } catch (error) {
    log.error(`❌ ไม่สามารถตรวจสอบ Node.js version ได้: ${error.message}`);
    process.exit(1);
  }
}

// ฟังก์ชันตรวจสอบ npm
function checkNpm() {
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log.success(`✅ npm version: ${npmVersion}`);
    return true;
  } catch (error) {
    log.error(`❌ npm ไม่พบบนระบบ: ${error.message}`);
    process.exit(1);
  }
}

// ฟังก์ชันติดตั้ง dependencies
function installDependencies(deps, type) {
  const depsList = Object.entries(deps).map(([name, version]) => `${name}@${version}`);
  const saveFlag = type === 'development' ? '--save-dev' : '';
  
  log.info(`📦 ติดตั้ง ${type} dependencies...`);
  
  try {
    const command = `npm install ${saveFlag} ${depsList.join(' ')}`;
    log.info(`  🔧 รันคำสั่ง: npm install ${saveFlag} [${depsList.length} packages]`);
    
    execSync(command, { stdio: 'inherit' });
    log.success(`✅ ติดตั้ง ${type} dependencies สำเร็จ (${depsList.length} packages)`);
  } catch (error) {
    log.error(`❌ เกิดข้อผิดพลาดในการติดตั้ง ${type} dependencies: ${error.message}`);
    process.exit(1);
  }
}

// ฟังก์ชันตรวจสอบการติดตั้ง
function verifyInstallation() {
  log.info(`🔍 ตรวจสอบการติดตั้ง...`);
  
  try {
    // ตรวจสอบ package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      log.error(`❌ ไม่พบไฟล์ package.json`);
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // ตรวจสอบ dependencies
    const installedProd = Object.keys(packageJson.dependencies || {});
    const installedDev = Object.keys(packageJson.devDependencies || {});
    
    log.success(`✅ Production dependencies: ${installedProd.length} packages`);
    log.success(`✅ Development dependencies: ${installedDev.length} packages`);
    
    // ตรวจสอบ node_modules
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      log.success(`✅ node_modules directory พบแล้ว`);
    } else {
      log.warning(`⚠️ node_modules directory ไม่พบ`);
    }
    
    return true;
  } catch (error) {
    log.error(`❌ เกิดข้อผิดพลาดในการตรวจสอบ: ${error.message}`);
    return false;
  }
}

// ฟังก์ชันแสดงสรุป
function showSummary() {
  log.title(`\n📊 สรุปการติดตั้ง Dependencies:`);
  console.log(`${'='.repeat(50)}`);
  
  log.info(`🚀 Frontend Framework:`);
  console.log(`  ✅ Next.js 15.4.4 (with App Router & Turbopack)`);
  console.log(`  ✅ React 19.1.0 (Latest)`);
  console.log(`  ✅ TypeScript 5.0+`);
  
  log.info(`\n🎨 UI & Styling:`);
  console.log(`  ✅ Tailwind CSS v4 (Latest)`);
  
  log.info(`\n🏪 State Management:`);
  console.log(`  ✅ Zustand 5.0.6 (Authentication)`);
  
  log.info(`\n🔐 Authentication & Security:`);
  console.log(`  ✅ JWT 9.0.2 + bcrypt 3.0.2`);
  
  log.info(`\n🗃️ Database:`);
  console.log(`  ✅ PostgreSQL Client 8.16.3`);
  
  log.info(`\n🛠️ Development Tools:`);
  console.log(`  ✅ ESLint, TypeScript, ts-node, tsx`);
  
  log.success(`\n🎉 พร้อมใช้งาน! คำสั่งถัดไป:`);
  console.log(`  📱 npm run dev      - เริ่ม development server`);
  console.log(`  🗃️ npm run setup-db - ตั้งค่าฐานข้อมูล`);
  console.log(`  🌱 npm run seed     - เพิ่มข้อมูลตัวอย่าง`);
  
  console.log(`\n📚 ดูข้อมูลเพิ่มเติมใน README.md`);
  console.log(`${'='.repeat(50)}`);
}

// ฟังก์ชันหลัก
async function main() {
  try {
    log.title(`🎯 IoT Electric Energy Management System - Dependency Installation`);
    console.log(`${'='.repeat(70)}`);
    
    // 1. ตรวจสอบ Node.js และ npm
    checkNodeVersion();
    checkNpm();
    
    console.log('');
    log.info(`📦 เริ่มติดตั้ง Dependencies...`);
    console.log(`${'='.repeat(70)}`);
    
    // 2. ติดตั้ง Production Dependencies
    installDependencies(dependencies.production, 'production');
    
    console.log('');
    
    // 3. ติดตั้ง Development Dependencies
    installDependencies(dependencies.development, 'development');
    
    // 4. ตรวจสอบการติดตั้ง
    const installationOk = verifyInstallation();
    
    if (installationOk) {
      log.success(`\n✅ การติดตั้ง Dependencies เสร็จสมบูรณ์!`);
      console.log(`${'='.repeat(70)}`);
      
      // 5. แสดงสรุป
      showSummary();
    } else {
      log.error(`❌ การติดตั้งไม่สมบูรณ์ กรุณาตรวจสอบและลองใหม่`);
      log.info(`💡 ลองรันคำสั่ง: npm install`);
      process.exit(1);
    }
    
  } catch (error) {
    log.error(`❌ เกิดข้อผิดพลาด: ${error.message}`);
    log.info(`💡 ลองรันคำสั่ง: npm install`);
    process.exit(1);
  }
}

// รันสคริป
if (require.main === module) {
  main();
}

module.exports = {
  checkNodeVersion,
  checkNpm,
  installDependencies,
  verifyInstallation,
  dependencies
};
