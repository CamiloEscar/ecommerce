import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 1,
        name: 'Usuario Test'
      })
    );
  });
});

test('Agregar producto al carrito', async ({ page }) => {
  await page.goto('/products');

  await page.locator('.product-card button').first().click();

  await page.goto('/cart');

  const cartItem = page.locator('.cart-item');
  await expect(cartItem).toBeVisible();

  await page.screenshot({
    path: 'docs/screenshots/cart/cart.png',
    fullPage: true
  });
});
