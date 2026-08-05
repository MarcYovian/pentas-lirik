# TASK-06: Authentication API & Middleware (Sanctum + RBAC) ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan endpoint autentikasi pengguna (Login, Logout, User Profile) menggunakan Laravel Sanctum serta membuat middleware untuk Role-Based Access Control (RBAC).

## 📄 Blueprint References
- [API.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/API.md) - Section: Authentication & Authorization, Endpoints `/api/v1/auth/*`
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: System Scope & User Roles (Permission Matrix)

## 📁 Target Files
- `backend/app/Http/Controllers/Api/V1/AuthController.php`
- `backend/app/Http/Middleware/CheckRole.php`
- `backend/routes/api.php`
- `backend/bootstrap/app.php`
- `backend/tests/Feature/AuthApiTest.php`

## 📝 Detailed Requirements
1. **API Endpoints Implementation:**
   - `POST /api/v1/auth/login`:
     - Request body: `email`, `password`.
     - Respons: JSON berisi data `user` (id, name, email, role) dan Bearer `token`.
     - Mengembalikan HTTP 401 jika kredensial salah.
   - `POST /api/v1/auth/logout`:
     - Memerlukan middleware `auth:sanctum`.
     - Mencabut/menghapus token pengguna saat ini.
   - `GET /api/v1/auth/me`:
     - Memerlukan middleware `auth:sanctum`.
     - Mengembalikan data pengguna yang sedang login.
2. **Role Middleware:**
   - Implementasi middleware `CheckRole` (e.g. `role:ADMIN` atau `role:ADMIN,OPERATOR`).
   - Mengembalikan HTTP 403 Forbidden jika pengguna tidak memiliki role yang diizinkan.
3. **Feature Test:**
   - Buat test untuk login berhasil, login gagal, logout, dan akses endpoint terproteksi.

## ✅ Acceptance Criteria
- [x] Endpoint login mengembalikan token Sanctum dan detail role yang valid.
- [x] Endpoint terproteksi menolak akses tanpa token (401) atau jika role tidak sesuai (403).
- [x] Test otomatis `AuthApiTest` berhasil tanpa eror (7 tests passed, 21 assertions).
