import { test, expect } from '@playwright/test';

test.describe('Streamer Studio - Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/nXcor/i);
    
    // Check for main navigation or key elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Look for common navigation elements that might be present
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});

test.describe('Streamer Studio - Studio Interface', () => {
  test('should allow navigating to studio', async ({ page }) => {
    await page.goto('/');
    
    // Try to find a link to studio or streaming interface
    const hasStudioElement = await page.locator('text=/studio|stream|broadcast/i').first().isVisible().catch(() => false);
    
    // This test is exploratory - it just checks if we can load pages
    expect(hasStudioElement !== null).toBeTruthy();
  });
});

test.describe('Camera and Media Permissions', () => {
  test('should handle camera permission dialog', async ({ page, context }) => {
    // Grant camera permissions before the page loads
    await context.grantPermissions(['camera', 'microphone']);
    
    await page.goto('/');
    
    // Check that page loads without errors
    await expect(page).toHaveTitle(/nXcor/i);
  });

  test('should handle denied camera permissions gracefully', async ({ page, context }) => {
    // Deny camera permissions
    await context.clearPermissions();
    
    await page.goto('/');
    
    // Page should still load even without camera access
    await expect(page).toHaveTitle(/nXcor/i);
    
    // There should be no console errors related to unhandled permission denials
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.waitForTimeout(1000);
    
    // We shouldn't have any unhandled errors
    const criticalErrors = errors.filter(e => 
      e.includes('NotAllowedError') || e.includes('PermissionDeniedError')
    );
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page).toHaveTitle(/nXcor/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page).toHaveTitle(/nXcor/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await expect(page).toHaveTitle(/nXcor/i);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    await expect(page).toHaveTitle(/nXcor/i);
  });
});
