# API: Multi-Device Authentication & Error Standard

## Endpoints Overview

| Method | Endpoint | Auth | Description |
|:---|:---|:---:|:---|
| `POST` | `/api/v1/auth/login` | Public | Authenticates user & returns new token tagged with `device_name` |
| `POST` | `/api/v1/auth/logout` | Bearer Token | Revokes ONLY the active device token |
| `POST` | `/api/v1/auth/logout-all` | Bearer Token | Revokes all tokens belonging to the user |
| `GET` | `/api/v1/auth/me` | Bearer Token | Fetches authenticated user profile & active device session info |

---

## Endpoint Details

### 1. `POST /api/v1/auth/login`
Authenticates user and generates a new multi-device token.

**Request Headers:**
```http
Content-Type: application/json
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...
```

**Request Body:**
```json
{
  "email": "operator@pentaslirik.local",
  "password": "password",
  "device_name": "iPhone 15 Mobile Browser"
}
```
*Note: `device_name` is optional. If omitted, the backend extracts the system platform / browser from the `User-Agent` header.*

**Response (200 OK):**
```json
{
  "data": {
    "user": {
      "id": 2,
      "name": "Operator Demo",
      "email": "operator@pentaslirik.local",
      "role": "operator"
    },
    "token": "3|aBcDeFgHiJkLmNoPqRsTuVwXyZ..."
  }
}
```

---

### 2. `POST /api/v1/auth/logout`
Revokes the current device's access token without invalidating other devices.

**Request Headers:**
```http
Authorization: Bearer 3|aBcDeFgHiJkLmNoPqRsTuVwXyZ...
Accept: application/json
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out of this device."
}
```

---

### 3. HTTP 401 Unauthorized Error Standard
Returned when an incoming request lacks a valid token or presents an expired/revoked token.

**Response (401 Unauthorized):**
```json
{
  "message": "Unauthenticated."
}
```

**Client Interceptor Behavior:**
Upon receiving HTTP `401`, the client MUST:
1. Clear `pentaslirik_token` and `pentaslirik_user` from `localStorage`.
2. Emit an auth event to switch UI state to `<LoginView />`.
3. Display error message: *"Session expired or invalidated. Please sign in again."*
