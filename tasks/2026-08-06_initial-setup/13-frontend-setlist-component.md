# TASK-13: Frontend Setlist Rundown Component (Column 2) ✅ [SELESAI]

## 🎯 Goal
Mengembangkan komponen Rundown Setlist pada Kolom 2 Dashboard Operator, yang mendukung pembuatan setlist baru, memilih/memuat setlist tersimpan, menambahkan/menghapus lagu, dan mengubah urutan item setlist.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-02 (Column 2) & FR-04 Setlist Management
- [FEATURES.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/FEATURES.md) - Section: Setlist Management

## 📁 Target Files
- `frontend/src/components/SetlistRundown.tsx`

## 📝 Detailed Requirements
1. **Component UI & Features (`SetlistRundown.tsx`):**
   - **Dropdown Selector & Actions Top Bar:** Dropdown untuk memilih setlist tersimpan, tombol "New Setlist", tombol "Save Setlist".
   - **List Item Setlist:** Menampilkan daftar lagu/pengumuman terurut dalam setlist.
   - **Reordering Controls:** Tombol navigasi urutan (Move Up / Move Down) untuk menggeser posisi lagu dalam rundown secara instan.
   - **Seleksi Lagu untuk Live Control:** Menghubungkan klik pada item lagu dalam setlist ke Kolom 3 (Live Control Panel) untuk menampilkan lirik lagu tersebut.
   - **Highlight Active Item:** Menandai lagu yang sedang dipilih/ditayangkan dengan border ring emas (`ring-amber-500/30`) visual khusus.
   - **Custom Announcement Item:** Memungkinkan penambahan item teks pengumuman kustom langsung ke rundown.

## ✅ Acceptance Criteria
- [x] Setlist dapat disimpan, dimuat ulang, dan diperbarui urutannya via reorder controls.
- [x] Mengklik item lagu di setlist mengisi Kolom 3 dengan daftar tombol chunk lirik lagu tersebut.
- [x] Type check TypeScript 100% pass (`npm run lint`).
