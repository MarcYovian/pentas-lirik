# USER FLOW: Multi-Device Authentication & Automatic Token Expiration Handling

## 1. Multi-Device Login Flow

```
[ Operator Desktop Browser ]                      [ Stage Mobile Phone ]
             |                                              |
     Logs in as "admin"                             Logs in as "admin"
             |                                              |
Backend issues Token A                         Backend issues Token B
 (Saved in Desktop localStorage)               (Saved in Mobile localStorage)
             |                                              |
   Fetches Songs & Setlists                       Fetches Songs & Setlists
        (200 OK)                                       (200 OK)
             |                                              |
      [ BOTH DEVICES OPERATE SIMULTANEOUSLY WITHOUT DISRUPTION ]
```

---

## 2. Invalid / Expired Token Auto-Redirect Flow

```
[ Operator Dashboard UI ]
          |
   Triggers Action (e.g. Load Songs / Save Setlist / Change Display Setting)
          |
   apiClient sends HTTP request with Bearer Token
          |
   Backend returns HTTP 401 Unauthorized (Token expired/deleted)
          |
   apiClient Interceptor catches 401
          |
   Clears localStorage ("pentaslirik_token", "pentaslirik_user")
          |
   Dispatches Auth Event -> App State sets user = null, token = null
          |
   App automatically renders <LoginView /> with Alert Message:
   "Session expired or invalidated. Please sign in again."
```
