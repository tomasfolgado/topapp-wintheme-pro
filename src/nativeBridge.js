// TopApp WinTheme Pro - Puente nativo
// Dentro de la app de escritorio (Electron) ejecuta acciones REALES en Windows.
// En el navegador hace lo mismo que antes (simulación / protocolos ms-settings:).

const native = typeof window !== 'undefined' ? window.topappNative : null;

export const isNative = !!(native && native.isNative);

export function openUri(uri) {
  if (isNative) return native.openUri(uri);
  try {
    const a = document.createElement('a');
    a.href = uri;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 100);
  } catch (e) {
    window.location.href = uri;
  }
  return Promise.resolve({ ok: true });
}

// app: { id, name, icon, exe, path }
export async function launchApp(app) {
  if (!isNative) return { ok: false, simulated: true };
  return native.launch({
    id: app.id, name: app.name, icon: app.icon, exe: app.exe, path: app.path
  });
}

// action: shutdown | restart | sleep | lock | signout
export async function powerAction(action) {
  if (!isNative) return { ok: false, simulated: true };
  return native.power(action);
}

export async function getStats() {
  if (!isNative) return null;
  try { return await native.getStats(); } catch { return null; }
}

export function getFilePath(file) {
  if (!file) return '';
  if (isNative && native.getFilePath) return native.getFilePath(file);
  return file.path || '';
}

export async function openPath(targetPath) {
  if (isNative && native.openPath) return native.openPath(targetPath);
  return { ok: false, simulated: true };
}

export async function showInFolder(targetPath) {
  if (isNative && native.showInFolder) return native.showInFolder(targetPath);
  return { ok: false, simulated: true };
}

export async function getIcon(filePath) {
  if (isNative && native.getIcon) return native.getIcon(filePath);
  return null;
}

export async function chooseFile(filters) {
  if (isNative && native.chooseFile) return native.chooseFile(filters);
  return null;
}

export async function chooseFolder() {
  if (isNative && native.chooseFolder) return native.chooseFolder();
  return null;
}

export async function readDir(dirPath) {
  if (isNative && native.readDir) return native.readDir(dirPath);
  return { ok: false, simulated: true, items: [] };
}

export async function getPlaces() {
  if (isNative && native.getPlaces) return native.getPlaces();
  return null;
}

export async function searchFiles(folder, query, type) {
  if (isNative && native.searchFiles) return native.searchFiles({ folder, query, type });
  return { ok: false, simulated: true, results: [] };
}

export async function createDir(parentDir, dirName) {
  if (isNative && native.createDir) return native.createDir(parentDir, dirName);
  return { ok: false, simulated: true };
}

export async function trashItem(targetPath) {
  if (isNative && native.trashItem) return native.trashItem(targetPath);
  return { ok: false, simulated: true };
}

export async function renamePath(oldPath, newPath) {
  if (isNative && native.renamePath) return native.renamePath(oldPath, newPath);
  return { ok: false, simulated: true };
}

export async function openWith(targetPath) {
  if (isNative && native.openWith) return native.openWith(targetPath);
  return { ok: false, simulated: true };
}

export async function scanApps() {
  if (isNative && native.scanApps) return native.scanApps();
  return [];
}

