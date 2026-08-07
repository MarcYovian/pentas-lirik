# TASK-08: Setlist & Setlist Items CRUD API ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan API endpoint untuk pengelolaan Setlist (penjadwalan daftar lagu untuk acara) dan pengurutan item setlist (drag-and-drop support).

## 📄 Blueprint References
- [API.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/API.md) - Section: Setlist Endpoints (`/api/v1/setlists`)
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-04 Setlist Management

## 📁 Target Files
- `backend/app/Http/Controllers/Api/V1/SetlistController.php`
- `backend/app/Http/Requests/StoreSetlistRequest.php`
- `backend/app/Http/Requests/ReorderSetlistItemsRequest.php`
- `backend/app/Http/Resources/SetlistResource.php`
- `backend/routes/api.php`
- `backend/tests/Feature/SetlistApiTest.php`

## 📝 Detailed Requirements
1. **API Endpoints:**
   - `GET /api/v1/setlists`: Menampilkan semua setlist yang tersimpan.
   - `GET /api/v1/setlists/{id}`: Menampilkan detail setlist beserta item lagu di dalamnya (terurut berdasarkan `order`).
   - `POST /api/v1/setlists`: Membuat setlist baru dengan nama acara.
   - `PUT /api/v1/setlists/{id}`: Mengubah nama setlist.
   - `DELETE /api/v1/setlists/{id}`: Menghapus setlist.
   - `POST /api/v1/setlists/{id}/items`: Menambahkan lagu ke dalam setlist.
   - `DELETE /api/v1/setlists/{id}/items/{itemId}`: Menghapus lagu dari setlist.
   - `PUT /api/v1/setlists/{id}/reorder`: Memperbarui urutan item setlist berdasarkan array urutan ID baru.
2. **Access Control:**
   - Menggunakan middleware `auth:sanctum` (Role `ADMIN` & `OPERATOR`).

## ✅ Acceptance Criteria
- [x] Setlist dapat dibuat, dimuat, dan diedit melalui API.
- [x] Endpoint `reorder` berhasil memperbarui kolom `order` pada tabel `setlist_items` secara konsisten dalam database transaction.
- [x] Test otomatis `SetlistApiTest` lari dan 100% pass (8 tests passed, 36 assertions).
