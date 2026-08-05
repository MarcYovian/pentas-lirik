import { test, expect } from '@playwright/test';

test.describe('Song CRUD & Lyric Parsing E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.click('#btn-quick-operator');
    await page.click('#login-submit-btn');
    await expect(page.locator('#navbar-header')).toBeVisible();
  });

  test('Scenario 1: Create New Song with Real-Time Chunk Parsing', async ({ page }) => {
    // Open New Song Modal
    await page.click('#btn-add-new-song');
    await expect(page.locator('#song-modal-overlay')).toBeVisible();

    // Fill Song Details
    await page.fill('#song-title-input', 'Kemenangan Harapan');
    await page.fill('#song-artist-input', 'Pentas Music');

    // Type multi-line raw lyrics with tags
    const rawLyrics = `[VERSE 1]\nDi dalam gelap terang-Mu bersinar\nPengharapan kekal tak terbantahkan\n\n[CHORUS]\nKau Kemenanganku penyelamatku\nSorak kemenangan bergema selamanya`;
    await page.fill('#song-lyrics-textarea', rawLyrics);

    // Verify Real-time Chunk Parsing Preview
    await expect(page.locator('#lyrics-parsed-preview')).toContainText('[VERSE 1]');
    await expect(page.locator('#lyrics-parsed-preview')).toContainText('[CHORUS]');

    // Save Song
    await page.click('#save-song-btn');

    // Verify Modal Closed and New Song appears in Library
    await expect(page.locator('#song-modal-overlay')).toBeHidden();
    await expect(page.locator('#song-list-container')).toContainText('Kemenangan Harapan');
  });

  test('Scenario 2 & 4: Edit Song Lyrics & Delete Song with Confirmation', async ({ page }) => {
    // Search created or existing song
    await page.fill('#song-search-input', 'Amazing Grace');
    await expect(page.locator('#song-card-1')).toBeVisible();

    // Click Edit Song Button
    await page.click('#btn-edit-song-1');
    await expect(page.locator('#song-modal-overlay')).toBeVisible();

    // Update Title
    await page.fill('#song-title-input', 'Amazing Grace (My Chains Are Gone)');

    // Save Update
    await page.click('#save-song-btn');
    await expect(page.locator('#song-modal-overlay')).toBeHidden();
    await expect(page.locator('#song-card-1')).toContainText('Amazing Grace');

    // Test Delete Song Flow
    await page.click('#btn-edit-song-1');
    await page.click('#delete-song-btn');

    // Confirm Deletion
    await expect(page.locator('#confirm-delete-song-btn')).toBeVisible();
    await page.click('#confirm-delete-song-btn');

    // Verify Song Deleted
    await expect(page.locator('#song-card-1')).toBeHidden();
  });

  test('Scenario 3: Switching Active Songs in Live Control Panel', async ({ page }) => {
    // Click Song 2 in Library
    await page.click('#song-card-2');

    // Verify Live Control Panel updates active song banner
    await expect(page.locator('#active-song-banner')).toContainText('10,000 Reasons');
    await expect(page.locator('#lyric-chunks-list')).toContainText('[CHORUS]');

    // Click Song 3 in Library
    await page.click('#song-card-3');

    // Verify Live Control Panel dynamically switches to Song 3
    await expect(page.locator('#active-song-banner')).toContainText('What A Beautiful Name');
  });
});
