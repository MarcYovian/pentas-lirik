# TASK-09: Real-Time Live State & Reverb Broadcasting API ✅ [SELESAI]

## 🎯 Goal
Mengimplementasikan manajemen state tayangan live pada Redis dan event broadcasting via Laravel Reverb untuk pembaruan instan pada OBS Display Layer dan Operator Dashboard.

## 📄 Blueprint References
- [ARCHITECTURE.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/ARCHITECTURE.md) - Section: Critical Flow Sequence Diagram & Cache (Redis)
- [PRD.md](file:///home/rodex/Documents/cell/projects/pentas-lirik/docs/PRD.md) - Section: FR-05, FR-11, FR-12 (State Synchronization & Broadcasting)

## 📁 Target Files
- `backend/app/Events/DisplayUpdateEvent.php`
- `backend/app/Events/DisplayClearEvent.php`
- `backend/app/Http/Controllers/Api/V1/LiveControlController.php`
- `backend/routes/api.php`
- `backend/tests/Feature/LiveControlApiTest.php`

## 📝 Detailed Requirements
1. **Reverb Broadcast Events:**
   - `DisplayUpdateEvent`: Implementing `ShouldBroadcastNow`. Broadcast channel `display`. Event name `display:update`. Payload: `{ "text": "lirik text", "chunk_id": 12, "song_id": 5 }`.
   - `DisplayClearEvent`: Implementing `ShouldBroadcastNow`. Broadcast channel `display`. Event name `display:clear`. Payload: `{}`.
2. **Live State Management (Redis):**
   - Redis key `live_display_state` menyimpan JSON payload tayangan saat ini.
3. **API Endpoints:**
   - `POST /api/v1/live/display`:
     - Request: `{ "text": "lirik", "chunk_id": 123, "song_id": 456 }`
     - Simpan data ke Redis (`live_display_state`).
     - Trigger `DisplayUpdateEvent`.
   - `POST /api/v1/live/clear`:
     - Hapus/kosongkan Redis (`live_display_state`).
     - Trigger `DisplayClearEvent`.
   - `GET /api/v1/state/live`:
     - Public/unprotected HTTP endpoint (bebas auth) yang mengembalikan isi Redis key `live_display_state` saat ini untuk sinkronisasi OBS saat pertama kali dibuka / di-reload.

## ✅ Acceptance Criteria
- [x] Memanggil `POST /api/v1/live/display` memperbarui data di Redis dan memicu pesan event WebSocket Reverb (`display:update`).
- [x] Memanggil `POST /api/v1/live/clear` mengosongkan status di Redis dan memicu event WebSocket Reverb (`display:clear`).
- [x] Memanggil `GET /api/v1/state/live` mengembalikan status tampilan terkini secara instan (< 50ms) tanpa memerlukan otentikasi.
- [x] Test otomatis `LiveControlApiTest` 100% pass (3 tests passed, 14 assertions).
