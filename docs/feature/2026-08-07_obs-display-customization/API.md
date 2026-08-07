# API.md: OBS Display Customization

This document outlines the API endpoints and WebSocket protocol specifications for the **OBS Display Customization** feature in PentasLirik.

## Authentication & Authorization

All management endpoints for updating display settings and managing presets require authentication via Bearer Token (Laravel Sanctum).

*   **Authentication Method:** Bearer Token.
*   **Header Format:** `Authorization: Bearer {your_access_token}`
*   **Authorization:** Reading active settings (`GET /api/v1/display/settings`) is accessible to `Operator` and `Admin` (or public for local OBS clients), while creating, updating, and activating presets requires `Operator` or `Admin` roles.

## Standard Response & Pagination Formats

API responses adhere to the standard PentasLirik response format.

*   **Single Resource Fetch:**
    ```json
    {
      "data": {
        // Resource object
      }
    }
    ```
*   **Collection Fetch:**
    ```json
    {
      "data": [
        // Array of resource objects
      ]
    }
    ```
*   **Action Confirmation:**
    ```json
    {
      "message": "Action successful.",
      "data": {
        // Updated resource details
      }
    }
    ```

## API Endpoints

The following sections detail the API endpoints for managing OBS Display custom settings and preset profiles.

### 1. Active Display Setting Management

### `GET /api/v1/display/settings`
*   **Description:** Retrieves the currently active OBS display custom styling configuration.
*   **Auth Level:** Public / Operator, Admin
*   **Query Parameters:** None
*   **Request Body (JSON):** None
*   **Response Body (JSON):**
    ```json
    {
      "data": {
        "id": 1,
        "name": "Default Style",
        "is_active": true,
        "font_size": 48,
        "font_weight": "800",
        "text_transform": "uppercase",
        "align_items": "center",
        "text_color": "#FFFFFF",
        "text_shadow_color": "rgba(0, 0, 0, 0.8)",
        "text_shadow_blur": 10,
        "text_stroke_width": 0,
        "text_stroke_color": "#000000",
        "show_background": false,
        "background_color": "rgba(0, 0, 0, 0.6)",
        "background_opacity": 60,
        "padding_vertical": 16,
        "padding_horizontal": 32,
        "border_radius": 12,
        "max_width": "max-w-7xl",
        "created_at": "2026-08-07T13:00:00Z",
        "updated_at": "2026-08-07T13:00:00Z"
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Display settings successfully retrieved.
    *   `500 Internal Server Error`: Database fetch error.

### `PUT /api/v1/display/settings`
*   **Description:** Updates the active OBS display custom styling settings and triggers a real-time WebSocket broadcast to all connected display clients.
*   **Auth Level:** Operator, Admin
*   **Request Body (JSON):**
    ```json
    {
      "font_size": 60,
      "font_weight": "700",
      "text_transform": "uppercase",
      "align_items": "center",
      "text_color": "#FFD700",
      "text_shadow_color": "rgba(0, 0, 0, 0.9)",
      "text_shadow_blur": 12,
      "show_background": true,
      "background_color": "rgba(0, 0, 0, 0.8)",
      "background_opacity": 80,
      "padding_vertical": 20,
      "padding_horizontal": 40,
      "border_radius": 16
    }
    ```
*   **Response Body (JSON):**
    ```json
    {
      "message": "Display settings updated and broadcasted successfully.",
      "data": {
        "id": 1,
        "font_size": 60,
        "text_color": "#FFD700",
        "show_background": true,
        "updated_at": "2026-08-07T13:05:00Z"
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Display settings successfully updated.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have sufficient permissions.
    *   `422 Unprocessable Entity`: Validation errors (e.g., `font_size` out of bounds, invalid color HEX/RGBA).

---

### 2. Preset Profiles Management

### `GET /api/v1/display/presets`
*   **Description:** Retrieves all saved display setting presets stored in the database.
*   **Auth Level:** Operator, Admin
*   **Response Body (JSON):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "Default Style",
          "is_active": false,
          "font_size": 48,
          "text_color": "#FFFFFF"
        },
        {
          "id": 2,
          "name": "Lower Third Yellow Box",
          "is_active": true,
          "font_size": 60,
          "text_color": "#FFD700",
          "show_background": true
        }
      ]
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Presets list successfully retrieved.

### `POST /api/v1/display/presets`
*   **Description:** Creates a new display setting preset profile.
*   **Auth Level:** Operator, Admin
*   **Request Body (JSON):**
    ```json
    {
      "name": "Neon Broadcast",
      "font_size": 52,
      "text_color": "#00EEEE",
      "text_shadow_color": "rgba(0, 238, 238, 0.5)",
      "show_background": true,
      "background_color": "rgba(0, 0, 0, 0.9)"
    }
    ```
*   **Response Body (JSON):**
    ```json
    {
      "message": "Display preset created successfully.",
      "data": {
        "id": 3,
        "name": "Neon Broadcast",
        "is_active": false,
        "font_size": 52,
        "text_color": "#00EEEE"
      }
    }
    ```

### `PUT /api/v1/display/presets/{id}`
*   **Description:** Updates styling attributes of an existing saved preset. If the target preset is currently active (`is_active = 1`), it also updates the Redis active cache and broadcasts the `display:settings-updated` WebSocket event.
*   **Auth Level:** Operator, Admin
*   **Request Body (JSON):**
    ```json
    {
      "name": "Neon Broadcast Updated",
      "font_size": 56,
      "text_color": "#00FFFF"
    }
    ```
*   **Response Body (JSON):**
    ```json
    {
      "message": "Display preset updated successfully.",
      "data": {
        "id": 3,
        "name": "Neon Broadcast Updated",
        "is_active": false,
        "font_size": 56,
        "text_color": "#00FFFF"
      }
    }
    ```

### `POST /api/v1/display/presets/{id}/activate`
*   **Description:** Atomically activates the chosen display setting preset (`is_active = 1`), deactivates all other presets (`is_active = 0`), updates the Redis active cache, and dispatches the `display:settings-updated` WebSocket broadcast to immediately update all connected OBS display overlays.
*   **Auth Level:** Operator, Admin
*   **Response Body (JSON):**
    ```json
    {
      "message": "Display preset activated and broadcasted successfully.",
      "data": {
        "id": 3,
        "name": "Neon Broadcast",
        "is_active": true,
        "font_size": 52,
        "text_color": "#00EEEE"
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Preset activated and broadcasted.
    *   `404 Not Found`: Target preset ID does not exist.

### `DELETE /api/v1/display/presets/{id}`
*   **Description:** Deletes a saved display setting preset. Active preset cannot be deleted.
*   **Auth Level:** Operator, Admin
*   **Status Codes:**
    *   `200 OK`: Preset deleted.
    *   `422 Unprocessable Entity`: Cannot delete currently active preset.

---

## WebSocket Protocol & Decoupled Payload Strategy

PentasLirik uses Laravel Reverb to broadcast state and styling changes. To eliminate visual text flicker and avoid payload bloat, dynamic lyric text updates (`display:update`) are decoupled from active visual styling updates (`display:settings-updated`).

### 1. Visual Style Event: `display:settings-updated`
Broadcasted when an operator modifies visual settings or activates a new preset.

*   **Channel Name:** `display`
*   **Event Name:** `display:settings-updated` (or `App\Events\DisplaySettingsUpdatedEvent`)
*   **Payload:**
```json
{
  "event": "display:settings-updated",
  "data": {
    "id": 3,
    "name": "Neon Broadcast",
    "is_active": true,
    "font_size": 52,
    "font_weight": "700",
    "text_transform": "uppercase",
    "text_color": "#00EEEE",
    "text_shadow_color": "rgba(0, 238, 238, 0.5)",
    "show_background": true,
    "background_color": "rgba(0, 0, 0, 0.9)",
    "padding_vertical": 20,
    "padding_horizontal": 40,
    "border_radius": 16,
    "updated_at": 1786194300
  }
}
```

### 2. Dynamic Lyric Event: `display:update`
Broadcasted when an operator advances lyric chunks. Consumes active styling pre-cached in `localStorage` / React State.

*   **Channel Name:** `display`
*   **Event Name:** `display:update`
*   **Payload:**
```json
{
  "event": "display:update",
  "data": {
    "type": "lyric",
    "content": "HALELUYA PUJI TUHAN",
    "song_id": 12,
    "lyric_chunk_id": 4,
    "updated_at": 1786194300
  }
}
```
