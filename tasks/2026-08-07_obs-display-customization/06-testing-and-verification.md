# TASK-06: Integration & E2E Playwright Verification Tests ✅ [SELESAI]

## 🎯 Goal
Membuat pengujian integrasi backend (PHPUnit 18 test cases) dan pengujian otomatis End-to-End Playwright (16 E2E test cases) untuk memverifikasi alur kustomisasi tampilan OBS dari Control Panel hingga perubahan visual dinamis di OBS Overlay, termasuk Sandbox Preview Mode, Preset Profile Management, pengujian kasus batas (edge cases), XSS sanitization, dan aturan validasi.

## 📄 Blueprint References
- [PRD.md](../../docs/feature/obs-display-customization/PRD.md) - Section: Success Metrics & KPIs & Risk Analysis
- [REQUIREMENTS.md](../../docs/feature/obs-display-customization/REQUIREMENTS.md) - Section: Non-Functional Requirements & Performance
- [API.md](../../docs/feature/obs-display-customization/API.md) - Section: Authentication, Authorization & Status Codes

## 📁 Target Files
- `backend/tests/Feature/DisplaySettingApiTest.php`
- `frontend/e2e/obs-display-customization.spec.ts`
- `tasks/2026-08-07_obs-display-customization/VERIFICATION_REPORT.md`

## 📝 Detailed Requirements

### 1. Backend Integration Tests (`DisplaySettingApiTest.php` - 18 Test Cases)

#### 🔹 Core Functional Tests
- `test_can_get_active_display_settings`: Memverifikasi endpoint `GET /api/v1/display/settings` mengembalikan data default style dengan status HTTP 200 OK.
- `test_can_update_display_settings`: Memverifikasi `PUT /api/v1/display/settings` oleh Operator/Admin memperbarui record di database dan memicu event broadcasting `DisplaySettingsUpdatedEvent`.
- `test_validates_display_settings_input`: Memverifikasi input `font_size` di luar rentang (misal 5px atau 200px) ditolak dengan HTTP 422 Unprocessable Entity.
- `test_caches_active_display_settings_in_redis`: Memverifikasi key Redis `active_display_setting` terisi saat fetch dan di-refresh otomatis saat update.
- `test_can_get_display_presets_list`: Memverifikasi `GET /api/v1/display/presets` mengembalikan daftar seluruh preset tersimpan.
- `test_can_create_new_display_preset`: Memverifikasi `POST /api/v1/display/presets` membuat preset baru dengan nama kustom.
- `test_can_update_existing_display_preset`: Memverifikasi `PUT /api/v1/display/presets/{id}` memperbarui atribut preset tersimpan.
- `test_can_activate_display_preset_and_broadcast_event`: Memverifikasi `POST /api/v1/display/presets/{id}/activate` mengaktifkan preset secara atomik dan memicu event `DisplaySettingsUpdatedEvent`.
- `test_cannot_delete_currently_active_display_preset`: Memverifikasi penolakan HTTP 422 jika mencoba menghapus preset yang sedang aktif di siaran langsung.
- `test_can_delete_inactive_display_preset`: Memverifikasi penghapusan preset yang sedang tidak aktif.

#### ⚡ Edge Cases & Security Tests
- `test_returns_default_settings_when_no_records_exist`: (Auto-Recovery) Jika tabel `display_settings` kosong (misal setelah cleanup database), `GET /api/v1/display/settings` membuat record default secara otomatis dan mengembalikan HTTP 200 tanpa error.
- `test_unauthenticated_user_cannot_update_display_settings`: Memverifikasi request `PUT /api/v1/display/settings` tanpa token autentikasi (guest) ditolak dengan HTTP 401 Unauthorized.
- `test_partial_update_preserves_other_attributes`: Memverifikasi request update parsial (misal hanya mengirim `font_size: 72`) hanya meng-update `font_size` dan tetap mempertahankan nilai atribut lainnya.
- `test_validates_extreme_boundary_values`: Memverifikasi penolakan HTTP 422 untuk nilai enum & numerik di luar batas (`font_weight` invalid, `text_transform` invalid, `align_items` invalid, opacity > 100).
- `test_accepts_boundary_minimum_and_maximum_values`: Memverifikasi request sukses (HTTP 200) untuk batas persis minimum (`font_size: 16`, `opacity: 0`) dan maksimum (`font_size: 120`, `opacity: 100`).
- `test_validates_various_color_formats`: Memverifikasi validasi format warna (menerima short HEX, 6-digit HEX, RGBA, RGB; menolak XSS & HEX invalid).
- `test_atomic_single_active_setting_guarantee`: Memverifikasi bahwa saat method `$setting->activate()` dipanggil, seluruh record lain otomatis diset `is_active = false`.
- `test_only_one_display_setting_can_be_active_system_wide`: Memverifikasi bahwa dari beberapa preset yang tersimpan di database (`Preset 1`, `Preset 2`, `Preset 3`), sistem secara ketat menjamin `DisplaySetting::where('is_active', true)->count() === 1`.

---

### 2. Frontend End-to-End Tests (`obs-display-customization.spec.ts` - 16 Test Cases)

#### 🎨 UI Controls & Dynamic Styling Tests
- `E2E-01`: Operator membuka modal `Display Style`, menggeser font size ke `60px`, mengubah warna teks ke `#FFD700`, dan mengaktifkan background box.
- `E2E-02`: Memverifikasi komponen Mini OBS Preview meng-update inline style `fontSize: 27px` (skala `0.45x`) dan `color: rgb(255, 215, 0)`.
- `E2E-03 (Text Transform)`: Memverifikasi perubahan `Text Transform` (`UPPERCASE`, `Capitalize`, `As-Is`) mengubah kapitalisasi teks sampel lirik di Mini OBS Preview.
- `E2E-04 (Horizontal & Vertical Padding)`: Memverifikasi pergeseran slider padding vertical & horizontal memperbarui inline style `padding` pada elemen inner box.
- `E2E-05 (Container Max Width & Background Condition)`: Memverifikasi bahwa saat `Enable Background Box = True`, mengubah max width (`3XL`, `5XL`, `7XL`) mengubah class lebar kontainer di Mini Preview; dan saat `Enable Background Box = False`, kontainer otomatis kembali menggunakan `max-w-full`.

#### 🧪 Sandbox Preview & Preset Management Tests
- `E2E-06 (Sandbox Preview Mode)`: Memverifikasi mengeklik kartu preset lain hanya mengubah `previewSettings` di Mini OBS Preview (`👁️ PREVIEWING`), tanpa mengubah layar siaran langsung OBS Studio.
- `E2E-07 (Apply & Activate to OBS Live)`: Memverifikasi mengeklik tombol `Apply to OBS Live` mengaktifkan preset tersebut ke layar OBS Broadcast dan memperbarui badge `🟢 LIVE ON AIR`.
- `E2E-08 (Update Existing Preset)`: Memverifikasi tombol `Save Changes to Preset` memanggil `PUT /api/v1/display/presets/{id}` dan memperbarui atribut preset tersimpan tanpa membuat baris preset baru.
- `E2E-09 (Create New Preset)`: Memverifikasi modal dialog `Save as New Preset...` muncul, menerima input nama preset baru, dan menambahkannya ke daftar kartu preset.
- `E2E-10 (Delete Inactive Preset)`: Memverifikasi tombol hapus (trash icon) pada preset yang sedang tidak aktif berhasil menghapus preset tersebut dari daftar.

#### ⚡ Edge Cases & Security UI Tests
- `E2E-11 (Low Contrast Warning)`: Memverifikasi bahwa saat teks warna putih (`#FFFFFF`) diset di atas background warna putih (`#FFFFFF`), badge peringatan *Low Contrast Warning* otomatis muncul di UI.
- `E2E-12 (Cannot Delete Active Live Preset)`: Memverifikasi tombol hapus (trash icon) dinonaktifkan / tidak muncul pada preset yang sedang berstatus `🟢 LIVE ON AIR`.
- `E2E-13 (XSS Input Color Safety)`: Memverifikasi penginputan script XSS (`<script>alert(1)</script>`) pada input warna tidak mengeksekusi script dan *fallback* secara aman ke warna default.
- `E2E-14 (Extreme Long Lyric Line Wrapping)`: Memverifikasi lirik yang sangat panjang pada layar `/display` terbungkus (*line wrap*) secara rapi tanpa meluber keluar dari batas layar.

#### 🔄 Synchronization & Reliability Tests
- `E2E-15 (Real-Time WebSocket Sync)`: Membuka jendela OBS Display di `/display` dan memastikan gaya visual di `/display` secara otomatis ter-update via WebSocket tanpa me-refresh halaman.
- `E2E-16 (Zero-Flicker & Reload Persistence)`: Memverifikasi bahwa saat halaman `/display` (OBS Overlay) di-reload, tampilan lirik langsung dirender menggunakan styling dari `localStorage` tanpa *flash of unstyled content* (FOUC) dan tombol `"Reset Default"` mengembalikan nilai ke default PentasLirik (`48px`, `#FFFFFF`).

---

### 3. Laporan Verifikasi (`VERIFICATION_REPORT.md`)
- Dokumentasikan hasil eksekusi pengujian PHPUnit (18/18 passing) dan Playwright E2E test suite (16/16 passing).

---

## ✅ Acceptance Criteria
- [x] Running `docker exec pentas_lirik_backend php artisan test --filter=DisplaySettingApiTest` LULUS 100% (seluruh 18 test cases) tanpa error.
- [x] Running `npx playwright test e2e/obs-display-customization.spec.ts` di frontend LULUS 100% (seluruh 16 E2E test cases).
- [x] Laporan `VERIFICATION_REPORT.md` dibuat dengan bukti hasil pengujian yang sukses.
