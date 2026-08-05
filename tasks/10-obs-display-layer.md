# TASK-10: OBS Display Layer Component (`OBSDisplay.tsx`) ✅ [SELESAI]

## 🎯 Goal
Mengembangkan komponen overlay khusus untuk OBS Studio Browser Source (`OBSDisplay.tsx`) yang ultra-lightweight, bebas lag, serta dapat melakukan sinkronisasi otomatis via WebSocket dan HTTP state fetch.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-09, FR-10 (OBS Display Layer Requirements)
- [ARCHITECTURE.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/ARCHITECTURE.md) - Section: OBS Browser Source (React OBSDisplay Component)

## 📁 Target Files
- `frontend/src/components/OBSDisplay.tsx`
- `frontend/src/App.tsx` (Route handler untuk `/display` & `/display.html`)

## 📝 Detailed Requirements
1. **Visual Styling Requirements:**
   - Background transparan (`bg-transparent`).
   - Teks di posisi **Lower-Third** (bagian bawah layar).
   - Font bold, sans-serif, warna putih (`text-white`).
   - Efek `text-shadow` tebal gelap (`[text-shadow:_0_2px_4px_rgb(0_0_0_/_90%),_0_4px_8px_rgb(0_0_0_/_70%)]` / `.obs-text-shadow`).
   - Animasi fade-in & fade-out yang mulus menggunakan Framer Motion (`motion.div`).
2. **Logic & Synchronization Requirements:**
   - **Initial Load Sync (FR-12):** Saat pertama kali dibuka atau di-reload oleh OBS, lakukan `fetch('/api/v1/state/live')` untuk sinkronisasi state instan.
   - **WebSocket Listener:** Connect ke WebSocket `/ws` untuk event `display:update` dan `display:clear`.
   - **Auto Reconnect:** Reconnect otomatis jika koneksi WebSocket terputus.

## ✅ Acceptance Criteria
- [x] Rute `/display` & `/display.html` menampilkan komponen React `OBSDisplay` dengan latar transparan.
- [x] Teks lirik berpindah dengan animasi fade smooth dari Framer Motion saat diklik dari controller.
- [x] Refresh browser source OBS langsung menampilkan teks live terkini dari endpoint state.
