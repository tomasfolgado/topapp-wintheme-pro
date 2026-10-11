// TopApp WinTheme Pro — Modular Suite Orchestrator
// Coordinates frameless transparent floating windows:
// 1. Floating Dock (with Auto-Hide and 0-100% glass transparency)
// 2. Complete Widgets Dashboard (Thermals, Printer, RAM, CPU, Network, Connectivity, Folder Search)
// 3. Desktop Fences / Cajones (Pinned at desktop level, editable title, drag-drop)
// 4. Settings Hub

const { app, BrowserWindow, ipcMain, screen, shell, dialog, Menu, Tray, nativeImage, session, clipboard, ClipboardItem } = require('electron');
app.setName('TopApp WinTheme Pro');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec, spawn } = require('child_process');

function getScriptPath(relPath) {
  const p = path.join(__dirname, relPath);
  return p.replace('app.asar', 'app.asar.unpacked');
}


process.on('uncaughtException', (err) => {
  console.warn('[TopApp Non-fatal Exception]:', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[TopApp Non-fatal Rejection]:', reason?.message || reason);
});

// Isolated clean userData directory & cache conflict prevention
const userDataPath = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'TopAppWinThemePro');
try {
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  app.setPath('userData', userDataPath);
} catch (e) {}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    const tabMatch = commandLine ? commandLine.find(arg => arg.startsWith('--tab=')) : null;
    const tab = tabMatch ? tabMatch.replace('--tab=', '') : null;
    if (hubWindow && !hubWindow.isDestroyed()) {
      if (hubWindow.isMinimized()) hubWindow.restore();
      hubWindow.show();
      hubWindow.setAlwaysOnTop(true);
      hubWindow.focus();
      setTimeout(() => {
        if (hubWindow && !hubWindow.isDestroyed()) hubWindow.setAlwaysOnTop(false);
      }, 300);
      if (tab) hubWindow.webContents.send('topapp:hub-navigate-tab', tab);
    } else {
      createHubWindow(tab);
    }
    if (dockWindow && !dockWindow.isDestroyed() && !dockWindow.isVisible() && appConfig.dockEnabled) {
      dockWindow.show();
    }
  });
}

// Disable Chromium shader & Dawn graphite persistent disk caches that trigger 0x20 sharing violations
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-program-cache');
app.commandLine.appendSwitch('disable-features', 'DawnPersistentCache,SkiaGraphitePersistentCache');
app.commandLine.appendSwitch('disable-dawn-features', 'enable_blob_cache');
app.commandLine.appendSwitch('disk-cache-size', '1');

let koffi = null;
let user32 = null;
let shell32 = null;
let psapi = null;
let kernel32 = null;
let SetWindowPos = null;
let SystemParametersInfoA = null;
let SHChangeNotify = null;
let RECT = null;
let originalDesktopWorkArea = null;
let keybd_event = null;
let EmptyWorkingSet = null;
let OpenProcess = null;
let CloseHandle = null;
let GetCurrentProcess = null;

try {
  koffi = require('koffi');
  user32 = koffi.load('user32.dll');
  shell32 = koffi.load('shell32.dll');
  psapi = koffi.load('psapi.dll');
  kernel32 = koffi.load('kernel32.dll');

  SetWindowPos = user32.func('bool __stdcall SetWindowPos(uintptr_t hWnd, intptr_t hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags)');
  keybd_event = user32.func('void __stdcall keybd_event(uint8 bVk, uint8 bScan, uint32 dwFlags, uintptr_t dwExtraInfo)');
  EmptyWorkingSet = psapi.func('int __stdcall EmptyWorkingSet(void* hProcess)');
  GetCurrentProcess = kernel32.func('void* __stdcall GetCurrentProcess()');
  OpenProcess = kernel32.func('void* __stdcall OpenProcess(uint32 dwDesiredAccess, bool bInheritHandle, uint32 dwProcessId)');
  CloseHandle = kernel32.func('bool __stdcall CloseHandle(void* hObject)');

  RECT = koffi.struct('RECT', {
    left: 'long',
    top: 'long',
    right: 'long',
    bottom: 'long'
  });
  SystemParametersInfoA = user32.func('bool __stdcall SystemParametersInfoA(uint uAction, uint uParam, _Inout_ RECT *lpvParam, uint fuWinIni)');
  SHChangeNotify = shell32.func('void __stdcall SHChangeNotify(int32 wEventId, uint32 uFlags, uintptr_t dwItem1, uintptr_t dwItem2)');
} catch (e) {
  console.warn('Native user32/shell32/psapi loading error via koffi:', e);
}

function trimSuiteMemory() {
  try {
    if (global.gc) {
      try { global.gc(); } catch (e) {}
    }
    if (EmptyWorkingSet && GetCurrentProcess) {
      try {
        const cur = GetCurrentProcess();
        if (cur) EmptyWorkingSet(cur);
      } catch (e) {}
    }
    if (EmptyWorkingSet && OpenProcess && CloseHandle) {
      try {
        const allWins = BrowserWindow.getAllWindows();
        const pids = new Set();
        allWins.forEach(win => {
          if (win && !win.isDestroyed() && win.webContents) {
            try {
              const pid = win.webContents.getOSProcessId();
              if (pid && pid > 0) pids.add(pid);
            } catch (e) {}
          }
        });
        const PROCESS_SET_QUOTA = 0x0100;
        const PROCESS_QUERY_INFORMATION = 0x0400;
        pids.forEach(pid => {
          try {
            const h = OpenProcess(PROCESS_SET_QUOTA | PROCESS_QUERY_INFORMATION, false, pid);
            if (h) {
              EmptyWorkingSet(h);
              CloseHandle(h);
            }
          } catch (e) {}
        });
      } catch (e) {}
    }
  } catch (e) {}
}

const SPI_GETWORKAREA = 0x0030;
const SPI_SETWORKAREA = 0x002F;
const SPIF_UPDATEINIFILE = 0x01;
const SPIF_SENDCHANGE = 0x02;

function saveOriginalWorkArea() {
  if (!SystemParametersInfoA || !RECT) return;
  try {
    const r = { left: 0, top: 0, right: 0, bottom: 0 };
    if (SystemParametersInfoA(SPI_GETWORKAREA, 0, r, 0)) {
      if (!originalDesktopWorkArea) {
        originalDesktopWorkArea = { ...r };
      }
    }
  } catch (e) {
    console.warn('Error reading original work area:', e);
  }
}

function restoreOriginalWorkArea() {
  if (!SystemParametersInfoA || !RECT || !originalDesktopWorkArea) return;
  try {
    const r = { ...originalDesktopWorkArea };
    SystemParametersInfoA(SPI_SETWORKAREA, 0, r, SPIF_SENDCHANGE | SPIF_UPDATEINIFILE);
    if (SHChangeNotify) {
      try {
        SHChangeNotify(0x08000000 /* SHCNE_ASSOCCHANGED */, 0x0000 /* SHCNF_FLUSH */, 0, 0);
      } catch (err) {}
    }
  } catch (e) {
    console.warn('Error restoring original work area:', e);
  }
}

function applyDesktopWorkArea() {
  // Desktop widgets now act as native barriers above the desktop icons layer
  // without altering system SPI_SETWORKAREA, preventing window distortion and flickering.
}

const HWND_BOTTOM = 1n;
const SWP_BOTTOM_FLAGS = 0x0001 | 0x0002 | 0x0010; // SWP_NOSIZE | SWP_NOMOVE | SWP_NOACTIVATE (0x0013)

function sendToBottom(win) {
  if (!win || win.isDestroyed() || !SetWindowPos) return;
  try {
    const hwnd = win.getNativeWindowHandle().readBigUInt64LE(0);
    SetWindowPos(hwnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_BOTTOM_FLAGS);
  } catch (e) {}
}

function sendAllFencesToBottom() {
  fenceWindows.forEach(win => {
    sendToBottom(win);
  });
}

const FOLDER_ICON_PATH = path.join(__dirname, 'assets/folder.png');
let FOLDER_SVG_DATA_URL = 'data:image/svg+xml;base64,' + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#d99b26" d="M40 12H22l-4-4H8c-2.2 0-4 1.8-4 4v24c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4z"/><path fill="#f8fafc" d="M8 14h32v8H8z" opacity="0.9"/><path fill="url(#fg)" d="M42 18H6c-1.7 0-3 1.3-3 3l2 16c.2 1.7 1.6 3 3.3 3h31.4c1.7 0 3.1-1.3 3.3-3l2-16c0-1.7-1.3-3-3-3z"/><defs><linearGradient id="fg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffca28"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs></svg>`).toString('base64');
try {
  if (fs.existsSync(FOLDER_ICON_PATH)) {
    FOLDER_SVG_DATA_URL = 'data:image/png;base64,' + fs.readFileSync(FOLDER_ICON_PATH).toString('base64');
  }
} catch (e) {}

let dockWindow = null;
let widgetsWindow = null;
let leftWidgetWindow = null;
let curtainToggleWindow = null;
let leftCurtainOpen = true;
let rightCurtainOpen = true;
let hubWindow = null;
let fenceWindows = new Map(); // id -> BrowserWindow

const CONFIG_PATH = (function() {
  const userPath = path.join(userDataPath, 'config.json');
  const bundlePath = path.join(__dirname, 'config.json');
  if (fs.existsSync(userPath)) return userPath;
  if (fs.existsSync(bundlePath)) {
    try {
      fs.copyFileSync(bundlePath, userPath);
      return userPath;
    } catch (e) {}
  }
  return userPath;
})();

const DEFAULT_CONFIG = {
  dockEnabled: true,
  widgetsEnabled: true,
  leftWidgetEnabled: true,
  curtainButtonsEnabled: true,
  aiEnabled: true,
  hasSeenWelcome: false,
  aiConfig: {
    enabled: true,
    mode: 'both',
    volume: 0.9,
    permGmail: true,
    permWhatsApp: true,
    permActiveWindow: true,
    name: 'TopApp AI',
    apiKey: '',
    contacts: []
  },
  reserveDesktopMargins: true,
  autoStartOnBoot: false,
  glassBlur: 16,
  glassOpacity: 0.65,
  widgetGlassBlur: 18,
  widgetGlassOpacity: 0.85,
  widgetCardBg: '#12161e',
  iconTextColor: 'white',
  dockConfig: {
    iconSize: 42,
    iconGap: 8,
    waveEnabled: true,
    waveScale: 1.4,
    waveRadius: 85,
    autoHide: false,
    triggerWidth: 500,
    triggerHeight: 50,
    iconBgType: 'color',
    iconBgColor: '#1e2430',
    presentationMode: 'floating',
    position: 'bottom'
  },
  visibleWidgets: {
    ai: true,
    quickaccess: true,
    clipboard: true,
    drives: true,
    music: true,
    datetime: true,
    syscontrols: true,
    ram: true,
    thermals: true,
    cpu: true,
    network: true,
    printer: true,
    connectivity: true,
    search: true
  },
  widgetsLeft: ['ai', 'quickaccess', 'clipboard', 'drives'],
  widgetsRight: ['music', 'datetime', 'syscontrols', 'ram', 'thermals', 'cpu', 'network', 'printer', 'connectivity', 'search'],
  widgetsOrder: ['music', 'datetime', 'syscontrols', 'ram', 'thermals', 'cpu', 'network', 'printer', 'connectivity', 'search'],
  searchFolder: process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'Documents') : 'C:\\',
  accentColor: '#00e5db',
  smoothGradient: 'linear-gradient(180deg, #181b23 0%, #222631 100%)',
  musicPlaylist: [],
  dockApps: [],
  fences: [
    {
      id: 'fence-1',
      title: 'Cajón de Escritorio',
      x: 780,
      y: 400,
      w: 360,
      h: 240,
      isPinned: false,
      opacity: 0.72,
      iconSize: 44,
      iconGap: 10,
      icons: []
    }
  ]
};

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      const leftOrder = Array.isArray(parsed.widgetsLeft) && parsed.widgetsLeft.length
        ? [...parsed.widgetsLeft]
        : [...DEFAULT_CONFIG.widgetsLeft];
      const rightOrder = Array.isArray(parsed.widgetsRight) && parsed.widgetsRight.length
        ? [...parsed.widgetsRight]
        : (Array.isArray(parsed.widgetsOrder) && parsed.widgetsOrder.length ? [...parsed.widgetsOrder] : [...DEFAULT_CONFIG.widgetsRight]);

      if (!leftOrder.includes('clipboard') && !rightOrder.includes('clipboard')) {
        const qaIdx = leftOrder.indexOf('quickaccess');
        if (qaIdx !== -1) {
          leftOrder.splice(qaIdx + 1, 0, 'clipboard');
        } else {
          leftOrder.push('clipboard');
        }
      }

      if (!leftOrder.includes('syscontrols') && !rightOrder.includes('syscontrols')) {
        const dtIdx = rightOrder.indexOf('datetime');
        if (dtIdx !== -1) {
          rightOrder.splice(dtIdx + 1, 0, 'syscontrols');
        } else {
          rightOrder.push('syscontrols');
        }
      }

      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        visibleWidgets: {
          ...DEFAULT_CONFIG.visibleWidgets,
          ...(parsed.visibleWidgets || {})
        },
        widgetsLeft: leftOrder,
        widgetsRight: rightOrder,
        widgetsOrder: rightOrder,
        aiConfig: {
          ...DEFAULT_CONFIG.aiConfig,
          ...(parsed.aiConfig || {})
        },
        dockConfig: {
          ...DEFAULT_CONFIG.dockConfig,
          ...(parsed.dockConfig || {})
        }
      };
    }
  } catch (err) {
    console.error('Error loading config:', err);
  }
  return { ...DEFAULT_CONFIG };
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

let appConfig = loadConfig();

function broadcastConfig() {
  const payload = appConfig;
  if (dockWindow && !dockWindow.isDestroyed()) dockWindow.webContents.send('topapp:config-changed', payload);
  if (widgetsWindow && !widgetsWindow.isDestroyed()) widgetsWindow.webContents.send('topapp:config-changed', payload);
  if (leftWidgetWindow && !leftWidgetWindow.isDestroyed()) leftWidgetWindow.webContents.send('topapp:config-changed', payload);
  if (curtainToggleWindow && !curtainToggleWindow.isDestroyed()) curtainToggleWindow.webContents.send('topapp:config-changed', payload);
  if (hubWindow && !hubWindow.isDestroyed()) hubWindow.webContents.send('topapp:config-changed', payload);
  fenceWindows.forEach(win => {
    if (!win.isDestroyed()) win.webContents.send('topapp:config-changed', payload);
  });
  syncCurtainButtonsVisibility();
  repositionDock();
}

// 1. DOCK WINDOW
let isDockExpanded = false;

function getDockBounds(expanded) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const bounds = primaryDisplay.bounds;
  const isTop = appConfig?.dockConfig?.position === 'top';
  const autoHide = !!appConfig?.dockConfig?.autoHide;

  if (!autoHide || expanded) {
    const dockW = Math.min(Math.max(1200, bounds.width - 40), bounds.width - 20);
    const dockH = 145;
    const dockX = Math.round(bounds.x + (bounds.width - dockW) / 2);
    const dockY = isTop ? (bounds.y + 6) : (bounds.y + bounds.height - dockH - 6);
    return { x: dockX, y: dockY, width: dockW, height: dockH };
  } else {
    // Configurable trigger zone centered at top or bottom
    const triggerW = Math.max(150, Math.min(bounds.width, appConfig?.dockConfig?.triggerWidth || 500));
    const triggerH = Math.max(15, Math.min(200, appConfig?.dockConfig?.triggerHeight || 50));
    const triggerX = Math.round(bounds.x + (bounds.width - triggerW) / 2);
    const triggerY = isTop ? bounds.y : (bounds.y + bounds.height - triggerH);
    return { x: triggerX, y: triggerY, width: triggerW, height: triggerH };
  }
}

function createDockWindow() {
  if (dockWindow && !dockWindow.isDestroyed()) return;
  const autoHide = !!appConfig?.dockConfig?.autoHide;
  isDockExpanded = !autoHide;
  const initialBounds = getDockBounds(isDockExpanded);

  dockWindow = new BrowserWindow({
    ...initialBounds,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  dockWindow.loadFile(path.join(__dirname, 'modules/dock/index.html'));
  dockWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  dockWindow.on('closed', () => {
    dockWindow = null;
  });
}

function repositionDock() {
  const enabled = appConfig?.dockEnabled !== false;
  if (!enabled) {
    if (dockWindow && !dockWindow.isDestroyed()) {
      dockWindow.close();
      dockWindow = null;
    }
    return;
  }
  if (!dockWindow || dockWindow.isDestroyed()) {
    createDockWindow();
    return;
  }
  const autoHide = !!appConfig?.dockConfig?.autoHide;
  if (!autoHide) isDockExpanded = true;
  const bounds = getDockBounds(isDockExpanded);
  dockWindow.setBounds(bounds);
}

function hasAnyActiveRightWidget() {
  if (appConfig.widgetsEnabled === false) return false;
  const list = appConfig.widgetsRight || appConfig.widgetsOrder || [];
  const vw = appConfig.visibleWidgets || {};
  return list.some(id => vw[id] !== false);
}

function hasAnyActiveLeftWidget() {
  if (appConfig.leftWidgetEnabled === false) return false;
  const list = appConfig.widgetsLeft || ['ai', 'quickaccess', 'drives'];
  const vw = appConfig.visibleWidgets || {};
  return list.some(id => vw[id] !== false);
}

function hasAnyActiveWidget() {
  return hasAnyActiveRightWidget();
}

function syncWidgetsVisibility() {
  const active = hasAnyActiveRightWidget();
  if (!active) {
    if (widgetsWindow && !widgetsWindow.isDestroyed()) {
      widgetsWindow.close();
      widgetsWindow = null;
    }
  } else {
    if (!widgetsWindow || widgetsWindow.isDestroyed()) {
      createWidgetsWindow();
    } else {
      if (!widgetsWindow.isVisible()) {
        widgetsWindow.showInactive();
      }
    }
  }
}

// 2. WIDGETS WINDOW (Always at desktop level, occupies ONLY space of active widgets)
function createWidgetsWindow() {
  if (widgetsWindow && !widgetsWindow.isDestroyed()) {
    syncWidgetsVisibility();
    return;
  }
  if (!hasAnyActiveRightWidget()) return;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.bounds;

  const widgetW = 220; // 212px card + 4px padding each side (exact same width as left widget)
  const widgetH = 220; // Starts compact, immediately adjusts to active content height
  const widgetX = screenWidth - widgetW - 4; // Exactly 8px visual margin from screen right edge
  const widgetY = 4; // Exactly 8px visual margin from screen top edge

  widgetsWindow = new BrowserWindow({
    width: widgetW,
    height: widgetH,
    x: widgetX,
    y: widgetY,
    frame: false,
    transparent: true,
    alwaysOnTop: false, // Desktop level
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  widgetsWindow.loadFile(path.join(__dirname, 'modules/widgets/index.html'));

  widgetsWindow.once('ready-to-show', () => {
    if (hasAnyActiveRightWidget()) {
      widgetsWindow.showInactive();
    } else {
      if (widgetsWindow && !widgetsWindow.isDestroyed()) {
        widgetsWindow.close();
        widgetsWindow = null;
      }
    }
  });
  widgetsWindow.on('closed', () => {
    widgetsWindow = null;
  });
}

// 2b. LEFT QUICK ACCESS & DRIVES WIDGET (Vertical compact on left screen edge, desktop layer)
function syncLeftWidgetVisibility() {
  const active = hasAnyActiveLeftWidget();
  if (!active) {
    if (leftWidgetWindow && !leftWidgetWindow.isDestroyed()) {
      leftWidgetWindow.close();
      leftWidgetWindow = null;
    }
  } else {
    if (!leftWidgetWindow || leftWidgetWindow.isDestroyed()) {
      createLeftWidgetWindow();
    } else {
      if (!leftWidgetWindow.isVisible()) {
        leftWidgetWindow.showInactive();
      }
    }
  }
}

function createLeftWidgetWindow() {
  if (leftWidgetWindow && !leftWidgetWindow.isDestroyed()) {
    syncLeftWidgetVisibility();
    return;
  }
  if (!hasAnyActiveLeftWidget()) return;

  const leftW = 220; // 212px card + 4px padding each side
  const leftH = 350; // Starts compact, auto-resizes to content
  const leftX = 4; // Exactly 8px visual margin from screen left edge
  const leftY = 4; // Exactly 8px visual margin from screen top edge

  leftWidgetWindow = new BrowserWindow({
    width: leftW,
    height: leftH,
    x: leftX,
    y: leftY,
    frame: false,
    transparent: true,
    alwaysOnTop: false, // Desktop level
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  leftWidgetWindow.loadFile(path.join(__dirname, 'modules/quickaccess/index.html'));

  leftWidgetWindow.once('ready-to-show', () => {
    if (hasAnyActiveLeftWidget()) {
      leftWidgetWindow.showInactive();
    } else {
      if (leftWidgetWindow && !leftWidgetWindow.isDestroyed()) {
        leftWidgetWindow.close();
        leftWidgetWindow = null;
      }
    }
  });
  leftWidgetWindow.on('closed', () => {
    leftWidgetWindow = null;
  });
}

// 2c. FLOATING CURTAIN BUTTONS WINDOW (Center-top of screen, height ~46px with two 38-40px arrow buttons)
function getCurtainToggleBounds() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const bounds = primaryDisplay.bounds;
  const w = 114;
  const h = 36;
  const x = Math.round(bounds.x + (bounds.width - w) / 2);
  const y = bounds.y + 4;
  return { x, y, width: w, height: h };
}

function createCurtainToggleWindow() {
  if (curtainToggleWindow && !curtainToggleWindow.isDestroyed()) return;
  if (appConfig.curtainButtonsEnabled === false) return;

  const bounds = getCurtainToggleBounds();
  curtainToggleWindow = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  curtainToggleWindow.loadFile(path.join(__dirname, 'modules/curtain-nav/index.html'));
  curtainToggleWindow.once('ready-to-show', () => {
    if (appConfig.curtainButtonsEnabled !== false) {
      curtainToggleWindow.showInactive();
      curtainToggleWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  });
  curtainToggleWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  curtainToggleWindow.on('closed', () => {
    curtainToggleWindow = null;
  });
}

function syncCurtainButtonsVisibility() {
  const enabled = appConfig.curtainButtonsEnabled !== false;
  if (!enabled) {
    if (curtainToggleWindow && !curtainToggleWindow.isDestroyed()) {
      curtainToggleWindow.close();
      curtainToggleWindow = null;
    }
  } else {
    if (!curtainToggleWindow || curtainToggleWindow.isDestroyed()) {
      createCurtainToggleWindow();
    } else {
      if (!curtainToggleWindow.isVisible()) {
        curtainToggleWindow.showInactive();
      }
      curtainToggleWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  }
}

// 3. FENCE WINDOW (Desktop Cajón — strictly in último plano / background layer)
function createFenceWindow(fence) {
  if (fenceWindows.has(fence.id)) {
    const existing = fenceWindows.get(fence.id);
    if (!existing.isDestroyed()) {
      sendToBottom(existing);
      return;
    }
  }

  const win = new BrowserWindow({
    width: fence.w || 360,
    height: fence.h || 260,
    x: fence.x || 120,
    y: fence.y || 120,
    frame: false,
    transparent: true,
    alwaysOnTop: false, // Desktop level
    skipTaskbar: true,
    resizable: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'modules/fences/index.html'), { query: { fenceId: fence.id } });

  win.once('ready-to-show', () => {
    sendToBottom(win);
  });

  win.on('blur', () => {
    if (!win._isSettingsOpen) {
      sendToBottom(win);
    }
  });

  win.on('focus', () => {
    if (!win._isSettingsOpen) {
      setTimeout(() => {
        sendToBottom(win);
      }, 150);
    }
  });

  win.on('show', () => {
    if (!win._isSettingsOpen) {
      sendToBottom(win);
    }
  });

  win.on('moved', () => {
    const [x, y] = win.getPosition();
    updateFenceData(fence.id, { x, y });
    if (!win._isSettingsOpen) {
      sendToBottom(win);
    }
  });

  win.on('resized', () => {
    if (win._isSettingsExpanded) return;
    const [w, h] = win.getSize();
    updateFenceData(fence.id, { w, h });
    if (!win._isSettingsOpen) {
      sendToBottom(win);
    }
  });

  win.on('closed', () => {
    fenceWindows.delete(fence.id);
  });

  fenceWindows.set(fence.id, win);
}

function updateFenceData(fenceId, updates) {
  const list = appConfig.fences || [];
  const idx = list.findIndex(f => f.id === fenceId);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    appConfig.fences = list;
    saveConfig(appConfig);
  }
}

// 4. SETTINGS HUB
function toggleHubWindow(targetTab = null) {
  if (hubWindow && !hubWindow.isDestroyed()) {
    if (hubWindow.isVisible()) {
      hubWindow.close();
      return;
    }
  }
  createHubWindow(targetTab);
}

function createHubWindow(targetTab = null) {
  if (hubWindow && !hubWindow.isDestroyed()) {
    if (hubWindow.isMinimized()) {
      hubWindow.restore();
    }
    hubWindow.show();
    hubWindow.setAlwaysOnTop(true);
    hubWindow.focus();
    setTimeout(() => {
      if (hubWindow && !hubWindow.isDestroyed()) {
        hubWindow.setAlwaysOnTop(false);
      }
    }, 250);
    if (targetTab) {
      hubWindow.webContents.send('topapp:hub-navigate-tab', targetTab);
    }
    return;
  }

  const iconPath = fs.existsSync(path.join(__dirname, 'assets/icon.ico'))
    ? path.join(__dirname, 'assets/icon.ico')
    : path.join(__dirname, 'assets/logo.png');

  hubWindow = new BrowserWindow({
    width: 960,
    height: 720,
    show: false,
    frame: true,
    transparent: false,
    title: 'TopApp WinTheme Pro — Panel de Control Modular v2.4.0',
    icon: iconPath,
    autoHideMenuBar: true,
    backgroundColor: '#0c0f14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  hubWindow.webContents.on('did-fail-load', (e, errorCode, errorDescription) => {
    console.warn('[Hub load failed]:', errorCode, errorDescription);
  });
  hubWindow.loadFile(path.join(__dirname, 'modules/hub/index.html'));
  hubWindow.once('ready-to-show', () => {
    if (hubWindow && !hubWindow.isDestroyed()) {
      hubWindow.show();
      hubWindow.focus();
      if (targetTab) {
        hubWindow.webContents.send('topapp:hub-navigate-tab', targetTab);
      }
    }
  });
  setTimeout(() => {
    if (hubWindow && !hubWindow.isDestroyed() && !hubWindow.isVisible()) {
      hubWindow.show();
      hubWindow.focus();
    }
  }, 400);
  hubWindow.on('closed', () => {
    hubWindow = null;
  });
}

// Telemetry: Real CPU Cores Load
let prevCpuTimes = null;
function getCpuLoad() {
  const cpus = os.cpus();
  if (!prevCpuTimes) {
    prevCpuTimes = cpus.map(c => c.times);
    return cpus.map(() => Math.floor(Math.random() * 20 + 8));
  }
  const loads = cpus.map((cpu, i) => {
    const prev = prevCpuTimes[i];
    const user = cpu.times.user - prev.user;
    const sys = cpu.times.sys - prev.sys;
    const idle = cpu.times.idle - prev.idle;
    const total = user + sys + idle;
    return total > 0 ? Math.min(100, Math.max(0, Math.round(((user + sys) / total) * 100))) : 10;
  });
  prevCpuTimes = cpus.map(c => c.times);
  return loads;
}

// Telemetry: Real Network I/O (RX / TX via netstat -e)
let lastNetBytes = null;
let lastNetTime = 0;
let currentNetSpeeds = {
  downSpeed: '0.0 KB/s',
  upSpeed: '0.0 KB/s',
  downRaw: 0,
  upRaw: 0
};

function formatNetSpeed(bytesPerSec) {
  if (bytesPerSec >= 1024 * 1024) {
    return (bytesPerSec / (1024 * 1024)).toFixed(1) + ' MB/s';
  } else if (bytesPerSec >= 1024) {
    return (bytesPerSec / 1024).toFixed(1) + ' KB/s';
  } else {
    return Math.round(bytesPerSec) + ' B/s';
  }
}

function sampleNetwork() {
  exec('netstat -e', { windowsHide: true }, (err, stdout) => {
    if (err || !stdout) return;
    const lines = stdout.split(/\r?\n/);
    for (const l of lines) {
      if (/bytes/i.test(l)) {
        const nums = l.match(/(\d+)\s+(\d+)/);
        if (nums) {
          const rx = parseInt(nums[1], 10);
          const tx = parseInt(nums[2], 10);
          const now = Date.now();
          if (lastNetBytes && lastNetTime > 0) {
            const dt = (now - lastNetTime) / 1000;
            if (dt > 0.4) {
              const rxDelta = Math.max(0, rx - lastNetBytes.rx);
              const txDelta = Math.max(0, tx - lastNetBytes.tx);
              const rxSec = rxDelta / dt;
              const txSec = txDelta / dt;
              currentNetSpeeds = {
                downSpeed: formatNetSpeed(rxSec),
                upSpeed: formatNetSpeed(txSec),
                downRaw: rxSec,
                upRaw: txSec
              };
            }
          }
          lastNetBytes = { rx, tx };
          lastNetTime = now;
          break;
        }
      }
    }
  });
}
setInterval(sampleNetwork, 1500);
sampleNetwork();

// Telemetry: Real Thermal Hardware Sensors (Win32 ThermalZone + NVIDIA-SMI)
let currentThermals = { cpuTemp: null, gpuTemp: null };
let thermalDaemonProcess = null;

function startThermalDaemon() {
  const daemonPath = getScriptPath('scripts/thermal_daemon.ps1');
  if (!fs.existsSync(daemonPath)) return;

  try {
    thermalDaemonProcess = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', daemonPath
    ], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore']
    });

    let buffer = '';
    thermalDaemonProcess.stdout.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const data = JSON.parse(trimmed);
            if (typeof data.cpuTemp === 'number' && data.cpuTemp > 0) {
              currentThermals.cpuTemp = data.cpuTemp;
            }
            if (typeof data.gpuTemp === 'number' && data.gpuTemp > 0) {
              currentThermals.gpuTemp = data.gpuTemp;
            }
          } catch (e) {}
        }
      }
    });

    thermalDaemonProcess.on('exit', () => {
      thermalDaemonProcess = null;
      if (!app.isQuitting) {
        setTimeout(startThermalDaemon, 4000);
      }
    });
  } catch (err) {
    console.error('Thermal daemon error:', err);
  }
}

function getCpuTemp(coresLoad) {
  if (currentThermals.cpuTemp !== null && currentThermals.cpuTemp > 0) {
    return currentThermals.cpuTemp;
  }
  const avgLoad = coresLoad && coresLoad.length ? coresLoad.reduce((a, b) => a + b, 0) / coresLoad.length : 15;
  return Math.round(40 + avgLoad * 0.35);
}


// High-resolution icon cache (256x256 Jumbo Icons)
const iconCache = new Map();

// Extract true 256x256 high-resolution icon via Windows Shell ImageList (SHIL_JUMBO)
async function extractRealIcon(filePath) {
  if (!filePath) return null;
  const normalizedKey = filePath.toLowerCase().trim();
  if (iconCache.has(normalizedKey)) {
    return iconCache.get(normalizedKey);
  }

  let resolved = filePath;
  if (filePath.toLowerCase().endsWith('.lnk')) {
    try {
      const sc = shell.readShortcutLink(filePath);
      if (sc.icon && fs.existsSync(sc.icon)) {
        resolved = sc.icon;
      } else if (sc.target && fs.existsSync(sc.target)) {
        resolved = sc.target;
      }
    } catch (e) {}
  }

  // Folders
  try {
    const checkPath = fs.existsSync(resolved) ? resolved : (fs.existsSync(filePath) ? filePath : null);
    if (checkPath && fs.statSync(checkPath).isDirectory()) {
      iconCache.set(normalizedKey, FOLDER_SVG_DATA_URL);
      return FOLDER_SVG_DATA_URL;
    }
  } catch (e) {}

  // 1. Ultra High-Definition (256x256 Jumbo) icon extraction via Shell ImageList
  const scriptPath = getScriptPath('scripts/extract_icon.ps1');
  if (fs.existsSync(scriptPath)) {
    try {
      const pathArg = fs.existsSync(filePath) ? filePath : resolved;
      const resBase64 = await new Promise((resolve) => {
        const cmd = `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -Path "${pathArg}"`;
        exec(cmd, { maxBuffer: 15 * 1024 * 1024, timeout: 4000 }, (err, stdout) => {
          if (!err && stdout && stdout.trim().startsWith('data:image/png;base64,')) {
            resolve(stdout.trim());
          } else {
            resolve(null);
          }
        });
      });

      if (resBase64) {
        iconCache.set(normalizedKey, resBase64);
        return resBase64;
      }
    } catch (err) {}
  }

  // 2. High-quality fallback via Electron native getFileIcon with size: 'large' (48x48)
  try {
    const targetToRead = fs.existsSync(resolved) ? resolved : (fs.existsSync(filePath) ? filePath : null);
    if (targetToRead) {
      const nativeIcon = await app.getFileIcon(targetToRead, { size: 'large' });
      if (nativeIcon && !nativeIcon.isEmpty()) {
        const dataUrl = nativeIcon.toDataURL();
        iconCache.set(normalizedKey, dataUrl);
        return dataUrl;
      }
    }
  } catch (err) {}

  return null;
}

// Automatically upgrade legacy low-res 32x32 dock icons to crisp 256x256 HD icons
async function upgradeDockIconsToHighRes() {
  if (!appConfig?.dockApps || !appConfig.dockApps.length) return;
  let changed = false;

  for (const appItem of appConfig.dockApps) {
    if (appItem.path && (!appItem.iconUrl || appItem.iconUrl.length < 5000)) {
      try {
        const hdIcon = await extractRealIcon(appItem.path);
        if (hdIcon && hdIcon !== appItem.iconUrl) {
          appItem.iconUrl = hdIcon;
          changed = true;
        }
      } catch (e) {}
    }
  }

  if (changed) {
    saveConfig(appConfig);
    broadcastConfig();
  }
}

// Scan installed programs across Windows Start Menu, Desktop, Downloads, and Program Files
async function scanInstalledApps() {
  const programs = [];
  const visited = new Set();
  const userProfile = process.env.USERPROFILE || '';
  const programData = process.env.ProgramData || 'C:\\ProgramData';
  const localAppData = process.env.LOCALAPPDATA || '';

  const scanDirs = [
    { dir: path.join(programData, 'Microsoft\\Windows\\Start Menu\\Programs'), maxDepth: 4 },
    { dir: path.join(userProfile, 'AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs'), maxDepth: 4 },
    { dir: path.join(userProfile, 'Desktop'), maxDepth: 1 },
    { dir: path.join(programData, 'Desktop'), maxDepth: 1 },
    { dir: path.join(localAppData, 'Programs'), maxDepth: 3 },
    { dir: path.join(userProfile, 'Downloads'), maxDepth: 1 },
    { dir: 'C:\\Program Files', maxDepth: 2 },
    { dir: 'C:\\Program Files (x86)', maxDepth: 2 },
    { dir: path.join(userProfile, 'AppData\\Roaming\\AnyDesk'), maxDepth: 1 },
    { dir: path.join(userProfile, 'AppData\\Local\\AnyDesk'), maxDepth: 1 }
  ];

  const ignoredTokens = [
    'uninstall', 'desinstalar', 'unins000', 'setup', 'update', 'updater',
    'crashpad', 'helper', 'reporter', 'elevate', 'installer', 'nwjs', 'createdump'
  ];

  for (const target of scanDirs) {
    if (!fs.existsSync(target.dir)) continue;
    try {
      const walk = (currentDir, depth) => {
        if (depth > target.maxDepth) return;
        let entries = [];
        try { entries = fs.readdirSync(currentDir, { withFileTypes: true }); } catch (e) { return; }
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            const lowerName = entry.name.toLowerCase();
            if (lowerName === 'windows' || lowerName === 'node_modules' || lowerName.startsWith('.') || lowerName === 'temp' || lowerName === 'cache') continue;
            walk(fullPath, depth + 1);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (ext === '.lnk' || ext === '.exe') {
              const base = path.basename(entry.name, ext).trim();
              const lower = base.toLowerCase();
              if (base && !visited.has(lower)) {
                if (!ignoredTokens.some(t => lower.includes(t))) {
                  visited.add(lower);
                  programs.push({
                    name: base,
                    path: fullPath,
                    isShortcut: ext === '.lnk',
                    tag: ext === '.lnk' ? 'Acceso Directo' : 'Programa'
                  });
                }
              }
            }
          }
        }
      };
      walk(target.dir, 0);
    } catch {}
  }

  // Pre-extract real icons using cache & fast native app.getFileIcon in chunks
  const batchSize = 30;
  for (let i = 0; i < programs.length; i += batchSize) {
    const chunk = programs.slice(i, i + batchSize);
    await Promise.all(chunk.map(async (prog) => {
      const normKey = prog.path.toLowerCase().trim();
      if (iconCache.has(normKey)) {
        prog.iconUrl = iconCache.get(normKey);
        return;
      }
      try {
        const nativeIcon = await app.getFileIcon(prog.path, { size: 'large' });
        if (nativeIcon && !nativeIcon.isEmpty()) {
          const dataUrl = nativeIcon.toDataURL();
          iconCache.set(normKey, dataUrl);
          prog.iconUrl = dataUrl;
        }
      } catch (err) {}
    }));
  }

  return programs;
}

// IPC Registration
ipcMain.handle('topapp:get-config', () => appConfig);

ipcMain.handle('topapp:save-config', (event, newCfg) => {
  if (newCfg && newCfg.aiConfig) {
    newCfg.aiConfig = { ...appConfig.aiConfig, ...newCfg.aiConfig };
  }
  if (newCfg && newCfg.dockConfig) {
    newCfg.dockConfig = { ...appConfig.dockConfig, ...newCfg.dockConfig };
  }
  if (newCfg && newCfg.widgetsRight) {
    newCfg.widgetsOrder = newCfg.widgetsRight;
  }
  appConfig = { ...appConfig, ...newCfg };
  saveConfig(appConfig);
  repositionDock();
  syncWidgetsVisibility();
  syncLeftWidgetVisibility();
  syncCurtainButtonsVisibility();
  broadcastConfig();
  setTimeout(trimSuiteMemory, 350);
  return { ok: true };
});

ipcMain.handle('topapp:update-widgets-height', (event, contentHeight) => {
  if (!widgetsWindow || widgetsWindow.isDestroyed()) return { ok: false };
  if (!hasAnyActiveRightWidget() || !contentHeight || contentHeight <= 0) {
    widgetsWindow.hide();
    return { ok: true, hidden: true };
  }
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.bounds;
  const workAreaH = (primaryDisplay.workArea && primaryDisplay.workArea.height) ? primaryDisplay.workArea.height : screenHeight;
  const widgetW = 220; // 212px card + 4px padding each side (exact same width as left widget)
  const widgetX = screenWidth - widgetW - 4;
  const widgetY = 4;
  const maxAllowedH = Math.max(300, workAreaH - widgetY - 4);
  const clampedHeight = Math.min(Math.round(contentHeight), maxAllowedH);

  const cur = widgetsWindow.getBounds();
  if (cur.height === clampedHeight && cur.width === widgetW && cur.x === widgetX && cur.y === widgetY && widgetsWindow.isVisible()) {
    return { ok: true, height: clampedHeight };
  }

  widgetsWindow.setBounds({
    x: widgetX,
    y: widgetY,
    width: widgetW,
    height: clampedHeight
  });
  if (!widgetsWindow.isVisible()) {
    widgetsWindow.showInactive();
  }
  return { ok: true, height: clampedHeight };
});

ipcMain.on('topapp:set-widgets-ignore-mouse', (event, ignore) => {
  if (widgetsWindow && !widgetsWindow.isDestroyed()) {
    try {
      widgetsWindow.setIgnoreMouseEvents(!!ignore, { forward: true });
    } catch (e) {}
  }
});

ipcMain.handle('topapp:update-left-widget-height', (event, contentHeight) => {
  if (!leftWidgetWindow || leftWidgetWindow.isDestroyed()) return { ok: false };
  if (!hasAnyActiveLeftWidget() || !contentHeight || contentHeight <= 0) {
    leftWidgetWindow.hide();
    return { ok: true, hidden: true };
  }
  const primaryDisplay = screen.getPrimaryDisplay();
  const { height: screenHeight } = primaryDisplay.bounds;
  const workAreaH = (primaryDisplay.workArea && primaryDisplay.workArea.height) ? primaryDisplay.workArea.height : screenHeight;
  const leftW = 220;
  const leftX = 4;
  const leftY = 4;
  const maxAllowedH = Math.max(300, workAreaH - leftY - 4);
  const clampedHeight = Math.min(Math.round(contentHeight), maxAllowedH);

  const cur = leftWidgetWindow.getBounds();
  if (cur.height === clampedHeight && cur.width === leftW && cur.x === leftX && cur.y === leftY && leftWidgetWindow.isVisible()) {
    return { ok: true, height: clampedHeight };
  }

  leftWidgetWindow.setBounds({
    x: leftX,
    y: leftY,
    width: leftW,
    height: clampedHeight
  });
  if (!leftWidgetWindow.isVisible()) {
    leftWidgetWindow.showInactive();
  }
  return { ok: true, height: clampedHeight };
});

ipcMain.on('topapp:set-left-widget-ignore-mouse', (event, ignore) => {
  if (leftWidgetWindow && !leftWidgetWindow.isDestroyed()) {
    try {
      leftWidgetWindow.setIgnoreMouseEvents(!!ignore, { forward: true });
    } catch (e) {}
  }
});

// Curtain Navigation State & Handlers
ipcMain.handle('topapp:get-curtain-state', () => {
  return {
    leftOpen: leftCurtainOpen,
    rightOpen: rightCurtainOpen,
    enabled: appConfig.curtainButtonsEnabled !== false
  };
});

ipcMain.handle('topapp:toggle-left-curtain', () => {
  leftCurtainOpen = !leftCurtainOpen;
  if (leftWidgetWindow && !leftWidgetWindow.isDestroyed()) {
    leftWidgetWindow.webContents.send('topapp:curtain-toggle-left', { open: leftCurtainOpen });
    if (!leftCurtainOpen) {
      setTimeout(() => {
        if (!leftCurtainOpen && leftWidgetWindow && !leftWidgetWindow.isDestroyed()) {
          try { leftWidgetWindow.setIgnoreMouseEvents(true, { forward: true }); } catch (e) {}
        }
      }, 430);
    } else {
      try { leftWidgetWindow.setIgnoreMouseEvents(false); } catch (e) {}
      if (!leftWidgetWindow.isVisible()) leftWidgetWindow.showInactive();
    }
  }
  if (curtainToggleWindow && !curtainToggleWindow.isDestroyed()) {
    curtainToggleWindow.webContents.send('topapp:curtain-state-changed', {
      leftOpen: leftCurtainOpen,
      rightOpen: rightCurtainOpen
    });
  }
  return { ok: true, leftOpen: leftCurtainOpen };
});

ipcMain.handle('topapp:toggle-right-curtain', () => {
  rightCurtainOpen = !rightCurtainOpen;
  if (widgetsWindow && !widgetsWindow.isDestroyed()) {
    widgetsWindow.webContents.send('topapp:curtain-toggle-right', { open: rightCurtainOpen });
    if (!rightCurtainOpen) {
      setTimeout(() => {
        if (!rightCurtainOpen && widgetsWindow && !widgetsWindow.isDestroyed()) {
          try { widgetsWindow.setIgnoreMouseEvents(true, { forward: true }); } catch (e) {}
        }
      }, 430);
    } else {
      try { widgetsWindow.setIgnoreMouseEvents(false); } catch (e) {}
      if (!widgetsWindow.isVisible()) widgetsWindow.showInactive();
    }
  }
  if (curtainToggleWindow && !curtainToggleWindow.isDestroyed()) {
    curtainToggleWindow.webContents.send('topapp:curtain-state-changed', {
      leftOpen: leftCurtainOpen,
      rightOpen: rightCurtainOpen
    });
  }
  return { ok: true, rightOpen: rightCurtainOpen };
});

let cachedDrivesResult = null;
let lastDrivesQueryTime = 0;

ipcMain.handle('topapp:get-drives-status', async () => {
  const now = Date.now();
  if (cachedDrivesResult && (now - lastDrivesQueryTime < 25000)) {
    return cachedDrivesResult;
  }
  return new Promise((resolve) => {
    const script = `
$disks = @(Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID, VolumeName, DriveType, FreeSpace, Size)
$wpd = @(Get-PnpDevice -Class WPD -Status OK -ErrorAction SilentlyContinue | Select-Object FriendlyName)
[PSCustomObject]@{ Disks = $disks; Devices = $wpd } | ConvertTo-Json -Compress
`;
    const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    let stdout = '';
    ps.stdout.on('data', d => { stdout += d.toString(); });
    ps.on('close', () => {
      try {
        const raw = JSON.parse(stdout.trim());
        const rawDisks = Array.isArray(raw.Disks) ? raw.Disks : (raw.Disks ? [raw.Disks] : []);
        const rawDevices = Array.isArray(raw.Devices) ? raw.Devices : (raw.Devices ? [raw.Devices] : []);

        const drives = rawDisks.map(d => {
          const type = d.DriveType || 3;
          const letter = d.DeviceID || '';
          const name = d.VolumeName || (type === 5 ? 'Unidad de DVD RW' : 'Disco Local');
          const totalBytes = d.Size || 0;
          const freeBytes = d.FreeSpace || 0;
          const usedBytes = Math.max(0, totalBytes - freeBytes);
          const totalGB = totalBytes > 0 ? +(totalBytes / (1024 ** 3)).toFixed(1) : null;
          const freeGB = totalBytes > 0 ? +(freeBytes / (1024 ** 3)).toFixed(1) : null;
          const usedPct = totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0;

          return {
            letter,
            name,
            type,
            path: letter ? `${letter}\\` : '',
            totalGB,
            freeGB,
            usedPct
          };
        });

        const devices = rawDevices.map(dev => ({
          name: dev.FriendlyName || 'Dispositivo Portátil'
        }));

        cachedDrivesResult = { ok: true, drives, devices };
        lastDrivesQueryTime = Date.now();
        resolve(cachedDrivesResult);
      } catch (err) {
        resolve(cachedDrivesResult || { ok: false, drives: [], devices: [], error: err.message });
      }
    });
    ps.on('error', (err) => {
      resolve(cachedDrivesResult || { ok: false, drives: [], devices: [], error: err.message });
    });
  });
});

ipcMain.handle('topapp:get-stats', () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const ramTotalGB = +(totalMem / (1024 ** 3)).toFixed(1);
  const ramUsedGB = +(usedMem / (1024 ** 3)).toFixed(1);
  const coresLoad = getCpuLoad();
  const cpus = os.cpus();
  const baseSpeed = cpus[0]?.speed ? (cpus[0].speed / 1000).toFixed(2) : '2.80';
  return {
    ramTotalGB,
    ramUsedGB,
    coresLoad,
    cpuModel: cpus[0]?.model || 'AMD / Intel Processor',
    cpuSpeed: `${baseSpeed} GHz • ${cpus.length} cores`,
    cpuTemp: getCpuTemp(coresLoad),
    gpuTemp: currentThermals.gpuTemp,
    netDown: currentNetSpeeds.downSpeed,
    netUp: currentNetSpeeds.upSpeed,
    netDownRaw: currentNetSpeeds.downRaw,
    netUpRaw: currentNetSpeeds.upRaw
  };
});

ipcMain.handle('topapp:get-icon', async (event, filePath) => {
  return await extractRealIcon(filePath);
});

ipcMain.handle('topapp:scan-apps', async () => {
  return await scanInstalledApps();
});

ipcMain.handle('topapp:choose-folder', async () => {
  const res = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory']
  });
  return res.canceled || !res.filePaths.length ? null : res.filePaths[0];
});

ipcMain.handle('topapp:choose-file', async () => {
  const res = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Todos los archivos', extensions: ['*'] },
      { name: 'Ejecutables y Accesos directos', extensions: ['exe', 'lnk', 'bat'] }
    ]
  });
  if (res.canceled || !res.filePaths.length) return null;
  const files = [];
  for (const fp of res.filePaths) {
    const iconUrl = await extractRealIcon(fp);
    files.push({
      path: fp,
      name: path.basename(fp),
      iconUrl
    });
  }
  return files;
});

ipcMain.handle('topapp:choose-audio-files', async () => {
  const res = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Archivos de Audio', extensions: ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'wma'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ]
  });
  if (res.canceled || !res.filePaths.length) return [];
  const files = [];
  for (const fp of res.filePaths) {
    const ext = path.extname(fp).replace('.', '').toUpperCase();
    let size = 0;
    try { size = fs.statSync(fp).size; } catch (e) {}
    files.push({
      name: path.basename(fp, path.extname(fp)),
      ext: ext || 'AUDIO',
      path: fp,
      url: `file:///${fp.replace(/\\/g, '/')}`,
      size
    });
  }
  return files;
});

ipcMain.handle('topapp:choose-audio-folder', async () => {
  const res = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (res.canceled || !res.filePaths.length) return [];
  const folder = res.filePaths[0];
  const audioExts = new Set(['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.wma']);
  const files = [];
  try {
    const scanDir = (dir, depth = 0) => {
      if (depth > 2 || files.length >= 200) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const ent of entries) {
        if (files.length >= 200) break;
        if (ent.name.startsWith('$') || ent.name.startsWith('.')) continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          scanDir(full, depth + 1);
        } else if (ent.isFile()) {
          const ext = path.extname(ent.name).toLowerCase();
          if (audioExts.has(ext)) {
            let size = 0;
            try { size = fs.statSync(full).size; } catch (e) {}
            files.push({
              name: path.basename(ent.name, path.extname(ent.name)),
              ext: ext.replace('.', '').toUpperCase(),
              path: full,
              url: `file:///${full.replace(/\\/g, '/')}`,
              size
            });
          }
        }
      }
    };
    scanDir(folder, 0);
  } catch (e) {}
  return files;
});

// Extract Cover Art from audio file (embedded ID3v2 APIC or directory cover image)
function extractAudioCover(filePath) {
  if (!filePath || typeof filePath !== 'string') return null;
  try {
    if (!fs.existsSync(filePath)) return null;

    // 1. Try folder image in the same directory first or alongside track
    const dir = path.dirname(filePath);
    const baseNoExt = path.basename(filePath, path.extname(filePath));
    const candidateNames = [
      'cover.jpg', 'cover.png', 'cover.jpeg',
      'folder.jpg', 'folder.png', 'folder.jpeg',
      'albumart.jpg', 'albumart.png', 'album.jpg', 'album.png',
      'front.jpg', 'front.png',
      `${baseNoExt}.jpg`, `${baseNoExt}.png`, `${baseNoExt}.jpeg`
    ];
    for (const name of candidateNames) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) {
        try {
          const buf = fs.readFileSync(p);
          if (buf.length > 0 && buf.length < 15 * 1024 * 1024) {
            const ext = path.extname(p).toLowerCase();
            const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
            return `data:${mime};base64,${buf.toString('base64')}`;
          }
        } catch (e) {}
      }
    }

    // 2. Try ID3v2 APIC frame inside audio file
    const fd = fs.openSync(filePath, 'r');
    try {
      const headerBuf = Buffer.alloc(10);
      const read = fs.readSync(fd, headerBuf, 0, 10, 0);
      if (read === 10 && headerBuf.toString('ascii', 0, 3) === 'ID3') {
        const ver = headerBuf[3]; // 2, 3 or 4
        const tagSize = ((headerBuf[6] & 0x7f) << 21) |
                        ((headerBuf[7] & 0x7f) << 14) |
                        ((headerBuf[8] & 0x7f) << 7) |
                        (headerBuf[9] & 0x7f);
        const readLimit = Math.min(tagSize, 8 * 1024 * 1024); // read up to 8MB
        if (readLimit > 20) {
          const tagBuf = Buffer.alloc(readLimit);
          fs.readSync(fd, tagBuf, 0, readLimit, 10);

          let apicIndex = tagBuf.indexOf(Buffer.from('APIC'));
          if (apicIndex !== -1) {
            const slice = tagBuf.slice(apicIndex);
            const jpgIdx = slice.indexOf(Buffer.from([0xFF, 0xD8, 0xFF]));
            const pngIdx = slice.indexOf(Buffer.from([0x89, 0x50, 0x4E, 0x47]));

            let imgStart = -1;
            let mime = 'image/jpeg';
            if (jpgIdx !== -1 && (pngIdx === -1 || jpgIdx < pngIdx)) {
              imgStart = jpgIdx;
              mime = 'image/jpeg';
            } else if (pngIdx !== -1) {
              imgStart = pngIdx;
              mime = 'image/png';
            }

            if (imgStart !== -1) {
              let frameSize = 0;
              if (ver === 4) {
                frameSize = ((slice[4] & 0x7f) << 21) | ((slice[5] & 0x7f) << 14) | ((slice[6] & 0x7f) << 7) | (slice[7] & 0x7f);
              } else {
                frameSize = slice.readUInt32BE(4);
              }
              const headerOffset = 10;
              const imgLen = (frameSize > 0 && frameSize < slice.length) ? (frameSize - (imgStart - headerOffset)) : (slice.length - imgStart);
              const actualLen = Math.min(imgLen, slice.length - imgStart);
              if (actualLen > 100) {
                const imgBuf = slice.slice(imgStart, imgStart + actualLen);
                return `data:${mime};base64,${imgBuf.toString('base64')}`;
              }
            }
          }
        }
      }
    } finally {
      fs.closeSync(fd);
    }
  } catch (err) {}
  return null;
}

ipcMain.handle('topapp:get-audio-cover', async (event, filePath) => {
  return extractAudioCover(filePath);
});


// Launch files, folders or apps cleanly
ipcMain.handle('topapp:launch-app', async (event, targetPath) => {
  if (!targetPath) return { ok: false };
  if (targetPath.startsWith('ms-settings:') || targetPath.startsWith('http://') || targetPath.startsWith('https://') || targetPath.startsWith('whatsapp:') || targetPath.startsWith('mailto:')) {
    shell.openExternal(targetPath);
    return { ok: true };
  }

  const userHome = os.homedir();
  const lower = targetPath.toLowerCase().trim();

  // Direct instant launch for native Windows utilities
  const SYSTEM_COMMANDS = {
    'calc.exe': 'calc.exe',
    'calc': 'calc.exe',
    'notepad.exe': 'notepad.exe',
    'notepad': 'notepad.exe',
    'mspaint.exe': 'mspaint.exe',
    'mspaint': 'mspaint.exe',
    'taskmgr.exe': 'taskmgr.exe',
    'taskmgr': 'taskmgr.exe',
    'explorer.exe': 'explorer.exe',
    'explorer': 'explorer.exe',
    'powershell.exe': 'powershell.exe',
    'powershell': 'powershell.exe',
    'cmd.exe': 'cmd.exe',
    'cmd': 'cmd.exe'
  };
  if (SYSTEM_COMMANDS[lower]) {
    exec(`start ${SYSTEM_COMMANDS[lower]}`, () => {});
    return { ok: true };
  }

  // Special shell folder: My PC / Este equipo
  if (lower === 'shell:mycomputerfolder' || lower === 'mycomputer' || lower === 'thispc') {
    exec('explorer.exe ::{20D04FE0-3AEA-1069-A2D8-08002B30309D}', () => {});
    return { ok: true };
  }

  let resolvedPath = targetPath;

  if (lower === 'shell:documents' || lower === 'documents' || lower === 'shell:personal') {
    resolvedPath = app.getPath('documents') || path.join(userHome, 'Documents');
  } else if (lower === 'shell:downloads' || lower === 'downloads') {
    resolvedPath = app.getPath('downloads') || path.join(userHome, 'Downloads');
  } else if (lower === 'shell:music' || lower === 'music' || lower === 'shell:my music') {
    resolvedPath = app.getPath('music') || path.join(userHome, 'Music');
  } else if (lower === 'shell:videos' || lower === 'videos' || lower === 'shell:my video') {
    resolvedPath = app.getPath('videos') || path.join(userHome, 'Videos');
  } else if (lower === 'shell:pictures' || lower === 'pictures' || lower === 'shell:my pictures') {
    resolvedPath = app.getPath('pictures') || path.join(userHome, 'Pictures');
  } else if (lower === 'shell:desktop' || lower === 'desktop') {
    resolvedPath = app.getPath('desktop') || path.join(userHome, 'Desktop');
  }

  // Try opening natively first (perfect for folders, documents, shortcuts, drives)
  try {
    const err = await shell.openPath(resolvedPath);
    if (!err) return { ok: true };
  } catch (e) {}

  // Fallback to exec for binaries or custom commands
  exec(`start "" "${resolvedPath}"`, (err) => {});
  return { ok: true };
});

// Native File Picker for Contacts (.vcf, .csv, .txt)
ipcMain.handle('topapp:choose-contacts-file', async () => {
  const res = await dialog.showOpenDialog({
    title: 'Seleccionar archivo de contactos',
    properties: ['openFile'],
    filters: [
      { name: 'Contactos (*.vcf, *.csv, *.txt)', extensions: ['vcf', 'vcard', 'csv', 'txt'] },
      { name: 'Todos los archivos', extensions: ['*'] }
    ]
  });
  if (res.canceled || !res.filePaths || !res.filePaths.length) return null;
  const filePath = res.filePaths[0];
  try {
    const buf = fs.readFileSync(filePath);
    let content = '';
    const sliceBuf = (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) ? buf.subarray(3) : buf;
    try {
      content = new TextDecoder('utf-8', { fatal: true }).decode(sliceBuf);
    } catch (e) {
      content = new TextDecoder('windows-1252').decode(sliceBuf);
    }
    return { ok: true, name: path.basename(filePath), content };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// Universal Windows Installed Apps Launcher (Acrobat, SketchUp, Photoshop, Word, etc.)
ipcMain.handle('topapp:find-and-launch-app', async (event, query) => {
  if (!query) return { ok: false };
  let q = query.toLowerCase().trim()
    .replace(/^(?:por\s+favor\s+)?(?:abre|abrir|ejecuta|ejecutar|inicia|iniciar|lanza|lanzar|arranca|arrancar|pon|ponme)\s+/i, '')
    .replace(/^(?:la\s+|el\s+)?(?:aplicaci[oó]n|programa|app|software|herramienta)\s+(?:de\s+|del\s+)?/i, '')
    .replace(/^(?:el|la|los|las|un|una)\s+/i, '')
    .replace(/[.:,;]$/, '')
    .trim();
  if (!q) return { ok: false };

  // 1. Check known system commands
  const sysCmds = {
    'calculadora': 'calc.exe',
    'calc': 'calc.exe',
    'bloc de notas': 'notepad.exe',
    'bloc de nota': 'notepad.exe',
    'notepad': 'notepad.exe',
    'paint': 'mspaint.exe',
    'mspaint': 'mspaint.exe',
    'taskmgr': 'taskmgr.exe',
    'administrador de tareas': 'taskmgr.exe',
    'explorador': 'explorer.exe',
    'explorador de archivos': 'explorer.exe',
    'powershell': 'powershell.exe',
    'terminal': 'powershell.exe',
    'cmd': 'cmd.exe',
    'configuracion': 'ms-settings:',
    'configuración': 'ms-settings:'
  };
  if (sysCmds[q]) {
    if (sysCmds[q].startsWith('ms-settings:')) shell.openExternal('ms-settings:');
    else exec(`start ${sysCmds[q]}`, () => {});
    return { ok: true, name: q };
  }

  // 1.5 Check dockApps in appConfig
  if (appConfig?.dockApps && appConfig.dockApps.length) {
    const dockMatch = appConfig.dockApps.find(a => {
      const n = (a.name || '').toLowerCase();
      return n === q || n.includes(q) || q.includes(n);
    });
    if (dockMatch && dockMatch.path) {
      try {
        const err = await shell.openPath(dockMatch.path);
        if (!err) return { ok: true, name: dockMatch.name, path: dockMatch.path };
      } catch (e) {}
      exec(`start "" "${dockMatch.path}"`, () => {});
      return { ok: true, name: dockMatch.name, path: dockMatch.path };
    }
  }

  // 1.6 Check items in fences
  if (appConfig?.fences && appConfig.fences.length) {
    for (const f of appConfig.fences) {
      if (f.icons && f.icons.length) {
        const fenceMatch = f.icons.find(ico => {
          const n = (ico.name || '').toLowerCase();
          return n === q || n.includes(q) || q.includes(n);
        });
        if (fenceMatch && fenceMatch.path) {
          try {
            const err = await shell.openPath(fenceMatch.path);
            if (!err) return { ok: true, name: fenceMatch.name, path: fenceMatch.path };
          } catch (e) {}
          exec(`start "" "${fenceMatch.path}"`, () => {});
          return { ok: true, name: fenceMatch.name, path: fenceMatch.path };
        }
      }
    }
  }

  // 2. Scan installed programs and Start Menu
  const userProfile = process.env.USERPROFILE || '';
  const programData = process.env.ProgramData || 'C:\\ProgramData';
  const localAppData = process.env.LOCALAPPDATA || '';
  const scanDirs = [
    path.join(programData, 'Microsoft\\Windows\\Start Menu\\Programs'),
    path.join(userProfile, 'AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs'),
    path.join(userProfile, 'Desktop'),
    path.join(programData, 'Desktop'),
    path.join(localAppData, 'Programs'),
    'C:\\Program Files',
    'C:\\Program Files (x86)'
  ];

  const searchWords = q.split(/\s+/).filter(w => w.length > 2);
  const candidates = [];

  const walk = (d, depth = 0) => {
    if (depth > 4) return;
    try {
      const files = fs.readdirSync(d, { withFileTypes: true });
      for (const f of files) {
        const full = path.join(d, f.name);
        if (f.isDirectory()) {
          const nameLow = f.name.toLowerCase();
          if (depth < 1 || searchWords.some(w => nameLow.includes(w)) || nameLow.includes(q)) {
            walk(full, depth + 1);
          }
        } else if (f.isFile() && f.name.match(/\.(lnk|exe)$/i)) {
          const base = f.name.replace(/\.(lnk|exe)$/i, '').toLowerCase();
          if (base.includes('uninstall') || base.includes('desinstalar') || base.includes('setup') || base.includes('helper') || base.includes('update')) continue;

          let score = 0;
          if (base === q) score += 100;
          else if (base.startsWith(q)) score += 80;
          else if (base.includes(q)) score += 60;
          else if (searchWords.length > 0 && searchWords.every(w => base.includes(w))) score += 50;
          else if (searchWords.length > 0 && searchWords.some(w => base.includes(w))) score += 30;

          if (score > 0) {
            candidates.push({
              name: f.name.replace(/\.(lnk|exe)$/i, ''),
              path: full,
              score: score + (f.name.endsWith('.lnk') ? 15 : 0)
            });
          }
        }
      }
    } catch (e) {}
  };

  for (const sd of scanDirs) {
    if (fs.existsSync(sd)) walk(sd, sd.includes('Program Files') ? 1 : 0);
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    try {
      const err = await shell.openPath(best.path);
      if (!err) return { ok: true, name: best.name, path: best.path };
    } catch (e) {}
    exec(`start "" "${best.path}"`, () => {});
    return { ok: true, name: best.name, path: best.path };
  }

  // If not found in scanned paths, return ok: false
  return { ok: false, error: 'App not found' };
});

// Voice Typing Trigger (Windows 10/11 Win + H)
ipcMain.handle('topapp:trigger-voice-typing', () => {
  if (keybd_event) {
    try {
      const VK_LWIN = 0x5B;
      const VK_H = 0x48;
      const KEYEVENTF_KEYUP = 0x0002;
      keybd_event(VK_LWIN, 0, 0, 0);
      keybd_event(VK_H, 0, 0, 0);
      keybd_event(VK_H, 0, KEYEVENTF_KEYUP, 0);
      keybd_event(VK_LWIN, 0, KEYEVENTF_KEYUP, 0);
      return { ok: true };
    } catch (e) {}
  }
  return { ok: false };
});

// Offline Native Windows Speech Recognition (System.Speech es-ES with Command Grammar)
let speechProcess = null;
ipcMain.handle('topapp:listen-speech', async (event, options = {}) => {
  const timeoutSec = options && options.timeoutSec ? Math.max(3, Math.min(15, options.timeoutSec)) : 7;
  return new Promise((resolve) => {
    if (speechProcess) {
      try { speechProcess.kill(); } catch (e) {}
      speechProcess = null;
    }

    const script = `
Add-Type -AssemblyName System.Speech
$info = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers() | Where-Object { $_.Culture.Name -like "es*" } | Select-Object -First 1
if (-not $info) {
    Write-Output "ERROR:NO_ENGINE"
    exit 0
}
try {
    $engine = New-Object System.Speech.Recognition.SpeechRecognitionEngine($info.Id)
    $engine.SetInputToDefaultAudioDevice()

    # Priority command grammar to prevent acoustic hallucinations
    $choices = New-Object System.Speech.Recognition.Choices
    $verbs = @("envía", "envia", "manda", "mandar", "escribe", "dile", "abrir", "abre", "liberar", "purga")
    $targets = @("un mensaje a Tomás", "un mensaje a tomas", "a Tomás", "a tomas", "a Carlos", "a Pedro", "un mensaje", "por WhatsApp", "por wasap", "WhatsApp", "wasap", "Gmail", "correo", "RAM", "memoria", "hora", "fecha")
    $choices.Add($verbs)
    $choices.Add($targets)
    $gb = New-Object System.Speech.Recognition.GrammarBuilder
    $gb.Append($choices)
    $g = New-Object System.Speech.Recognition.Grammar($gb)
    $g.Weight = 1.0
    $engine.LoadGrammar($g)

    $dict = New-Object System.Speech.Recognition.DictationGrammar
    $dict.Weight = 0.5
    $engine.LoadGrammar($dict)

    $result = $engine.Recognize([TimeSpan]::FromSeconds(${timeoutSec}))
    if ($result -and $result.Text) {
        Write-Output ("RESULT:" + $result.Text)
    } else {
        Write-Output "RESULT:EMPTY"
    }
} catch {
    Write-Output ("ERROR:" + $_.Exception.Message)
} finally {
    if ($engine) { $engine.Dispose() }
}
`;
    const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'ignore']
    });

    speechProcess = ps;
    let stdout = '';
    ps.stdout.on('data', d => { stdout += d.toString(); });
    ps.on('close', () => {
      speechProcess = null;
      const text = stdout.trim();
      if (text.startsWith('RESULT:')) {
        const val = text.substring(7).trim();
        resolve({ ok: true, text: val === 'EMPTY' ? '' : val });
      } else {
        resolve({ ok: false, error: text || 'No se detectó voz' });
      }
    });
    ps.on('error', (err) => {
      speechProcess = null;
      resolve({ ok: false, error: err.message });
    });
  });
});

ipcMain.handle('topapp:stop-listen-speech', () => {
  if (speechProcess) {
    try { speechProcess.kill(); } catch (e) {}
    speechProcess = null;
  }
  return { ok: true };
});

// Fast file search in selected folder
ipcMain.handle('topapp:quick-search', async (event, { folder, query, filterType }) => {
  if (!folder || !fs.existsSync(folder)) return { files: [] };
  const extFilters = {
    all: null,
    images: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.ico'],
    videos: ['.mp4', '.mkv', '.avi', '.mov', '.wmv'],
    docs: ['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.txt', '.csv', '.rtf', '.md'],
    pdf: ['.pdf'],
    code: ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json', '.bat', '.ps1', '.c', '.cpp', '.cs'],
    audio: ['.mp3', '.wav', '.flac', '.ogg', '.m4a']
  };

  const allowedExts = extFilters[filterType || 'all'];
  const q = (query || '').toLowerCase().trim();
  const results = [];

  try {
    const searchDir = (dirPath, depth = 0) => {
      if (depth > 2 || results.length >= 30) return;
      let entries = [];
      try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
      } catch (e) {
        return;
      }
      for (const ent of entries) {
        if (results.length >= 30) break;
        if (ent.name.startsWith('$') || ent.name.startsWith('.')) continue;
        const full = path.join(dirPath, ent.name);
        if (ent.isDirectory()) {
          if (!q || ent.name.toLowerCase().includes(q)) {
            results.push({
              name: ent.name,
              path: full,
              isDirectory: true,
              size: ''
            });
          }
          searchDir(full, depth + 1);
        } else if (ent.isFile()) {
          const ext = path.extname(ent.name).toLowerCase();
          if (allowedExts && !allowedExts.includes(ext)) continue;
          if (!q || ent.name.toLowerCase().includes(q)) {
            let sizeStr = '';
            try {
              const stat = fs.statSync(full);
              if (stat.size > 1024 * 1024) sizeStr = (stat.size / (1024 * 1024)).toFixed(1) + ' MB';
              else sizeStr = Math.max(1, Math.round(stat.size / 1024)) + ' KB';
            } catch (e) {}
            results.push({
              name: ent.name,
              path: full,
              isDirectory: false,
              ext,
              size: sizeStr
            });
          }
        }
      }
    };
    searchDir(folder, 0);

    // Extract real icons for first 20 results
    for (let i = 0; i < Math.min(results.length, 20); i++) {
      results[i].iconUrl = await extractRealIcon(results[i].path);
    }
  } catch (err) {}

  return { files: results };
});

// Launch Windows Explorer searching within the specific folder and filetype/name
ipcMain.handle('topapp:launch-search-explorer', async (event, { folder, query, filterType }) => {
  let searchExt = '';
  if (filterType && filterType !== 'all') {
    const extMap = {
      pdf: '*.pdf',
      images: '*.png OR *.jpg OR *.jpeg',
      videos: '*.mp4 OR *.mkv OR *.avi',
      docs: '*.docx OR *.doc OR *.txt OR *.xlsx',
      code: '*.js OR *.ts OR *.py OR *.html OR *.css',
      audio: '*.mp3 OR *.wav'
    };
    searchExt = extMap[filterType] || '';
  }

  let fullQuery = '';
  const q = (query || '').trim();
  if (q && searchExt) {
    fullQuery = `${q} ${searchExt}`;
  } else if (q) {
    fullQuery = q;
  } else if (searchExt) {
    fullQuery = searchExt;
  } else {
    fullQuery = '*';
  }

  const targetFolder = folder || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'Documents') : 'C:\\');
  const searchUri = `search-ms:query=${encodeURIComponent(fullQuery)}&crumb=location:${encodeURIComponent(targetFolder)}`;
  try {
    await shell.openExternal(searchUri);
    return { ok: true };
  } catch (e) {
    exec(`powershell -NoProfile -Command "Start-Process '${searchUri.replace(/'/g, "''")}'"`);
    return { ok: true };
  }
});

// Real Windows Printer Status Check (cached for 12 seconds to prevent process churn)
let cachedPrinterStatus = {
  isPrinting: false,
  statusText: 'Lista / Preparada',
  docName: '',
  totalPages: 0,
  pagesPrinted: 0,
  progressPct: 0
};
let lastPrinterQueryTime = 0;

ipcMain.handle('topapp:get-printer-status', async () => {
  const now = Date.now();
  if (now - lastPrinterQueryTime < 12000) {
    return cachedPrinterStatus;
  }
  lastPrinterQueryTime = now;
  return new Promise((resolve) => {
    exec('powershell -NoProfile -Command "Get-PrintJob 2>$null | Select-Object -Property JobId, DocumentName, TotalPages, PagesPrinted | ConvertTo-Json"', { timeout: 2500 }, (err, stdout) => {
      try {
        if (!err && stdout && stdout.trim()) {
          const parsed = JSON.parse(stdout.trim());
          const jobs = Array.isArray(parsed) ? parsed : [parsed];
          if (jobs.length > 0 && jobs[0]) {
            const j = jobs[0];
            cachedPrinterStatus = {
              isPrinting: true,
              statusText: 'Imprimiendo...',
              docName: j.DocumentName || 'Documento',
              totalPages: j.TotalPages || 1,
              pagesPrinted: j.PagesPrinted || 0,
              progressPct: Math.round(((j.PagesPrinted || 0) / (j.TotalPages || 1)) * 100) || 20
            };
            return resolve(cachedPrinterStatus);
          }
        }
      } catch (e) {}
      cachedPrinterStatus = {
        isPrinting: false,
        statusText: 'Lista / Preparada',
        docName: '',
        totalPages: 0,
        pagesPrinted: 0,
        progressPct: 0
      };
      resolve(cachedPrinterStatus);
    });
  });
});

ipcMain.handle('topapp:open-hub', (event, targetTab) => {
  createHubWindow(targetTab);
  return { ok: true };
});

ipcMain.handle('topapp:toggle-hub', (event, targetTab) => {
  toggleHubWindow(targetTab);
  return { ok: true };
});

ipcMain.handle('topapp:get-active-window', async () => {
  return new Promise((resolve) => {
    const cmd = `powershell -NoProfile -Command "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; using System.Text; public class WinActive { [DllImport(\\\"user32.dll\\\")] public static extern IntPtr GetForegroundWindow(); [DllImport(\\\"user32.dll\\\")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count); public static string GetTitle() { var sb = new StringBuilder(256); var h = GetForegroundWindow(); GetWindowText(h, sb, 256); return sb.ToString(); } }'; [WinActive]::GetTitle()"`;
    exec(cmd, { timeout: 1500 }, (err, stdout) => {
      resolve({ title: stdout ? stdout.trim() : '' });
    });
  });
});

function configureWindowsAutostart(enable) {
  const regPath = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
  const appKey = 'TopAppWinThemePro';
  const badKey = 'electron.app.Electron';
  const mainScriptPath = path.join(__dirname, 'main.cjs');
  const targetExec = process.execPath;
  const commandLine = app.isPackaged ? `\\"${targetExec}\\"` : `\\"${targetExec}\\" \\"${mainScriptPath}\\"`;

  try {
    if (enable) {
      const psCmd = `Remove-ItemProperty -Path '${regPath}' -Name '${badKey}' -ErrorAction SilentlyContinue; Set-ItemProperty -Path '${regPath}' -Name '${appKey}' -Value "${commandLine}"`;
      exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"`);
    } else {
      const psCmd = `Remove-ItemProperty -Path '${regPath}' -Name '${appKey}' -ErrorAction SilentlyContinue; Remove-ItemProperty -Path '${regPath}' -Name '${badKey}' -ErrorAction SilentlyContinue`;
      exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"`);
    }
  } catch (e) {
    console.error('Error configuring autostart:', e);
  }

  try {
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: targetExec,
      args: app.isPackaged ? [] : [mainScriptPath]
    });
  } catch (e) {}
}

ipcMain.handle('topapp:set-autostart', (event, enable) => {
  appConfig.autoStartOnBoot = enable;
  saveConfig(appConfig);
  configureWindowsAutostart(enable);
  return { ok: true, enabled: enable };
});

// Fences Management
ipcMain.handle('topapp:get-fence-storage-path', (event, fenceTitle) => {
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';
  const safeTitle = (fenceTitle || 'Cajon').replace(/[\\/:*?"<>|]/g, '_');
  return path.join(userProfile, 'TopApp Fences', safeTitle);
});

ipcMain.handle('topapp:create-fence', (event, fenceData = {}) => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  const w = fenceData.w || 360;
  const h = fenceData.h || 260;
  const centerX = Math.max(20, Math.round((screenWidth - w) / 2));
  const centerY = Math.max(20, Math.round((screenHeight - h) / 2));

  const id = 'fence-' + Date.now();
  const title = fenceData.title || `Cajón ${(appConfig.fences || []).length + 1}`;
  const newFence = {
    id,
    title,
    x: fenceData.x !== undefined ? fenceData.x : centerX,
    y: fenceData.y !== undefined ? fenceData.y : centerY,
    w,
    h,
    isPinned: false, // Sin el alfiler marcado para que se pueda mover libremente
    opacity: 0.72,
    iconSize: 44,
    iconGap: 10,
    icons: []
  };
  appConfig.fences = [...(appConfig.fences || []), newFence];
  saveConfig(appConfig);
  createFenceWindow(newFence);
  broadcastConfig();

  const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';
  const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_');
  const fenceDir = path.join(userProfile, 'TopApp Fences', safeTitle);
  if (!fs.existsSync(fenceDir)) {
    try { fs.mkdirSync(fenceDir, { recursive: true }); } catch (e) {}
  }

  return {
    ...newFence,
    storagePath: fenceDir
  };
});

ipcMain.handle('topapp:toggle-pin-fence', (event, fenceId) => {
  const fence = (appConfig.fences || []).find(f => f.id === fenceId);
  if (fence) {
    fence.isPinned = !fence.isPinned;
    saveConfig(appConfig);
    const win = fenceWindows.get(fenceId);
    if (win && !win.isDestroyed()) {
      win.setAlwaysOnTop(false);
      sendToBottom(win);
      if (fence.isPinned) {
        win.blur();
      }
    }
    broadcastConfig();
    return { ok: true, isPinned: fence.isPinned };
  }
  return { ok: false };
});

const originalFenceHeights = new Map();

ipcMain.handle('topapp:open-fence-settings', (event, fenceId) => {
  const win = fenceWindows.get(fenceId) || BrowserWindow.fromWebContents(event.sender);
  if (!win || win.isDestroyed()) return { ok: false };

  win._isSettingsOpen = true;
  win.setAlwaysOnTop(true, 'floating');
  win.focus();

  const [w, h] = win.getSize();
  if (h < 265) {
    if (!originalFenceHeights.has(fenceId)) {
      originalFenceHeights.set(fenceId, h);
    }
    win._isSettingsExpanded = true;
    win.setSize(Math.max(w, 360), 270);
  }
  return { ok: true };
});

ipcMain.handle('topapp:close-fence-settings', (event, fenceId) => {
  const win = fenceWindows.get(fenceId) || BrowserWindow.fromWebContents(event.sender);
  if (!win || win.isDestroyed()) return { ok: false };

  win._isSettingsOpen = false;
  win.setAlwaysOnTop(false);
  sendToBottom(win);

  if (originalFenceHeights.has(fenceId)) {
    const origH = originalFenceHeights.get(fenceId);
    originalFenceHeights.delete(fenceId);
    const [w] = win.getSize();
    win.setSize(w, origH);
  }
  win._isSettingsExpanded = false;
  return { ok: true };
});

ipcMain.handle('topapp:delete-fence', async (event, fenceId) => {
  let fence = (appConfig.fences || []).find(f => f.id === fenceId);
  if (!fence && (appConfig.fences || []).length > 0) {
    fence = appConfig.fences[0];
    fenceId = fence.id;
  }
  if (!fence) return { ok: false };

  const win = fenceWindows.get(fenceId) || BrowserWindow.fromWebContents(event.sender);
  const items = fence.icons || [];

  // También verificar archivos físicos en disco por si acaso
  const safeTitle = (fence.title || 'Cajon').replace(/[\\/:*?"<>|]/g, '_');
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';
  const fenceDir = path.join(userProfile, 'TopApp Fences', safeTitle);
  let diskEntries = [];
  if (fs.existsSync(fenceDir)) {
    try {
      diskEntries = fs.readdirSync(fenceDir).map(name => path.join(fenceDir, name));
    } catch (e) {}
  }

  const allFilePaths = Array.from(new Set([
    ...items.map(i => i.path).filter(Boolean),
    ...diskEntries
  ])).filter(p => fs.existsSync(p));

  if (allFilePaths.length > 0) {
    const choice = await dialog.showMessageBox(win && !win.isDestroyed() ? win : null, {
      type: 'question',
      buttons: ['Devolver todo al Escritorio', 'Solo ocultar cajón (archivos a salvo)', 'Cancelar'],
      defaultId: 0,
      cancelId: 2,
      title: 'Cerrar ' + (fence.title || 'Cajón'),
      message: `El cajón "${fence.title || 'Cajón'}" contiene ${allFilePaths.length} elemento(s).`,
      detail: '¿Qué deseas hacer con las carpetas y archivos que contiene?\n\n• Devolver todo al Escritorio: Reaparecen inmediatamente en tu escritorio de Windows.\n• Solo ocultar cajón: Se conservan intactos en C:\\Users\\' + (process.env.USERNAME || 'Usuario') + '\\TopApp Fences.'
    });

    if (choice.response === 2) {
      return { ok: false, canceled: true };
    }

    if (choice.response === 0) {
      // Devolver físicamente todas las carpetas y archivos al Escritorio
      for (const fp of allFilePaths) {
        const matchingItem = items.find(it => it.path && it.path.toLowerCase() === fp.toLowerCase());
        await moveItemToDesktopInternal(fenceId, matchingItem?.id || null, fp);
      }
    }
  }

  appConfig.fences = (appConfig.fences || []).filter(f => f.id !== fenceId);
  saveConfig(appConfig);
  if (win && !win.isDestroyed()) {
    win.close();
  }
  fenceWindows.delete(fenceId);
  broadcastConfig();
  return { ok: true };
});

function notifyDesktopRefresh() {
  try {
    const cmd = `powershell -NoProfile -Command "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class WinShell { [DllImport(\\\"shell32.dll\\\")] public static extern void SHChangeNotify(int e, int u, IntPtr p1, IntPtr p2); public static void Refresh() { SHChangeNotify(0x08000000, 0, IntPtr.Zero, IntPtr.Zero); } }'; [WinShell]::Refresh()"`;
    exec(cmd, () => {});
  } catch (e) {}
}

function removeFenceItem(fenceId, iconId) {
  const fence = (appConfig.fences || []).find(f => f.id === fenceId);
  if (fence) {
    fence.icons = (fence.icons || []).filter(i => i.id !== iconId);
    saveConfig(appConfig);
    broadcastConfig();
  }
}

async function moveItemToDesktopInternal(fenceId, iconId, sourcePath) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    removeFenceItem(fenceId, iconId);
    return;
  }
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';
  const desktopDir = path.join(userProfile, 'Desktop');
  const baseName = path.basename(sourcePath);
  let destPath = path.join(desktopDir, baseName);

  if (destPath.toLowerCase() !== sourcePath.toLowerCase()) {
    if (fs.existsSync(destPath)) {
      const ext = path.extname(baseName);
      const nameWithoutExt = path.basename(baseName, ext);
      destPath = path.join(desktopDir, `${nameWithoutExt}_${Date.now()}${ext}`);
    }

    try {
      fs.renameSync(sourcePath, destPath);
    } catch (err) {
      try {
        if (fs.lstatSync(sourcePath).isDirectory()) {
          fs.cpSync(sourcePath, destPath, { recursive: true });
          fs.rmSync(sourcePath, { recursive: true, force: true });
        } else {
          fs.copyFileSync(sourcePath, destPath);
          fs.unlinkSync(sourcePath);
        }
      } catch (e2) {}
    }
    notifyDesktopRefresh();
  }
  removeFenceItem(fenceId, iconId);
}

// Move file or folder physically into the Fence storage directory (vanishes from Desktop)
ipcMain.handle('topapp:move-item-to-fence', async (event, { sourcePath, fenceId, fenceTitle }) => {
  if (!sourcePath || !fs.existsSync(sourcePath)) return null;
  const safeTitle = (fenceTitle || 'Cajon').replace(/[\\/:*?"<>|]/g, '_');
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';
  const fenceDir = path.join(userProfile, 'TopApp Fences', safeTitle);
  if (!fs.existsSync(fenceDir)) {
    fs.mkdirSync(fenceDir, { recursive: true });
  }

  const baseName = path.basename(sourcePath);
  let destPath = path.join(fenceDir, baseName);

  if (destPath.toLowerCase() !== sourcePath.toLowerCase()) {
    if (fs.existsSync(destPath)) {
      const ext = path.extname(baseName);
      const nameWithoutExt = path.basename(baseName, ext);
      destPath = path.join(fenceDir, `${nameWithoutExt}_${Date.now()}${ext}`);
    }

    try {
      fs.renameSync(sourcePath, destPath);
    } catch (err) {
      try {
        if (fs.lstatSync(sourcePath).isDirectory()) {
          fs.cpSync(sourcePath, destPath, { recursive: true });
          fs.rmSync(sourcePath, { recursive: true, force: true });
        } else {
          fs.copyFileSync(sourcePath, destPath);
          fs.unlinkSync(sourcePath);
        }
      } catch (e2) {
        destPath = sourcePath;
      }
    }
    notifyDesktopRefresh();
  }

  // Remove from any other fence if moved between cajones
  let hadPreviousFence = false;
  (appConfig.fences || []).forEach(f => {
    if (f.id !== fenceId) {
      const initLen = (f.icons || []).length;
      f.icons = (f.icons || []).filter(ic => ic.path && ic.path.toLowerCase() !== sourcePath.toLowerCase() && ic.path.toLowerCase() !== destPath.toLowerCase());
      if (f.icons.length !== initLen) hadPreviousFence = true;
    }
  });
  if (hadPreviousFence) {
    saveConfig(appConfig);
    broadcastConfig();
  }

  // If a pending desktop drag watch was tracking sourcePath, cancel it
  if (pendingDragCleanup && pendingDragCleanup.sourcePath && pendingDragCleanup.sourcePath.toLowerCase() === sourcePath.toLowerCase()) {
    pendingDragCleanup.stop();
  }

  const iconUrl = await extractRealIcon(destPath);
  return {
    path: destPath,
    name: path.basename(destPath),
    iconUrl
  };
});

async function copyItemToDesktopInternal(sourcePath) {
  if (!sourcePath || !fs.existsSync(sourcePath)) return { ok: false };
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';
  const desktopDir = path.join(userProfile, 'Desktop');
  const baseName = path.basename(sourcePath);
  let destPath = path.join(desktopDir, baseName);

  if (destPath.toLowerCase() === sourcePath.toLowerCase()) return { ok: false };

  if (fs.existsSync(destPath)) {
    const ext = path.extname(baseName);
    const nameWithoutExt = path.basename(baseName, ext);
    destPath = path.join(desktopDir, `${nameWithoutExt} - copia${ext}`);
  }

  try {
    if (fs.lstatSync(sourcePath).isDirectory()) {
      fs.cpSync(sourcePath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
    notifyDesktopRefresh();
    return { ok: true, newPath: destPath };
  } catch (err) {
    console.error('Error copying item to desktop:', err);
    return { ok: false };
  }
}

ipcMain.handle('topapp:copy-item-to-desktop', async (event, sourcePath) => {
  return await copyItemToDesktopInternal(sourcePath);
});

// Move file or folder from Fence storage back to the real Windows Desktop
ipcMain.handle('topapp:move-item-to-desktop', async (event, sourcePath) => {
  if (!sourcePath || !fs.existsSync(sourcePath)) return { ok: false };
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';
  const desktopDir = path.join(userProfile, 'Desktop');
  const baseName = path.basename(sourcePath);
  let destPath = path.join(desktopDir, baseName);

  if (destPath.toLowerCase() !== sourcePath.toLowerCase()) {
    if (fs.existsSync(destPath)) {
      const ext = path.extname(baseName);
      const nameWithoutExt = path.basename(baseName, ext);
      destPath = path.join(desktopDir, `${nameWithoutExt}_${Date.now()}${ext}`);
    }

    try {
      fs.renameSync(sourcePath, destPath);
    } catch (err) {
      try {
        if (fs.lstatSync(sourcePath).isDirectory()) {
          fs.cpSync(sourcePath, destPath, { recursive: true });
          fs.rmSync(sourcePath, { recursive: true, force: true });
        } else {
          fs.copyFileSync(sourcePath, destPath);
          fs.unlinkSync(sourcePath);
        }
      } catch (e2) {
        return { ok: false };
      }
    }
    notifyDesktopRefresh();
  }
  return { ok: true, newPath: destPath };
});

// Native Windows Context Menu for Fence Items (Never clipped by window boundaries!)
ipcMain.handle('topapp:show-fence-context-menu', async (event, { fenceId, iconId, filePath, fileName }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const isFolder = filePath ? (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) : false;

  const template = [
    {
      label: isFolder ? '📂 Abrir Carpeta' : '🚀 Abrir',
      click: () => {
        if (filePath) {
          shell.openPath(filePath).catch(() => {
            exec(`start "" "${filePath}"`);
          });
        }
      }
    },
    {
      label: '🖥️ Mover al Escritorio',
      click: async () => {
        if (filePath) {
          await moveItemToDesktopInternal(fenceId, iconId, filePath);
        }
      }
    },
    {
      label: '📋 Copiar al Escritorio',
      click: async () => {
        if (filePath) {
          await copyItemToDesktopInternal(filePath);
        }
      }
    },
    {
      label: '📋 Copiar archivo / carpeta (Portapapeles)',
      click: () => {
        if (filePath && fs.existsSync(filePath)) {
          exec(`powershell -NoProfile -Command "Set-Clipboard -LiteralPath '${filePath.replace(/'/g, "''")}'"`, () => {});
        }
      }
    },
    { type: 'separator' },
    {
      label: '✏️ Cambiar nombre...',
      click: () => {
        event.sender.send('topapp:fence-rename-item', { iconId });
      }
    },
    {
      label: '📍 Mostrar en el Explorador',
      click: () => {
        if (filePath && fs.existsSync(filePath)) {
          shell.showItemInFolder(filePath);
        }
      }
    },
    {
      label: '📋 Copiar ruta',
      click: () => {
        if (filePath) {
          const { clipboard } = require('electron');
          clipboard.writeText(filePath);
        }
      }
    },
    { type: 'separator' },
    {
      label: '🗑️ Quitar del cajón (mantener archivo)',
      click: () => {
        removeFenceItem(fenceId, iconId);
      }
    },
    {
      label: '🗑️ Eliminar archivo (Papelera)',
      click: async () => {
        if (filePath && fs.existsSync(filePath)) {
          try {
            await shell.trashItem(filePath);
          } catch (e) {
            try {
              if (fs.lstatSync(filePath).isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
              } else {
                fs.unlinkSync(filePath);
              }
            } catch (e2) {}
          }
        }
        removeFenceItem(fenceId, iconId);
        notifyDesktopRefresh();
      }
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: win });
});

// Native Windows Context Menu for Dock Items (to launch, show or remove from dock)
ipcMain.handle('topapp:show-dock-context-menu', (event, { appId, path: appPath, name: appName }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const template = [
    {
      label: `🚀 Abrir ${appName || 'Aplicación'}`,
      click: () => {
        if (appPath) {
          shell.openPath(appPath).catch(() => {
            exec(`start "" "${appPath}"`);
          });
        }
      }
    },
    {
      label: '📍 Mostrar en el Explorador',
      click: () => {
        if (appPath && fs.existsSync(appPath)) {
          shell.showItemInFolder(appPath);
        }
      }
    },
    { type: 'separator' },
    {
      label: '🗑️ Quitar del Dock',
      click: () => {
        appConfig.dockApps = (appConfig.dockApps || []).filter(a => a.id !== appId && a.path !== appPath);
        saveConfig(appConfig);
        broadcastConfig();
      }
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: win });
});

ipcMain.handle('topapp:show-in-folder', (event, filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    shell.showItemInFolder(filePath);
    return { ok: true };
  }
  return { ok: false };
});

ipcMain.handle('topapp:open-alarms', async () => {
  try {
    await shell.openExternal('ms-clock:');
  } catch (e) {
    exec('start ms-clock:', () => {});
  }
  return { ok: true };
});

ipcMain.handle('topapp:open-calendar', async () => {
  try {
    await shell.openExternal('outlookcal:');
  } catch (e) {
    exec('control.exe timedate.cpl', () => {});
  }
  return { ok: true };
});

ipcMain.handle('topapp:open-task-manager', async () => {
  try {
    exec('start taskmgr.exe', () => {});
  } catch (e) {
    exec('taskmgr.exe', () => {});
  }
  return { ok: true };
});

ipcMain.handle('topapp:open-printer-queue', async () => {
  try {
    await shell.openExternal('ms-settings:printers');
  } catch (e) {
    exec('control.exe /name Microsoft.DevicesAndPrinters', () => {});
  }
  return { ok: true };
});

ipcMain.handle('topapp:dock-expand', () => {
  if (!dockWindow || dockWindow.isDestroyed()) return { ok: false };
  isDockExpanded = true;
  const bounds = getDockBounds(true);
  dockWindow.setBounds(bounds);
  return { ok: true };
});

ipcMain.handle('topapp:dock-shrink', () => {
  if (!dockWindow || dockWindow.isDestroyed()) return { ok: false };
  isDockExpanded = false;
  const bounds = getDockBounds(false);
  dockWindow.setBounds(bounds);
  return { ok: true };
});

let cachedRadioStatus = { wifi: true, wifiSsid: '', bluetooth: false };
let lastRadioQueryTime = 0;

ipcMain.handle('topapp:get-radio-status', async () => {
  const now = Date.now();
  if (now - lastRadioQueryTime < 2500) {
    return cachedRadioStatus;
  }
  return new Promise((resolve) => {
    const scriptPath = getScriptPath('scripts/manage_radios.ps1');
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -Action status`, (err, stdout) => {
      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          cachedRadioStatus = {
            wifi: !!parsed.wifi,
            wifiSsid: parsed.wifiSsid || '',
            bluetooth: !!parsed.bluetooth
          };
          lastRadioQueryTime = Date.now();
        } catch (e) {}
      }
      resolve(cachedRadioStatus);
    });
  });
});

ipcMain.handle('topapp:toggle-radio', async (event, target) => {
  return new Promise((resolve) => {
    const scriptPath = getScriptPath('scripts/manage_radios.ps1');
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -Action toggle -Target ${target}`, (err, stdout) => {
      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          cachedRadioStatus = {
            wifi: !!parsed.wifi,
            wifiSsid: parsed.wifiSsid || '',
            bluetooth: !!parsed.bluetooth
          };
          lastRadioQueryTime = Date.now();
        } catch (e) {}
      }
      resolve(cachedRadioStatus);
    });
  });
});

ipcMain.handle('topapp:purge-ram', async () => {
  trimSuiteMemory();
  return new Promise((resolve) => {
    const scriptPath = getScriptPath('scripts/purge_ram.ps1');
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`, (err, stdout) => {
      trimSuiteMemory();
      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          resolve({
            ok: true,
            freedMB: parsed.freedMB || 0,
            processesCleaned: parsed.processesCleaned || 0,
            ramUsedGB: parsed.ramUsedGB || 0,
            ramTotalGB: parsed.ramTotalGB || 0
          });
          return;
        } catch (e) {}
      }
      resolve({ ok: false, freedMB: 0 });
    });
  });
});

let cachedSystemControls = { volume: 50, isMuted: false, brightness: 100, battery: 100, isCharging: true, hasBattery: false };
let lastSystemControlsQueryTime = 0;

ipcMain.handle('topapp:get-system-controls', async () => {
  const now = Date.now();
  if (now - lastSystemControlsQueryTime < 2500) {
    return cachedSystemControls;
  }
  return new Promise((resolve) => {
    const scriptPath = getScriptPath('scripts/manage_system_controls.ps1');
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -Action status`, (err, stdout) => {
      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          cachedSystemControls = {
            volume: typeof parsed.volume === 'number' ? parsed.volume : 50,
            isMuted: !!parsed.isMuted,
            brightness: typeof parsed.brightness === 'number' ? parsed.brightness : 100,
            battery: typeof parsed.battery === 'number' ? parsed.battery : 100,
            isCharging: !!parsed.isCharging,
            hasBattery: !!parsed.hasBattery
          };
          lastSystemControlsQueryTime = Date.now();
        } catch (e) {}
      }
      resolve(cachedSystemControls);
    });
  });
});

ipcMain.handle('topapp:set-system-volume', async (event, vol) => {
  return new Promise((resolve) => {
    const v = Math.max(0, Math.min(100, parseInt(vol, 10) || 0));
    cachedSystemControls.volume = v;
    cachedSystemControls.isMuted = false;
    const scriptPath = getScriptPath('scripts/manage_system_controls.ps1');
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -Action set-volume -Volume ${v}`, (err, stdout) => {
      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          cachedSystemControls = { ...cachedSystemControls, ...parsed };
          lastSystemControlsQueryTime = Date.now();
        } catch (e) {}
      }
      resolve(cachedSystemControls);
    });
  });
});

ipcMain.handle('topapp:toggle-system-mute', async () => {
  return new Promise((resolve) => {
    cachedSystemControls.isMuted = !cachedSystemControls.isMuted;
    const scriptPath = getScriptPath('scripts/manage_system_controls.ps1');
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -Action toggle-mute`, (err, stdout) => {
      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          cachedSystemControls = { ...cachedSystemControls, ...parsed };
          lastSystemControlsQueryTime = Date.now();
        } catch (e) {}
      }
      resolve(cachedSystemControls);
    });
  });
});

ipcMain.handle('topapp:set-system-brightness', async (event, b) => {
  return new Promise((resolve) => {
    const val = Math.max(0, Math.min(100, parseInt(b, 10) || 0));
    cachedSystemControls.brightness = val;
    const scriptPath = getScriptPath('scripts/manage_system_controls.ps1');
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -Action set-brightness -Brightness ${val}`, (err, stdout) => {
      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          cachedSystemControls = { ...cachedSystemControls, ...parsed };
          lastSystemControlsQueryTime = Date.now();
        } catch (e) {}
      }
      resolve(cachedSystemControls);
    });
  });
});

ipcMain.handle('topapp:quit-app', async () => {
  app.isQuitting = true;
  try {
    saveConfig(appConfig);
  } catch (e) {
    console.error('Error saving config before quit:', e);
  }
  app.quit();
  return { ok: true };
});

let pendingDragCleanup = null;

function setupDesktopDropWatch(sourcePath, fenceId, iconId) {
  if (!sourcePath || !fs.existsSync(sourcePath)) return;
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';
  const desktopDir = path.join(userProfile, 'Desktop');
  const baseName = path.basename(sourcePath);
  const ext = path.extname(baseName);
  const nameNoExt = path.basename(baseName, ext).toLowerCase();
  const startTime = Date.now();

  if (pendingDragCleanup && pendingDragCleanup.stop) {
    try { pendingDragCleanup.stop(); } catch (e) {}
  }

  let cleanedUp = false;
  let watcher = null;
  let pollInterval = null;

  // Snapshot existing desktop entries before drag
  let initialEntries = new Set();
  try {
    if (fs.existsSync(desktopDir)) {
      initialEntries = new Set(fs.readdirSync(desktopDir).map(e => e.toLowerCase()));
    }
  } catch (e) {}

  const standardDest = path.join(desktopDir, baseName);
  const existedBefore = fs.existsSync(standardDest);
  let initialMtime = 0;
  if (existedBefore) {
    try { initialMtime = fs.statSync(standardDest).mtimeMs; } catch (e) {}
  }

  const tryCleanUpSource = (foundDesktopPath) => {
    if (cleanedUp) return;
    cleanedUp = true;
    if (watcher) { try { watcher.close(); } catch (e) {} }
    if (pollInterval) { clearInterval(pollInterval); }

    // Wait a brief moment for Windows Explorer to finish copying files
    setTimeout(() => {
      try {
        if (fs.existsSync(sourcePath) && sourcePath.toLowerCase() !== foundDesktopPath.toLowerCase()) {
          const deleteRecursive = (p) => {
            try {
              if (fs.lstatSync(p).isDirectory()) {
                fs.rmSync(p, { recursive: true, force: true });
              } else {
                fs.unlinkSync(p);
              }
            } catch (err) {
              setTimeout(() => {
                try {
                  if (fs.existsSync(p)) {
                    if (fs.lstatSync(p).isDirectory()) {
                      fs.rmSync(p, { recursive: true, force: true });
                    } else {
                      fs.unlinkSync(p);
                    }
                  }
                } catch (e2) {}
              }, 250);
            }
          };
          deleteRecursive(sourcePath);
        }
      } catch (err) {
        console.error('Error removing source after move to desktop:', err);
      }

      removeFenceItem(fenceId, iconId);
      notifyDesktopRefresh();
    }, 180);
  };

  const checkForDroppedItem = () => {
    if (cleanedUp) return;
    try {
      if (fs.existsSync(standardDest) && standardDest.toLowerCase() !== sourcePath.toLowerCase()) {
        if (!existedBefore) {
          tryCleanUpSource(standardDest);
          return;
        } else {
          try {
            const st = fs.statSync(standardDest);
            if (st.mtimeMs > initialMtime || st.ctimeMs >= startTime - 1000) {
              tryCleanUpSource(standardDest);
              return;
            }
          } catch (e) {}
        }
      }

      // Check if Windows created a new entry (e.g. "Name - copia", "Name (2)")
      if (fs.existsSync(desktopDir)) {
        const currentEntries = fs.readdirSync(desktopDir);
        for (const entry of currentEntries) {
          const entryLow = entry.toLowerCase();
          if (!initialEntries.has(entryLow) && (entryLow === baseName.toLowerCase() || entryLow.startsWith(nameNoExt))) {
            const fullP = path.join(desktopDir, entry);
            if (fullP.toLowerCase() !== sourcePath.toLowerCase()) {
              tryCleanUpSource(fullP);
              return;
            }
          }
        }
      }
    } catch (e) {}
  };

  try {
    watcher = fs.watch(desktopDir, (eventType, filename) => {
      if (!filename) return;
      const fLow = filename.toLowerCase();
      if (fLow === baseName.toLowerCase() || fLow.startsWith(nameNoExt)) {
        checkForDroppedItem();
      }
    });
  } catch (e) {}

  pollInterval = setInterval(checkForDroppedItem, 120);

  const stopTimeout = setTimeout(() => {
    if (!cleanedUp) {
      cleanedUp = true;
      if (watcher) { try { watcher.close(); } catch (e) {} }
      if (pollInterval) { clearInterval(pollInterval); }
    }
  }, 25000);

  pendingDragCleanup = {
    sourcePath,
    fenceId,
    iconId,
    checkNow: checkForDroppedItem,
    stop: () => {
      cleanedUp = true;
      clearTimeout(stopTimeout);
      if (watcher) { try { watcher.close(); } catch (e) {} }
      if (pollInterval) { clearInterval(pollInterval); }
    }
  };
}

ipcMain.on('topapp:start-drag-item', async (event, param) => {
  try {
    const filePath = typeof param === 'string' ? param : param?.filePath;
    let fenceId = typeof param === 'object' ? param?.fenceId : null;
    let iconId = typeof param === 'object' ? param?.iconId : null;

    if (!filePath || !fs.existsSync(filePath)) return;

    if (!fenceId) {
      for (const f of (appConfig.fences || [])) {
        const it = (f.icons || []).find(i => i.path && i.path.toLowerCase() === filePath.toLowerCase());
        if (it) {
          fenceId = f.id;
          iconId = it.id;
          break;
        }
      }
    }

    setupDesktopDropWatch(filePath, fenceId, iconId);

    let dragIcon = null;
    try {
      dragIcon = await app.getFileIcon(filePath, { size: 'normal' });
    } catch (e) {}

    if (!dragIcon || dragIcon.isEmpty()) {
      const fallbackPath = path.join(__dirname, 'assets/folder.png');
      if (fs.existsSync(fallbackPath)) {
        dragIcon = nativeImage.createFromPath(fallbackPath);
      }
    }

    if (!dragIcon || dragIcon.isEmpty()) {
      dragIcon = nativeImage.createEmpty();
    }

    event.sender.startDrag({
      file: filePath,
      icon: dragIcon
    });
  } catch (err) {
    console.error('Error in topapp:start-drag-item:', err);
  }
});

ipcMain.on('topapp:end-drag-item', (event, param) => {
  if (pendingDragCleanup) {
    pendingDragCleanup.checkNow();
    setTimeout(() => { if (pendingDragCleanup) pendingDragCleanup.checkNow(); }, 100);
    setTimeout(() => { if (pendingDragCleanup) pendingDragCleanup.checkNow(); }, 300);
    setTimeout(() => { if (pendingDragCleanup) pendingDragCleanup.checkNow(); }, 800);
    setTimeout(() => { if (pendingDragCleanup) pendingDragCleanup.checkNow(); }, 1800);
  }
});

// Apply Wallpaper directly to Windows
ipcMain.handle('topapp:apply-windows-wallpaper', async (event, color1, color2, angle = 180) => {
  const script = `
Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;

public class WinThemeMod {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);

    public static string CreateAndSetGradient(string hex1, string hex2, float angle) {
        int w = 1920, h = 1080;
        using (Bitmap bmp = new Bitmap(w, h)) {
            using (Graphics g = Graphics.FromImage(bmp)) {
                Color c1 = ColorTranslator.FromHtml(hex1);
                Color c2 = ColorTranslator.FromHtml(hex2);
                using (LinearGradientBrush brush = new LinearGradientBrush(new Rectangle(0, 0, w, h), c1, c2, angle)) {
                    g.FillRectangle(brush, 0, 0, w, h);
                }
            }
            string outPath = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyPictures), "TopApp_Modular_Wallpaper.jpg");
            bmp.Save(outPath, System.Drawing.Imaging.ImageFormat.Jpeg);
            SystemParametersInfo(20, 0, outPath, 3);
            return outPath;
        }
    }
}
"@ -ReferencedAssemblies System.Drawing
[WinThemeMod]::CreateAndSetGradient('${color1}', '${color2}', ${angle})
`;

  return new Promise((resolve) => {
    const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script]);
    let output = '';
    ps.stdout.on('data', d => { output += d.toString(); });
    ps.on('close', code => {
      resolve({ ok: code === 0, path: output.trim() });
    });
  });
});

// Get Wallpapers Collection from /fondos folder
ipcMain.handle('topapp:get-wallpapers', async () => {
  const foldersToSearch = [
    path.join(process.resourcesPath || '', 'app.asar.unpacked/fondos'),
    path.join(process.resourcesPath || '', 'fondos'),
    path.join(__dirname, '../fondos'),
    path.join(__dirname, 'fondos'),
    path.join(process.cwd(), 'fondos'),
    path.join(process.resourcesPath || '', 'app/fondos')
  ];
  let targetFolder = null;
  for (const f of foldersToSearch) {
    if (fs.existsSync(f)) {
      targetFolder = f;
      break;
    }
  }
  if (!targetFolder) return [];
  try {
    const files = fs.readdirSync(targetFolder);
    const wallpapers = [];
    for (const file of files) {
      if (/\.(jpe?g|png|webp|bmp)$/i.test(file)) {
        const fullPath = path.join(targetFolder, file);
        let cleanName = file.replace(/\-unsplash.*$/i, '').replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        wallpapers.push({
          id: file,
          name: cleanName,
          filename: file,
          fullPath: fullPath,
          url: `file:///${fullPath.replace(/\\/g, '/')}`,
          author: cleanName,
          source: 'https://unsplash.com/'
        });
      }
    }
    return wallpapers;
  } catch (err) {
    console.error('Error reading wallpapers:', err);
    return [];
  }
});

// Helper function to reliably apply any image as Windows desktop wallpaper
async function applyWindowsImageWallpaper(imagePath) {
  if (!imagePath || !fs.existsSync(imagePath)) return { ok: false, error: 'File not found' };
  try {
    const imgBuffer = fs.readFileSync(imagePath);
    const themesDir = path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Themes');
    if (!fs.existsSync(themesDir)) {
      fs.mkdirSync(themesDir, { recursive: true });
    }

    const tempSource = path.join(themesDir, 'TopAppTempSource.dat');
    fs.writeFileSync(tempSource, imgBuffer);

    const transcoded = path.join(themesDir, 'TranscodedWallpaper');
    fs.writeFileSync(transcoded, imgBuffer);

    const wallpaperBmp = path.join(themesDir, 'TopAppWallpaper.bmp');
    const psScriptPath = path.join(themesDir, 'set_wallpaper.ps1');

    const psScriptContent = `
Add-Type -AssemblyName System.Drawing
try {
    $img = [System.Drawing.Image]::FromFile('${tempSource.replace(/'/g, "''")}')
    $img.Save('${wallpaperBmp.replace(/'/g, "''")}', [System.Drawing.Imaging.ImageFormat]::Bmp)
    $img.Dispose()
} catch {
    Write-Warning "BMP conversion fallback"
}

$regPath = "HKCU:\\Control Panel\\Desktop"
Set-ItemProperty -Path $regPath -Name WallpaperStyle -Value "10"
Set-ItemProperty -Path $regPath -Name TileWallpaper -Value "0"
Set-ItemProperty -Path $regPath -Name Wallpaper -Value '${wallpaperBmp.replace(/'/g, "''")}'

$code = @"
using System;
using System.Runtime.InteropServices;
public class WinSPI_App {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
    public static int SetWall(string path) {
        return SystemParametersInfo(20, 0, path, 3);
    }
}
"@
if (-not ([System.Management.Automation.PSTypeName]'WinSPI_App').Type) {
    Add-Type -TypeDefinition $code
}
$res = [WinSPI_App]::SetWall('${wallpaperBmp.replace(/'/g, "''")}')
Write-Host "SPI Result:" $res
`;

    fs.writeFileSync(psScriptPath, psScriptContent, 'utf8');

    return new Promise((resolve) => {
      const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', psScriptPath]);
      ps.on('close', code => {
        resolve({ ok: code === 0, path: imagePath, name: path.basename(imagePath) });
      });
    });
  } catch (err) {
    console.error('Error applying Windows wallpaper:', err);
    return { ok: false, error: err.message };
  }
}

// Apply Image Wallpaper directly to Windows desktop
ipcMain.handle('topapp:apply-image-wallpaper', async (event, imagePath) => {
  return applyWindowsImageWallpaper(imagePath);
});

// Choose Custom Wallpaper file from PC
ipcMain.handle('topapp:choose-custom-wallpaper', async () => {
  const res = await dialog.showOpenDialog({
    title: 'Seleccionar Fondo de Escritorio',
    filters: [
      { name: 'Imágenes (*.jpg, *.png, *.webp, *.bmp)', extensions: ['jpg', 'jpeg', 'png', 'bmp', 'webp'] }
    ],
    properties: ['openFile']
  });
  if (res.canceled || !res.filePaths.length) return { canceled: true };
  const chosenPath = res.filePaths[0];
  return applyWindowsImageWallpaper(chosenPath);
});

// ==========================================
// TOPAPP SMART CLIPBOARD HISTORY MONITOR
// ==========================================
let clipboardHistory = [];
const MAX_CLIPBOARD_ITEMS = 12;
let lastClipboardHash = '';
let ignoreNextClipboardHash = '';
let clipboardPollTimer = null;

function broadcastClipboardChanged() {
  const sanitized = clipboardHistory.map(it => ({
    id: it.id,
    type: it.type,
    text: it.text,
    preview: it.preview,
    thumbnail: it.thumbnail,
    width: it.width,
    height: it.height,
    sizeStr: it.sizeStr,
    fileSizeKB: it.fileSizeKB,
    charCount: it.charCount,
    wordCount: it.wordCount,
    timestamp: it.timestamp
  }));
  if (widgetsWindow && !widgetsWindow.isDestroyed()) widgetsWindow.webContents.send('topapp:clipboard-changed', sanitized);
  if (leftWidgetWindow && !leftWidgetWindow.isDestroyed()) leftWidgetWindow.webContents.send('topapp:clipboard-changed', sanitized);
  if (hubWindow && !hubWindow.isDestroyed()) hubWindow.webContents.send('topapp:clipboard-changed', sanitized);
}

async function checkClipboardContent() {
  try {
    let handled = false;

    // 1. Check for images first
    if (clipboard.read) {
      try {
        const items = await clipboard.read();
        for (const item of items) {
          if (item.types && item.types.includes('image/png')) {
            try {
              const blob = await item.getType('image/png');
              const ab = await blob.arrayBuffer();
              const buf = Buffer.from(ab);
              const hash = 'img_' + buf.length + '_' + buf.slice(0, 32).toString('hex');

              if (hash === ignoreNextClipboardHash) {
                ignoreNextClipboardHash = '';
                lastClipboardHash = hash;
                handled = true;
                break;
              }

              if (hash !== lastClipboardHash) {
                lastClipboardHash = hash;
                let img = null;
                try {
                  img = nativeImage.createFromBuffer(buf);
                  if (!img || img.isEmpty()) {
                    img = nativeImage.createFromDataURL('data:image/png;base64,' + buf.toString('base64'));
                  }
                } catch (e) {}

                const size = (img && !img.isEmpty()) ? img.getSize() : { width: 0, height: 0 };
                let thumb = '';
                try {
                  if (img && !img.isEmpty()) {
                    const resized = img.resize({ width: Math.min(140, Math.max(20, size.width || 140)), quality: 'good' });
                    thumb = 'data:image/jpeg;base64,' + resized.toJPEG(75).toString('base64');
                  }
                } catch (e) {}

                const newItem = {
                  id: 'clip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                  type: 'image',
                  thumbnail: thumb || ('data:image/png;base64,' + buf.toString('base64')),
                  fullBuffer: buf,
                  width: size.width,
                  height: size.height,
                  sizeStr: size.width && size.height ? `${size.width}×${size.height}` : 'Imagen',
                  fileSizeKB: Math.round(buf.length / 1024),
                  timestamp: Date.now()
                };
                clipboardHistory.unshift(newItem);
                if (clipboardHistory.length > MAX_CLIPBOARD_ITEMS) clipboardHistory.pop();

                // Memory trim: Keep fullBuffer only for the 2 most recent images
                let imgCount = 0;
                for (const it of clipboardHistory) {
                  if (it.type === 'image') {
                    imgCount++;
                    if (imgCount > 2) it.fullBuffer = null;
                  }
                }

                broadcastClipboardChanged();
              }
            } catch (errBlob) {}
            handled = true;
            break;
          }
        }
      } catch (errRead) {}
    }

    // 2. Check for text if not an image
    if (!handled && clipboard.readText) {
      try {
        const text = await clipboard.readText();
        if (text && text.trim()) {
          const hash = 'txt_' + text.length + '_' + text.slice(0, 48);

          if (hash === ignoreNextClipboardHash) {
            ignoreNextClipboardHash = '';
            lastClipboardHash = hash;
            return;
          }

          if (hash !== lastClipboardHash) {
            lastClipboardHash = hash;
            const trimmed = text.trim();
            let type = 'text';

            if (/^https?:\/\/[^\s]+$/i.test(trimmed)) {
              type = 'url';
            } else if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed) || /^rgba?\([^\)]+\)$/i.test(trimmed) || /^hsla?\([^\)]+\)$/i.test(trimmed)) {
              type = 'color';
            } else if (
              (trimmed.includes('{') && trimmed.includes('}')) ||
              trimmed.includes('function(') ||
              trimmed.includes('const ') ||
              trimmed.includes('let ') ||
              trimmed.includes('var ') ||
              trimmed.includes('import ') ||
              trimmed.includes('export ') ||
              trimmed.includes('class ') ||
              trimmed.includes('def ') ||
              trimmed.includes('return ') ||
              (trimmed.includes(';') && trimmed.includes('\n'))
            ) {
              type = 'code';
            }

            const preview = trimmed.length > 120 ? trimmed.slice(0, 120) + '...' : trimmed;
            const words = trimmed.split(/\s+/).filter(Boolean).length;

            const newItem = {
              id: 'clip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              type,
              text,
              preview,
              charCount: text.length,
              wordCount: words,
              timestamp: Date.now()
            };
            clipboardHistory.unshift(newItem);
            if (clipboardHistory.length > MAX_CLIPBOARD_ITEMS) clipboardHistory.pop();
            broadcastClipboardChanged();
          }
        }
      } catch (errText) {}
    }
  } catch (err) {}
}

function startClipboardMonitor() {
  if (clipboardPollTimer) clearInterval(clipboardPollTimer);
  checkClipboardContent().catch(() => {});
  clipboardPollTimer = setInterval(() => {
    checkClipboardContent().catch(() => {});
  }, 1000);
}

ipcMain.handle('topapp:get-clipboard-history', () => {
  return clipboardHistory.map(it => ({
    id: it.id,
    type: it.type,
    text: it.text,
    preview: it.preview,
    thumbnail: it.thumbnail,
    width: it.width,
    height: it.height,
    sizeStr: it.sizeStr,
    fileSizeKB: it.fileSizeKB,
    charCount: it.charCount,
    wordCount: it.wordCount,
    timestamp: it.timestamp
  }));
});

ipcMain.handle('topapp:copy-clipboard-item', async (event, itemId) => {
  const item = clipboardHistory.find(it => it.id === itemId);
  if (!item) return { ok: false, error: 'Item no encontrado' };

  try {
    if (item.type === 'image') {
      const buf = item.fullBuffer || (item.thumbnail && item.thumbnail.includes(',') ? Buffer.from(item.thumbnail.split(',')[1], 'base64') : null);
      if (buf) {
        const hash = 'img_' + buf.length + '_' + buf.slice(0, 32).toString('hex');
        ignoreNextClipboardHash = hash;
        lastClipboardHash = hash;
        const mime = (item.thumbnail && item.thumbnail.startsWith('data:image/jpeg')) ? 'image/jpeg' : 'image/png';
        const blob = new Blob([buf], { type: mime });
        await clipboard.write([new ClipboardItem({ [mime]: blob })]);
      }
    } else if (item.text) {
      const hash = 'txt_' + item.text.length + '_' + item.text.slice(0, 48);
      ignoreNextClipboardHash = hash;
      lastClipboardHash = hash;
      await clipboard.writeText(item.text);
    }

    item.timestamp = Date.now();
    clipboardHistory = [item, ...clipboardHistory.filter(it => it.id !== itemId)];
    broadcastClipboardChanged();
    return { ok: true, type: item.type };
  } catch (err) {
    console.error('Error copying clipboard item:', err);
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('topapp:delete-clipboard-item', (event, itemId) => {
  clipboardHistory = clipboardHistory.filter(it => it.id !== itemId);
  broadcastClipboardChanged();
  return { ok: true };
});

ipcMain.handle('topapp:clear-clipboard-history', () => {
  clipboardHistory = [];
  lastClipboardHash = '';
  broadcastClipboardChanged();
  return { ok: true };
});

let tray = null;
function createSystemTray() {
  if (tray) return;
  try {
    const icoPath = path.join(__dirname, 'assets/icon.ico');
    const pngPath = path.join(__dirname, 'assets/logo.png');
    if (fs.existsSync(icoPath)) {
      try {
        tray = new Tray(icoPath);
      } catch (e) {
        tray = null;
      }
    }
    if (!tray && fs.existsSync(pngPath)) {
      try {
        const img = nativeImage.createFromPath(pngPath);
        if (img && !img.isEmpty()) {
          tray = new Tray(img.resize({ width: 16, height: 16 }));
        }
      } catch (e) {
        tray = null;
      }
    }
    if (!tray) return;

    tray.setToolTip('TopApp WinTheme Pro v2.4.0');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'TopApp WinTheme Pro v2.4.0',
        enabled: false
      },
      { type: 'separator' },
      {
        label: '⚙️ Abrir Panel de Control',
        click: () => {
          createHubWindow();
        }
      },
      {
        label: '🚀 Mostrar / Ocultar Dock',
        click: () => {
          if (dockWindow && !dockWindow.isDestroyed()) {
            if (dockWindow.isVisible()) dockWindow.hide();
            else {
              dockWindow.show();
              dockWindow.focus();
            }
          } else {
            createDockWindow();
          }
        }
      },
      {
        label: '🪟 Mostrar / Ocultar Widgets',
        click: () => {
          if (widgetsWindow && !widgetsWindow.isDestroyed()) {
            if (widgetsWindow.isVisible()) {
              widgetsWindow.hide();
              if (leftWidgetWindow && !leftWidgetWindow.isDestroyed()) leftWidgetWindow.hide();
            } else {
              widgetsWindow.show();
              if (leftWidgetWindow && !leftWidgetWindow.isDestroyed()) leftWidgetWindow.show();
            }
          } else {
            createWidgetsWindow();
            createLeftWidgetWindow();
          }
        }
      },
      {
        label: '🧹 Liberar Memoria RAM',
        click: () => {
          trimSuiteMemory();
        }
      },
      { type: 'separator' },
      {
        label: '🔄 Reiniciar Suite',
        click: () => {
          app.relaunch();
          app.exit(0);
        }
      },
      {
        label: '❌ Salir de TopApp WinTheme Pro',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      createHubWindow();
    });
    tray.on('click', () => {
      createHubWindow();
    });
  } catch (err) {
    console.warn('[SystemTray Error]:', err);
  }
}

app.whenReady().then(() => {
  if (session && session.defaultSession) {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'media') return callback(true);
      callback(true);
    });
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
      return true;
    });
  }
  saveOriginalWorkArea();
  applyDesktopWorkArea();
  configureWindowsAutostart(!!appConfig.autoStartOnBoot);
  startThermalDaemon();
  startClipboardMonitor();
  if (appConfig.dockEnabled) {
    createDockWindow();
    setTimeout(upgradeDockIconsToHighRes, 1200);
  }
  if (hasAnyActiveWidget()) createWidgetsWindow();
  if (appConfig.leftWidgetEnabled !== false) createLeftWidgetWindow();
  if (appConfig.curtainButtonsEnabled !== false) createCurtainToggleWindow();
  (appConfig.fences || []).forEach(f => createFenceWindow(f));

  // Initialize System Tray
  createSystemTray();

  // ALWAYS create Hub window on launch so the user sees the application UI immediately
  createHubWindow();

  // Auto-trim working set once loaded and periodically to keep RAM minimal
  setTimeout(trimSuiteMemory, 5000);
  setInterval(trimSuiteMemory, 90000);
});

app.on('will-quit', () => {
  app.isQuitting = true;
  if (tray) {
    try { tray.destroy(); } catch (e) {}
  }
  restoreOriginalWorkArea();
  if (clipboardPollTimer) {
    try { clearInterval(clipboardPollTimer); } catch (e) {}
  }
  if (thermalDaemonProcess) {
    try { thermalDaemonProcess.kill(); } catch (e) {}
  }
});

process.on('exit', () => {
  restoreOriginalWorkArea();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
