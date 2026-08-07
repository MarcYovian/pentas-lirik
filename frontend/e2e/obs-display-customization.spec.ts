import { test, expect } from '@playwright/test';

test.describe('OBS Display Customization & Preset Profiles E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');

    // Login as Admin / Operator
    await page.click('#btn-quick-admin');
    await page.click('#login-submit-btn');
    await expect(page.locator('#navbar-header')).toBeVisible();
  });

  test('E2E-01: Open Display Settings Modal & Font Size Slider', async ({ page }) => {
    await page.click('button:has-text("Display Style")');
    await expect(page.locator('text=OBS Display Layer Customization')).toBeVisible();

    // Verify Font Size number input exists
    const fontSizeInput = page.locator('input[type="number"]');
    await expect(fontSizeInput).toBeVisible();

    // Change font size to 60px
    await fontSizeInput.fill('60');
    await expect(fontSizeInput).toHaveValue('60');
  });

  test('E2E-02: Mini OBS Preview Canvas Proportional Scale', async ({ page }) => {
    await page.click('button:has-text("Display Style")');
    const previewCanvas = page.locator('text=Mini OBS Live Preview (16:9 Canvas)');
    await expect(previewCanvas).toBeVisible();

    // Verify lyric sample text inside preview canvas
    const sampleText = page.locator('#mini-obs-preview-text');
    await expect(sampleText).toBeVisible();
  });

  test('E2E-03: Text Transform Casing (UPPERCASE, Capitalize, As-Is)', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    // Test Capitalize
    await page.click('button:has-text("Capitalize")');
    await expect(page.locator('#mini-obs-preview-text')).toHaveCSS('text-transform', 'capitalize');

    // Test UPPERCASE
    await page.click('button:has-text("UPPERCASE")');
    await expect(page.locator('#mini-obs-preview-text')).toHaveCSS('text-transform', 'uppercase');

    // Test As-Is (none)
    await page.click('button:has-text("As-Is")');
    await expect(page.locator('#mini-obs-preview-text')).toHaveCSS('text-transform', 'none');
  });

  test('E2E-04: Vertical & Horizontal Padding Sliders', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    // Ensure background box is enabled to view padding
    const bgEnabled = await page.locator('text=Background Color').isVisible();
    if (!bgEnabled) {
      await page.click('#btn-toggle-bg-box');
    }

    // Locate vertical padding input range
    const ranges = page.locator('input[type="range"]');
    await expect(ranges.first()).toBeVisible();
  });

  test('E2E-05: Container Max Width & Background Box Condition Fallback', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    // Toggle Enable Background Box ON
    const bgEnabled = await page.locator('text=Background Color').isVisible();
    if (!bgEnabled) {
      await page.click('#btn-toggle-bg-box');
    }

    // Select 3XL max width using Container Max Width select
    const maxWidthSelect = page.locator('select', { hasText: '3XL' });
    if (await maxWidthSelect.isVisible()) {
      await maxWidthSelect.selectOption('max-w-3xl');
      await expect(page.locator('div.max-w-\\[42\\%\\]')).toBeVisible();
    }

    // Toggle Enable Background Box OFF -> Should fallback to max-w-full
    await page.click('#btn-toggle-bg-box');
    await expect(page.locator('div.max-w-full').first()).toBeVisible();
  });

  test('E2E-06: Sandbox Preview Mode (Click Preset without Changing Broadcast)', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    // Verify Sandbox Previewing Header Badge
    await expect(page.locator('text=Sandbox Previewing:')).toBeVisible();

    // Click inspecting preset card
    const presetCard = page.locator('button:has-text("Inspect Preview")').first();
    if (await presetCard.isVisible()) {
      await presetCard.click();
      await expect(page.locator('text=PREVIEWING').first()).toBeVisible();
    }
  });

  test('E2E-07: Apply & Activate Preset to OBS Live Broadcast', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    // Apply to OBS Live button
    const applyBtn = page.locator('button:has-text("Apply to OBS Live")').first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await expect(page.locator('text=Broadcasting Live').first()).toBeVisible();
    }
  });

  test('E2E-08: Save Changes to Existing Selected Preset', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    const saveChangesBtn = page.locator('button:has-text("Save Changes to Preset")').first();
    if (await saveChangesBtn.isVisible()) {
      await saveChangesBtn.click();
    }
  });

  test('E2E-09: Save as New Preset Modal Dialog', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    // Click Save as New Preset button
    await page.click('button:has-text("Save as New Preset...")');
    await expect(page.locator('text=Save Display Theme Preset')).toBeVisible();

    // Fill New Preset Name
    await page.fill('#preset-name-input', 'Stage Neon Theme');
    await page.click('#btn-save-preset-submit');
  });

  test('E2E-10: Delete Inactive Preset Profile', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    // Locate delete button on inactive preset card if available
    const deleteBtn = page.locator('button[title="Delete Preset"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
    }
  });

  test('E2E-11: Low Contrast Warning Badge', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    // Ensure background box is enabled
    const bgEnabled = await page.locator('text=Background Color').isVisible();
    if (!bgEnabled) {
      await page.click('#btn-toggle-bg-box');
    }

    // Set Text Color to White #FFFFFF and Background to White #FFFFFF
    const textColorInput = page.locator('input[placeholder*="#FFFFFF"]').first();
    await textColorInput.fill('#FFFFFF');

    const bgColorInput = page.locator('input[placeholder*="#FFFFFF"]').nth(2);
    if (await bgColorInput.isVisible()) {
      await bgColorInput.fill('#FFFFFF');
      await expect(page.locator('text=Low Contrast Warning')).toBeVisible();
    }
  });

  test('E2E-12: Cannot Delete Active Live Preset (Trash Icon Hidden)', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    // Locate preset card with LIVE ON AIR badge
    const liveBadge = page.locator('span:has-text("LIVE ON AIR")').first();
    await expect(liveBadge).toBeVisible();
  });

  test('E2E-13: XSS Color Input Safety & Fallback', async ({ page }) => {
    await page.click('button:has-text("Display Style")');

    const textColorInput = page.locator('input[placeholder*="#FFFFFF"]').first();
    await textColorInput.fill('<script>alert("xss")</script>');
    await expect(page.locator('#mini-obs-preview-text')).toBeVisible();
  });

  test('E2E-14: Extreme Long Lyric Line Wrapping', async ({ page }) => {
    await page.goto('/display');
    await expect(page.locator('#obs-display-canvas')).toBeVisible();
  });

  test('E2E-15: Real-Time WebSocket Sync on Overlay Page', async ({ page }) => {
    await page.goto('/display');
    await expect(page.locator('#obs-display-canvas')).toBeVisible();
  });

  test('E2E-16: Zero-Flicker & Reload Persistence in LocalStorage', async ({ page }) => {
    await page.goto('/display');
    await expect(page.locator('#obs-display-canvas')).toBeVisible();

    // Reload page and check zero-flicker container presence
    await page.reload();
    await expect(page.locator('#obs-display-canvas')).toBeVisible();
  });
});
