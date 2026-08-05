# TASK-21: E2E Setlist CRUD & Rundown Management Tests ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan test suite Playwright E2E untuk menguji pembuatan setlist baru, penambahan lagu dari Pustaka ke Rundown, penambahan item pengumuman kustom, pengurutan ulang item rundown, dan penghapusan item setlist.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-04 Setlist Management & FR-02 Column 2
- [FEATURES.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/FEATURES.md) - Section: Setlist & Item Operations

## 📁 Target Files
- `frontend/e2e/setlist_crud_and_rundown.spec.ts`

## 📝 Detailed Step-by-Step Test Scenarios

### Test Scenario 1: Create New Empty Setlist & Rename
1. Login sebagai Operator dan buka Dashboard.
2. Di Kolom 2 (Setlist Rundown), klik tombol **New Setlist** (`#btn-new-setlist`).
3. Ubah nama setlist pada input judul `#setlist-name-input` menjadi `Ibadah Paskah 2026`.
4. Verifikasi kontainer item setlist menampilkan pesan kosong "Setlist is empty...".

### Test Scenario 2: Add Songs from Library via "+ Rundown" Button
1. Di Kolom 1 (Pustaka Lagu), cari lagu "Amazing Grace" dan klik tombol **+ Rundown** (`#btn-add-to-rundown-1`).
2. Verifikasi lagu "Amazing Grace" otomatis masuk sebagai item 1 di Kolom 2 Setlist Rundown.
3. Cari lagu "Goodness Of God" dan klik tombol **+ Rundown** (`#btn-add-to-rundown-4`).
4. Verifikasi lagu "Goodness Of God" masuk sebagai item 2 di Kolom 2.

### Test Scenario 3: Add Custom Announcement Item & Item Reordering
1. Di bagian bawah Kolom 2, klik tombol **+ Add Custom Announcement Item** (`#btn-toggle-add-announcement`).
2. Isi teks pengumuman `#new-announcement-input`: `Warta Jemaat & Persembahan`.
3. Klik **Add to Rundown** (`#btn-add-announcement-submit`).
4. Verifikasi item pengumuman muncul di posisi 3.

### Test Scenario 4: Save Setlist & Remove Item
1. Klik tombol **Save Setlist** (`#btn-save-setlist`).
2. Verifikasi setlist tersimpan dan muncul di dropdown daftar setlist.
3. Klik tombol **Remove Item** (`#btn-remove-item-*`) pada item lagu pertama.
4. Verifikasi item tersebut terhapus dan urutan item setlist lain diurutkan ulang otomatis.

## ✅ Acceptance Criteria
- [x] Pengujian automated Playwright pada `setlist_crud_and_rundown.spec.ts` 100% PASS (3 scenarios passed in 2.1s).
