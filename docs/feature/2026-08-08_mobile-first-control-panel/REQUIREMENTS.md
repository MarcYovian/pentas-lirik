# REQUIREMENTS: Mobile-First Redesign & Dedicated Mobile Control Panel

## Functional Requirements

### FR-01: Mobile-First UI Foundation & Responsive Navigation
The system MUST render all pages with a mobile-first responsive architecture.
* `FR-01.1`: The system SHALL use mobile base styles by default, applying `md:` and `lg:` media queries for larger viewports.
* `FR-01.2`: The Navigation bar (`Navbar.tsx`) MUST collapse into a sticky header with a Hamburger Menu icon on viewports `< 768px`.
* `FR-01.3`: The Navigation bar MUST provide a mobile slide-out drawer (or bottom sheet) containing all page links (Live Control, Song Library, Setlist, Display Settings, Users, Logout).
* `FR-01.4`: All interactive elements (buttons, inputs, selects, list items) SHALL have a minimum height and width of `44px` (recommended `48px`) to ensure touch ergonomics.

---

### FR-02: Dedicated Mobile Live Control Panel
The system MUST provide an optimized Mobile Control View (`LiveControlPanel.tsx` mobile mode).
* `FR-02.1`: The Mobile Live Control Panel MUST present a compact header displaying the currently active song title, artist, key, and active setlist name.
* `FR-02.2`: The Mobile Live Control Panel MUST include a **Quick Setlist Selector Drawer/Dropdown** allowing operators to switch to any song in the active setlist with a single tap.
* `FR-02.3`: The Mobile Live Control Panel MUST render stanza items as large touchable cards with clear section labels (e.g., *Verse 1*, *Chorus*, *Bridge*), line previews, and visual indicator for the active broadcasted stanza.
* `FR-02.4`: The Mobile Live Control Panel MUST provide a fixed/sticky bottom action bar containing:
  * **PREV STANZA** button (extra-large touch target).
  * **NEXT STANZA** button (extra-large touch target).
  * **BLANK / LOGO** emergency quick-toggle buttons.
* `FR-02.5`: Tapping any stanza card MUST immediately broadcast the selected stanza lirik to OBS and all connected clients.

---

### FR-03: Responsive Mobile Display Settings Panel
The system MUST adapt `DisplaySettingsPanel.tsx` for mobile viewports.
* `FR-03.1`: Control sections (Font & Typography, Color & Effects, Background Box, Padding & Layout) MUST stack vertically in single-column layout on viewports `< 768px`.
* `FR-03.2`: The `MiniOBSPreview.tsx` component MUST remain visible or accessible via a floating/collapsible preview bar at the top or bottom of the screen on mobile.
* `FR-03.3`: Color pickers and range sliders MUST support touch gestures (drag and tap) comfortably on mobile touchscreens without page scrolling interference.

---

### FR-04: Responsive Song Library & Setlist Management
The system MUST optimize `SongLibrary.tsx`, `SongModal.tsx`, and `SetlistRundown.tsx` for mobile screens.
* `FR-04.1`: Song tables and setlist items MUST transform into responsive cards on mobile screens with action menus (Edit, Delete, Add to Setlist, Move Up/Down).
* `FR-04.2`: Song modal forms MUST support full-screen or bottom-sheet drawer layouts on mobile to prevent soft keyboard overlap issues.
* `FR-04.3`: Setlist reordering MUST support touch-friendly drag-and-drop or simple Up/Down arrow buttons for mobile devices.

---

## Non-Functional Requirements

### NFR-01: Performance & Responsiveness
* `NFR-01.1`: Touch interactions (button tap to UI state change) MUST respond within **16ms** (60 FPS animation frame).
* `NFR-01.2`: WebSocket message transmission from mobile tap to OBS Display render MUST take `< 50ms` over Wi-Fi/4G.

### NFR-02: Usability & Ergonomics
* `NFR-02.1`: Critical live controls (Next Stanza, Prev Stanza, Blank) MUST be reachable with the operator's thumb in single-handed portrait mode.
* `NFR-02.2`: High-contrast visual design MUST ensure legibility under bright outdoor or dim booth lighting conditions.

### NFR-03: Accessibility (a11y)
* `NFR-03.1`: All buttons MUST include explicit `aria-label` tags and visible active focus state ring.
* `NFR-03.2`: Minimum contrast ratio between text and background MUST be `4.5:1` (WCAG AA).

---

## Acceptance Criteria

1. **Mobile Responsiveness Verification**: All UI pages render cleanly without horizontal overflow at device widths 360px, 390px, 414px, and 768px.
2. **Mobile Control Panel Verification**: Operators can change songs from setlist and navigate stanzas using thumb controls on mobile browsers.
3. **Touch Target Verification**: No interactive button or input is smaller than `44x44px`.
4. **Real-Time Sync**: Stanza changes triggered from mobile update OBS Display and Desktop Control Panel simultaneously.
