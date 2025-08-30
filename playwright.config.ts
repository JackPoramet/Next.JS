import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for UI testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // ชื่อของโปรเจค
  testDir: './tests',
  
  // จำนวน retry ในกรณีที่การทดสอบล้มเหลว
  retries: process.env.CI ? 2 : 0,
  
  // จำนวน worker ที่ทำงานพร้อมกัน
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter ที่ใช้รายงานผลการทดสอบ
  reporter: [
    ['html'],
    ['list']
  ],
  
  // ใช้ shared context ระหว่างการทดสอบหรือไม่
  use: {
    // Base URL ที่ใช้ในการทดสอบ
    baseURL: 'http://localhost:3000',
    
    // จับภาพหน้าจอเมื่อการทดสอบล้มเหลว
    screenshot: 'only-on-failure',
    
    // บันทึกวิดีโอเมื่อการทดสอบล้มเหลว
    video: 'on-first-retry',
    
    // จับภาพรวมของการทดสอบทั้งหมด
    trace: 'on-first-retry',
  },
  
  // กำหนดค่าเริ่มต้นและโปรเจค
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
  
  // Local development server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // เพิ่ม timeout สำหรับการเริ่มต้นเซิร์ฟเวอร์
  },
});
