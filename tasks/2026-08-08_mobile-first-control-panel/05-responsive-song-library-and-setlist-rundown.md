# TASK-05: Mobile Responsive Song Library, Song Modal & Setlist Rundown ✅ [SELESAI]

## 🎯 Goal
Mengubah data tabel desktop yang kaku pada `SongLibrary.tsx`, `SongModal.tsx`, `SetlistRundown.tsx`, dan `UserManagementModal.tsx` menjadi komponen kartu responsif (*mobile-first responsive cards*) yang dilengkapi menu aksi sentuh, tombol pengatur urutan setlist (Up/Down handles), serta modal full-screen mobile yang bebas dari kendala terhalang keyboard virtual.

## 📄 Blueprint References
- [FEATURES.md](../../docs/feature/2026-08-08_mobile-first-control-panel/FEATURES.md) - Section: Feature 4 (Mobile Song Library & Setlist Rundown)
- [REQUIREMENTS.md](../../docs/feature/2026-08-08_mobile-first-control-panel/REQUIREMENTS.md) - Section: FR-04 (Responsive Mobile Song Library & Setlist Management)

## 📁 Target Files
- `frontend/src/components/SongLibrary.tsx`
- `frontend/src/components/SongModal.tsx`
- `frontend/src/components/SetlistRundown.tsx`
- `frontend/src/components/UserManagementModal.tsx`

## 📝 Detailed Steps & Technical Requirements

1. **Responsive Song Library Cards (`SongLibrary.tsx`):**
   - Pada desktop (`>= 768px`): Pertahankan tabel data lagu lengkap.
   - Pada mobile (`< 768px`): Sembunyikan tag `<table>` (`hidden md:table`) dan gantikan dengan daftar kartu lagu (`block md:hidden`).
   - Setiap kartu lagu berisi: Judul lagu berukuran tebal (`text-base font-bold`), penyanyi/artis, nada dasar (`Key badge`), jumlah bait, serta tombol aksi cepat:
     - `[ ➕ Setlist ]`: Menambahkan lagu ke setlist aktif.
     - `[ ✏️ Edit ]`: Membuka modal sunting lagu.
     - `[ 🗑️ Hapus ]`: Menghapus lagu dari pustaka.
   - Posisikan search bar dan filter kategori di bagian atas sebagai sticky header ringkas.

2. **Touch-Friendly Setlist Reordering (`SetlistRundown.tsx`):**
   - Buat kartu urutan lagu setlist yang dilengkapi tombol panah naik/turun (`[ ⬆️ ]` `[ ⬇️ ]`) berukuran sentuh `44x44px` untuk memindahkan posisi lagu di setlist secara mudah tanpa memerlukan drag-and-drop mouse desktop.
   - Tambahkan tombol aksi prominen di bagian atas: `"▶️ Mainkan di Mobile Control Panel"` yang mengarahkan operator langsung ke `LiveControlPanel.tsx` dengan setlist tersebut sebagai setlist aktif.

3. **Responsive Song Modal & User Management Modal (`SongModal.tsx`, `UserManagementModal.tsx`):**
   - Ubah modal dialog desktop menjadi modal full-screen / bottom-sheet drawer pada layar smartphone (`fixed inset-0 z-50 flex flex-col bg-slate-900 overflow-y-auto p-4 md:p-6`).
   - Tempatkan tombol aksi utama (`[ Simpan Lagu ]`, `[ Batal ]`) di bagian bottom sticky footer modal agar tetap terlihat meski pengguna sedang mengetik teks bait lagu di dalam form input.

## ✅ Acceptance Criteria
- [x] `SongLibrary.tsx` menampilkan kartu lagu responsif pada mobile tanpa scroll bar horisontal.
- [x] `SetlistRundown.tsx` memungkinkan pengubahan urutan lagu setlist dengan tombol panah naik/turun sentuh `44x44px`.
- [x] Mengetuk tombol "+ Setlist" atau item rundown langsung dapat dioperasikan secara ergonomis pada layar mobile.
- [x] Modal `SongModal.tsx` dan `UserManagementModal.tsx` tampil rapi secara full-screen / mobile-first card list.

