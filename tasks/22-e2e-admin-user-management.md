# TASK-22: E2E Admin User Management & Role Operations Tests ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan test suite Playwright E2E untuk menguji antarmuka Console Admin User Management (`UserManagementModal.tsx`), pembuatan user baru, ubah role user, dan penghapusan akun operator.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-13 Admin User Management & Permission Matrix
- [API.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/API.md) - Section: User Management Endpoints

## 📁 Target Files
- `frontend/e2e/admin_user_management.spec.ts`

## 📝 Detailed Step-by-Step Test Scenarios

### Test Scenario 1: Admin Console Access & Modal Opening
1. Login menggunakan akun Admin (`admin@pentaslirik.local` / `password` via `#btn-quick-admin`).
2. Verifikasi tombol **Users** (`#admin-user-mgmt-btn`) terlihat pada Header Navbar.
3. Klik tombol **Users**.
4. Verifikasi modal User Management Admin Console (`#user-mgmt-modal`) terbuka.

### Test Scenario 2: Create New Operator Account
1. Pada form "Create New Account", isi Name, Email, Password, dan Role.
2. Klik tombol **Add User** (`#btn-submit-create-user`).
3. Verifikasi akun baru "Budi Streamer" dengan email `budi.stream@pentaslirik.local` dan role `operator` muncul di tabel akun terdaftar.

### Test Scenario 3: Update User Role & Verification
1. Pada baris tabel akun "Budi Streamer", ubah dropdown role dari `OPERATOR` menjadi `ADMIN`.
2. Verifikasi role akun ter-update menjadi `ADMIN` di backend & tabel interface.

### Test Scenario 4: Delete Account & Self-Delete Prevention
1. Verifikasi tombol hapus (`button[title="Delete user account"]`) **TIDAK ADA / DISABLED** pada baris akun Admin yang sedang login (self-delete prevention).
2. Klik tombol hapus pada akun operator lain.
3. Konfirmasi dialog hapus akun.
4. Verifikasi akun terhapus dari tabel daftar akun.

## ✅ Acceptance Criteria
- [x] Pengujian automated Playwright pada `admin_user_management.spec.ts` 100% PASS (2 scenarios passed in 1.5s).
