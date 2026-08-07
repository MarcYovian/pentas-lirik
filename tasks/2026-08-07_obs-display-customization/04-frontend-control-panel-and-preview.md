# TASK-04: Frontend Display Settings Control Panel & Mini OBS Preview UI ✅ [SELESAI]

## 🎯 Goal
Mengembangkan antarmuka pengguna berupa Panel Pengaturan Tampilan (`DisplaySettingsPanel.tsx`) di Dashboard Admin/Operator dengan pemilih profil preset (dengan mode Sandbox Preview), tombol update/simpan/aktifkan preset, serta Mini OBS Live Preview Canvas (`MiniOBSPreview.tsx`) untuk memberikan feedback visual langsung saat mengatur gaya tampilan OBS.

## 📄 Blueprint References
- [DESIGN.md](../../docs/feature/obs-display-customization/DESIGN.md) - Section: UI Components & Settings Panel Layout
- [REQUIREMENTS.md](../../docs/feature/obs-display-customization/REQUIREMENTS.md) - Section: FR-01 s/d FR-04
- [API.md](../../docs/feature/obs-display-customization/API.md) - Section: Preset Profiles Management

## 📁 Target Files
- `frontend/src/components/settings/DisplaySettingsPanel.tsx`
- `frontend/src/components/settings/PresetSelector.tsx`
- `frontend/src/components/settings/SavePresetModal.tsx`
- `frontend/src/components/settings/MiniOBSPreview.tsx`
- `frontend/src/components/settings/ColorPickerInput.tsx`

## 📝 Detailed Requirements
1. **Preset Profile Manager & Sandbox Preview (`PresetSelector.tsx` & `SavePresetModal.tsx`):**
   - **Kartu Preset Profile:** Menampilkan seluruh daftar preset tersimpan.
     - Badge `🟢 LIVE ON AIR`: Menandai preset yang saat ini aktif disiarkan di layar OBS Studio.
     - Badge `👁️ PREVIEWING`: Menandai preset yang saat ini sedang dibuka/di-edit di Mini OBS Preview Sandbox.
   - **Klik Kartu Preset (Pratinjau Tanpa Mengganggu Broadcast):** Mengeklik kartu preset akan memuat konfigurasinya ke `previewSettings` dan Mini OBS Preview tanpa mengubah tampilan siaran langsung OBS (`liveSettings`).
   - **Tombol "Update Preset [Nama]"**: Memperbarui atribut preset terpilih di database via `PUT /api/v1/display/presets/{id}`.
   - **Tombol "Save as New Preset..."**: Membuka modal dialog `SavePresetModal` untuk menyimpan konfigurasi sebagai preset baru.
   - **Tombol "Apply & Activate to OBS Live" (One-Click Broadcast):** Mengaktifkan preset yang sedang di-preview ke siaran langsung OBS Studio dengan 1-klik (`POST /api/v1/display/presets/{id}/activate`).
   - **Tombol "Hapus Preset":** Menghapus preset yang sedang tidak aktif di siaran langsung.

2. **Mini OBS Live Preview Canvas (`MiniOBSPreview.tsx`):**
   - Merender `previewSettings` aktif secara real-time (< 50ms visual response).
   - Menampilkan frame simulasi rasio 16:9 berlatar video/pola uji transparan (dapat di-toggle antara mode `Dark Feed`, `Bright Feed`, dan `Transp. Grid`).
   - Merender teks sampel lirik dengan dynamic CSS inline (font size proporsional `0.45x`, text shadow blur, stroke width, background box color/opacity).

3. **Form Controls Panel (`DisplaySettingsPanel.tsx`):**
   - **Bagian Typography:**
     - Font size: Dual slider + number input (`16px` s/d `120px`).
     - Font weight select (`Normal (400)`, `Semi-Bold (600)`, `Bold (700)`, `Extra-Bold (800)`).
     - Text transform toggle group (`UPPERCASE`, `Capitalize`, `As-Is`).
     - Text alignment buttons (`Left`, `Center`, `Right`).
   - **Bagian Color & Effects:**
     - Text Color Picker + Swatch palet warna cepat (`#FFFFFF`, `#FFD700`, `#00EEEE`, `#FF3366`, `#00FF66`).
     - Shadow Blur radius slider (0px - 30px) & Shadow Color Picker (RGBA).
     - Text Stroke width slider (0px - 4px) & Stroke Color Picker.
   - **Bagian Background Box:**
     - Toggle switch: `Enable Background Box`.
     - Background Color Picker & Opacity Slider (0% - 100%).
     - Vertical Padding Slider (0px - 50px) & Horizontal Padding Slider (0px - 100px).
     - Border Radius Slider (0px - 50px) & Container Max Width select (`max-w-7xl`, `max-w-5xl`, `max-w-3xl`, `max-w-full`).
   - **Header & Action Bar:**
     - Status Indicator: `Live Broadcast Theme: [Nama Preset]` vs `Previewing Theme: [Nama Preset]`.
     - Tombol `"Apply & Activate to OBS Live"` (Aktivasi 1-klik ke OBS Studio).
     - Tombol `"Save Changes to Preset"` (Memperbarui preset tersimpan saat ini).
     - Tombol `"Save as New Preset..."` (Menyimpan sebagai preset bernama baru).
     - Tombol `"Reset to Default"` (Mengembalikan ke opsi default PentasLirik).
     - Peringatan indikator visual kontras rendah jika warna teks dan latar belakang kurang terbaca (< 3:1 contrast ratio).

## ✅ Acceptance Criteria
- [x] Komponen `DisplaySettingsPanel.tsx` dan `PresetSelector.tsx` dapat diakses dari dashboard operator/admin.
- [x] Operator dapat mengeklik preset mana pun untuk mempratinjau tampilannya di Mini OBS Preview tanpa mengubah layar siaran langsung OBS Studio.
- [x] Kartu preset menampilkan badge `🟢 LIVE ON AIR` dan `👁️ PREVIEWING` dengan jelas.
- [x] Operator dapat meng-update preset yang sedang dibuka menggunakan tombol `"Save Changes to Preset"`.
- [x] Operator dapat mengaktifkan preset ke siaran langsung OBS Studio menggunakan tombol `"Apply & Activate to OBS Live"`.
- [x] Slider Typography, Color & Effects, serta Background Box berfungsi mulus dan responsif (< 50ms).
- [x] Tombol `"Reset to Default"` berhasil mengembalikan semua parameter ke default PentasLirik.
- [x] Desain konsisten dengan tema dark mode PentasLirik (Tailwind CSS v4).
