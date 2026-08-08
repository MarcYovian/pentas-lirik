# DATABASE: Multi-Device Authentication & Personal Access Tokens

## Database Schema Overview

PentasLirik uses Laravel Sanctum's built-in `personal_access_tokens` table to store API tokens.

No database migrations are required because Laravel Sanctum already supports storing multiple tokens per user out-of-the-box. The multi-device feature leverages existing table fields effectively.

---

## Schema Structure: `personal_access_tokens`

| Column Name | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | BigInteger | Primary Key, Auto Increment | Unique Token Identifier |
| `tokenable_type` | String | Indexed | Model class name (`App\Models\User`) |
| `tokenable_id` | BigInteger | Indexed | Foreign key to `users.id` |
| `name` | String | Not Nullable | Device or client application identifier (e.g. `Mobile Safari`, `Desktop Chrome`) |
| `token` | String(64) | Unique, Not Nullable | Hashed SHA-256 token value |
| `abilities` | Text | Nullable | JSON array of token permissions (`["*"]`) |
| `last_used_at` | Timestamp | Nullable | Timestamp when token was last used to authenticate an API request |
| `expires_at` | Timestamp | Nullable | Optional token expiration timestamp |
| `created_at` | Timestamp | Nullable | Token issue timestamp |
| `updated_at` | Timestamp | Nullable | Token last update timestamp |

---

## Token Lifecycle Management

1. **Login (New Device)**:
   * Inserts a new row into `personal_access_tokens` with `name` set to the client's `device_name` or `User-Agent`.
2. **API Request**:
   * Sanctum verifies the `token` hash and updates `last_used_at`.
3. **Single Device Logout (`/api/v1/auth/logout`)**:
   * Deletes ONLY the row matching `$request->user()->currentAccessToken()->id`.
4. **All Devices Logout (`/api/v1/auth/logout-all`)**:
   * Deletes all rows where `tokenable_id` matches `$request->user()->id`.
