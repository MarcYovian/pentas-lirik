# TASK-12: Frontend Song Library Component (Column 1) ✅ [SELESAI]

## 🎯 Goal
Mengembangkan komponen pustaka lagu pada Kolom 1 Dashboard Operator, yang mendukung fitur pencarian cepat, daftar lagu yang dapat di-scroll, modal pembuatan lagu baru, dan modal edit/hapus lagu.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-02 (Column 1) & FR-03 Song Management
- [USER_FLOW.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/USER_FLOW.md) - Section: Song Creation Flow

## 📁 Target Files
- `frontend/src/components/SongLibrary.tsx`
- `frontend/src/components/SongModal.tsx`

## 📝 Detailed Requirements
1. **Component UI & Features (`SongLibrary.tsx`):**
   - **Input Pencarian:** Input real-time untuk memfilter daftar lagu berdasarkan judul atau artis.
   - **Daftar Lagu:** List vertikal lagu dengan informasi Judul, Artis, dan jumlah chunk.
   - **Tombol "+ Rundown":** Menambahkan lagu langsung ke Setlist rundown yang sedang aktif.
   - **Tombol "New Song":** Membuka modal form `SongModal`.
2. **Modal Form & Preview (`SongModal.tsx`):**
   - Field `Title` (wajib), `Artist` (opsional).
   - Textarea multi-line untuk `Lyrics` dengan petunjuk format chunking (e.g. `[VERSE 1]`, `[CHORUS]`).
   - Live Preview Chunking: Menguraikan lirik mentah menjadi kotak-kotak chunk secara real-time saat mengetik.
   - Dialog konfirmasi hapus lagu safe-delete.

## ✅ Acceptance Criteria
- [x] Operator dapat mencari lagu secara cepat dari pustaka lagu berdasarkan judul/artis.
- [x] Menambah atau mengubah lagu dengan tag `[LABEL]` berhasil memperbarui pustaka dan preview chunk-nya secara otomatis.
- [x] Tombol "+ Rundown" dengan mudah meneruskan lagu ke komponen Setlist rundown.
- [x] Type check TypeScript 100% pass (`npm run lint`).
