# USER_FLOW: Mobile-First Redesign & Dedicated Mobile Control Panel

## Mobile Operator Journey Map

```mermaid
sequenceDiagram
    autonumber
    actor Op as Mobile Operator
    participant App as Mobile UI (PentasLirik)
    participant WS as WebSocket Server
    participant OBS as OBS Display

    Op->>App: Opens PentasLirik on Mobile Browser
    App-->>Op: Displays Mobile Header & Live Control Panel
    
    Op->>App: Taps Setlist Dropdown Pill
    App-->>Op: Opens Bottom Sheet Setlist Drawer
    
    Op->>App: Selects "Bapa Yang Kekal" (Song 2)
    App-->>Op: Closes Drawer & Loads Stanzas for "Bapa Yang Kekal"
    
    Op->>App: Taps "Chorus" Stanza Card
    App->>WS: Sends STANZA_CHANGE Event
    WS-->>OBS: Broadcasts Chorus Lyrics
    App-->>Op: Highlights Chorus Card (Active Glow)
    
    Op->>App: Taps Sticky "NEXT STANZA" Thumb Button
    App->>WS: Sends STANZA_CHANGE Event (Bridge)
    WS-->>OBS: Broadcasts Bridge Lyrics
    App-->>Op: Highlights Bridge Card
    
    Op->>App: Taps Emergency "BLANK" Button
    App->>WS: Sends TOGGLE_BLANK Event
    WS-->>OBS: Clears Lyrics on OBS Display
    App-->>Op: Shows Active Blank Badge
```

---

## Key User Interaction Scenarios

### Scenario A: Switching Songs During Live Performance
1. Operator taps top Setlist Selector Pill on mobile control panel.
2. Bottom sheet smoothly slides up presenting all songs in the active setlist with order numbers and keys.
3. Operator taps desired song.
4. Sheet dismisses and the new song's stanzas are rendered instantly on screen ready for one-tap broadcasting.

### Scenario B: One-Handed Stanza Stepping
1. Operator holds phone in one hand.
2. Bottom sticky bar contains `[ PREV STANZA ]` (left thumb zone) and `[ NEXT STANZA ]` (right thumb zone).
3. Operator taps `NEXT STANZA` repeatedly as the worship leader leads the song.
4. OBS overlay updates in real-time with zero delay.
