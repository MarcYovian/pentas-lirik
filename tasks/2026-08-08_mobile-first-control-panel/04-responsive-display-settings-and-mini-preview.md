# TASK-04: Mobile Responsive Display Settings & Docked Mini OBS Preview ✅ [SELESAI]

## 🎯 Goal
Merestrukturisasi `DisplaySettingsPanel.tsx`, `MiniOBSPreview.tsx`, dan `ColorPickerInput.tsx` menjadi format *mobile-first single-column layout* berbasis kartu akordeon terorganisir, serta menambahkan bilah pratinjau mini yang melayang/ter-docking (*sticky docked mini preview*) pada layar mobile agar operator dapat melihat hasil perubahan gaya tampilan secara instan saat menggeser kontrol di smartphone.

## 📄 Blueprint References
- [FEATURES.md](../../docs/feature/2026-08-08_mobile-first-control-panel/FEATURES.md) - Section: Feature 3 (Mobile-Optimized Display Settings Panel)
- [REQUIREMENTS.md](../../docs/feature/2026-08-08_mobile-first-control-panel/REQUIREMENTS.md) - Section: FR-03 (Responsive Mobile Display Settings Panel)
- [DESIGN.md](../../docs/feature/2026-08-08_mobile-first-control-panel/DESIGN.md) - Section: Typography & Component Specifications

## 📁 Target Files
- `frontend/src/components/settings/DisplaySettingsPanel.tsx`
- `frontend/src/components/settings/MiniOBSPreview.tsx`
- `frontend/src/components/settings/ColorPickerInput.tsx`

## 📝 Detailed Steps & Technical Requirements

1. **Tata Letak Single-Column & Card Accordions (`DisplaySettingsPanel.tsx`):**
   - Pada viewport mobile (`< 768px`), susun panel kontrol gaya menjadi satu kolom vertikal.
   - Kelompokkan opsi pengaturan ke dalam kartu-kartu akordeon yang dapat di-expand / di-collapse dengan 1-ketukan:
     - 📁 **Teks & Tipografi** (Ukuran font, ketebalan, huruf kapital, perataan teks).
     - 📁 **Warna & Efek** (Warna teks, bayangan/shadow, ketebalan outline stroke).
     - 📁 **Background Box** (Toggle aktifkan, warna background, opacity, padding, border radius, max-width).
     - 📁 **Preset Tersimpan** (Daftar preset profil, simpan preset baru, aktifkan ke OBS Live).

2. **Sticky Docked Mini OBS Preview Bar (`MiniOBSPreview.tsx`):**
   - Pada desktop (`>= 1024px`), `MiniOBSPreview` tetap berada di kolom kanan samping.
   - Pada mobile (`< 1024px`), buat `MiniOBSPreview` melayang di bagian atas layar (`sticky top-14 z-20 bg-slate-950/95 backdrop-blur-md p-2 border-b border-slate-800 shadow-md`):
     - Berikan tombol toggle untuk mengecilkan/memperbesar pratinjau mini (`"👁️ Hide Preview"` / `"👁️ Show Preview"`).
     - Pastikan pratinjau canvas ter-scale secara proporsional (`aspect-video w-full rounded-lg overflow-hidden`) tanpa memotong teks.

3. **Touch-Optimized Sliders & Color Picker (`ColorPickerInput.tsx`):**
   - Perluas area sentuh range slider (`<input type="range">`) dengan mengisikan `h-3 min-h-[44px]` agar mudah digeser menggunakan jari di layar smartphone.
   - Tambahkan tombol stepper nilai angka (`-` / `+` berukuran `44x44px`) di samping slider untuk penyesuaian angka presisi tanpa harus menggeser slider.
   - Optimalkan popover `ColorPickerInput` agar terbuka tepat di dalam viewport smartphone tanpa terpotong batas layar (*viewport collision detection*).

## ✅ Acceptance Criteria
- [x] Panel `DisplaySettingsPanel.tsx` tersusun rapi dalam 1 kolom pada layar mobile tanpa overflow horisontal.
- [x] `MiniOBSPreview.tsx` melayang sticky di atas kontrol pada layar mobile dan memperbarui tampilan secara real-time saat slider digeser.
- [x] Slider ukuran font, padding, dan opacity memiliki tombol stepper `-` / `+` berukuran min. `44x44px`.
- [x] Popover Color Picker dapat dibuka dan digunakan dengan nyaman pada smartphone tanpa terpotong.

