import { test, expect } from '@playwright/test';

// เตรียมการทดสอบหน้าเว็บแบบพื้นฐาน
test('เช็คความสวยงามและการใช้งานของเว็บไซต์', async ({ page }) => {
  // เข้าสู่หน้าหลัก
  await page.goto('http://localhost:3000');
  
  // ตรวจสอบการโหลดหน้าเว็บ
  await expect(page).toHaveTitle(/IoT Electric Energy Dashboard/);

  // ถ่ายภาพหน้าจอเพื่อตรวจสอบการแสดงผล
  await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
  
  // ทดสอบการทำงานของปุ่มเปลี่ยนธีม
  const themeToggle = page.locator('button[aria-label*="เปลี่ยนเป็นธีม"]');
  await expect(themeToggle).toBeVisible();  // ถ่ายภาพก่อนเปลี่ยนธีม
  await page.screenshot({ path: 'screenshots/before-theme-change.png' });
  
  // คลิกเปลี่ยนธีม
  await themeToggle.click();
  
  // รอให้การเปลี่ยนธีมทำงาน
  await page.waitForTimeout(1000);
  
  // ถ่ายภาพหลังเปลี่ยนธีม
  await page.screenshot({ path: 'screenshots/after-theme-change.png' });
  
  // ไปที่หน้า Dashboard
  const dashboardLink = page.locator('a[href="/dashboard"]');
  await dashboardLink.click();
  
  // รอให้หน้า Dashboard โหลด
  await page.waitForLoadState('networkidle');
  
  // ถ่ายภาพหน้า Dashboard
  await page.screenshot({ path: 'screenshots/dashboard.png', fullPage: true });
});

// ทดสอบการ login และการใช้งาน Dashboard
test('ทดสอบการล็อกอินและตรวจสอบ UI ของ Dashboard', async ({ page }) => {
  // เข้าสู่หน้า login
  await page.goto('http://localhost:3000/login');
  
  // ตรวจสอบชื่อหน้า
  await expect(page).toHaveTitle(/IoT Electric Energy Dashboard/);

  // ถ่ายภาพหน้า login
  await page.screenshot({ path: 'screenshots/login-page.png' });  // กรอกข้อมูล login
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'password123');

  // ถ่ายภาพหลังกรอกข้อมูล
  await page.screenshot({ path: 'screenshots/login-filled.png' });
  
  // คลิกปุ่ม login
  await page.click('button[type="submit"]');
  
  // รอให้ redirect ไปที่ dashboard
  await page.waitForURL('**/dashboard');
  
  // รอให้หน้า Dashboard โหลดสมบูรณ์
  await page.waitForLoadState('networkidle');
  
  // ถ่ายภาพหน้า Dashboard หลังจาก login สำเร็จ
  await page.screenshot({ path: 'screenshots/dashboard-after-login.png', fullPage: true });
  
  // ทดสอบการแสดงผลของ Quick Access Menu
  const quickAccessSection = page.locator('text=Quick Access');
  await expect(quickAccessSection).toBeVisible();
  
  // ทดสอบการแสดงผลของ System Status
  const systemStatusSection = page.locator('text=System Status');
  await expect(systemStatusSection).toBeVisible();
  
  // ทดสอบการคลิกเมนู Energy Monitor
  await page.click('text=Energy Monitor');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/energy-monitor.png', fullPage: true });
  
  // ทดสอบการแสดงผลของ Energy Overview
  const energyOverview = page.locator('text=Energy Overview').first();
  await expect(energyOverview).toBeVisible();
  
  // ทดสอบการคลิกเมนู Analytics
  await page.click('text=Analytics');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/analytics.png', fullPage: true });
  
  // ทดสอบการแสดงผลของ Analytics Dashboard
  const analyticsTitle = page.locator('text=Analytics Dashboard').first();
  await expect(analyticsTitle).toBeVisible();
});
