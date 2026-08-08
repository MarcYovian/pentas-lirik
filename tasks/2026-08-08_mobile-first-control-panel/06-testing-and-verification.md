# TASK-06: Mobile E2E Playwright Testing & Multi-Device Verification ✅ [SELESAI]

## 🎯 Goal
Mengkonfigurasi dan menjalankan pengujian otomatis Playwright End-to-End (E2E) dengan emulasi perangkat mobile (iPhone 14 Pro, Pixel 7, iPad Air) untuk memverifikasi fungsionalitas navigasi drawer mobile, pemilihan lagu dari setlist drawer, pergeseran bait lirik via thumb stepper, kontrol emergency (Blank, Logo, Clear), serta memastikan 0 overflow horisontal pada seluruh breakpoint layar.

## 📄 Blueprint References
- [REQUIREMENTS.md](../../docs/feature/2026-08-08_mobile-first-control-panel/REQUIREMENTS.md) - Section: Acceptance Criteria
- [PRD.md](../../docs/feature/2026-08-08_mobile-first-control-panel/PRD.md) - Section: Success Metrics

## 📁 Target Files
- `frontend/e2e/mobile-control-panel.spec.ts`
- `frontend/playwright.config.ts`
- `tasks/2026-08-08_mobile-first-control-panel/VERIFICATION_REPORT.md`

## 📝 Detailed Steps & Technical Requirements

1. **Konfigurasi Emulasi Mobile di `playwright.config.ts`:**
   - Tambahkan profil proyek emulasi perangkat mobile di Playwright config:
     - `Mobile Chrome` (Pixel 7 viewport: `412 x 915`).
     - `Mobile Safari` (iPhone 14 Pro viewport: `393 x 852`).
     - `Tablet iPad` (iPad Air viewport: `820 x 1180`).

2. **Pengujian E2E Mobile (`mobile-control-panel.spec.ts`):**
   - **Test 1: Mobile Header & Drawer Navigation**:
     - Buka halaman utama pada viewport mobile (`393x852`).
     - Pastikan menu desktop tersembunyi dan tombol hamburger terlihat.
     - Ketuk tombol hamburger -> pastikan drawer navigasi terbuka.
     - Ketuk menu "Pustaka Lagu" -> pastikan halaman berpindah ke Song Library dan drawer tertutup.
   - **Test 2: Mobile Setlist Quick Selector**:
     - Buka Live Control Panel pada mobile.
     - Ketuk tombol Setlist Selector -> pastikan Bottom Sheet Drawer terbuka memuat daftar lagu.
     - Ketuk lagu kedua -> pastikan drawer tertutup dan kartu bait lagu kedua ditampilkan.
   - **Test 3: Thumb Stepper & Stanza Broadcast**:
     - Ketuk kartu bait "Chorus" -> pastikan elemen menerima atribut active border (`indigo-500`).
     - Ketuk tombol `NEXT STANZA` pada bottom bar melayang -> pastikan bait berpindah ke "Bridge".
     - Ketuk tombol `BLANK` -> pastikan status pengosongan layar teraba oleh OBS Display socket receiver.
   - **Test 4: Visual Viewport Overflow Verification**:
     - Periksa bahwa `document.documentElement.scrollWidth` tidak pernah melebihi `window.innerWidth` pada seluruh 8 komponen halaman utama.

3. **Dokumentasi Laporan Verifikasi (`VERIFICATION_REPORT.md`):**
   - Jalankan `npm run test:e2e` dari direktori `frontend`.
   - Dokumentasikan hasil eksekusi pengujian Playwright E2E ke dalam `VERIFICATION_REPORT.md` beserta timestamp verifikasi.

## ✅ Acceptance Criteria
- [x] SELURUH pengujian E2E Playwright pada emulasi Mobile Safari & Mobile Chrome LULUS 100%.
- [x] Pengujian membuktikan tidak ada horizontal scroll overflow pada viewport `360px`, `393px`, dan `412px`.
- [x] File `VERIFICATION_REPORT.md` dibuat dan mendokumentasikan hasil pengujian secara rinci.

