# TASK-11: Frontend Authentication & App Layout Setup ✅ [SELESAI]

## 🎯 Goal
Mengembangkan halaman Login, state store autentikasi (Sanctum Token & User Role), route guard, dan layout utama 3-kolom pada aplikasi React.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-01 User Authentication & FR-02 Operator Dashboard UI
- [DESIGN.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/DESIGN.md) - Section: Layout & Dashboard Structure

## 📁 Target Files
- `frontend/src/App.tsx`
- `frontend/src/components/LoginView.tsx`
- `frontend/src/components/Navbar.tsx`

## 📝 Detailed Requirements
1. **Authentication Store & LocalStorage Persistence:**
   - Menyimpan state `user`, `token`, dan `isAuthenticated`.
   - Method `handleLoginSuccess(user, token)`: Memanggil `POST /api/v1/auth/login`, menyimpan token & user ke `localStorage`.
   - Method `handleLogout()`: Memanggil API logout dan mereset state.
2. **Auth Guard / Protected Layout:**
   - Proteksi halaman utama `/` agar tidak bisa diakses pengguna unauthenticated (menampilkan `LoginView`).
   - Menyediakan tombol 1-Click Quick Fill Credentials untuk Admin (`admin@pentaslirik.local`) dan Operator (`operator@pentaslirik.local`).
3. **Login View (`LoginView.tsx`):**
   - Design form modern dengan Tailwind CSS (Input Email, Password, Tombol Login, Error Alert).
4. **Layout Utama 3-Kolom (`App.tsx` & `Navbar.tsx`):**
   - Header top bar: Logo PentasLirik, Nama User, Role Badge, Status Koneksi WebSocket (Connected/Disconnected badge), OBS Source Copy Link, Tombol Logout, dan Navigasi Admin (`Users`).
   - Main content area: Grid 3 kolom (Left: Song Library, Center: Setlist Rundown, Right: Live Control Panel).

## ✅ Acceptance Criteria
- [x] Pengguna dapat login dan diredirect ke Dashboard Utama.
- [x] Session bertahan saat browser di-refresh (persisted in `localStorage`).
- [x] Halaman utama memiliki tata letak 3-kolom yang rapi dan responsif.
- [x] Type check TypeScript 100% pass (`npm run lint`).
