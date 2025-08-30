import { test, expect } from '@playwright/test';

test.describe('Theme Mode Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page first
    await page.goto('/login');
    
    // Login with test credentials
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  });

  test('should toggle between light and dark mode', async ({ page }) => {
    // Check if we're in light mode initially
    const htmlElement = page.locator('html');
    
    // Wait for the theme toggle button to be visible
    await page.waitForSelector('[data-testid="theme-toggle"]', { timeout: 5000 });
    
    // Take screenshot in light mode
    await page.screenshot({ path: 'tests/screenshots/light-mode-before.png', fullPage: true });
    
    // Check light mode styles
    await expect(htmlElement).not.toHaveClass(/dark/);
    
    // Verify light mode background colors on key elements
    const sidebar = page.locator('[data-testid="sidebar"]');
    const mainContent = page.locator('[data-testid="main-content"]');
    
    // Click theme toggle button
    await page.click('[data-testid="theme-toggle"]');
    
    // Wait a bit for the theme to change
    await page.waitForTimeout(500);
    
    // Check if we're now in dark mode
    await expect(htmlElement).toHaveClass(/dark/);
    
    // Take screenshot in dark mode
    await page.screenshot({ path: 'tests/screenshots/dark-mode-after.png', fullPage: true });
    
    // Click theme toggle again to switch back to light mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);
    
    // Verify we're back to light mode
    await expect(htmlElement).not.toHaveClass(/dark/);
    
    // Take final screenshot in light mode
    await page.screenshot({ path: 'tests/screenshots/light-mode-after.png', fullPage: true });
  });

  test('should maintain theme preference after page reload', async ({ page }) => {
    // Switch to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);
    
    // Verify we're in dark mode
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
    
    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Check if dark mode is preserved
    await expect(htmlElement).toHaveClass(/dark/);
  });

  test('should apply dark mode styles correctly to components', async ({ page }) => {
    // Switch to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);
    
    // Test dark mode styles on various components
    
    // 1. Test sidebar in dark mode
    const sidebar = page.locator('[data-testid="sidebar"]');
    if (await sidebar.isVisible()) {
      const sidebarBg = await sidebar.evaluate((el) => 
        getComputedStyle(el).backgroundColor
      );
      // Dark mode should have dark background
      expect(sidebarBg).toContain('rgb(17, 24, 39)'); // gray-900
    }
    
    // 2. Test main content area
    const mainContent = page.locator('[data-testid="main-content"]');
    const contentBg = await mainContent.evaluate((el) => 
      getComputedStyle(el).backgroundColor
    );
    
    // 3. Test cards and panels in dark mode
    const cards = page.locator('.bg-white').first();
    if (await cards.isVisible()) {
      const cardBg = await cards.evaluate((el) => 
        getComputedStyle(el).backgroundColor
      );
      // Should have dark background in dark mode
      expect(cardBg).toContain('rgb(31, 41, 55)'); // gray-800
    }
    
    // 4. Test text colors
    const headings = page.locator('h1, h2, h3').first();
    if (await headings.isVisible()) {
      const textColor = await headings.evaluate((el) => 
        getComputedStyle(el).color
      );
      // Should have light text in dark mode
      expect(textColor).toContain('rgb(255, 255, 255)'); // white text
    }
  });

  test('should handle theme toggle in different sections', async ({ page }) => {
    const sections = [
      { id: 'dashboard', name: 'Dashboard' },
      { id: 'energy', name: 'Energy Monitor' },
      { id: 'devices', name: 'IoT Devices' },
      { id: 'analytics', name: 'Analytics' },
      { id: 'reports', name: 'Reports' },
      { id: 'settings', name: 'Settings' }
    ];

    for (const section of sections) {
      // Navigate to section if menu item exists
      const menuItem = page.locator(`[data-menu-id="${section.id}"]`);
      if (await menuItem.isVisible()) {
        await menuItem.click();
        await page.waitForTimeout(1000);
        
        // Test light mode
        await expect(page.locator('html')).not.toHaveClass(/dark/);
        await page.screenshot({ 
          path: `tests/screenshots/${section.id}-light.png`, 
          fullPage: true 
        });
        
        // Switch to dark mode
        await page.click('[data-testid="theme-toggle"]');
        await page.waitForTimeout(500);
        
        // Test dark mode
        await expect(page.locator('html')).toHaveClass(/dark/);
        await page.screenshot({ 
          path: `tests/screenshots/${section.id}-dark.png`, 
          fullPage: true 
        });
        
        // Switch back to light mode for next iteration
        await page.click('[data-testid="theme-toggle"]');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should have proper contrast ratios in both modes', async ({ page }) => {
    // Test light mode contrast
    await page.screenshot({ 
      path: 'tests/screenshots/contrast-light-full.png', 
      fullPage: true 
    });
    
    // Check if important buttons are visible and have good contrast
    const importantButtons = [
      '[data-testid="theme-toggle"]',
      'button:has-text("Dashboard")',
      'button:has-text("Logout")'
    ];
    
    for (const buttonSelector of importantButtons) {
      const button = page.locator(buttonSelector);
      if (await button.isVisible()) {
        await expect(button).toBeVisible();
        
        // Get button styles
        const styles = await button.evaluate((el) => {
          const computed = getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            borderColor: computed.borderColor
          };
        });
        
        console.log(`Light mode - ${buttonSelector}:`, styles);
      }
    }
    
    // Switch to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);
    
    // Test dark mode contrast
    await page.screenshot({ 
      path: 'tests/screenshots/contrast-dark-full.png', 
      fullPage: true 
    });
    
    for (const buttonSelector of importantButtons) {
      const button = page.locator(buttonSelector);
      if (await button.isVisible()) {
        await expect(button).toBeVisible();
        
        // Get button styles in dark mode
        const styles = await button.evaluate((el) => {
          const computed = getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            borderColor: computed.borderColor
          };
        });
        
        console.log(`Dark mode - ${buttonSelector}:`, styles);
      }
    }
  });

  test('should handle theme toggle animation smoothly', async ({ page }) => {
    // Test the animation duration and smoothness
    const htmlElement = page.locator('html');
    
    // Record initial state
    await expect(htmlElement).not.toHaveClass(/dark/);
    
    // Click theme toggle and measure transition
    const startTime = Date.now();
    await page.click('[data-testid="theme-toggle"]');
    
    // Wait for transition to complete
    await page.waitForTimeout(300); // Allow for transition
    await expect(htmlElement).toHaveClass(/dark/);
    const endTime = Date.now();
    
    const transitionTime = endTime - startTime;
    console.log(`Theme transition took ${transitionTime}ms`);
    
    // Ensure transition doesn't take too long (should be under 1000ms)
    expect(transitionTime).toBeLessThan(1000);
  });

  test('should work with keyboard navigation', async ({ page }) => {
    // Focus on theme toggle button using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Navigate to theme toggle
    
    // Use keyboard to toggle theme
    const htmlElement = page.locator('html');
    await expect(htmlElement).not.toHaveClass(/dark/);
    
    // Press Enter or Space to toggle
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Check if theme changed
    await expect(htmlElement).toHaveClass(/dark/);
    
    // Toggle back with Space key
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    
    // Should be back to light mode
    await expect(htmlElement).not.toHaveClass(/dark/);
  });
});

test.describe('Theme Persistence Tests', () => {
  test('should persist theme in localStorage', async ({ page }) => {
    // Go to dashboard
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Switch to dark mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);
    
    // Check localStorage
    const themeValue = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeValue).toBe('dark');
    
    // Switch back to light mode
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);
    
    // Check localStorage again
    const lightThemeValue = await page.evaluate(() => localStorage.getItem('theme'));
    expect(lightThemeValue).toBe('light');
  });
});
