# PRD: Mobile-First Redesign & Dedicated Mobile Control Panel

## Executive Summary & Product Vision

The **Mobile-First Redesign & Dedicated Mobile Control Panel** initiative transforms PentasLirik into a fully responsive, mobile-first live lyric presentation platform.

Currently, PentasLirik's user interface—specifically the **Live Control Panel**, **Display Settings Panel**, **Song Library**, **Setlist Rundown**, and **User Management**—is optimized primarily for desktop screens (laptops and monitors). When accessed from smartphones or tablets, operators face compressed elements, narrow touch targets, overflow scrolling issues, and difficult stanza navigation during live events.

The vision for this feature is to establish a **Mobile-First Design System** across all UI components and introduce a specialized, thumb-friendly **Mobile Control Panel**. This enables AV technicians and volunteer operators to comfortably control live lyric displays, switch songs from prepared setlists, navigate stanzas with single-tap controls, and adjust display settings directly from their mobile devices with high confidence and minimal operational effort.

---

## Problem Statement & Target Users

### Problems Addressed
1. **Desktop-Centric Interface Constraints**:
   * Desktop tables, sidebars, and multi-column grid layouts collapse awkwardly on narrow screens (< 768px), requiring horizontal scrolling or shrinking font sizes.
2. **High-Stakes Mobile Operations**:
   * During live events (worship services, concerts, live streams), operators using smartphones require immediate, lag-free access to active setlist songs and stanza controls. Small desktop buttons cause accidental taps or delayed lyric changes.
3. **Lack of Quick-Switch Mobile Workflow**:
   * The desktop view requires switching between tabs and scrolling through complex lists. Mobile operators need a streamlined, single-screen experience focused on:
     * Current Active Song & Stanza Switching
     * Setlist Quick Navigation (Next/Prev Song)
     * Emergency Controls (Blank Screen, Logo, Clear Text)

### Target Users
* **Mobile Stage Operators / Volunteers**: Operators walking around stage or sitting in broadcast booths operating via smartphones (iOS / Android).
* **AV / Media Directors**: Need rapid access to display settings, presets, and live setlist management on mobile and tablet devices.
* **System Administrators**: Need seamless management of users and song libraries across any screen resolution.

---

## System Scope & User Roles

| Feature / Action | Admin (Desktop/Mobile) | Operator (Desktop/Mobile) |
|:----------------------------------------|:----------------------:|:-------------------------:|
| **Mobile Responsive Layouts (All Pages)**| ✅ | ✅ |
| **Dedicated Mobile Live Control Panel** | ✅ | ✅ |
| **Quick Setlist Song Switcher (Mobile)**| ✅ | ✅ |
| **Thumb-Friendly Stanza Pads (Mobile)** | ✅ | ✅ |
| **Emergency Live Toggles (Blank/Clear)** | ✅ | ✅ |
| **Mobile Display Settings & Preview**   | ✅ | ✅ |
| **Touch Gesture & Tap Target Optimization**| ✅ | ✅ |

---

## Functional Requirements Summary

### 1. Mobile-First Responsive Redesign
* **Breakpoints**: Adopt Tailwind CSS v4 responsive breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`) with mobile-first CSS architecture (`base = mobile`).
* **Touch Targets**: All interactive elements (buttons, inputs, toggles, list items) MUST adhere to a minimum touch target size of **44x44px** (recommended **48x48px**).
* **Mobile Navigation**: Replace desktop header navigation on mobile screens with a responsive sticky top app bar and slide-out navigation drawer / bottom navigation bar.

### 2. Dedicated Mobile Control Panel
* **Setlist Drawer / Quick Switcher**: Top collapsible drawer or bottom sheet for selecting any song from the active setlist without leaving the live control interface.
* **Live Stanza Grid / Stack**: Large, high-contrast, thumb-accessible cards for each stanza (Verse 1, Chorus, Bridge, etc.) with active stanza highlighting and tap-to-broadcast action.
* **Next / Previous Quick Stepper**: Sticky bottom bar with extra-large "Previous Stanza" and "Next Stanza" buttons for blind/thumb navigation.
* **Emergency Quick Controls**: One-tap floating action buttons for **BLANK**, **LOGO**, and **CLEAR** states.
* **Real-Time Synchronisation**: Instant state sync across all mobile and desktop devices via WebSocket.

---

## Non-Functional Requirements

* **Performance**: Mobile bundle rendering initial paint under **1.2s** on standard 4G mobile networks.
* **Latency**: Stanza switch trigger to WebSocket broadcast under **50ms**.
* **Usability & Ergonomics**: Optimized for single-handed thumb operation in portrait orientation.
* **Accessibility (a11y)**: High contrast ratios (WCAG AA standard), clear visual focus indicators, and screen reader aria labels on all mobile controls.
* **Cross-Browser Compatibility**: Support for Mobile Safari (iOS 15+), Mobile Chrome/Edge (Android 10+).

---

## Success Metrics

1. **Zero Accidental Taps**: Operators report 100% confidence when tapping stanzas on mobile devices.
2. **Sub-Second Song Switching**: Mobile operators can switch songs in setlist in under **2 seconds**.
3. **100% Mobile Coverage**: All 8 core frontend views fully functional and visually polished on mobile screen widths (320px to 430px portrait).
