# TASK-03: Centralized Frontend HTTP API Client & 401 Interceptor ✅ [SELESAI]

## 🎯 Goal
Membangun modul helper `apiClient.ts` di frontend yang berfungsi sebagai wrapper panggilan HTTP terpusat. Helper ini secara otomatis menyematkan header otentikasi Bearer token, menangkap respon HTTP 401 Unauthorized secara terpusat, membersihkan `localStorage`, dan memicu event global penanganan sesi expired.

## 📄 Blueprint References
- [ARCHITECTURE.md](../../docs/feature/2026-08-08_auth-session-multi-device/ARCHITECTURE.md) - Section: Frontend Centralized HTTP Client Architecture
- [REQUIREMENTS.md](../../docs/feature/2026-08-08_auth-session-multi-device/REQUIREMENTS.md) - Section: FR-AUTH-03 & FR-AUTH-04

## 📁 Target Files
- `frontend/src/utils/apiClient.ts` (File Baru)

## 📝 Detailed Steps & Technical Requirements

1. **Buat Helper Custom Event & Token Storage (`apiClient.ts`):**
   - Definisikan nama event kustom: `export const AUTH_UNAUTHORIZED_EVENT = 'pentaslirik:unauthorized';`.
   - Buat fungsi pembantu untuk membersihkan kredensial lokal:
     ```typescript
     export function clearAuthCredentials() {
       localStorage.removeItem('pentaslirik_token');
       localStorage.removeItem('pentaslirik_user');
     }
     ```

2. **Implementasikan Wrapper `apiClient.fetch`:**
   - Terima parameter `url: string` dan `options: RequestInit = {}`.
   - Ambil token dari `localStorage.getItem('pentaslirik_token')`.
   - Sisipkan header default (`Accept: application/json`) dan `Authorization: Bearer <token>` jika token tersedia.
   - Eksekusi request menggunakan `window.fetch(url, options)`.

3. **Implementasikan Interceptor HTTP 401 Unauthorized:**
   - Jika `response.status === 401`:
     - Panggil `clearAuthCredentials()`.
     - Trigger event global: `window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT, { detail: { message: 'Session expired' } }));`.
     - Throw error atau kembalikan respon terkontrol agar komponen pemanggil dapat menghentikan proses pengolahan data.

4. **Sediakan Helper HTTP Methods (GET, POST, PUT, DELETE):**
   - Sediakan shortcut method: `apiClient.get()`, `apiClient.post()`, `apiClient.put()`, `apiClient.delete()` untuk kemudahan integrasi.

## ✅ Acceptance Criteria
- [x] File `frontend/src/utils/apiClient.ts` berhasil dibuat dan lolos pemeriksaan TypeScript compiler (`npm run build`).
- [x] Panggilan request via `apiClient.fetch` otomatis menyertakan header Bearer Token.
- [x] Saat server merespon dengan status HTTP 401, `localStorage` langsung dibersihkan dan event `pentaslirik:unauthorized` dipancarkan.

