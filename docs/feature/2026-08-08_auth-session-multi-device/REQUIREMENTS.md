# REQUIREMENTS: Multi-Device Authentication & Automatic Token Expiration Handling

## Functional Requirements (FR)

* **FR-AUTH-01: Multi-Device Token Creation**
  * The backend MUST NOT delete existing tokens during login (`$user->tokens()->delete()` must be removed).
  * The backend MUST issue a new Sanctum token for each successful login request.
  * The token `name` attribute SHOULD be derived from the optional `device_name` request field or the HTTP `User-Agent` header.

* **FR-AUTH-02: Single Device Logout**
  * Invoking `POST /api/v1/auth/logout` MUST revoke ONLY the token sent in the `Authorization` header (`$request->user()->currentAccessToken()->delete()`).

* **FR-AUTH-03: Centralized Frontend API Interceptor**
  * The frontend MUST use a centralized API client (`apiClient`) for executing HTTP requests to `/api/v1/*`.
  * The client MUST automatically attach `Authorization: Bearer <token>` if a token is present in `localStorage`.

* **FR-AUTH-04: Automatic 401 Interception & Auto-Logout**
  * When an API call returns HTTP `401 Unauthorized`, the client MUST:
    1. Remove `pentaslirik_token` and `pentaslirik_user` from `localStorage`.
    2. Reset the top-level React state (`user = null`, `token = null`).
    3. Render the `<LoginView />` component.
    4. Display a human-readable alert message: *"Session expired or invalidated. Please sign in again."*

---

## Non-Functional Requirements (NFR)

* **NFR-01: Low Latency & Minimal Overhead**
  * Interceptor logic must execute synchronously with zero noticeable UI latency (< 5ms).
* **NFR-02: Reliability**
  * All API endpoints (Songs, Setlists, Live State, Display Settings, Users) must be wrapped by the interceptor so no unauthenticated call fails silently.
* **NFR-03: Backward Compatibility & Test Coverage**
  * Existing unit and E2E tests (`AuthApiTest.php`, `auth_and_dashboard.spec.ts`) must pass without breaking API contracts.
