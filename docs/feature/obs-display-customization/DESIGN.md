# DESIGN.md: OBS Display Customization

This document outlines the visual design system, UI components, typography scales, color palettes, and interaction design specifications for the **OBS Display Customization** feature in PentasLirik.

## 1. Brand & Visual Identity Integration

The Display Customization feature aligns with PentasLirik's core identity—modern, functional, and responsive—by providing an intuitive control panel for live video styling. The design system balances dark-mode operator controls with customizable real-time broadcast typography for the OBS overlay.

## 2. User Experience Goals

1.  **Immediate Visual Feedback:** Any change to slider values (font size, padding, border radius) or color pickers in the Display Settings panel updates a simulated Mini OBS Display Canvas instantly (< 50ms).
2.  **Effortless Contrast & Legibility Management:** Operators can toggle and style background boxes and text shadows with minimal clicks to adapt to changing live camera feeds and lighting.
3.  **One-Click Preset Activation:** Switching between saved display theme presets (e.g. "Minimalist White", "Lower Third Box") occurs seamlessly via a single action.

## 3. Color & Styling Controls System

The control panel enables customization across primary text, text shadows, outlines, and background box containers.

### Preset Color Palette

| Color Role | Default Hex / RGBA | Description |
| :--- | :--- | :--- |
| **Default Text Color** | `#FFFFFF` | Pure white text for high contrast on dark video feeds. |
| **Highlight Accent** | `#FFD700` | Gold/Yellow text for prominent chorus or emphasized lyrics. |
| **Secondary Cyan** | `#00EEEE` | Vibrant cyan for announcement badges. |
| **Default Shadow** | `rgba(0, 0, 0, 0.8)` | Deep black text shadow for legibility over light video shots. |
| **Default Box BG** | `rgba(0, 0, 0, 0.6)` | Semi-transparent dark background box container. |

```css
/* Display Overlay CSS Custom Variables (Dynamic Inline Styles) */
:root {
  --obs-font-size: 48px;
  --obs-font-weight: 800;
  --obs-text-transform: uppercase;
  --obs-text-color: #FFFFFF;
  --obs-text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.8);
  --obs-text-stroke: 0px #000000;
  --obs-bg-color: rgba(0, 0, 0, 0.6);
  --obs-bg-padding: 16px 32px;
  --obs-border-radius: 12px;
}
```

## 4. Typography & Scaling Specifications

### Display Layer Specifics (`OBSDisplay.tsx`)

*   **Font Family:** `Montserrat` (or `Inter` fallback).
*   **Font Size Range:** `16px` to `120px` (Default: `48px`). Responsive bounds via CSS `clamp()` or direct pixel values.
*   **Font Weights:** `Normal (400)`, `Semi-Bold (600)`, `Bold (700)`, `ExtraBold (800)`.
*   **Text Casing:** `UPPERCASE` (Default), `Capitalize`, or `As-Is`.
*   **Text Alignment:** `center` (Default), `left`, `right`.

### Control Panel UI Scale

*   **Input Controls:** Dual-binding Slider + Number Input (`16px` min, `120px` max).
*   **Color Picker Controls:** Swatch selection + HEX / RGBA text field input.

## 5. UI Components & Settings Panel Layout

The Display Customization UI (`/settings/display`) follows an intuitive 2-column or stacked layout:

*   **Left Column (Control Panel):**
    *   **Preset Selector:** Dropdown and "Save New Preset" button.
    *   **Typography Controls Section:** Size slider, weight selector, text casing buttons.
    *   **Color & Shadow Section:** Text color picker, text shadow blur slider, stroke width.
    *   **Background Container Section:** Toggle switch (`Show Background Box`), color picker, opacity slider (0-100%), padding sliders, border-radius slider.
*   **Right Column / Top (Mini OBS Live Preview Canvas):**
    *   Simulated 16:9 video frame background (toggleable dark/light video test patterns).
    *   Real-time rendered lirik container mirroring `OBSDisplay.tsx` styling.

## 6. Interaction & Motion

*   **Live Preview Updates:** Real-time mutation of local CSS variables on the preview canvas without delay.
*   **API Debounce:** `300ms` debounce on slider changes before persisting to backend API.
*   **Preset Activation Animation:** Active preset badge transitions with a smooth `200ms` highlight color fade.
*   **Display Layer Overlay Motion:** Smooth Framer Motion fade-in (`opacity: 0 -> 1`, `y: 15px -> 0px`) and fade-out (`opacity: 1 -> 0`, `y: 0px -> -15px`) over `200ms - 300ms`.

## 7. Accessibility & Safety Boundaries

*   **Contrast Safeguards:** The UI provides visual warning indicators when text color and background box color lack sufficient contrast (< 3:1).
*   **Fallback Rendering:** If custom color strings are malformed, the component falls back safely to default white `#FFFFFF` text and black shadow `rgba(0,0,0,0.8)`.
*   **Transparent Canvas Integrity:** The root overlay container strictly enforces `pointer-events-none` and `bg-transparent` to prevent blocking the underlying video stream in OBS Studio.
