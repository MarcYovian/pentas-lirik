# TASK-19: E2E Live Display Sync & Keyboard Shortcuts Tests ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan test suite Playwright E2E multi-page browser context untuk menguji sinkronisasi real-time antara Operator Control Panel dengan OBS Display Layer (`/display`), pintasan keyboard (<kbd>Spacebar</kbd> & <kbd>Escape</kbd>), dan pemulihan state instan saat reload.

## 📄 Blueprint References
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-05, FR-06, FR-07, FR-09, FR-10, FR-12
- [ARCHITECTURE.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/ARCHITECTURE.md) - Section: Real-Time Flow & State Sync

## 📁 Target Files
- `frontend/e2e/live_display_shortcuts.spec.ts`

## 📝 Detailed Step-by-Step Test Scenarios

### Test Scenario 1: Multi-Tab Live Display Sync
1. Buka Tab 1 (Browser Context Operator): Login dan buka Dashboard.
2. Buka Tab 2 (Browser Context OBS Display): Navigasikan ke `http://localhost:3000/display`.
3. Pada Tab 1 (Operator), pilih lagu dan klik tombol chunk lirik `[VERSE 1]`.
4. Verifikasi di Tab 1: Status menunjukkan "LIVE ON AIR" dan tombol disorot merah solid.
5. Verifikasi di Tab 2 (OBS Display Layer): Teks lirik `[VERSE 1]` (`#obs-lyric-text`) dirender secara transparan di posisi lower-third.

### Test Scenario 2: Keyboard Shortcuts (<kbd>Spacebar</kbd> & <kbd>Escape</kbd>)
1. Pada Tab 1 (Operator), tekan tombol <kbd>Spacebar</kbd>.
2. Verifikasi tayangan berpindah ke chunk berikutnya `[VERSE 2]`.
3. Verifikasi di Tab 2 (OBS Display Layer): Teks lirik otomatis berubah menjadi isi `[VERSE 2]`.
4. Pada Tab 1, tekan tombol <kbd>Escape</kbd>.
5. Verifikasi di Tab 1: Status berubah menjadi "CLEAR" dan highlight tombol hilang.
6. Verifikasi di Tab 2 (OBS Display Layer): Teks lirik hilang dari layar (`#obs-lyric-container` hidden).

### Test Scenario 3: OBS Display Initial Reload State Sync (FR-12)
1. Kirim chunk lirik `[VERSE 1]` agar tayangan aktif di OBS.
2. Lakukan reload pada Tab 2 (`displayPage.reload()`).
3. Verifikasi: Teks lirik `[VERSE 1]` **langsung muncul secara instan** dari HTTP state fetch tanpa menunggu event WebSocket berikutnya.

## ✅ Acceptance Criteria
- [x] Pengujian automated Playwright pada `live_display_shortcuts.spec.ts` 100% PASS (4 tests passed in 5.5s).
