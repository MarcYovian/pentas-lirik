import { test, expect } from '@playwright/test';

test.describe('Live Display Sync & Keyboard Shortcuts E2E Tests', () => {
  test('Scenario 1 & 2 & 3: Multi-Tab Sync, Shortcuts & Initial Reload Sync', async ({ context }) => {
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

    // Tab 2: OBS Display Layer Page
    const displayPage = await context.newPage();
    await displayPage.goto('/display');

    // Verify initial OBS display layer is empty/transparent
    await expect(displayPage.locator('#obs-display-canvas')).toBeVisible();
    await expect(displayPage.locator('#obs-lyric-container')).toBeHidden();

    // On Operator Tab: Select Song 1 in Column 1
    await operatorPage.click('#song-card-1');

    // Click the first lyric chunk button
    const firstChunkBtn = operatorPage.locator('#lyric-chunks-list button').first();
    await expect(firstChunkBtn).toBeVisible();
    await firstChunkBtn.click();

    // Verify Operator Tab shows LIVE ON AIR highlight
    await expect(operatorPage.locator('#live-status-action-bar')).toContainText('LIVE ON AIR');

    // Verify OBS Display Tab renders live text in lower-third
    await expect(displayPage.locator('#obs-lyric-container')).toBeVisible();
    await expect(displayPage.locator('#obs-lyric-text')).toContainText(/amazing grace/i);

    // Test Scenario 2: Keyboard Shortcut (Spacebar = Next Chunk)
    await operatorPage.bringToFront();
    await operatorPage.keyboard.press('Space');

    // Verify OBS Display Tab rendered next chunk
    await expect(displayPage.locator('#obs-lyric-text')).toContainText(/twas grace/i);

    // Test Keyboard Shortcut (Escape = Clear Screen)
    await operatorPage.keyboard.press('Escape');

    // Verify Operator Tab shows CLEAR
    await expect(operatorPage.locator('#live-status-action-bar')).toContainText('CLEAR');

    // Verify OBS Display Tab is clear
    await expect(displayPage.locator('#obs-lyric-container')).toBeHidden();

    // Test Scenario 3: Initial Reload Sync (FR-12)
    // Send a chunk again
    await firstChunkBtn.click();
    await expect(displayPage.locator('#obs-lyric-text')).toContainText(/amazing grace/i);

    // Reload OBS Display Page
    await displayPage.reload();

    // Verify instant recovery on reload without waiting for next event
    await expect(displayPage.locator('#obs-lyric-container')).toBeVisible();
    await expect(displayPage.locator('#obs-lyric-text')).toContainText(/amazing grace/i);
  });
});
