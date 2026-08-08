# TASK-01: Backend Multi-Device Token Support & Granular Logout ✅ [SELESAI]

## 🎯 Goal
Mengubah logika autentikasi backend pada `AuthController.php` dan `routes/api.php` agar mendukung pembuatan token per perangkat (*multi-device token support*) tanpa membatalkan token yang sedang aktif pada perangkat lain, serta menyediakan endpoint logout yang presisi.

## 📄 Blueprint References
- [PRD.md](../../docs/feature/2026-08-08_auth-session-multi-device/PRD.md) - Section: Functional Requirements (Multi-Device Token Persistence)
- [ARCHITECTURE.md](../../docs/feature/2026-08-08_auth-session-multi-device/ARCHITECTURE.md) - Section: Backend Token Architecture
- [API.md](../../docs/feature/2026-08-08_auth-session-multi-device/API.md) - Section: Endpoints Overview & Endpoint Details

## 📁 Target Files
- `backend/app/Http/Controllers/Api/V1/AuthController.php`
- `backend/routes/api.php`

## 📝 Detailed Steps & Technical Requirements

1. **Hapus Revokasi Token Global pada Login (`AuthController.php`):**
   - Hapus instruksi `$user->tokens()->delete();` dari fungsi `login()`.
   - Ambil informasi nama perangkat dari request body `device_name` atau fallback ke header `User-Agent` / `'Unknown Device'`.
   - Buat token baru menggunakan `$deviceName`:
     ```php
     $deviceName = $request->input('device_name', $request->header('User-Agent', 'Unknown Device'));
     $token = $user->createToken($deviceName)->plainTextToken;
     ```

2. **Perbarui Logika Single-Device Logout (`logout` Method):**
   - Pastikan metode `logout()` hanya menghapus token milik perangkat yang sedang mengirimkan request:
     ```php
     $request->user()->currentAccessToken()->delete();
     ```
   - Kembalikan respon JSON: `['message' => 'Successfully logged out of this device.']`.

3. **Tambahkan Endpoint Revokasi Seluruh Perangkat (`logoutAll` Method):**
   - Tambahkan metode `logoutAll(Request $request)` pada `AuthController.php`:
     ```php
     $request->user()->tokens()->delete();
     return response()->json(['message' => 'Successfully logged out of all devices.']);
     ```
   - Daftarkan rute `POST /api/v1/auth/logout-all` pada `routes/api.php` di dalam grup middleware `auth:sanctum`.

4. **Konfigurasi Pembersihan Token Expired (Laravel 13.x Scheduling):**
   - Sesuai standar Laravel 13.x Sanctum, pembersihan token kedaluwarsa secara otomatis dapat dijadwalkan menggunakan perintah Artisan:
     ```php
     Schedule::command('sanctum:prune-expired --hours=24')->daily();
     ```

## ✅ Acceptance Criteria
- [x] Login dari perangkat kedua tidak membatalkan token yang diterbitkan untuk perangkat pertama.
- [x] Nama token yang tersimpan pada tabel `personal_access_tokens` mencerminkan nama perangkat atau user agent yang dikirimkan.
- [x] Memanggil `/api/v1/auth/logout` hanya menghapus token aktif dari perangkat bersangkutan.
- [x] Memanggil `/api/v1/auth/logout-all` menghapus seluruh token milik pengguna bersangkutan.

