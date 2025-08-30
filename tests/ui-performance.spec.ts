import { test, expect } from '@playwright/test';

/**
 * ทดสอบประสิทธิภาพของเว็บไซต์
 * - เวลาในการโหลดหน้า
 * - เวลาในการแสดงผลเนื้อหาสำคัญ
 * - การตอบสนองของ UI
 */
test.describe('ทดสอบประสิทธิภาพของเว็บไซต์', () => {
  test('วัดเวลาในการโหลดและแสดงผลหน้าหลัก', async ({ page }) => {
    // เริ่มจับเวลา
    const startTime = Date.now();
    
    // เข้าสู่หน้าหลัก
    await page.goto('http://localhost:3000');
    
    // รอให้หน้าเว็บโหลดเสร็จสมบูรณ์
    await page.waitForLoadState('networkidle');
    
    // คำนวณเวลาที่ใช้ในการโหลด
    const loadTime = Date.now() - startTime;
    console.log(`หน้าหลักใช้เวลาในการโหลด: ${loadTime}ms`);
    
    // บันทึกข้อมูลประสิทธิภาพ
    await page.evaluate(() => {
      if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domLoadTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        const networkLatency = perfData.responseEnd - perfData.requestStart;
        
        console.log(`เวลาในการโหลดหน้า: ${pageLoadTime}ms`);
        console.log(`เวลาในการโหลด DOM: ${domLoadTime}ms`);
        console.log(`Network Latency: ${networkLatency}ms`);
        
        return {
          pageLoadTime,
          domLoadTime,
          networkLatency
        };
      }
    });
    
    // ทดสอบการตอบสนองของปุ่มเปลี่ยนธีม
    const themeToggleButton = page.locator('button[role="switch"]');
    await expect(themeToggleButton).toBeVisible();
    
    // จับเวลาการคลิกและการตอบสนอง
    const clickStartTime = Date.now();
    await themeToggleButton.click();
    await page.waitForTimeout(100); // รอให้ UI อัปเดต
    const clickResponseTime = Date.now() - clickStartTime;
    
    console.log(`เวลาในการตอบสนองต่อการคลิกปุ่มเปลี่ยนธีม: ${clickResponseTime}ms`);
    
    // ตรวจสอบว่าเวลาในการตอบสนองอยู่ในเกณฑ์ที่ยอมรับได้
    expect(clickResponseTime).toBeLessThan(300); // ไม่ควรเกิน 300ms
  });
  
  test('วัดเวลาในการโหลดและแสดงผลหน้า Dashboard', async ({ page }) => {
    // เข้าสู่หน้า login
    await page.goto('http://localhost:3000/login');
    
    // กรอกข้อมูล login
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // จับเวลาในการล็อกอิน
    const loginStartTime = Date.now();
    await page.click('button[type="submit"]');
    
    // รอให้ redirect ไปที่ dashboard
    await page.waitForURL('**/dashboard');
    const loginTime = Date.now() - loginStartTime;
    console.log(`เวลาในการล็อกอินและโหลดหน้า Dashboard: ${loginTime}ms`);
    
    // รอให้หน้า Dashboard โหลดสมบูรณ์
    await page.waitForLoadState('networkidle');
    
    // จับเวลาการคลิกเมนูและการโหลดหน้าย่อย
    const menus = [
      { name: 'Energy Monitor', selector: 'text=Energy Monitor' },
      { name: 'Devices', selector: 'text=Devices' },
      { name: 'Analytics', selector: 'text=Analytics' },
    ];
    
    for (const menu of menus) {
      const menuClickStartTime = Date.now();
      await page.click(menu.selector);
      await page.waitForLoadState('networkidle');
      const menuLoadTime = Date.now() - menuClickStartTime;
      
      console.log(`เวลาในการโหลดหน้า ${menu.name}: ${menuLoadTime}ms`);
      
      // ตรวจสอบว่าเวลาในการโหลดอยู่ในเกณฑ์ที่ยอมรับได้
      expect(menuLoadTime).toBeLessThan(3000); // ไม่ควรเกิน 3 วินาที
    }
  });
  
  test('ทดสอบการตอบสนองของ UI และแอนิเมชัน', async ({ page }) => {
    // เข้าสู่หน้า Dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // รอให้หน้า Dashboard โหลดสมบูรณ์
    await page.waitForLoadState('networkidle');
    
    // ทดสอบการเลื่อนหน้าจอ (scrolling)
    const scrollStartTime = Date.now();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(300); // รอให้การเลื่อนเสร็จสิ้น
    const scrollTime = Date.now() - scrollStartTime;
    
    console.log(`เวลาในการเลื่อนหน้าจอ: ${scrollTime}ms`);
    
    // ทดสอบการ hover เหนือองค์ประกอบที่มีเอฟเฟกต์ hover
    const cardElement = page.locator('.bg-white.dark\\:bg-gray-800').first();
    await expect(cardElement).toBeVisible();
    
    const hoverStartTime = Date.now();
    await cardElement.hover();
    await page.waitForTimeout(100); // รอให้เอฟเฟกต์ hover ทำงาน
    const hoverTime = Date.now() - hoverStartTime;
    
    console.log(`เวลาในการตอบสนองต่อการ hover: ${hoverTime}ms`);
    
    // ทดสอบการคลิกและการแสดงผล dropdown (ถ้ามี)
    const dropdownTrigger = page.locator('button:has-text("Settings")').first();
    if (await dropdownTrigger.isVisible()) {
      const dropdownClickStartTime = Date.now();
      await dropdownTrigger.click();
      await page.waitForTimeout(300); // รอให้ dropdown แสดงผล
      const dropdownTime = Date.now() - dropdownClickStartTime;
      
      console.log(`เวลาในการแสดงผล dropdown: ${dropdownTime}ms`);
      
      // ตรวจสอบว่าเวลาในการแสดงผล dropdown อยู่ในเกณฑ์ที่ยอมรับได้
      expect(dropdownTime).toBeLessThan(500); // ไม่ควรเกิน 500ms
    }
  });
});
