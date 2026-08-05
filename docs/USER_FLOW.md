# USERFLOW.md: PentasLirik

## Live Lyric Presentation Flow

This flow describes the primary interaction of an operator sending song lyrics to the live display during an event, including the use of keyboard shortcuts.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Operator | Selects a song from the "Setlist Rundown" (Center Column) by clicking on it. | The "Live Control Panel" (Right Column) populates with the song's lyric chunks, each as a clickable button. The selected song in the Setlist is highlighted. | If no lyrics are associated with the song, the Live Control Panel displays "No lyrics available." |
| 2 | Operator | Clicks on a specific lyric chunk button in the "Live Control Panel". | **Backend:** Updates the `live_state` in Redis with the selected lyric text. Broadcasts a `display:update` WebSocket event containing the lyric text to all connected clients (including OBS Display Layer). **Frontend:** The clicked lyric chunk button is visually highlighted (e.g., red background). | If WebSocket connection is lost, a "Disconnected" indicator appears, and the action fails. |
| 3 | OBS Display Layer | Receives `display:update` WebSocket event. | Renders the received lyric text on the screen with a smooth fade-in animation, strong text-shadow, and lower-third positioning. | If the text is identical to the currently displayed text, no animation occurs, and the text remains. |
| 4 | Operator | Presses the `Spacebar` key (global shortcut). | **Backend:** If a lyric is currently live, it determines the next chunk in sequence. If it's the last chunk, it triggers a "clear screen" action. If no lyric is live, it sends the first chunk of the currently selected song. Updates `live_state` in Redis and broadcasts `display:update` or `display:clear` WebSocket event. **Frontend:** The next/first chunk is highlighted, or all highlights are removed if cleared. | If no song is selected in the Setlist, `Spacebar` has no effect. If the last chunk is live, it clears the screen (step 7). |
| 5 | OBS Display Layer | Receives `display:update` WebSocket event (for next chunk). | Fades out the current text, then fades in the new lyric text. | If the WebSocket connection is unstable, the display might lag or show a brief blank screen. |
| 6 | Operator | Presses the `Escape` key (global shortcut). | **Backend:** Updates `live_state` in Redis to `null` or empty. Broadcasts a `display:clear` WebSocket event to all connected clients. **Frontend:** All lyric chunk highlights in the "Live Control Panel" are removed. | If no lyric is currently live, `Escape` has no visible effect on the display. |
| 7 | OBS Display Layer | Receives `display:clear` WebSocket event. | Fades out any currently displayed text, leaving the screen transparent. | - |

**Trigger:** The operator needs to display song lyrics on the live stream.
**Pre-conditions:**
*   Operator is logged into the PentasLirik dashboard.
*   A setlist containing songs with lyrics is loaded.
*   The OBS Studio Browser Source is active and connected to the PentasLirik Display Layer, which has an active WebSocket connection to the backend.
*   The Operator Dashboard window is in focus for keyboard shortcuts to work.
**Post-conditions:**
*   The selected or next lyric chunk is displayed on the OBS output.
*   The Operator Dashboard visually indicates which lyric chunk is currently live.
*   The `live_state` in Redis is updated to reflect the current display content.

## Setlist Creation and Management Flow

This flow details how an operator prepares a sequence of songs for an event.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Operator | Clicks "New Setlist" or selects an existing setlist from a dropdown/list in the "Setlist Rundown" (Center Column). | **Frontend:** If "New Setlist", the Setlist column becomes empty and ready for additions. If loading, the Setlist column populates with items from the selected saved setlist. | If loading fails (e.g., network error), an error message is displayed, and the current setlist remains unchanged. |
| 2 | Operator | Searches for a song by typing in the search bar in the "Song Library" (Left Column). | **Frontend:** The list of songs in the Left Column filters dynamically based on the search query (title or artist). | If no results match, "No songs found" is displayed. |
| 3 | Operator | Clicks a "+" button next to a song in the "Song Library" or drags a song from the Left Column to the "Setlist Rundown" (Center Column). | **Frontend:** The selected song is added to the end of the "Setlist Rundown" column. | If the song is already in the setlist, it is still added as a duplicate (allowing for repeated songs). |
| 4 | Operator | Drags and drops a song within the "Setlist Rundown" column. | **Frontend:** The order of songs in the "Setlist Rundown" column is visually updated. | If drag-and-drop is invalid (e.g., outside the column), the item snaps back to its original position. |
| 5 | Operator | Clicks "Save Setlist" button. | **Backend:** Sends an API request to save the current order of songs in the Setlist column to the database, associated with a name. **Frontend:** Displays a success message. The setlist is now available for future loading. | If saving fails (e.g., validation error, database issue), an error message is displayed. |

**Trigger:** The operator needs to organize songs for an upcoming live event.
**Pre-conditions:**
*   Operator is logged into the PentasLirik dashboard.
*   The song library contains songs with lyrics.
**Post-conditions:**
*   A named setlist is created or updated in the database.
*   The "Setlist Rundown" column accurately reflects the desired sequence of songs for the event.

## Song and Lyric Content Management Flow

This flow outlines how users add new songs and their associated lyrics to the system's library.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | User (Admin/Operator) | Navigates to the "Song Management" section (e.g., via a menu item). | **Frontend:** Displays a list of existing songs and an "Add New Song" button. | If no songs exist, the list is empty. |
| 2 | User | Clicks "Add New Song" button. | **Frontend:** Displays a form with input fields for "Title", "Artist", and a large multiline text area for "Lyrics". | - |
| 3 | User | Enters song "Title" and "Artist". | **Frontend:** Input fields populate with user data. | If fields are left empty, validation errors will appear on save. |
| 4 | User | Enters multiline lyrics into the "Lyrics" text area, using `[SECTION]` markers for chunking. | **Frontend:** The text area displays the entered lyrics. | - |
| 5 | User | Clicks "Save Song" button. | **Backend:** Receives song data. Parses the multiline lyric text: identifies lines enclosed in square brackets (e.g., `[VERSE 1]`) as chunk labels and groups subsequent lines until the next label or end of text. Stores the song details and the parsed lyric chunks in the database. **Frontend:** Displays a success message and redirects back to the song list, or shows the newly created song in an edit view. | If validation fails (e.g., missing title), error messages are displayed. If lyric parsing encounters an unexpected format, it defaults to treating the entire text as one chunk or logs a warning. |
| 6 | User | (Optional) Edits an existing song's details or lyrics. | **Backend:** Updates the song and re-parses/updates its lyric chunks in the database. **Frontend:** Displays updated song details. | If the song is currently in a live setlist, changes will only apply if the setlist is reloaded or the song is re-selected. |

**Trigger:** A new song needs to be added to the PentasLirik library.
**Pre-conditions:**
*   User is logged in with `Admin` or `Operator` role.
**Post-conditions:**
*   The new song, with its title, artist, and chunked lyrics, is stored in the database.
*   The song is available for selection in the "Song Library" and can be added to setlists.

## Ad-hoc Announcement Display Flow

This flow describes how an operator can quickly display a custom, unscheduled announcement.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Operator | Locates the "Custom Announcement" module on the Operator Dashboard. | **Frontend:** Displays a text input field and a "Send Live" button. | - |
| 2 | Operator | Types the desired announcement text into the input field. | **Frontend:** The text input field populates with the entered text. | - |
| 3 | Operator | Clicks the "Send Live" button within the "Custom Announcement" module. | **Backend:** Updates the `live_state` in Redis with the announcement text. Broadcasts a `display:update` WebSocket event containing the announcement text to all connected clients (including OBS Display Layer). **Frontend:** The announcement module might show a temporary "Sent!" indicator. | If the input field is empty, the "Send Live" button might be disabled or trigger a validation error. If WebSocket connection is lost, the action fails. |
| 4 | OBS Display Layer | Receives `display:update` WebSocket event. | Renders the received announcement text on the screen with a smooth fade-in animation, strong text-shadow, and lower-third positioning. | If the text is identical to the currently displayed text, no animation occurs. |
| 5 | Operator | To clear the announcement, either clicks the master "Clear Screen" button or presses the `Escape` key. | **Backend:** Updates `live_state` in Redis to `null` or empty. Broadcasts a `display:clear` WebSocket event. **Frontend:** All live highlights are removed. | If the operator sends another lyric or announcement, the current announcement is automatically replaced. |

**Trigger:** The operator needs to display a spontaneous message or announcement during a live event.
**Pre-conditions:**
*   Operator is logged into the PentasLirik dashboard.
*   The OBS Studio Browser Source is active and connected to the PentasLirik Display Layer, which has an active WebSocket connection to the backend.
**Post-conditions:**
*   The custom announcement text is displayed on the OBS output.
*   The `live_state` in Redis is updated to reflect the announcement.