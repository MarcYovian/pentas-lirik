# TASK-04: Database Schema, Migrations & Eloquent Models ✅ [SELESAI]

## 🎯 Goal
Membuat migrasi database MySQL (di dalam container Sail) dan model Eloquent Laravel sesuai dengan skema database yang telah dispesifikasikan di `DATABASE.md`.

## 📄 Blueprint References
- [DATABASE.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/DATABASE.md) - Section: ERD, Table Definitions, Database Schema

## 📁 Target Files
- `backend/database/migrations/0001_01_01_000000_create_users_table.php`
- `backend/database/migrations/2026_08_05_000001_create_songs_table.php`
- `backend/database/migrations/2026_08_05_000002_create_lyric_chunks_table.php`
- `backend/database/migrations/2026_08_05_000003_create_setlists_table.php`
- `backend/database/migrations/2026_08_05_000004_create_setlist_items_table.php`
- `backend/app/Models/User.php`
- `backend/app/Models/Song.php`
- `backend/app/Models/LyricChunk.php`
- `backend/app/Models/Setlist.php`
- `backend/app/Models/SetlistItem.php`
- `backend/database/seeders/DatabaseSeeder.php`

## 📝 Detailed Requirements
1. **Migrations Creation:**
   - `users`: `id`, `name`, `email` (unique), `password`, `role` (enum: `ADMIN`, `OPERATOR`), `timestamps`.
   - `songs`: `id`, `title`, `artist` (nullable), `timestamps`.
   - `lyric_chunks`: `id`, `song_id` (foreign key, cascade delete), `label` (string, e.g. `[VERSE 1]`), `content` (text), `order` (integer), `timestamps`. Add unique index `(song_id, order)`.
   - `setlists`: `id`, `user_id` (foreign key, cascade delete), `name`, `timestamps`.
   - `setlist_items`: `id`, `setlist_id` (foreign key, cascade delete), `song_id` (foreign key, cascade delete), `order` (integer), `timestamps`. Add unique index `(setlist_id, order)`.
2. **Eloquent Models & Relationships:**
   - Model `User` hasMany `Setlist`.
   - Model `Song` hasMany `LyricChunk`, hasMany `SetlistItem`.
   - Model `LyricChunk` belongsTo `Song`.
   - Model `Setlist` belongsTo `User`, hasMany `SetlistItem`.
   - Model `SetlistItem` belongsTo `Setlist`, belongsTo `Song`.
3. **Database Seeder:**
   - Buat seeder untuk akun default:
     - Admin: `admin@pentaslirik.local` / `password` (Role: `ADMIN`)
     - Operator: `operator@pentaslirik.local` / `password` (Role: `OPERATOR`)
   - Buat sample data 2-3 lagu beserta liriknya untuk keperluan testing.

## ✅ Acceptance Criteria
- [x] Running `./vendor/bin/sail artisan migrate:fresh --seed` berjalan lancar tanpa error FK constraint.
- [x] Seluruh relasi model Eloquent diuji dan mengembalikan data yang valid (2 Users, 2 Songs, 5 Lyric Chunks, 1 Setlist).
