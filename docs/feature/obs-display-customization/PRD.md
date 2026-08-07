# PRD: OBS Display Customization

## Executive Summary & Product Vision

The **OBS Display Customization** feature extends PentasLirik's live presentation capabilities by introducing real-time, user-configurable visual styling for the OBS Display overlay ([OBSDisplay.tsx](file:///home/rodex/Documents/cell/projects/pentas-lirik/frontend/src/components/OBSDisplay.tsx)). 

Currently, display styling uses fixed values (`text-3xl sm:text-4xl md:text-5xl lg:text-6xl`, solid white text, fixed text shadow, and transparent background). The vision for this feature is to grant operators full control over font size, text colors, outline/shadow effects, and background box containers, allowing lyrics and announcements to adapt seamlessly to any camera feed, stage lighting, or broadcast theme.

## Problem Statement & Target Users

Live streaming productions in houses of worship, concert halls, and corporate events operate under dynamic lighting conditions and varied video backgrounds. 

**Problems Addressed:**
*   **Rigid Font Scaling:** Hardcoded font sizes do not fit all screen resolutions or long lyric phrases, leading to line overflows or tiny illegible text.
*   **Poor Text Contrast:** Solid white text without background highlight is often unreadable over bright camera shots or white background feeds.
*   **Lack of Background Highlighting:** Operators cannot add a semi-transparent box container behind text to guarantee legibility during live broadcasts.

**Target Users:**
*   **AV Technicians & Media Directors:** Require exact control over typography, branding colors, and screen legibility.
*   **Volunteer Operators:** Require an intuitive UI (sliders, color pickers, quick presets) that updates live without disrupting an ongoing stream.

## System Scope & User Roles

This feature adds a Display Settings module accessible from the Admin & Operator Dashboard, backed by database persistence and real-time WebSocket distribution via Laravel Reverb.

| Permission / Action | Admin | Operator |
|:-----------------------------------|:--------------------:|:--------------------:|
| **Display Customization** | | |
| View Active Display Settings | ✅ | ✅ |
| Adjust Font Size & Weight | ✅ | ✅ |
| Change Text & Shadow Colors | ✅ | ✅ |
| Toggle & Style Background Box | ✅ | ✅ |
| Save & Broadcast Active Display Setting | ✅ | ✅ |
| Reset Active Display Setting to Default | ✅ | ✅ |
| View, Create & Delete Saved Presets | ✅ | ✅ |
| One-Click Activate Preset Profile | ✅ | ✅ |

## Functional Requirements

### Operator & General User Requirements

*   **FR-01: Font Size & Scaling Control**
    *   The system must provide an interactive slider and numeric input for adjusting font size from `16px` to `120px` (Default: `48px`).
    *   The system must support selecting font weights (`Normal`, `Semi-Bold`, `Bold`, `Extra-Bold`) and text casing (`UPPERCASE`, `Capitalize`, `As-Is`).

*   **FR-02: Text Color & Effect Customization**
    *   The system must provide a Color Picker (HEX/RGBA) and quick palette buttons for text color.
    *   The system must support customizing text shadow color, blur radius, text stroke width (0px - 4px), and stroke color.

*   **FR-03: Background Box Container**
    *   The system must allow toggling a background box behind text on/off (`show_background`).
    *   The system must provide controls for background color, opacity slider (0% to 100%), vertical/horizontal padding, and corner border-radius.

*   **FR-04: Live Preview Panel**
    *   The Display Settings UI must render a simulated Mini OBS Canvas showing immediate visual feedback as sliders and pickers change.
    *   A "Reset to Default" button must restore all parameters to default PentasLirik styling.

### System & Backend Requirements

*   **FR-05: Data Persistence & API**
    *   The system must store active display settings in the `display_settings` MySQL table.
    *   The backend must expose `GET /api/v1/display/settings` to retrieve active settings and `PUT /api/v1/display/settings` to save updates.

*   **FR-06: Real-time Broadcasting**
    *   Upon saving display settings, the backend must dispatch a `display:settings-updated` event over Laravel Reverb to all active `OBSDisplay.tsx` instances.
    *   The `LiveState` payload must embed current display settings so newly reloaded OBS Browser Sources load the active styling automatically.

## Non-Functional Requirements

| Category | Requirement |
|:--------------|:-----------------------------------------------------------------------------------------------------------------------------------------|
| **Performance** | • Customization updates (save to display render) must take < 150ms over LAN. • Input slider changes in admin UI must utilize 300ms debounce to avoid spamming network requests. |
| **Compatibility**| • The main canvas background of `OBSDisplay.tsx` must remain transparent (`bg-transparent`) to preserve OBS Studio overlay capability. |
| **Reliability** | • In case of WebSocket connection loss, display clients must fallback to polling `/api/v1/display/settings`. |
| **Usability** | • Color pickers must accept standard HEX codes and RGBA strings. Preset color palettes must be accessible with a single click. |

## Technology Stack & Rationale

| Component | Technology | Rationale |
|:-----------------------|:-------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| **Backend Framework** | Laravel 13 (Sail) | Manages display setting validation, REST endpoints, and DB persistence. |
| **Real-time Events** | Laravel Reverb | Broadcasts `display:settings-updated` WebSocket events to active displays. |
| **Frontend Framework** | React 19 + TypeScript | Powers the Display Settings Panel UI and the live `OBSDisplay.tsx` overlay. |
| **Database** | MySQL (via Sail) | Stores settings records in `display_settings` table. |
| **UI Styling** | Tailwind CSS v4 + Framer Motion | Provides dynamic inline styling, padding, and smooth transition animations for the text container. |

## Success Metrics & KPIs

| Metric | KPI / Target | Measurement Method |
|:--------------------------------|:----------------------------------------------------------------------------------|:--------------------------------------------------------------------------------|
| **Broadcast Update Latency** | 99th percentile end-to-end setting update latency < 150ms. | Timestamp log from settings save API call to React DOM style mutation in OBS. |
| **Visual Legibility** | 100% readability of lyrics over bright video feeds when background box is enabled.| Operator verification during live stream tests. |

## Risk Analysis & Mitigation

| Risk | Impact | Mitigation Strategy |
|:-----------------------------------|:-------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Excessive Re-renders in OBS** | Medium | Memoize display styling in `OBSDisplay.tsx` and update CSS properties via React state without unmounting the lyric element. |
| **Invalid Color Input Strings** | Low | Implement server-side and client-side validation for HEX/RGBA strings; fallback gracefully to `#FFFFFF` text and `rgba(0,0,0,0.6)` background. |

## Constraints & Assumptions

*   **LAN Scope:** Operates on local network deployment.
*   **System Fonts:** Uses system/Google web fonts available to the browser.
*   **OBS Browser Source:** Assumes OBS Studio version 28+ with modern Chromium Browser Source engine.

## Out of Scope

*   Upload of custom `.ttf` / `.otf` font files from local disk.
*   Per-word karaoke-style animation timing.
