# TASK-04: Frontend Auth State Integration, Auto-Redirect & Service Migration ✅ [SELESAI]

## 🎯 Goal
Mengintegrasikan `apiClient.ts` ke dalam komponen utama `App.tsx`, `LoginView.tsx`, `UserManagementModal.tsx`, dan `displaySettingService.ts`. Memastikan bahwa saat sesi kedaluwarsa, aplikasi React secara otomatis mereset state otentikasi, mengalihkan tampilan ke `<LoginView />`, dan menginformasikan pesan peringatan kepada pengguna.

## 📄 Blueprint References
- [PRD.md](../../docs/feature/2026-08-08_auth-session-multi-device/PRD.md) - Section: Centralized 401 Interceptor & Auto-Redirect
- [USER_FLOW.md](../../docs/feature/2026-08-08_auth-session-multi-device/USER_FLOW.md) - Section: Invalid / Expired Token Auto-Redirect Flow

## 📁 Target Files
- `frontend/src/App.tsx`
- `frontend/src/components/LoginView.tsx`
- `frontend/src/services/displaySettingService.ts`
- `frontend/src/components/UserManagementModal.tsx`

## 📝 Detailed Steps & Technical Requirements

1. **Migrasi `App.tsx` ke `apiClient.ts` & Listener 401:**
   - Impor `apiClient` dan `AUTH_UNAUTHORIZED_EVENT` dari `utils/apiClient`.
   - Ganti seluruh pemanggilan `fetch()` pada `loadData()` dan handler aksi dengan `apiClient.fetch()`.
   - Tambahkan state `authError: string | null` untuk menampung pesan sesi kedaluwarsa.
   - Gunakan `useEffect` untuk mendengarkan event `pentaslirik:unauthorized`:
     ```typescript
     useEffect(() => {
       const handleUnauthorized = () => {
         setUser(null);
         setToken(null);
         setAuthError('Session expired or invalidated. Please sign in again.');
       };
       window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
       return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
     }, []);
     ```

2. **Dukungan Pesan Alert & Device Name di `LoginView.tsx`:**
   - Terima prop `authError?: string | null` pada `<LoginView />` untuk menampilkan pesan banner peringatan jika user di-redirect otomatis.
   - Kirim atribut `device_name` saat memanggil POST `/api/v1/auth/login` (mengidentifikasi platform browser ponsel/desktop).

3. **Migrasi Modul Service Lainnya:**
   - Ganti pemanggilan `fetch()` pada `displaySettingService.ts` dan `UserManagementModal.tsx` agar menggunakan `apiClient.fetch()`.

## ✅ Acceptance Criteria
- [x] Pengguna yang memiliki token tidak valid/terhapus di `localStorage` langsung ter-redirect ke tampilan `<LoginView />` saat melakukan navigasi atau aksi API.
- [x] Pesan alert "Session expired or invalidated. Please sign in again." muncul dengan jelas pada halaman login saat redirect terjadi.
- [x] Login baru dapat dilakukan dengan lancar tanpa ada sisa state lama.
- [x] Seluruh komponen aplikasi menggunakan API client terpusat.

