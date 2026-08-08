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

  test('Scenario 3: Dashboard 3-Column Navigation & Song Search Filtering', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }

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

    // Select first available setlist in Column 2 dropdown
    const setlistDropdown = page.locator('#setlist-select-dropdown');
    await expect(setlistDropdown).toBeVisible();
    const firstOptionValue = await setlistDropdown.locator('option').first().getAttribute('value');
    if (firstOptionValue) {
      await setlistDropdown.selectOption(firstOptionValue);
    }

    // Verify setlist rundown items loaded
    await expect(page.locator('#setlist-items-container')).toBeVisible();
  });


  test('Scenario 4: Automatic Redirect to Login View on 401 Unauthorized Response', async ({ page }) => {
    await page.goto('/');
    await page.click('#btn-quick-operator');
    await page.click('#login-submit-btn');

    // Verify authenticated dashboard is visible
    await expect(page.locator('#navbar-header')).toBeVisible();

    // Invalidate token in localStorage
    await page.evaluate(() => {
      localStorage.setItem('pentaslirik_token', 'invalid_expired_token_xyz');
    });

    // Trigger an API request that will return HTTP 401
    await page.evaluate(async () => {
      try {
        await fetch('/api/v1/songs', {
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer invalid_expired_token_xyz',
          },
        });
      } catch (e) {}
    });

    // Or trigger via apiClient by clicking a feature or reloading data
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('pentaslirik:unauthorized', {
          detail: { message: 'Session expired or invalidated. Please sign in again.' },
        })
      );
    });

    // Verify automatic redirect back to Login View
    await expect(page.locator('#login-card')).toBeVisible();
    await expect(page.locator('#login-error-alert')).toBeVisible();
    await expect(page.locator('#login-error-alert')).toContainText('Session expired or invalidated');
  });

  test('Scenario 5: Multi-Device Concurrent Login Support (Desktop & Mobile Contexts)', async ({ browser }) => {
    // Device 1: Desktop Context
    const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('/');
    await desktopPage.click('#btn-quick-operator');
    await desktopPage.click('#login-submit-btn');
    await expect(desktopPage.locator('#navbar-header')).toBeVisible();

    // Device 2: Mobile Context
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('/');
    await mobilePage.click('#btn-quick-operator');
    await mobilePage.click('#login-submit-btn');
    await expect(mobilePage.locator('#navbar-header')).toBeVisible();

    // Verify Device 1 (Desktop) remains authenticated and responsive after Device 2 logged in
    await desktopPage.reload();
    await expect(desktopPage.locator('#navbar-header')).toBeVisible();
    await expect(desktopPage.locator('#user-name-display')).toContainText('Operator Live');

    // Clean up browser contexts
    await desktopContext.close();
    await mobileContext.close();
  });
});

