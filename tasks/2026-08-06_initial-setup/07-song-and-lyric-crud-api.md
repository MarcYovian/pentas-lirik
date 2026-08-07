# TASK-07: Song & Lyric Management CRUD API ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan RESTful API endpoint untuk manajemen lagu dan lirik (Search, List, Create, Read, Update, Delete) di backend Laravel.

## 📄 Blueprint References
- [API.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/API.md) - Section: Songs & Lyrics Endpoints (`/api/v1/songs`)
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-03 Song & Lyric Management

## 📁 Target Files
- `backend/app/Http/Controllers/Api/V1/SongController.php`
- `backend/app/Http/Requests/StoreSongRequest.php`
- `backend/app/Http/Requests/UpdateSongRequest.php`
- `backend/app/Http/Resources/SongResource.php`
- `backend/routes/api.php`
- `backend/tests/Feature/SongApiTest.php`

## 📝 Detailed Requirements
1. **API Endpoints:**
   - `GET /api/v1/songs`: Menampilkan daftar lagu (paginated & searchable via query `?q=search_term`).
   - `GET /api/v1/songs/{id}`: Menampilkan detail lagu lengkap dengan relasi `lyricChunks` yang sudah diurutkan berdasarkan `order`.
   - `POST /api/v1/songs`: Membuat lagu baru (`title`, `artist`, `lyrics`). Menggunakan `LyricParserService` untuk membuat record `lyric_chunks`.
   - `PUT /api/v1/songs/{id}`: Memperbarui judul/artis/lirik lagu dan memperbarui record `lyric_chunks`.
   - `DELETE /api/v1/songs/{id}`: Menghapus lagu beserta seluruh `lyric_chunks`-nya (cascade).
2. **Access Control:**
   - Menggunakan middleware `auth:sanctum` (dapat diakses oleh role `ADMIN` dan `OPERATOR`).
3. **API Resource & Validation:**
   - Gunakan Form Request validation untuk memastikan `title` wajib diisi.
   - Resource JSON format disesuaikan dengan standar respons API di `API.md`.

## ✅ Acceptance Criteria
- [x] Endpoint CRUD lagu berfungsi dengan respons JSON standar.
- [x] Pencarian lagu berdasarkan judul atau artis berfungsi cepat (`?q=search_term`).
- [x] Menyimpan/memperbarui lirik otomatis memicu `LyricParserService` dan mengupdate `lyric_chunks`.
- [x] Test otomatis `SongApiTest` lari dan 100% pass (7 tests passed, 42 assertions).
