// TopApp WinTheme Pro - Proceso principal de Electron (puente con Windows real)
// - Sirve la interfaz compilada (dist/) desde un servidor local interno
// - Expone acciones REALES al interfaz: abrir programas, ms-settings, energía, telemetría

const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { spawn, execFile } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

const IS_DEV = process.argv.includes('--dev');
const DEV_URL = 'http://localhost:5173';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// ---------------------------------------------------------------------------
// Servidor estático local (mantiene funcionando las rutas absolutas "/logo.svg")
// ---------------------------------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const rawUrl = (req.url || '/').split('?')[0];
      if (rawUrl.startsWith('/local-file/')) {
        const localTarget = decodeURIComponent(rawUrl.slice(12));
        try {
          if (fs.existsSync(localTarget) && !fs.statSync(localTarget).isDirectory()) {
            const ext = path.extname(localTarget).toLowerCase();
            res.writeHead(200, {
              'Content-Type': MIME[ext] || 'application/octet-stream',
              'Cache-Control': 'max-age=86400'
            });
            fs.createReadStream(localTarget).pipe(res);
            return;
          }
        } catch {}
      }

      const urlPath = decodeURIComponent(rawUrl);
      let filePath = path.normalize(path.join(DIST_DIR, urlPath));
      if (!filePath.startsWith(DIST_DIR)) {
        res.writeHead(403); res.end(); return;
      }
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.on('error', reject);
    // Puerto fijo para que localStorage (tu configuración) se conserve entre arranques
    server.listen(47615, '127.0.0.1', () => resolve(`http://127.0.0.1:47615`));
  });
}

// ---------------------------------------------------------------------------
// Ventana principal
// ---------------------------------------------------------------------------
let mainWindow = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 950,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: '#181b23',
    autoHideMenuBar: true,
    title: 'TopApp WinTheme Pro',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // Enlaces externos -> navegador por defecto, nunca dentro de la app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openUriSafe(url);
    return { action: 'deny' };
  });

  const url = IS_DEV ? DEV_URL : await startStaticServer();
  await mainWindow.loadURL(url);
}

// ---------------------------------------------------------------------------
// Utilidades seguras
// ---------------------------------------------------------------------------
const ALLOWED_URI = /^(ms-settings:|ms-clock:|ms-photos:|ms-windows-store:|spotify:|mailto:|https?:\/\/)/i;

function openUriSafe(uri) {
  if (typeof uri !== 'string' || !ALLOWED_URI.test(uri)) return false;
  shell.openExternal(uri).catch(() => {});
  return true;
}

// Lanza un programa usando "start", que resuelve App Paths del registro
// (chrome.exe, code, spotify, etc.) igual que Win+R.
function startDetached(target, args = []) {
  const child = spawn('cmd.exe', ['/d', '/s', '/c', 'start', '""', target, ...args], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });
  child.unref();
}

// Apps base del Dock -> acción real en Windows
const BUILTIN_APPS = {
  finder:   () => startDetached('explorer.exe'),
  explorer: () => startDetached('explorer.exe'),
  safari:   () => shell.openExternal('https://www.google.com'),
  browser:  () => shell.openExternal('https://www.google.com'),
  chrome:   () => startDetached('chrome.exe'),
  terminal: () => startDetached('wt.exe'),
  code:     () => startDetached('code'),
  spotify:  () => shell.openExternal('spotify:'),
  photos:   () => shell.openExternal('ms-photos:'),
  settings: () => shell.openExternal('ms-settings:'),
  trash:    () => startDetached('explorer.exe', ['shell:RecycleBinFolder']),
  taskmgr:  () => startDetached('taskmgr.exe'),
  discord:  () => shell.openExternal('discord://'),
  steam:    () => shell.openExternal('steam://open/main')
};

const SAFE_EXE = /^[\w .()+-]+\.exe$/i;

function launchApp(payload = {}) {
  const { id, icon, exe, path: exePath } = payload;

  // 1) Ruta completa elegida por el usuario con el botón "Examinar"
  if (exePath && typeof exePath === 'string' && /\.(exe|lnk|bat)$/i.test(exePath) && fs.existsSync(exePath)) {
    shell.openPath(exePath);
    return { ok: true, via: 'path' };
  }
  // 2) Apps base conocidas
  const key = String(id || '').toLowerCase();
  const iconKey = String(icon || '').toLowerCase();
  if (BUILTIN_APPS[key]) { BUILTIN_APPS[key](); return { ok: true, via: 'builtin' }; }
  // 3) Nombre de ejecutable del catálogo (Chrome.exe, Spotify.exe...)
  if (exe && SAFE_EXE.test(exe)) {
    const lower = exe.toLowerCase().replace('.exe', '');
    if (BUILTIN_APPS[lower]) { BUILTIN_APPS[lower](); return { ok: true, via: 'builtin-exe' }; }
    startDetached(exe);
    return { ok: true, via: 'exe' };
  }
  // 4) Último intento por tipo de icono
  if (BUILTIN_APPS[iconKey]) { BUILTIN_APPS[iconKey](); return { ok: true, via: 'icon' }; }
  return { ok: false, reason: 'Esta app no tiene un ejecutable asociado. Vuelve a añadirla desde el catálogo o con "Examinar".' };
}

// ---------------------------------------------------------------------------
// Telemetría real: RAM + carga por núcleo
// ---------------------------------------------------------------------------
let prevCpu = os.cpus().map(c => c.times);

function getStats() {
  const cpus = os.cpus();
  const loads = cpus.map((c, i) => {
    const p = prevCpu[i] || c.times;
    const idle = c.times.idle - p.idle;
    const total = Object.keys(c.times).reduce((acc, k) => acc + (c.times[k] - p[k]), 0);
    return total > 0 ? Math.round(100 * (1 - idle / total)) : 0;
  });
  prevCpu = cpus.map(c => c.times);
  const total = os.totalmem();
  const free = os.freemem();
  return {
    cpuModel: cpus[0] ? cpus[0].model.trim() : 'CPU',
    coresLoad: loads,
    cpuAvg: loads.length ? Math.round(loads.reduce((a, b) => a + b, 0) / loads.length) : 0,
    ramTotalGB: +(total / 1073741824).toFixed(1),
    ramUsedGB: +((total - free) / 1073741824).toFixed(1),
    uptimeSec: os.uptime()
  };
}

// ---------------------------------------------------------------------------
// Energía (con confirmación obligatoria en las acciones destructivas)
// ---------------------------------------------------------------------------
async function powerAction(action) {
  const needsConfirm = { shutdown: 'apagar el equipo', restart: 'reiniciar el equipo', signout: 'cerrar la sesión' };
  if (needsConfirm[action]) {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      buttons: ['Cancelar', 'Sí, continuar'],
      defaultId: 0,
      cancelId: 0,
      title: 'TopApp WinTheme Pro',
      message: `¿Seguro que quieres ${needsConfirm[action]}?`,
      detail: 'Guarda tu trabajo abierto antes de continuar.'
    });
    if (response !== 1) return { ok: false, cancelled: true };
  }
  switch (action) {
    case 'shutdown': execFile('shutdown', ['/s', '/t', '0']); break;
    case 'restart':  execFile('shutdown', ['/r', '/t', '0']); break;
    case 'signout':  execFile('shutdown', ['/l']); break;
    case 'lock':     execFile('rundll32.exe', ['user32.dll,LockWorkStation']); break;
    case 'sleep':    execFile('rundll32.exe', ['powrprof.dll,SetSuspendState', '0,1,0']); break;
    default: return { ok: false, reason: 'acción desconocida' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Sistema de archivos nativo, iconos y búsqueda en Windows
// ---------------------------------------------------------------------------
const TYPE_EXTS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.avif'],
  videos: ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.webm', '.flv'],
  docs: ['.doc', '.docx', '.txt', '.rtf', '.odt', '.xlsx', '.xls', '.pptx', '.ppt', '.csv', '.md'],
  pdf: ['.pdf'],
  code: ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json', '.ps1', '.bat', '.sh', '.c', '.cpp', '.cs', '.php', '.rs', '.go', '.java', '.sql', '.yaml', '.yml'],
  audio: ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.wma']
};

function getFileCategory(ext) {
  const e = (ext || '').toLowerCase();
  for (const [cat, exts] of Object.entries(TYPE_EXTS)) {
    if (exts.includes(e)) return cat;
  }
  if (['.exe', '.lnk', '.msi'].includes(e)) return 'app';
  if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(e)) return 'archive';
  return 'file';
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function readDirectory(dirPath) {
  try {
    const target = dirPath || os.homedir();
    const entries = await fs.promises.readdir(target, { withFileTypes: true });
    const items = [];
    for (const ent of entries) {
      if (ent.name.startsWith('$') || ent.name.startsWith('System Volume Information') || ent.name === 'pagefile.sys' || ent.name === 'hiberfil.sys' || ent.name === 'DumpStack.log.tmp') continue;
      const fullPath = path.join(target, ent.name);
      const isDir = ent.isDirectory();
      let sizeStr = isDir ? 'Carpeta' : '';
      let mtime = null;
      try {
        const stat = await fs.promises.stat(fullPath);
        if (!isDir) sizeStr = formatBytes(stat.size);
        mtime = stat.mtime;
      } catch {}
      const ext = path.extname(ent.name);
      const extLower = ext.toLowerCase();
      const isLnk = extLower === '.lnk';
      const isExe = extLower === '.exe';

      let iconUrl = null;
      if (isLnk || isExe || extLower === '.ico') {
        try {
          const ic = await app.getFileIcon(fullPath, { size: 'large' });
          if (ic && !ic.isEmpty()) iconUrl = ic.toDataURL();
        } catch {}
      }

      items.push({
        name: ent.name,
        path: fullPath,
        isDirectory: isDir,
        size: sizeStr,
        mtime: mtime,
        ext: extLower,
        type: isDir ? 'folder' : getFileCategory(extLower),
        isShortcut: isLnk,
        iconUrl: iconUrl
      });
    }
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
    return { ok: true, currentPath: target, items };
  } catch (err) {
    return { ok: false, error: err.message, currentPath: dirPath, items: [] };
  }
}

async function getDrivesAndPlaces() {
  const home = os.homedir();
  const places = [
    { id: 'desktop', name: 'Escritorio', path: path.join(home, 'Desktop'), icon: 'desktop' },
    { id: 'downloads', name: 'Descargas', path: path.join(home, 'Downloads'), icon: 'downloads' },
    { id: 'documents', name: 'Documentos', path: path.join(home, 'Documents'), icon: 'documents' },
    { id: 'pictures', name: 'Imágenes', path: path.join(home, 'Pictures'), icon: 'pictures' },
    { id: 'videos', name: 'Vídeos', path: path.join(home, 'Videos'), icon: 'videos' },
    { id: 'music', name: 'Música', path: path.join(home, 'Music'), icon: 'music' }
  ].filter(p => fs.existsSync(p.path));

  const drives = [];
  for (const letter of ['C', 'D', 'E', 'F', 'G', 'Z']) {
    const drivePath = `${letter}:\\`;
    if (fs.existsSync(drivePath)) {
      drives.push({ id: `drive-${letter}`, name: `Disco Local (${letter}:)`, path: drivePath, icon: 'disk' });
    }
  }

  return { places, drives, home };
}

async function searchFiles(folderPath, query = '', type = 'all', maxResults = 120) {
  const baseDir = (folderPath && fs.existsSync(folderPath)) ? folderPath : path.join(os.homedir(), 'Documents');
  const results = [];
  const q = String(query || '').toLowerCase().trim();
  const allowedExts = TYPE_EXTS[type] || null;

  async function walk(current, depth = 0) {
    if (results.length >= maxResults || depth > 4) return;
    let entries;
    try {
      entries = await fs.promises.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (results.length >= maxResults) break;
      if (ent.name.startsWith('.') || ent.name.startsWith('$') || ent.name === 'node_modules' || ent.name === 'AppData') continue;
      const fullPath = path.join(current, ent.name);
      if (ent.isDirectory()) {
        await walk(fullPath, depth + 1);
      } else {
        const ext = path.extname(ent.name).toLowerCase();
        if (allowedExts && !allowedExts.includes(ext)) continue;
        if (q && !ent.name.toLowerCase().includes(q)) continue;
        let sizeStr = '';
        let mtime = null;
        try {
          const stat = await fs.promises.stat(fullPath);
          sizeStr = formatBytes(stat.size);
          mtime = stat.mtime;
        } catch {}
        results.push({
          name: ent.name,
          path: fullPath,
          size: sizeStr,
          date: mtime ? new Date(mtime).toLocaleDateString() : 'Reciente',
          type: getFileCategory(ext),
          ext
        });
      }
    }
  }

  await walk(baseDir);
  return { ok: true, searchDir: baseDir, results };
}

// ---------------------------------------------------------------------------
// Resolución de ejecutables en Windows (where.exe + App Paths comunes)
// ---------------------------------------------------------------------------
function resolveExePath(target) {
  if (!target) return Promise.resolve(null);
  if (fs.existsSync(target)) return Promise.resolve(target);
  return new Promise((resolve) => {
    const baseName = path.basename(target);
    execFile('where.exe', [baseName], (err, stdout) => {
      if (!err && stdout) {
        const firstLine = stdout.trim().split(/\r?\n/)[0];
        if (firstLine && fs.existsSync(firstLine)) return resolve(firstLine);
      }
      // Common Windows app paths
      const home = os.homedir();
      const fallbacks = [
        path.join(process.env.LOCALAPPDATA || '', 'Programs', baseName.replace(/\.exe$/i, ''), baseName),
        path.join(process.env.PROGRAMFILES || 'C:\\Program Files', baseName.replace(/\.exe$/i, ''), baseName),
        path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', baseName.replace(/\.exe$/i, ''), baseName),
        path.join('C:\\Windows', baseName),
        path.join('C:\\Windows\\System32', baseName)
      ];
      for (const p of fallbacks) {
        if (fs.existsSync(p)) return resolve(p);
      }
      resolve(null);
    });
  });
}

// ---------------------------------------------------------------------------
// IPC
// ---------------------------------------------------------------------------
ipcMain.handle('topapp:launch', (_e, payload) => launchApp(payload));
ipcMain.handle('topapp:open-uri', (_e, uri) => ({ ok: openUriSafe(uri) }));
ipcMain.handle('topapp:power', (_e, action) => powerAction(action));
ipcMain.handle('topapp:stats', () => getStats());
ipcMain.handle('topapp:open-path', async (_e, targetPath) => {
  if (!targetPath) return { ok: false };
  const err = await shell.openPath(targetPath);
  return { ok: !err, error: err };
});
ipcMain.handle('topapp:open-with', async (_e, targetPath) => {
  if (!targetPath) return { ok: false };
  try {
    exec(`rundll32.exe shell32.dll,OpenAs_RunDLL "${targetPath}"`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});
ipcMain.handle('topapp:show-in-folder', (_e, targetPath) => {
  if (targetPath) shell.showItemInFolder(targetPath);
  return { ok: true };
});
ipcMain.handle('topapp:get-icon', async (_e, filePath) => {
  try {
    if (!filePath) return null;
    let resolved = filePath;
    if (!fs.existsSync(resolved)) {
      resolved = await resolveExePath(filePath);
    }
    if (!resolved || !fs.existsSync(resolved)) return null;

    if (/\.(png|jpe?g|webp|svg|ico)$/i.test(resolved)) {
      const ext = path.extname(resolved).toLowerCase();
      const mime = ext === '.svg' ? 'image/svg+xml' : (ext === '.ico' ? 'image/x-icon' : (ext === '.png' ? 'image/png' : 'image/jpeg'));
      const buf = await fs.promises.readFile(resolved);
      return `data:${mime};base64,${buf.toString('base64')}`;
    }

    const icon = await app.getFileIcon(resolved, { size: 'large' });
    if (icon && !icon.isEmpty()) return icon.toDataURL();
    return null;
  } catch {
    return null;
  }
});
ipcMain.handle('topapp:choose-file', async (_e, filters) => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Seleccionar aplicación o archivo',
    properties: ['openFile'],
    filters: (filters && filters.length) ? filters : [
      { name: 'Ejecutables y Accesos directos (*.exe, *.lnk)', extensions: ['exe', 'lnk', 'bat'] },
      { name: 'Imágenes (*.png, *.jpg, *.ico, *.svg)', extensions: ['png', 'jpg', 'jpeg', 'ico', 'svg'] },
      { name: 'Todos los archivos (*.*)', extensions: ['*'] }
    ]
  });
  if (res.canceled || !res.filePaths.length) return null;
  const filePath = res.filePaths[0];
  let iconUrl = null;
  try {
    if (/\.(png|jpe?g|webp|svg|ico)$/i.test(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const mime = ext === '.svg' ? 'image/svg+xml' : (ext === '.ico' ? 'image/x-icon' : (ext === '.png' ? 'image/png' : 'image/jpeg'));
      const buf = await fs.promises.readFile(filePath);
      iconUrl = `data:${mime};base64,${buf.toString('base64')}`;
    } else {
      const icon = await app.getFileIcon(filePath, { size: 'large' });
      if (icon && !icon.isEmpty()) iconUrl = icon.toDataURL();
    }
  } catch {}
  return { path: filePath, name: path.basename(filePath), iconUrl };
});
ipcMain.handle('topapp:choose-folder', async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Seleccionar carpeta',
    properties: ['openDirectory']
  });
  if (res.canceled || !res.filePaths.length) return null;
  return res.filePaths[0];
});
ipcMain.handle('topapp:read-dir', (_e, dirPath) => readDirectory(dirPath));
ipcMain.handle('topapp:get-places', () => getDrivesAndPlaces());
ipcMain.handle('topapp:search-files', (_e, { folder, query, type }) => searchFiles(folder, query, type));
ipcMain.handle('topapp:create-dir', async (_e, { parentDir, dirName }) => {
  try {
    const full = path.join(parentDir, dirName || 'Nueva Carpeta');
    let target = full;
    let counter = 1;
    while (fs.existsSync(target)) {
      target = `${full} (${counter++})`;
    }
    await fs.promises.mkdir(target, { recursive: true });
    return { ok: true, path: target };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});
ipcMain.handle('topapp:rename-path', async (_e, { oldPath, newPath }) => {
  try {
    if (!oldPath || !fs.existsSync(oldPath)) return { ok: false, error: 'File not found' };
    await fs.promises.rename(oldPath, newPath);
    return { ok: true, path: newPath };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});
ipcMain.handle('topapp:trash-item', async (_e, targetPath) => {
  try {
    if (!targetPath || !fs.existsSync(targetPath)) return { ok: false };
    await shell.trashItem(targetPath);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

async function scanInstalledApps() {
  const home = os.homedir();
  const searchDirs = [
    path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(home, 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(home, 'Desktop'),
    path.join(process.env['PUBLIC'] || 'C:\\Users\\Public', 'Desktop')
  ];

  const appMap = new Map();

  async function walk(dir) {
    let entries;
    try {
      entries = await fs.promises.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
      } else if (ent.name.endsWith('.lnk') || ent.name.endsWith('.exe')) {
        const lower = ent.name.toLowerCase();
        if (lower.includes('uninstall') || lower.includes('desinstalar') || lower.includes('readme') || lower.includes('ayuda') || lower.includes('help') || lower.endsWith('.url')) continue;

        const cleanName = ent.name.replace(/\.lnk$/i, '').replace(/\.exe$/i, '').replace(/ - Acceso directo$/i, '').trim();
        if (cleanName && !appMap.has(cleanName.toLowerCase())) {
          appMap.set(cleanName.toLowerCase(), {
            name: cleanName,
            path: full,
            exe: full
          });
        }
      }
    }
  }

  for (const d of searchDirs) {
    if (fs.existsSync(d)) await walk(d);
  }

  const list = Array.from(appMap.values());
  list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const appsWithIcons = await Promise.all(list.map(async (appItem) => {
    let iconUrl = null;
    try {
      const icon = await app.getFileIcon(appItem.path, { size: 'large' });
      if (icon && !icon.isEmpty()) iconUrl = icon.toDataURL();
    } catch {}
    return {
      name: appItem.name,
      path: appItem.path,
      exe: appItem.path,
      iconUrl
    };
  }));

  return appsWithIcons;
}

ipcMain.handle('topapp:scan-apps', () => scanInstalledApps());

// ---------------------------------------------------------------------------
// Ciclo de vida
// ---------------------------------------------------------------------------
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
  });
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());
}
