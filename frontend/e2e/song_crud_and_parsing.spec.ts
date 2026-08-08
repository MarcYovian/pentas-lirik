import { test, expect } from '@playwright/test';

test.describe('Song CRUD & Lyric Parsing E2E Tests', () => {
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
    // Open New Song Modal to create temp song for editing and deletion
    await page.click('#btn-add-new-song');
    await page.fill('#song-title-input', 'Temp Song To Delete');
    await page.fill('#song-artist-input', 'Temp Artist');
    await page.fill('#song-lyrics-textarea', '[VERSE 1]\nTemp Lyric Content');
    await page.click('#save-song-btn');
    await expect(page.locator('#song-modal-overlay')).toBeHidden();

    // Search created song
    await page.fill('#song-search-input', 'Temp Song');
    const songCard = page.locator('#song-list-container > div', { hasText: 'Temp Song To Delete' });
    await expect(songCard).toBeVisible();

    // Click Edit Song Button
    await songCard.locator('button[title="Edit Song"]').click();
    await expect(page.locator('#song-modal-overlay')).toBeVisible();

    // Update Title
    await page.fill('#song-title-input', 'Temp Song Updated');

    // Save Update
    await page.click('#save-song-btn');
    await expect(page.locator('#song-modal-overlay')).toBeHidden();

    // Test Delete Song Flow
    const updatedCard = page.locator('#song-list-container > div', { hasText: 'Temp Song Updated' });
    await updatedCard.locator('button[title="Edit Song"]').click();
    await page.click('#delete-song-btn');

    // Confirm Deletion
    await expect(page.locator('#confirm-delete-song-btn')).toBeVisible();
    await page.click('#confirm-delete-song-btn');

    // Verify Song Deleted
    await expect(page.locator('#song-list-container')).not.toContainText('Temp Song Updated');
  });

  test('Scenario 3: Switching Active Songs in Live Control Panel', async ({ page }) => {
    // Search 10,000 Reasons
    await page.fill('#song-search-input', '10,000');
    const card2 = page.locator('[id^="song-card-"]', { hasText: '10,000 Reasons' }).first();
    await card2.locator('h3').click();

    // Verify Live Control Panel updates active song banner
    await expect(page.locator('#active-song-banner').first()).toContainText('10,000 Reasons');
    await expect(page.locator('#lyric-chunks-list-desktop').first()).toContainText('[CHORUS]');

    // Search What A Beautiful Name
    await page.fill('#song-search-input', 'Beautiful');
    const card3 = page.locator('[id^="song-card-"]', { hasText: 'What A Beautiful Name' }).first();
    await card3.locator('h3').click();

    // Verify Live Control Panel dynamically switches
    await expect(page.locator('#active-song-banner').first()).toContainText('What A Beautiful Name');
  });
});
