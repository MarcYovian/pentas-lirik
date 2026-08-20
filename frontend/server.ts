import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { INITIAL_USERS, INITIAL_SONGS, INITIAL_SETLISTS } from './src/data/initialData.js';
import { Song, Setlist, User, LiveState, LyricChunk, Organization } from './src/types.js';
import { DisplaySetting, DEFAULT_DISPLAY_SETTING } from './src/types/DisplaySetting.js';

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Persistent Data Storage Path
const DATA_DIR = process.env.PENTASLIRIK_DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-Memory Data Stores
let users: User[] = [...INITIAL_USERS];
let songs: Song[] = [...INITIAL_SONGS];
let setlists: Setlist[] = [...INITIAL_SETLISTS];
let organizations: Organization[] = [
  {
    id: 1,
    name: 'Gereja Utama (Local)',
    slug: 'gereja-utama',
    invite_code: 'PL-MAIN01',
    description: 'Organisasi default instalasi lokal PentasLirik',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pivot: { role: 'ADMIN', status: 'ACTIVE' },
  },
];
let displayPresets: DisplaySetting[] = [{ ...DEFAULT_DISPLAY_SETTING }];
let activeDisplaySetting: DisplaySetting = { ...DEFAULT_DISPLAY_SETTING };

let liveState: LiveState = {
  type: 'clear',
  content: null,
  song_id: null,
  song_title: null,
  lyric_chunk_id: null,
  label: null,
  updated_at: new Date().toISOString(),
};

// Ensure data directory and load existing database file if present
function initPersistence() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.users) users = parsed.users;
      if (parsed.songs) songs = parsed.songs;
      if (parsed.setlists) setlists = parsed.setlists;
      if (parsed.organizations) organizations = parsed.organizations;
      if (parsed.displayPresets) displayPresets = parsed.displayPresets;
      if (parsed.activeDisplaySetting) activeDisplaySetting = parsed.activeDisplaySetting;
      console.log(`[PentasLirik] Persistent database loaded from ${DB_FILE}`);
    } else {
      savePersistence();
    }
  } catch (err) {
    console.warn('[PentasLirik] Warning: Failed to load persistence file, using initial data:', err);
  }
}

function savePersistence() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const dataToSave = {
      users,
      songs,
      setlists,
      organizations,
      displayPresets,
      activeDisplaySetting,
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PentasLirik] Error saving persistence file:', err);
  }
}

initPersistence();

// Helper to get local network IP addresses (for iPad / Wi-Fi multi-device access)
function getLocalNetworkIps(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (netList) {
      for (const net of netList) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          addresses.push(net.address);
        }
      }
    }
  }

  return addresses.length > 0 ? addresses : ['127.0.0.1'];
}

// WebSocket Server attached on /ws
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcastLiveState(event: 'display:update' | 'display:clear') {
  const message = JSON.stringify({
    type: event,
    event,
    payload: liveState,
    data: liveState,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastDisplaySettings(updated: DisplaySetting) {
  const message = JSON.stringify({
    type: 'display:settings-updated',
    event: 'display:settings-updated',
    payload: updated,
    data: updated,
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
      data: liveState,
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

// --- System & Local Network Discovery ---
app.get('/api/v1/system/network-info', (req: Request, res: Response) => {
  const localIps = getLocalNetworkIps();
  const primaryIp = localIps[0] || '127.0.0.1';
  return res.json({
    data: {
      primary_ip: primaryIp,
      all_ips: localIps,
      port: PORT,
      lan_dashboard_url: `http://${primaryIp}:${PORT}`,
      lan_obs_url: `http://${primaryIp}:${PORT}/display`,
      localhost_obs_url: `http://localhost:${PORT}/display`,
    },
  });
});

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
      user: {
        ...userWithoutPassword,
        organizations,
      },
      token: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.user_${foundUser.id}_token`,
    },
  });
});

app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  const { name, email, password, organization_name, invite_code } = req.body;

  if (!name || !email || !password) {
    return res.status(422).json({ message: 'Name, email, and password are required.' });
  }

  let targetOrg = organizations[0];

  if (organization_name) {
    targetOrg = {
      id: Date.now(),
      name: organization_name,
      slug: organization_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      invite_code: `PL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      description: 'Organisasi Baru',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pivot: { role: 'ADMIN', status: 'ACTIVE' },
    };
    organizations.unshift(targetOrg);
  }

  const newUser: User = {
    id: Date.now(),
    name,
    email,
    password,
    role: organization_name ? 'admin' : 'operator',
    createdAt: new Date().toISOString(),
    organizations: [targetOrg],
  };

  users.push(newUser);
  savePersistence();

  const { password: _, ...userWithoutPassword } = newUser;
  return res.status(201).json({
    data: {
      user: userWithoutPassword,
      token: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.user_${newUser.id}_token`,
      organization: targetOrg,
    },
  });
});

app.put('/api/v1/auth/profile', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name && !email) {
    return res.status(422).json({ message: 'Name or email is required.' });
  }

  // Update first admin user or matching token user
  if (users.length > 0) {
    if (name) users[0].name = name;
    if (email) users[0].email = email;
    savePersistence();
    const { password: _, ...safeUser } = users[0];
    return res.json({ data: safeUser, message: 'Profile updated successfully.' });
  }

  return res.status(404).json({ message: 'User not found.' });
});

app.put('/api/v1/auth/password', (req: Request, res: Response) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(422).json({ message: 'Current password and new password are required.' });
  }

  if (users.length > 0) {
    if (users[0].password && users[0].password !== current_password) {
      return res.status(422).json({ message: 'Current password does not match.' });
    }
    users[0].password = new_password;
    savePersistence();
    return res.json({ message: 'Password successfully updated.' });
  }

  return res.status(404).json({ message: 'User not found.' });
});

app.post('/api/v1/auth/logout', (req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully.' });
});

// --- Organizations Management ---
app.get('/api/v1/organizations', (req: Request, res: Response) => {
  return res.json({ data: organizations });
});

app.post('/api/v1/organizations', (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) return res.status(422).json({ message: 'Organization name is required.' });

  const newOrg: Organization = {
    id: Date.now(),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    invite_code: `PL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    description: description || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pivot: { role: 'ADMIN', status: 'ACTIVE' },
  };

  organizations.unshift(newOrg);
  savePersistence();
  return res.status(201).json({ data: newOrg });
});

app.get('/api/v1/organizations/public/:slug', (req: Request, res: Response) => {
  const slug = req.params.slug;
  const org = organizations.find((o) => o.slug === slug || String(o.id) === slug);
  if (!org) return res.status(404).json({ message: 'Organization not found.' });
  return res.json({ data: org });
});

app.get('/api/v1/organizations/:id/members', (req: Request, res: Response) => {
  const safeUsers = users.map(({ password, ...u }) => ({
    ...u,
    status: 'ACTIVE',
    pivot: { role: u.role === 'admin' ? 'ADMIN' : 'OPERATOR', status: 'ACTIVE' },
  }));
  return res.json({ data: safeUsers, is_admin: true, pending_count: 0 });
});

app.post('/api/v1/organizations/:id/members', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email) return res.status(422).json({ message: 'Name and email are required.' });

  const newUser: User = {
    id: Date.now(),
    name,
    email,
    password: password || 'password',
    role: role || 'operator',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  savePersistence();
  const { password: _, ...safeUser } = newUser;
  return res.status(201).json({ data: safeUser });
});

app.post('/api/v1/organizations/join', (req: Request, res: Response) => {
  const { invite_code } = req.body;
  const foundOrg = organizations.find((o) => o.invite_code === invite_code);
  if (!foundOrg) return res.status(404).json({ message: 'Invalid invite code.' });
  return res.json({ data: foundOrg, message: 'Successfully joined organization.' });
});

// --- Super Admin Stats ---
app.get('/api/v1/super-admin/stats', (req: Request, res: Response) => {
  return res.json({
    data: {
      total_users: users.length,
      total_organizations: organizations.length,
      total_songs: songs.length,
      total_setlists: setlists.length,
      total_presets: displayPresets.length,
      active_connections: wss.clients.size,
      uptime_seconds: process.uptime(),
      organizations,
    },
  });
});

// --- Songs Management ---
app.get('/api/v1/songs', (req: Request, res: Response) => {
  const search = (req.query.search || req.query.q) as string;
  let result = songs;

  if (search) {
    const q = search.toLowerCase();
    result = songs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
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
  const { title, artist, lyrics, lyrics_raw } = req.body;
  if (!title) {
    return res.status(422).json({
      message: 'Validation error',
      errors: { title: ['Title is required'] },
    });
  }

  const rawLyricsText = lyrics || lyrics_raw || '';
  const parsedChunks = parseRawLyrics(rawLyricsText);
  const newSong: Song = {
    id: Date.now(),
    title,
    artist: artist || 'Unknown Artist',
    lyrics_raw: rawLyricsText,
    lyrics: parsedChunks,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  songs.unshift(newSong);
  savePersistence();
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

  const { title, artist, lyrics, lyrics_raw } = req.body;
  const existingSong = songs[songIndex];
  const rawLyricsText = lyrics !== undefined ? lyrics : lyrics_raw !== undefined ? lyrics_raw : existingSong.lyrics_raw;

  const updatedSong: Song = {
    ...existingSong,
    title: title ?? existingSong.title,
    artist: artist ?? existingSong.artist,
    lyrics_raw: rawLyricsText,
    lyrics: rawLyricsText !== undefined ? parseRawLyrics(rawLyricsText) : existingSong.lyrics,
    updated_at: new Date().toISOString(),
  };

  songs[songIndex] = updatedSong;
  savePersistence();
  return res.json({ data: updatedSong });
});

app.delete('/api/v1/songs/:id', (req: Request, res: Response) => {
  const songId = parseInt(req.params.id, 10);
  songs = songs.filter((s) => s.id !== songId);
  savePersistence();
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
  savePersistence();
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

  savePersistence();
  return res.json({ data: setlists[index] });
});

app.delete('/api/v1/setlists/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  setlists = setlists.filter((s) => s.id !== id);
  savePersistence();
  return res.json({ message: 'Setlist deleted.' });
});

// --- Display Settings & Presets ---
app.get('/api/v1/display/settings', (req: Request, res: Response) => {
  return res.json({ data: activeDisplaySetting });
});

app.put('/api/v1/display/settings', (req: Request, res: Response) => {
  activeDisplaySetting = {
    ...activeDisplaySetting,
    ...req.body,
  };
  savePersistence();
  broadcastDisplaySettings(activeDisplaySetting);
  return res.json({ data: activeDisplaySetting, message: 'Display settings updated.' });
});

app.get('/api/v1/display/presets', (req: Request, res: Response) => {
  return res.json({ data: displayPresets });
});

app.post('/api/v1/display/presets', (req: Request, res: Response) => {
  const newPreset: DisplaySetting = {
    ...DEFAULT_DISPLAY_SETTING,
    ...req.body,
    id: Date.now(),
    is_active: false,
  };
  displayPresets.unshift(newPreset);
  savePersistence();
  return res.status(201).json({ data: newPreset });
});

app.post('/api/v1/display/presets/:id/activate', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const found = displayPresets.find((p) => p.id === id);
  if (!found) return res.status(404).json({ message: 'Preset not found.' });

  displayPresets = displayPresets.map((p) => ({ ...p, is_active: p.id === id }));
  activeDisplaySetting = { ...found, is_active: true };
  savePersistence();
  broadcastDisplaySettings(activeDisplaySetting);
  return res.json({ data: activeDisplaySetting, message: 'Preset activated.' });
});

app.delete('/api/v1/display/presets/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  displayPresets = displayPresets.filter((p) => p.id !== id);
  savePersistence();
  return res.json({ message: 'Preset deleted.' });
});

// --- Live Control ---
app.post('/api/v1/live/send-lyric', (req: Request, res: Response) => {
  const { type, content, text, song_id, lyric_chunk_id, song_title, label } = req.body;
  const chunkText = content || text;

  if (!chunkText && type !== 'clear') {
    return res.status(422).json({ message: 'Content is required.' });
  }

  liveState = {
    type: type || 'lyric',
    content: chunkText,
    song_id: song_id ?? null,
    song_title: song_title ?? null,
    lyric_chunk_id: lyric_chunk_id ?? null,
    label: label ?? null,
    updated_at: new Date().toISOString(),
  };

  broadcastLiveState('display:update');

  return res.json({
    message: 'Content sent to live display.',
    data: liveState,
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
    data: liveState,
    current_live_state: liveState,
  });
});

app.get('/api/v1/live/state', (req: Request, res: Response) => {
  return res.json({ data: liveState });
});

app.get('/api/v1/state/live', (req: Request, res: Response) => {
  return res.json({ data: liveState });
});

// ==================== VITE MIDDLEWARE / STATIC SERVING ==================== //

export async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.SERVE_STATIC) {
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

  return new Promise<void>((resolve) => {
    server.listen(PORT, '0.0.0.0', () => {
      const localIps = getLocalNetworkIps();
      console.log('====================================================');
      console.log(`[PentasLirik] Standalone Server running on port ${PORT}`);
      console.log(`[PentasLirik] Localhost URL : http://localhost:${PORT}`);
      console.log(`[PentasLirik] OBS Display   : http://localhost:${PORT}/display`);
      console.log(`[PentasLirik] Wi-Fi LAN IP  : http://${localIps[0]}:${PORT}`);
      console.log('====================================================');
      resolve();
    });
  });
}

// Auto start if executed directly
if (process.argv[1] && process.argv[1].endsWith('server.ts') || process.argv[1]?.endsWith('server.cjs')) {
  startServer();
}
