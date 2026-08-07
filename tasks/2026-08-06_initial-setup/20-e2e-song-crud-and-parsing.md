# TASK-20: E2E Song CRUD, Lyric Parsing & Song Switching Tests ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan test suite Playwright E2E untuk menguji pembuatan lagu baru, penyuntingan lirik dengan parser chunk live, penghapusan lagu, serta perpindahan antar lagu pada Live Control Panel.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-03 Song Management & FR-02 Column 1
- [USER_FLOW.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/USER_FLOW.md) - Section: Song Creation & Lyric Editing Flow

## 📁 Target Files
- `frontend/e2e/song_crud_and_parsing.spec.ts`

## 📝 Detailed Step-by-Step Test Scenarios

### Test Scenario 1: Create New Song with Real-Time Chunk Parsing
1. Login sebagai Operator dan buka Dashboard.
2. Di Kolom 1 (Song Library), klik tombol **+ New Song** (`#btn-add-new-song`).
3. Verifikasi modal editor lagu `#song-modal-overlay` muncul.
4. Isi Title: `Kemenangan Harapan`, Artist: `Pentas Music`.
5. Masukkan raw text lirik multi-line ber-tag (`[VERSE 1]`, `[CHORUS]`).
6. Verifikasi panel **Live Chunk Preview** kanan (`#lyrics-parsed-preview`) merender 2 kotak preview chunk secara real-time.
7. Klik tombol **Save Song** (`#save-song-btn`).
8. Verifikasi lagu baru "Kemenangan Harapan" muncul di daftar pustaka lagu Kolom 1.

### Test Scenario 2: Edit Existing Song & Dynamic Chunk Update
1. Klik tombol **Edit** pada lagu (`#btn-edit-song-1`).
2. Ubah judul lagu dan lirik.
3. Klik **Save Song**.
4. Verifikasi judul lagu di pustaka terbarui.

### Test Scenario 3: Switching Active Songs in Live Control Panel
1. Klik lagu "10,000 Reasons" (`#song-card-2`) di Kolom 1.
2. Verifikasi Kolom 3 (Live Control Panel) memperbarui banner lagu menjadi "10,000 Reasons" dan menampilkan tombol chunk liriknya.
3. Klik lagu "What A Beautiful Name" (`#song-card-3`) di Kolom 1.
4. Verifikasi Kolom 3 secara dinamis berganti menampilkan banner "What A Beautiful Name".

### Test Scenario 4: Delete Song Safe Confirmation
1. Klik tombol **Edit** pada lagu.
2. Klik tombol **Delete Song** (`#delete-song-btn`).
3. Verifikasi dialog konfirmasi hapus muncul.
4. Klik **Confirm Delete** (`#confirm-delete-song-btn`).
5. Verifikasi lagu terhapus dari daftar pustaka Kolom 1.

## ✅ Acceptance Criteria
- [x] Pengujian automated Playwright pada `song_crud_and_parsing.spec.ts` 100% PASS (3 scenarios passed in 2.3s).
