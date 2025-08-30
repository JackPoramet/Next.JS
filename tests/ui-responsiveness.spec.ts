import { test, expect } from '@playwright/test';

// ทดสอบการแสดงผลบนอุปกรณ์ขนาดต่างๆ
test.describe('ทดสอบ Responsive Design', () => {
  // ทดสอบบนขนาดจอมือถือ
  test('ทดสอบการแสดงผลบนมือถือ', async ({ page }) => {
    // กำหนดขนาดหน้าจอเป็นมือถือ
    await page.setViewportSize({ width: 375, height: 667 });
    
    // เข้าสู่หน้าหลัก
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // ถ่ายภาพหน้าจอเพื่อตรวจสอบการแสดงผลบนมือถือ
    await page.screenshot({ path: 'screenshots/responsive/mobile-home.png', fullPage: true });
    
    // ทดสอบการทำงานของปุ่มเมนู
    const menuButton = page.locator('button[aria-label*="เปิด/ปิดเมนู"]');
    await expect(menuButton).toBeVisible();
    
    // ไปที่หน้า login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // ถ่ายภาพหน้า login บนมือถือ
    await page.screenshot({ path: 'screenshots/responsive/mobile-login.png', fullPage: true });
    
    // กรอกข้อมูล login
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // คลิกปุ่ม login
    await page.click('button[type="submit"]');
    
    // รอให้ redirect ไปที่ dashboard
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ถ่ายภาพหน้า Dashboard บนมือถือ
    await page.screenshot({ path: 'screenshots/responsive/mobile-dashboard.png', fullPage: true });
    
    // ทดสอบการใช้งาน mobile menu
    const menuButton = page.locator('button[aria-label*="เมนู"]');
    await expect(menuButton).toBeVisible();
    
    // คลิกเปิดเมนู
    await menuButton.click();
    await page.waitForTimeout(500);
    
    // ถ่ายภาพเมนูที่เปิดออกมา
    await page.screenshot({ path: 'screenshots/responsive/mobile-menu-open.png' });
    
    // คลิกเมนู Energy Monitor
    await page.click('text=Energy Monitor');
    await page.waitForLoadState('networkidle');
    
    // ถ่ายภาพหน้า Energy Monitor บนมือถือ
    await page.screenshot({ path: 'screenshots/responsive/mobile-energy.png', fullPage: true });
  });
  
  // ทดสอบบนขนาดจอแท็บเล็ต
  test('ทดสอบการแสดงผลบนแท็บเล็ต', async ({ page }) => {
    // กำหนดขนาดหน้าจอเป็นแท็บเล็ต
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // เข้าสู่หน้าหลัก
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // ถ่ายภาพหน้าจอเพื่อตรวจสอบการแสดงผลบนแท็บเล็ต
    await page.screenshot({ path: 'screenshots/responsive/tablet-home.png', fullPage: true });
    
    // ไปที่หน้า login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // ถ่ายภาพหน้า login บนแท็บเล็ต
    await page.screenshot({ path: 'screenshots/responsive/tablet-login.png', fullPage: true });
    
    // กรอกข้อมูล login
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // คลิกปุ่ม login
    await page.click('button[type="submit"]');
    
    // รอให้ redirect ไปที่ dashboard
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ถ่ายภาพหน้า Dashboard บนแท็บเล็ต
    await page.screenshot({ path: 'screenshots/responsive/tablet-dashboard.png', fullPage: true });
    
    // ทดสอบการคลิกเมนู Analytics
    await page.click('text=Analytics');
    await page.waitForLoadState('networkidle');
    
    // ถ่ายภาพหน้า Analytics บนแท็บเล็ต
    await page.screenshot({ path: 'screenshots/responsive/tablet-analytics.png', fullPage: true });
  });
  
  // ทดสอบบนขนาดจอเดสก์ท็อป
  test('ทดสอบการแสดงผลบนเดสก์ท็อป', async ({ page }) => {
    // กำหนดขนาดหน้าจอเป็นเดสก์ท็อป
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // เข้าสู่หน้าหลัก
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // ถ่ายภาพหน้าจอเพื่อตรวจสอบการแสดงผลบนเดสก์ท็อป
    await page.screenshot({ path: 'screenshots/responsive/desktop-home.png', fullPage: true });
    
    // ทดสอบการคลิกเมนู และการแสดงผลหน้าต่างๆ
    const dashboardLink = page.locator('a[href="/dashboard"]');
    await dashboardLink.click();
    
    // รอให้หน้า Dashboard โหลด
    await page.waitForLoadState('networkidle');
    
    // ทดสอบการคลิกเมนูย่อยต่างๆ ใน Dashboard
    const menus = [
      { name: 'Energy Monitor', path: 'desktop-energy.png' },
      { name: 'Devices', path: 'desktop-devices.png' },
      { name: 'Analytics', path: 'desktop-analytics.png' },
      { name: 'Reports', path: 'desktop-reports.png' },
      { name: 'Settings', path: 'desktop-settings.png' },
    ];
    
    // ทดสอบแต่ละเมนู
    for (const menu of menus) {
      await page.click(`text=${menu.name}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500); // รอให้ animation เสร็จสิ้น
      await page.screenshot({ path: `screenshots/responsive/${menu.path}`, fullPage: true });
    }
  });
});
