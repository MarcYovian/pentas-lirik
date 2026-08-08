# FEATURES: Multi-Device Authentication & Automatic Token Expiration Handling

## Feature Matrix

### 1. Multi-Device Simultaneous Session Control
* **Concurrent Logins**: Operators and administrators can log into the same account on desktop computers, control tablets, and mobile phones simultaneously.
* **Non-Destructive Token Generation**: Logging into Device B creates a new token entry without revoking Device A's active token.
* **Device Tagging**: Each login token is named according to the client device (e.g. `Desktop Chrome`, `Mobile Safari`) for easy auditability in Sanctum.

---

### 2. Centralized Frontend HTTP 401 Interceptor
* **Unified Request Wrapper**: All HTTP requests are processed through `apiClient`.
* **Automatic 401 Interception**: Intercepts HTTP 401 Unauthorized responses across all feature modules (Song Library, Setlist Rundown, Display Settings, User Management).
* **Automatic Cache & Storage Invalidation**: Clears stored tokens and user details from `localStorage` immediately upon 401 detection.
* **Seamless Login View Redirect**: Automatically transitions the React root layout from main dashboard views to `<LoginView />`.
* **User Notification**: Displays an alert banner notifying the user that their session has expired or been revoked.

---

### 3. Graceful Logout Management
* **Single-Device Logout**: Standard "Sign Out" button revokes only the active device's token.
* **Clean State Reset**: Clears active WebSocket subscriptions (if any) and local UI states upon sign-out.
