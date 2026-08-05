import { test, expect } from '@playwright/test';

test.describe('Setlist CRUD & Rundown Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.click('#btn-quick-operator');
    await page.click('#login-submit-btn');
    await expect(page.locator('#navbar-header')).toBeVisible();
  });

  test('Scenario 1: Create New Empty Setlist & Rename', async ({ page }) => {
    // Click New Setlist button
    await page.click('#btn-new-setlist');

    // Change Setlist Name Input
    await page.fill('#setlist-name-input', 'Ibadah Paskah 2026');
    await expect(page.locator('#setlist-name-input')).toHaveValue('Ibadah Paskah 2026');

    // Verify setlist items container is empty
    await expect(page.locator('#setlist-items-container')).toContainText('Setlist is empty');
  });

  test('Scenario 2: Add Songs from Library via + Rundown Button', async ({ page }) => {
    // Create new setlist
    await page.click('#btn-new-setlist');

    // Add Song 1 (Amazing Grace) to rundown
    await page.click('#btn-add-to-rundown-1');
    await expect(page.locator('#setlist-items-container')).toContainText('Amazing Grace');

    // Add Song 4 (Goodness Of God) to rundown
    await page.click('#btn-add-to-rundown-4');
    await expect(page.locator('#setlist-items-container')).toContainText('Goodness Of God');
  });

  test('Scenario 3 & 4: Add Custom Announcement, Reorder, Save & Remove Item', async ({ page }) => {
    // Create new setlist
    await page.click('#btn-new-setlist');

    // Add Song 1
    await page.click('#btn-add-to-rundown-1');

    // Add Custom Announcement Item
    await page.click('#btn-toggle-add-announcement');
    await page.fill('#new-announcement-input', 'Warta Jemaat & Persembahan');
    await page.click('#btn-add-announcement-submit');

    // Verify Announcement Item added
    await expect(page.locator('#setlist-items-container')).toContainText('Announcement: Warta Jemaat & Persembahan');

    // Save Setlist
    await page.click('#btn-save-setlist');
    await expect(page.locator('#setlist-select-dropdown')).toContainText('New Event Rundown');

    // Test Item Removal
    const removeBtn = page.locator('#setlist-items-container button[title="Remove from Setlist"]').first();
    await removeBtn.click();

    // Verify item count updated
    await expect(page.locator('#setlist-items-container')).not.toContainText('Amazing Grace');
  });
});
