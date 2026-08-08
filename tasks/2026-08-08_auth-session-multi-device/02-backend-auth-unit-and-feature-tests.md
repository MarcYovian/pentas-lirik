# TASK-02: Backend Authentication Unit & Feature Tests ✅ [SELESAI]

## 🎯 Goal
Memperbarui dan menambahkan test case otomatis pada `backend/tests/Feature/AuthApiTest.php` untuk memverifikasi fungsionalitas login multi-device, keabsahan token independen antar-perangkat, logout per perangkat, serta kepastian respon HTTP 401 saat token tidak valid.

## 📄 Blueprint References
- [REQUIREMENTS.md](../../docs/feature/2026-08-08_auth-session-multi-device/REQUIREMENTS.md) - Section: FR-AUTH-01 & FR-AUTH-02
- [API.md](../../docs/feature/2026-08-08_auth-session-multi-device/API.md) - Section: Endpoint Details & HTTP 401 Error Standard

## 📁 Target Files
- `backend/tests/Feature/AuthApiTest.php`

## 📝 Detailed Steps & Technical Requirements

1. **Test Multi-Device Concurrent Logins:**
   - Tambahkan test `test_user_can_login_from_multiple_devices_simultaneously()`:
     - Melakukan request login 1 (`device_name` = `'Desktop Operator'`). Simpan Token A.
     - Melakukan request login 2 (`device_name` = `'Mobile Operator Phone'`). Simpan Token B.
     - Kirim request GET `/api/v1/auth/me` menggunakan Token A -> Pastikan HTTP 200 OK.
     - Kirim request GET `/api/v1/auth/me` menggunakan Token B -> Pastikan HTTP 200 OK.

2. **Test Single Device Logout Independence:**
   - Tambahkan test `test_user_can_logout_single_device()`:
     - Login dari Device A (Token A) dan Device B (Token B).
     - Kirim request POST `/api/v1/auth/logout` menggunakan Token A.
     - Kirim request GET `/api/v1/auth/me` menggunakan Token A -> Pastikan HTTP 401 Unauthorized.
     - Kirim request GET `/api/v1/auth/me` menggunakan Token B -> Pastikan HTTP 200 OK (Token B tetap valid).

3. **Test HTTP 401 Unauthorized Response Standard:**
   - Verifikasi bahwa request ke endpoint yang dilindungi (seperti `/api/v1/songs` atau `/api/v1/auth/me`) tanpa token atau dengan token palsu mengembalikan status HTTP 401.

## ✅ Acceptance Criteria
- [x] Pengujian `docker compose exec backend ./vendor/bin/phpunit --filter=AuthApiTest` lulus 100% tanpa error.
- [x] Terverifikasi bahwa login perangkat baru tidak membatalkan token sebelumnya.
- [x] Terverifikasi bahwa logout dari satu perangkat tidak mengganggu perangkat lainnya.

