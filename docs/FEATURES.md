# FEATURES.md: PentasLirik

## User Authentication and Authorization

This module manages user access to the PentasLirik system, ensuring that only authorized personnel can operate or administer the application. It supports role-based access control (RBAC) to differentiate between `Admin` and `Operator` functionalities.

### Login and Logout

Users must authenticate to access any part of the PentasLirik application.

**User Stories:**
*   As a user, I want to log in with my credentials so I can access the system.
*   As a user, I want to log out securely when I am finished using the system.

**Acceptance Criteria:**
*   The system shall present a dedicated login page requiring an email and password.
*   Upon successful login, the user shall be redirected to the Operator Dashboard.
*   Failed login attempts (e.g., incorrect credentials) shall display an appropriate error message without revealing specific details about the failure (e.g., "Invalid credentials").
*   User sessions shall persist across browser refreshes until explicitly logged out or the session expires.
*   A logout mechanism shall be available, terminating the user's session and redirecting them to the login page.
*   All API endpoints shall be protected by authentication middleware.

**Edge Cases:**
*   **Invalid Credentials:** System must reject login and provide a generic error.
*   **Session Expiration:** User should be prompted to log in again.
*   **Concurrent Sessions:** The system should allow multiple simultaneous logins for the same user account, but actions are tied to the specific session.
*   **Role-based Access:** After login, the system must enforce permissions based on the assigned user role (`Admin` or `Operator`).

## Content Management

This module allows users to manage the library of songs and their associated lyrics, which are the core content for live presentations.

### Song and Lyric Creation/Editing

Users can add, modify, or delete songs and their lyrics.

**User Stories:**
*   As an operator, I want to add new songs to the library, including title, artist, and lyrics.
*   As an operator, I want to edit existing song details and lyrics.
*   As an operator, I want to delete songs from the library.

**Acceptance Criteria:**
*   A dedicated section in the Operator Dashboard shall be accessible to users with appropriate permissions (Admin, Operator).
*   Users shall be able to create a new song entry with fields for `Title` (text) and `Artist` (text).
*   A multi-line text area shall be provided for entering `Lyrics`.
*   The system shall automatically parse the entered lyrics into "chunks" based on lines enclosed in square brackets (e.g., `[VERSE 1]`, `[CHORUS]`).
    *   A chunk starts with a line containing only `[LABEL]` and includes all subsequent lines until the next `[LABEL]` or the end of the lyrics.
    *   The `[LABEL]` itself will serve as the chunk's identifier in the UI but will not be displayed on the OBS Display Layer.
*   Users shall be able to save changes to songs and lyrics.
*   Users shall be able to delete songs, with a confirmation prompt to prevent accidental deletion.

**Edge Cases:**
*   **Empty Lyrics:** A song can be saved without lyrics, but it won't be presentable in the Live Control Panel.
*   **No Chunk Labels:** If lyrics are entered without `[LABEL]` lines, the entire lyric text will be treated as a single chunk.
*   **Duplicate Song Titles:** The system should allow duplicate titles but it's recommended to add artist names for disambiguation.
*   **Long Lyrics:** The system must handle and display very long lyric texts without performance degradation or UI issues.

## Setlist Management

This module enables operators to create, save, load, and organize setlists for specific events, streamlining the live presentation workflow.

### Setlist Creation and Organization

Operators can build a sequence of songs and items for an event.

**User Stories:**
*   As an operator, I want to create a new, empty setlist for an upcoming event.
*   As an operator, I want to add songs from the library to my current setlist.
*   As an operator, I want to reorder songs within my setlist to match the event's rundown.
*   As an operator, I want to save my setlist for future use and load previously saved setlists.

**Acceptance Criteria:**
*   The Operator Dashboard shall provide functionality to create a new, unnamed setlist.
*   Setlists shall be nameable and savable to the database.
*   A mechanism (e.g., dropdown, list) shall allow users to load previously saved setlists.
*   Songs from the Song Library (Column 1) can be added to the Setlist (Column 2) via a user-friendly interaction (e.g., "+" button, drag-and-drop).
*   Items within the Setlist column shall be reorderable via drag-and-drop.
*   The system shall allow removing items from the setlist.

**Edge Cases:**
*   **Empty Setlist:** A setlist can be saved without any songs.
*   **Deleting a Song in a Setlist:** If a song is deleted from the library, it should be gracefully handled in any setlists it's part of (e.g., marked as "unavailable" or removed).
*   **Loading an Empty Setlist:** The Setlist column should display as empty.

## Live Control and Presentation

This is the core operational module, allowing operators to send lyrics and announcements to the live display in real-time.

### Operator Dashboard UI

The main interface for controlling the live stream.

**User Stories:**
*   As an operator, I want a clear, three-column layout to easily navigate between songs, setlists, and live controls.

**Acceptance Criteria:**
*   The Operator Dashboard shall feature a three-column layout:
    *   **Column 1 (Left): Song Library/Search:** A searchable and scrollable list of all songs.
    *   **Column 2 (Center): Setlist/Rundown:** The ordered list of songs for the current event.
    *   **Column 3 (Right): Live Control Panel:** Displays chunked lyrics or content of the selected item.

### Lyric Presentation Control

Sending specific lyric chunks to the OBS Display Layer.

**User Stories:**
*   As an operator, I want to select a song from the setlist to prepare its lyrics for display.
*   As an operator, I want to send individual lyric chunks to the live display with a single action.
*   As an operator, I want to clear the live display instantly.

**Acceptance Criteria:**
*   Clicking a song in the Setlist column shall populate the Live Control Panel (Column 3) with its parsed lyric chunks.
*   Each lyric chunk in the Live Control Panel shall be presented as a distinct, clickable element (e.g., a button).
*   Clicking a lyric chunk button shall trigger a WebSocket event to send its text content to the OBS Display Layer.
*   A master "Clear Screen" button shall be available, which, when clicked, sends a WebSocket event to remove all text from the OBS Display Layer.

**Edge Cases:**
*   **No Song Selected:** The Live Control Panel should be empty or display a prompt to select a song.
*   **Empty Chunk:** If a chunk contains only whitespace or is empty after parsing, sending it should result in an empty display or be prevented.

### Visual State Indicators

Providing immediate feedback to the operator about the current live status.

**User Stories:**
*   As an operator, I want to clearly see which lyric chunk is currently live on the OBS display.
*   As an operator, I want to know when the screen is clear.

**Acceptance Criteria:**
*   The lyric chunk currently being displayed live on OBS shall be visually highlighted in the Operator Dashboard (e.g., with a distinct background color like red and contrasting text).
*   When the OBS Display Layer is clear, no chunk in the Operator Dashboard shall be highlighted.
*   The highlighting shall update in real-time via WebSocket events.

**Edge Cases:**
*   **OBS Display Disconnected:** The indicator should still reflect the last sent state from the backend, even if the OBS display is not receiving it.
*   **Multiple Operators:** All connected Operator Dashboards should show the same live indicator, synchronized via WebSockets.

### Keyboard Shortcuts

Optimizing operator efficiency with quick keypress actions.

**User Stories:**
*   As an operator, I want to use the Spacebar to quickly advance to the next lyric chunk.
*   As an operator, I want to use the Escape key to instantly clear the screen.

**Acceptance Criteria:**
*   When the Operator Dashboard window is in focus, pressing the `Spacebar` key shall:
    *   If a lyric chunk `N` is currently live, send lyric chunk `N+1` to the OBS Display Layer.
    *   If the screen is clear, send the first lyric chunk of the currently selected song to the OBS Display Layer.
    *   If the last lyric chunk of the selected song is live, clear the screen.
*   When the Operator Dashboard window is in focus, pressing the `Escape` key shall immediately trigger the "Clear Screen" function.
*   Keyboard shortcuts shall be global within the dashboard, not requiring specific elements to be focused.

**Edge Cases:**
*   **No Song Selected:** Pressing Spacebar should do nothing or display a subtle warning.
*   **No Lyrics in Selected Song:** Pressing Spacebar should do nothing.
*   **Keyboard Focus:** Shortcuts should work even if a text input field is not focused, but ideally, they should be disabled if an active text input is focused to prevent accidental actions.

### Custom Announcement Module

Enabling on-the-fly announcements.

**User Stories:**
*   As an operator, I want to quickly type and display an ad-hoc announcement on the live screen.

**Acceptance Criteria:**
*   The Operator Dashboard shall include a dedicated module for custom announcements.
*   This module shall contain a multi-line text input field.
*   A "Send Live" button shall be available within this module.
*   Clicking "Send Live" shall send the text from the input field to the OBS Display Layer, using the same styling and animations as lyrics.
*   Sending an announcement shall clear any currently displayed lyric and highlight the announcement as live (though not in the lyric chunks list).

**Edge Cases:**
*   **Empty Announcement:** Sending an empty announcement should clear the screen.
*   **Very Long Announcement:** The display layer should handle long text gracefully (e.g., wrapping, appropriate font size).

## OBS Display Layer

This module is the output component, responsible for rendering text received from the backend onto the OBS Studio Browser Source.

### Display Layer Setup

The foundation for displaying content in OBS.

**User Stories:**
*   As an OBS user, I want a simple URL to add to my Browser Source that displays content from PentasLirik.
*   As an OBS user, I want the display to have a transparent background so it overlays my video feed.

**Acceptance Criteria:**
*   The system shall provide a static HTML/JS page accessible at a predictable URL (e.g., `/display`).
*   This page shall have a transparent background (`background-color: transparent;`).
*   Upon loading, the page shall establish a persistent WebSocket connection to the Laravel Reverb backend.
*   The page shall listen for `display:update` and `display:clear` WebSocket events.

**Edge Cases:**
*   **WebSocket Disconnection:** The display layer should attempt to automatically reconnect to the WebSocket server.
*   **Network Latency:** The display should be optimized for low-latency rendering.

### Text Rendering and Styling

Ensuring readability and visual appeal of displayed text.

**User Stories:**
*   As a viewer, I want lyrics and announcements to be easily readable against any video background.
*   As a viewer, I want text to appear and disappear smoothly.

**Acceptance Criteria:**
*   Upon receiving a `display:update` event with a text payload, the Display Layer shall render the text.
*   The text shall be positioned in the lower-third of the screen.
*   The font shall be a bold, sans-serif font for maximum readability.
*   A strong, dark `text-shadow` shall be applied to the text to ensure contrast against various video backgrounds.
*   Text shall appear with a smooth fade-in animation (approx. 300-500ms duration).
*   Text shall disappear with a smooth fade-out animation (approx. 300-500ms duration) when a `display:clear` event is received or new text replaces it.
*   The styling (font, position, shadow, animation) shall be fixed and not user-configurable.

**Edge Cases:**
*   **Rapid Updates:** Animations should not queue up or cause visual glitches if updates are sent very quickly. The latest update should always take precedence.
*   **Empty Text:** If an empty string is received, the display should clear.

## Real-time Communication and State Synchronization

This module ensures that all connected clients (Operator Dashboards and OBS Display Layers) receive immediate updates and maintain a consistent view of the live state.

### Real-time State Broadcasting

Distributing live state changes to all clients.

**User Stories:**
*   As an operator, I want my actions to be reflected instantly on the live display.
*   As an operator, I want to see the current live state even if another operator made the change.

**Acceptance Criteria:**
*   The Laravel backend shall use Laravel Reverb to broadcast state changes to all connected clients.
*   Actions such as sending a lyric live, sending an announcement, or clearing the screen shall trigger a WebSocket broadcast in real-time.
*   The broadcasted events shall contain the necessary payload (e.g., text content for `display:update`, or a clear signal for `display:clear`).

**Edge Cases:**
*   **Network Partition:** Clients on a disconnected network segment will not receive updates until reconnected.
*   **High Load:** The WebSocket server must handle multiple concurrent connections and frequent updates without significant latency.

### State Synchronization on Reload

Ensuring the OBS Display Layer always shows the correct content, even after a refresh.

**User Stories:**
*   As an OBS user, I want the display to show the correct content immediately if OBS is restarted or the Browser Source is refreshed.

**Acceptance Criteria:**
*   The current live state (the text currently displayed on screen) shall be stored in a Redis cache on the backend.
*   The backend shall provide an API endpoint (e.g., `/api/v1/state/live`) that returns the content of this Redis key.
*   When the OBS Display Layer page loads or reloads, it shall first make an HTTP GET request to this endpoint.
*   The Display Layer shall immediately render the text received from this initial API call, preventing a "flash" of empty content.
*   After fetching the initial state, the Display Layer shall connect to the WebSocket for subsequent real-time updates.

**Edge Cases:**
*   **Redis Down:** The system should gracefully handle Redis unavailability (e.g., return an empty state, log an error).
*   **API Latency:** The initial fetch should be fast enough not to cause a noticeable delay before WebSocket connection.

## Admin Features

This module provides administrative capabilities for managing user accounts and roles within the system.

### User Management

Admins can create, modify, and delete user accounts and assign roles.

**User Stories:**
*   As an administrator, I want to create new user accounts for operators.
*   As an administrator, I want to change a user's role or update their details.
*   As an administrator, I want to remove user accounts that are no longer needed.

**Acceptance Criteria:**
*   A user with the `Admin` role shall have access to a dedicated user management dashboard.
*   Admins shall be able to create new user accounts by providing a name, email, password, and selecting a role (`Admin` or `Operator`).
*   Admins shall be able to edit existing user details (e.g., name, role) but not their email/username.
*   Admins shall be able to reset passwords for existing users.
*   Admins shall be able to delete user accounts, with a confirmation prompt.
*   All user management actions shall be protected by `Admin` role authorization.

**Edge Cases:**
*   **Deleting Own Account:** An admin should not be able to delete their own account.
*   **Last Admin Account:** The system should prevent the deletion or demotion of the last `Admin` account to ensure continued administrative access.
*   **Invalid Email/Password:** Input validation should be performed during user creation/editing.