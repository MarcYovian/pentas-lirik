# API.md: PentasLirik

## Authentication & Authorization

PentasLirik utilizes a token-based authentication system, typically implemented with Laravel Sanctum for API tokens.

*   **Authentication Method:** Bearer Token (JWT-like API tokens).
*   **Token Acquisition:** Users obtain a token by authenticating via the `/api/v1/auth/login` endpoint.
*   **Token Usage:** The acquired token must be included in the `Authorization` header of all subsequent protected API requests.
    *   **Header Format:** `Authorization: Bearer {your_access_token}`
*   **Authorization:** Access to specific endpoints is controlled by user roles (`Admin` or `Operator`) as defined in `PRD.md`. The backend enforces these roles using middleware.

## Standard Response & Pagination Formats

API responses adhere to a consistent structure for predictability and ease of consumption.

*   **Successful Responses:**
    *   **Single Resource:** For fetching or creating a single entity.
        ```json
        {
          "data": {
            // Resource object
          }
        }
        ```
    *   **Collection/Paginated List:** For fetching multiple entities.
        ```json
        {
          "data": [
            // Array of resource objects
          ],
          "meta": {
            "pagination": {
              "total": 100,
              "count": 10,
              "per_page": 10,
              "current_page": 1,
              "total_pages": 10,
              "links": {
                "next": "http://api.example.com/v1/songs?page=2",
                "previous": null
              }
            }
          }
        }
        ```
    *   **Action Confirmation:** For operations that don't return a specific resource (e.g., clear screen).
        ```json
        {
          "message": "Action successful."
        }
        ```

*   **Error Responses:**
    *   Errors are indicated by appropriate HTTP status codes (e.g., 400, 401, 403, 404, 422, 500).
    *   The response body will contain a `message` and optionally an `errors` object for validation failures.
        ```json
        {
          "message": "The given data was invalid.",
          "errors": {
            "email": ["The email field is required."],
            "password": ["The password must be at least 8 characters."]
          }
        }
        ```

## API Endpoints

The following sections detail the core API endpoints, grouped by their functional domain.

### Authentication

### `POST /api/v1/auth/login`
*   **Description:** Authenticates a user with their email and password, returning a user object and an access token.
*   **Auth Level:** Public
*   **Request Body (JSON):**
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
*   **Response Body (JSON):**
    ```json
    {
      "data": {
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john.doe@example.com",
          "role": "admin"
        },
        "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Successful login.
    *   `401 Unauthorized`: Invalid credentials provided.
    *   `422 Unprocessable Entity`: Validation errors (e.g., missing email or password).

### Song Management

### `GET /api/v1/songs`
*   **Description:** Retrieves a paginated list of all songs. Supports searching by title or artist.
*   **Auth Level:** Operator, Admin
*   **Query Parameters:**
 | Parameter | Type | Description |
    |:-----------|:-------|:------------------------------------------|
 | `page` | `int` | The page number to retrieve. |
 | `per_page` | `int` | The number of items per page. |
 | `search` | `string`| Search term for song title or artist. |
*   **Request Body (JSON):** None
*   **Response Body (JSON):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "title": "Amazing Grace",
          "artist": "John Newton",
          "created_at": "2023-10-26T10:00:00Z",
          "updated_at": "2023-10-26T10:00:00Z"
        }
      ],
      "meta": {
        "pagination": {
          "total": 1, "count": 1, "per_page": 10, "current_page": 1, "total_pages": 1,
          "links": {}
        }
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Successfully retrieved songs.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have sufficient permissions.

### `POST /api/v1/songs`
*   **Description:** Creates a new song entry. The `lyrics_raw` field is parsed by the backend into structured lyric chunks.
*   **Auth Level:** Operator, Admin
*   **Request Body (JSON):**
    ```json
    {
      "title": "New Song Title",
      "artist": "Artist Name",
      "lyrics_raw": "[VERSE 1]\nLine 1\nLine 2\n\n[CHORUS]\nChorus Line 1\nChorus Line 2"
    }
    ```
*   **Response Body (JSON):**
    ```json
    {
      "data": {
        "id": 3,
        "title": "New Song Title",
        "artist": "Artist Name",
        "lyrics": [
          {"id": 101, "label": "VERSE 1", "content": "Line 1\nLine 2"},
          {"id": 102, "label": "CHORUS", "content": "Chorus Line 1\nChorus Line 2"}
        ],
        "created_at": "2023-10-26T10:15:00Z",
        "updated_at": "2023-10-26T10:15:00Z"
      }
    }
    ```
*   **Status Codes:**
    *   `201 Created`: Song successfully created.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have sufficient permissions.
    *   `422 Unprocessable Entity`: Validation errors (e.g., missing title, invalid `lyrics_raw` format).

### `GET /api/v1/songs/{id}`
*   **Description:** Retrieves a single song by its ID, including its parsed lyric chunks.
*   **Auth Level:** Operator, Admin
*   **Request Body (JSON):** None
*   **Response Body (JSON):**
    ```json
    {
      "data": {
        "id": 1,
        "title": "Amazing Grace",
        "artist": "John Newton",
        "lyrics": [
          {"id": 101, "label": "VERSE 1", "content": "Amazing grace! How sweet the sound,\nThat saved a wretch like me!"},
          {"id": 102, "label": "CHORUS", "content": "My chains are gone, I've been set free...\nMy God, my Savior has ransomed me."}
        ],
        "created_at": "2023-10-26T10:00:00Z",
        "updated_at": "2023-10-26T10:00:00Z"
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Song successfully retrieved.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have sufficient permissions.
    *   `404 Not Found`: Song with the given ID does not exist.

### `PUT /api/v1/songs/{id}`
*   **Description:** Updates an existing song's title, artist, or raw lyrics. The backend will re-parse the `lyrics_raw` into chunks.
*   **Auth Level:** Operator, Admin
*   **Request Body (JSON):**
    ```json
    {
      "title": "Amazing Grace (Updated)",
      "artist": "John Newton (Revised)",
      "lyrics_raw": "[VERSE 1]\nUpdated Line 1\nUpdated Line 2"
    }
    ```
*   **Response Body (JSON):**
    ```json
    {
      "data": {
        "id": 1,
        "title": "Amazing Grace (Updated)",
        "artist": "John Newton (Revised)",
        "lyrics": [
          {"id": 101, "label": "VERSE 1", "content": "Updated Line 1\nUpdated Line 2"}
        ],
        "created_at": "2023-10-26T10:00:00Z",
        "updated_at": "2023-10-26T10:30:00Z"
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Song successfully updated.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have sufficient permissions.
    *   `404 Not Found`: Song with the given ID does not exist.
    *   `422 Unprocessable Entity`: Validation errors.

### Setlist Management

### `GET /api/v1/setlists`
*   **Description:** Retrieves a list of all saved setlists.
*   **Auth Level:** Operator, Admin
*   **Request Body (JSON):** None
*   **Response Body (JSON):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "Sunday Service 2023-10-29",
          "created_at": "2023-10-28T15:00:00Z",
          "updated_at": "2023-10-28T15:00:00Z"
        }
      ]
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Successfully retrieved setlists.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have sufficient permissions.

### `POST /api/v1/setlists`
*   **Description:** Creates a new setlist with a given name and an ordered list of items (songs or announcements).
*   **Auth Level:** Operator, Admin
*   **Request Body (JSON):**
    ```json
    {
      "name": "New Event Setlist",
      "items": [
        {"type": "song", "song_id": 1, "order": 1},
        {"type": "announcement", "content": "Welcome to our event!", "order": 2}
      ]
    }
    ```
*   **Response Body (JSON):**
    ```json
    {
      "data": {
        "id": 3,
        "name": "New Event Setlist",
        "items": [
          {"id": 201, "type": "song", "song_id": 1, "order": 1, "song_title": "Amazing Grace"},
          {"id": 202, "type": "announcement", "content": "Welcome to our event!", "order": 2}
        ],
        "created_at": "2023-10-28T17:00:00Z",
        "updated_at": "2023-10-28T17:00:00Z"
      }
    }
    ```
*   **Status Codes:**
    *   `201 Created`: Setlist successfully created.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have sufficient permissions.
    *   `422 Unprocessable Entity`: Validation errors.

### Live Control

### `POST /api/v1/live/send-lyric`
*   **Description:** Sends a specific lyric chunk or custom announcement text to the live display. This action triggers a real-time WebSocket broadcast to all connected display clients.
*   **Auth Level:** Operator, Admin
*   **Request Body (JSON):**
    ```json
    {
      "type": "lyric", // Required: "lyric" or "announcement"
      "content": "Amazing grace! How sweet the sound,", // Required: The text to display
      "song_id": 1, // Optional: Required if type is 'lyric', ID of the song
      "lyric_chunk_id": 101 // Optional: Required if type is 'lyric', ID of the specific lyric chunk
    }
    ```
*   **Response Body (JSON):**
    ```json
    {
      "message": "Content sent to live display.",
      "current_live_state": {
        "type": "lyric",
        "content": "Amazing grace! How sweet the sound,",
        "song_id": 1,
        "lyric_chunk_id": 101
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Content successfully sent to live display.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have sufficient permissions.
    *   `422 Unprocessable Entity`: Validation errors (e.g., missing `content`, or `song_id`/`lyric_chunk_id` for `lyric` type).

### `POST /api/v1/live/clear`
*   **Description:** Clears all text from the live display. This action triggers a real-time WebSocket broadcast to all connected display clients.
*   **Auth Level:** Operator, Admin
*   **Request Body (JSON):** None
*   **Response Body (JSON):**
    ```json
    {
      "message": "Live display cleared.",
      "current_live_state": {
        "type": "clear",
        "content": null,
        "song_id": null,
        "lyric_chunk_id": null
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Display successfully cleared.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have sufficient permissions.

### Display State Synchronization

### `GET /api/v1/live/state`
*   **Description:** Retrieves the current live display state. This endpoint is primarily used by the OBS Browser Source on initial load or reload to synchronize its display with the last known state from the backend (stored in Redis).
*   **Auth Level:** Public (or restricted via API key if desired, but public is simpler for LAN-based display clients).
*   **Request Body (JSON):** None
*   **Response Body (JSON):**
    ```json
    {
      "data": {
        "type": "lyric", // Possible values: "lyric", "announcement", "clear"
        "content": "Amazing grace! How sweet the sound,", // The text currently displayed, or null if "clear"
        "song_id": 1, // The ID of the song if type is "lyric", otherwise null
        "lyric_chunk_id": 101 // The ID of the lyric chunk if type is "lyric", otherwise null
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Successfully retrieved the current live state.