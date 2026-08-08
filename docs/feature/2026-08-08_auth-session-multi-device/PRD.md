# PRD: Multi-Device Authentication & Automatic Token Expiration Handling

## Executive Summary & Product Vision

The **Multi-Device Authentication & Automatic Token Expiration Handling** feature improves PentasLirik's security, stability, and operational usability across multiple devices in live event production settings.

Currently, PentasLirik has two critical authentication vulnerabilities:
1. **Single-Device Token Revocation**: When an operator logs in on a second device (e.g., smartphone), the backend revokes all previous Sanctum tokens for that user account (`$user->tokens()->delete()`). As a result, active sessions on desktop or tablet devices immediately lose access and fail to fetch songs, setlists, or live state.
2. **Missing Frontend 401 / Token Expiration Handling**: When a token becomes invalid, revoked, or expired, frontend API requests fail silently (returning `401 Unauthorized`), leaving the operator stranded on a broken dashboard without redirecting to the `/login` view or clearing invalid `localStorage` credentials.

The vision for this feature is to establish **Multi-Device Session Support** (allowing simultaneous active logins per account with device metadata) and a centralized **HTTP 401 Interceptor System** in the frontend that seamlessly clears invalid credentials and redirects operators to the login page with clear error feedback.

---

## Problem Statement & Target Users

### Problems Addressed
1. **Desktop Disruption on Mobile Login**:
   * AV Technicians running live control on a desktop laptop lose control capabilities as soon as a volunteer or stage operator logs into the same account on a mobile device.
2. **Silent API Failures & Stale Frontend State**:
   * When API requests return `401 Unauthorized` due to expired or revoked tokens, the application does not catch the error centrally. Data fetching fails silently, leaving stale UI components that fail to execute live commands.
3. **Lack of Multi-Session Visibility**:
   * Users cannot see or manage active devices associated with their account.

### Target Users
* **Live Event Operators**: Need to run control panels on desktop and mobile devices concurrently without invalidating each other's credentials.
* **AV / Technical Directors**: Require predictable session behavior and immediate redirection to login when credentials expire during event setups.

---

## System Scope & User Roles

| Permission / Action | Admin | Operator |
|:----------------------------------------|:----------------------:|:-------------------------:|
| **Multi-Device Simultaneous Login** | ✅ | ✅ |
| **Device-Specific Token Generation** | ✅ | ✅ |
| **Automatic 401 Handling & Auto-Logout**| ✅ | ✅ |
| **Logout Current Device Only** | ✅ | ✅ |
| **Logout All Devices / Other Devices** | ✅ | ❌ |

---

## Functional Requirements Summary

### 1. Multi-Device Token Persistence (Backend)
* **Preserve Existing Tokens on Login**: Remove `$user->tokens()->delete()` during standard login. Each login issues a new Sanctum token tagged with device info (`device_name` or `User-Agent`).
* **Device Identification**: Allow client applications to supply an optional `device_name` string (e.g., "Chrome on macOS", "Mobile Safari on iPhone") during login.
* **Granular Logout Endpoints**:
  * `/api/v1/auth/logout` (Current Device): Revokes only the token associated with the active request.
  * `/api/v1/auth/logout-all` (Admin only / Optional): Revokes all active tokens for the user account.

### 2. Centralized 401 Interceptor & Auto-Redirect (Frontend)
* **Central API Fetch Client**: Wrap all frontend API calls (`fetch` / `axios`) in a unified `apiClient` helper.
* **HTTP 401 Intercept & Clear State**:
  * Automatically detect HTTP `401 Unauthorized` responses on protected API endpoints.
  * Remove `pentaslirik_token` and `pentaslirik_user` from `localStorage`.
  * Update React authentication state to reset `user` and `token` to `null`.
* **User Feedback & Login Redirection**:
  * Instantly switch view to `<LoginView />`.
  * Display an informative alert message: *"Session expired or invalidated. Please sign in again."*
