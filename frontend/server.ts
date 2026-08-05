import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { INITIAL_USERS, INITIAL_SONGS, INITIAL_SETLISTS } from './src/data/initialData.js';
import { Song, Setlist, User, LiveState, LyricChunk } from './src/types.js';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// In-Memory Data Stores
let users: User[] = [...INITIAL_USERS];
let songs: Song[] = [...INITIAL_SONGS];
let setlists: Setlist[] = [...INITIAL_SETLISTS];

let liveState: LiveState = {
  type: 'clear',
  content: null,
  song_id: null,
  song_title: null,
  lyric_chunk_id: null,
  label: null,
  updated_at: new Date().toISOString(),
};

// WebSocket Server attached on /ws
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcastLiveState(event: 'display:update' | 'display:clear') {
  const message = JSON.stringify({
    type: event,
    payload: liveState,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on('connection', (ws: WebSocket) => {
  // Send initial live state on connect to prevent flash on reload
  ws.send(
    JSON.stringify({
      type: 'INIT_STATE',
      payload: liveState,
    })
  );
});

// Helper: Parse raw lyrics into structured chunks
function parseRawLyrics(rawText: string): LyricChunk[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const lines = rawText.split('\n');
  const chunks: LyricChunk[] = [];
  let currentLabel = '[VERSE]';
  let currentLines: string[] = [];
  let orderCounter = 1;
  let idCounter = Date.now();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const tagMatch = line.match(/^\[(.*)\]$/);

    if (tagMatch) {
      // Save existing accumulated block if not empty
      if (currentLines.length > 0) {
        const content = currentLines.join('\n').trim();
        if (content) {
          chunks.push({
            id: idCounter++,
            label: currentLabel,
            content,
            order: orderCounter++,
          });
        }
        currentLines = [];
      }
      currentLabel = `[${tagMatch[1].toUpperCase()}]`;
    } else {
      currentLines.push(lines[i]);
    }
  }

  // Push final chunk
  if (currentLines.length > 0) {
    const content = currentLines.join('\n').trim();
    if (content) {
      chunks.push({
        id: idCounter++,
        label: currentLabel,
        content,
        order: orderCounter++,
      });
    }
  }

  return chunks;
}

// ==================== API ENDPOINTS ==================== //

// --- Authentication ---
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: { email: ['Email and password are required.'] },
    });
  }

  const foundUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!foundUser) {
    return res.status(401).json({ message: 'Invalid credentials provided.' });
  }

  const { password: _, ...userWithoutPassword } = foundUser;
  return res.json({
    data: {
      user: userWithoutPassword,
      token: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.user_${foundUser.id}_token`,
    },
  });
});

// --- Songs Management ---
app.get('/api/v1/songs', (req: Request, res: Response) => {
  const search = (req.query.search as string)?.toLowerCase();
  let result = songs;

  if (search) {
    result = songs.filter(
      (s) =>
        s.title.toLowerCase().includes(search) ||
        s.artist.toLowerCase().includes(search)
    );
  }

  return res.json({
    data: result,
    meta: {
      pagination: {
        total: result.length,
        count: result.length,
        per_page: 100,
        current_page: 1,
        total_pages: 1,
      },
    },
  });
});

app.post('/api/v1/songs', (req: Request, res: Response) => {
  const { title, artist, lyrics_raw } = req.body;
  if (!title) {
    return res.status(422).json({
      message: 'Validation error',
      errors: { title: ['Title is required'] },
    });
  }

  const parsedChunks = parseRawLyrics(lyrics_raw || '');
  const newSong: Song = {
    id: Date.now(),
    title,
    artist: artist || 'Unknown Artist',
    lyrics_raw: lyrics_raw || '',
    lyrics: parsedChunks,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  songs.unshift(newSong);
  return res.status(201).json({ data: newSong });
});

app.get('/api/v1/songs/:id', (req: Request, res: Response) => {
  const songId = parseInt(req.params.id, 10);
  const song = songs.find((s) => s.id === songId);

  if (!song) {
    return res.status(404).json({ message: 'Song not found' });
  }

  return res.json({ data: song });
});

app.put('/api/v1/songs/:id', (req: Request, res: Response) => {
  const songId = parseInt(req.params.id, 10);
  const songIndex = songs.findIndex((s) => s.id === songId);

  if (songIndex === -1) {
    return res.status(404).json({ message: 'Song not found' });
  }

  const { title, artist, lyrics_raw } = req.body;
  const existingSong = songs[songIndex];

  const updatedSong: Song = {
    ...existingSong,
    title: title ?? existingSong.title,
    artist: artist ?? existingSong.artist,
    lyrics_raw: lyrics_raw ?? existingSong.lyrics_raw,
    lyrics: lyrics_raw !== undefined ? parseRawLyrics(lyrics_raw) : existingSong.lyrics,
    updated_at: new Date().toISOString(),
  };

  songs[songIndex] = updatedSong;
  return res.json({ data: updatedSong });
});

app.delete('/api/v1/songs/:id', (req: Request, res: Response) => {
  const songId = parseInt(req.params.id, 10);
  songs = songs.filter((s) => s.id !== songId);
  return res.json({ message: 'Song successfully deleted.' });
});

// --- Setlists Management ---
app.get('/api/v1/setlists', (req: Request, res: Response) => {
  return res.json({ data: setlists });
});

app.post('/api/v1/setlists', (req: Request, res: Response) => {
  const { name, items } = req.body;
  if (!name) {
    return res.status(422).json({ message: 'Setlist name is required.' });
  }

  const newSetlist: Setlist = {
    id: Date.now(),
    name,
    items: items || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  setlists.unshift(newSetlist);
  return res.status(201).json({ data: newSetlist });
});

app.get('/api/v1/setlists/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const setlist = setlists.find((s) => s.id === id);

  if (!setlist) {
    return res.status(404).json({ message: 'Setlist not found.' });
  }

  return res.json({ data: setlist });
});

app.put('/api/v1/setlists/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const index = setlists.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Setlist not found.' });
  }

  const { name, items } = req.body;
  setlists[index] = {
    ...setlists[index],
    name: name ?? setlists[index].name,
    items: items ?? setlists[index].items,
    updated_at: new Date().toISOString(),
  };

  return res.json({ data: setlists[index] });
});

app.delete('/api/v1/setlists/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  setlists = setlists.filter((s) => s.id !== id);
  return res.json({ message: 'Setlist deleted.' });
});

// --- Live Control ---
app.post('/api/v1/live/send-lyric', (req: Request, res: Response) => {
  const { type, content, song_id, lyric_chunk_id, song_title, label } = req.body;

  if (!content) {
    return res.status(422).json({ message: 'Content is required.' });
  }

  liveState = {
    type: type || 'lyric',
    content,
    song_id: song_id ?? null,
    song_title: song_title ?? null,
    lyric_chunk_id: lyric_chunk_id ?? null,
    label: label ?? null,
    updated_at: new Date().toISOString(),
  };

  broadcastLiveState('display:update');

  return res.json({
    message: 'Content sent to live display.',
    current_live_state: liveState,
  });
});

app.post('/api/v1/live/clear', (req: Request, res: Response) => {
  liveState = {
    type: 'clear',
    content: null,
    song_id: null,
    song_title: null,
    lyric_chunk_id: null,
    label: null,
    updated_at: new Date().toISOString(),
  };

  broadcastLiveState('display:clear');

  return res.json({
    message: 'Live display cleared.',
    current_live_state: liveState,
  });
});

app.get('/api/v1/live/state', (req: Request, res: Response) => {
  return res.json({ data: liveState });
});

// --- User Management (Admin) ---
app.get('/api/v1/users', (req: Request, res: Response) => {
  const safeUsers = users.map(({ password, ...u }) => u);
  return res.json({ data: safeUsers });
});

app.post('/api/v1/users', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(422).json({ message: 'Name, email, and password are required.' });
  }

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(422).json({ message: 'Email is already taken.' });
  }

  const newUser: User = {
    id: Date.now(),
    name,
    email,
    password,
    role: role || 'operator',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  return res.status(201).json({ data: userWithoutPassword });
});

app.put('/api/v1/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const { name, role, password } = req.body;
  users[userIndex] = {
    ...users[userIndex],
    name: name ?? users[userIndex].name,
    role: role ?? users[userIndex].role,
    password: password ? password : users[userIndex].password,
    updatedAt: new Date().toISOString(),
  };

  const { password: _, ...userWithoutPassword } = users[userIndex];
  return res.json({ data: userWithoutPassword });
});

app.delete('/api/v1/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  // Prevent deleting sole admin
  const admins = users.filter((u) => u.role === 'admin');
  const targetUser = users.find((u) => u.id === id);

  if (targetUser?.role === 'admin' && admins.length <= 1) {
    return res.status(400).json({ message: 'Cannot delete the last remaining Admin account.' });
  }

  users = users.filter((u) => u.id !== id);
  return res.json({ message: 'User deleted successfully.' });
});

// ==================== VITE MIDDLEWARE / STATIC SERVING ==================== //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[PentasLirik] Server listening on http://localhost:${PORT}`);
  });
}

startServer();
