# TASK-17: Playwright E2E Testing Framework Setup & Configuration ✅ [SELESAI]

## 🎯 Goal
Menyiapkan dan mengonfigurasi framework pengujian UI End-to-End (E2E) berbasis Playwright di lingkungan frontend React/Vite.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: Quality Assurance & Automated Testing Strategy
- [REQUIREMENTS.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/REQUIREMENTS.md) - Section: E2E Testing Suite

## 📁 Target Files
- `frontend/playwright.config.ts`
- `frontend/package.json` (Scripts: `npm run test:e2e`)

## 📝 Detailed Step-by-Step Instructions

### Step 1: Instalasi Paket Playwright Test
Install paket `@playwright/test` pada folder `frontend/`:
```bash
cd frontend
npm install -D @playwright/test
```

### Step 2: Konfigurasi Playwright (`frontend/playwright.config.ts`)
Buat file `frontend/playwright.config.ts` dengan spesifikasi:
- `testDir`: `./e2e`
- `baseURL`: `http://localhost:5173`
- `webServer`: Otomatis menjalankan `npm run dev` jika dev server belum menyala.
- Browser targets: Chromium Desktop (1280x720 resolution).

### Step 3: Pendaftaran Script di `package.json`
Tambahkan script perintah pengujian E2E pada `frontend/package.json`:
```json
"scripts": {
  "test:e2e": "playwright test"
}
```

## ✅ Acceptance Criteria
- [x] Paket `@playwright/test` terpasang di `frontend/node_modules`.
- [x] Chromium headless shell terpasang sempurna via `npx playwright install chromium`.
- [x] Perintah `npm run test:e2e` terdaftar dan siap mendeteksi file spec di `frontend/e2e/`.
