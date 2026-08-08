# TASK-03: Mobile Thumb Stepper Action Bar & Emergency Controls ✅ [SELESAI]

## 🎯 Goal
Membuat bar aksi bawah melayang (*sticky bottom action bar*) yang diposisikan secara khusus di area terjangkau jempol (*thumb zone*) pada layar mobile (`< 768px`), yang berisi tombol navigasi bait berukuran ekstra besar (`PREV STANZA`, `NEXT STANZA`), tombol darurat 1-ketukan (`BLANK`, `LOGO`, `CLEAR`), serta integrasi event listener keyboard & gestur sentuh.

## 📄 Blueprint References
- [DESIGN.md](../../docs/feature/2026-08-08_mobile-first-control-panel/DESIGN.md) - Section: Sticky Bottom Stepper
- [REQUIREMENTS.md](../../docs/feature/2026-08-08_mobile-first-control-panel/REQUIREMENTS.md) - Section: FR-02.4 (Fixed Bottom Action Bar)
- [USER_FLOW.md](../../docs/feature/2026-08-08_mobile-first-control-panel/USER_FLOW.md) - Section: Scenario B (One-Handed Stanza Stepping)

## 📁 Target Files
- `frontend/src/components/mobile/MobileStepper.tsx` [NEW]
- `frontend/src/components/LiveControlPanel.tsx`

## 📝 Detailed Steps & Technical Requirements

1. **Komponen Action Bar Bawah (`MobileStepper.tsx`):**
   - Posisikan melayang secara permanen di bawah layar:
     `fixed bottom-0 left-0 right-0 p-3 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 z-30 pb-safe shadow-2xl block md:hidden`
   - **Tombol Utama (Primary Steppers)**:
     - **PREV STANZA** (`flex-1 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-bold rounded-xl text-sm min-h-[52px] flex items-center justify-center gap-2 border border-slate-700 active:scale-[0.97]`):
       - Menonaktifkan tombol secara visual jika bait berada di paling awal lagu (`disabled:opacity-40`).
     - **NEXT STANZA** (`flex-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-base min-h-[52px] flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.97]`):
       - Menonaktifkan tombol secara visual jika bait berada di paling akhir lagu (`disabled:opacity-40`).
   - **Tombol Aksi Darurat (Emergency Toggles Bar)**:
     - Berada di atas bar stepper atau tersusun sejajar:
       - **BLANK** (`bg-rose-950/80 text-rose-300 border border-rose-800/60 active:bg-rose-900`): Mengosongkan layar lirik OBS secara instan.
       - **LOGO** (`bg-amber-950/80 text-amber-300 border border-amber-800/60 active:bg-amber-900`): Menampilkan logo gereja/acara di OBS.
       - **CLEAR** (`bg-slate-800 text-slate-300 active:bg-slate-700`): Menghapus penayangan aktif tanpa mengubah urutan bait.

2. **Logika Stepper & Auto-Scroll Ke Kartu Bait Active:**
   - Ketika operator menekan `NEXT STANZA` atau `PREV STANZA` dari bottom bar mobile:
     - Pemicu fungsi `handleNextStanza()` / `handlePrevStanza()`.
     - Kirim event WebSocket ke OBS Display.
     - Lakukan scroll otomatis (*smooth scrollIntoView*) pada kartu bait aktif agar selalu berada di posisi tengah layar smartphone pengguna tanpa harus di-scroll manual.

3. **Handling Safe Area & Keyboard Virtual:**
   - Gunakan utility kelas CSS `pb-safe` untuk mengantisipasi Home Indicator Bar pada iPhone / Android gesture bar.
   - Sembunyikan sticky bottom bar secara otomatis saat input pencarian difokuskan untuk mencegah tertutup keyboard virtual smartphone.

## ✅ Acceptance Criteria
- [x] Sticky bottom action bar tampil melayang di bagian bawah layar pada smartphone (`< 768px`) dan tersembunyi pada desktop (`>= 768px`).
- [x] Tombol `NEXT STANZA` dan `PREV STANZA` berukuran besar (`min-h-[52px]`), sangat nyaman ditekan dengan jempol satu tangan.
- [x] Menekan `NEXT STANZA` memindahkan bait aktif, meng-update OBS Display, dan melakukan *smooth scroll* ke kartu bait baru.
- [x] Tombol darurat `BLANK`, `LOGO`, dan `CLEAR` berfungsi instan dengan indikator status visual yang jelas.
- [x] Tampilan bottom bar tidak menutupi konten bait terbawah (memiliki bottom padding pembatas yang cukup pada kontainer utama).

