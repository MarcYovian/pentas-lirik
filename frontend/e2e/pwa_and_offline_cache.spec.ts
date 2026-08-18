import { test, expect } from '@playwright/test';

test.describe('PWA & Local Offline Cache E2E Tests', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.waitForSelector('#btn-quick-operator', { timeout: 10000 });
    await page.click('#btn-quick-operator');
    await page.click('#login-submit-btn');
    await expect(page.locator('#navbar-header')).toBeVisible();
  });

  test('Scenario 1: Web App Manifest & Service Worker Assets Availability', async ({ page, request }) => {
    // 1. Verify manifest.webmanifest HTTP 200 and valid JSON schema
    const manifestResponse = await request.get('/manifest.webmanifest');
    expect(manifestResponse.ok()).toBeTruthy();

    const manifestJson = await manifestResponse.json();
    expect(manifestJson.name).toContain('PentasLirik');
    expect(manifestJson.display).toBe('standalone');
    expect(manifestJson.background_color).toBe('#0F0F0F');
    expect(manifestJson.theme_color).toBe('#0F0F0F');
    expect(manifestJson.icons.length).toBeGreaterThanOrEqual(2);

    // 2. Verify Service Worker sw.js HTTP 200
    const swResponse = await request.get('/sw.js');
    expect(swResponse.ok()).toBeTruthy();
    const swText = await swResponse.text();
    expect(swText).toContain('CACHE_NAME');
    expect(swText).toContain('addEventListener');

    // 3. Verify HTML DOM links
    const manifestTag = page.locator('link[rel="manifest"]');
    await expect(manifestTag).toHaveAttribute('href', '/manifest.webmanifest');
  });

  test('Scenario 2: IndexedDB Local Cache Stores Songs & Setlists', async ({ page }) => {
    // Wait for songs to populate in dashboard
    await expect(page.locator('#column-song-library')).toBeVisible();
    await page.waitForTimeout(1000);

    // Verify IndexedDB database and stores exist with records
    const dbRecordCount = await page.evaluate(async () => {
      return new Promise<{ songs: number; setlists: number }>((resolve, reject) => {
        const req = window.indexedDB.open('PentasLirikOfflineDB');
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error('IndexedDB blocked'));
        req.onsuccess = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('songs')) {
            db.close();
            return resolve({ songs: 0, setlists: 0 });
          }
          const tx = db.transaction(['songs', 'setlists'], 'readonly');
          const songReq = tx.objectStore('songs').getAll();
          const setlistReq = tx.objectStore('setlists').getAll();

          tx.oncomplete = () => {
            const songs = (songReq.result || []).length;
            const setlists = (setlistReq.result || []).length;
            db.close();
            resolve({ songs, setlists });
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
      });
    });

    expect(dbRecordCount.songs).toBeGreaterThan(0);
  });

  test('Scenario 3: Offline Mode Event & Status Indicator Badge Feedback', async ({ page }) => {
    // 1. Initially online
    const connStatus = page.locator('#connection-status');
    await expect(connStatus).toBeVisible();

    // 2. Simulate offline event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // 3. Status badge should show offline mode
    await expect(connStatus).toContainText('Offline Cache');

    // 4. Simulate online event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });

    // 5. Status badge should return to Online or Connecting
    await expect(connStatus).toContainText(/Online|Connecting/);
  });
});
