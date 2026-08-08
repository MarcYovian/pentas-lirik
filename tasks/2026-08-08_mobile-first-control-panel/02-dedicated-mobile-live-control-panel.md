# TASK-02: Dedicated Mobile Live Control Panel & Quick Setlist Drawer ✅ [SELESAI]

## 🎯 Goal
Mendesain ulang dan merestrukturisasi `LiveControlPanel.tsx` agar memiliki tampilan khusus yang sangat nyaman pada layar mobile (`< 768px`), yang mencakup Setlist Quick Selector Drawer/Bottom Sheet, kartu bait lirik thumb-friendly berukuran besar dengan badge jenis bait (Verse, Chorus, Bridge, Tag), indikator visual bait aktif berpijar, serta modul pencarian lagu cepat.

## 📄 Blueprint References
- [FEATURES.md](../../docs/feature/2026-08-08_mobile-first-control-panel/FEATURES.md) - Section: Feature 2 (Dedicated Mobile Live Control Panel)
- [ARCHITECTURE.md](../../docs/feature/2026-08-08_mobile-first-control-panel/ARCHITECTURE.md) - Section: Mobile View Architecture
- [DESIGN.md](../../docs/feature/2026-08-08_mobile-first-control-panel/DESIGN.md) - Section: Mobile Live Control Panel & Stanza Card
- [USER_FLOW.md](../../docs/feature/2026-08-08_mobile-first-control-panel/USER_FLOW.md) - Section: Mobile Operator Journey Map

## 📁 Target Files
- `frontend/src/components/LiveControlPanel.tsx`
- `frontend/src/components/mobile/SetlistQuickDrawer.tsx` [NEW]
- `frontend/src/components/mobile/MobileStanzaCard.tsx` [NEW]

## 📝 Detailed Steps & Technical Requirements

1. **Komponen Quick Setlist Drawer (`SetlistQuickDrawer.tsx`):**
   - Buat komponen modal bottom-sheet yang dapat dibuka dengan 1-ketukan dari tombol header kontrol mobile (`"🎵 Lagu 2/5: Bapa Yang Kekal ▾"`).
   - Tampilkan daftar urutan lagu dalam setlist aktif lengkap dengan nomor urut (`#1`, `#2`), judul lagu, penyanyi/artist, nada dasar (`Key`), serta badge status lagu yang sedang aktif.
   - Sediakan tombol pencarian lagu darurat di bagian atas drawer untuk menyisipkan lagu di luar setlist secara langsung.
   - Mengetuk salah satu lagu langsung memilih lagu tersebut, menutup drawer, dan merender bait-bait lagu tersebut di layar kontrol mobile.

2. **Komponen Kartu Bait Thumb-Friendly (`MobileStanzaCard.tsx`):**
   - Render setiap bait lirik sebagai kartu independen berukuran besar (`w-full min-h-[72px] p-4 rounded-xl mb-3 border transition-all duration-150 active:scale-[0.98]`).
   - Sediakan badge jenis bait dengan warna pembeda:
     - **Verse**: Blue/Indigo badge (`bg-blue-500/20 text-blue-400`).
     - **Chorus**: Emerald/Green badge (`bg-emerald-500/20 text-emerald-400`).
     - **Bridge**: Amber/Yellow badge (`bg-amber-500/20 text-amber-400`).
     - **Tag / Outro / Intro**: Purple/Rose badge (`bg-purple-500/20 text-purple-400`).
   - Tampilkan pratinjau teks lirik bait dengan ukuran teks jelas (`text-base md:text-lg font-medium leading-relaxed`).
   - Berikan efek visual aktif yang mencolok saat bait sedang ditayangkan di OBS (`bg-indigo-950/90 border-2 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/20`).
   - Mengetuk kartu bait langsung memicu fungsi broadcast lirik ke OBS secara real-time via WebSocket.

3. **Restrukturisasi Layout Mobile vs Desktop pada `LiveControlPanel.tsx`:**
   - Gunakan pendekatan conditional layout / CSS responsive grid:
     - On Desktop (`>= 1024px`): Pertahankan tampilan 3 kolom (Setlist Left Sidebar + Stanza Center Grid + Right Live OBS Preview).
     - On Mobile (`< 768px`): Alihkan ke tampilan single-column khusus mobile dengan header ringkas setlist, kartu bait vertikal yang nyaman di-scroll dengan satu ibu jari, dan tanpa kolom sidebar berat.

## ✅ Acceptance Criteria
- [x] Tombol Setlist Quick Selector pada mobile menampilkan judul lagu aktif & nomor posisi di setlist.
- [x] Mengetuk tombol setlist membuka Bottom Sheet Drawer yang berisi seluruh lagu setlist secara responsif.
- [x] Kartu bait pada mobile berukuran besar, mudah diklik dengan ibu jari tanpa salah tekan.
- [x] Mengetuk kartu bait memberikan respon visual langsung dan memperbarui tampilan OBS via WebSocket.
- [x] Tampilan mobile bebas dari efek scroll horisontal (*no horizontal overflow*).

