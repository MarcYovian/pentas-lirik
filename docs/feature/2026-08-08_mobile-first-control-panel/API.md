# API: Mobile-First Redesign & Dedicated Mobile Control Panel

## Overview

The Mobile Control Panel utilizes existing REST API endpoints for fetching setlists, songs, and display settings, while utilizing WebSocket events for real-time live synchronization.

---

## REST Endpoints Consumed by Mobile Control Panel

### 1. Fetch Active Setlist with Songs
* **Endpoint**: `GET /api/setlists/active`
* **Response**:
```json
{
  "id": "setlist-2026-08-08",
  "name": "Ibadah Minggu Pagi",
  "items": [
    {
      "id": "item-1",
      "order": 1,
      "songId": "song-001",
      "title": "Bapa Yang Kekal",
      "artist": "NDW",
      "key": "C",
      "stanzas": [
        {
          "label": "Verse 1",
          "lines": ["Kasih yang sempurna", "Telah kuterima dari-Mu"]
        },
        {
          "label": "Chorus",
          "lines": ["Bapa Engkau sungguh baik", "Kasih-Mu melimpah di hidupku"]
        }
      ]
    }
  ]
}
```

---

## WebSocket Protocol Specification (`ws://...`)

### Outgoing Mobile Client Events

#### 1. Trigger Stanza Broadcast
```json
{
  "event": "broadcast_stanza",
  "data": {
    "setlistId": "setlist-2026-08-08",
    "songId": "song-001",
    "stanzaIndex": 1,
    "stanzaLabel": "Chorus",
    "lines": ["Bapa Engkau sungguh baik", "Kasih-Mu melimpah di hidupku"],
    "isBlank": false,
    "isLogo": false
  }
}
```

#### 2. Emergency Blank Toggle
```json
{
  "event": "toggle_blank",
  "data": {
    "isBlank": true
  }
}
```
