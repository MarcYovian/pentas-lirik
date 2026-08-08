# DATABASE: Mobile-First Redesign & Dedicated Mobile Control Panel

## Data Schema Impact Analysis

The Mobile-First UI Redesign and Mobile Control Panel primarily enhance the client-side presentation layer, responsiveness, and WebSocket client interaction. 

No breaking database structural schema modifications are required for this feature. Existing entities (`songs`, `setlists`, `setlist_items`, `display_settings`, `users`) remain unchanged and fully compatible.

---

## Client-Side Session / Local Storage Extensions

To provide optimal mobile user experience across page reloads, client-side preferences are cached in `localStorage`:

| Key | Type | Description | Default Value |
|:----|:-----|:------------|:--------------|
| `pentas_mobile_control_mode` | `boolean` | Preferences for compact mobile view vs full desktop grid on mobile tablets | `true` |
| `pentas_mobile_setlist_drawer_open` | `boolean` | Remembers setlist selector drawer state | `false` |
| `pentas_mobile_preview_docked` | `boolean` | Sticky dock state for mini OBS preview on mobile display settings | `true` |

---

## Real-Time WebSocket Message Payload Specification

When navigating stanzas or quick-switching setlist songs from the mobile control panel, the client emits the standard `LIVE_CONTROL_EVENT`:

```typescript
interface MobileLiveControlPayload {
  type: 'STANZA_CHANGE' | 'SONG_CHANGE' | 'TOGGLE_BLANK' | 'TOGGLE_LOGO';
  setlistId?: string;
  songId: string;
  songTitle: string;
  stanzaIndex: number;
  stanzaLabel: string;
  lines: string[];
  isBlank: boolean;
  isLogo: boolean;
  timestamp: number;
}
```
