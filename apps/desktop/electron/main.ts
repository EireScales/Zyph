import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  shell,
  Tray,
} from 'electron';
import path from 'path';
import Store from 'electron-store';
import { createWorker } from 'tesseract.js';
import activeWin from 'active-win';

const store = new Store<{ token?: string; apiBaseUrl?: string }>({ name: 'zyph' });

const CAPTURE_INTERVAL_MS = 30 * 1000;
const RETRY_AFTER_MS = 60 * 1000;

let tray: Tray | null = null;
let loginWindow: BrowserWindow | null = null;
let statusWindow: BrowserWindow | null = null;
let captureWindow: BrowserWindow | null = null;
let capturePaused = false;
let retryTimeout: ReturnType<typeof setTimeout> | null = null;

function getActiveWindowName(): Promise<string> {
  return activeWin()
    .then((w) => w?.title ?? '')
    .catch(() => '');
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAzElEQVQ4T2NkYGD4z0ABYBw1gGE0DBhGwwAGBhgNQ0MDgwEMDAz/Gf4z/Gf8z8DA8J+BgYGBgQEAggcEQQ2VhYoAIyMjw38GBob/DAwM/xkYGP4zMDD8Z2Bg+M/AwPCfgYHhPwMDw38GBob/DAwM/xkYGP4zMDD8Z2Bg+M/AwPCfgYHhPwMDw38GBob/DAwPDfwYGhv8MDAz/GRgY/jMwMPxnYGD4z8DA8J+BgeE/AwPDfwYGhv8MDAz/GRgY/jMwMPxnYGD4DwDxRA2VY2RjggAAAABJRU5ErkJggg=='
  );
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const updateMenu = () => {
    const menu = Menu.buildFromTemplate([
      { label: 'Zyph is active', enabled: false },
      { type: 'separator' },
      {
        label: capturePaused ? 'Resume capture' : 'Pause capture',
        click: () => {
          capturePaused = !capturePaused;
          updateMenu();
        },
      },
      {
        label: 'Open Dashboard',
        click: () => {
          const url = store.get('apiBaseUrl', 'http://localhost:3000');
          shell.openExternal(url.replace(/\/$/, '') + '/dashboard');
        },
      },
      {
        label: 'Show status',
        click: () => {
          if (statusWindow) {
            statusWindow.show();
            statusWindow.focus();
          } else {
            createStatusWindow();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ]);
    tray.setContextMenu(menu);
  };

  updateMenu();
  tray.setToolTip('Zyph');
}

function createLoginWindow() {
  if (loginWindow) return;
  loginWindow = new BrowserWindow({
    width: 380,
    height: 420,
    resizable: false,
    title: 'Zyph — Sign in',
    webPreferences: {
      preload: path.join(__dirname, 'preload-login.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  loginWindow.loadFile(path.join(__dirname, '..', 'dist', 'login.html'));
  loginWindow.on('closed', () => {
    loginWindow = null;
  });
}

function createStatusWindow() {
  if (statusWindow) {
    statusWindow.show();
    return;
  }
  statusWindow = new BrowserWindow({
    width: 260,
    height: 120,
    resizable: false,
    title: 'Zyph',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  statusWindow.loadFile(path.join(__dirname, '..', 'dist', 'status.html'));
  statusWindow.on('closed', () => {
    statusWindow = null;
  });
  statusWindow.once('ready-to-show', () => statusWindow?.show());
}

function createCaptureWindow() {
  if (captureWindow && !captureWindow.isDestroyed()) return captureWindow;
  captureWindow = new BrowserWindow({
    width: 1,
    height: 1,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload-capture.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  captureWindow.loadFile(path.join(__dirname, '..', 'dist', 'capture.html'));
  return captureWindow;
}

async function runOCR(base64: string): Promise<string> {
  const worker = await createWorker('eng', 1, { logger: () => {} });
  try {
    const {
      data: { text },
    } = await worker.recognize('data:image/png;base64,' + base64);
    return text?.trim() ?? '';
  } finally {
    await worker.terminate();
  }
}

async function sendToAnalysisApi(rawText: string, appName: string) {
  const token = store.get('token');
  const apiBaseUrl = store.get('apiBaseUrl', 'http://localhost:3000');
  if (!token || !apiBaseUrl) return;

  const url = apiBaseUrl.replace(/\/$/, '') + '/api/analyse';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rawText, appName }),
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }
}

function scheduleRetry() {
  if (retryTimeout) return;
  retryTimeout = setTimeout(() => {
    retryTimeout = null;
    runCaptureCycle();
  }, RETRY_AFTER_MS);
}

async function runCaptureCycle() {
  if (capturePaused) return;

  const token = store.get('token');
  if (!token) return;

  try {
    const win = createCaptureWindow();
    const base64 = await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Capture timeout')), 15000);
      const handler = (_e: unknown, result: { base64?: string; error?: string }) => {
        clearTimeout(timeout);
        ipcMain.removeListener('capture-result', handler);
        if (result.error) reject(new Error(result.error));
        else resolve(result.base64 ?? '');
      };
      ipcMain.on('capture-result', handler);
      win.webContents.send('do-capture');
    });

    if (!base64) {
      scheduleRetry();
      return;
    }

    const [rawText, appName] = await Promise.all([
      runOCR(base64),
      getActiveWindowName(),
    ]);

    await sendToAnalysisApi(rawText, appName);
  } catch {
    scheduleRetry();
  }
}

function startCaptureLoop() {
  runCaptureCycle();
  setInterval(runCaptureCycle, CAPTURE_INTERVAL_MS);
}

function initIpc() {
  ipcMain.handle('get-config', () => ({
    apiBaseUrl: store.get('apiBaseUrl', 'http://localhost:3000'),
  }));

  ipcMain.handle(
    'login',
    async (
      _e,
      payload: { email: string; password: string; apiBaseUrl: string }
    ) => {
      const baseUrl = (payload.apiBaseUrl || 'http://localhost:3000').replace(
        /\/$/,
        ''
      );
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? 'Login failed');
      }
      const data = await res.json();
      const token = data.access_token;
      if (!token) throw new Error('No token');
      store.set('token', token);
      store.set('apiBaseUrl', baseUrl);
      loginWindow?.close();
      createTray();
      startCaptureLoop();
      return { ok: true };
    }
  );

  ipcMain.handle('logout', () => {
    store.delete('token');
  });
}

app.whenReady().then(() => {
  initIpc();

  const token = store.get('token');
  if (!token) {
    createLoginWindow();
    app.dock?.hide?.();
  } else {
    createTray();
    startCaptureLoop();
    if (process.platform === 'darwin') app.dock?.hide?.();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    if (store.get('token')) {
      createTray();
      createStatusWindow();
    } else {
      createLoginWindow();
    }
  }
});
