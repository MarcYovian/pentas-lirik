# FEATURES.md: OBS Display Customization

This document outlines the detailed feature specifications for the **OBS Display Customization** module in the PentasLirik project. This module allows operators to customize text size, text colors, text shadows, and background box styling for the OBS Browser Source overlay in real-time.

## Display Styling Management

This module allows operators to adjust the visual appearance of lyrics and announcements on the live OBS Display, ensuring maximum readability and aesthetic alignment with live event productions.

### Font & Character Size Control

Operators can dynamically adjust text dimensions and typography properties.

**User Stories:**
*   As an operator, I want to change the font size of the displayed lyrics so that it fits different screen resolutions and video layouts.
*   As an operator, I want to toggle text casing (e.g., uppercase) and font weight to match our production theme.

**Acceptance Criteria:**
*   The Settings UI shall provide an interactive slider and numeric input field for `Font Size` ranging from `16px` to `120px` (Default: `48px`).
*   Operators shall be able to choose from supported `Font Weight` values (`Normal (400)`, `Semi-Bold (600)`, `Bold (700)`, `Extra-Bold (800)`).
*   Operators shall be able to set `Text Transform` options (`UPPERCASE`, `Capitalize`, `As-Is`).
*   Adjustments shall update the `OBSDisplay.tsx` component in real-time via WebSocket without requiring a page reload.

**Edge Cases:**
*   **Very Long Lyric Text:** If the font size is set too large for a long phrase, the display layer shall wrap lines cleanly without breaking outside container bounds.
*   **Minimum/Maximum Boundaries:** Input fields must enforce limits (16px min, 120px max) to prevent layout breakage.

---

### Text Color & Shadow Effects

Operators can customize text color and outline/shadow effects for contrast optimization.

**User Stories:**
*   As an operator, I want to change the color of the lyrics text so that it remains visible over light or dark camera backgrounds.
*   As an operator, I want to adjust text shadow blur and outline stroke so lyrics stand out against complex video feeds.

**Acceptance Criteria:**
*   The Settings UI shall provide a Color Picker supporting HEX and RGBA formats alongside a palette of quick preset colors (e.g., `#FFFFFF`, `#FFD700`, `#00EEEE`).
*   Operators shall be able to configure `Text Shadow Color` and `Text Shadow Blur` radius.
*   Operators shall be able to set `Text Stroke Width` (0px to 4px) and `Text Stroke Color`.
*   Changes shall take effect immediately on the live OBS overlay.

**Edge Cases:**
*   **Low Contrast Colors:** The UI should provide a visual warning if text color and shadow color are identical or low-contrast.
*   **Invalid Color Format:** Non-standard color input strings shall fallback safely to default white (`#FFFFFF`).

---

### Background Box & Style Control

Operators can render a background box container behind lyrics to enhance contrast.

**User Stories:**
*   As an operator, I want to add a semi-transparent background box behind the lyrics to guarantee legibility over bright video feeds.
*   As an operator, I want to adjust the opacity, padding, and corner roundedness of the background box.

**Acceptance Criteria:**
*   The Settings UI shall include a toggle switch to enable or disable `Show Background Box`.
*   Operators shall be able to select `Background Color` and adjust `Background Opacity` slider from `0%` (Fully Transparent) to `100%` (Fully Solid).
*   Operators shall be able to adjust `Vertical Padding` (0px - 50px), `Horizontal Padding` (0px - 100px), and `Border Radius` (0px - 50px).
*   The container max-width option (`max-w-7xl`, `max-w-5xl`, etc.) shall be selectable.

**Edge Cases:**
*   **Disabled Background Box:** When toggled off (`show_background: false`), the container background shall remain completely transparent without extra padding DOM footprint.
*   **Full Opacity:** 100% opacity shall render a solid box without obscuring more video real estate than configured.

---

## Live Preview and Real-Time Synchronization

Ensuring operators can preview changes before or while broadcasting.

### Preset Profiles & Active Style Selection

Operators can save multiple display setting presets and toggle which one is currently active.

**User Stories:**
*   As an operator, I want to save multiple display presets (e.g., "Minimalist White", "Lower Third Yellow Box", "Neon Broadcast") so I can switch themes for different parts of an event.
*   As an operator, I want to select which display setting is active so that only one theme governs the live OBS Display output at any given time.

**Acceptance Criteria:**
*   The system SHALL allow operators to create, name, and save multiple display setting presets in the database.
*   The system MUST enforce that **only one display setting preset can be active (`is_active = 1`) at any given time**.
*   Activating a new preset SHALL automatically deactivate (`is_active = 0`) all other presets.
*   Selecting a new active preset SHALL immediately trigger a REST update and dispatch the `display:settings-updated` WebSocket event to update the live OBS overlay.
*   A "Reset to Default" button shall restore active parameters to standard PentasLirik styling.

**Edge Cases:**
*   **Unsaved Changes:** If auto-save is active, debounce (300ms) must be applied to slider inputs to avoid flooding API requests.
*   **Multiple Active Attempts:** When a preset is activated, the backend transaction must atomically set `is_active = 0` for all other rows before setting `is_active = 1` on the chosen preset.
*   **Network Failure:** If backend save fails, the preview shall show an error alert and keep previous active settings on OBS.
