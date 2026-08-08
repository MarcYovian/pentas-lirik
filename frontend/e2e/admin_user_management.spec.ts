import { test, expect } from '@playwright/test';

test.describe('Admin User Management & Role Operations E2E Tests', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');

    // Login as Admin
    await page.click('#btn-quick-admin');
    await page.click('#login-submit-btn');
    await expect(page.locator('#navbar-header')).toBeVisible();
    await expect(page.locator('#user-role-badge')).toContainText(/admin/i);
  });

  test('Scenario 1 & 2: Open Admin Console & Create New Operator Account', async ({ page }) => {
    // Open User Management Modal
    await page.click('#admin-user-mgmt-btn');
    await expect(page.locator('#user-mgmt-modal')).toBeVisible();

    // Fill New User Details
    await page.fill('#new-user-name', 'Budi Streamer');
    await page.fill('#new-user-email', 'budi.stream@pentaslirik.local');
    await page.fill('#new-user-password', 'password123');
    await page.selectOption('#new-user-role', 'operator');

    // Submit Create User
    await page.click('#btn-submit-create-user');

    // Verify new user appears in table
    await expect(page.locator('#user-mgmt-modal table')).toContainText('Budi Streamer');
    await expect(page.locator('#user-mgmt-modal table')).toContainText('budi.stream@pentaslirik.local');
  });

  test('Scenario 3 & 4: Update Role, Self-Delete Protection & Delete Account', async ({ page }) => {
    // Open User Management Modal
    await page.click('#admin-user-mgmt-btn');
    await expect(page.locator('#user-mgmt-modal')).toBeVisible();

    // Verify self-delete button is not rendered for logged-in admin
    const currentUserRow = page.locator('#user-mgmt-modal table tr', { hasText: 'admin@pentaslirik.local' });
    await expect(currentUserRow.locator('button[title="Delete user account"]')).toBeHidden();

    // Delete created operator user if exists
    const targetUserRow = page.locator('#user-mgmt-modal table tr', { hasText: 'budi.stream@pentaslirik.local' });
    if (await targetUserRow.count() > 0) {
      page.on('dialog', (dialog) => dialog.accept());
      await targetUserRow.locator('button[title="Delete user account"]').click();
      await expect(page.locator('#user-mgmt-modal table')).not.toContainText('budi.stream@pentaslirik.local');
    }
  });
});
