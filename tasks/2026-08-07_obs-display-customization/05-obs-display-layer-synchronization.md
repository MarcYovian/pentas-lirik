# TASK-05: OBS Display Overlay Dynamic Styling & Zero-Flicker Sync (`OBSDisplay.tsx`) ✅ [SELESAI]

## 🎯 Goal
Refaktor komponen overlay `OBSDisplay.tsx` agar menerapkan dynamic inline CSS styling dari persentase font size, warna, shadow, dan background box yang disinkronisasikan via WebSocket (`display:settings-updated`), `localStorage`, dan HTTP polling fallback tanpa menyebabkan kedipan (flicker) pada pergantian lirik.

## 📄 Blueprint References
- [ARCHITECTURE.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/feature/obs-display-customization/ARCHITECTURE.md) - Section: OBS Browser Source Overlay & Decoupled Payload Strategy
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/feature/obs-display-customization/PRD.md) - Section: FR-06 & Non-Functional Performance

## 📁 Target Files
- `frontend/src/components/OBSDisplay.tsx`
- `frontend/src/utils/styleUtils.ts` (helper pembuat inline style object dari `DisplaySetting`)

## 📝 Detailed Requirements
1. **Dynamic Styling Engine (`styleUtils.ts`):**
   - Buat fungsi utilitas `buildDisplayInlineStyles(settings: DisplaySetting)` yang menghasilkan React inline style object dalam ukuran asli 1:1 (full 1080p resolution):
     - `fontSize`: `${settings.font_size}px`.
     - `fontWeight`: `settings.font_weight`.
     - `textTransform`: `settings.text_transform === 'none' ? 'none' : settings.text_transform`.
     - `textAlign`: `settings.align_items || 'center'`.
     - `color`: `settings.text_color`.
     - `textShadow`: `0px 0px ${settings.text_shadow_blur}px ${settings.text_shadow_color}`.
     - `WebkitTextStroke`: `settings.text_stroke_width > 0 ? '${settings.text_stroke_width}px ${settings.text_stroke_color}' : undefined`.
     - `backgroundColor`: `settings.show_background ? computeRgbaWithOpacity(settings.background_color, settings.background_opacity) : 'transparent'`.
     - `padding`: `${settings.show_background ? settings.padding_vertical : 0}px ${settings.show_background ? settings.padding_horizontal : 0}px`.
     - `borderRadius`: `${settings.show_background ? settings.border_radius : 0}px`.
     - `display`: `'inline-block'`.
     - `maxWidth`: `'100%'`.

2. **Aturan Evaluasi Container Max Width:**
   - Pembungkus luar kontainer teks pada `OBSDisplay.tsx` harus mengevaluasi `max_width` secara kondisional:
     - Jika `settings.show_background === true` ➡️ Gunakan `${settings.max_width || 'max-w-7xl'}`.
     - Jika `settings.show_background === false` ➡️ Gunakan `max-w-full` (Full Width 100%) agar lirik tidak ter-lock di batas kecil.

3. **State Caching & Zero-Flicker Strategy di `OBSDisplay.tsx`:**
   - **Mounted / Reload Check:** Saat komponen mount, baca terlebih dahulu `localStorage.getItem('obs_display_settings')`. Jika ada, gunakan langsung sebagai initial state untuk rendisi pertama (mencegah *flash of unstyled content* / FOUC).
   - Jalankan `GET /api/v1/display/settings` di background untuk verifikasi/sinkronisasi ulang.
   - **WebSocket Listener:** Dengar channel `display` untuk event `display:settings-updated`. Saat event diterima, perbarui state React dan simpan ke `localStorage`.
   - **Pemisahan Payload Lirik (`display:update`):** Event lirik hanya mengupdate konten teks string. Komponen membaca style yang sudah tersimpan di state local/localStorage tanpa melakukan fetch ulang atau re-mount container, menjamin **zero-flicker lyric transition**.

## ✅ Acceptance Criteria
- [x] Komponen `OBSDisplay.tsx` merender gaya tampilan dinamis sesuai setting aktif dari backend/localStorage.
- [x] Pergantian lirik berjalan mulus tanpa kedipan styling (*zero-flicker lyric transition*).
- [x] Jika `show_background: false`, pembungkus luar kontainer otomatis menggunakan `max-w-full`.
- [x] Perubahan setting atau preset aktif di dashboard operator langsung memperbarui tampilan `OBSDisplay.tsx` via WebSocket dalam waktu < 150ms.
- [x] Saat OBS Studio dibuka/di-reload, tampilan lirik langsung muncul dengan gaya terbaru tanpa flash unstyled text.
