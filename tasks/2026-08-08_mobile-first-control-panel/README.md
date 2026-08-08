# Feature Implementation Tasks: Mobile-First Redesign & Dedicated Mobile Control Panel

> **Feature Directory:** `docs/feature/2026-08-08_mobile-first-control-panel`  
> **Status:** ⏳ IN PROGRESS / TASK BREAKDOWN CREATED  
> **Feature Blueprint Documentation:** [PRD.md](../../docs/feature/2026-08-08_mobile-first-control-panel/PRD.md) | [REQUIREMENTS.md](../../docs/feature/2026-08-08_mobile-first-control-panel/REQUIREMENTS.md) | [FEATURES.md](../../docs/feature/2026-08-08_mobile-first-control-panel/FEATURES.md) | [ARCHITECTURE.md](../../docs/feature/2026-08-08_mobile-first-control-panel/ARCHITECTURE.md) | [DESIGN.md](../../docs/feature/2026-08-08_mobile-first-control-panel/DESIGN.md) | [USER_FLOW.md](../../docs/feature/2026-08-08_mobile-first-control-panel/USER_FLOW.md)

---

## 📌 Executive Summary

Rangkaian task ini memecah implementasi perbaikan **Mobile-First UI Redesign** dan penambahan fitur **Dedicated Mobile Live Control Panel** di PentasLirik. Rencana kerja disusun secara terstruktur dari fondasi layout responsif, komponen navigasi mobile, panel kontrol live khusus smartphone, stepper lirik satu jempol, penyesuaian panel pengaturan & perpustakaan lagu, hingga verifikasi pengujian otomatis E2E Playwright pada layar mobile.

---

## 📌 Task Breakdown & Direct Links

| Task ID | Task Title | File Reference | Status |
|:---|:---|:---|:---:|
| **TASK-01** | Mobile Responsive Layout Shell & Navigation Drawer (`Navbar.tsx`, `App.tsx`) | [01-mobile-navigation-and-layout-shell.md](./01-mobile-navigation-and-layout-shell.md) | ✅ SELESAI |

| **TASK-02** | Dedicated Mobile Live Control Panel & Quick Setlist Drawer (`LiveControlPanel.tsx`) | [02-dedicated-mobile-live-control-panel.md](./02-dedicated-mobile-live-control-panel.md) | ✅ SELESAI |

| **TASK-03** | Mobile Thumb Stepper Action Bar & Emergency Controls (`MobileStepper.tsx`) | [03-mobile-thumb-stepper-and-emergency-controls.md](./03-mobile-thumb-stepper-and-emergency-controls.md) | ✅ SELESAI |

| **TASK-04** | Mobile Responsive Display Settings & Docked Mini OBS Preview (`DisplaySettingsPanel.tsx`) | [04-responsive-display-settings-and-mini-preview.md](./04-responsive-display-settings-and-mini-preview.md) | ✅ SELESAI |

| **TASK-05** | Mobile Responsive Song Library, Song Modal & Setlist Rundown (`SongLibrary.tsx`, `SetlistRundown.tsx`) | [05-responsive-song-library-and-setlist-rundown.md](./05-responsive-song-library-and-setlist-rundown.md) | ✅ SELESAI |

| **TASK-06** | Mobile E2E Playwright Testing & Multi-Device Verification | [06-testing-and-verification.md](./06-testing-and-verification.md) | ✅ SELESAI |


---

## 🎯 Architecture Highlights & Implementation Rules

1. **Mobile-First Breakpoint Architecture**:
   - Semua CSS utility class menggunakan mobile base style sebagai default (portrait width 320px - 430px).
   - Pengondisian desktop menggunakan prefix `md:` (min-width: 768px) dan `lg:` (min-width: 1024px).

2. **Ergonomi Touch Target Minimum 44-48px**:
   - Seluruh elemen interaktif (tombol, input, dropdown item, kartu bait) memiliki batas sentuh minimal `44x44px` atau `48x48px` untuk mencegah *misclick* pada layar sentuh.

3. **Bottom-Safe Area & Thumb Reachability**:
   - Tombol pengubah lirik utama (`NEXT STANZA`, `PREV STANZA`, `BLANK`) diposisikan pada area bawah layar (*sticky bottom action bar*) yang terjangkau oleh jempol pengguna saat memegang smartphone satu tangan, serta mendukung safe-area iOS (`pb-safe`).

4. **Zero-Flicker WebSocket Synchronization**:
   - Perubahan lagu/bait yang dipicu dari smartphone langsung memperbarui state OBS Display dan Control Panel desktop secara real-time via WebSocket (< 50ms latency).
