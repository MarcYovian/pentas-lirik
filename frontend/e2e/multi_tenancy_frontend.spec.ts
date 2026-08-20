import { test, expect } from '@playwright/test';

test.describe('Multi-Tenancy, Team Management & Self-Service E2E Tests', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
      return;
    }
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('User can register a new organization with starter pack and become active Admin', async ({ page }) => {
    // Switch to Register Org Tab
    await page.click('button:has-text("Daftar Tim Baru")');

    const randomSuffix = Math.floor(Math.random() * 100000);
    const orgName = `GKII Jemaat Baru ${randomSuffix}`;
    const adminEmail = `pastor${randomSuffix}@gkii.org`;

    await page.fill('input[placeholder="Nama Lengkap"]', 'Pastor Stefanus');
    await page.fill('input[placeholder="admin@gereja.org"]', adminEmail);
    await page.fill('input[placeholder="Contoh: Kapel St. Yohanes"]', orgName);
    await page.fill('input[placeholder="Minimal 6 karakter"]', 'password123');

    await page.click('button:has-text("Daftar Organisasi Baru")');

    // Should navigate to dashboard
    await expect(page.locator('#navbar-header')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#org-switcher-chip')).toContainText(orgName);

    // Starter pack songs should be visible in Song Library
    await expect(page.locator('#column-song-library')).toContainText('Amazing Grace');
  });

  test('Organization switcher opens and displays current organizations', async ({ page }) => {
    // Login as Admin
    await page.click('#btn-quick-admin');
    await page.click('#login-submit-btn');
    await expect(page.locator('#navbar-header')).toBeVisible();

    // Click Org Switcher Chip
    await page.click('#org-switcher-chip');

    // Organization Switcher Modal should be visible
    await expect(page.locator('h2:has-text("Organisasi & Komunitas")')).toBeVisible();
    await expect(page.locator('button:has-text("Buat Baru")')).toBeVisible();
    await expect(page.locator('button:has-text("Gabung Tim")')).toBeVisible();

    // Close modal
    await page.click('button[aria-label="Tutup modal"]');
    await expect(page.locator('h2:has-text("Organisasi & Komunitas")')).toBeHidden();
  });

  test('Team management modal shows invite code and member controls for Admin', async ({ page }) => {
    // Login as Admin
    await page.click('#btn-quick-admin');
    await page.click('#login-submit-btn');
    await expect(page.locator('#navbar-header')).toBeVisible();

    // Open Team Management Modal
    await page.click('#btn-team-management');

    await expect(page.locator('h2:has-text("Manajemen Tim & Anggota")')).toBeVisible();
    await expect(page.locator('button:has-text("Salin Kode")')).toBeVisible();
    await expect(page.locator('button:has-text("Tambah Anggota Langsung")')).toBeVisible();

    // Close modal
    await page.click('button[aria-label="Tutup modal"]');
  });

  test('User profile modal allows updating profile info and password', async ({ page }) => {
    // Login as Operator
    await page.click('#btn-quick-operator');
    await page.click('#login-submit-btn');
    await expect(page.locator('#navbar-header')).toBeVisible();

    // Open Profile Modal by clicking user info chip
    await page.click('#user-info');

    await expect(page.locator('h2:has-text("Profil & Keamanan Akun")')).toBeVisible();

    // Update name
    await page.fill('input[placeholder="Nama Lengkap Anda"]', 'Operator Stage Lead');
    await page.click('button:has-text("Simpan Perubahan Profil")');

    await expect(page.locator('text=Profil berhasil diperbarui!')).toBeVisible();
    await expect(page.locator('#user-name-display')).toContainText('Operator Stage Lead');

    // Reset name back to Operator Live for test clean state
    await page.fill('input[placeholder="Nama Lengkap Anda"]', 'Operator Live');
    await page.click('button:has-text("Simpan Perubahan Profil")');
    await expect(page.locator('#user-name-display')).toContainText('Operator Live');

    // Switch to Password Tab
    await page.click('button:has-text("Ganti Password")');
    await expect(page.locator('input[placeholder="Masukkan password lama saat ini"]')).toBeVisible();

    // Close modal
    await page.click('button[aria-label="Tutup modal"]');
  });

  test('Super admin portal displays server stats and organization table', async ({ page }) => {
    // Login as Admin
    await page.click('#btn-quick-admin');
    await page.click('#login-submit-btn');
    await expect(page.locator('#navbar-header')).toBeVisible();

    // Open Super Admin Modal
    await page.click('#btn-super-admin-portal');

    await expect(page.locator('h2:has-text("Portal Super Administrator")')).toBeVisible();
    await expect(page.locator('text=Total Pengguna')).toBeVisible();
    await expect(page.locator('text=Total Lagu')).toBeVisible();

    // Close modal
    await page.click('button[aria-label="Tutup modal"]');
  });
});
