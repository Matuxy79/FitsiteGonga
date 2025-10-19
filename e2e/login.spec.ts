import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form by default', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome back');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign in');
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.blur('input[type="email"]');

    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('should validate password length', async ({ page }) => {
    await page.fill('input[type="password"]', '123');
    await page.blur('input[type="password"]');

    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
  });

  test('should switch to signup form', async ({ page }) => {
    await page.click("text=Don't have an account? Sign up");

    await expect(page.locator('h1')).toContainText('Create account');
    await expect(page.locator('input[placeholder="Confirm your password"]')).toBeVisible();
  });

  test('should handle login with wrong credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Login failed')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    await expect(passwordInput).toHaveAttribute('aria-invalid', 'false');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(emailInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
