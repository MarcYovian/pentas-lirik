# TASK-03: Frontend TypeScript Types, API Service & State Hook ✅ [SELESAI]

## 🎯 Goal
Membuat antarmuka TypeScript (`DisplaySetting.ts`), modul API service (`displaySettingService.ts`), serta custom React hook (`useDisplaySettings.ts`) dengan kemampuan auto-save debounced (300ms), pendengar WebSocket event, dan manajemen profil preset (load, create, update, preview sandbox, activate, delete).

## 📄 Blueprint References
- [ARCHITECTURE.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/feature/obs-display-customization/ARCHITECTURE.md) - Section: Component Breakdown & State Management
- [REQUIREMENTS.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/feature/obs-display-customization/REQUIREMENTS.md) - Section: FR-01 s/d FR-04 & Non-Functional Performance
- [API.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/feature/obs-display-customization/API.md) - Section: Preset Profiles Management

## 📁 Target Files
- `frontend/src/types/DisplaySetting.ts`
- `frontend/src/services/displaySettingService.ts`
- `frontend/src/hooks/useDisplaySettings.ts`

## 📝 Detailed Requirements
1. **TypeScript Interface (`DisplaySetting.ts`):**
   - Interface `DisplaySetting` mencakup semua field: `id`, `name`, `is_active`, `font_size`, `font_weight`, `text_transform`, `align_items`, `text_color`, `text_shadow_color`, `text_shadow_blur`, `text_stroke_width`, `text_stroke_color`, `show_background`, `background_color`, `background_opacity`, `padding_vertical`, `padding_horizontal`, `border_radius`, `max_width`.
   - Interface `UpdateDisplaySettingPayload` (semua field bersifat opsional).
   - Interface `CreateDisplayPresetPayload` (`name` required, atribut styling opsional).
   - Const `DEFAULT_DISPLAY_SETTING` untuk nilai fallback.

2. **API Service (`displaySettingService.ts`):**
   - `getDisplaySettings()`: Memanggil `GET /api/v1/display/settings`.
   - `updateDisplaySettings(payload: UpdateDisplaySettingPayload)`: Memanggil `PUT /api/v1/display/settings`.
   - `getPresets()`: Memanggil `GET /api/v1/display/presets` untuk mengambil seluruh daftar preset.
   - `createPreset(payload: CreateDisplayPresetPayload)`: Memanggil `POST /api/v1/display/presets`.
   - `updatePreset(id: number, payload: UpdateDisplaySettingPayload)`: Memanggil `PUT /api/v1/display/presets/${id}` untuk menyimpan perubahan preset tersimpan.
   - `activatePreset(id: number)`: Memanggil `POST /api/v1/display/presets/${id}/activate`.
   - `deletePreset(id: number)`: Memanggil `DELETE /api/v1/display/presets/${id}`.
   - `resetToDefaultSettings()`: Merestorasi opsi ke `DEFAULT_DISPLAY_SETTING`.

3. **Custom Hook Sandbox State (`useDisplaySettings.ts`):**
   - State `liveSettings`: Menyimpan konfigurasi styling yang **saat ini sedang aktif disiarkan di OBS Live**.
   - State `previewSettings`: Menyimpan konfigurasi styling yang **saat ini sedang di-inspect / di-edit pada Mini OBS Preview** (Sandbox Mode tanpa merusak siaran langsung).
   - State `presets`: Menyimpan daftar seluruh profil preset (`DisplaySetting[]`).
   - State `selectedPresetId`: Menyimpan ID preset yang sedang dibuka/di-edit.
   - State `isLoading`, `isSaving`, `isActivating`, `error`.
   - Method `selectPresetForPreview(preset: DisplaySetting)`: Membuka gaya preset untuk dilihat/diedit di Mini OBS Preview tanpa mengubah siaran langsung.
   - Method `saveCurrentPresetChanges()`: Memperbarui perubahan atribut ke preset terpilih (`PUT /api/v1/display/presets/{id}`).
   - Method `saveAsNewPreset(name: string)`: Menyimpan kombinasi styling saat ini sebagai preset baru.
   - Method `activatePresetToLive(id: number)`: Mengaktifkan preset pilihan ke siaran langsung OBS, meng-update status `is_active` di local `presets` state, me-refresh `liveSettings` state, dan memperbarui `localStorage.setItem('obs_display_settings', JSON.stringify(activated))`.
   - Method `deletePreset(id: number)`: Menghapus preset dari database dan local state.
   - **Debounced Save (300ms):** Terapkan debounce pada fungsi update agar slider input tidak membanjiri API request per milidetik.
   - **Real-Time Event Integration:** Berlangganan event `display:settings-updated` pada channel `display` via Echo/Reverb listener untuk memperbarui `liveSettings` dan status active `presets` secara real-time jika ada perubahan dari client lain.

## ✅ Acceptance Criteria
- [x] Interface `DisplaySetting` selaras dengan skema database backend.
- [x] Custom hook `useDisplaySettings` memisahkan state `liveSettings` (OBS Live) dan `previewSettings` (Mini OBS Sandbox).
- [x] Membuka/mengeklik preset lain hanya mengubah `previewSettings` dan Mini OBS Preview tanpa mengganggu `liveSettings` OBS Broadcast.
- [x] Tombol simpan perubahan preset berhasil memanggil `PUT /api/v1/display/presets/{id}` untuk meng-update preset existing.
- [x] Tombol `Apply & Activate to OBS Live` memicu broadcast real-time ke layar OBS.
