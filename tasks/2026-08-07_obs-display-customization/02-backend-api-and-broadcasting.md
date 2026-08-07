# TASK-02: Backend API, Validation, Redis Caching & Event Broadcasting ✅ [SELESAI]

## 🎯 Goal
Mengembangkan REST API (`GET` & `PUT /api/v1/display/settings`), validasi masukan warna dan ukuran, caching Redis untuk performa instant load, serta event broadcasting Laravel Reverb (`display:settings-updated`).

## 📄 Blueprint References
- [API.md](../../docs/feature/2026-08-07_obs-display-customization/API.md) - Section: API Endpoints & Broadcasting Payload Format
- [ARCHITECTURE.md](../../docs/feature/2026-08-07_obs-display-customization/ARCHITECTURE.md) - Section: Real-Time Event Driven Synchronization
- [REQUIREMENTS.md](../../docs/feature/2026-08-07_obs-display-customization/REQUIREMENTS.md) - Section: Validation Rules & Performance

## 📁 Target Files
- `backend/app/Http/Controllers/Api/V1/DisplaySettingController.php`
- `backend/app/Http/Requests/UpdateDisplaySettingRequest.php`
- `backend/app/Events/DisplaySettingsUpdatedEvent.php`
- `backend/routes/api.php`

## 📝 Detailed Requirements
1. **Form Request & Validation (`UpdateDisplaySettingRequest.php`):**
   - Validasi `font_size`: integer, min 16, max 120.
   - Validasi `font_weight`: in (`'400'`, `'600'`, `'700'`, `'800'`).
   - Validasi `text_transform`: in (`'uppercase'`, `'capitalize'`, `'none'`).
   - Validasi `align_items`: in (`'left'`, `'center'`, `'right'`).
   - Validasi format warna (`text_color`, `text_shadow_color`, `text_stroke_color`, `background_color`): regex HEX/RGBA valid (`/^#(?:[0-9a-fA-F]{3}){1,2}$/` atau `rgba?\(...\)`).
   - Validasi `show_background`: boolean.
   - Validasi `background_opacity`: integer, min 0, max 100.
   - Validasi padding dan border radius: integer, min 0, max 100.

2. **Controller (`DisplaySettingController.php`):**
   - **`GET /api/v1/display/settings`**: Mengembalikan setting yang aktif (`is_active = true`).
     - Gunakan Redis Cache dengan key `active_display_setting` (TTL: 24 jam) untuk efisiensi fetch (< 20ms).
   - **`PUT /api/v1/display/settings`**: Memperbarui atribut styling active setting atau menyimpan preset baru.
     - Lakukan update ke database di dalam database transaction.
     - Invalidate/refresh cache Redis `active_display_setting`.
     - Trigger event `DisplaySettingsUpdatedEvent` membawa payload JSON styling terbaru.

3. **Preset Profiles Management (Endpoints):**
   - **`GET /api/v1/display/presets`**: Mengambil daftar semua preset tersimpan di database (`DisplaySetting::all()`).
   - **`POST /api/v1/display/presets`**: Membuat preset baru.
   - **`PUT /api/v1/display/presets/{id}`**: Memperbarui atribut styling preset tersimpan. Jika preset tersebut sedang aktif (`is_active = true`), me-refresh cache Redis dan mendistribusikan WebSocket event.
   - **`POST /api/v1/display/presets/{id}/activate`**: Memanggil `$preset->activate()`, me-refresh cache Redis `active_display_setting`, dan mentrigger WebSocket event `display:settings-updated`.
   - **`DELETE /api/v1/display/presets/{id}`**: Menghapus preset tersimpan (preset aktif tidak dapat dihapus).

4. **Event Broadcasting (`DisplaySettingsUpdatedEvent.php`):**
   - Implements `ShouldBroadcastNow` (atau `ShouldBroadcast`).
   - Channel Name: `ShouldBroadcast` pada channel presence/public `display`.
   - Event Name: `display:settings-updated`.
   - Broadcast payload berisi seluruh konfigurasi styling aktif (`font_size`, `text_color`, `show_background`, `background_color`, dll).

5. **Routes (`routes/api.php`):**
   - `GET /api/v1/display/settings` (Public / Operator).
   - `PUT /api/v1/display/settings` (Protected: Sanctum auth & RBAC `Operator`/`Admin`).
   - `GET /api/v1/display/presets` (Protected: Sanctum auth & RBAC `Operator`/`Admin`).
   - `POST /api/v1/display/presets` (Protected: Sanctum auth & RBAC `Operator`/`Admin`).
   - `POST /api/v1/display/presets/{id}/activate` (Protected: Sanctum auth & RBAC `Operator`/`Admin`).
   - `DELETE /api/v1/display/presets/{id}` (Protected: Sanctum auth & RBAC `Operator`/`Admin`).

## ✅ Acceptance Criteria
- [x] Endpoint `GET /api/v1/display/settings` mengembalikan HTTP 200 OK dengan JSON payload active setting.
- [x] Endpoint `PUT /api/v1/display/settings` menolak input `font_size` di luar rentang 16-120 dengan HTTP 422 Unprocessable Entity.
- [x] Update yang valid memicu pendelegasian WebSocket event `display:settings-updated` ke channel `display` via Laravel Reverb.
- [x] Cache Redis `active_display_setting` terbarui otomatis saat terjadi update styling.
- [x] Endpoint `GET /api/v1/display/presets`, `POST /api/v1/display/presets`, `PUT /api/v1/display/presets/{id}` & `POST /api/v1/display/presets/{id}/activate` berhasil meng-update/mengaktifkan preset terpilih dan memicu event WebSocket secara atomik.
