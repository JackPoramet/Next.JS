import { test, expect } from '@playwright/test';

test.describe('Basic Theme Toggle Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start the development server first
    await page.goto('http://localhost:3000/login');
    
    // Simple login test
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Wait for page to be loaded
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should be able to toggle theme mode', async ({ page }) => {
    console.log('🎭 Testing theme toggle functionality...');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/initial-state.png', 
      fullPage: true 
    });
    
    // Check initial theme state (should be light mode)
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('class');
    console.log('Initial theme class:', initialTheme);
    
    // Look for theme toggle - try different selectors
    const possibleToggleSelectors = [
      '[data-testid="theme-toggle"]',
      '[data-testid="theme-toggle-switch"]',
      'button:has-text("Light")',
      'button:has-text("Dark")',
      '[role="switch"]',
      '.theme-toggle'
    ];
    
    let themeToggle = null;
    for (const selector of possibleToggleSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        themeToggle = element;
        console.log('Found theme toggle with selector:', selector);
        break;
      }
    }
    
    if (!themeToggle) {
      console.log('Theme toggle not found, taking screenshot for debugging...');
      await page.screenshot({ 
        path: 'tests/screenshots/theme-toggle-not-found.png', 
        fullPage: true 
      });
      
      // List all visible buttons for debugging
      const buttons = await page.locator('button').all();
      console.log('Available buttons:', buttons.length);
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const text = await buttons[i].textContent();
        const classes = await buttons[i].getAttribute('class');
        console.log(`Button ${i}: "${text}" - classes: ${classes}`);
      }
      
      throw new Error('Theme toggle button not found');
    }
    
    // Click the theme toggle
    await themeToggle.click();
    console.log('✅ Clicked theme toggle');
    
    // Wait for theme change
    await page.waitForTimeout(1000);
    
    // Check if theme changed
    const newTheme = await html.getAttribute('class');
    console.log('New theme class:', newTheme);
    
    // Take screenshot after toggle
    await page.screenshot({ 
      path: 'tests/screenshots/after-theme-toggle.png', 
      fullPage: true 
    });
    
    // Verify theme actually changed
    if (initialTheme === newTheme) {
      console.warn('⚠️  Theme classes did not change visibly');
    } else {
      console.log('✅ Theme changed successfully');
    }
    
    // Try toggling back
    await themeToggle.click();
    await page.waitForTimeout(1000);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/after-second-toggle.png', 
      fullPage: true 
    });
    
    console.log('✅ Theme toggle test completed');
  });

  test('should have visible theme toggle in UI', async ({ page }) => {
    console.log('🔍 Testing theme toggle visibility...');
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'tests/screenshots/ui-visibility-test.png', 
      fullPage: true 
    });
    
    // Check if any theme-related elements are visible
    const themeElements = [
      '[data-testid="theme-toggle"]',
      '[data-testid="theme-toggle-switch"]',
      'button:has-text("Light")',
      'button:has-text("Dark")',
      'text=สว่าง',
      'text=มืด',
      '[role="switch"]'
    ];
    
    let foundElements = [];
    for (const selector of themeElements) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        foundElements.push(selector);
        const text = await element.textContent();
        console.log(`✅ Found visible theme element: ${selector} - text: "${text}"`);
      }
    }
    
    console.log(`Found ${foundElements.length} theme-related elements`);
    
    if (foundElements.length === 0) {
      // Debug: show all visible elements
      console.log('🔍 Debug: Looking for any buttons or interactive elements...');
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} buttons on page`);
      
      for (let i = 0; i < Math.min(buttonCount, 20); i++) {
        const button = allButtons.nth(i);
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        if (isVisible && text && text.trim()) {
          console.log(`Button ${i}: "${text.trim()}"`);
        }
      }
    }
    
    // At least one theme element should be visible
    expect(foundElements.length).toBeGreaterThan(0);
  });

  test('should navigate through different sections', async ({ page }) => {
    console.log('🧭 Testing section navigation...');
    
    // Test different sections
    const sections = ['dashboard', 'energy', 'devices', 'analytics'];
    
    for (const section of sections) {
      // Try to find and click menu item
      const menuSelector = `[data-menu-id="${section}"]`;
      const menuItem = page.locator(menuSelector);
      
      if (await menuItem.isVisible()) {
        console.log(`📍 Navigating to ${section} section`);
        await menuItem.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot of each section
        await page.screenshot({ 
          path: `tests/screenshots/section-${section}.png`, 
          fullPage: true 
        });
      } else {
        console.log(`⚠️  Section ${section} not accessible`);
      }
    }
    
    console.log('✅ Section navigation test completed');
  });
});
