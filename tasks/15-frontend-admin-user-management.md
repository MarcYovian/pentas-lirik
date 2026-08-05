# TASK-15: Frontend Admin User Management Interface ✅ [SELESAI]

## 🎯 Goal
Mengembangkan antarmuka khusus administrator untuk mengelola akun pengguna (Create, Edit, Delete, Assign Role `ADMIN` / `OPERATOR`).

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-13 Admin User Management & Permission Matrix
- [API.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/API.md) - Section: Users Endpoints (`/api/v1/users`)

## 📁 Target Files
- `backend/app/Http/Controllers/Api/V1/UserController.php`
- `frontend/src/components/UserManagementModal.tsx`
- `backend/tests/Feature/UserApiTest.php`

## 📝 Detailed Requirements
1. **Backend User Management Endpoints (`UserController.php`):**
   - Menangani CRUD pengguna (`GET`, `POST`, `PUT`, `DELETE` `/api/v1/users`).
   - Proteksi API route ini khusus untuk pengguna dengan role `ADMIN` via middleware `role:ADMIN`.
   - Admin tidak dapat menghapus akunnya sendiri (mengembalikan HTTP 400).
2. **User Management UI (`UserManagementModal.tsx`):**
   - Tabel daftar akun pengguna (Nama, Email, Dropdown Role Badge, Tombol Hapus).
   - Form Tambah Pengguna Baru (Nama, Email, Password, Dropdown Role: `Admin` / `Operator`).
   - Modal/Select Ubah Role Pengguna.
   - Dialog konfirmasi Hapus Pengguna (Admin tidak boleh menghapus dirinya sendiri).

## ✅ Acceptance Criteria
- [x] Endpoint admin hanya dapat diakses oleh user ber-role `ADMIN` (dikirimkan Bearer Sanctum Token).
- [x] Admin dapat menambah, mengubah role, dan menghapus akun operator dengan lancar.
- [x] Test otomatis `UserApiTest` 100% pass (6 tests passed, 15 assertions).
- [x] Type check TypeScript frontend 100% pass (`npm run lint`).
