# FEATURES: Mobile-First Redesign & Dedicated Mobile Control Panel

## Overview of Feature Modules

This blueprint introduces two main capability pillars:
1. **Mobile-First Responsive UI Upgrade** across all existing PentasLirik views.
2. **Dedicated Mobile Control Panel & Setlist Quick-Switcher**.

---

## Detailed Feature Matrix

### Feature 1: Responsive Navigation & Top Bar
* **Mobile Drawer Navigation**:
  * Hamburger button on header (`< md`).
  * Slide-over menu with touch-friendly navigation items.
  * Active page indicator and user profile badge.
* **Sticky Status Bar**:
  * Displays current live connection status (WebSocket connected/disconnected), active song title, and live broadcast state.

---

### Feature 2: Dedicated Mobile Live Control Panel
* **Song Header & Setlist Quick Selector**:
  * Displays song title, artist, key, and current position in setlist (e.g. *Song 2 of 5*).
  * Single-tap dropdown / bottom sheet modal to immediately switch to another song in the setlist.
* **Thumb-Friendly Stanza Cards Grid**:
  * Large cards with high-contrast text previews.
  * Color badge indicators for Verse, Chorus, Bridge, Tag, Outro.
  * Active stanza glowing border and broadcast icon.
* **Sticky Bottom Stepper Controls**:
  * `[ PREV STANZA ]` and `[ NEXT STANZA ]` action buttons anchored at bottom screen edge.
  * Quick action toggles: `[ BLANK ]`, `[ LOGO ]`, `[ CLEAR ]`.
* **Search & Add Quick Action**:
  * Quick search bar to insert a non-setlist song on the fly.

---

### Feature 3: Mobile-Optimized Display Settings Panel
* **Single-Column Stacking**:
  * Settings categories collapse into expandable accordion cards or vertical sections on mobile.
* **Sticky Floating Mini-OBS Preview**:
  * Mini preview window stays docked at top/bottom or expands with a toggle button so operators can see instant style changes on mobile.
* **Touch-Optimized Color Pickers & Sliders**:
  * Enhanced touch sliders with touch-drag support and numeric stepper buttons (`+` / `-`).

---

### Feature 4: Mobile Song Library & Setlist Rundown
* **Mobile Card Views**:
  * Replaces wide desktop data tables with clean, structured mobile cards.
* **Touch-Friendly Setlist Management**:
  * Reorder setlist items using dedicated Up/Down buttons or smooth touch drag handles.
  * Single-tap launch: "Play Setlist in Mobile Control Panel".
* **Responsive Song Editor Modal**:
  * Full-screen mobile modal for song creation and stanza text parsing.

---

## User Interface Breakdown

| View Component | Desktop Experience | Mobile Experience (Mobile-First) |
|:---------------|:-------------------|:----------------------------------|
| **Navbar** | Horizontal link bar | Sticky app bar + slide-out drawer |
| **Live Control Panel** | Multi-column (Setlist sidebar + Stanza grid + Preview) | Tabbed / Drawer Setlist + Full-screen Thumb Cards + Sticky Stepper |
| **Display Settings** | Split 2-column (Controls left, Preview right) | Single-column accordion + Floating/Docked Mini Preview |
| **Song Library** | Wide data table | Responsive cards with swipe/tap action menus |
| **Setlist Rundown** | Desktop drag table | Responsive list with touch handles & quick-play button |
