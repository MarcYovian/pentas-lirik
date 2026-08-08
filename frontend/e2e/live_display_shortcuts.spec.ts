import { test, expect } from '@playwright/test';

test.describe('Live Display Sync & Keyboard Shortcuts E2E Tests', () => {
  test('Scenario 1 & 2 & 3: Multi-Tab Sync, Shortcuts & Initial Reload Sync', async ({ context, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }
    // Tab 1: Operator Panel
    const operatorPage = await context.newPage();
    await operatorPage.goto('/');

    // Clear session & login as operator
    await operatorPage.evaluate(() => localStorage.clear());
    await operatorPage.goto('/');
    await operatorPage.click('#btn-quick-operator');
    await operatorPage.click('#login-submit-btn');

    // Wait for Dashboard to load
    await expect(operatorPage.locator('#navbar-header')).toBeVisible();

    // Clear live screen state to start clean
    await operatorPage.keyboard.press('Escape');

    // Tab 2: OBS Display Layer Page
    const displayPage = await context.newPage();
    await displayPage.goto('/display');

    // Verify initial OBS display layer is empty/transparent
    await expect(displayPage.locator('#obs-display-canvas')).toBeVisible();

    // Bring Operator Page to front
    await operatorPage.bringToFront();

    // Select Amazing Grace in Column 1 (Song Library)
    const graceCard = operatorPage.locator('#song-list-container > div', { hasText: 'Amazing Grace' });
    await expect(graceCard).toBeVisible();
    await graceCard.click();
    await expect(operatorPage.locator('#active-song-banner')).toContainText('Amazing Grace');

    // Click first chunk button in Column 3
    const firstChunkBtn = operatorPage.locator('#lyric-chunks-list-desktop [id^="lyric-chunk-btn-"]').first();
    await expect(firstChunkBtn).toBeVisible({ timeout: 5000 });
    await firstChunkBtn.click();

    // Verify Operator Tab shows LIVE ON AIR highlight
    await expect(operatorPage.locator('#live-status-action-bar')).toContainText('LIVE ON AIR');

    // Verify OBS Display Tab renders live text in lower-third
    await displayPage.bringToFront();
    await displayPage.reload();
    await expect(displayPage.locator('#obs-lyric-text')).toBeVisible({ timeout: 5000 });
    await expect(displayPage.locator('#obs-lyric-text')).toContainText(/amazing grace/i);

    // Test Scenario 2: Keyboard Shortcut (Spacebar = Next Chunk)
    await operatorPage.bringToFront();
    await operatorPage.keyboard.press('Space');

    // Verify OBS Display Tab rendered next chunk
    await displayPage.bringToFront();
    await displayPage.reload();
    await expect(displayPage.locator('#obs-lyric-text')).toContainText(/twas grace/i, { timeout: 5000 });

    // Test Keyboard Shortcut (Escape = Clear Screen)
    await operatorPage.bringToFront();
    await operatorPage.keyboard.press('Escape');

    // Verify Operator Tab shows CLEAR
    await expect(operatorPage.locator('#live-status-action-bar')).toContainText('CLEAR');

    // Verify OBS Display Tab is clear
    await displayPage.bringToFront();
    await displayPage.reload();
    await expect(displayPage.locator('#obs-lyric-text')).toBeHidden({ timeout: 5000 });

    // Test Scenario 3: Initial Reload Sync (FR-12)
    // Send a chunk again
    await operatorPage.bringToFront();
    await firstChunkBtn.click();
    await displayPage.bringToFront();
    await displayPage.reload();
    await expect(displayPage.locator('#obs-lyric-text')).toBeVisible({ timeout: 5000 });
    await expect(displayPage.locator('#obs-lyric-text')).toContainText(/amazing grace/i, { timeout: 5000 });
  });
});
