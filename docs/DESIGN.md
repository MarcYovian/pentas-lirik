# DESIGN.md: PentasLirik

## 1. Brand & Visual Identity

PentasLirik embodies a professional, modern, and highly functional aesthetic, designed for clarity and real-time responsiveness in live event production. The visual identity emphasizes clean lines, intuitive controls, and immediate feedback, ensuring operators can confidently manage dynamic content in high-pressure environments. The brand conveys reliability and precision, reflecting its role as a critical tool for seamless live streaming.

## 2. User Experience Goals

1.  **Real-time Responsiveness (Latency < 100ms):** Operators can trigger lyric changes or announcements, and the corresponding display update on OBS occurs within 100 milliseconds, ensuring a fluid and synchronized live experience.
2.  **Operator Efficiency (Single-Action Control):** Key live control actions (sending a lyric, clearing the screen, advancing to the next chunk) are achievable with a single click or keyboard shortcut, minimizing cognitive load and reaction time during live events.
3.  **Unambiguous State Feedback:** The Operator Dashboard provides clear, immediate, and visually distinct indicators (e.g., red highlight for "LIVE") of the currently displayed content, preventing operator confusion and errors.

## 3. Color Palette

The color palette is designed for clarity, modern aesthetics, and effective communication of live status.

| Semantic Name | Hex Code | Description |
| :------------ | :-------- | :------------------------------------------------- |
| Primary | `#1A202C` | Dark charcoal for main backgrounds, deep contrast. |
| Secondary | `#2D3748` | Slightly lighter dark gray for secondary elements. |
| Accent | `#E53E3E` | Vibrant red for "LIVE" status, alerts, and critical actions. |
| Highlight | `#38B2AC` | Teal for active selections, hover states, and positive feedback. |
| Text Primary | `#F7FAFC` | Light off-white for primary text on dark backgrounds. |
| Text Secondary| `#A0AEC0` | Lighter gray for secondary text, descriptions. |
| Border | `#4A5568` | Medium gray for borders and separators. |

```css
/* CSS Custom Properties */
:root {
  --color-primary: #1A202C;
  --color-secondary: #2D3748;
  --color-accent: #E53E3E; /* Live / Alert */
  --color-highlight: #38B2AC; /* Active / Hover */
  --color-text-primary: #F7FAFC;
  --color-text-secondary: #A0AEC0;
  --color-border: #4A5568;
}

/* Tailwind CSS Config Snippet (simplified) */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A202C',
          light: '#2D3748',
        },
        accent: '#E53E3E',
        highlight: '#38B2AC',
        text: {
          DEFAULT: '#F7FAFC',
          secondary: '#A0AEC0',
        },
        border: '#4A5568',
      },
    },
  },
}
```

## 4. Typography

Readability and clarity are paramount for both the operator dashboard and the live display. A sans-serif font family is chosen for its modern appearance and legibility across various screen sizes and resolutions.

*   **Font Families:**
    *   **Primary UI Font:** `Inter` (Google Fonts: `https://fonts.google.com/specimen/Inter`)
        *   Used for all dashboard text, labels, buttons, and general content.
    *   **Display Layer Font:** `Montserrat` (Google Fonts: `https://fonts.google.com/specimen/Montserrat`)
        *   Chosen for its strong, clear, and bold characteristics, ensuring maximum legibility on the OBS Browser Source against diverse video backgrounds.
    *   **Fallback:** `sans-serif`

*   **Font Size Scale (Operator Dashboard - based on a modular scale with a base of 16px):**
    *   `xs`: 0.75rem (12px) - e.g., metadata, small labels
    *   `sm`: 0.875rem (14px) - e.g., secondary text, list items
    *   `base`: 1rem (16px) - e.g., body text, default button text
    *   `lg`: 1.125rem (18px) - e.g., section titles
    *   `xl`: 1.25rem (20px) - e.g., main headings
    *   `2xl`: 1.5rem (24px) - e.g., large titles
    *   `3xl`: 1.875rem (30px) - e.g., prominent display text

*   **Font Weights (Operator Dashboard):**
    *   `Light`: 300
    *   `Regular`: 400
    *   `Medium`: 500
    *   `SemiBold`: 600
    *   `Bold`: 700

*   **Display Layer Specifics (OBS Browser Source):**
    *   **Font Family:** `Montserrat`
    *   **Font Size:** `clamp(3rem, 8vw, 6rem)` (Responsive sizing to fill lower-third effectively, approximately 48px to 96px depending on OBS source resolution).
    *   **Font Weight:** `Bold` (700) or `ExtraBold` (800) for maximum impact.
    *   **Text Shadow:** `0px 0px 10px rgba(0, 0, 0, 0.8), 0px 0px 20px rgba(0, 0, 0, 0.6)` (Strong, dark shadow for contrast against any background).
    *   **Color:** `var(--color-text-primary)` (`#F7FAFC`)

## 5. UI Components & Spacing

The UI adheres to a consistent design system for predictability and ease of development, leveraging Tailwind CSS for utility-first styling.

*   **Grid Unit:** `8px` (All spacing, padding, and margins will be multiples of 8px for vertical and horizontal rhythm).
*   **Border-Radius Scale:**
    *   `none`: 0px
    *   `sm`: 2px (e.g., small buttons, input fields)
    *   `md`: 4px (e.g., cards, larger buttons)
    *   `lg`: 8px (e.g., prominent containers)
    *   `full`: 9999px (e.g., circular elements)
*   **Standard Spacing Values (based on 8px grid unit):**
    *   `spacing-xs`: 4px (0.5 unit)
    *   `spacing-sm`: 8px (1 unit)
    *   `spacing-md`: 16px (2 units)
    *   `spacing-lg`: 24px (3 units)
    *   `spacing-xl`: 32px (4 units)
    *   `spacing-2xl`: 48px (6 units)
    *   `spacing-3xl`: 64px (8 units)

*   **Common Components:**
    *   **Buttons:** Consistent padding, border-radius, and hover states. Primary, secondary, and accent (danger/live) variants.
    *   **Input Fields:** Standard height, border, and focus states.
    *   **Lists/Cards:** Clear separation, consistent padding, and hover effects for interactive items.
    *   **Modals/Dialogs:** Centered, overlay background, consistent padding.
    *   **Scrollbars:** Styled to match the dark theme, subtle.

## 6. Screen Priorities

The following screens are prioritized based on their criticality to the system's core functionality and user roles.

### Operator Role
1.  **Operator Dashboard (Live Control):** This is the primary interface for live operations. It must be highly optimized for speed, clarity, and real-time feedback. (FR-02, FR-05, FR-06, FR-07, FR-08)
2.  **Setlist Management:** Creating, loading, and modifying setlists is crucial for event preparation. (FR-04)
3.  **Song & Lyric Management:** While less frequent during live events, the ability to quickly find and edit song content is important. (FR-03)

### Admin Role
1.  **User Management:** Critical for system administrators to onboard and manage users. (FR-13)
2.  **Operator Dashboard (Live Control):** Admins also need full access to live control features.
3.  **Song & Lyric Management:** Admins are typically responsible for maintaining the content library.

### System Display
1.  **OBS Browser Source Display:** This is the output of the system and must be robust, performant, and visually appealing. (FR-09, FR-10, FR-12)

## 7. Interaction & Motion

Interactions are designed to be immediate and provide clear feedback, while animations are smooth and non-distracting, especially on the live display.

*   **Hover States:**
    *   **Interactive Elements (buttons, list items, clickable chunks):** A subtle background color change (e.g., `var(--color-highlight)` with reduced opacity or a slightly lighter `var(--color-secondary)`) and/or a slight `transform: translateY(-2px)` for buttons.
    *   **Text Links:** Underline or color change to `var(--color-highlight)`.
*   **Click/Active States:**
    *   **Buttons:** A brief, darker background change or slight `transform: scale(0.98)` to indicate press.
    *   **Live Lyric Chunk:** Solid `var(--color-accent)` background with `var(--color-text-primary)` text, maintained until a new chunk is live or screen is cleared.
*   **Transitions:**
    *   **UI Elements:** `transition-property: background-color, border-color, color, transform, opacity; transition-duration: 150ms; transition-timing-function: ease-in-out;` for smooth visual changes on hover/focus.
*   **Animation Durations:**
    *   **Display Layer (Text Fade-in/out):** `300ms` to `500ms` (as per FR-10). This ensures a smooth, professional appearance without being too slow for rapid changes.
        *   Fade-in: `opacity: 0 -> 1`
        *   Fade-out: `opacity: 1 -> 0`
    *   **UI Feedback (e.g., notification toasts):** `200ms` for appearance/disappearance.
*   **Keyboard Shortcuts:**
    *   `Spacebar` and `Escape` keys will trigger immediate actions without visual delay on the dashboard, though the display layer will respect its animation duration. (FR-07)

## 8. Accessibility

Accessibility is considered to ensure the system is usable by a broad range of operators, including those with visual impairments or who rely on keyboard navigation.

*   **Contrast Ratios:**
    *   **Text on Background:** All primary text (`var(--color-text-primary)`) on `var(--color-primary)` or `var(--color-secondary)` backgrounds will meet WCAG AA contrast ratio of at least 4.5:1.
    *   **Large Text (Display Layer):** The large text on the OBS display will aim for a contrast ratio of at least 3:1 against a theoretical average background, and the strong text shadow is specifically designed to enhance legibility regardless of background complexity.
    *   **Interactive Elements:** States (hover, focus, active) will maintain sufficient contrast.
*   **Keyboard Navigation:**
    *   **Tab Order:** Logical and intuitive tab order for all interactive elements (buttons, input fields, list items) within the Operator Dashboard.
    *   **Focus States:** Clear visual focus indicators (e.g., a distinct border or outline) will be provided for all interactive elements when navigated via keyboard.
    *   **Global Shortcuts:** `Spacebar` for "Next Lyric" and `Escape` for "Clear Screen" are implemented as global listeners when the dashboard is in focus, providing critical rapid control. (FR-07)
*   **Semantic HTML:** Use appropriate HTML5 semantic elements to improve screen reader interpretation and overall document structure.
*   **ARIA Attributes:** Employ ARIA attributes where standard HTML semantics are insufficient to convey meaning or state (e.g., `aria-live` for dynamic updates, `aria-current` for active selections).