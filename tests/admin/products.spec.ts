import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Mock de sesión ADMIN
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-admin-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 1,
        name: 'Admin Test',
        role: 'admin'
      })
    );
  });
});

test('Admin productos', async ({ page }) => {
  await page.goto('/admin/products');

  // ⬇️ Selector ESTABLE (ajustá el texto si cambia)
  const title = page.locator('h1, h2', { hasText: /producto/i });
  await expect(title).toBeVisible();

  // Screenshot para documentación
  await page.screenshot({
    path: 'docs/screenshots/admin/products.png',
    fullPage: true
  });
});
