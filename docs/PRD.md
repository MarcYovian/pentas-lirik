# PRD: PentasLirik

## Executive Summary & Product Vision

PentasLirik is a low-latency, self-hosted Live Streaming Control System designed for managing and displaying song lyrics and announcements during live events. The system operates on a local area network (LAN) to ensure minimal delay between operator action and on-screen display.

The product vision is to provide a reliable, intuitive, and high-performance alternative to traditional lyric presentation software (e.g., EasyWorship), specifically tailored for integration with modern streaming software like OBS Studio via its Browser Source feature. The system comprises two primary components: a web-based Operator Dashboard for control and a lightweight HTML/JS Display Layer for rendering.

## Problem Statement & Target Users

Live event production teams, particularly in houses of worship, small venues, and corporate events, require a simple and responsive method to display dynamic text overlays (lyrics, announcements) during a live stream. Existing solutions can be complex, expensive, or suffer from latency when integrated into a streaming workflow. There is a need for a system that is:
*   **Real-time:** Actions must reflect on-screen nearly instantaneously.
*   **Stable:** Must operate reliably for hours on a local network without internet dependency.
*   **Simple:** The operator interface must be clear and optimized for high-pressure live environments.
*   **Integrated:** Must seamlessly feed into OBS Studio or similar broadcast software.

**Target Users:**
*   **Media/AV Technicians:** Individuals responsible for managing the technical aspects of a live event or stream.
*   **Volunteer Operators:** Non-technical users in community or church settings who need an easy-to-learn interface.
*   **Event Producers:** Professionals coordinating all live production elements, including on-screen graphics.

## System Scope & User Roles

PentasLirik is a web application deployed via Docker on a local server. Its scope covers content management (songs, lyrics), setlist creation for events, and real-time control of a display layer rendered in OBS.

| Permission / Action | Admin | Operator |
|:-----------------------------------|:--------------------:|:--------------------:|
| **Authentication** | | |
| Login / Logout | ✅ | ✅ |
| **Content Management** | | |
| Create/Edit/Delete Songs & Lyrics | ✅ | ✅ |
| **Event Management** | | |
| Create/Save/Load Setlists | ✅ | ✅ |
| Reorder items in a Setlist | ✅ | ✅ |
| **Live Control** | | |
| Select Song/Item from Setlist | ✅ | ✅ |
| Send Lyric/Announcement to Live | ✅ | ✅ |
| Clear Live Display | ✅ | ✅ |
| Use Keyboard Shortcuts | ✅ | ✅ |
| **User Management** | | |
| Create/Edit/Delete User Accounts | ✅ | ❌ |
| Assign User Roles | ✅ | ❌ |

## Functional Requirements

### Operator & General User Requirements

*   **FR-01: User Authentication**
    *   Users must log in via a dedicated login page using an email and password.
    *   The system must enforce role-based access based on the permissions matrix.
    *   Sessions should persist through browser refreshes.

*   **FR-02: Operator Dashboard UI**
    *   The main control interface must be a three-column layout:
        *   **Column 1 (Left): Song Library/Search:** A searchable and scrollable list of all songs in the database.
        *   **Column 2 (Center): Setlist/Rundown:** The ordered list of songs and items for the current event.
        *   **Column 3 (Right): Live Control Panel:** Displays the chunked lyrics or content of the item selected from the Setlist column.

*   **FR-03: Song & Lyric Management**
    *   Users with permission can access a dedicated section to manage the song library.
    *   Functionality must exist to create new songs with fields for `Title` and `Artist`.
    *   A single multiline text area shall be provided for `Lyrics`.
    *   The system must parse lyric text to create "chunks." A chunk is defined by a line enclosed in square brackets (e.g., `[VERSE 1]`, `[CHORUS]`) followed by the subsequent lines of text. The bracketed line serves as the chunk's label.

*   **FR-04: Setlist Management**
    *   Users can create a new, empty setlist for an event.
    *   Setlists must be nameable and savable to the database.
    *   Users can load previously saved setlists from a dropdown or list.
    *   Songs from the Library column can be added to the Setlist column (e.g., via a "+" button or drag-and-drop).
    *   The order of items within the Setlist column must be mutable via drag-and-drop.

*   **FR-05: Live Control & Presentation**
    *   Clicking a song in the Setlist column populates the Live Control Panel with its corresponding lyric chunks.
    *   Each lyric chunk in the Live Control Panel must be a distinct clickable element/button.
    *   Clicking a lyric chunk button sends its text content to the OBS Display Layer via a WebSocket event.
    *   The system must provide a master "Clear Screen" (or "Blackout") button that removes all text from the OBS Display Layer.

*   **FR-06: Visual State Indicators**
    *   The specific lyric chunk currently being displayed live on OBS must be visually highlighted in the Operator Dashboard (e.g., with a solid red background and white text).
    *   When the screen is cleared, no chunk shall be highlighted.

*   **FR-07: Keyboard Shortcuts**
    *   The Operator Dashboard must respond to global keyboard shortcuts when the window is in focus:
        *   `Spacebar`: Advances to the next lyric chunk. If chunk `N` is live, it sends chunk `N+1`. If the screen is clear, it sends the first chunk of the selected song. If the last chunk is live, it clears the screen.
        *   `Escape`: Immediately triggers the "Clear Screen" function.

*   **FR-08: Custom Announcement Module**
    *   The dashboard must include a quick-access feature for creating and displaying ad-hoc announcements.
    *   This module will contain a text input field and a "Send Live" button.
    *   When sent, the announcement text is displayed on the OBS Display Layer using the same styling and animations as lyrics.

### System & Display Layer Requirements

*   **FR-09: OBS Display Layer**
    *   The system will provide a static HTML/JS page at a predictable URL (e.g., `/display`).
    *   This page must have a transparent background (`background-color: transparent;`).
    *   It will establish a persistent WebSocket connection to the Laravel Reverb backend upon loading.
    *   It must listen for two primary events: `display:update` and `display:clear`.

*   **FR-10: Display Rendering & Styling**
    *   Upon receiving a `display:update` event with a text payload, the Display Layer renders the text.
    *   The text styling is fixed and not user-configurable:
        *   **Position:** Lower-third of the screen.
        *   **Font:** A bold, sans-serif font for maximum readability.
        *   **Effect:** A strong, dark `text-shadow` to ensure contrast against any video background.
        *   **Animation:** Text must appear with a smooth fade-in animation and disappear with a smooth fade-out animation. Animation duration should be approximately 300-500ms.

*   **FR-11: Real-time State Broadcasting**
    *   The Laravel backend must use Laravel Reverb to broadcast state changes to all connected clients (Operator Dashboards and Display Layers).
    *   Actions like sending a lyric live or clearing the screen must trigger a WebSocket broadcast in real-time.

*   **FR-12: State Synchronization on Reload**
    *   The current live state (what text is on screen) must be stored in a Redis cache.
    *   The backend must provide an API endpoint (e.g., `/api/v1/state/live`) that returns the content of this Redis key.
    *   When the OBS Display Layer page loads or reloads (e.g., OBS restart, scene change), it must first make an HTTP GET request to this endpoint to fetch and immediately display the last known state, preventing a "flash" of empty content. It will then connect to the WebSocket for subsequent updates.

### Admin-Only Requirements

*   **FR-13: User Management**
    *   A user with the `Admin` role can access a user management dashboard.
    *   Admins can create new user accounts by providing a name, email, password, and role (`Admin` or `Operator`).
    *   Admins can edit existing user details (except for the email/username) and change their role.
    *   Admins can delete user accounts.

## Non-Functional Requirements

| Category | Requirement |
|:--------------|:-----------------------------------------------------------------------------------------------------------------------------------------|
| **Performance** | • WebSocket message latency (Operator action to Display render) on LAN must be < 100ms. • API response times must be < 200ms. • Operator Dashboard initial load time < 3 seconds. |
| **Scalability** | • The system must support at least 2 concurrent Operator clients and 5 concurrent Display clients without performance degradation. • The database must handle a library of at least 10,000 songs. |
| **Availability**| • The system is designed for local deployment and is expected to be as available as the underlying server and network. • Must run continuously for at least 8 hours without memory leaks or crashes. |
| **Security** | • All user passwords must be securely hashed using a modern algorithm (e.g., Argon2, bcrypt). • All API endpoints must be protected by authentication and role-based authorization middleware. • No sensitive data should be exposed on public-facing endpoints. |
| **Usability** | • Critical live-control actions (send, next, clear) must be achievable in a single click or keypress. • The UI must provide immediate and unambiguous visual feedback for operator actions. |
| **Deployment** | • The entire application stack (backend, frontend, database, cache) must be containerized using Docker for simplified deployment and dependency management. |

## Technology Stack & Rationale

| Component | Technology | Rationale |
|:-----------------------|:-------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| **Backend Framework** | Laravel 13 (Sail) | Running via Laravel Sail in Docker containerized PHP 8.4 environment for consistent local development. |
| **Real-time Events** | Laravel Reverb | First-party, high-performance WebSocket server for Laravel (`sail artisan reverb:start`). |
| **Frontend Framework** | React 19 + TypeScript + Vite 6 | High-performance Single Page Application (SPA) with rapid HMR, strict type safety, and modular component design for the Operator Dashboard. |
| **UI Styling & Animation** | Tailwind CSS v4 + Framer Motion | Utility-first CSS v4 with `@tailwindcss/vite` and Framer Motion (`motion` v12) for smooth fade animations and modern dark UI. |
| **Display Layer** | React 19 / OBSDisplay Component | Lightweight React component on `/display` route with transparent background, lower-third position, bold typography, and smooth CSS/Framer Motion fades. |
| **Database** | MySQL (via Sail) | Containerized relational database provisioned via Laravel Sail Docker environment. |
| **Cache / State Store**| Redis (via Sail) | High-performance in-memory data store, perfect for managing the ephemeral "live" state. |
| **Deployment / Environment** | Docker (Laravel Sail) & Nginx | Provides environment consistency, isolation, and simplified development/deployment workflow. |
| **Host Environment** | Ubuntu Server (LAN)| A stable, widely-supported Linux distribution. LAN deployment ensures maximum speed and reliability, independent of internet connectivity. |

## Success Metrics & KPIs

| Metric | KPI / Target | Measurement Method |
|:--------------------------------|:----------------------------------------------------------------------------------|:--------------------------------------------------------------------------------|
| **Operator Efficiency** | Time from song selection to first lyric live < 5 seconds. | Analytics event logging within the Operator Dashboard. |
| **System Latency** | 99th percentile of end-to-end latency < 150ms. | Timestamp logging: `onClick` event in Controller vs. `onRender` event in Display. |
| **System Reliability** | Zero critical failures (crashes, state desync) during a 4-hour live event session. | Manual testing in a simulated live environment; server uptime and log monitoring. |
| **User Adoption & Satisfaction**| Positive feedback from at least 2 distinct production teams after initial rollout. | Direct user interviews and feedback sessions. |

## Risk Analysis & Mitigation

| Risk | Impact | Mitigation Strategy |
|:-----------------------------------|:-------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Network Failure / Disconnect** | High | • **Display:** The Display Layer will attempt to automatically reconnect to the WebSocket server. The state-sync-on-load feature (FR-12) ensures it recovers correctly. • **Controller:** The UI will show a clear "Disconnected" status indicator. Actions will be disabled until the connection is restored. |
| **State Desynchronization** | High | The backend will treat the Redis cache as the single source of truth for the live state. All clients (Controllers and Displays) sync from this source, minimizing the chance of conflicting states. A manual "force refresh" button could be added to the controller. |
| **Browser Crash (Operator)** | Medium | The live display is unaffected as it's a separate process. Upon restarting the browser and logging back in, the Operator Dashboard will re-fetch the current setlist and live state, allowing the operator to resume control seamlessly. |
| **Server/Application Crash** | High | The application will be deployed using Docker with a restart policy of `unless-stopped`. This ensures the container automatically restarts after a crash. Nginx will serve a static "System Offline" page if the backend is unreachable. |
| **Accidental Operator Error** | Medium | The UI will be designed to minimize errors. A confirmation step could be considered for destructive actions (e.g., deleting a song), but not for live actions to maintain speed. Clear visual indicators (FR-06) help the operator see the current state at a glance. |

## Constraints & Assumptions

*   **LAN Deployment:** The system is designed and optimized exclusively for deployment on a Local Area Network. Performance over the public internet (WAN) is not guaranteed.
*   **Single Event Focus:** The control interface is designed to manage one event/display at a time. It does not support controlling multiple independent displays with different content simultaneously.
*   **Hardware Assumption:** Assumes a reasonably modern server machine capable of running Docker and the application stack, and a stable gigabit LAN.
*   **Fixed Display Style:** The visual styling (fonts, colors, animations, position) of the OBS Display Layer is fixed and cannot be customized by the user in this version.
*   **Manual Content Entry:** The system relies on manual input for all songs and lyrics. There is no functionality for importing from files (e.g., .txt, .pro6, .pptx).

## Out of Scope

The following features and functionalities are explicitly **not** included in this version of the product:
*   Cloud-based or SaaS deployment model.
*   User-configurable themes, fonts, or animations for the display layer.
*   Integration with other presentation software or hardware (e.g., ProPresenter, video switchers).
*   Support for displaying images or videos.
*   Automatic song library import from files or online services (e.g., CCLI SongSelect).
*   Advanced scheduling or automation features.
*   Support for multiple simultaneous, independent live outputs from a single instance.
*   Mobile-specific or tablet-optimized control interface (though the responsive design may be functional).