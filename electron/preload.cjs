// TopApp WinTheme Pro - Preload: expone una API mínima y segura al interfaz
const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('topappNative', {
  isNative: true,
  launch: (payload) => ipcRenderer.invoke('topapp:launch', payload),
  openUri: (uri) => ipcRenderer.invoke('topapp:open-uri', uri),
  power: (action) => ipcRenderer.invoke('topapp:power', action),
  getStats: () => ipcRenderer.invoke('topapp:stats'),
  openPath: (targetPath) => ipcRenderer.invoke('topapp:open-path', targetPath),
  showInFolder: (targetPath) => ipcRenderer.invoke('topapp:show-in-folder', targetPath),
  getIcon: (filePath) => ipcRenderer.invoke('topapp:get-icon', filePath),
  chooseFile: (filters) => ipcRenderer.invoke('topapp:choose-file', filters),
  chooseFolder: () => ipcRenderer.invoke('topapp:choose-folder'),
  readDir: (dirPath) => ipcRenderer.invoke('topapp:read-dir', dirPath),
  getPlaces: () => ipcRenderer.invoke('topapp:get-places'),
  searchFiles: (params) => ipcRenderer.invoke('topapp:search-files', params),
  createDir: (parentDir, dirName) => ipcRenderer.invoke('topapp:create-dir', { parentDir, dirName }),
  renamePath: (oldPath, newPath) => ipcRenderer.invoke('topapp:rename-path', { oldPath, newPath }),
  trashItem: (targetPath) => ipcRenderer.invoke('topapp:trash-item', targetPath),
  openWith: (targetPath) => ipcRenderer.invoke('topapp:open-with', targetPath),
  scanApps: () => ipcRenderer.invoke('topapp:scan-apps'),
  // Ruta real en disco de un archivo elegido con <input type="file"> o drag & drop
  getFilePath: (file) => {
    try { return webUtils.getPathForFile(file) || file.path || ''; } catch { return file.path || ''; }
  }
});
