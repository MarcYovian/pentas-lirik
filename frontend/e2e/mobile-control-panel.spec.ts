import { test, expect } from '@playwright/test';

test.describe('Mobile-First Control Panel & Layout E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local PentasLirik web application, clear session and login as operator
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');

    if (await page.locator('#btn-quick-operator').isVisible()) {
      await page.click('#btn-quick-operator');
      await page.click('#login-submit-btn');
    }

    await expect(page.locator('#navbar-header')).toBeVisible();
  });

  test('Mobile Navigation Shell: Hamburger Drawer opens and switches views', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    // Verify Mobile Hamburger Button is visible on mobile
    const hamburgerBtn = page.locator('#btn-toggle-mobile-hamburger');
    await expect(hamburgerBtn).toBeVisible();

    // Click Hamburger button to open navigation drawer
    await hamburgerBtn.click();

    // Verify drawer overlay & menu links appear
    const drawerOverlay = page.locator('#mobile-nav-drawer-overlay');
    await expect(drawerOverlay).toBeVisible();

    const songLibraryLink = page.locator('#nav-drawer-link-pustaka-lagu');
    await expect(songLibraryLink).toBeVisible();

    // Tap "Pustaka Lagu" in drawer
    await songLibraryLink.click();

    // Drawer should close automatically
    await expect(drawerOverlay).not.toBeVisible();

    // Song Library view should be active
    const songLibraryHeader = page.locator('#song-library-header');
    await expect(songLibraryHeader).toBeVisible();
  });

  test('Mobile Tab Bar: Switches between Live Control, Setlist, and Song Library', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    // Verify Mobile Tab Bar is visible at bottom
    const tabNav = page.locator('#mobile-tab-navigation');
    await expect(tabNav).toBeVisible();

    // Tap Setlist tab
    const setlistTab = page.locator('#btn-mobile-tab-setlist');
    await setlistTab.click();
    await expect(page.locator('#column-setlist-rundown')).toBeVisible();

    // Tap Library tab
    const libraryTab = page.locator('#btn-mobile-tab-library');
    await libraryTab.click();
    await expect(page.locator('#column-song-library')).toBeVisible();

    // Tap Live tab
    const liveTab = page.locator('#btn-mobile-tab-live');
    await liveTab.click();
    await expect(page.locator('#mobile-top-setlist-switcher-pill')).toBeVisible();
  });

  test('Mobile Setlist Quick Selector Drawer: Selects song from setlist', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    // Ensure we are on Live tab
    await page.locator('#btn-mobile-tab-live').click();

    // Tap Setlist Quick Switcher Pill in header
    const setlistPill = page.locator('#mobile-top-setlist-switcher-pill');
    await expect(setlistPill).toBeVisible();
    await setlistPill.click();

    // Verify Setlist Quick Drawer opens
    const quickDrawer = page.locator('#mobile-setlist-quick-drawer');
    await expect(quickDrawer).toBeVisible();

    // Search or select a song item from the drawer
    const songItems = page.locator('[id^="quick-drawer-item-"]');
    const count = await songItems.count();

    if (count > 0) {
      // Tap the first song item
      await songItems.first().click();

      // Drawer should close
      await expect(quickDrawer).not.toBeVisible();
    }
  });

  test('Mobile Thumb Stepper Bar & Stanza Navigation', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    // Ensure we are on Live tab
    await page.locator('#btn-mobile-tab-live').click();

    // Check if floating bottom stepper bar is rendered
    const stepperBar = page.locator('#mobile-bottom-stepper-bar');
    await expect(stepperBar).toBeVisible();

    // Tap NEXT STANZA button if enabled
    const nextBtn = page.locator('#mobile-bottom-stepper-bar button:has-text("NEXT STANZA")');
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(300);
    }

    // Tap Clear Screen button
    const clearBtn = page.locator('#mobile-bottom-stepper-bar button:has-text("Clear Screen")');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
  });

  test('Viewport Overflow Verification: 0 horizontal scrollbar on mobile viewports', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    // Verify document scrollWidth matches window innerWidth (0 horizontal overflow)
    const hasHorizontalScrollbar = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalScrollbar).toBe(false);
  });
});
