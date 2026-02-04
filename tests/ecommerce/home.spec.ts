import { test, expect } from '@playwright/test';

test('Home ecommerce', async ({ page }) => {
  await page.goto('/');

  await page.waitForLoadState('networkidle');

  await page.screenshot({
    path: 'docs/screenshots/ecommerce/home.png',
    fullPage: true,
  });

  await expect(page.locator('.product-card').first()).toBeVisible();
});
