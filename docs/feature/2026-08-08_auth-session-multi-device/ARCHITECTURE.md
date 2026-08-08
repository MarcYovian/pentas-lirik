# ARCHITECTURE: Multi-Device Authentication & Automatic Token Expiration Handling

## Technical Overview

This architecture document outlines the structural changes to PentasLirik's authentication layer across both backend (Laravel 13.x + Sanctum) and frontend (React + TypeScript), aligned directly with official Laravel 13.x Sanctum API token standards.

---

## 1. Backend Token Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Desktop as Desktop Client
    actor Mobile as Mobile Client
    participant API as Laravel Sanctum API
    participant DB as SQLite/Postgres DB

    Desktop->>API: POST /api/v1/auth/login (Device: macOS Chrome)
    API->>DB: Insert personal_access_token (Token 1)
    API-->>Desktop: Return Token 1
    
    Mobile->>API: POST /api/v1/auth/login (Device: iPhone Safari)
    Note over API,DB: Do NOT delete Token 1!
    API->>DB: Insert personal_access_token (Token 2)
    API-->>Mobile: Return Token 2
    
    Desktop->>API: GET /api/v1/songs (Bearer Token 1)
    API-->>Desktop: 200 OK (Songs Data)
    
    Mobile->>API: GET /api/v1/songs (Bearer Token 2)
    API-->>Mobile: 200 OK (Songs Data)
```

### Key Changes in `AuthController.php`
* **Token Creation**:
  ```php
  $deviceName = $request->input('device_name', $request->header('User-Agent', 'Unknown Device'));
  $token = $user->createToken($deviceName)->plainTextToken;
  ```
* **Current Access Token Revocation**:
  ```php
  // Only delete current token on logout (Official Sanctum standard)
  $request->user()->currentAccessToken()->delete();
  ```
* **Revoke All Tokens (Optional Endpoint)**:
  ```php
  // Revoke all tokens for account
  $user->tokens()->delete();
  ```

### Token Expiration & Pruning (Laravel 13.x Standard)
* Configured via `config/sanctum.php` (`'expiration' => null` or custom minutes).
* Expired tokens can be automatically pruned from the database via Laravel 13.x Scheduled task:
  ```php
  Schedule::command('sanctum:prune-expired --hours=24')->daily();
  ```

---

## 2. Frontend Centralized HTTP Client Architecture

```mermaid
flowchart TD
    A["React Component Call"] --> B["apiClient.fetch(url, options)"]
    B --> C["Attach Authorization: Bearer <Token>"]
    C --> D["Execute window.fetch()"]
    D --> E{"HTTP Response Status"}
    E -- "200-299 OK" --> F["Return Parsed Data / Response"]
    E -- "401 Unauthorized" --> G["Trigger auth:unauthorized Event"]
    G --> H["Clear localStorage ('pentaslirik_token', 'pentaslirik_user')"]
    H --> I["Update React State: user = null, token = null"]
    I --> J["Render LoginView with Expired Session Alert"]
    E -- "Other Error (4xx, 5xx)" --> K["Throw Error / Handle locally"]
```

### Architecture Components:
1. `frontend/src/utils/apiClient.ts`: Unified fetch client that automatically attaches Bearer tokens and listens for `401 Unauthorized`.
2. `Auth Event Emitter / Handler`: Dispatches a custom event `pentaslirik:unauthorized` whenever any API request returns a 401. `App.tsx` subscribes to this event to clear state cleanly.
