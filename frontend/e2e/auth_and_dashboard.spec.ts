import { test, expect } from '@playwright/test';

test.describe('Auth & Dashboard E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with clean session
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Scenario 1: Unauthenticated Redirect & Login Failure', async ({ page }) => {
    await page.goto('/');

    // Verify login card and input fields are visible
    await expect(page.locator('#login-card')).toBeVisible();
    await expect(page.locator('#login-email-input')).toBeVisible();
    await expect(page.locator('#login-password-input')).toBeVisible();

    // Fill incorrect credentials
    await page.fill('#login-email-input', 'wrong@domain.com');
    await page.fill('#login-password-input', 'wrongpassword');
    await page.click('#login-submit-btn');

    // Verify login error message appears
    await expect(page.locator('#login-error-alert')).toBeVisible();
    await expect(page.locator('#login-error-alert')).toContainText('Invalid login credentials');
  });

  test('Scenario 2: Quick Demo Login & Session Persistence Across Reload', async ({ page }) => {
    await page.goto('/');

    // Click Operator Quick Fill button
    await page.click('#btn-quick-operator');

    // Verify form fields are auto-filled
    await expect(page.locator('#login-email-input')).toHaveValue('operator@pentaslirik.local');
    await expect(page.locator('#login-password-input')).toHaveValue('password');

    // Submit login
    await page.click('#login-submit-btn');

    // Verify redirection to Dashboard
    await expect(page.locator('#navbar-header')).toBeVisible();
    await expect(page.locator('#user-name-display')).toContainText('Operator Live');
    await expect(page.locator('#user-role-badge')).toContainText(/operator/i);

    // Test page reload persistence
    await page.reload();

    // Verify session persists (user stays logged in)
    await expect(page.locator('#navbar-header')).toBeVisible();
    await expect(page.locator('#user-name-display')).toContainText('Operator Live');
  });

  test('Scenario 3: Dashboard 3-Column Navigation & Song Search Filtering', async ({ page }) => {
    // Login as operator
    await page.goto('/');
    await page.click('#btn-quick-operator');
    await page.click('#login-submit-btn');

    // Verify 3 columns are present
    await expect(page.locator('#column-song-library')).toBeVisible();
    await expect(page.locator('#column-setlist-rundown')).toBeVisible();
    await expect(page.locator('#column-live-control-panel')).toBeVisible();

    // Search song in Column 1
    await page.fill('#song-search-input', '10,000');
    await expect(page.locator('#song-list-container')).toContainText('10,000 Reasons');

    // Select setlist in Column 2 dropdown
    await expect(page.locator('#setlist-select-dropdown')).toBeVisible();
    await page.selectOption('#setlist-select-dropdown', '1');

    // Verify setlist rundown items loaded
    await expect(page.locator('#setlist-items-container')).toBeVisible();
  });
});
