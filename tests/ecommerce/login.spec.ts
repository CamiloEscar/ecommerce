import { test, expect } from '@playwright/test';

test('Login ecommerce real', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[type=email]', 'test@test.com');
  await page.fill('input[type=password]', '123456');

  const submitBtn = page.locator('button[type=submit]');
  await expect(submitBtn).toBeVisible();

  // SUBMIT del form (no click → evita problemas de viewport en Angular)
  await submitBtn.evaluate(btn => btn.closest('form')!.submit());

  await page.waitForLoadState('networkidle');

  // Screenshot para documentación
  await page.screenshot({
    path: 'docs/screenshots/login/after-login.png',
    fullPage: true
  });
});
