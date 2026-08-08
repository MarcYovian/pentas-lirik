# ARCHITECTURE: Mobile-First Redesign & Dedicated Mobile Control Panel

## Component Architecture & Responsive Hierarchy

```mermaid
graph TD
    App[App.tsx - Router & State Provider] --> Navbar[Navbar.tsx - Responsive Header & Mobile Drawer]
    App --> MainContent{Viewport Width Breakpoint}
    
    MainContent -->|< 768px (Mobile)| MobileViewContainer[Mobile View Architecture]
    MainContent -->|>= 768px (Desktop)| DesktopViewContainer[Desktop View Architecture]
    
    subgraph MobileViewContainer
        MLCP[LiveControlPanel.tsx - Mobile Layout Mode]
        SetlistDrawer[Setlist Quick Drawer / Bottom Sheet]
        StanzaCards[Thumb-Friendly Stanza Cards Container]
        MobileStepper[Sticky Bottom Stepper & Emergency Toggles]
        
        MLCP --> SetlistDrawer
        MLCP --> StanzaCards
        MLCP --> MobileStepper
    end

    subgraph DesktopViewContainer
        DLCP[LiveControlPanel.tsx - Desktop 3-Column Layout]
        SetlistSidebar[Setlist Left Sidebar]
        StanzaGrid[Center Stanza Grid]
        LivePreviewPanel[Right OBS Live Preview Panel]
        
        DLCP --> SetlistSidebar
        DLCP --> StanzaGrid
        DLCP --> LivePreviewPanel
    end

    MLCP -->|WebSocket Event| Server[server.ts / Backend WebSocket]
    DLCP -->|WebSocket Event| Server
    Server -->|Sync Broadcast| OBS[OBSDisplay.tsx Overlay]
```

---

## Responsive Breakpoint Strategy

We follow **Tailwind CSS v4** mobile-first breakpoint conventions:

```css
/* Mobile First Base (< 640px): Default styles targeted at portrait smartphones */
.control-container {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
}

/* Small Tablet (>= 640px): sm breakpoint */
@media (min-width: 640px) { ... }

/* Medium Tablet / Laptop (>= 768px): md breakpoint */
@media (min-width: 768px) { ... }

/* Desktop (>= 1024px): lg breakpoint */
@media (min-width: 1024px) { ... }
```

---

## State Management & Real-Time Synchronization

1. **State Flow**:
   * Mobile Control Panel triggers stanza change -> updates local React state (`activeStanzaIndex`).
   * WebSocket client sends payload to backend:
     ```json
     {
       "type": "DISPLAY_UPDATE",
       "songId": "song-123",
       "stanzaIndex": 2,
       "lyrics": "Verse 2 text...",
       "isBlank": false,
       "isLogo": false
     }
     ```
   * Server broadcasts state to all connected sockets (OBS Display & Desktop Control Panels).

2. **Mobile Layout Detection**:
   * Use CSS media queries (`block md:hidden` / `hidden md:block`) combined with custom hooks (`useMediaQuery('(max-width: 767px)')`) for layout switching.

---

## Touch Target & Interaction Standards

* Minimum Touch Height & Width: `48px` (`min-h-[48px] min-w-[48px]`).
* Active Feedback: Visual scale pulse (`active:scale-95`) and ripple/highlight state.
* Safe Area Handling: Support for iOS notch / gesture bar (`pb-safe`, `env(safe-area-inset-bottom)`).
