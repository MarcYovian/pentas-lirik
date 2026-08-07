# TASK-01: Database Schema, Migration & Eloquent Model ✅ [SELESAI]

## 🎯 Goal
Membuat migrasi database MySQL (menggunakan Docker Compose service backend), model Eloquent `DisplaySetting`, dan seeder default style untuk menyimpan konfigurasi kustomisasi tampilan OBS Display dan preset profil tema secara persisten.

## 📄 Blueprint References
- [DATABASE.md](../../docs/feature/2026-08-07_obs-display-customization/DATABASE.md) - Section: ERD & Table Schemas
- [REQUIREMENTS.md](../../docs/feature/2026-08-07_obs-display-customization/REQUIREMENTS.md) - Section: Data Persistence Requirements

## 📁 Target Files
- `backend/database/migrations/2026_08_07_000001_create_display_settings_table.php`
- `backend/app/Models/DisplaySetting.php`
- `backend/database/seeders/DisplaySettingSeeder.php`
- `backend/database/seeders/DatabaseSeeder.php`

## 📝 Detailed Requirements
1. **Database Migration (`create_display_settings_table`):**
   - Field `id` (Auto-increment PK).
   - Field `name` (string, default: `'Default Style'`).
   - Field `is_active` (boolean, default: `true`, indexed).
   - **Font & Typography:** `font_size` (integer, default: `48`), `font_weight` (string, default: `'800'`), `text_transform` (string, default: `'uppercase'`), `align_items` (string, default: `'center'`).
   - **Text Color & Effects:** `text_color` (string, default: `'#FFFFFF'`), `text_shadow_color` (string, default: `'rgba(0,0,0,0.8)'`), `text_shadow_blur` (integer, default: `10`), `text_stroke_width` (integer, default: `0`), `text_stroke_color` (string, default: `'#000000'`).
   - **Background Box:** `show_background` (boolean, default: `false`), `background_color` (string, default: `'rgba(0,0,0,0.6)'`), `background_opacity` (integer, default: `60`), `padding_vertical` (integer, default: `16`), `padding_horizontal` (integer, default: `32`), `border_radius` (integer, default: `12`), `max_width` (string, default: `'max-w-7xl'`).
   - Timestamps (`created_at`, `updated_at`).

2. **Eloquent Model (`DisplaySetting.php`):**
   - Definisi `$fillable` lengkap untuk semua atribut styling.
   - Type casting untuk boolean (`is_active`, `show_background`) dan integer (`font_size`, `text_shadow_blur`, `text_stroke_width`, `background_opacity`, `padding_vertical`, `padding_horizontal`, `border_radius`).
   - Static/Helper method `getActiveSetting()` untuk mengambil record yang sedang aktif (`is_active = true`).
   - Helper method `activate()` untuk transaksi atomik mematikan (`is_active = 0`) semua record lain sebelum mengaktifkan record target (`is_active = 1`).

3. **Database Seeder (`DisplaySettingSeeder.php`):**
   - Insert record default awal dengan name `'Default Style'` dan `is_active = true`.
   - Daftarkan `DisplaySettingSeeder` di `DatabaseSeeder.php`.

## ✅ Acceptance Criteria
- [x] Running `docker compose exec backend php artisan migrate --force` berhasil tanpa error.
- [x] Running `docker compose exec backend php artisan db:seed --class=DisplaySettingSeeder --force` berhasil membuat 1 record default aktif di tabel `display_settings`.
- [x] Panggilan `DisplaySetting::getActiveSetting()` mengembalikan record `Default Style`.
