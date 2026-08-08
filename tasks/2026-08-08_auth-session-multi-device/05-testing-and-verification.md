# TASK-05: E2E Playwright Testing & Multi-Device Verification ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan pengujian E2E otomatis menggunakan Playwright pada `frontend/e2e/auth_and_dashboard.spec.ts` untuk memverifikasi skenario token expired/invalid auto-redirect, login multi-device, serta membuat laporan hasil verifikasi di `VERIFICATION_REPORT.md`.

## 📄 Blueprint References
- [REQUIREMENTS.md](../../docs/feature/2026-08-08_auth-session-multi-device/REQUIREMENTS.md) - Section: Non-Functional Requirements (NFR-03 Test Coverage)

## 📁 Target Files
- `frontend/e2e/auth_and_dashboard.spec.ts`
- `tasks/2026-08-08_auth-session-multi-device/VERIFICATION_REPORT.md` (File Baru)

## 📝 Detailed Steps & Technical Requirements

1. **Tambahkan E2E Test Token Expired Auto-Redirect (`auth_and_dashboard.spec.ts`):**
   - Buat test case `should automatically redirect to login view when API returns 401 unauthorized`:
     - Pengguna login dan berhasil masuk ke dashboard.
     - Hapus token dari `localStorage` atau ubah menjadi token invalid via script evaluated di browser context.
     - Lakukan pengeditan lagu atau pemanggilan API data.
     - Verifikasi halaman otomatis berpindah ke `#login-container` / `<LoginView />`.
     - Verifikasi pesan alert sesi expired ditampilkan.

2. **Tambahkan E2E Test Multi-Device Concurrent Logins:**
   - Buat test case `should allow simultaneous logins on desktop and mobile contexts`:
     - Buka dua browser context terpisah (Desktop & Mobile view).
     - Login pada kedua browser context dengan akun yang sama.
     - Verifikasi kedua context dapat memuat lagu & setlist secara independen tanpa ada yang ter-kick.

3. **Jalankan Seluruh Suite Pengujian:**
   - Backend PHPUnit tests (jalankan dari root direktori `/pentas-lirik`):
     ```bash
     docker compose exec backend ./vendor/bin/phpunit
     # atau pengujian spesifik:
     docker compose exec backend ./vendor/bin/phpunit --filter=AuthApiTest
     ```
   - Frontend E2E Playwright tests (jalankan dari direktori `/frontend`):
     ```bash
     cd frontend && npx playwright test
     ```

4. **Dokumentasikan Hasil di `VERIFICATION_REPORT.md`:**
   - Catat status kelulusan pengujian backend dan frontend E2E.

## ✅ Acceptance Criteria
- [x] Seluruh skenario pengujian Playwright E2E pada `auth_and_dashboard.spec.ts` lulus tanpa kegagalan.
- [x] Pengujian backend Laravel PHPUnit lulus 100%.
- [x] Dokumentasi `VERIFICATION_REPORT.md` berhasil dibuat dengan ringkasan status pengujian.

