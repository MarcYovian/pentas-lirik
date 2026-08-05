# TASK-18: E2E Auth & Dashboard User Journey Tests ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan test suite Playwright E2E untuk menguji alur otentikasi (login berhasil, login gagal, 1-click quick demo fill) serta interaksi antarmuka Dashboard 3-kolom.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-01 Authentication & FR-02 Dashboard Layout
- [USER_FLOW.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/USER_FLOW.md) - Section: Login & Navigation Flow

## 📁 Target Files
- `frontend/e2e/auth_and_dashboard.spec.ts`

## 📝 Detailed Step-by-Step Test Scenarios

### Test Scenario 1: Unauthenticated Redirect & Login Failure
1. Buka halaman utama `/`.
2. Verifikasi bahwa pengguna diarahkan ke form Login (elemen `#login-card` dan `#login-email-input` terlihat).
3. Isi email `wrong@domain.com` dan password `wrongpassword`, klik *Sign In*.
4. Verifikasi munculnya pesan error kredensial salah (`#login-error-alert`).

### Test Scenario 2: 1-Click Quick Demo Login & Persistence
1. Klik tombol **Operator Demo** (`#btn-quick-operator`).
2. Verifikasi field email (`operator@pentaslirik.local`) dan password terisi otomatis.
3. Klik tombol *Sign In* (`#login-submit-btn`).
4. Verifikasi pengguna masuk ke Dashboard utama:
   - Header bar `#navbar-header` terlihat.
   - Nama user "Operator User" (`#user-name-display`) & Role badge (`#user-role-badge`) terlihat.
5. Perform page reload (`page.reload()`).
6. Verifikasi sesi tetap bertahan (tetap di Dashboard tanpa terlempar ke Login).

### Test Scenario 3: Dashboard 3-Column Navigation & Search
1. Di Kolom 1 (Song Library `#column-song-library`), ketik "Grace" di `#song-search-input`.
2. Verifikasi lagu "Amazing Grace" (`#song-card-1`) muncul.
3. Di Kolom 2 (Setlist Rundown `#column-setlist-rundown`), pilih setlist dari dropdown `#setlist-select-dropdown`.
4. Verifikasi item-item lagu dalam setlist ditampilkan secara terurut (`#setlist-items-container`).

## ✅ Acceptance Criteria
- [x] Pengujian automated Playwright pada `auth_and_dashboard.spec.ts` 100% PASS (3 tests passed in 3.2s).
