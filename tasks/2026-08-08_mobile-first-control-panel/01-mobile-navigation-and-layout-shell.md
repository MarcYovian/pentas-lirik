# TASK-01: Mobile Responsive Layout Shell & Navigation Drawer ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan struktur tata letak dasar yang responsif (*mobile-first layout shell*) pada `Navbar.tsx` dan `App.tsx`, yang mencakup navigasi header ringkas, tombol hamburger untuk layar mobile (`< 768px`), slide-out navigation drawer dengan efek backdrop blur, indikator koneksi WebSocket real-time, serta penyesuaian kontainer utama agar bebas dari *horizontal scroll overflow*.

## 📄 Blueprint References
- [ARCHITECTURE.md](../../docs/feature/2026-08-08_mobile-first-control-panel/ARCHITECTURE.md) - Section: Component Architecture & Breakpoints
- [DESIGN.md](../../docs/feature/2026-08-08_mobile-first-control-panel/DESIGN.md) - Section: Mobile Top Header & Navigation Drawer
- [REQUIREMENTS.md](../../docs/feature/2026-08-08_mobile-first-control-panel/REQUIREMENTS.md) - Section: FR-01 (Mobile-First UI Foundation)

## 📁 Target Files
- `frontend/src/components/Navbar.tsx`
- `frontend/src/App.tsx`
- `frontend/src/index.css`

## 📝 Detailed Steps & Technical Requirements

1. **Header App Bar Responsif (`Navbar.tsx`):**
   - Buat header sticky di bagian atas (`sticky top-0 z-40 h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800`).
   - Sisi kiri: Logo PentasLirik & brand badge ringkas.
   - Sisi tengah/kanan (Desktop `hidden md:flex`): Tautan menu biasa (Live Control, Song Library, Setlists, Display Settings, User Management).
   - Sisi kanan (Mobile `flex md:hidden`):
     - Indikator status koneksi WebSocket (titik hijau berpijar saat connected, merah saat disconnected).
     - Tombol Hamburger Menu (`48x48px` touch target, icon `Menu` / `X` dari `lucide-react`).

2. **Mobile Navigation Drawer & Backdrop Overlay:**
   - Tambahkan state `isMobileMenuOpen` (`boolean`) di `Navbar.tsx`.
   - Render backdrop overlay animasi (`fixed inset-0 bg-black/60 backdrop-blur-sm z-50`) yang menutup drawer saat diklik.
   - Render drawer panel dari sisi kiri layar (`fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 p-5 z-50 shadow-2xl flex flex-col justify-between`).
   - Gunakan animasi transisi halus dari `motion/react` (`initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}`).
   - Tautkan semua navigasi halaman dengan ikon visual, teks berukuran jelas (`text-base font-semibold`), dan touch target tinggi minimal `48px`.
   - Menutup drawer otomatis setelah pengguna memilih salah satu menu navigasi.

3. **Responsive Main Container Layout (`App.tsx`):**
   - Pastikan wrapper halaman utama memiliki `min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden`.
   - Sesuaikan padding kontainer utama agar tidak terpotong oleh sticky header di atas maupun sticky stepper bar di bawah pada layar mobile (`px-3 py-3 md:px-6 md:py-6 pb-24 md:pb-6`).

4. **Global Mobile Style Rules (`index.css`):**
   - Tambahkan helper utility CSS untuk safe area bottom iOS (`padding-bottom: env(safe-area-inset-bottom)`).
   - Nonaktifkan seleksi teks tidak sengaja pada tombol kontrol mobile (`user-select: none`).

## ✅ Acceptance Criteria
- [x] Header `Navbar.tsx` tampil rapi tanpa overflow pada ukuran layar 360px, 390px, 414px, dan 768px.
- [x] Tombol hamburger muncul pada layar `< 768px` dan tersembunyi pada desktop (`>= 768px`).
- [x] Mengetuk tombol hamburger membuka mobile drawer dengan animasi halus dan backdrop overlay.
- [x] Mengetuk menu navigasi di drawer berpindah halaman dan otomatis menutup drawer.
- [x] Touch target seluruh ikon/tombol di header minimal `44x44px`.
