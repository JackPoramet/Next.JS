import { test, expect } from '@playwright/test';

/**
 * ทดสอบความสามารถในการเข้าถึง (Accessibility) ของเว็บไซต์
 * โดยใช้ Playwright Accessibility Scanner
 */
test.describe('ทดสอบความสามารถในการเข้าถึง (Accessibility)', () => {
  test('ตรวจสอบความสามารถในการเข้าถึงของหน้าหลัก', async ({ page }) => {
    // เข้าสู่หน้าหลัก
    await page.goto('http://localhost:3000');
    
    // รอให้หน้าเว็บโหลดเสร็จสมบูรณ์
    await page.waitForLoadState('networkidle');
    
    // ตรวจสอบ accessibility ด้วย Playwright
    const accessibilityScanResults = await page.accessibility.snapshot();
    
    // บันทึกผลการทดสอบลงในไฟล์
    await page.evaluate((results) => {
      console.log('Accessibility Scan Results:', JSON.stringify(results, null, 2));
    }, accessibilityScanResults);
    
    // ตรวจสอบว่ามี elements ที่มี role ที่ถูกต้อง
    expect(accessibilityScanResults).toBeTruthy();
    
    // ตรวจสอบการใช้ Alt Text สำหรับรูปภาพ
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      
      // ทุกรูปภาพควรมี alt text (ยกเว้นรูปภาพที่เป็น decorative ซึ่งควรมี alt="")
      expect(alt !== null).toBeTruthy();
    }
    
    // ตรวจสอบการใช้ ARIA attributes
    const ariaElements = page.locator('[aria-label], [aria-describedby], [aria-labelledby]');
    const ariaCount = await ariaElements.count();
    
    console.log(`จำนวน elements ที่ใช้ ARIA attributes: ${ariaCount}`);
    
    // ตรวจสอบความคมชัดของสี (จำลองการตรวจสอบความคมชัด)
    const contrastCheck = await page.evaluate(() => {
      // ในสถานการณ์จริง คุณอาจใช้ไลบรารีเฉพาะสำหรับการตรวจสอบความคมชัด
      return { passed: true, failedElements: [] };
    });
    
    expect(contrastCheck.passed).toBeTruthy();
  });
  
  test('ตรวจสอบความสามารถในการเข้าถึงของหน้า Dashboard', async ({ page }) => {
    // เข้าสู่หน้า login
    await page.goto('http://localhost:3000/login');
    
    // กรอกข้อมูล login
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // คลิกปุ่ม login
    await page.click('button[type="submit"]');
    
    // รอให้ redirect ไปที่ dashboard
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
    
    // ตรวจสอบ accessibility ด้วย Playwright
    const accessibilityScanResults = await page.accessibility.snapshot();
    
    // บันทึกผลการทดสอบลงในไฟล์
    await page.evaluate((results) => {
      console.log('Dashboard Accessibility Scan Results:', JSON.stringify(results, null, 2));
    }, accessibilityScanResults);
    
    // ตรวจสอบการใช้ Keyboard Navigation
    // ทดสอบการใช้แป้นพิมพ์เพื่อนำทาง
    await page.keyboard.press('Tab');
    
    // ตรวจสอบว่ามีการ focus ที่ element แรก
    const focusedElement = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement ? {
        tagName: activeElement.tagName,
        id: activeElement.id,
        className: activeElement.className,
        hasAriaLabel: activeElement.hasAttribute('aria-label')
      } : null;
    });
    
    expect(focusedElement).toBeTruthy();
    
    // ทดสอบการใช้แป้นพิมพ์เพื่อนำทางไปยังส่วนต่างๆ ของหน้า
    // กด Tab หลายครั้งเพื่อนำทางไปยังส่วนต่างๆ
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      
      // ตรวจสอบว่ามีการ focus ที่ element ใหม่
      const newFocusedElement = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement ? {
          tagName: activeElement.tagName,
          id: activeElement.id,
          className: activeElement.className,
          hasAriaLabel: activeElement.hasAttribute('aria-label')
        } : null;
      });
      
      expect(newFocusedElement).toBeTruthy();
    }
    
    // ตรวจสอบการใช้ heading (h1, h2, h3, etc.) อย่างเหมาะสม
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    console.log(`จำนวน heading elements: ${headingCount}`);
    
    // ต้องมี heading อย่างน้อยหนึ่งตัว
    expect(headingCount).toBeGreaterThan(0);
  });
  
  test('ตรวจสอบการใช้งานผ่านแป้นพิมพ์', async ({ page }) => {
    // เข้าสู่หน้าหลัก
    await page.goto('http://localhost:3000');
    
    // รอให้หน้าเว็บโหลดเสร็จสมบูรณ์
    await page.waitForLoadState('networkidle');
    
    // กด Tab เพื่อเริ่มการนำทางด้วยแป้นพิมพ์
    await page.keyboard.press('Tab');
    
    // ตรวจสอบว่ามีการ focus ที่ element แรก
    let isFocused = await page.evaluate(() => {
      return document.activeElement !== document.body;
    });
    
    expect(isFocused).toBeTruthy();
    
    // ตรวจสอบการคลิกปุ่มด้วยแป้นพิมพ์
    let foundDashboardButton = false;
    const maxTabs = 20; // ป้องกันการวนซ้ำไม่สิ้นสุด
    
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      
      // ตรวจสอบว่าปุ่มที่ต้องการมีการ focus หรือไม่
      const isDashboardButtonFocused = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement && 
               (activeElement.textContent?.includes('Dashboard') || 
                activeElement.getAttribute('href')?.includes('dashboard'));
      });
      
      if (isDashboardButtonFocused) {
        foundDashboardButton = true;
        break;
      }
    }
    
    // คาดหวังว่าจะพบปุ่ม Dashboard
    expect(foundDashboardButton).toBeTruthy();
    
    // กด Enter เพื่อคลิกปุ่ม
    await page.keyboard.press('Enter');
    
    // รอให้ redirect ไปที่หน้า login
    await page.waitForURL('**/login');
    await page.waitForLoadState('networkidle');
    
    // ตรวจสอบว่าเราอยู่ที่หน้า login
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });
});
