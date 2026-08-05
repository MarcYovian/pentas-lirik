# TASK-14: Frontend Live Control Panel, Announcements & Keyboard Shortcuts (Column 3) ✅ [SELESAI]

## 🎯 Goal
Mengembangkan pusat kontrol live pada Kolom 3 Dashboard Operator yang menampilkan tombol chunk lirik, indikator visual status tayangan live, tombol Clear Screen (Blackout), modul pengumuman kilat, serta integrasi Keyboard Shortcuts global (`Spacebar` & `Escape`).

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-02 (Column 3), FR-05, FR-06, FR-07, FR-08
- [DESIGN.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/DESIGN.md) - Section: Live Controller Specifications & Keyboard Shortcuts

## 📁 Target Files
- `frontend/src/components/LiveControlPanel.tsx`

## 📝 Detailed Requirements
1. **Component UI & Features (`LiveControlPanel.tsx`):**
   - **Tampilan Chunk Lirik:** Menampilkan tombol-tombol chunk lirik (`[VERSE 1]`, `[CHORUS]`, `[BRIDGE]`) dari lagu yang sedang dipilih di Kolom 2. Setiap tombol memperlihatkan label dan cuplikan teks lirik.
   - **Visual State Indicator (FR-06):** Chunk yang sedang aktif ditayangkan di OBS disorot secara tegas dengan background merah solid (`bg-red-600`) dan badge "LIVE ON AIR" berkedip.
   - **Tombol Clear Screen / Blackout (FR-05):** Tombol merah menonjol untuk langsung mengosongkan tampilan layar live.
   - **Modul Pengumuman Ad-Hoc (FR-08):** Textarea teks pengumuman kilat + tombol "Send Live Overlay".
   - **Pratinjau Chunk Berikutnya:** Toggle Preview Mode yang memperlihatkan Next Chunk Preview dan tombol "Push Live".
2. **Global Keyboard Shortcuts (FR-07):**
   - `Spacebar`: Berpindah ke chunk lirik berikutnya. Jika di chunk `N`, kirim `N+1`. Jika di chunk terakhir, bersihkan layar (clear).
   - `Escape`: Langsung memicu fungsi "Clear Screen".
   - Mengabaikan shortcut jika fokus sedang berada pada input/textarea form!

## ✅ Acceptance Criteria
- [x] Mengklik tombol chunk lirik langsung mengirim teks ke backend/OBS dan menyorot tombol dengan latar belakang merah solid.
- [x] Tombol `Clear Screen` menghapus tayangan layar dan menghilangkan highlight chunk.
- [x] Menekan tombol `Spacebar` memajukan lirik ke chunk berikutnya dengan presisi.
- [x] Menekan tombol `Escape` seketika membersihkan layar live display.
- [x] Type check TypeScript 100% pass (`npm run lint`).
