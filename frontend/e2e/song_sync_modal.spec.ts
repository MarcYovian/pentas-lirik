import { test, expect } from '@playwright/test';

test.describe('Song Sync Cloud E2E Tests', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.click('#btn-quick-operator');
    await page.click('#login-submit-btn');
    await expect(page.locator('#navbar-header')).toBeVisible();
  });

  test('Scenario: Open Sync Modal, switch auth modes, select conflict strategies, and close', async ({ page }) => {
    // 1. Verify "Sync Cloud" button is visible in Song Library header
    const syncBtn = page.locator('#btn-open-sync-modal');
    await expect(syncBtn).toBeVisible();
    await syncBtn.click();

    // 2. Verify Sync Modal overlay is displayed
    const modalOverlay = page.locator('#modal-sync-songs-overlay');
    await expect(modalOverlay).toBeVisible();
    await expect(page.locator('#modal-sync-songs-container')).toContainText('Tarik Lagu dari VPS Cloud');

    // 3. Fill Remote URL
    await page.fill('#input-sync-remote-url', 'https://pentas.staging.example.com');

    // 4. Test Auth Mode Toggle
    await expect(page.locator('#input-sync-email')).toBeVisible();
    await expect(page.locator('#input-sync-password')).toBeVisible();

    await page.click('#tab-auth-token');
    await expect(page.locator('#input-sync-api-token')).toBeVisible();
    await expect(page.locator('#input-sync-email')).toBeHidden();

    await page.click('#tab-auth-login');
    await expect(page.locator('#input-sync-email')).toBeVisible();

    // 5. Test Conflict Strategy Selection
    const overwriteCard = page.locator('#card-strategy-overwrite');
    await overwriteCard.click();
    await expect(overwriteCard.locator('input[type="radio"]')).toBeChecked();

    const skipCard = page.locator('#card-strategy-skip');
    await skipCard.click();
    await expect(skipCard.locator('input[type="radio"]')).toBeChecked();

    // 6. Close Modal
    await page.click('#btn-close-sync-modal');
    await expect(modalOverlay).toBeHidden();
  });
});
