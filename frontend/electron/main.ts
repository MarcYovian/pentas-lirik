import { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage, clipboard } from 'electron';
import path from 'path';
import os from 'os';
import { startServer } from '../server.js';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const PORT = 3000;

// Set persistent data directory to standard OS user data folder
const USER_DATA_PATH = path.join(app.getPath('userData'), 'data');
process.env.PENTASLIRIK_DATA_DIR = USER_DATA_PATH;
process.env.PORT = String(PORT);
process.env.NODE_ENV = 'production';
process.env.SERVE_STATIC = 'true';

// Helper to get local network IP addresses (for iPad / Wi-Fi multi-device access)
function getLocalNetworkIps(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (netList) {
      for (const net of netList) {
        if (net.family === 'IPv4' && !net.internal) {
          addresses.push(net.address);
        }
      }
    }
  }

  return addresses.length > 0 ? addresses : ['127.0.0.1'];
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 820,
    minWidth: 1024,
    minHeight: 650,
    title: 'PentasLirik - Live Stage & OBS Display Controller',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#0F0F0F',
  });

  // Load the running local server
  await mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const primaryIp = getLocalNetworkIps()[0] || '127.0.0.1';
  const lanUrl = `http://${primaryIp}:${PORT}`;
  const obsUrl = `http://localhost:${PORT}/display`;

  // Create tray with default icon or empty image fallback
  try {
    const iconPath = path.join(__dirname, '../../public/icon-192.png');
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  } catch (e) {
    tray = new Tray(nativeImage.createEmpty());
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'PentasLirik (Online & Live)',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Buka Dashboard Operator',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    {
      label: 'Buka Layar OBS Display di Browser',
      click: () => {
        shell.openExternal(obsUrl);
      },
    },
    {
      label: `Salin URL Wi-Fi iPad (${lanUrl})`,
      click: () => {
        clipboard.writeText(lanUrl);
      },
    },
    { type: 'separator' },
    {
      label: 'Keluar dari PentasLirik',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip(`PentasLirik - Server Aktif di ${lanUrl}`);
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}

// Setup IPC handlers
ipcMain.handle('get-network-info', () => {
  const localIps = getLocalNetworkIps();
  const primaryIp = localIps[0] || '127.0.0.1';
  return {
    primary_ip: primaryIp,
    all_ips: localIps,
    port: PORT,
    lan_dashboard_url: `http://${primaryIp}:${PORT}`,
    lan_obs_url: `http://${primaryIp}:${PORT}/display`,
    localhost_obs_url: `http://localhost:${PORT}/display`,
  };
});

ipcMain.handle('open-external', (_event, url: string) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    shell.openExternal(url);
  }
});

ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});

// App lifecycle
app.whenReady().then(async () => {
  try {
    // 1. Start embedded express & websocket server
    await startServer();

    // 2. Create desktop application window
    await createWindow();

    // 3. Create tray menu
    createTray();
  } catch (err) {
    console.error('[PentasLirik] Failed to start desktop application:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
