# Feature Implementation Tasks: Multi-Device Auth & Automatic Token Expiration Handling

> **Feature Directory:** `docs/feature/2026-08-08_auth-session-multi-device`  
> **Status:** ✅ SELESAI / FEATURE FULLY VERIFIED  
> **Feature Blueprint Documentation:** [PRD.md](../../docs/feature/2026-08-08_auth-session-multi-device/PRD.md) | [REQUIREMENTS.md](../../docs/feature/2026-08-08_auth-session-multi-device/REQUIREMENTS.md) | [FEATURES.md](../../docs/feature/2026-08-08_auth-session-multi-device/FEATURES.md) | [ARCHITECTURE.md](../../docs/feature/2026-08-08_auth-session-multi-device/ARCHITECTURE.md) | [API.md](../../docs/feature/2026-08-08_auth-session-multi-device/API.md) | [DATABASE.md](../../docs/feature/2026-08-08_auth-session-multi-device/DATABASE.md) | [USER_FLOW.md](../../docs/feature/2026-08-08_auth-session-multi-device/USER_FLOW.md)

---

## 📌 Executive Summary

Rangkaian task ini memecah implementasi perbaikan dua kelemahan sistem autentikasi PentasLirik:
1. **Multi-Device Token Persistence**: Mengizinkan 1 akun pengguna digunakan secara bersamaan di beberapa perangkat tanpa menghapus token perangkat yang sudah aktif sebelumnya.
2. **Centralized HTTP 401 Interceptor & Auto-Redirect**: Menyediakan HTTP request wrapper terpusat di frontend untuk menangkap respon 401 Unauthorized, membersihkan `localStorage`, mereset state otentikasi, dan mengarahkan pengguna kembali ke tampilan Login secara otomatis dengan notifikasi pesan yang jelas.

---

## 📌 Task Breakdown & Direct Links

| Task ID | Task Title | File Reference | Status |
|:---|:---|:---|:---:|
| **TASK-01** | Backend Multi-Device Token Support & Granular Logout (`AuthController.php`, `api.php`) | [01-backend-multi-device-token-support.md](./01-backend-multi-device-token-support.md) | ✅ SELESAI |
| **TASK-02** | Backend Authentication Unit & Feature Tests (`AuthApiTest.php`) | [02-backend-auth-unit-and-feature-tests.md](./02-backend-auth-unit-and-feature-tests.md) | ✅ SELESAI |
| **TASK-03** | Centralized Frontend HTTP API Client & 401 Interceptor (`apiClient.ts`) | [03-frontend-centralized-api-client.md](./03-frontend-centralized-api-client.md) | ✅ SELESAI |
| **TASK-04** | Frontend Auth State Integration, Auto-Redirect & Service Migration (`App.tsx`, `LoginView.tsx`, etc.) | [04-frontend-auth-state-integration-and-auto-redirect.md](./04-frontend-auth-state-integration-and-auto-redirect.md) | ✅ SELESAI |
| **TASK-05** | E2E Playwright Testing & Multi-Device Verification (`auth_and_dashboard.spec.ts`) | [05-testing-and-verification.md](./05-testing-and-verification.md) | ✅ SELESAI |


---

## 🎯 Architecture Highlights & Implementation Rules

1. **Non-Destructive Token Generation**:
   - Hapus `$user->tokens()->delete()` dari metode `login` di `AuthController.php`.
   - Berikan nama spesifik untuk setiap token berdasarkan `device_name` atau header `User-Agent`.

2. **Centralized API Wrapper (`apiClient.ts`)**:
   - Seluruh panggilan `fetch` ke backend API wajib melalui `apiClient.fetch()` agar header `Authorization: Bearer <token>` dan penanganan error `401` konsisten.

3. **Clean Storage & State Reset on 401**:
   - Saat HTTP 401 terdeteksi, hapus `pentaslirik_token` dan `pentaslirik_user` dari `localStorage` dan pemicu event `pentaslirik:unauthorized` untuk mereset React state secara otomatis.
