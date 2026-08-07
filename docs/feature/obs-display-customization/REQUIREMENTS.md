# REQUIREMENTS.md: OBS Display Customization

## Functional Requirements

### User-Facing (Display Settings Panel)

**FR-01: Font & Character Size Control**
The system MUST provide intuitive controls for adjusting font size, font weight, text casing, and text alignment.
*   `FR-01.1`: The system SHALL present an interactive slider and a numeric input field allowing operators to adjust `Font Size` within a range of `16px` to `120px` (Default: `48px`).
*   `FR-01.2`: The system SHALL allow operators to choose from predefined `Font Weight` values (`Normal (400)`, `Semi-Bold (600)`, `Bold (700)`, `Extra-Bold (800)`).
*   `FR-01.3`: The system SHALL allow operators to select `Text Transform` casing options (`UPPERCASE`, `Capitalize`, `As-Is`).
*   `FR-01.4`: The system SHALL allow operators to set text alignment (`left`, `center`, `right`).

**FR-02: Text Color & Effect Customization**
The system MUST allow operators to customize text colors, text shadows, and text stroke width/colors.
*   `FR-02.1`: The system SHALL provide a Color Picker component supporting HEX and RGBA color codes, alongside preset color buttons for quick selection.
*   `FR-02.2`: The system SHALL allow operators to adjust `Text Shadow Color` (RGBA) and `Text Shadow Blur` radius in pixels.
*   `FR-02.3`: The system SHALL allow operators to adjust `Text Stroke Width` (0px to 4px) and `Text Stroke Color`.

**FR-03: Background Box & Container Customization**
The system MUST allow operators to configure a background box container behind lyrics to optimize contrast.
*   `FR-03.1`: The system SHALL provide a toggle switch to enable or disable the background box container (`show_background`).
*   `FR-03.2`: The system SHALL provide a Color Picker and an Opacity slider (0% to 100%) for the background box.
*   `FR-03.3`: The system SHALL allow operators to adjust `Vertical Padding` (0px - 50px), `Horizontal Padding` (0px - 100px), and `Border Radius` (0px - 50px) for container corners.
*   `FR-03.4`: The system SHALL allow operators to select container `Max Width` bounds (`max-w-7xl`, `max-w-5xl`, etc.).

**FR-04: Live Preview & Synchronization**
The Display Settings Panel MUST provide a live visual preview and a mechanism to apply or reset settings.
*   `FR-04.1`: The Display Settings Panel MUST include a simulated Mini OBS Display Canvas that updates in real-time as controls are manipulated.
*   `FR-04.2`: The system SHALL allow creating and storing multiple display setting presets in the database.
*   `FR-04.3`: The system MUST enforce that **only one display setting preset can be active (`is_active = 1`) system-wide at any given time**, and activating a preset automatically deactivates all others (`is_active = 0`).
*   `FR-04.4`: The system SHALL provide a "Reset to Default" button to restore all styling options to system defaults.
*   `FR-04.5`: Saving or activating a display setting SHALL persist the record to MySQL via API and immediately trigger a real-time WebSocket broadcast event (`display:settings-updated`).

### System & Display Layer

**FR-05: Real-time Settings Broadcasting**
The backend MUST broadcast display styling changes to all active `OBSDisplay.tsx` components.
*   `FR-05.1`: The Laravel backend, using Laravel Reverb, MUST broadcast the `display:settings-updated` WebSocket event on channel `display` whenever display settings are updated.
*   `FR-05.2`: All connected `OBSDisplay.tsx` clients SHALL update their CSS inline styles immediately without re-rendering or unmounting the active lyric component.

**FR-06: State Synchronization on Display Load**
The OBS Display Layer MUST load the latest active display settings upon initial launch or page reload.
*   `FR-06.1`: The active display settings record MUST be served via `GET /api/v1/display/settings` and cached in Redis.
*   `FR-06.2`: Upon initial load, `OBSDisplay.tsx` MUST fetch active settings and apply styling before establishing the WebSocket connection.
*   `FR-06.3`: The `LiveState` object broadcast during live lyric updates MUST include the current `settings` payload object for newly connected display clients.

## Non-Functional Requirements

| Category | Requirement | Measurable Target |
|:---|:---|:---|
| **Performance** | Settings update broadcast latency over local network. | < 150ms (95th percentile) |
| **Performance** | Input slider debounce time in Display Settings UI. | 300ms debounce to prevent API request flooding |
| **Performance** | OBS Display re-render impact. | Zero text flicker or visual glitch during live broadcast |
| **Availability** | Fallback synchronization when WebSocket disconnects. | Fallback to HTTP polling `/api/v1/display/settings` every 500ms |
| **Compatibility** | Canvas background transparency. | Main canvas container background MUST remain completely transparent (`bg-transparent`) |
| **Compatibility** | OBS Browser Source rendering. | Full compatibility with OBS Studio Chromium Browser Source Engine (1080p, 4K, 720p) |
| **Usability** | Color input validation. | Invalid color inputs MUST fallback gracefully to default `#FFFFFF` text / `rgba(0,0,0,0.6)` background |

## Technical Constraints

*   **Backend Framework:** Laravel (PHP) via Sail MUST handle API validation and display settings persistence.
*   **Database Engine:** MySQL MUST be used to store `display_settings` records.
*   **Real-time Protocol:** Laravel Reverb MUST be used for WebSocket event broadcasting (`display:settings-updated`).
*   **Frontend Framework:** React 19 + TypeScript (`OBSDisplay.tsx`) with Framer Motion MUST render inline dynamic CSS styles.
*   **Color Formats:** HEX and RGBA string formats MUST be supported for colors and shadow properties.

## Assumptions

*   **Single Active Theme:** A single active display setting record (`is_active = 1`) governs the visual overlay for all connected OBS displays.
*   **CSS Standards:** The OBS Studio Browser Source supports standard CSS flexbox, padding, border-radius, and text-shadow properties.
*   **Persistent Connection:** High-speed Gigabit LAN guarantees instant distribution of styling events.
