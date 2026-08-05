# REQUIREMENTS.md: PentasLirik

## Functional Requirements

### User-Facing (Operator Dashboard)

**FR-01: User Authentication**
The system MUST provide a secure mechanism for users to authenticate and access the Operator Dashboard.
*   `FR-01.1`: The system SHALL present a login page requiring a registered email and password for access.
*   `FR-01.2`: Upon successful authentication, the system SHALL redirect the user to the Operator Dashboard, applying role-based access controls as defined in `PRD.md`.
*   `FR-01.3`: The system SHALL maintain user sessions across browser refreshes until explicit logout or session expiration.

**FR-02: Operator Dashboard UI Layout**
The Operator Dashboard MUST implement a three-column layout for efficient content management and live control.
*   `FR-02.1`: The Operator Dashboard MUST display a three-column layout: a "Song Library" column on the left, a "Setlist Rundown" column in the center, and a "Live Control Panel" column on the right.
*   `FR-02.2`: The "Song Library" column SHALL include a search input field and a scrollable list of all available songs.
*   `FR-02.3`: The "Live Control Panel" SHALL dynamically update its content to display the lyric chunks or announcement options for the item currently selected in the "Setlist Rundown."

**FR-03: Song & Lyric Management**
The system MUST allow authorized users to manage a library of songs and their associated lyrics.
*   `FR-03.1`: Users with appropriate permissions SHALL be able to navigate to a dedicated "Song Management" section within the application.
*   `FR-03.2`: The system MUST enable the creation of new songs, requiring mandatory input for `Title` and `Artist`.
*   `FR-03.3`: The system SHALL automatically parse a multiline `Lyrics` text input, identifying distinct lyric "chunks" by lines enclosed in square brackets (e.g., `[VERSE 1]`, `[CHORUS]`) which serve as chunk labels.

**FR-04: Setlist Management**
The system MUST provide functionality for creating, saving, loading, and modifying event setlists.
*   `FR-04.1`: Users MUST be able to create a new, empty setlist, assign it a name, and save it to the database for future use.
*   `FR-04.2`: The system SHALL provide a mechanism (e.g., a dropdown or list) to load previously saved setlists into the "Setlist Rundown" column.
*   `FR-04.3`: Users SHALL be able to add songs from the "Song Library" to the current "Setlist Rundown" and reorder items within the "Setlist Rundown" using drag-and-drop or equivalent UI controls.

**FR-05: Live Control & Presentation**
The system MUST enable operators to control the live display of lyrics and announcements.
*   `FR-05.1`: Clicking a song or item in the "Setlist Rundown" column MUST populate the "Live Control Panel" with its corresponding lyric chunks or announcement options as distinct, clickable elements.
*   `FR-05.2`: Clicking a lyric chunk or announcement option in the "Live Control Panel" SHALL trigger a WebSocket event to broadcast its text content to the OBS Display Layer.
*   `FR-05.3`: The Operator Dashboard MUST include a clearly visible "Clear Screen" button that, when activated, sends a WebSocket event to remove all text from the OBS Display Layer.

**FR-06: Visual State Indicators**
The Operator Dashboard MUST provide clear visual feedback regarding the current live display state.
*   `FR-06.1`: The specific lyric chunk or announcement currently displayed live on the OBS Display Layer MUST be visually highlighted within the Operator Dashboard's "Live Control Panel" (e.g., with a solid red background and white text).
*   `FR-06.2`: When the OBS Display Layer is cleared, no lyric chunk or announcement in the Operator Dashboard SHALL be highlighted as "live."

**FR-07: Keyboard Shortcuts**
The Operator Dashboard MUST respond to global keyboard shortcuts for critical live control actions.
*   `FR-07.1`: When the Operator Dashboard is in focus, pressing the `Spacebar` key SHALL advance to the next lyric chunk in the currently selected song. If the last chunk is active, it SHALL clear the screen. If the screen is clear, it SHALL send the first chunk of the selected song.
*   `FR-07.2`: When the Operator Dashboard is in focus, pressing the `Escape` key SHALL immediately trigger the "Clear Screen" function, removing all text from the OBS Display Layer.

**FR-08: Custom Announcement Module**
The Operator Dashboard MUST provide a quick-access feature for displaying ad-hoc announcements.
*   `FR-08.1`: The Operator Dashboard MUST include a dedicated text input field for entering custom announcement text.
*   `FR-08.2`: A "Send Live" button associated with the announcement input field SHALL, when clicked, send the entered text to the OBS Display Layer using the same styling and animation as lyrics.

### Admin-Facing

**FR-13: User Management**
Users with the `Admin` role MUST have comprehensive control over user accounts.
*   `FR-13.1`: Users with the `Admin` role MUST be able to access a dedicated "User Management" dashboard.
*   `FR-13.2`: Admins SHALL be able to create new user accounts, specifying `Name`, `Email`, `Password`, and `Role` (`Admin` or `Operator`).
*   `FR-13.3`: Admins SHALL be able to edit existing user details (excluding email/username) and modify their assigned role, as well as delete user accounts.

### System & Display Layer

**FR-09: OBS Display Layer**
The system MUST provide a dedicated web page for rendering content within OBS Studio's Browser Source.
*   `FR-09.1`: The system SHALL provide a web page accessible via a predictable URL (e.g., `/display`) that renders with a transparent background (`background-color: transparent;`).
*   `FR-09.2`: This display page MUST establish and maintain a persistent WebSocket connection to the Laravel Reverb backend immediately upon loading.
*   `FR-09.3`: The display page SHALL be capable of receiving and processing `display:update` (with text payload) and `display:clear` WebSocket events.

**FR-10: Display Rendering & Styling**
The OBS Display Layer MUST render text with specific visual characteristics and animations.
*   `FR-10.1`: Upon receiving a `display:update` event, the Display Layer MUST render the provided text in the lower-third of the screen.
*   `FR-10.2`: The displayed text SHALL use a bold, sans-serif font with a strong, dark `text-shadow` to ensure maximum contrast and readability against any video background.
*   `FR-10.3`: Text appearance and disappearance MUST be accompanied by a smooth fade-in and fade-out animation, respectively, with a duration between 300ms and 500ms.

**FR-11: Real-time State Broadcasting**
The backend MUST broadcast real-time state changes to all connected clients.
*   `FR-11.1`: The Laravel backend, utilizing Laravel Reverb, MUST broadcast `display:update` and `display:clear` WebSocket events to all connected Operator Dashboards and Display Layers whenever the live display state changes.
*   `FR-11.2`: All connected Operator Dashboards SHALL update their visual state indicators (FR-06) in real-time based on these broadcasts, ensuring all operators see the current live status.

**FR-12: State Synchronization on Reload**
The system MUST ensure the OBS Display Layer can recover its last known state upon reload or restart.
*   `FR-12.1`: The current live text content and its associated metadata MUST be stored in a Redis cache by the Laravel backend.
*   `FR-12.2`: The backend SHALL expose a RESTful API endpoint (e.g., `/api/v1/state/live`) that returns the current live text state from Redis.
*   `FR-12.3`: Upon initial load or reload (e.g., OBS restart), the OBS Display Layer MUST perform an HTTP GET request to `/api/v1/state/live` and immediately display the fetched content before establishing its WebSocket connection, preventing a "flash" of empty content.

## Non-Functional Requirements

| Category | Requirement | Measurable Target |
|:---|:---|:---|
| **Performance** | WebSocket message latency (Operator action to Display render) on LAN. | < 100ms (95th percentile) |
| **Performance** | API response times for critical operations (e.g., fetching setlist, saving song). | < 200ms (95th percentile) |
| **Performance** | Operator Dashboard initial load time. | < 3 seconds (on a modern browser with local server) |
| **Scalability** | Support for concurrent Operator and Display clients. | At least 2 concurrent Operator clients and 5 concurrent Display clients without noticeable performance degradation. |
| **Scalability** | Database capacity for song library. | Handle a library of at least 10,000 songs with associated lyrics. |
| **Availability** | System uptime and stability. | Must run continuously for at least 8 hours without memory leaks, crashes, or state desynchronization. |
| **Availability** | Local network dependency. | System functionality must be entirely independent of external internet connectivity. |
| **Security** | Password storage. | All user passwords MUST be hashed using Argon2 or bcrypt with a minimum cost factor of 10. |
| **Security** | API endpoint protection. | All authenticated API endpoints MUST enforce authentication and role-based authorization. |
| **Security** | Data exposure. | No sensitive user or system configuration data SHALL be exposed via public-facing API endpoints or client-side code. |
| **Usability** | Critical action efficiency. | Critical live-control actions (send lyric, next chunk, clear screen) MUST be achievable in a single click or keypress. |
| **Usability** | Visual feedback. | The UI MUST provide immediate and unambiguous visual feedback (e.g., highlights, status messages) for operator actions and system state changes. |
| **Deployment** | Containerization. | The entire application stack (backend, frontend, database, cache) MUST be containerized using Docker. |
| **Deployment** | Local environment. | The system MUST be deployable and fully functional on an Ubuntu Server within a local area network (LAN). |

## Technical Constraints

*   **Backend Framework:** Laravel (PHP) MUST be used for all backend API services and state management.
*   **Real-time Communication:** Laravel Reverb MUST be used for all WebSocket-based real-time broadcasting.
*   **Operator Frontend:** Nuxt.js (Vue.js) with Tailwind CSS MUST be used for the Operator Dashboard frontend.
*   **Display Layer:** The OBS Display Layer MUST be implemented using static HTML and Vanilla JavaScript to minimize overhead within OBS Browser Source.
*   **Database:** PostgreSQL MUST be used as the primary relational database.
*   **Cache/State Store:** Redis MUST be used for ephemeral state management (e.g., live display content) and caching.
*   **Deployment Environment:** The application MUST be deployed on an Ubuntu Server within a Local Area Network (LAN).
*   **Containerization:** Docker and Docker Compose MUST be used for packaging and orchestrating all application services.
*   **Web Server/Proxy:** Nginx MUST be used as the reverse proxy for serving the application.
*   **Fixed Display Styling:** The visual styling (font, size, color, text-shadow, position, animation) of the OBS Display Layer is fixed and NOT configurable by end-users in this version.
*   **Manual Content Entry:** All song and lyric content MUST be entered manually via the Operator Dashboard; no import functionality is supported.

## Assumptions

*   **Stable LAN Environment:** A stable and high-bandwidth (Gigabit Ethernet recommended) Local Area Network (LAN) is available and maintained for deployment, ensuring low latency communication between components.
*   **OBS Studio Compatibility:** OBS Studio's Browser Source functionality is assumed to be compatible with standard web technologies (HTML, CSS, JavaScript, WebSockets) and capable of rendering transparent backgrounds and smooth animations.
*   **Dedicated Server Resources:** A dedicated server machine with sufficient CPU, RAM, and storage resources is available to host the Dockerized application stack.
*   **Operator Familiarity:** Operators are assumed to have basic computer literacy and familiarity with web-based interfaces.
*   **No Internet Dependency:** The system is designed for offline LAN operation; external internet access is not required for core functionality.
*   **Single Instance, Single Output:** The system is assumed to run as a single instance, controlling a single live display output. Multi-instance or multi-output scenarios are out of scope for this version.
*   **Browser Source Security:** The OBS Browser Source is assumed to operate within a secure context, allowing WebSocket connections to the local server without browser security policy issues.