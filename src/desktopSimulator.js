// TopApp WinTheme Pro - Desktop Simulator with Windows Start Bar, Start Menu, Settings Hub & macOS Dock
// Windows Search Box, Power Menu (Shutdown, Restart, Sleep, Lock), All-Settings integration, and Modern SVGs

import { audioEngine } from './audioEngine.js';
import { isNative, openUri, launchApp, powerAction, getFilePath, openPath, showInFolder, getIcon, chooseFile, chooseFolder, readDir, getPlaces, createDir, trashItem, openWith, renamePath, scanApps } from './nativeBridge.js';

// Modern, minimalist vector SVGs
const SVGS = {
  macHD: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="12" rx="2"/><path d="M12 20h.01"/><path d="M8 20h8"/><circle cx="12" cy="10" r="2"/></svg>`,
  folder: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>`,
  folderSmall: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>`,
  terminal: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  palette: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  star: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  image: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
  audio: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v4"/><path d="M6 7v10"/><path d="M10 4v16"/><path d="M14 7v10"/><path d="M18 10v4"/></svg>`,
  disk: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M18 8h.01"/></svg>`,
  network: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  search: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  lightning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  gear: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  gearSmall: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  pin: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-2l-2-2V5a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v8l-2 2v2z"/></svg>`,
  floatWindow: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  doc: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  resizeHandle: `<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="7" cy="1" r="1"/><circle cx="7" cy="4" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="4" cy="4" r="1"/><circle cx="4" cy="7" r="1"/><circle cx="1" cy="7" r="1"/></svg>`,
  trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  compass: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  code: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  soundwave: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5v14"/><path d="M22 9v6"/><path d="M7 5v14"/><path d="M2 9v6"/></svg>`,
  camera: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  gamepad: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="6"/></svg>`
};

// Curated list of Windows .exe executables with real icons & paths
export const WINDOWS_EXE_CATALOG = [
  { exe: 'Photoshop.exe', name: 'Adobe Photoshop CC', icon: 'photoshop', color: '#001e36', path: 'Photoshop.exe', tag: 'Gráficos' },
  { exe: 'Steam.exe', name: 'Valve Steam Client', icon: 'steam', color: '#171a21', path: 'Steam.exe', tag: 'Juegos' },
  { exe: 'chrome.exe', name: 'Google Chrome', icon: 'chrome', color: '#1a73e8', path: 'chrome.exe', tag: 'Navegador' },
  { exe: 'Code.exe', name: 'Visual Studio Code', icon: 'code', color: '#007acc', path: 'Code.exe', tag: 'Desarrollo' },
  { exe: 'blender.exe', name: 'Blender 3D Suite', icon: 'blender', color: '#e87d0d', path: 'blender.exe', tag: '3D & VFX' },
  { exe: 'Spotify.exe', name: 'Spotify Music', icon: 'spotify', color: '#10b981', path: 'Spotify.exe', tag: 'Música' },
  { exe: 'Discord.exe', name: 'Discord', icon: 'discord', color: '#5865f2', path: 'Discord.exe', tag: 'Chat' },
  { exe: 'Figma.exe', name: 'Figma Desktop', icon: 'figma', color: '#0acf83', path: 'Figma.exe', tag: 'Diseño' },
  { exe: 'wt.exe', name: 'Windows Terminal Pro', icon: 'terminal', color: '#0f172a', path: 'wt.exe', tag: 'Sistema' },
  { exe: 'Premiere.exe', name: 'Adobe Premiere Pro', icon: 'premiere', color: '#00005b', path: 'Premiere.exe', tag: 'Video' },
  { exe: 'Illustrator.exe', name: 'Adobe Illustrator', icon: 'illustrator', color: '#330000', path: 'Illustrator.exe', tag: 'Vector' },
  { exe: 'obs64.exe', name: 'OBS Studio', icon: 'obs', color: '#302e31', path: 'obs64.exe', tag: 'Streaming' },
  { exe: 'Notion.exe', name: 'Notion Workspace', icon: 'notion', color: '#2f3437', path: 'Notion.exe', tag: 'Notas' },
  { exe: 'explorer.exe', name: 'Explorador de Archivos', icon: 'finder', color: '#0284c7', path: 'explorer.exe', tag: 'Sistema' }
];

// Complete Windows Settings Catalog with direct ms-settings: protocol links
export const WINDOWS_SETTINGS_ITEMS = [
  { id: 'system', name: 'Sistema', desc: 'Acerca del PC, pantalla, sonido', uri: 'ms-settings:', tag: 'Sistema' },
  { id: 'display', name: 'Pantalla', desc: 'Resolución, escala, HDR, brillo', uri: 'ms-settings:display', tag: 'Pantalla' },
  { id: 'sound', name: 'Sonido', desc: 'Dispositivos de audio, micrófono', uri: 'ms-settings:sound', tag: 'Sonido' },
  { id: 'network', name: 'Red & Wi-Fi', desc: 'Conexiones, IP, DNS, VPN', uri: 'ms-settings:network-wifi', tag: 'Red' },
  { id: 'bluetooth', name: 'Bluetooth', desc: 'Ratón, teclado, cascos, periféricos', uri: 'ms-settings:bluetooth', tag: 'Dispositivos' },
  { id: 'battery', name: 'Batería & Energía', desc: 'Suspensión, modos de energía, ahorro', uri: 'ms-settings:powersleep', tag: 'Energía' },
  { id: 'storage', name: 'Almacenamiento', desc: 'Sensor de espacio, discos NVMe', uri: 'ms-settings:storagesense', tag: 'Almacenamiento' },
  { id: 'personalization', name: 'Personalización', desc: 'Fondos, temas, mica, colores', uri: 'ms-settings:personalization', tag: 'Aspecto' },
  { id: 'apps', name: 'Aplicaciones', desc: 'Programas instalados y desinstalar', uri: 'ms-settings:appsfeatures', tag: 'Apps' },
  { id: 'accounts', name: 'Cuentas', desc: 'Usuarios, familia, opciones de inicio', uri: 'ms-settings:accounts', tag: 'Cuentas' },
  { id: 'dateandtime', name: 'Hora e Idioma', desc: 'Reloj, zona horaria, región', uri: 'ms-settings:dateandtime', tag: 'Hora' },
  { id: 'update', name: 'Windows Update', desc: 'Buscar actualizaciones y parches', uri: 'ms-settings:windowsupdate', tag: 'Seguridad' }
];

export class DesktopSimulator {
  constructor(desktopElement, themeEngine) {
    this.desktop = desktopElement;
    this.themeEngine = themeEngine;
    this.isAddAppModalOpen = false;
    this.isStartMenuOpen = false;
    this.windowZIndex = 60;
    this.fenceZIndex = 8;
    this.selectedExeApp = WINDOWS_EXE_CATALOG[0];

    // Real Native Windows Explorer state
    this.explorerCurrentPath = '';
    this.explorerHistory = [];
    this.explorerPlaces = [];
    this.explorerDrives = [];
    this.explorerItems = [];
    this.explorerSearchFilter = '';
    this.explorerViewMode = 'grid'; // 'grid', 'icons', 'list', 'details'
    this.explorerSortBy = 'name'; // 'name', 'type', 'date', 'size'
    this.activeExplorerContextItem = null;
    this.activeDockContextItem = null;

    this.init();
  }

  init() {
    this.render();
    this.rebindAll();
    this.bindDesktopMarquee();
    this.bindDesktopDrop();
    this.initExplorer();
    this.bindExplorerMarquee();
  }

  rebindAll() {
    this.bindEvents();
    this.initDraggableWindows();
    this.bindExplorerMarquee();
    this.initDockMagnification();
    this.bindFencesInteractions();
    this.bindDesktopIconInteractions();
    this.syncMinimizedWindows();
    this.renderExplorerView();
  }

  render() {
    const s = this.themeEngine.getState();
    const dockApps = s.dockApps || [
      { id: 'finder', name: 'Carpeta', icon: 'finder', color: '#2563eb', isRunning: true },
      { id: 'safari', name: 'Safari', icon: 'safari', color: '#0284c7', isRunning: false },
      { id: 'terminal', name: 'Terminal', icon: 'terminal', color: '#0f172a', isRunning: true },
      { id: 'code', name: 'VS Code', icon: 'code', color: '#0284c7', isRunning: true },
      { id: 'spotify', name: 'Spotify', icon: 'spotify', color: '#10b981', isRunning: false },
      { id: 'photos', name: 'Fotos', icon: 'photos', color: '#e11d48', isRunning: false },
      { id: 'settings', name: 'Ajustes', icon: 'settings', color: '#475569', isRunning: false },
      { id: 'trash', name: 'Papelera', icon: 'trash', color: '#334155', isRunning: false }
    ];

    this.desktop.innerHTML = `
      <!-- Desktop Icons Container (Movable anywhere on Desktop, Grid-Snapped) -->
      <button id="btn-create-desktop-fence" class="btn-create-desktop-fence" title="Crear un nuevo cuadrado de iconos agrupados">
        + Grupo
      </button>

      <div id="desktop-icons-container" class="desktop-icons-container">
        ${(s.desktopIcons || []).map(icon => {
          const isLnk = icon.isShortcut || (icon.name && icon.name.toLowerCase().endsWith('.lnk')) || (icon.path && icon.path.toLowerCase().endsWith('.lnk'));
          const cleanName = (icon.name || '').replace(/\.lnk$/i, '');
          const shortcutBadge = isLnk ? '<span class="win-shortcut-arrow-badge"></span>' : '';
          return `
          <div class="desktop-icon" style="left: ${icon.x}px; top: ${icon.y}px; position: absolute;" data-app="${icon.app || icon.id}" data-icon-id="${icon.id}" data-icon-name="${this.escapeHtml(cleanName)}" data-icon-type="${icon.type}" data-icon-color="${icon.color}" data-path="${this.escapeHtml(icon.path || '')}" tabindex="0">
            <div class="mac-squircle-icon ${this.getDesktopIconGradientClass(icon)}">
              <span class="icon-svg-wrap">${this.getDesktopIconSvg(icon)}</span>
              ${shortcutBadge}
            </div>
            <span class="icon-label">${this.escapeHtml(cleanName)}</span>
          </div>
        `;}).join('')}
      </div>

      <!-- Desktop Fences Layer: Cuadrados de esquinas redondas para agrupar iconos -->
      <div id="desktop-fences-layer" class="desktop-fences-layer">
        ${this.renderFencesHtml(s.desktopFences || [])}
      </div>

      <!-- Draggable & Resizable Window: Real Interactive Windows Explorer -->
      <div id="sim-window-explorer" class="fluent-window" style="left: 90px; top: 35px; width: 560px; height: 350px; z-index: 60;">
        <div class="window-titlebar" id="explorer-titlebar">
          <div class="mac-window-traffic-lights">
            <button class="traffic-light light-close" id="explorer-close" title="Cerrar ventana">
              <span class="traffic-symbol">✕</span>
            </button>
            <button class="traffic-light light-minimize" id="explorer-minimize" title="Minimizar ventana">
              <span class="traffic-symbol">─</span>
            </button>
            <button class="traffic-light light-maximize" id="explorer-maximize" title="Maximizar ventana">
              <span class="traffic-symbol">□</span>
            </button>
          </div>
          <div class="window-title-text" id="explorer-title-text">TopApp Workspace — Explorador</div>
          <div style="width: 48px;"></div>
        </div>

        <div class="window-toolbar">
          <div style="display: flex; align-items: center; gap: 4px;">
            <button id="explorer-btn-back" class="tochka-btn-dark btn-small" title="Volver atrás" style="padding: 2px 7px; font-size: 0.65rem;">←</button>
            <button id="explorer-btn-up" class="tochka-btn-dark btn-small" title="Subir nivel" style="padding: 2px 7px; font-size: 0.65rem;">↑</button>
          </div>
          <div class="path-bar" id="explorer-breadcrumbs" style="cursor: pointer;" title="Ruta actual">
            <span class="path-icon-wrap">${SVGS.folderSmall}</span>
            <span id="explorer-path-active" class="path-active">C:\\</span>
          </div>
          <button id="explorer-btn-open-native" class="tochka-btn-dark btn-small" title="Abrir esta carpeta en el Explorador de Windows nativo" style="padding: 3px 8px; font-size: 0.6rem; color: var(--color-cyan); white-space: nowrap;">
            ↗ Abrir en Windows
          </button>
          <div class="window-search-pill" style="min-width: 130px;">
            <span class="search-ico-wrap">${SVGS.search}</span>
            <input type="text" id="explorer-filter-input" placeholder="Filtrar..." style="background: none; border: none; color: inherit; font-size: inherit; outline: none; width: 100%;" />
          </div>
        </div>

        <!-- Explorer Fluent Command Bar (Ver, Ordenar, Nueva Carpeta, Actualizar) -->
        <div class="explorer-command-bar" id="explorer-command-bar">
          <div class="exp-dropdown-wrapper">
            <button class="exp-cmd-btn" id="exp-btn-view" title="Opciones de vista">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>Ver</span> ▾
            </button>
            <div class="exp-dropdown-menu" id="exp-menu-view">
              <div class="exp-menu-item" data-view="icons"><span>🔲 Iconos grandes</span> <span class="exp-menu-check" style="display:none;">✓</span></div>
              <div class="exp-menu-item active" data-view="grid"><span>▦ Cuadrícula / Mosaico</span> <span class="exp-menu-check">✓</span></div>
              <div class="exp-menu-item" data-view="list"><span>☰ Lista</span> <span class="exp-menu-check" style="display:none;">✓</span></div>
              <div class="exp-menu-item" data-view="details"><span>📋 Detalles</span> <span class="exp-menu-check" style="display:none;">✓</span></div>
            </div>
          </div>

          <div class="exp-dropdown-wrapper">
            <button class="exp-cmd-btn" id="exp-btn-sort" title="Ordenar elementos">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M6 12h12M9 18h6"/></svg>
              <span>Ordenar</span> ▾
            </button>
            <div class="exp-dropdown-menu" id="exp-menu-sort">
              <div class="exp-menu-item active" data-sort="name"><span>Nombre (A-Z)</span> <span class="exp-menu-check">✓</span></div>
              <div class="exp-menu-item" data-sort="type"><span>Tipo</span> <span class="exp-menu-check" style="display:none;">✓</span></div>
              <div class="exp-menu-item" data-sort="date"><span>Fecha de modificación</span> <span class="exp-menu-check" style="display:none;">✓</span></div>
              <div class="exp-menu-item" data-sort="size"><span>Tamaño</span> <span class="exp-menu-check" style="display:none;">✓</span></div>
            </div>
          </div>

          <div class="exp-cmd-separator"></div>

          <button class="exp-cmd-btn btn-accent" id="exp-btn-new-folder" title="Crear una nueva carpeta aquí">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            <span>Nueva carpeta</span>
          </button>

          <button class="exp-cmd-btn" id="exp-btn-refresh" title="Actualizar contenido">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            <span>Actualizar</span>
          </button>

          <button class="exp-cmd-btn" id="exp-btn-select-all" title="Seleccionar todos los elementos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span>Seleccionar todo</span>
          </button>
        </div>

        <div class="window-body">
          <div class="window-sidebar" id="explorer-sidebar-nav">
            <div class="sidebar-cat">Ubicaciones</div>
            <div class="sidebar-item active" data-path="C:\\">
              <span class="side-ico">${SVGS.disk}</span> Disco C:
            </div>
          </div>

          <div class="window-content-area" id="explorer-content-area" style="overflow-y: auto;">
            <div class="file-grid" id="explorer-files-container">
              <!-- Live files and folders rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- Tiradores de cambio de tamaño: lateral, inferior y esquina -->
        <div class="window-resize-edge window-resize-edge-e" id="explorer-resize-e" title="Arrastrar borde para cambiar ancho"></div>
        <div class="window-resize-edge window-resize-edge-s" id="explorer-resize-s" title="Arrastrar borde para cambiar alto"></div>
        <div class="window-resize-handle" id="explorer-resize-handle" title="Arrastrar esquina para cambiar tamaño libremente">
          ${SVGS.resizeHandle}
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- BOTTOM UNIFIED TASKBAR & DOCK: START BUTTON + SEARCH + SQUIRCLE APPS -->
      <!-- ============================================================== -->
      <button id="btn-peek-taskbar" class="dock-peek-handle ${s.showWindowsTaskbar ? 'dock-visible' : ''}" title="Mostrar u ocultar la barra inferior de inicio de Windows">
        <span></span>
      </button>

      <div id="sim-mac-dock" class="mac-dock-container ${s.showWindowsTaskbar ? '' : 'taskbar-hidden'}">
        <div class="mac-dock-shelf" id="mac-dock-shelf">
          <!-- Windows Start Button -->
          <div class="mac-dock-item win-start-dock-item" id="btn-win-start" title="Inicio de Windows (Apagar, reiniciar, configuraciones)">
            <div class="mac-dock-icon win-start-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#00e5db"/>
                <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#00b4d8"/>
                <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#0284c7"/>
                <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#2563eb"/>
              </svg>
            </div>
            <div class="dock-hover-tooltip">Inicio de Windows</div>
          </div>

          <!-- Windows Search Pill Box in Start Bar -->
          <div class="win-search-pill-box" id="btn-win-search" title="Buscar aplicaciones, configuraciones, archivos...">
            <span class="win-search-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </span>
            <span class="win-search-placeholder-text">Buscar en Windows...</span>
            <span class="win-search-shortcut-badge">Win + S</span>
          </div>

          <div class="mac-dock-separator"></div>

          <!-- Dock Applications with Squircle Frames (Carpeta, Papelera, etc.) -->
          ${dockApps.map(app => `
            <div class="mac-dock-item" data-id="${app.id}" data-name="${app.name}" title="${app.name}" draggable="true">
              <div class="mac-dock-icon" style="background: ${this.getAppGradient(app.icon, app.color)};">
                ${this.renderAppIconGlyph(app.icon, app.customIcon)}
              </div>
              ${app.isRunning ? '<span class="dock-running-dot"></span>' : ''}
              <div class="dock-hover-tooltip">${app.name}</div>
            </div>
          `).join('')}

          <!-- Minimized Windows Tray (macOS / Windows Hybrid) -->
          <div id="dock-minimized-separator" class="mac-dock-separator" style="display: none;"></div>
          <div id="dock-minimized-windows-container" class="dock-minimized-tray"></div>

          <div class="mac-dock-separator"></div>

          <!-- Add Application Button (+) -->
          <div class="mac-dock-item btn-add-dock-app" id="btn-open-add-app-modal" title="Añadir Aplicación al Dock">
            <div class="mac-dock-icon add-icon-box">
              <span class="plus-symbol">+</span>
            </div>
            <div class="dock-hover-tooltip">Añadir al Dock</div>
          </div>

          <!-- Dock PRO Settings (⚙) -->
          <div class="mac-dock-item btn-dock-settings" id="btn-open-dock-settings" title="Configuración PRO del Dock">
            <div class="mac-dock-icon add-icon-box" style="border-style: solid; border-color: rgba(255, 255, 255, 0.15);">
              <span style="font-size: 0.95rem; color: var(--color-cyan); line-height: 1;">⚙</span>
            </div>
            <div class="dock-hover-tooltip">Configuración PRO</div>
          </div>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- WINDOWS START MENU & ALL-CONFIGURATIONS HUB FLYOUT -->
      <!-- ============================================================== -->
      <div id="win-start-menu-hub" class="win-start-menu-flyout ${this.isStartMenuOpen ? 'start-menu-open' : ''}">
        <!-- Top Search Box -->
        <div class="start-hub-search-bar">
          <span class="start-hub-search-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </span>
          <input type="text" id="start-hub-search-input" class="start-hub-search-field" placeholder="Buscar aplicaciones, configuraciones de Windows y archivos..." />
          <button id="start-hub-clear-search" class="start-hub-clear-btn hidden">✕</button>
        </div>

        <div class="start-hub-content-scroll">
          <!-- Live search results container (shown when user searches) -->
          <div id="start-hub-live-results" class="start-hub-search-results hidden"></div>

          <!-- Default Start Menu Content: Settings Hub + Pinned Apps -->
          <div id="start-hub-default-content">
            <!-- SECTION 1: TODAS LAS CONFIGURACIONES DE WINDOWS -->
            <div class="start-hub-section-head">
              <span class="start-section-title">Configuración de Windows</span>
              <span class="start-section-sub">Acceso directo nativo a Windows 10 / 11</span>
            </div>

            <div class="win-settings-grid">
              ${WINDOWS_SETTINGS_ITEMS.map(item => `
                <button class="win-setting-chip" data-uri="${item.uri}" title="Abrir configuración de ${item.name}">
                  <span class="setting-chip-dot dot-cyan"></span>
                  <div class="setting-chip-texts">
                    <span class="setting-chip-name">${item.name}</span>
                    <span class="setting-chip-desc">${item.desc}</span>
                  </div>
                </button>
              `).join('')}
            </div>

            <!-- SECTION 2: APLICACIONES ANCLADAS -->
            <div class="start-hub-section-head" style="margin-top: 12px;">
              <span class="start-section-title">Aplicaciones Ancladas</span>
              <span class="start-section-sub">Programas más usados</span>
            </div>

            <div class="start-pinned-grid">
              ${WINDOWS_EXE_CATALOG.slice(0, 8).map(app => `
                <div class="start-pinned-app-item" data-name="${app.name}">
                  <div class="pinned-app-squircle" style="background: ${this.getAppGradient(app.icon, app.color)};">
                    ${this.renderAppIconGlyph(app.icon)}
                  </div>
                  <span class="pinned-app-label">${app.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Start Menu Bottom Bar: User Profile & Power Actions -->
        <div class="start-hub-footer-bar">
          <div class="start-user-profile">
            <div class="user-avatar-circle">AD</div>
            <div class="user-info-text">
              <span class="user-name">Administrador</span>
              <span class="user-sys-label">Windows 11 Pro</span>
            </div>
          </div>

          <!-- Power Button with Shutdown / Restart / Sleep / Lock / SignOut -->
          <div class="start-power-container">
            <button id="btn-start-power-trigger" class="start-power-btn" title="Opciones de Energía (Apagar, reiniciar, suspender)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>
              </svg>
            </button>

            <div id="start-power-dropdown" class="start-power-dropdown ${this.isPowerMenuOpen ? 'open' : ''}">
              <button class="power-menu-item" data-power="shutdown">
                <span class="power-dot dot-red"></span> Apagar equipo
              </button>
              <button class="power-menu-item" data-power="restart">
                <span class="power-dot dot-yellow"></span> Reiniciar equipo
              </button>
              <button class="power-menu-item" data-power="sleep">
                <span class="power-dot dot-blue"></span> Suspender
              </button>
              <div class="power-menu-divider"></div>
              <button class="power-menu-item" data-power="lock">
                <span class="power-dot dot-cyan"></span> Bloquear pantalla
              </button>
              <button class="power-menu-item" data-power="signout">
                <span class="power-dot dot-muted"></span> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Power Action Feedback Overlay -->
      <div id="win-power-screen-overlay" class="win-power-screen hidden">
        <div class="power-screen-content">
          <div class="power-screen-spinner"></div>
          <div class="power-screen-msg" id="power-screen-message">Apagando el equipo...</div>
          <button id="btn-power-screen-resume" class="tochka-btn-cyan btn-small" style="margin-top: 15px;">Volver al Escritorio</button>
        </div>
      </div>

      <!-- ============================================================== -->
      <!-- MODAL: ADD APPLICATION TO DOCK (EXE EXPLORER & FILE PICKER) -->
      <!-- ============================================================== -->
      <div id="modal-add-dock-app" class="tochka-modal-backdrop ${this.isAddAppModalOpen ? 'modal-open' : ''}">
        <div class="tochka-modal-window add-app-modal-window">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-clean-title">Añadir Aplicación al Dock</span>
              <span class="modal-sub">Explorador de programas .exe</span>
            </div>
            <button id="close-add-app-modal-btn" class="modal-close-btn">✕</button>
          </div>

          <div class="add-app-form-body">
            <!-- File Explorer Button for Local .exe -->
            <div class="file-picker-section">
              <input type="file" id="dock-exe-file-input" accept=".exe,image/*" style="display: none;" />
              <button id="btn-browse-local-exe" class="tochka-btn-browse-file">
                Buscar ejecutable (.exe) en el equipo...
              </button>
              <div id="selected-file-path-feedback" class="file-path-feedback hidden"></div>
            </div>

            <!-- Predefined Windows .exe Program Catalog -->
            <!-- Predefined & Scanned Windows Installed Program Catalog -->
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px;">
                <label class="form-label" style="margin: 0;">Programas Instalados en Windows:</label>
                <button type="button" id="btn-refresh-apps-catalog" class="tochka-btn-dark btn-small btn-refresh-apps-catalog" title="Escanear y actualizar todos los .exe y accesos directos instalados en tu PC">
                  <span class="refresh-icon">⟳</span> Actualizar Aplicaciones
                </button>
              </div>
              <div style="margin-bottom: 6px;">
                <input type="text" id="filter-apps-catalog-input" class="tochka-input-text" placeholder="Filtrar por nombre (ej. Photoshop, Chrome, Corel, Steam...)" style="font-size: 0.65rem; padding: 4px 8px;" />
              </div>
              <div class="exe-catalog-scrollable" id="exe-catalog-list" style="max-height: 200px;">
                ${WINDOWS_EXE_CATALOG.map((item, i) => `
                  <div class="exe-item ${i === 0 ? 'selected' : ''}" data-path="${this.escapeHtml(item.path)}" data-name="${this.escapeHtml(item.name)}" data-icon-url="" data-icon="${item.icon}" data-color="${item.color}" data-index="${i}">
                    <div class="exe-mini-squircle" style="background: ${this.getAppGradient(item.icon, item.color)};">
                      ${this.renderAppIconGlyph(item.icon)}
                    </div>
                    <div class="exe-item-info">
                      <div class="exe-name-line">
                        <span class="exe-app-name">${item.name}</span>
                        <span class="exe-tag">${item.tag}</span>
                      </div>
                      <span class="exe-file-path">${item.path}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Custom App Name & Color -->
            <div class="form-group">
              <label class="form-label">Nombre en el Dock:</label>
              <input type="text" id="add-app-name-input" class="tochka-input-text" value="${this.selectedExeApp.name}" placeholder="Nombre de la aplicación..." />
            </div>

            <div class="form-group">
              <label class="form-label">Color de fondo del marco:</label>
              <div class="color-picker-chips" id="color-picker-chips">
                <button class="color-chip active-chip" data-color="#2563eb" style="background: #2563eb;"></button>
                <button class="color-chip" data-color="#00e5db" style="background: #00e5db;"></button>
                <button class="color-chip" data-color="#10b981" style="background: #10b981;"></button>
                <button class="color-chip" data-color="#ff7043" style="background: #ff7043;"></button>
                <button class="color-chip" data-color="#8b5cf6" style="background: #8b5cf6;"></button>
                <button class="color-chip" data-color="#0f172a" style="background: #0f172a;"></button>
              </div>
            </div>

            <!-- Squircle Live Preview: Ensures exact same squircle frame for all items -->
            <div class="add-app-preview-row">
              <div>
                <div style="font-size: 0.65rem; color: var(--text-white); font-weight: 600;">Marco unificado del Dock:</div>
                <div style="font-size: 0.55rem; color: var(--text-muted);">Mismo tamaño y curva que el resto</div>
              </div>
              <div id="new-app-dock-preview" class="mac-dock-icon" style="background: ${this.getAppGradient(this.selectedExeApp.icon, this.selectedExeApp.color)};">
                <span id="preview-icon-glyph">${this.renderAppIconGlyph(this.selectedExeApp.icon)}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button id="btn-cancel-add-app" class="tochka-btn-dark btn-small">Cancelar</button>
            <button id="btn-submit-add-app" class="tochka-btn-cyan btn-small">
              Añadir al Dock
            </button>
          </div>
        </div>
      </div>

      <!-- Right Click Context Menu (Full Windows 11 Fluent Suite Menu) -->
      <div id="sim-context-menu" class="fluent-context-menu">
        <!-- 0. ACCIONES DE ICONOS SELECCIONADOS (ABRIR / ABRIR CON / CAMBIAR NOMBRE / ELIMINAR) -->
        <div id="menu-icon-actions" style="display: none;">
          <div class="menu-item" data-action="open-selected">
            <span class="menu-icon-box" style="font-size: 0.82rem;">🚀</span>
            <span class="menu-text">Abrir</span>
            <span class="menu-shortcut">Enter</span>
          </div>
          <div class="menu-item" data-action="open-with">
            <span class="menu-icon-box" style="font-size: 0.82rem;">↗</span>
            <span class="menu-text">Abrir con...</span>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item" data-action="rename-icon">
            <span class="menu-icon-box" style="font-size: 0.82rem;">✏️</span>
            <span class="menu-text">Cambiar nombre</span>
            <span class="menu-shortcut">F2</span>
          </div>
          <div class="menu-item" data-action="delete-icon">
            <span class="menu-icon-box" style="color: #ef4444; font-size: 0.82rem;">🗑️</span>
            <span class="menu-text" style="color: #ef4444;">Eliminar</span>
            <span class="menu-shortcut">Supr</span>
          </div>
          <div class="menu-divider"></div>
        </div>

        <!-- 1. VER SUBMENU -->
        <div class="menu-item has-submenu" data-menu="view">
          <span class="menu-icon-box" style="font-size: 0.85rem;">⊞</span>
          <span class="menu-text">Ver</span>
          <span class="menu-arrow">›</span>
          <div class="context-submenu">
            <div class="menu-item" data-action="icon-size-large">
              <span class="menu-check">${(s.desktopFences && s.desktopFences[0]?.iconSize === 'large') ? '✓' : ''}</span>
              <span class="menu-text">Iconos grandes</span>
            </div>
            <div class="menu-item" data-action="icon-size-medium">
              <span class="menu-check">${(!s.desktopFences || s.desktopFences[0]?.iconSize === 'medium' || !s.desktopFences[0]?.iconSize) ? '✓' : ''}</span>
              <span class="menu-text">Iconos medianos</span>
            </div>
            <div class="menu-item" data-action="icon-size-small">
              <span class="menu-check">${(s.desktopFences && s.desktopFences[0]?.iconSize === 'small') ? '✓' : ''}</span>
              <span class="menu-text">Iconos pequeños</span>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" data-action="toggle-grid-snap">
              <span class="menu-check">✓</span>
              <span class="menu-text">Alinear iconos a la cuadrícula</span>
            </div>
            <div class="menu-item" data-action="toggle-desktop-icons">
              <span class="menu-check">✓</span>
              <span class="menu-text">Mostrar iconos del escritorio</span>
            </div>
          </div>
        </div>

        <!-- 2. ORDENAR POR SUBMENU -->
        <div class="menu-item has-submenu" data-menu="sort">
          <span class="menu-icon-box" style="font-size: 0.8rem;">⇅</span>
          <span class="menu-text">Ordenar por</span>
          <span class="menu-arrow">›</span>
          <div class="context-submenu">
            <div class="menu-item" data-action="sort-name"><span class="menu-text">Nombre</span></div>
            <div class="menu-item" data-action="sort-size"><span class="menu-text">Tamaño</span></div>
            <div class="menu-item" data-action="sort-type"><span class="menu-text">Tipo de elemento</span></div>
            <div class="menu-item" data-action="sort-date"><span class="menu-text">Fecha de modificación</span></div>
          </div>
        </div>

        <!-- 3. ACTUALIZAR -->
        <div class="menu-item" data-action="refresh">
          <span class="menu-icon-box" style="font-size: 0.85rem;">↻</span>
          <span class="menu-text">Actualizar</span>
          <span class="menu-shortcut">F5</span>
        </div>

        <div class="menu-divider"></div>

        <!-- 4. PEGAR Y DESHACER -->
        <div class="menu-item disabled" data-action="paste">
          <span class="menu-icon-box">📋</span>
          <span class="menu-text">Pegar</span>
          <span class="menu-shortcut">Ctrl+V</span>
        </div>
        <div class="menu-item disabled" data-action="paste-shortcut">
          <span class="menu-icon-box">🔗</span>
          <span class="menu-text">Pegar acceso directo</span>
        </div>
        <div class="menu-item" data-action="undo">
          <span class="menu-icon-box">↩</span>
          <span class="menu-text">Deshacer mover</span>
          <span class="menu-shortcut">Ctrl+Z</span>
        </div>

        <div class="menu-divider"></div>

        <!-- 5. NUEVO SUBMENU (CARPETAS, SKP, DWG, PSD, CDR, VIDEO, PDF, ETC.) -->
        <div class="menu-item has-submenu" data-menu="new">
          <span class="menu-icon-box" style="font-size: 0.9rem; font-weight: 700; color: var(--color-cyan);">+</span>
          <span class="menu-text" style="font-weight: 600;">Nuevo</span>
          <span class="menu-arrow">›</span>
          <div class="context-submenu">
            <div class="menu-item" data-action="new-folder">
              <span class="menu-icon-box" style="color: #06b6d4;">📁</span>
              <span class="menu-text">Carpeta</span>
            </div>
            <div class="menu-item" data-action="new-shortcut">
              <span class="menu-icon-box" style="color: #38bdf8;">🔗</span>
              <span class="menu-text">Acceso directo</span>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" data-action="new-skp">
              <span class="menu-icon-box" style="color: #ef4444; font-weight: 800; font-size: 0.58rem;">SKP</span>
              <span class="menu-text">Modelo 3D SketchUp (.skp)</span>
            </div>
            <div class="menu-item" data-action="new-dwg">
              <span class="menu-icon-box" style="color: #ef4444; font-weight: 800; font-size: 0.58rem;">DWG</span>
              <span class="menu-text">Dibujo AutoCAD (.dwg)</span>
            </div>
            <div class="menu-item" data-action="new-video">
              <span class="menu-icon-box" style="color: #f43f5e; font-weight: 800; font-size: 0.58rem;">MP4</span>
              <span class="menu-text">Archivo de Vídeo (.mp4)</span>
            </div>
            <div class="menu-item" data-action="new-psd">
              <span class="menu-icon-box" style="color: #31a8ff; font-weight: 800; font-size: 0.58rem;">PSD</span>
              <span class="menu-text">Proyecto Adobe Photoshop (.psd)</span>
            </div>
            <div class="menu-item" data-action="new-cdr">
              <span class="menu-icon-box" style="color: #34d399; font-weight: 800; font-size: 0.58rem;">CDR</span>
              <span class="menu-text">Ilustración CorelDRAW (.cdr)</span>
            </div>
            <div class="menu-item" data-action="new-pdf">
              <span class="menu-icon-box" style="color: #ef4444; font-weight: 800; font-size: 0.58rem;">PDF</span>
              <span class="menu-text">Documento PDF (.pdf)</span>
            </div>
            <div class="menu-item" data-action="new-xlsx">
              <span class="menu-icon-box" style="color: #10b981; font-weight: 800; font-size: 0.58rem;">XLS</span>
              <span class="menu-text">Hoja de cálculo Microsoft Excel</span>
            </div>
            <div class="menu-item" data-action="new-docx">
              <span class="menu-icon-box" style="color: #3b82f6; font-weight: 800; font-size: 0.58rem;">DOC</span>
              <span class="menu-text">Documento Microsoft Word</span>
            </div>
            <div class="menu-item" data-action="new-txt">
              <span class="menu-icon-box" style="color: #94a3b8;">📄</span>
              <span class="menu-text">Documento de texto (.txt)</span>
            </div>
            <div class="menu-item" data-action="new-zip">
              <span class="menu-icon-box" style="color: #f59e0b;">🗜️</span>
              <span class="menu-text">Archivo comprimido en ZIP</span>
            </div>
          </div>
        </div>

        <div class="menu-divider"></div>

        <!-- 6. CONFIGURACIÓN DE PANTALLA Y PERSONALIZAR -->
        <div class="menu-item" data-action="display-settings">
          <span class="menu-icon-box">🖥️</span>
          <span class="menu-text">Configuración de pantalla</span>
        </div>
        <div class="menu-item" data-action="open-theme-settings">
          <span class="menu-icon-box">🎨</span>
          <span class="menu-text">Personalizar</span>
        </div>
        <div class="menu-item" data-action="open-terminal">
          <span class="menu-icon-box">💻</span>
          <span class="menu-text">Abrir en Terminal de Windows</span>
        </div>

        <div class="menu-divider"></div>

        <!-- 7. TOPAPP WINTHEME PRO ACTIONS -->
        <div class="menu-item" data-action="create-fence">
          <span class="menu-icon-box" style="color: var(--color-cyan); font-weight: 700;">⊞</span>
          <span class="menu-text" style="color: var(--color-cyan); font-weight: 600;">Crear nuevo Cajón de iconos</span>
        </div>
        <div class="menu-item" data-action="toggle-taskbar">
          <span class="menu-icon-box">🪟</span>
          <span class="menu-text">${s.showWindowsTaskbar ? 'Ocultar Barra de Inicio' : 'Mostrar Barra de Inicio'}</span>
        </div>
        <div class="menu-item" data-action="add-app">
          <span class="menu-icon-box">🚀</span>
          <span class="menu-text">Añadir Aplicación al Dock...</span>
        </div>
      </div>

      <!-- Explorer Context Menu (Right-click inside Explorer Window) -->
      <div id="sim-explorer-context-menu" class="fluent-context-menu">
        <div id="exp-ctx-file-actions" style="display: none;">
          <div class="menu-item" data-action="exp-open">
            <span class="menu-icon-box">🚀</span>
            <span class="menu-text">Abrir</span>
          </div>
          <div class="menu-item" data-action="exp-open-with">
            <span class="menu-icon-box">↗</span>
            <span class="menu-text">Abrir con...</span>
          </div>
          <div class="menu-item" data-action="exp-open-native">
            <span class="menu-icon-box">↗</span>
            <span class="menu-text">Abrir en Explorador de Windows</span>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item" data-action="exp-copy-to-desktop">
            <span class="menu-icon-box">📌</span>
            <span class="menu-text">Copiar al Escritorio</span>
          </div>
          <div class="menu-item" data-action="exp-send-to-fence">
            <span class="menu-icon-box">🗂️</span>
            <span class="menu-text">Enviar al Grupo / Cajón</span>
          </div>
          <div class="menu-item" data-action="exp-copy-path">
            <span class="menu-icon-box">📋</span>
            <span class="menu-text">Copiar ruta de acceso</span>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item" data-action="exp-delete">
            <span class="menu-icon-box" style="color: #ef4444;">🗑️</span>
            <span class="menu-text" style="color: #ef4444;">Eliminar</span>
          </div>
        </div>

        <div id="exp-ctx-empty-actions" style="display: none;">
          <div class="menu-item" data-action="exp-view-icons">
            <span class="menu-icon-box">🔲</span>
            <span class="menu-text">Ver: Iconos grandes</span>
          </div>
          <div class="menu-item" data-action="exp-view-grid">
            <span class="menu-icon-box">▦</span>
            <span class="menu-text">Ver: Cuadrícula</span>
          </div>
          <div class="menu-item" data-action="exp-view-list">
            <span class="menu-icon-box">☰</span>
            <span class="menu-text">Ver: Lista</span>
          </div>
          <div class="menu-item" data-action="exp-view-details">
            <span class="menu-icon-box">📋</span>
            <span class="menu-text">Ver: Detalles</span>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item" data-action="exp-new-folder">
            <span class="menu-icon-box">📁</span>
            <span class="menu-text">Nueva carpeta</span>
          </div>
          <div class="menu-item" data-action="exp-refresh">
            <span class="menu-icon-box">🔄</span>
            <span class="menu-text">Actualizar</span>
          </div>
          <div class="menu-item" data-action="exp-open-native">
            <span class="menu-icon-box">↗</span>
            <span class="menu-text">Abrir en Windows</span>
          </div>
        </div>
      </div>

      <!-- Dock Context Menu (Right-click on Dock App) -->
      <div id="sim-dock-context-menu" class="fluent-context-menu">
        <div class="menu-item" data-action="dock-open">
          <span class="menu-icon-box">🚀</span>
          <span class="menu-text">Abrir</span>
        </div>
        <div class="menu-item" data-action="dock-copy-desktop">
          <span class="menu-icon-box">📌</span>
          <span class="menu-text">Copiar al Escritorio</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" data-action="dock-move-left">
          <span class="menu-icon-box">◀</span>
          <span class="menu-text">Mover a la izquierda</span>
        </div>
        <div class="menu-item" data-action="dock-move-right">
          <span class="menu-icon-box">▶</span>
          <span class="menu-text">Mover a la derecha</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" data-action="dock-remove">
          <span class="menu-icon-box" style="color: #ef4444;">🗑️</span>
          <span class="menu-text" style="color: #ef4444;">Eliminar del Dock</span>
        </div>
      </div>
    `;

    this.renderExplorerView();
  }

  getAppGradient(icon, color) {
    if (icon === 'terminal') return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
    if (icon === 'code') return 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
    if (icon === 'spotify') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (icon === 'photos') return 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)';
    if (icon === 'finder') return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    if (icon === 'safari') return 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
    if (icon === 'trash') return 'linear-gradient(135deg, #475569 0%, #334155 100%)';
    if (icon === 'settings') return 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
    if (icon === 'photoshop') return 'linear-gradient(135deg, #001e36 0%, #001122 100%)';
    if (icon === 'steam') return 'linear-gradient(135deg, #171a21 0%, #0b0d11 100%)';
    if (icon === 'chrome') return 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)';
    if (icon === 'blender') return 'linear-gradient(135deg, #e87d0d 0%, #b25e07 100%)';
    if (icon === 'discord') return 'linear-gradient(135deg, #5865f2 0%, #404eed 100%)';
    if (icon === 'figma') return 'linear-gradient(135deg, #1e1e1e 0%, #0f0f0f 100%)';
    if (icon === 'premiere') return 'linear-gradient(135deg, #00005b 0%, #000033 100%)';
    if (icon === 'illustrator') return 'linear-gradient(135deg, #330000 0%, #1a0000 100%)';
    if (icon === 'obs') return 'linear-gradient(135deg, #302e31 0%, #1a191a 100%)';
    if (icon === 'notion') return 'linear-gradient(135deg, #2f3437 0%, #191c1d 100%)';
    return `linear-gradient(135deg, ${color || '#2563eb'} 0%, #0f172a 100%)`;
  }

  renderAppIconGlyph(icon, customIconUrl) {
    if (customIconUrl) {
      return `<img src="${customIconUrl}" alt="${icon}" style="width: 72%; height: 72%; object-fit: contain; border-radius: 4px;" />`;
    }

    switch (icon) {
      case 'finder':
        return `<span class="dock-glyph-svg" style="color: #ffffff;">${SVGS.folder}</span>`;
      case 'trash':
        return `<span class="dock-glyph-svg" style="color: #cbd5e1;">${SVGS.trash}</span>`;
      case 'safari':
        return `<span class="dock-glyph-svg" style="color: #ffffff;">${SVGS.compass}</span>`;
      case 'terminal':
        return `<span class="dock-glyph-svg" style="color: #00e5db;">${SVGS.terminal}</span>`;
      case 'code':
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17.5 2.5 7.5 10.2 3.8 7.3a1 1 0 0 0-1.5.8v7.8a1 1 0 0 0 1.5.8l3.7-2.9 10 7.7a1 1 0 0 0 1.5-.8V3.3a1 1 0 0 0-1.5-.8z" fill="#007acc"/><path d="m19 12-4-3.5 4-3.5v7z" fill="#0065a9"/></svg>`;
      case 'spotify':
        return `<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1ed760"/><path d="M7 9.5c3.5-.8 7-.5 10 1M7.5 12.3c2.8-.6 5.8-.4 8.2.8M8 15c2.2-.4 4.5-.3 6.4.6" stroke="#121212" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>`;
      case 'photos':
        return `<span class="dock-glyph-svg" style="color: #ffffff;">${SVGS.camera}</span>`;
      case 'settings':
        return `<span class="dock-glyph-svg" style="color: #e2e8f0;">${SVGS.gear}</span>`;
      case 'photoshop':
        return `<svg width="22" height="22" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="4" fill="#001e36"/><text x="12" y="16.5" font-family="Segoe UI, sans-serif" font-weight="900" font-size="12" fill="#31a8ff" text-anchor="middle">Ps</text></svg>`;
      case 'premiere':
        return `<svg width="22" height="22" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="4" fill="#00005b"/><text x="12" y="16.5" font-family="Segoe UI, sans-serif" font-weight="900" font-size="12" fill="#ea77ff" text-anchor="middle">Pr</text></svg>`;
      case 'illustrator':
        return `<svg width="22" height="22" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="4" fill="#330000"/><text x="12" y="16.5" font-family="Segoe UI, sans-serif" font-weight="900" font-size="12" fill="#ff9a00" text-anchor="middle">Ai</text></svg>`;
      case 'corel':
      case 'coreldraw':
        return `<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#047857"/><circle cx="12" cy="12" r="8" fill="#10b981" opacity="0.35"/><path d="M12 4.5 C7.5 9, 7.5 15, 12 19.5 C16.5 15, 16.5 9, 12 4.5 Z" fill="#ffffff"/><path d="M12 4.5 L12 19.5" stroke="#047857" stroke-width="1.2"/></svg>`;
      case 'steam':
        return `<svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 9.8 12.2l-4.5-1.9a3.5 3.5 0 0 1-5.1-3.6l-3.2-1.3A3.5 3.5 0 1 1 12 2z" fill="#171a21"/><circle cx="12" cy="7.5" r="2.5" fill="#fff"/><circle cx="7.5" cy="15.5" r="1.8" fill="#fff"/></svg>`;
      case 'chrome':
        return `<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" opacity="0.15"/><circle cx="12" cy="12" r="4.5" fill="#4285F4"/><path d="M12 2a10 10 0 0 0-8.66 5l4.33 7.5A4.5 4.5 0 0 1 12 7.5h8.66A10 10 0 0 0 12 2z" fill="#EA4335"/><path d="M22 12a10 10 0 0 0-1.34-5H12a4.5 4.5 0 0 1 3.9 2.25l-4.33 7.5 4.33 2.5A10 10 0 0 0 22 12z" fill="#FBBC05"/><path d="M12 22a10 10 0 0 0 8.66-5h-8.66a4.5 4.5 0 0 1-3.9-2.25l-4.33 7.5A10 10 0 0 0 12 22z" fill="#34A853"/></svg>`;
      case 'blender':
        return `<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e87d0d"/><circle cx="12" cy="13" r="3.5" fill="#2563eb"/><circle cx="12" cy="13" r="1.8" fill="#fff"/><path d="M12 4v5M6 7l4.5 3.5M18 7l-4.5 3.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
      case 'discord':
        return `<svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#5865f2"/><path d="M19 7a14 14 0 0 0-3.5-1.1c-.2.3-.3.7-.5 1a13 13 0 0 0-6 0c-.2-.3-.3-.7-.5-1A14 14 0 0 0 5 7c-2 3.2-2.5 6.3-2.2 9.4 2 1.5 4 1.5 4 1.5.5-.7 1-1.4 1.3-2.1-1.3-.5-1.5-1-1.5-1s.1 0 .3.2c2.5 1.2 5.1 1.2 7.6 0 .2-.1.3-.2.3-.2s-.2.6-1.5 1c.4.7.8 1.4 1.3 2.1 0 0 2 0 4-1.5.4-3.5-.5-6.6-2.3-9.4zM8.5 14c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm7 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" fill="#fff"/></svg>`;
      case 'figma':
        return `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 2h4v5H8a2.5 2.5 0 0 1 0-5z" fill="#F24E1E"/><path d="M12 2h4a2.5 2.5 0 0 1 0 5h-4V2z" fill="#FF7262"/><path d="M12 7h4a2.5 2.5 0 0 1 0 5h-4V7z" fill="#1ABCFE"/><path d="M8 7h4v5H8a2.5 2.5 0 0 1 0-5z" fill="#A259FF"/><path d="M8 12h4v5a2.5 2.5 0 1 1-4-2.2V12z" fill="#0ACF83"/></svg>`;
      case 'obs':
        return `<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#302e31"/><circle cx="12" cy="12" r="4" fill="#fff"/><path d="M12 3a9 9 0 0 1 7.8 4.5M21 12a9 9 0 0 1-4.5 7.8M12 21a9 9 0 0 1-7.8-4.5" stroke="#fff" stroke-width="1.8" fill="none"/></svg>`;
      case 'notion':
        return `<svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#2f3437"/><text x="12" y="17" font-family="Segoe UI, serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">N</text></svg>`;
      case 'palette':
        return `<span class="dock-glyph-svg" style="color: #ffffff;">${SVGS.palette}</span>`;
      case 'gamepad':
        return `<span class="dock-glyph-svg" style="color: #ffffff;">${SVGS.gamepad}</span>`;
      default:
        return `<span class="dock-glyph-svg" style="color: #ffffff;">${SVGS.code}</span>`;
    }
  }

  initDockMagnification() {
    const dockShelf = document.getElementById('mac-dock-shelf');
    if (!dockShelf) return;

    dockShelf.addEventListener('mousemove', (e) => {
      const cfg = (this.themeEngine && this.themeEngine.getState().dockConfig) || {};
      const items = dockShelf.querySelectorAll('.mac-dock-item');
      if (cfg.waveEnabled === false) {
        items.forEach(item => {
          item.style.transform = 'scale(1) translateY(0)';
        });
        return;
      }

      const maxDist = cfg.waveRadius || 90;
      const intensity = (cfg.waveScale != null ? cfg.waveScale : 1.45) - 1;

      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(e.clientX - itemCenter);

        if (dist < maxDist && intensity > 0) {
          const scale = 1 + (1 - dist / maxDist) * intensity;
          item.style.transform = `scale(${scale}) translateY(-${(scale - 1) * 16}px)`;
        } else {
          item.style.transform = 'scale(1) translateY(0)';
        }
      });
    });

    dockShelf.addEventListener('mouseleave', () => {
      const items = dockShelf.querySelectorAll('.mac-dock-item');
      items.forEach(item => {
        item.style.transform = 'scale(1) translateY(0)';
      });
    });
  }

  bindEvents() {
    const openWindowsUri = (uri) => openUri(uri);

    // Windows Start Button & Start Menu Flyout
    const btnWinStart = document.getElementById('btn-win-start');
    const btnWinSearch = document.getElementById('btn-win-search');
    const winStartMenu = document.getElementById('win-start-menu-hub');
    const searchHubInput = document.getElementById('start-hub-search-input');
    const searchClearBtn = document.getElementById('start-hub-clear-search');
    const defaultContent = document.getElementById('start-hub-default-content');
    const liveResults = document.getElementById('start-hub-live-results');

    const toggleStartMenu = () => {
      audioEngine.playClick();
      this.isStartMenuOpen = !this.isStartMenuOpen;
      if (winStartMenu) winStartMenu.classList.toggle('start-menu-open', this.isStartMenuOpen);
      if (this.isStartMenuOpen && searchHubInput) {
        setTimeout(() => searchHubInput.focus(), 150);
      }
    };

    if (btnWinStart) btnWinStart.onclick = (e) => {
      e.stopPropagation();
      toggleStartMenu();
    };

    if (btnWinSearch) btnWinSearch.onclick = (e) => {
      e.stopPropagation();
      this.isStartMenuOpen = true;
      if (winStartMenu) winStartMenu.classList.add('start-menu-open');
      if (searchHubInput) setTimeout(() => searchHubInput.focus(), 150);
    };

    // Start Hub Search Autocomplete across Settings & Apps
    if (searchHubInput) {
      searchHubInput.oninput = (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (searchClearBtn) searchClearBtn.classList.toggle('hidden', !query);

        if (!query) {
          if (defaultContent) defaultContent.classList.remove('hidden');
          if (liveResults) {
            liveResults.classList.add('hidden');
            liveResults.innerHTML = '';
          }
          return;
        }

        if (defaultContent) defaultContent.classList.add('hidden');
        if (liveResults) {
          liveResults.classList.remove('hidden');

          const matchedSettings = WINDOWS_SETTINGS_ITEMS.filter(item =>
            item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query) || item.tag.toLowerCase().includes(query)
          );

          const matchedApps = WINDOWS_EXE_CATALOG.filter(app =>
            app.name.toLowerCase().includes(query) || app.exe.toLowerCase().includes(query) || app.tag.toLowerCase().includes(query)
          );

          if (!matchedSettings.length && !matchedApps.length) {
            liveResults.innerHTML = `<div class="start-no-results">No se encontraron resultados para "${query}"</div>`;
            return;
          }

          liveResults.innerHTML = `
            ${matchedSettings.length ? `
              <div class="start-result-category-title">Configuración de Windows:</div>
              <div class="win-settings-grid">
                ${matchedSettings.map(s => `
                  <button class="win-setting-chip" data-uri="${s.uri}">
                    <span class="setting-chip-dot dot-cyan"></span>
                    <div class="setting-chip-texts">
                      <span class="setting-chip-name">${s.name}</span>
                      <span class="setting-chip-desc">${s.desc}</span>
                    </div>
                  </button>
                `).join('')}
              </div>
            ` : ''}

            ${matchedApps.length ? `
              <div class="start-result-category-title" style="margin-top: 10px;">Aplicaciones:</div>
              <div class="start-pinned-grid">
                ${matchedApps.map(app => `
                  <div class="start-pinned-app-item" data-name="${app.name}">
                    <div class="pinned-app-squircle" style="background: ${this.getAppGradient(app.icon, app.color)};">
                      ${this.renderAppIconGlyph(app.icon)}
                    </div>
                    <span class="pinned-app-label">${app.name}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          `;
        }
      };
    }

    if (searchClearBtn && searchHubInput) {
      searchClearBtn.onclick = () => {
        searchHubInput.value = '';
        searchClearBtn.classList.add('hidden');
        if (defaultContent) defaultContent.classList.remove('hidden');
        if (liveResults) {
          liveResults.classList.add('hidden');
          liveResults.innerHTML = '';
        }
      };
    }

    // Windows Settings Chips execution
    this.desktop.addEventListener('click', (e) => {
      // Start Menu pinned / search result apps -> real program in desktop app
      const pinned = e.target.closest('.start-pinned-app-item');
      if (pinned && isNative) {
        const app = WINDOWS_EXE_CATALOG.find(a => a.name === pinned.dataset.name);
        if (app) {
          audioEngine.playClick();
          launchApp({ id: app.icon, name: app.name, icon: app.icon, exe: app.exe });
          if (winStartMenu) winStartMenu.classList.remove('start-menu-open');
          this.isStartMenuOpen = false;
        }
        return;
      }

      const chip = e.target.closest('.win-setting-chip');
      if (chip && chip.dataset.uri) {
        audioEngine.playNotification();
        openWindowsUri(chip.dataset.uri);
        if (winStartMenu) winStartMenu.classList.remove('start-menu-open');
        this.isStartMenuOpen = false;
      }
    });

    // Power Trigger & Dropdown Menu
    const powerTrigger = document.getElementById('btn-start-power-trigger');
    const powerDropdown = document.getElementById('start-power-dropdown');
    const powerOverlay = document.getElementById('win-power-screen-overlay');
    const powerMsg = document.getElementById('power-screen-message');
    const powerResumeBtn = document.getElementById('btn-power-screen-resume');

    if (powerTrigger && powerDropdown) {
      powerTrigger.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        this.isPowerMenuOpen = !this.isPowerMenuOpen;
        powerDropdown.classList.toggle('open', this.isPowerMenuOpen);
      };
    }

    // Power Actions (Apagar, Reiniciar, Suspender, Bloquear, Cerrar Sesión)
    document.querySelectorAll('.power-menu-item').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const action = btn.dataset.power;
        audioEngine.playAlert();
        if (powerDropdown) powerDropdown.classList.remove('open');
        if (winStartMenu) winStartMenu.classList.remove('start-menu-open');
        this.isStartMenuOpen = false;
        this.isPowerMenuOpen = false;

        // Desktop app: real Windows power action (asks for confirmation first)
        if (isNative) {
          powerAction(action);
          return;
        }

        if (powerOverlay && powerMsg) {
          if (action === 'shutdown') {
            powerMsg.textContent = 'Apagando el equipo... Guardando estado';
            powerOverlay.classList.remove('hidden');
          } else if (action === 'restart') {
            powerMsg.textContent = 'Reiniciando el equipo...';
            powerOverlay.classList.remove('hidden');
            setTimeout(() => {
              powerMsg.textContent = 'Iniciando Windows...';
              setTimeout(() => powerOverlay.classList.add('hidden'), 1200);
            }, 1200);
          } else if (action === 'sleep') {
            powerMsg.textContent = 'Equipo en suspensión (Ahorro de energía)';
            powerOverlay.classList.remove('hidden');
          } else if (action === 'lock') {
            powerMsg.textContent = 'Pantalla bloqueada — Presiona el botón para desbloquear';
            powerOverlay.classList.remove('hidden');
          } else if (action === 'signout') {
            powerMsg.textContent = 'Cerrando sesión de Administrador...';
            powerOverlay.classList.remove('hidden');
          }
        }
      };
    });

    if (powerResumeBtn && powerOverlay) {
      powerResumeBtn.onclick = () => {
        audioEngine.playStartup();
        powerOverlay.classList.add('hidden');
      };
    }

    // Close Start Menu when clicking outside
    this.desktop.addEventListener('click', (e) => {
      if (this.isStartMenuOpen && !e.target.closest('#win-start-menu-hub') && !e.target.closest('#btn-win-start') && !e.target.closest('#btn-win-search')) {
        this.isStartMenuOpen = false;
        this.isPowerMenuOpen = false;
        if (winStartMenu) winStartMenu.classList.remove('start-menu-open');
        if (powerDropdown) powerDropdown.classList.remove('open');
      }
    });

    // Traffic light close on Explorer window
    const explorerClose = document.getElementById('explorer-close');
    const explorerWin = document.getElementById('sim-window-explorer');
    if (explorerClose && explorerWin) {
      explorerClose.onclick = () => {
        audioEngine.playClick();
        explorerWin.style.display = 'none';
        explorerWin.dataset.minimized = 'false';
        const dockItem = document.querySelector('.mac-dock-item[data-id="finder"]');
        if (dockItem) dockItem.classList.remove('dock-app-minimized');
      };
    }

    // Real Native Explorer Toolbar Actions
    const expBtnBack = document.getElementById('explorer-btn-back');
    if (expBtnBack) {
      expBtnBack.onclick = () => {
        audioEngine.playClick();
        if (this.explorerHistory && this.explorerHistory.length > 0) {
          const prev = this.explorerHistory.pop();
          this.navigateExplorer(prev, false);
        }
      };
    }

    const expBtnUp = document.getElementById('explorer-btn-up');
    if (expBtnUp) {
      expBtnUp.onclick = () => {
        audioEngine.playClick();
        if (this.explorerCurrentPath) {
          const parent = this.explorerCurrentPath.replace(/\\[^\\]+\\?$/, '');
          if (parent && parent !== this.explorerCurrentPath) {
            this.navigateExplorer(parent.endsWith(':') ? parent + '\\' : (parent || 'C:\\'));
          }
        }
      };
    }

    const expBtnOpenNative = document.getElementById('explorer-btn-open-native');
    if (expBtnOpenNative) {
      expBtnOpenNative.onclick = () => {
        audioEngine.playNotification();
        if (this.explorerCurrentPath) {
          openPath(this.explorerCurrentPath);
        }
      };
    }

    const expFilterInput = document.getElementById('explorer-filter-input');
    if (expFilterInput) {
      expFilterInput.oninput = () => {
        this.explorerSearchFilter = expFilterInput.value;
        this.renderExplorerView();
      };
    }

    // -------------------------------------------------------------
    // Explorer Command Bar Controls: Ver, Ordenar, Nueva carpeta, Actualizar, Seleccionar todo
    // -------------------------------------------------------------
    const expBtnView = document.getElementById('exp-btn-view');
    const expMenuView = document.getElementById('exp-menu-view');
    const expBtnSort = document.getElementById('exp-btn-sort');
    const expMenuSort = document.getElementById('exp-menu-sort');

    const closeExpMenus = () => {
      if (expMenuView) expMenuView.classList.remove('menu-open');
      if (expMenuSort) expMenuSort.classList.remove('menu-open');
    };

    if (expBtnView && expMenuView) {
      expBtnView.onclick = (e) => {
        e.stopPropagation();
        const isOpen = expMenuView.classList.contains('menu-open');
        closeExpMenus();
        if (!isOpen) expMenuView.classList.add('menu-open');
      };
      expMenuView.querySelectorAll('.exp-menu-item').forEach(mi => {
        mi.onclick = (e) => {
          e.stopPropagation();
          audioEngine.playClick();
          this.explorerViewMode = mi.dataset.view;
          expMenuView.querySelectorAll('.exp-menu-item').forEach(el => {
            el.classList.remove('active');
            const chk = el.querySelector('.exp-menu-check');
            if (chk) chk.style.display = 'none';
          });
          mi.classList.add('active');
          const check = mi.querySelector('.exp-menu-check');
          if (check) check.style.display = 'inline';
          closeExpMenus();
          this.renderExplorerView();
        };
      });
    }

    if (expBtnSort && expMenuSort) {
      expBtnSort.onclick = (e) => {
        e.stopPropagation();
        const isOpen = expMenuSort.classList.contains('menu-open');
        closeExpMenus();
        if (!isOpen) expMenuSort.classList.add('menu-open');
      };
      expMenuSort.querySelectorAll('.exp-menu-item').forEach(mi => {
        mi.onclick = (e) => {
          e.stopPropagation();
          audioEngine.playClick();
          this.explorerSortBy = mi.dataset.sort;
          expMenuSort.querySelectorAll('.exp-menu-item').forEach(el => {
            el.classList.remove('active');
            const chk = el.querySelector('.exp-menu-check');
            if (chk) chk.style.display = 'none';
          });
          mi.classList.add('active');
          const check = mi.querySelector('.exp-menu-check');
          if (check) check.style.display = 'inline';
          closeExpMenus();
          this.renderExplorerView();
        };
      });
    }

    const expBtnNewFolder = document.getElementById('exp-btn-new-folder');
    if (expBtnNewFolder) {
      expBtnNewFolder.onclick = async (e) => {
        e.stopPropagation();
        audioEngine.playStartup();
        if (!this.explorerCurrentPath) return;
        const baseName = 'Nueva carpeta';
        let folderName = baseName;
        let counter = 2;
        while ((this.explorerItems || []).some(it => it.name.toLowerCase() === folderName.toLowerCase())) {
          folderName = `${baseName} (${counter++})`;
        }
        await createDir(this.explorerCurrentPath, folderName);
        await this.navigateExplorer(this.explorerCurrentPath, false);
      };
    }

    const expBtnRefresh = document.getElementById('exp-btn-refresh');
    if (expBtnRefresh) {
      expBtnRefresh.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playStartup();
        if (this.explorerCurrentPath) {
          this.navigateExplorer(this.explorerCurrentPath, false);
        }
      };
    }

    const expBtnSelectAll = document.getElementById('exp-btn-select-all');
    if (expBtnSelectAll) {
      expBtnSelectAll.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        document.querySelectorAll('#explorer-files-container .file-item').forEach(el => el.classList.add('is-selected'));
      };
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.exp-dropdown-wrapper')) {
        closeExpMenus();
      }
    });

    // -------------------------------------------------------------
    // Explorer Context Menu (Right-click inside Explorer Window)
    // -------------------------------------------------------------
    const expContentArea = document.getElementById('explorer-content-area');
    const expContextMenu = document.getElementById('sim-explorer-context-menu');
    const expCtxFileActions = document.getElementById('exp-ctx-file-actions');
    const expCtxEmptyActions = document.getElementById('exp-ctx-empty-actions');

    if (expContentArea && expContextMenu) {
      expContentArea.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        audioEngine.playClick();

        const fileItem = e.target.closest('.file-item');
        if (fileItem) {
          this.activeExplorerContextItem = {
            name: fileItem.dataset.name,
            path: fileItem.dataset.path,
            isDir: fileItem.dataset.isDir === 'true',
            type: fileItem.dataset.type
          };
          if (!fileItem.classList.contains('is-selected')) {
            document.querySelectorAll('#explorer-files-container .file-item').forEach(el => el.classList.remove('is-selected'));
            fileItem.classList.add('is-selected');
          }
          if (expCtxFileActions) expCtxFileActions.style.display = 'block';
          if (expCtxEmptyActions) expCtxEmptyActions.style.display = 'none';
        } else {
          this.activeExplorerContextItem = null;
          if (expCtxFileActions) expCtxFileActions.style.display = 'none';
          if (expCtxEmptyActions) expCtxEmptyActions.style.display = 'block';
        }

        const rect = this.desktop.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        if (x + 220 > rect.width) x = rect.width - 230;
        if (y + 260 > rect.height) y = rect.height - 270;
        expContextMenu.style.left = `${Math.max(10, x)}px`;
        expContextMenu.style.top = `${Math.max(10, y)}px`;
        expContextMenu.classList.add('menu-open');
      });

      expContextMenu.querySelectorAll('.menu-item').forEach(item => {
        item.onclick = async (e) => {
          e.stopPropagation();
          audioEngine.playClick();
          expContextMenu.classList.remove('menu-open');
          const act = item.dataset.action;
          const target = this.activeExplorerContextItem;

          if (act === 'exp-open' && target) {
            if (target.isDir) {
              this.navigateExplorer(target.path);
            } else {
              openPath(target.path);
            }
          } else if (act === 'exp-open-with' && target) {
            if (target.path) {
              openWith(target.path);
            }
          } else if (act === 'exp-open-native') {
            if (target && target.path) {
              openPath(target.path);
            } else if (this.explorerCurrentPath) {
              openPath(this.explorerCurrentPath);
            }
          } else if (act === 'exp-copy-to-desktop' && target) {
            const isImg = target.type === 'images' || /\.(png|jpe?g|webp|gif|bmp|ico|svg)$/i.test(target.name);
            this.themeEngine.addDesktopIcon({
              id: 'desk-' + Date.now(),
              app: target.isDir ? 'explorer' : 'file',
              name: target.name,
              type: target.isDir ? 'folder' : (isImg ? 'images' : 'doc'),
              color: target.isDir ? '#06b6d4' : (isImg ? '#ff7043' : '#3b82f6'),
              thumbnail: isImg ? `/local-file/${encodeURIComponent(target.path)}` : null,
              path: target.path,
              x: 100,
              y: 100
            });
            audioEngine.playStartup();
            this.renderDesktopIconsOnly();
          } else if (act === 'exp-send-to-fence' && target) {
            const isImg = target.type === 'images' || /\.(png|jpe?g|webp|gif|bmp|ico|svg)$/i.test(target.name);
            this.addNewItemToActiveFence({
              name: target.name,
              type: target.isDir ? 'folder' : (isImg ? 'images' : 'doc'),
              icon: target.isDir ? 'folder' : (isImg ? 'image' : 'doc'),
              color: target.isDir ? '#06b6d4' : (isImg ? '#ff7043' : '#3b82f6'),
              path: target.path,
              thumbnail: isImg ? `/local-file/${encodeURIComponent(target.path)}` : null
            });
          } else if (act === 'exp-copy-path' && target) {
            try {
              await navigator.clipboard.writeText(target.path);
            } catch {}
          } else if (act === 'exp-delete' && target) {
            if (confirm(`¿Mover "${target.name}" a la papelera de reciclaje?`)) {
              await trashItem(target.path);
              this.navigateExplorer(this.explorerCurrentPath, false);
            }
          } else if (act === 'exp-view-icons') {
            this.explorerViewMode = 'icons';
            this.renderExplorerView();
          } else if (act === 'exp-view-grid') {
            this.explorerViewMode = 'grid';
            this.renderExplorerView();
          } else if (act === 'exp-view-list') {
            this.explorerViewMode = 'list';
            this.renderExplorerView();
          } else if (act === 'exp-view-details') {
            this.explorerViewMode = 'details';
            this.renderExplorerView();
          } else if (act === 'exp-new-folder') {
            if (this.explorerCurrentPath) {
              const baseName = 'Nueva carpeta';
              let folderName = baseName;
              let counter = 2;
              while ((this.explorerItems || []).some(it => it.name.toLowerCase() === folderName.toLowerCase())) {
                folderName = `${baseName} (${counter++})`;
              }
              await createDir(this.explorerCurrentPath, folderName);
              this.navigateExplorer(this.explorerCurrentPath, false);
            }
          } else if (act === 'exp-refresh') {
            if (this.explorerCurrentPath) {
              this.navigateExplorer(this.explorerCurrentPath, false);
            }
          }
        };
      });
    }

    document.addEventListener('click', (e) => {
      if (expContextMenu && !e.target.closest('#sim-explorer-context-menu')) {
        expContextMenu.classList.remove('menu-open');
      }
    });

    // -------------------------------------------------------------
    // Dock App Click, Navigation & Settings Routing
    // -------------------------------------------------------------
    const dockShelf = document.getElementById('mac-dock-shelf');
    if (dockShelf) {
      dockShelf.addEventListener('click', (e) => {
        // Minimized Window Tile click
        const minItem = e.target.closest('.dock-minimized-window-item');
        if (minItem) {
          if (e.target.closest('.mini-win-close-btn')) return;
          const winId = minItem.dataset.winId || 'sim-window-explorer';
          const targetWin = document.getElementById(winId);
          if (targetWin) {
            this.restoreWindow(targetWin, 'finder');
          }
          return;
        }

        const item = e.target.closest('.mac-dock-item');
        if (!item || item.classList.contains('btn-add-dock-app') || item.classList.contains('win-start-dock-item')) return;

        // Fix: Dock PRO Settings gear icon click -> switch directly to Dock tab!
        if (item.classList.contains('btn-dock-settings') || item.id === 'btn-open-dock-settings' || item.dataset.id === 'settings') {
          audioEngine.playClick();
          window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'dock' } }));
          return;
        }

        const appId = item.dataset.id;

        // Special handling for built-in items
        if (appId === 'finder' || item.dataset.name === 'Carpeta de Archivos') {
          audioEngine.playClick();
          if (explorerWin) {
            const isMinimized = explorerWin.style.display === 'none' || explorerWin.dataset.minimized === 'true';
            if (isMinimized) {
              this.restoreWindow(explorerWin, 'finder');
            } else {
              this.minimizeWindow(explorerWin, 'finder');
            }
          }
          return;
        }

        if (appId === 'trash') {
          audioEngine.playClick();
          if (isNative) {
            launchApp({ id: 'trash', exe: 'explorer.exe' });
          } else {
            alert('Papelera de reciclaje');
          }
          return;
        }

        audioEngine.playClick();
        item.classList.add('dock-bouncing');
        setTimeout(() => { item.classList.remove('dock-bouncing'); }, 700);

        // Desktop app: open the REAL program in Windows
        if (isNative) {
          const dockApp = (this.themeEngine.getState().dockApps || []).find(a => a.id === appId) || { id: appId, name: item.dataset.name };
          launchApp(dockApp).then(res => {
            if (res && !res.ok && res.reason) alert(res.reason);
          });
          return;
        }

        audioEngine.playNotification();
      });

      // -------------------------------------------------------------
      // Dock Context Menu (Right-click on Dock Apps)
      // -------------------------------------------------------------
      const dockContextMenu = document.getElementById('sim-dock-context-menu');
      if (dockContextMenu) {
        dockShelf.addEventListener('contextmenu', (e) => {
          const item = e.target.closest('.mac-dock-item:not(.btn-add-dock-app):not(.win-start-dock-item):not(.btn-dock-settings)');
          if (!item) return;
          e.preventDefault();
          e.stopPropagation();
          audioEngine.playClick();
          this.activeDockContextItem = item;

          const rect = this.desktop.getBoundingClientRect();
          let x = e.clientX - rect.left - 40;
          let y = e.clientY - rect.top - 180;
          if (x + 200 > rect.width) x = rect.width - 210;
          if (x < 10) x = 10;
          if (y < 10) y = 10;
          dockContextMenu.style.left = `${x}px`;
          dockContextMenu.style.top = `${y}px`;
          dockContextMenu.classList.add('menu-open');
        });

        dockContextMenu.querySelectorAll('.menu-item').forEach(mi => {
          mi.onclick = (e) => {
            e.stopPropagation();
            audioEngine.playClick();
            dockContextMenu.classList.remove('menu-open');
            const act = mi.dataset.action;
            const target = this.activeDockContextItem;
            if (!target) return;
            const appId = target.dataset.id;
            const dockApp = (this.themeEngine.getState().dockApps || []).find(a => a.id === appId);

            if (act === 'dock-open') {
              target.click();
            } else if (act === 'dock-copy-desktop') {
              if (dockApp) {
                this.themeEngine.addDesktopIcon({
                  id: 'desk-dock-' + Date.now(),
                  app: dockApp.id,
                  name: dockApp.name,
                  type: dockApp.type || 'app',
                  color: dockApp.color || '#3b82f6',
                  customIcon: dockApp.customIcon,
                  exe: dockApp.exe,
                  path: dockApp.path,
                  x: 100,
                  y: 100
                });
                audioEngine.playStartup();
                this.renderDesktopIconsOnly();
              }
            } else if (act === 'dock-move-left') {
              this.themeEngine.moveDockApp(appId, 'left');
              this.render();
              this.rebindAll();
            } else if (act === 'dock-move-right') {
              this.themeEngine.moveDockApp(appId, 'right');
              this.render();
              this.rebindAll();
            } else if (act === 'dock-remove') {
              this.themeEngine.removeDockApp(appId);
              this.render();
              this.rebindAll();
            }
          };
        });

        document.addEventListener('click', (e) => {
          if (!e.target.closest('#sim-dock-context-menu')) {
            dockContextMenu.classList.remove('menu-open');
          }
        });
      }

      // Make dock items draggable to desktop / fences
      dockShelf.querySelectorAll('.mac-dock-item:not(.btn-add-dock-app):not(.win-start-dock-item):not(.btn-dock-settings)').forEach(item => {
        item.setAttribute('draggable', 'true');
        item.ondragstart = (e) => {
          const appId = item.dataset.id;
          const dockApp = (this.themeEngine.getState().dockApps || []).find(a => a.id === appId) || { id: appId, name: item.dataset.name };
          const payload = {
            source: 'dock',
            id: dockApp.id,
            name: dockApp.name,
            app: dockApp.id,
            type: dockApp.type || 'app',
            color: dockApp.color || '#3b82f6',
            icon: dockApp.icon || 'star',
            customIcon: dockApp.customIcon || null,
            exe: dockApp.exe || '',
            path: dockApp.path || ''
          };
          e.dataTransfer.setData('application/json', JSON.stringify(payload));
          e.dataTransfer.effectAllowed = 'copy';
        };
      });

      // Drag and drop directly onto the Dock shelf to pin any app/file
      dockShelf.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      });
      dockShelf.addEventListener('drop', async (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          audioEngine.playStartup();
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
            const file = e.dataTransfer.files[i];
            const realPath = getFilePath(file);
            const name = file.name.replace(/\.[^/.]+$/, '');
            let iconUrl = null;
            if (realPath && isNative) {
              try { iconUrl = await getIcon(realPath); } catch {}
            }
            this.themeEngine.addDockApp({
              name,
              icon: iconUrl ? 'custom' : 'star',
              color: '#2563eb',
              customIcon: iconUrl,
              exe: '',
              path: realPath
            });
          }
          this.render();
          this.rebindAll();
          return;
        }

        try {
          const raw = e.dataTransfer.getData('application/json');
          if (raw) {
            const data = JSON.parse(raw);
            const item = data.isMulti ? (data.items && data.items[0]) : data;
            if (item) {
              audioEngine.playStartup();
              let iconUrl = item.thumbnail || null;
              if (!iconUrl && item.path && isNative) {
                try { iconUrl = await getIcon(item.path); } catch {}
              }
              this.themeEngine.addDockApp({
                name: item.name || 'App',
                icon: iconUrl ? 'custom' : (item.icon || 'star'),
                color: item.color || '#2563eb',
                customIcon: iconUrl,
                exe: '',
                path: item.path || ''
              });
              this.render();
              this.rebindAll();
            }
          }
        } catch {}
      });
    }

    // Modal controls for adding App to Dock
    const openAddAppBtn = document.getElementById('btn-open-add-app-modal');
    const closeAddAppBtn = document.getElementById('close-add-app-modal-btn');
    const cancelAddAppBtn = document.getElementById('btn-cancel-add-app');
    const modalAddApp = document.getElementById('modal-add-dock-app');

    // Dynamic Installed Windows Apps Scanner & Catalog
    let displayedCatalogApps = [...WINDOWS_EXE_CATALOG];
    const refreshBtn = document.getElementById('btn-refresh-apps-catalog');
    const filterInput = document.getElementById('filter-apps-catalog-input');

    const renderCatalogItems = (appsList) => {
      if (!catalogList) return;
      if (!appsList || appsList.length === 0) {
        catalogList.innerHTML = `
          <div style="padding: 14px; text-align: center; color: var(--text-muted); font-size: 0.65rem;">
            No se encontraron aplicaciones con ese filtro.
          </div>
        `;
        return;
      }
      catalogList.innerHTML = appsList.map((item, i) => {
        const isSel = selectedExePath ? (selectedExePath === item.path) : (i === 0);
        return `
          <div class="exe-item ${isSel ? 'selected' : ''}" data-path="${this.escapeHtml(item.path)}" data-name="${this.escapeHtml(item.name)}" data-icon-url="${this.escapeHtml(item.iconUrl || '')}" data-icon="${item.icon || 'app'}" data-color="${item.color || '#00e5db'}" data-index="${i}">
            <div class="exe-mini-squircle" style="background: ${item.iconUrl ? 'rgba(255, 255, 255, 0.08)' : this.getAppGradient(item.icon || 'app', item.color || '#00e5db')};">
              ${item.iconUrl 
                ? `<img src="${item.iconUrl}" alt="" class="exe-mini-img" />`
                : this.renderAppIconGlyph(item.icon || 'app')
              }
            </div>
            <div class="exe-item-info" style="flex: 1; min-width: 0;">
              <div class="exe-name-line" style="display: flex; justify-content: space-between; align-items: center; gap: 4px;">
                <span class="exe-app-name" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600;">${this.escapeHtml(item.name)}</span>
                <span class="exe-tag" style="flex-shrink: 0; font-size: 0.52rem;">${item.tag || (item.isShortcut ? 'Acceso Directo' : 'App')}</span>
              </div>
              <span class="exe-file-path" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.55rem; color: var(--text-muted);">${this.escapeHtml(item.path)}</span>
            </div>
          </div>
        `;
      }).join('');
    };

    const doScanApps = async (isManualClick = false) => {
      if (!isNative) return;
      const refreshIcon = refreshBtn?.querySelector('.refresh-icon');
      if (refreshIcon) refreshIcon.classList.add('spinning');
      if (refreshBtn) refreshBtn.disabled = true;

      try {
        const scanned = await scanApps();
        if (scanned && scanned.length > 0) {
          this.cachedInstalledApps = scanned;
          const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
          displayedCatalogApps = query 
            ? scanned.filter(a => (a.name || '').toLowerCase().includes(query) || (a.path && a.path.toLowerCase().includes(query)))
            : scanned;
          renderCatalogItems(displayedCatalogApps);
          if (isManualClick) audioEngine.playStartup();
        }
      } catch (err) {
        console.error('Error scanning apps:', err);
      } finally {
        if (refreshIcon) refreshIcon.classList.remove('spinning');
        if (refreshBtn) refreshBtn.disabled = false;
      }
    };

    if (refreshBtn) {
      refreshBtn.onclick = (e) => {
        e.preventDefault();
        doScanApps(true);
      };
    }

    if (filterInput) {
      filterInput.oninput = () => {
        const query = filterInput.value.trim().toLowerCase();
        const sourceList = (this.cachedInstalledApps && this.cachedInstalledApps.length > 0)
          ? this.cachedInstalledApps 
          : WINDOWS_EXE_CATALOG;
        displayedCatalogApps = query 
          ? sourceList.filter(a => (a.name || '').toLowerCase().includes(query) || (a.path || '').toLowerCase().includes(query))
          : sourceList;
        renderCatalogItems(displayedCatalogApps);
      };
    }

    const openAddModal = () => {
      audioEngine.playClick();
      this.isAddAppModalOpen = true;
      if (modalAddApp) modalAddApp.classList.add('modal-open');
      if (isNative && (!this.cachedInstalledApps || this.cachedInstalledApps.length === 0)) {
        doScanApps(false);
      }
    };

    const closeAddModal = () => {
      audioEngine.playClick();
      this.isAddAppModalOpen = false;
      if (modalAddApp) modalAddApp.classList.remove('modal-open');
    };

    if (openAddAppBtn) openAddAppBtn.onclick = openAddModal;
    if (closeAddAppBtn) closeAddAppBtn.onclick = closeAddModal;
    if (cancelAddAppBtn) cancelAddAppBtn.onclick = closeAddModal;

    const openDockSettingsBtn = document.getElementById('btn-open-dock-settings');
    if (openDockSettingsBtn) {
      openDockSettingsBtn.onclick = () => {
        audioEngine.playClick();
        window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'dock' } }));
      };
    }

    // Selection inside EXE Catalog list
    let selectedIcon = this.selectedExeApp.icon;
    let selectedColor = this.selectedExeApp.color;
    let customIconUrl = null;
    let selectedExePath = '';

    const previewGlyph = document.getElementById('preview-icon-glyph');
    const previewBox = document.getElementById('new-app-dock-preview');
    const appNameInput = document.getElementById('add-app-name-input');
    const catalogList = document.getElementById('exe-catalog-list');

    const updatePreview = () => {
      if (previewGlyph) previewGlyph.innerHTML = this.renderAppIconGlyph(selectedIcon, customIconUrl);
      if (previewBox) previewBox.style.background = this.getAppGradient(selectedIcon, selectedColor);
    };

    if (catalogList) {
      catalogList.addEventListener('click', async (e) => {
        const item = e.target.closest('.exe-item');
        if (!item) return;
        audioEngine.playClick();

        catalogList.querySelectorAll('.exe-item').forEach(el => el.classList.remove('selected'));
        item.classList.add('selected');

        const appName = item.dataset.name || 'Aplicación';
        const appPath = item.dataset.path || '';
        const appIconUrl = item.dataset.iconUrl || null;
        const appIcon = item.dataset.icon || 'app';
        const appColor = item.dataset.color || '#00e5db';

        selectedExePath = appPath;
        if (appNameInput) appNameInput.value = appName;

        if (appIconUrl) {
          customIconUrl = appIconUrl;
          selectedIcon = 'custom';
          selectedColor = appColor;
        } else {
          customIconUrl = null;
          selectedIcon = appIcon;
          selectedColor = appColor;
          if (isNative && appPath) {
            try {
              const icon = await getIcon(appPath);
              if (icon) {
                customIconUrl = icon;
                selectedIcon = 'custom';
              }
            } catch {}
          }
        }
        updatePreview();
      });
    }

    // Local file input (.exe or image)
    const browseFileBtn = document.getElementById('btn-browse-local-exe');
    const fileInput = document.getElementById('dock-exe-file-input');
    const filePathFeedback = document.getElementById('selected-file-path-feedback');

    if (browseFileBtn) {
      browseFileBtn.onclick = async () => {
        if (isNative) {
          const res = await chooseFile([
            { name: 'Ejecutables y Accesos directos (*.exe, *.lnk)', extensions: ['exe', 'lnk', 'bat'] },
            { name: 'Imágenes (*.png, *.jpg, *.ico, *.svg)', extensions: ['png', 'jpg', 'jpeg', 'ico', 'svg'] },
            { name: 'Todos los archivos (*.*)', extensions: ['*'] }
          ]);
          if (res) {
            audioEngine.playNotification();
            selectedExePath = res.path;
            const cleanName = res.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            if (filePathFeedback) {
              filePathFeedback.textContent = `Seleccionado: ${res.name}`;
              filePathFeedback.classList.remove('hidden');
            }
            if (appNameInput) {
              appNameInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            }
            if (res.iconUrl) {
              customIconUrl = res.iconUrl;
              selectedIcon = 'custom';
            } else {
              selectedIcon = 'code';
            }
            updatePreview();
          }
          return;
        }
        if (fileInput) fileInput.click();
      };

      if (fileInput) {
        fileInput.onchange = async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;

          audioEngine.playNotification();
          const fileName = file.name;
          const realPath = getFilePath(file);
          if (realPath && /\.(exe|lnk|bat)$/i.test(realPath)) selectedExePath = realPath;
          const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

          if (filePathFeedback) {
            filePathFeedback.textContent = `Seleccionado: ${fileName}`;
            filePathFeedback.classList.remove('hidden');
          }

          if (appNameInput) {
            appNameInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
          }

          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (re) => {
              customIconUrl = re.target.result;
              selectedIcon = 'custom';
              updatePreview();
            };
            reader.readAsDataURL(file);
          } else if (realPath && isNative) {
            try {
              const icon = await getIcon(realPath);
              if (icon) {
                customIconUrl = icon;
                selectedIcon = 'custom';
              } else {
                selectedIcon = 'code';
              }
            } catch {
              selectedIcon = 'code';
            }
            updatePreview();
          } else {
            selectedIcon = 'code';
            updatePreview();
          }
        };
      }
    }

    // Color chips
    document.querySelectorAll('.color-chip').forEach(chip => {
      chip.onclick = () => {
        document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active-chip'));
        chip.classList.add('active-chip');
        selectedColor = chip.dataset.color;
        updatePreview();
      };
    });

    // Submit Add App
    const submitAddAppBtn = document.getElementById('btn-submit-add-app');
    if (submitAddAppBtn && appNameInput) {
      submitAddAppBtn.onclick = () => {
        const name = appNameInput.value.trim() || 'Mi App';
        audioEngine.playStartup();
        this.themeEngine.addDockApp({
          name,
          icon: selectedIcon,
          color: selectedColor,
          customIcon: customIconUrl,
          exe: selectedExePath ? '' : (this.selectedExeApp && this.selectedExeApp.exe) || '',
          path: selectedExePath
        });
        selectedExePath = '';
        appNameInput.value = '';
        closeAddModal();
        this.render();
        this.rebindAll();
      };
    }

    // Desktop icons click handled by bindDesktopIconInteractions() for proper drag, click-to-open, and slow double-click rename

    // Right-click context menu (Full Windows 11 Fluent experience on Desktop background & Fences)
    const ctxTarget = document.getElementById('view-desktop') || this.desktop;
    ctxTarget.addEventListener('contextmenu', (e) => {
      if (e.target.closest('input') || e.target.closest('button') || e.target.closest('.fluent-window') || e.target.closest('.tochka-dashboard') || e.target.closest('.mac-dock-container')) return;
      e.preventDefault();
      audioEngine.playClick();
      const menu = document.getElementById('sim-context-menu');
      if (!menu) return;

      const iconEl = e.target.closest('.fence-icon-item') || e.target.closest('.desktop-icon');
      const iconActions = document.getElementById('menu-icon-actions');
      this.lastContextMenuContext = {
        inFence: !!e.target.closest('.desktop-fence'),
        fenceId: e.target.closest('.desktop-fence')?.dataset.fenceId || null,
        clientX: e.clientX,
        clientY: e.clientY
      };

      if (iconEl) {
        if (!iconEl.classList.contains('is-selected')) {
          document.querySelectorAll('.fence-icon-item.is-selected, .desktop-icon.is-selected').forEach(el => el.classList.remove('is-selected'));
          iconEl.classList.add('is-selected');
        }
        if (iconActions) iconActions.style.display = 'block';
      } else {
        if (iconActions) iconActions.style.display = 'none';
      }

      const rect = this.desktop.getBoundingClientRect();
      const menuW = 230;
      const menuH = 340;
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      if (x + menuW > rect.width - 20) {
        x = Math.max(10, rect.width - menuW - 20);
        menu.classList.add('submenu-align-left');
      } else {
        menu.classList.remove('submenu-align-left');
      }

      if (y + menuH > rect.height - 20) {
        y = Math.max(10, rect.height - menuH - 20);
      }

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.classList.add('menu-open');
    });

    document.addEventListener('click', (e) => {
      const menu = document.getElementById('sim-context-menu');
      if (menu && !e.target.closest('.fluent-context-menu')) {
        menu.classList.remove('menu-open');
      }
    });

    // Context menu actions dispatcher
    document.querySelectorAll('#sim-context-menu .menu-item').forEach(item => {
      item.onclick = (e) => {
        if (item.classList.contains('has-submenu')) {
          e.stopPropagation();
          return;
        }

        e.stopPropagation();
        const action = item.dataset.action;
        audioEngine.playClick();
        const menu = document.getElementById('sim-context-menu');
        if (menu) menu.classList.remove('menu-open');

        const activeFence = (this.themeEngine.getState().desktopFences || [])[0];
        const activeFenceId = activeFence ? activeFence.id : null;

        if (action === 'open-selected') {
          const selectedFence = document.querySelector('.fence-icon-item.is-selected');
          const selectedDesktop = document.querySelector('.desktop-icon.is-selected');
          if (selectedFence) this.openIconItem(selectedFence, 'fence');
          else if (selectedDesktop) this.openIconItem(selectedDesktop, 'desktop');
          return;
        } else if (action === 'open-with') {
          const selectedFence = document.querySelector('.fence-icon-item.is-selected');
          const selectedDesktop = document.querySelector('.desktop-icon.is-selected');
          const targetEl = selectedFence || selectedDesktop;
          if (targetEl) {
            let p = targetEl.dataset.path;
            if (!p && selectedDesktop) {
              const dIcon = (this.themeEngine.getState().desktopIcons || []).find(i => i.id === selectedDesktop.dataset.iconId);
              if (dIcon?.path) p = dIcon.path;
            }
            if (!p && selectedFence) {
              const fId = selectedFence.dataset.parentFence;
              const fence = (this.themeEngine.getState().desktopFences || []).find(f => f.id === fId);
              const fIcon = fence?.icons?.find(i => i.id === selectedFence.dataset.iconId);
              if (fIcon?.path) p = fIcon.path;
            }
            if (p) {
              openWith(p);
            } else {
              this.showDesktopToast('Abrir con: Este archivo no está vinculado a una ruta física en disco');
            }
          }
          return;
        } else if (action === 'rename-icon') {
          const selectedFence = document.querySelector('.fence-icon-item.is-selected');
          const selectedDesktop = document.querySelector('.desktop-icon.is-selected');
          if (selectedFence) {
            this.startInlineRename(selectedFence);
          } else if (selectedDesktop) {
            this.startDesktopInlineRename(selectedDesktop);
          }
          return;
        } else if (action === 'delete-icon') {
          const selectedFenceIcons = Array.from(document.querySelectorAll('.fence-icon-item.is-selected'));
          const selectedDesktopIcons = Array.from(document.querySelectorAll('.desktop-icon.is-selected'));
          if (selectedFenceIcons.length > 0) {
            audioEngine.playClick();
            selectedFenceIcons.forEach(si => {
              const fId = si.dataset.parentFence;
              const icId = si.dataset.iconId;
              this.themeEngine.removeIconFromFence(fId, icId);
            });
            this.renderFencesOnly();
          }
          if (selectedDesktopIcons.length > 0) {
            audioEngine.playClick();
            selectedDesktopIcons.forEach(di => {
              this.themeEngine.removeDesktopIcon(di.dataset.iconId);
            });
            this.renderDesktopIconsOnly();
          }
          return;
        } else if (action === 'refresh') {
          audioEngine.playStartup();
          this.desktop.style.filter = 'brightness(1.18)';
          setTimeout(() => { this.desktop.style.filter = ''; }, 160);
          this.renderFencesOnly();
        } else if (action === 'icon-size-large') {
          if (activeFenceId) this.themeEngine.updateDesktopFence(activeFenceId, { iconSize: 'large' });
          this.renderFencesOnly();
        } else if (action === 'icon-size-medium') {
          if (activeFenceId) this.themeEngine.updateDesktopFence(activeFenceId, { iconSize: 'medium' });
          this.renderFencesOnly();
        } else if (action === 'icon-size-small') {
          if (activeFenceId) this.themeEngine.updateDesktopFence(activeFenceId, { iconSize: 'small' });
          this.renderFencesOnly();
        } else if (action === 'toggle-grid-snap') {
          audioEngine.playNotification();
        } else if (action === 'toggle-desktop-icons') {
          const icons = document.querySelectorAll('.desktop-icon');
          icons.forEach(ic => {
            ic.style.display = ic.style.display === 'none' ? 'flex' : 'none';
          });
        } else if (action === 'sort-name') {
          if (activeFenceId && activeFence && activeFence.icons) {
            const sorted = [...activeFence.icons].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            const updated = sorted.map((ic, idx) => ({ ...ic, x: null, y: null }));
            this.themeEngine.updateDesktopFence(activeFenceId, { icons: updated });
            this.renderFencesOnly();
          }
        } else if (action === 'sort-type') {
          if (activeFenceId && activeFence && activeFence.icons) {
            const sorted = [...activeFence.icons].sort((a, b) => (a.type || '').localeCompare(b.type || ''));
            const updated = sorted.map((ic, idx) => ({ ...ic, x: null, y: null }));
            this.themeEngine.updateDesktopFence(activeFenceId, { icons: updated });
            this.renderFencesOnly();
          }
        } else if (action === 'sort-size' || action === 'sort-date') {
          if (activeFenceId && activeFence && activeFence.icons) {
            const reversed = [...activeFence.icons].reverse();
            const updated = reversed.map((ic, idx) => ({ ...ic, x: null, y: null }));
            this.themeEngine.updateDesktopFence(activeFenceId, { icons: updated });
            this.renderFencesOnly();
          }
        } else if (action === 'undo') {
          audioEngine.playNotification();
        } else if (action && action.startsWith('new-')) {
          const handleNewItem = (itemData) => {
            if (this.lastContextMenuContext?.inFence && this.lastContextMenuContext.fenceId) {
              this.addNewItemToActiveFence(itemData, this.lastContextMenuContext.fenceId);
            } else {
              this.addNewItemToDesktop(itemData, this.lastContextMenuContext?.clientX, this.lastContextMenuContext?.clientY);
            }
          };

          if (action === 'new-folder') {
            handleNewItem({ name: 'Nueva Carpeta', type: 'folder', icon: 'folder', color: '#06b6d4' });
          } else if (action === 'new-skp') {
            handleNewItem({ name: 'Nuevo_Modelo_3D.skp', type: 'app', icon: 'palette', color: '#dc2626' });
          } else if (action === 'new-dwg') {
            handleNewItem({ name: 'Nuevo_Plano_CAD.dwg', type: 'app', icon: 'terminal', color: '#ef4444' });
          } else if (action === 'new-video') {
            handleNewItem({ name: 'Nuevo_Video_Clip.mp4', type: 'video', icon: 'video', color: '#f43f5e' });
          } else if (action === 'new-psd') {
            handleNewItem({ name: 'Nuevo_Diseno.psd', type: 'app', icon: 'palette', color: '#001e36' });
          } else if (action === 'new-cdr') {
            handleNewItem({ name: 'Nuevo_Vector.cdr', type: 'app', icon: 'palette', color: '#047857' });
          } else if (action === 'new-pdf') {
            handleNewItem({ name: 'Nuevo_Documento.pdf', type: 'pdf', icon: 'doc', color: '#0284c7' });
          } else if (action === 'new-xlsx') {
            handleNewItem({ name: 'Hoja_Calculo.xlsx', type: 'docs', icon: 'doc', color: '#10b981' });
          } else if (action === 'new-docx') {
            handleNewItem({ name: 'Documento_Word.docx', type: 'docs', icon: 'doc', color: '#2563eb' });
          } else if (action === 'new-txt') {
            handleNewItem({ name: 'Nuevo Documento de texto.txt', type: 'docs', icon: 'doc', color: '#94a3b8' });
          } else if (action === 'new-zip') {
            handleNewItem({ name: 'Archivo_Comprimido.zip', type: 'folder', icon: 'folder', color: '#eab308' });
          }
        } else if (action === 'new-shortcut') {
          const expWin = document.getElementById('sim-window-explorer');
          if (expWin) {
            expWin.style.display = 'flex';
            this.bringWindowToFront(expWin);
          }
        } else if (action === 'display-settings') {
          if (isNative) {
            openUri('ms-settings:display');
          } else {
            const hub = document.getElementById('win-start-menu-hub');
            if (hub) hub.classList.add('start-menu-open');
          }
        } else if (action === 'open-terminal') {
          if (isNative) {
            launchApp({ id: 'terminal', exe: 'wt.exe' });
          } else {
            const expWin = document.getElementById('sim-window-explorer');
            if (expWin) {
              expWin.style.display = 'flex';
              this.bringWindowToFront(expWin);
            }
          }
        } else if (action === 'create-fence') {
          this.createNewGroup();
        } else if (action === 'toggle-taskbar') {
          this.themeEngine.toggleWindowsTaskbar();
          this.render();
          this.rebindAll();
        } else if (action === 'add-app') {
          openAddModal();
        } else if (action === 'open-theme-settings') {
          window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'theme-studio' } }));
        }
      };
    });

    // Toggle Taskbar Peek Handle
    const btnPeekTaskbar = document.getElementById('btn-peek-taskbar');
    if (btnPeekTaskbar) {
      btnPeekTaskbar.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        this.themeEngine.toggleWindowsTaskbar();
        this.render();
        this.rebindAll();
      };
    }
  }

  getFenceGridMetrics(fence) {
    const iconSize = fence?.iconSize || 'medium';
    const itemW = iconSize === 'small' ? 58 : (iconSize === 'large' ? 82 : 68);
    const itemH = iconSize === 'small' ? 64 : (iconSize === 'large' ? 92 : 78);
    const gap = (fence && fence.iconGap) ? fence.iconGap : 10;
    const stepX = itemW + gap;
    const stepY = itemH + gap + 8;
    const paddingX = 14;
    const paddingY = 14;
    const availableW = Math.max(itemW + 20, (fence?.w || 300) - 28);
    const cols = Math.max(1, Math.floor((availableW - paddingX) / stepX));
    return { iconSize, itemW, itemH, gap, stepX, stepY, paddingX, paddingY, cols };
  }

  startInlineRename(item) {
    if (!item) return;
    if (item.querySelector('.fence-rename-input')) return;

    const labelEl = item.querySelector('.fence-icon-label');
    if (!labelEl) return;

    const oldName = item.dataset.iconName || labelEl.textContent.trim();
    const fenceId = item.dataset.parentFence;
    const iconId = item.dataset.iconId;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'fence-rename-input';
    input.value = oldName;
    input.setAttribute('spellcheck', 'false');

    labelEl.style.display = 'none';
    item.classList.add('is-renaming');
    item.insertBefore(input, labelEl.nextSibling);

    input.focus();

    // Select name excluding extension
    const lastDot = oldName.lastIndexOf('.');
    if (lastDot > 0) {
      input.setSelectionRange(0, lastDot);
    } else {
      input.select();
    }

    let isCommitted = false;

    const commit = () => {
      if (isCommitted) return;
      isCommitted = true;
      const newName = input.value.trim();
      input.remove();
      labelEl.style.display = '';
      item.classList.remove('is-renaming');

      if (newName && newName !== oldName) {
        audioEngine.playNotification();
        const wasFolder = item.dataset.iconType === 'folder' || !oldName.includes('.');
        const detectedType = wasFolder ? 'folder' : (this.detectThumbnailType ? this.detectThumbnailType(newName) : null);
        const patch = { name: newName };
        if (wasFolder) {
          patch.type = 'folder';
          patch.icon = 'folder';
        } else if (detectedType && detectedType !== 'generic') {
          patch.type = detectedType;
          patch.icon = detectedType;
        }

        const oldPath = item.dataset.path;
        if (isNative && oldPath) {
          const lastSlash = oldPath.lastIndexOf('\\');
          if (lastSlash > 0) {
            const parent = oldPath.substring(0, lastSlash + 1);
            const newPath = parent + newName;
            renamePath(oldPath, newPath).then(res => {
              if (res && res.ok) {
                patch.path = newPath;
                item.dataset.path = newPath;
              }
            });
          }
        }

        this.themeEngine.updateIconInFence(fenceId, iconId, patch);
        this.renderFencesOnly();
      }
    };

    const cancel = () => {
      if (isCommitted) return;
      isCommitted = true;
      input.remove();
      labelEl.style.display = '';
      item.classList.remove('is-renaming');
    };

    input.addEventListener('mousedown', (e) => e.stopPropagation());
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('dblclick', (e) => e.stopPropagation());

    input.addEventListener('keydown', (ke) => {
      ke.stopPropagation();
      if (ke.key === 'Enter') {
        commit();
      } else if (ke.key === 'Escape') {
        cancel();
      }
    });

    input.addEventListener('blur', () => {
      commit();
    });
  }

  startDesktopInlineRename(item) {
    if (!item) return;
    if (item.querySelector('.desktop-rename-input')) return;

    const labelEl = item.querySelector('.icon-label');
    if (!labelEl) return;

    const oldName = item.dataset.iconName || labelEl.textContent.trim();
    const iconId = item.dataset.iconId;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'desktop-rename-input';
    input.value = oldName;
    input.setAttribute('spellcheck', 'false');

    labelEl.style.display = 'none';
    item.classList.add('is-renaming');
    item.appendChild(input);

    input.focus();

    const lastDot = oldName.lastIndexOf('.');
    if (lastDot > 0) {
      input.setSelectionRange(0, lastDot);
    } else {
      input.select();
    }

    let isCommitted = false;

    const commit = () => {
      if (isCommitted) return;
      isCommitted = true;
      const newName = input.value.trim();
      input.remove();
      labelEl.style.display = '';
      item.classList.remove('is-renaming');

      if (newName && newName !== oldName) {
        audioEngine.playNotification();
        const dIcon = (this.themeEngine.getState().desktopIcons || []).find(i => i.id === iconId);
        const wasFolder = item.dataset.iconType === 'folder' || dIcon?.type === 'folder' || !oldName.includes('.');
        const detectedType = wasFolder ? 'folder' : (this.detectThumbnailType ? this.detectThumbnailType(newName) : null);
        const patch = { name: newName };
        if (wasFolder) {
          patch.type = 'folder';
          patch.icon = 'folder';
        } else if (detectedType && detectedType !== 'generic') {
          patch.type = detectedType;
          patch.icon = detectedType;
        }

        const oldPath = item.dataset.path || dIcon?.path;
        if (isNative && oldPath) {
          const lastSlash = oldPath.lastIndexOf('\\');
          if (lastSlash > 0) {
            const parent = oldPath.substring(0, lastSlash + 1);
            const newPath = parent + newName;
            renamePath(oldPath, newPath).then(res => {
              if (res && res.ok) {
                patch.path = newPath;
                item.dataset.path = newPath;
              }
            });
          }
        }

        this.themeEngine.updateDesktopIcon(iconId, patch);
        this.renderDesktopIconsOnly();
      }
    };

    const cancel = () => {
      if (isCommitted) return;
      isCommitted = true;
      input.remove();
      labelEl.style.display = '';
      item.classList.remove('is-renaming');
    };

    input.addEventListener('mousedown', (e) => e.stopPropagation());
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('dblclick', (e) => e.stopPropagation());

    input.addEventListener('keydown', (ke) => {
      ke.stopPropagation();
      if (ke.key === 'Enter') {
        commit();
      } else if (ke.key === 'Escape') {
        cancel();
      }
    });

    input.addEventListener('blur', () => {
      commit();
    });
  }

  createNewGroup() {
    audioEngine.playStartup();
    const fences = this.themeEngine.getState().desktopFences || [];
    const count = fences.length + 1;
    const newFence = this.themeEngine.addDesktopFence({
      title: `Grupo ${count}`,
      w: 480, // +200px wider as requested
      h: 260,
      isPinned: false
    });
    this.renderFencesOnly();
    setTimeout(() => {
      const fenceEl = document.getElementById(`sim-fence-${newFence.id}`);
      if (fenceEl) {
        this.bringFenceToFront(fenceEl);
        fenceEl.classList.add('fence-highlighted');
        setTimeout(() => fenceEl.classList.remove('fence-highlighted'), 1200);
      }
    }, 60);
    return newFence;
  }

  async openIconItem(item, source = 'desktop') {
    audioEngine.playStartup();
    let filePath = item.dataset.path || '';
    const fenceId = item.dataset.parentFence;
    const iconId = item.dataset.iconId;
    let app = item.dataset.app || '';
    let iconName = item.dataset.iconName || '';
    let iconType = item.dataset.iconType || '';
    let iconObj = null;

    // Permanent "Grupo" / "Cajón" Icon click -> Add and foreground new group
    if (app === 'create-group' || iconId === 'd-group') {
      this.createNewGroup();
      return;
    }

    if (source === 'desktop') {
      const desktopIcon = (this.themeEngine.getState().desktopIcons || []).find(i => i.id === iconId);
      if (desktopIcon) {
        iconObj = desktopIcon;
        if (desktopIcon.app === 'create-group' || desktopIcon.id === 'd-group') {
          this.createNewGroup();
          return;
        }
        if (desktopIcon.path) filePath = desktopIcon.path;
        if (desktopIcon.name) iconName = desktopIcon.name;
        if (desktopIcon.type) iconType = desktopIcon.type;
        if (desktopIcon.app) app = desktopIcon.app;
      }
    } else if (fenceId && iconId) {
      const fence = (this.themeEngine.getState().desktopFences || []).find(f => f.id === fenceId);
      iconObj = fence?.icons?.find(i => i.id === iconId);
      if (iconObj) {
        if (iconObj.path) filePath = iconObj.path;
        if (iconObj.name) iconName = iconObj.name;
        if (iconObj.type) iconType = iconObj.type;
        if (iconObj.app) app = iconObj.app;
      }
    }

    // 1. Check for folder navigation (Integrated Explorer Window)
    const isFolder = iconType === 'folder' || 
                     iconObj?.type === 'folder' || 
                     iconObj?.icon === 'folder' || 
                     item.dataset.iconType === 'folder' || 
                     (iconName && iconName.toLowerCase().includes('carpeta')) || 
                     app === 'explorer' || 
                     (!iconName.includes('.') && iconType !== 'app' && !iconObj?.exe && !item.dataset.exe);

    if (isFolder) {
      const expWin = document.getElementById('sim-window-explorer');
      if (expWin) {
        this.restoreWindow(expWin, 'finder');
        this.bringWindowToFront(expWin);
        let targetDir = filePath;
        if (!targetDir && isNative) {
          const deskPlace = this.explorerPlaces?.find(p => p.id === 'desktop');
          const deskDir = deskPlace?.path || 'C:\\Users\\tomfg\\Desktop';
          targetDir = `${deskDir}\\${iconName}`;
        }
        if (!targetDir) {
          targetDir = this.explorerCurrentPath || 'C:\\';
        }
        await this.navigateExplorer(targetDir);
      }
      return;
    }

    // 2. Images: Modal preview or default OS viewer
    const isImg = iconType === 'images' || /\.(png|jpe?g|webp|gif|bmp|ico|svg)$/i.test(iconName);
    if (isImg) {
      if (filePath && isNative) {
        const res = await openPath(filePath);
        if (res && res.ok) return;
      }
      const thumb = iconObj?.thumbnail || item.dataset.thumbnail;
      if (thumb) {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;cursor:pointer;animation:contextFadeIn 0.15s ease;';
        modal.innerHTML = `<div style="position:relative;max-width:90vw;max-height:90vh;display:flex;flex-direction:column;align-items:center;gap:12px;">
          <img src="${thumb}" style="max-width:90vw;max-height:80vh;border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,0.8);object-fit:contain;" />
          <div style="color:#fff;font-size:0.85rem;font-weight:600;">${this.escapeHtml(iconName)} <span style="font-size:0.7rem;color:var(--text-muted);">(Haz clic para cerrar)</span></div>
        </div>`;
        modal.onclick = () => modal.remove();
        document.body.appendChild(modal);
        return;
      }
    }

    // 3. Physical file with path on disk: Open with Windows native default application!
    if (filePath && isNative && !isFolder) {
      const res = await openPath(filePath);
      if (res && res.ok) return;
    }

    // 4. System shortcuts
    if (app === 'thispc' || app === 'finder' || app.startsWith('drive-')) {
      const expWin = document.getElementById('sim-window-explorer');
      if (expWin) {
        this.restoreWindow(expWin, 'finder');
        const target = app.startsWith('drive-') ? `${app.replace('drive-', '')}:\\` : (this.explorerCurrentPath || 'C:\\');
        await this.navigateExplorer(target);
      }
      return;
    }

    if (app === 'terminal') {
      if (isNative) launchApp({ id: 'terminal', exe: 'wt.exe' });
      return;
    }

    if (app === 'theme-settings') {
      window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'theme-studio' } }));
      return;
    }

    if (app === 'trash') {
      if (isNative) launchApp({ id: 'trash', exe: 'explorer.exe' });
      return;
    }

    // 5. Check by extension or app executable
    const ext = (iconName.includes('.') ? iconName.split('.').pop() : '').toLowerCase();
    if (ext === 'txt') {
      if (isNative) launchApp({ exe: 'notepad.exe', path: filePath || '' });
      else this.showDesktopToast('Abriendo con Bloc de notas: ' + iconName);
      return;
    }
    if (ext === 'skp') {
      if (isNative) launchApp({ exe: 'SketchUp.exe', path: filePath || '' });
      else this.showDesktopToast('Abriendo con SketchUp: ' + iconName);
      return;
    }
    if (ext === 'dwg') {
      if (isNative) launchApp({ exe: 'acad.exe', path: filePath || '' });
      else this.showDesktopToast('Abriendo con AutoCAD: ' + iconName);
      return;
    }
    if (ext === 'psd') {
      if (isNative) launchApp({ exe: 'Photoshop.exe', path: filePath || '' });
      else this.showDesktopToast('Abriendo con Photoshop: ' + iconName);
      return;
    }
    if (ext === 'cdr') {
      if (isNative) launchApp({ exe: 'CorelDRW.exe', path: filePath || '' });
      else this.showDesktopToast('Abriendo con CorelDRAW: ' + iconName);
      return;
    }
    if (iconObj?.exe || item.dataset.exe) {
      const targetExe = iconObj?.exe || item.dataset.exe;
      if (isNative) launchApp({ exe: targetExe, path: filePath || '' });
      return;
    }

    const expWin = document.getElementById('sim-window-explorer');
    if (expWin) {
      this.restoreWindow(expWin, 'finder');
    }
  }

  async initExplorer() {
    if (isNative) {
      try {
        const placesData = await getPlaces();
        if (placesData) {
          this.explorerPlaces = placesData.places || [];
          this.explorerDrives = placesData.drives || [];
        }
        if (!this.explorerCurrentPath) {
          const docPlace = this.explorerPlaces.find(p => p.id === 'documents') || this.explorerPlaces[0];
          this.explorerCurrentPath = (docPlace && docPlace.path) || (this.explorerDrives[0] && this.explorerDrives[0].path) || 'C:\\';
        }
        await this.navigateExplorer(this.explorerCurrentPath, false);
      } catch (err) {
        console.warn('initExplorer error', err);
      }
    } else {
      this.renderExplorerView();
    }
  }

  async navigateExplorer(newPath, pushHistory = true) {
    if (!newPath) return;
    if (pushHistory && this.explorerCurrentPath && this.explorerCurrentPath !== newPath) {
      this.explorerHistory.push(this.explorerCurrentPath);
    }
    this.explorerCurrentPath = newPath;
    if (isNative) {
      try {
        let res = await readDir(newPath);
        if ((!res || !res.ok) && !newPath.includes('.')) {
          // If directory does not exist yet on disk, create it and retry
          const lastSlash = newPath.lastIndexOf('\\');
          if (lastSlash > 0) {
            const parent = newPath.substring(0, lastSlash);
            const dName = newPath.substring(lastSlash + 1);
            try {
              await createDir(parent, dName);
              res = await readDir(newPath);
            } catch {}
          }
        }
        if (res && res.ok) {
          this.explorerItems = res.items || [];
          if (res.currentPath) this.explorerCurrentPath = res.currentPath;
        } else {
          this.explorerItems = [];
        }
      } catch (err) {
        console.warn('readDir error', err);
        this.explorerItems = [];
      }
    }
    this.renderExplorerView();
  }

  renderExplorerView() {
    const titleEl = document.getElementById('explorer-title-text');
    const sidebarNav = document.getElementById('explorer-sidebar-nav');
    const filesContainer = document.getElementById('explorer-files-container');
    const breadcrumbs = document.getElementById('explorer-breadcrumbs');

    if (titleEl) {
      titleEl.textContent = `TopApp Workspace — ${this.explorerCurrentPath || 'Explorador'}`;
    }

    // Breadcrumbs
    if (breadcrumbs && this.explorerCurrentPath) {
      const normalized = this.explorerCurrentPath.replace(/\\$/, '');
      const parts = normalized.split('\\');
      let accumulated = '';
      const crumbsHtml = parts.map((part, idx) => {
        accumulated += (idx === 0 ? part + '\\' : part + '\\');
        const crumbPath = accumulated.replace(/\\$/, '') || (part + '\\');
        const isLast = idx === parts.length - 1;
        return `<span class="crumb-segment ${isLast ? 'path-active' : ''}" style="cursor: pointer; ${isLast ? 'font-weight: 700; color: #fff;' : 'color: var(--text-muted);'}" data-path="${this.escapeHtml(crumbPath)}">${this.escapeHtml(part || 'Disco')}</span>`;
      }).join(' <span style="opacity: 0.5;">›</span> ');
      breadcrumbs.innerHTML = `<span class="path-icon-wrap">${SVGS.folderSmall}</span> ${crumbsHtml}`;
      breadcrumbs.querySelectorAll('.crumb-segment').forEach(seg => {
        seg.onclick = (e) => {
          e.stopPropagation();
          const p = seg.dataset.path;
          if (p) this.navigateExplorer(p);
        };
      });
    }

    // Sidebar
    if (sidebarNav) {
      let navHtml = '';
      if (this.explorerPlaces && this.explorerPlaces.length) {
        navHtml += `<div class="sidebar-cat">Carpetas</div>`;
        navHtml += this.explorerPlaces.map(p => `
          <div class="sidebar-item ${this.explorerCurrentPath.toLowerCase() === p.path.toLowerCase() ? 'active' : ''}" data-path="${this.escapeHtml(p.path)}">
            <span class="side-ico">${SVGS.star}</span> ${this.escapeHtml(p.name)}
          </div>
        `).join('');
      }
      if (this.explorerDrives && this.explorerDrives.length) {
        navHtml += `<div class="sidebar-cat" style="margin-top: 8px;">Discos</div>`;
        navHtml += this.explorerDrives.map(d => `
          <div class="sidebar-item ${this.explorerCurrentPath.toLowerCase().startsWith(d.path.toLowerCase()) ? 'active' : ''}" data-path="${this.escapeHtml(d.path)}">
            <span class="side-ico">${SVGS.disk}</span> ${this.escapeHtml(d.name)}
          </div>
        `).join('');
      }
      if (!navHtml) {
        navHtml = `
          <div class="sidebar-cat">Ubicaciones</div>
          <div class="sidebar-item active" data-path="C:\\">
            <span class="side-ico">${SVGS.disk}</span> Disco C:
          </div>
        `;
      }
      sidebarNav.innerHTML = navHtml;
      sidebarNav.querySelectorAll('.sidebar-item').forEach(item => {
        item.onclick = (e) => {
          e.stopPropagation();
          audioEngine.playClick();
          const p = item.dataset.path;
          if (p) this.navigateExplorer(p);
        };
      });
    }

    // Files and folders grid
    if (filesContainer) {
      filesContainer.className = `file-grid view-${this.explorerViewMode || 'grid'}`;
      const q = String(this.explorerSearchFilter || '').toLowerCase().trim();
      let items = [...(this.explorerItems || [])];
      if (q) {
        items = items.filter(it => it.name.toLowerCase().includes(q));
      }

      // Sorting
      const sortBy = this.explorerSortBy || 'name';
      items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        if (sortBy === 'name') return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        if (sortBy === 'type') return (a.type || '').localeCompare(b.type || '');
        if (sortBy === 'size') return (a.rawSize || 0) - (b.rawSize || 0);
        if (sortBy === 'date') return (b.mtimeMs || 0) - (a.mtimeMs || 0);
        return 0;
      });

      if (!items.length) {
        filesContainer.innerHTML = `<div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: var(--text-dim); font-size: 0.72rem;">Esta carpeta está vacía o no contiene elementos coincidentes.</div>`;
        return;
      }

      filesContainer.innerHTML = items.map(it => {
        const isImage = it.type === 'images' || /\.(png|jpe?g|webp|gif|bmp|ico|svg)$/i.test(it.name);
        const isShortcut = !!(it.isShortcut || (it.name && it.name.toLowerCase().endsWith('.lnk')));
        const cleanDisplayName = isShortcut ? it.name.replace(/\.lnk$/i, '').replace(/ - Acceso directo$/i, '') : it.name;

        // Windows classic shortcut arrow badge in the bottom-left corner
        const shortcutBadge = isShortcut ? `
          <span class="win-shortcut-arrow-badge" title="Acceso directo">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <rect x="0.5" y="0.5" width="15" height="15" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
              <path d="M4 12 L11 5 M11 5 L6 5 M11 5 L11 10" stroke="#0284c7" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        ` : '';

        let badgeHtml = '';
        if (it.isDirectory) {
          badgeHtml = `<div class="file-thumb" style="background: rgba(6, 182, 212, 0.15); color: #06b6d4;">${SVGS.folder}</div>`;
        } else if (it.iconUrl) {
          badgeHtml = `
            <div class="file-thumb file-thumb-custom" style="position: relative;">
              <img src="${it.iconUrl}" class="file-img-mini" alt="${this.escapeHtml(it.name)}" />
              ${shortcutBadge}
            </div>
          `;
        } else if (isImage) {
          const thumbUrl = `/local-file/${encodeURIComponent(it.path)}`;
          badgeHtml = `
            <div class="file-thumb file-thumb-img-preview" style="position: relative;" title="Miniatura">
              <img src="${thumbUrl}" loading="lazy" class="file-img-mini" onerror="this.onerror=null;this.parentElement.className='file-thumb file-thumb-blue';this.parentElement.innerHTML='${SVGS.image}';" />
              ${shortcutBadge}
            </div>
          `;
        } else if (it.type === 'pdf') {
          badgeHtml = `<div class="file-thumb" style="position: relative; background: rgba(220, 38, 38, 0.2); color: #ef4444; font-weight: 900; font-size: 0.65rem;">PDF${shortcutBadge}</div>`;
        } else if (it.type === 'code') {
          badgeHtml = `<div class="file-thumb file-thumb-coral" style="position: relative;">&lt;/&gt;${shortcutBadge}</div>`;
        } else if (it.type === 'audio') {
          badgeHtml = `<div class="file-thumb" style="position: relative; background: rgba(168, 85, 247, 0.2); color: #c084fc;">♫${shortcutBadge}</div>`;
        } else if (it.type === 'videos') {
          badgeHtml = `<div class="file-thumb" style="position: relative; background: #1e1124; color: #f43f5e; font-size: 0.65rem;">▶${shortcutBadge}</div>`;
        } else if (it.type === 'app') {
          badgeHtml = `<div class="file-thumb" style="position: relative; background: rgba(37, 99, 235, 0.15); color: #3b82f6;">${SVGS.terminal}${shortcutBadge}</div>`;
        } else {
          badgeHtml = `<div class="file-thumb" style="position: relative; background: rgba(255, 255, 255, 0.08); color: var(--text-white);">${SVGS.doc}${shortcutBadge}</div>`;
        }

        return `
          <div class="file-item ${it.isDirectory ? 'is-dir' : 'is-file'} ${isShortcut ? 'is-shortcut' : ''}" draggable="true" data-path="${this.escapeHtml(it.path)}" data-is-dir="${it.isDirectory}" data-name="${this.escapeHtml(it.name)}" data-type="${it.type || (it.isDirectory ? 'folder' : 'file')}" data-icon-url="${this.escapeHtml(it.iconUrl || '')}" title="${this.escapeHtml(it.name)}" style="cursor: pointer;">
            ${badgeHtml}
            <div class="file-info-col">
              <div class="file-name">${this.escapeHtml(cleanDisplayName)}</div>
              <div class="file-meta">${it.isDirectory ? 'Carpeta de archivos' : (isShortcut ? 'Acceso directo' : it.size)}</div>
            </div>
            ${this.explorerViewMode === 'details' ? `
              <div class="file-meta-extra">${it.isDirectory ? 'Carpeta' : (isShortcut ? 'Acceso directo' : (it.type || 'Archivo'))}</div>
              <div class="file-meta-extra">${it.isDirectory ? '--' : it.size}</div>
            ` : ''}
          </div>
        `;
      }).join('');

      filesContainer.querySelectorAll('.file-item').forEach(item => {
        item.onclick = (e) => {
          if (!e.ctrlKey && !e.shiftKey) {
            filesContainer.querySelectorAll('.file-item.is-selected').forEach(el => el.classList.remove('is-selected'));
          }
          item.classList.toggle('is-selected');
        };

        item.ondblclick = (e) => {
          e.stopPropagation();
          const isDir = item.dataset.isDir === 'true';
          const p = item.dataset.path;
          if (isDir) {
            audioEngine.playClick();
            this.navigateExplorer(p);
          } else {
            audioEngine.playStartup();
            openPath(p);
          }
        };

        item.ondragstart = (e) => {
          const isDir = item.dataset.isDir === 'true';
          const p = item.dataset.path;
          const name = item.dataset.name;
          const type = item.dataset.type;
          const iconUrl = item.dataset.iconUrl;
          const isImage = type === 'images' || /\.(png|jpe?g|webp|gif|bmp|ico|svg)$/i.test(name);
          const isLnk = item.classList.contains('is-shortcut') || (p && p.toLowerCase().endsWith('.lnk')) || (name && name.toLowerCase().endsWith('.lnk'));
          const cleanName = (name || '').replace(/\.lnk$/i, '');
          const dragData = {
            source: 'explorer',
            name: cleanName,
            path: p,
            type: isDir ? 'folder' : (isImage ? 'images' : type),
            isDirectory: isDir,
            customIcon: iconUrl || null,
            isShortcut: isLnk,
            thumbnail: isImage && p ? `/local-file/${encodeURIComponent(p)}` : null
          };
          e.dataTransfer.setData('application/json', JSON.stringify(dragData));
          e.dataTransfer.effectAllowed = 'copyMove';
        };
      });
    }
  }

  async addNewItemToActiveFence(iconData, targetFenceId = null) {
    const fences = this.themeEngine.getState().desktopFences || [];
    let targetFence = targetFenceId ? fences.find(f => f.id === targetFenceId) : fences[0];
    if (!targetFence) {
      targetFence = this.themeEngine.addDesktopFence({ title: 'Proyectos & Trabajo' });
    }
    const fenceId = targetFence.id;
    const { stepX, stepY, paddingX, paddingY, cols } = this.getFenceGridMetrics(targetFence);

    const currentIcons = targetFence.icons || [];
    const occupied = (c, r) => currentIcons.some(ic => {
      if (ic.x == null || ic.y == null) return false;
      const icC = Math.round((ic.x - paddingX) / stepX);
      const icR = Math.round((ic.y - paddingY) / stepY);
      return icC === c && icR === r;
    });

    let col = 0, row = 0;
    let foundSlot = false;
    for (let r = 0; r < 50 && !foundSlot; r++) {
      for (let c = 0; c < cols && !foundSlot; c++) {
        if (!occupied(c, r)) {
          col = c;
          row = r;
          foundSlot = true;
        }
      }
    }

    const posX = paddingX + col * stepX;
    const posY = paddingY + row * stepY;
    const newId = 'file-new-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);

    let finalPath = iconData.path || '';
    if (isNative && iconData.type === 'folder' && !finalPath) {
      const deskPlace = this.explorerPlaces?.find(p => p.id === 'desktop');
      const deskDir = deskPlace?.path;
      if (deskDir) {
        try {
          const res = await createDir(deskDir, iconData.name);
          if (res && res.ok && res.path) finalPath = res.path;
        } catch {}
      }
    }

    this.themeEngine.addIconToFence(fenceId, {
      ...iconData,
      path: finalPath,
      id: newId,
      x: posX,
      y: posY
    });
    audioEngine.playStartup();
    this.renderFencesOnly();

    // Windows auto-focus & rename newly created file
    setTimeout(() => {
      const newEl = document.querySelector(`.fence-icon-item[data-icon-id="${newId}"]`);
      if (newEl) {
        document.querySelectorAll('.fence-icon-item.is-selected, .desktop-icon.is-selected').forEach(el => el.classList.remove('is-selected'));
        newEl.classList.add('is-selected');
        this.startInlineRename(newEl);
      }
    }, 50);
  }

  async addNewItemToDesktop(iconData, clientX = null, clientY = null) {
    const dRect = this.desktop.getBoundingClientRect();
    let dropX = 16;
    let dropY = 50;

    if (clientX != null && clientY != null) {
      const rawX = clientX - dRect.left - 34;
      const rawY = clientY - dRect.top - 40;
      const col = Math.max(0, Math.round((rawX - 16) / 78));
      const row = Math.max(0, Math.round((rawY - 50) / 88));
      dropX = 16 + col * 78;
      dropY = 50 + row * 88;
    } else {
      // Find empty slot on desktop grid
      const s = this.themeEngine.getState();
      const currentIcons = s.desktopIcons || [];
      const occupied = (c, r) => currentIcons.some(ic => {
        const icC = Math.round((ic.x - 16) / 78);
        const icR = Math.round((ic.y - 50) / 88);
        return icC === c && icR === r;
      });
      let found = false;
      for (let c = 0; c < 20 && !found; c++) {
        for (let r = 0; r < 12 && !found; r++) {
          if (!occupied(c, r)) {
            dropX = 16 + c * 78;
            dropY = 50 + r * 88;
            found = true;
          }
        }
      }
    }

    let finalPath = iconData.path || '';
    if (isNative && iconData.type === 'folder' && !finalPath) {
      const deskPlace = this.explorerPlaces?.find(p => p.id === 'desktop');
      const deskDir = deskPlace?.path;
      if (deskDir) {
        try {
          const res = await createDir(deskDir, iconData.name);
          if (res && res.ok && res.path) finalPath = res.path;
        } catch {}
      }
    }

    const uniqueId = 'desk-item-' + Date.now();
    this.themeEngine.addDesktopIcon({
      id: uniqueId,
      app: uniqueId,
      name: iconData.name,
      type: iconData.type || 'docs',
      icon: iconData.icon || 'doc',
      color: iconData.color || '#3b82f6',
      path: finalPath,
      x: dropX,
      y: dropY
    });
    audioEngine.playStartup();
    this.renderDesktopIconsOnly();

    setTimeout(() => {
      const newEl = document.querySelector(`.desktop-icon[data-icon-id="${uniqueId}"]`);
      if (newEl) {
        document.querySelectorAll('.desktop-icon.is-selected, .fence-icon-item.is-selected').forEach(el => el.classList.remove('is-selected'));
        newEl.classList.add('is-selected');
        this.startDesktopInlineRename(newEl);
      }
    }, 60);
  }

  bringWindowToFront(win) {
    this.windowZIndex = Math.max(this.windowZIndex || 50, 50) + 1;
    win.style.zIndex = this.windowZIndex;
  }

  bringFenceToFront(fenceEl) {
    this.fenceZIndex = (this.fenceZIndex || 8) + 1;
    if (this.fenceZIndex >= 19) this.fenceZIndex = 8;
    fenceEl.style.zIndex = this.fenceZIndex;
  }

  showDesktopToast(text) {
    let toast = document.getElementById('desktop-quick-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'desktop-quick-toast';
      toast.className = 'desktop-quick-toast';
      if (this.desktop) {
        this.desktop.appendChild(toast);
      } else {
        document.body.appendChild(toast);
      }
    }
    toast.textContent = text;
    toast.classList.add('toast-visible');
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('toast-visible');
    }, 2800);
  }

  syncMinimizedWindows() {
    const explorerWin = document.getElementById('sim-window-explorer');
    if (!explorerWin) return;
    const isMinimized = explorerWin.dataset.minimized === 'true' || explorerWin.style.display === 'none';
    const minTray = document.getElementById('dock-minimized-windows-container');
    const minSep = document.getElementById('dock-minimized-separator');

    if (isMinimized) {
      if (minSep) minSep.style.display = 'block';
      const tileId = 'dock-minimized-tile-' + explorerWin.id;
      if (minTray && !document.getElementById(tileId)) {
        const minTile = document.createElement('div');
        minTile.id = tileId;
        minTile.className = 'mac-dock-item dock-minimized-window-item';
        minTile.dataset.winId = explorerWin.id;
        minTile.title = 'TopApp Workspace — Explorador';
        minTile.innerHTML = `
          <div class="mini-window-preview">
            <div class="mini-win-titlebar">
              <span class="mini-win-dot dot-r"></span>
              <span class="mini-win-dot dot-y"></span>
              <span class="mini-win-dot dot-g"></span>
            </div>
            <div class="mini-win-body">
              <div class="mini-win-sidebar"></div>
              <div class="mini-win-files">
                <div class="mini-file-bar"></div>
                <div class="mini-file-bar bar-short"></div>
                <div class="mini-file-bar bar-medium"></div>
              </div>
            </div>
            <div class="mini-win-badge">${SVGS.folderSmall}</div>
            <button class="mini-win-close-btn" title="Cerrar ventana">✕</button>
          </div>
          <span class="dock-running-dot"></span>
          <div class="dock-hover-tooltip">Restaurar: TopApp Workspace — Explorador</div>
        `;
        minTray.appendChild(minTile);

        const miniCloseBtn = minTile.querySelector('.mini-win-close-btn');
        if (miniCloseBtn) {
          miniCloseBtn.onclick = (e) => {
            e.stopPropagation();
            audioEngine.playClick();
            minTile.remove();
            if (minTray.children.length === 0 && minSep) minSep.style.display = 'none';
            explorerWin.style.display = 'none';
            explorerWin.dataset.minimized = 'false';
            const pinnedDockApp = document.querySelector('.mac-dock-item[data-id="finder"]');
            if (pinnedDockApp) pinnedDockApp.classList.remove('dock-app-minimized');
            this.showDesktopToast('Ventana cerrada');
          };
        }
      }
    } else {
      const tileId = 'dock-minimized-tile-' + explorerWin.id;
      const minTile = document.getElementById(tileId);
      if (minTile) minTile.remove();
      if (minTray && minTray.children.length === 0 && minSep) minSep.style.display = 'none';
    }
  }

  minimizeWindow(win, dockAppId = 'finder') {
    if (!win) return;
    audioEngine.playClick();

    const minTray = document.getElementById('dock-minimized-windows-container');
    const minSep = document.getElementById('dock-minimized-separator');
    if (minSep) minSep.style.display = 'block';

    const tileId = 'dock-minimized-tile-' + (win.id || 'explorer');
    let minTile = document.getElementById(tileId);
    if (!minTile && minTray) {
      minTile = document.createElement('div');
      minTile.id = tileId;
      minTile.className = 'mac-dock-item dock-minimized-window-item';
      minTile.dataset.winId = win.id || 'sim-window-explorer';
      minTile.title = 'TopApp Workspace — Explorador';
      minTile.innerHTML = `
        <div class="mini-window-preview">
          <div class="mini-win-titlebar">
            <span class="mini-win-dot dot-r"></span>
            <span class="mini-win-dot dot-y"></span>
            <span class="mini-win-dot dot-g"></span>
          </div>
          <div class="mini-win-body">
            <div class="mini-win-sidebar"></div>
            <div class="mini-win-files">
              <div class="mini-file-bar"></div>
              <div class="mini-file-bar bar-short"></div>
              <div class="mini-file-bar bar-medium"></div>
            </div>
          </div>
          <div class="mini-win-badge">${SVGS.folderSmall}</div>
          <button class="mini-win-close-btn" title="Cerrar ventana">✕</button>
        </div>
        <span class="dock-running-dot"></span>
        <div class="dock-hover-tooltip">Restaurar: TopApp Workspace — Explorador</div>
      `;
      minTray.appendChild(minTile);

      const miniCloseBtn = minTile.querySelector('.mini-win-close-btn');
      if (miniCloseBtn) {
        miniCloseBtn.onclick = (e) => {
          e.stopPropagation();
          audioEngine.playClick();
          minTile.remove();
          if (minTray.children.length === 0 && minSep) minSep.style.display = 'none';
          win.style.display = 'none';
          win.dataset.minimized = 'false';
          const pinnedDockApp = document.querySelector(`.mac-dock-item[data-id="${dockAppId}"]`);
          if (pinnedDockApp) pinnedDockApp.classList.remove('dock-app-minimized');
          this.showDesktopToast('Ventana cerrada');
        };
      }
    }

    const pinnedDockApp = document.querySelector(`.mac-dock-item[data-id="${dockAppId}"]`);
    if (pinnedDockApp) {
      pinnedDockApp.classList.add('dock-app-minimized');
    }

    const targetEl = minTile || pinnedDockApp || document.getElementById('mac-dock-shelf');
    if (targetEl) {
      const wRect = win.getBoundingClientRect();
      const tRect = targetEl.getBoundingClientRect();
      const deltaX = (tRect.left + tRect.width / 2) - (wRect.left + wRect.width / 2);
      const deltaY = (tRect.top + tRect.height / 2) - (wRect.top + wRect.height / 2);

      win.style.transition = 'transform 0.34s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease, filter 0.3s ease';
      win.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.12)`;
      win.style.opacity = '0';
      win.style.filter = 'blur(4px)';
    } else {
      win.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      win.style.transform = 'scale(0.8)';
      win.style.opacity = '0';
    }

    setTimeout(() => {
      win.style.display = 'none';
      win.dataset.minimized = 'true';
      win.style.transform = '';
      win.style.opacity = '';
      win.style.filter = '';
      win.style.transition = '';
    }, 330);

    this.showDesktopToast(`🗂️ Ventana minimizada en la barra inferior (haz clic en su miniatura para restaurarla)`);
  }

  restoreWindow(win, dockAppId = 'finder') {
    if (!win) return;
    audioEngine.playStartup();

    const minTray = document.getElementById('dock-minimized-windows-container');
    const minSep = document.getElementById('dock-minimized-separator');
    const tileId = 'dock-minimized-tile-' + (win.id || 'explorer');
    const minTile = document.getElementById(tileId);

    const pinnedDockApp = document.querySelector(`.mac-dock-item[data-id="${dockAppId}"]`);
    if (pinnedDockApp) {
      pinnedDockApp.classList.remove('dock-app-minimized');
    }

    const targetEl = minTile || pinnedDockApp || document.getElementById('mac-dock-shelf');

    win.style.display = 'flex';
    win.dataset.minimized = 'false';
    this.bringWindowToFront(win);

    if (targetEl) {
      const wRect = win.getBoundingClientRect();
      const tRect = targetEl.getBoundingClientRect();
      const deltaX = (tRect.left + tRect.width / 2) - (wRect.left + wRect.width / 2);
      const deltaY = (tRect.top + tRect.height / 2) - (wRect.top + wRect.height / 2);

      win.style.transition = 'none';
      win.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.15)`;
      win.style.opacity = '0.3';
      win.style.filter = 'blur(4px)';

      void win.offsetWidth; // Force reflow

      win.style.transition = 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease, filter 0.28s ease';
      win.style.transform = 'translate(0px, 0px) scale(1)';
      win.style.opacity = '1';
      win.style.filter = 'none';

      setTimeout(() => {
        win.style.transition = '';
        win.style.transform = '';
        win.style.opacity = '';
        win.style.filter = '';
      }, 340);
    }

    if (minTile) {
      minTile.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
      minTile.style.transform = 'scale(0.3)';
      minTile.style.opacity = '0';
      setTimeout(() => {
        minTile.remove();
        if (minTray && minTray.children.length === 0 && minSep) {
          minSep.style.display = 'none';
        }
      }, 220);
    }

    this.showDesktopToast(`📂 Ventana de Explorador restaurada al escritorio`);
  }

  getDesktopIconVisual(icon) {
    if (icon.customIcon) {
      return `<img src="${icon.customIcon}" alt="${this.escapeHtml(icon.name)}" style="width: 72%; height: 72%; object-fit: contain; border-radius: 4px;" />`;
    }
    if (icon.thumbnail) {
      const ext = (icon.name && icon.name.includes('.')) ? icon.name.split('.').pop().toUpperCase() : 'IMG';
      return `
      <div class="thumb-container">
        <img src="${icon.thumbnail}" alt="${this.escapeHtml(icon.name)}" class="thumb-real-img" />
        <span class="thumb-tag" style="color:#fb923c;">${ext}</span>
      </div>`;
    }
    const isFolder = icon.type === 'folder' || icon.icon === 'folder' || icon.app === 'explorer' || (!icon.name?.includes('.') && icon.type !== 'app' && !icon.exe);
    if (isFolder) {
      return `<span class="icon-svg-wrap" style="color: #06b6d4;">${SVGS.folder}</span>`;
    }
    const isApp = icon.type === 'app' || icon.exe || icon.app?.startsWith('dock-') || icon.app?.startsWith('desk-dock-') || ((icon.name || '').toLowerCase().includes('corel')) || (icon.app && !['thispc', 'explorer', 'terminal', 'theme-settings', 'generic'].includes(icon.app));
    if (isApp) {
      return `<span class="icon-svg-wrap">${this.getDesktopIconSvg(icon)}</span>`;
    }
    const tType = this.detectThumbnailType ? this.detectThumbnailType(icon.name, icon.type) : 'generic';
    if (tType && tType !== 'generic' && !['thispc', 'explorer', 'terminal', 'theme-settings', 'folder'].includes(icon.app)) {
      return this.renderFenceThumbnail(icon, 38);
    }
    return `<span class="icon-svg-wrap">${this.getDesktopIconSvg(icon)}</span>`;
  }

  getDesktopIconSvg(icon) {
    if (icon.customIcon) {
      return `<img src="${icon.customIcon}" alt="${this.escapeHtml(icon.name)}" style="width: 72%; height: 72%; object-fit: contain; border-radius: 4px;" />`;
    }
    const n = (icon.name || '').toLowerCase();
    const glyph = (icon.icon || icon.app || '').toLowerCase();
    if (n.includes('corel') || glyph === 'corel' || glyph === 'coreldraw') {
      return this.renderAppIconGlyph('corel', icon.customIcon);
    }
    if (n.includes('photoshop') || glyph === 'photoshop') {
      return this.renderAppIconGlyph('photoshop', icon.customIcon);
    }
    if (glyph && ['photoshop', 'chrome', 'steam', 'spotify', 'blender', 'discord', 'figma', 'premiere', 'illustrator', 'obs', 'notion', 'code', 'safari', 'photos', 'settings', 'finder', 'trash', 'terminal', 'corel', 'coreldraw'].includes(glyph)) {
      return this.renderAppIconGlyph(glyph, icon.customIcon);
    }
    if (icon.app === 'create-group' || icon.id === 'd-group' || icon.type === 'fence') {
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke-dasharray="3 2"></rect>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>`;
    }
    if (icon.app === 'thispc' || icon.type === 'disk') return SVGS.macHD;
    if (icon.app === 'explorer' || icon.type === 'folder') return SVGS.folder;
    if (icon.app === 'terminal' || icon.type === 'terminal') return SVGS.terminal;
    if (icon.app === 'theme-settings' || icon.type === 'palette') return SVGS.palette;
    if (icon.type === 'video') return '▶';
    return SVGS.doc;
  }

  getDesktopIconGradientClass(icon) {
    if (icon.app === 'create-group' || icon.id === 'd-group' || icon.type === 'fence') return 'bg-gradient-cyan';
    if (icon.app === 'thispc' || icon.color === '#3b82f6') return 'bg-gradient-blue';
    if (icon.app === 'explorer' || icon.color === '#06b6d4') return 'bg-gradient-cyan';
    if (icon.app === 'terminal' || icon.color === '#0f172a') return 'bg-gradient-dark';
    if (icon.app === 'theme-settings' || icon.color === '#ea580c') return 'bg-gradient-coral';
    return '';
  }

  getDesktopIconStyle(icon) {
    const glyph = icon.icon || icon.app;
    if (glyph && ['photoshop', 'chrome', 'steam', 'spotify', 'blender', 'discord', 'figma', 'premiere', 'illustrator', 'obs', 'notion', 'code', 'safari', 'photos', 'settings', 'finder', 'trash', 'terminal'].includes(glyph)) {
      return `background: ${this.getAppGradient(glyph, icon.color)};`;
    }
    if (icon.color) {
      return `background: linear-gradient(135deg, ${icon.color} 0%, rgba(15,23,42,0.85) 100%);`;
    }
    return '';
  }

  initDraggableWindows() {
    const win = document.getElementById('sim-window-explorer');
    const titlebar = document.getElementById('explorer-titlebar');
    const resizeHandle = document.getElementById('explorer-resize-handle');
    const resizeE = document.getElementById('explorer-resize-e');
    const resizeS = document.getElementById('explorer-resize-s');
    const maximizeBtn = document.getElementById('explorer-maximize');
    const minimizeBtn = document.getElementById('explorer-minimize');
    const closeBtn = document.getElementById('explorer-close');
    if (!win || !titlebar) return;

    let isDragging = false;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.traffic-light')) return;
      if (win.classList.contains('window-maximized')) return;
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      this.bringWindowToFront(win);
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = win.offsetLeft;
      initialTop = win.offsetTop;
      win.classList.add('is-dragging');
      document.body.classList.add('is-window-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.left = `${Math.max(0, initialLeft + dx)}px`;
      win.style.top = `${Math.max(0, initialTop + dy)}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        win.classList.remove('is-dragging');
        document.body.classList.remove('is-window-dragging');
      }
    });

    win.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.bringWindowToFront(win);
    });

    // Close button
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        win.style.display = 'none';
        win.dataset.minimized = 'false';
        const dockItem = document.querySelector('.mac-dock-item[data-id="finder"]');
        if (dockItem) dockItem.classList.remove('dock-app-minimized');
      };
    }

    // Minimize button
    if (minimizeBtn) {
      minimizeBtn.onclick = (e) => {
        e.stopPropagation();
        this.minimizeWindow(win, 'finder');
      };
    }

    // Maximize toggle
    let isMaximized = false;
    let normalBounds = null;

    const toggleMaximize = () => {
      audioEngine.playClick();
      if (!isMaximized) {
        normalBounds = {
          left: win.style.left,
          top: win.style.top,
          width: win.style.width,
          height: win.style.height
        };
        win.classList.add('window-maximized');
        win.style.left = '6px';
        win.style.top = '6px';
        win.style.width = 'calc(100% - 12px)';
        win.style.height = 'calc(100% - 50px)';
        isMaximized = true;
      } else {
        win.classList.remove('window-maximized');
        if (normalBounds) {
          win.style.left = normalBounds.left;
          win.style.top = normalBounds.top;
          win.style.width = normalBounds.width;
          win.style.height = normalBounds.height;
        }
        isMaximized = false;
      }
    };

    if (maximizeBtn) {
      maximizeBtn.onclick = (e) => {
        e.stopPropagation();
        toggleMaximize();
      };
    }

    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.traffic-light')) return;
      toggleMaximize();
    });

    // Edge & Corner Resizing (Ajuste libre de tamaño en ancho y alto)
    const attachResize = (handleEl, allowW, allowH) => {
      if (!handleEl) return;
      handleEl.addEventListener('mousedown', (e) => {
        if (win.classList.contains('window-maximized')) return;
        e.preventDefault();
        e.stopPropagation();
        this.bringWindowToFront(win);
        win.classList.add('is-resizing');
        document.body.classList.add('is-window-dragging');

        const sX = e.clientX;
        const sY = e.clientY;
        const sW = win.offsetWidth;
        const sH = win.offsetHeight;
        const containerW = this.desktop ? this.desktop.clientWidth : window.innerWidth;
        const containerH = this.desktop ? this.desktop.clientHeight : window.innerHeight;

        const onResizeMove = (moveEvt) => {
          if (allowW) {
            const maxW = Math.max(300, containerW - win.offsetLeft - 8);
            const newW = Math.max(300, Math.min(maxW, sW + (moveEvt.clientX - sX)));
            win.style.width = `${newW}px`;
          }
          if (allowH) {
            const maxH = Math.max(200, containerH - win.offsetTop - 50);
            const newH = Math.max(200, Math.min(maxH, sH + (moveEvt.clientY - sY)));
            win.style.height = `${newH}px`;
          }
        };

        const onResizeUp = () => {
          window.removeEventListener('mousemove', onResizeMove);
          window.removeEventListener('mouseup', onResizeUp);
          win.classList.remove('is-resizing');
          document.body.classList.remove('is-window-dragging');
        };

        window.addEventListener('mousemove', onResizeMove);
        window.addEventListener('mouseup', onResizeUp);
      });
    };

    attachResize(resizeHandle, true, true);
    attachResize(resizeE, true, false);
    attachResize(resizeS, false, true);
  }

  renderDesktopIconsOnly() {
    const container = document.getElementById('desktop-icons-container');
    if (!container) return;
    const s = this.themeEngine.getState();
    container.innerHTML = (s.desktopIcons || []).map(icon => {
      const isLnk = icon.isShortcut || (icon.name && icon.name.toLowerCase().endsWith('.lnk')) || (icon.path && icon.path.toLowerCase().endsWith('.lnk'));
      const cleanName = (icon.name || '').replace(/\.lnk$/i, '');
      const shortcutBadge = isLnk ? '<span class="win-shortcut-arrow-badge"></span>' : '';
      const tType = this.detectThumbnailType ? this.detectThumbnailType(icon.name, icon.type) : 'generic';
      const hasThumb = !!(icon.thumbnail || (tType !== 'generic' && !['thispc', 'explorer', 'terminal', 'theme-settings'].includes(icon.app)));
      const customStyle = this.getDesktopIconStyle(icon);
      return `
      <div class="desktop-icon" style="left: ${icon.x}px; top: ${icon.y}px; position: absolute;" data-app="${icon.app || icon.id}" data-icon-id="${icon.id}" data-icon-name="${this.escapeHtml(cleanName)}" data-icon-type="${icon.type}" data-icon-color="${icon.color}" data-path="${this.escapeHtml(icon.path || '')}" data-thumbnail="${this.escapeHtml(icon.thumbnail || '')}" tabindex="0">
        <div class="mac-squircle-icon ${this.getDesktopIconGradientClass(icon)} ${hasThumb ? 'has-thumbnail' : ''}" style="${customStyle}">
          ${this.getDesktopIconVisual(icon)}
          ${shortcutBadge}
        </div>
        <span class="icon-label">${this.escapeHtml(cleanName)}</span>
      </div>
      `;
    }).join('');
    this.bindDesktopIconInteractions();
  }

  bindDesktopIconInteractions() {
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      // 1. Smooth Direct Mouse Drag & Snap to Grid
      icon.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('button') || e.target.closest('input')) return;
        e.stopPropagation();

        const wasSelected = icon.classList.contains('is-selected');
        const clickedLabel = !!e.target.closest('.icon-label');
        const clickedSquircle = !!e.target.closest('.mac-squircle-icon');

        let selectedIcons = Array.from(document.querySelectorAll('.desktop-icon.is-selected'));
        if (!wasSelected) {
          if (!e.ctrlKey && !e.shiftKey) {
            document.querySelectorAll('.desktop-icon.is-selected, .fence-icon-item.is-selected').forEach(el => el.classList.remove('is-selected'));
          }
          icon.classList.add('is-selected');
          selectedIcons = Array.from(document.querySelectorAll('.desktop-icon.is-selected'));
        }

        const startX = e.clientX;
        const startY = e.clientY;
        const initialPositions = selectedIcons.map(el => ({
          el,
          id: el.dataset.iconId,
          startLeft: el.offsetLeft,
          startTop: el.offsetTop
        }));

        let hasMoved = false;

        const onMouseMove = (moveEvt) => {
          const dx = moveEvt.clientX - startX;
          const dy = moveEvt.clientY - startY;

          if (!hasMoved && Math.hypot(dx, dy) > 4) {
            hasMoved = true;
            document.body.classList.add('is-icon-dragging');
            selectedIcons.forEach(el => el.classList.add('is-dragging'));
          }

          if (hasMoved) {
            initialPositions.forEach(item => {
              item.el.style.left = `${item.startLeft + dx}px`;
              item.el.style.top = `${item.startTop + dy}px`;
            });
          }
        };

        const onMouseUp = (upEvt) => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);

          if (hasMoved) {
            // DRAG ACTION
            document.body.classList.remove('is-icon-dragging');
            selectedIcons.forEach(el => el.classList.remove('is-dragging'));
            audioEngine.playClick();

            // Check if dropped directly into a Cajón (desktop fence)
            const elemBelow = document.elementFromPoint(upEvt.clientX, upEvt.clientY);
            const targetFenceEl = elemBelow ? elemBelow.closest('.desktop-fence') : null;

            if (targetFenceEl) {
              const targetFenceId = targetFenceEl.dataset.fenceId;
              const fence = (this.themeEngine.getState().desktopFences || []).find(f => f.id === targetFenceId);
              const { itemW, itemH, stepX, stepY, paddingX, paddingY } = this.getFenceGridMetrics(fence);
              const bodyEl = targetFenceEl.querySelector('.fence-body');
              const bodyRect = bodyEl ? bodyEl.getBoundingClientRect() : targetFenceEl.getBoundingClientRect();
              const scrollLeft = bodyEl ? bodyEl.scrollLeft : 0;
              const scrollTop = bodyEl ? bodyEl.scrollTop : 0;

              const rawFx = upEvt.clientX - bodyRect.left + scrollLeft - itemW / 2;
              const rawFy = upEvt.clientY - bodyRect.top + scrollTop - itemH / 2;
              let fCol = Math.max(0, Math.round((rawFx - paddingX) / stepX));
              let fRow = Math.max(0, Math.round((rawFy - paddingY) / stepY));

              const allDesk = this.themeEngine.getState().desktopIcons || [];
              initialPositions.forEach((pos, idx) => {
                const icObj = allDesk.find(i => i.id === pos.id);
                const iconData = {
                  id: pos.id,
                  name: pos.el.dataset.iconName || icObj?.name || 'Acceso',
                  type: icObj?.type || pos.el.dataset.iconType || 'file',
                  icon: icObj?.icon || pos.el.dataset.iconType || 'file',
                  color: icObj?.color || pos.el.dataset.iconColor || '#0284c7',
                  thumbnail: icObj?.thumbnail || pos.el.dataset.thumbnail || null,
                  customIcon: icObj?.customIcon || null,
                  exe: icObj?.exe || '',
                  path: icObj?.path || pos.el.dataset.path || '',
                  app: icObj?.app || pos.el.dataset.app || '',
                  x: paddingX + (fCol + idx) * stepX,
                  y: paddingY + fRow * stepY
                };
                this.themeEngine.removeDesktopIcon(pos.id);
                this.themeEngine.addIconToFence(targetFenceId, iconData);
              });

              audioEngine.playStartup();
              this.renderDesktopIconsOnly();
              this.renderFencesOnly();
              return;
            }

            // Snap to Desktop grid (78px col, 88px row, 16px/50px margins)
            initialPositions.forEach(pos => {
              const curL = pos.el.offsetLeft;
              const curT = pos.el.offsetTop;
              const col = Math.max(0, Math.round((curL - 16) / 78));
              const row = Math.max(0, Math.round((curT - 50) / 88));
              const snapX = 16 + col * 78;
              const snapY = 50 + row * 88;
              this.themeEngine.updateDesktopIcon(pos.id, { x: snapX, y: snapY });
            });

            this.renderDesktopIconsOnly();
          } else {
            // CLICK AND RELEASE ACTION ("si hago click y suelto se abre")
            if (e.ctrlKey || e.metaKey) {
              icon.classList.toggle('is-selected');
              audioEngine.playClick();
              return;
            }

            // A. Slow double-click specifically on label of ALREADY selected icon: initiate inline rename like Windows
            if (wasSelected && clickedLabel) {
              this.startDesktopInlineRename(icon);
              return;
            }

            // B. Click and release on icon/squircle: opens the app/window directly!
            if (clickedSquircle) {
              document.querySelectorAll('.desktop-icon.is-selected, .fence-icon-item.is-selected').forEach(el => {
                if (el !== icon) el.classList.remove('is-selected');
              });
              icon.classList.add('is-selected');
              this.openIconItem(icon, 'desktop');
              return;
            }

            // C. First click on label: select only this item (readies for slow-click rename)
            document.querySelectorAll('.desktop-icon.is-selected, .fence-icon-item.is-selected').forEach(el => {
              if (el !== icon) el.classList.remove('is-selected');
            });
            icon.classList.add('is-selected');
            audioEngine.playClick();
          }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      // 2. HTML5 Drag Start for Native Compatibility
      icon.ondragstart = (e) => {
        const isSelected = icon.classList.contains('is-selected');
        let selectedIcons = Array.from(document.querySelectorAll('.desktop-icon.is-selected'));
        if (!isSelected || !selectedIcons.length) {
          document.querySelectorAll('.desktop-icon.is-selected').forEach(el => el.classList.remove('is-selected'));
          icon.classList.add('is-selected');
          selectedIcons = [icon];
        }

        const allDesktopIcons = this.themeEngine.getState().desktopIcons || [];
        if (selectedIcons.length > 1) {
          const itemsData = selectedIcons.map(el => {
            const icObj = allDesktopIcons.find(i => i.id === el.dataset.iconId);
            return {
              id: el.dataset.iconId,
              app: el.dataset.app,
              name: el.dataset.iconName,
              type: icObj?.type || el.dataset.iconType,
              color: icObj?.color || el.dataset.iconColor,
              thumbnail: (icObj && icObj.thumbnail) ? icObj.thumbnail : (el.dataset.thumbnail || null),
              customIcon: (icObj && icObj.customIcon) ? icObj.customIcon : null,
              exe: (icObj && icObj.exe) ? icObj.exe : '',
              path: (icObj && icObj.path) ? icObj.path : (el.dataset.path || ''),
              x: el.offsetLeft,
              y: el.offsetTop
            };
          });

          const multiData = {
            isMulti: true,
            primaryId: icon.dataset.iconId,
            primaryX: icon.offsetLeft,
            primaryY: icon.offsetTop,
            source: 'desktop',
            items: itemsData
          };

          e.dataTransfer.setData('application/json', JSON.stringify(multiData));
          e.dataTransfer.effectAllowed = 'move';
          selectedIcons.forEach(el => { el.style.opacity = '0.4'; });
        } else {
          const icObj = allDesktopIcons.find(i => i.id === icon.dataset.iconId);
          const iconData = {
            id: icon.dataset.iconId,
            app: icon.dataset.app,
            name: icon.dataset.iconName,
            type: icObj?.type || icon.dataset.iconType,
            color: icObj?.color || icon.dataset.iconColor,
            thumbnail: (icObj && icObj.thumbnail) ? icObj.thumbnail : (icon.dataset.thumbnail || null),
            customIcon: (icObj && icObj.customIcon) ? icObj.customIcon : null,
            exe: (icObj && icObj.exe) ? icObj.exe : '',
            path: (icObj && icObj.path) ? icObj.path : (icon.dataset.path || ''),
            x: icon.offsetLeft,
            y: icon.offsetTop,
            source: 'desktop'
          };
          e.dataTransfer.setData('application/json', JSON.stringify(iconData));
          e.dataTransfer.effectAllowed = 'move';
          icon.style.opacity = '0.4';
        }
      };

      icon.ondragend = () => {
        document.querySelectorAll('.desktop-icon').forEach(el => { el.style.opacity = '1'; });
      };

      // 3. Double-click always opens immediately
      icon.ondblclick = (e) => {
        if (e.target.closest('.desktop-rename-input')) return;
        e.stopPropagation();
        this.openIconItem(icon, 'desktop');
      };
    });
  }

  bindDesktopMarquee() {
    if (!this.desktop || this._desktopMarqueeBound) return;
    this._desktopMarqueeBound = true;

    this.desktop.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (document.body.classList.contains('is-window-dragging') || document.body.classList.contains('is-icon-dragging')) return;
      if (e.target.closest('.desktop-fence') || e.target.closest('.fluent-window') || e.target.closest('.tochka-dashboard') || e.target.closest('.tochka-sidebar') || e.target.closest('.mac-dock-container') || e.target.closest('.fluent-context-menu') || e.target.closest('.desktop-icon') || e.target.closest('button') || e.target.closest('input')) {
        return;
      }

      const dRect = this.desktop.getBoundingClientRect();
      const originClientX = e.clientX;
      const originClientY = e.clientY;
      const startX = e.clientX - dRect.left;
      const startY = e.clientY - dRect.top;

      const initialSelectedIds = new Set();
      if (!e.ctrlKey && !e.shiftKey) {
        document.querySelectorAll('.desktop-icon.is-selected, .fence-icon-item.is-selected').forEach(el => el.classList.remove('is-selected'));
      } else {
        document.querySelectorAll('.desktop-icon.is-selected').forEach(el => initialSelectedIds.add(el.dataset.iconId));
      }

      let selBox = null;
      let hasMoved = false;

      const onMouseMove = (moveEvt) => {
        if (document.body.classList.contains('is-window-dragging') || document.body.classList.contains('is-icon-dragging') || document.querySelector('.fluent-window.is-dragging') || document.querySelector('.desktop-fence.is-dragging') || document.querySelector('.is-resizing')) {
          onMouseUp();
          return;
        }

        const dist = Math.hypot(moveEvt.clientX - originClientX, moveEvt.clientY - originClientY);
        if (!hasMoved && dist > 5) {
          hasMoved = true;
          selBox = document.createElement('div');
          selBox.className = 'desktop-selection-box';
          this.desktop.appendChild(selBox);
        }

        if (hasMoved && selBox) {
          const curX = moveEvt.clientX - dRect.left;
          const curY = moveEvt.clientY - dRect.top;

          const boxLeft = Math.min(startX, curX);
          const boxTop = Math.min(startY, curY);
          const boxWidth = Math.abs(curX - startX);
          const boxHeight = Math.abs(curY - startY);

          selBox.style.left = `${boxLeft}px`;
          selBox.style.top = `${boxTop}px`;
          selBox.style.width = `${boxWidth}px`;
          selBox.style.height = `${boxHeight}px`;

          document.querySelectorAll('.desktop-icon').forEach(icon => {
            const iL = icon.offsetLeft;
            const iT = icon.offsetTop;
            const iW = icon.offsetWidth;
            const iH = icon.offsetHeight;

            const intersects = (
              boxLeft < iL + iW &&
              boxLeft + boxWidth > iL &&
              boxTop < iT + iH &&
              boxTop + boxHeight > iT
            );

            if (intersects) {
              icon.classList.add('is-selected');
            } else if (!initialSelectedIds.has(icon.dataset.iconId)) {
              icon.classList.remove('is-selected');
            }
          });
        }
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        if (selBox && selBox.parentNode) {
          selBox.remove();
          selBox = null;
        }
        if (hasMoved) {
          audioEngine.playClick();
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  bindDesktopDrop() {
    if (!this.desktop || this._desktopDropBound) return;
    this._desktopDropBound = true;

    this.desktop.addEventListener('dragover', (e) => {
      if (e.target.closest('.desktop-fence') || e.target.closest('.fluent-window')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    this.desktop.addEventListener('drop', async (e) => {
      if (e.target.closest('.desktop-fence') || e.target.closest('.fluent-window')) return;
      e.preventDefault();

      try {
        const dRect = this.desktop.getBoundingClientRect();
        const rawX = e.clientX - dRect.left - 34;
        const rawY = e.clientY - dRect.top - 40;

        const col = Math.max(0, Math.round((rawX - 16) / 78));
        const row = Math.max(0, Math.round((rawY - 50) / 88));

        const dropX = 16 + col * 78;
        const dropY = 50 + row * 88;

        // Support real files dropped from Windows OS directly onto the desktop
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          audioEngine.playStartup();
          for (let fIdx = 0; fIdx < e.dataTransfer.files.length; fIdx++) {
            const file = e.dataTransfer.files[fIdx];
            const fileName = file.name;
            const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
            const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp', 'avif'].includes(ext);
            let thumbnail = null;
            if (isImage) {
              try {
                thumbnail = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (re) => resolve(re.target.result);
                  reader.onerror = () => resolve(null);
                  reader.readAsDataURL(file);
                });
              } catch (err) {}
            }
            const realPath = getFilePath(file);
            const uniqueId = 'desk-file-' + Date.now() + '-' + fIdx;
            this.themeEngine.addDesktopIcon({
              id: uniqueId,
              app: uniqueId,
              name: fileName,
              type: isImage ? 'images' : 'doc',
              color: isImage ? '#fb923c' : '#38bdf8',
              thumbnail: thumbnail,
              path: realPath || file.path || '',
              x: dropX + fIdx * 20,
              y: dropY + fIdx * 20
            });
          }
          this.renderDesktopIconsOnly();
          return;
        }

        const raw = e.dataTransfer.getData('application/json');
        if (!raw) return;
        const data = JSON.parse(raw);

        if (data.isMulti && data.items && data.items.length > 1) {
          audioEngine.playClick();
          const prim = data.items.find(i => i.id === data.primaryId) || data.items[0];
          const primCol = Math.round((prim.x - 16) / 78);
          const primRow = Math.round((prim.y - 50) / 88);

          data.items.forEach(it => {
            const dCol = Math.round((it.x - 16) / 78) - primCol;
            const dRow = Math.round((it.y - 50) / 88) - primRow;
            const itX = Math.max(16, 16 + (col + dCol) * 78);
            const itY = Math.max(50, 50 + (row + dRow) * 88);

            if (data.source === 'desktop') {
              this.themeEngine.updateDesktopIcon(it.id, { x: itX, y: itY });
            } else if (data.source === 'fence') {
              this.themeEngine.removeIconFromFence(data.fromFenceId, it.id);
              this.themeEngine.addDesktopIcon({
                id: it.id,
                app: it.id,
                name: it.name,
                type: it.type,
                color: it.color,
                thumbnail: it.thumbnail || null,
                path: it.path || '',
                x: itX,
                y: itY
              });
            }
          });

          this.renderDesktopIconsOnly();
          if (data.source === 'fence') this.renderFencesOnly();
          return;
        }

        if (data.source === 'desktop') {
          audioEngine.playClick();
          this.themeEngine.updateDesktopIcon(data.id, { x: dropX, y: dropY });
          this.renderDesktopIconsOnly();
        } else if (data.source === 'fence') {
          audioEngine.playStartup();
          this.themeEngine.removeIconFromFence(data.fromFenceId, data.id);
          this.themeEngine.addDesktopIcon({
            id: data.id,
            app: data.id,
            name: data.name,
            type: data.type,
            color: data.color,
            thumbnail: data.thumbnail || null,
            path: data.path || '',
            x: dropX,
            y: dropY
          });
          this.renderDesktopIconsOnly();
          this.renderFencesOnly();
        } else if (data.source === 'dock') {
          audioEngine.playStartup();
          const uniqueId = 'desk-dock-' + Date.now();
          this.themeEngine.addDesktopIcon({
            id: uniqueId,
            app: data.id || uniqueId,
            name: data.name,
            type: data.type || 'app',
            icon: data.icon || data.id,
            color: data.color || '#3b82f6',
            customIcon: data.customIcon || null,
            exe: data.exe || '',
            path: data.path || '',
            x: dropX,
            y: dropY
          });
          this.renderDesktopIconsOnly();
        } else if (data.source === 'explorer') {
          audioEngine.playStartup();
          const uniqueId = 'desk-exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
          const isDir = data.isDirectory || data.type === 'folder';
          const isImg = data.type === 'images' || /\.(png|jpe?g|webp|gif|bmp|ico|svg)$/i.test(data.name || '');
          this.themeEngine.addDesktopIcon({
            id: uniqueId,
            app: isDir ? 'explorer' : uniqueId,
            name: data.name,
            type: isDir ? 'folder' : (isImg ? 'images' : (data.type || 'file')),
            color: isDir ? '#06b6d4' : (isImg ? '#ff7043' : '#3b82f6'),
            thumbnail: isImg && data.path ? `/local-file/${encodeURIComponent(data.path)}` : null,
            customIcon: data.customIcon || null,
            isShortcut: !!data.isShortcut,
            path: data.path || '',
            x: dropX,
            y: dropY
          });
          this.renderDesktopIconsOnly();
        }
      } catch (err) {
        console.error('Desktop drop error', err);
      }
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  renderFenceIconSvg(type) {
    switch (type) {
      case 'doc':
      case 'docs':
      case 'pdf':
        return SVGS.doc;
      case 'image':
      case 'images':
        return SVGS.image;
      case 'code':
        return SVGS.code;
      case 'audio':
        return SVGS.audio;
      case 'terminal':
        return SVGS.terminal;
      case 'palette':
        return SVGS.palette;
      case 'folder':
        return SVGS.folderSmall;
      case 'disk':
        return SVGS.disk;
      default:
        return SVGS.star;
    }
  }

  getFenceIconGradient(type, color) {
    if (color && (color.startsWith('linear-gradient') || color.startsWith('#'))) {
      if (color.startsWith('#')) {
        return `linear-gradient(135deg, ${color} 0%, #0f172a 100%)`;
      }
      return color;
    }
    switch (type) {
      case 'docs':
      case 'doc':
      case 'pdf':
        return 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
      case 'images':
      case 'image':
        return 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
      case 'code':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'audio':
        return 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';
      case 'terminal':
        return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
      case 'folder':
        return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
      default:
        return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    }
  }

  detectThumbnailType(name, type) {
    if (!name && !type) return 'generic';
    const n = (name || '').toLowerCase();
    const t = (type || '').toLowerCase();
    const ext = n.includes('.') ? n.split('.').pop() : '';

    if (t === 'folder' || t === 'fence' || ext === 'zip' || ext === 'rar' || n.includes('carpeta') || n.includes('folder') || n.includes('proyectos')) {
      return 'folder';
    }
    // Any item without dot extension that is not an app is a folder
    if (!n.includes('.') && t !== 'app' && !n.endsWith('.exe')) {
      return 'folder';
    }

    if (n.includes('photoshop') || ext === 'psd' || ext === 'psb') return 'photoshop';
    if (n.includes('corel') || ext === 'cdr') return 'coreldraw';
    if (n.includes('illustrator') || ext === 'ai') return 'illustrator';
    if (n.includes('sketchup') || ext === 'skp' || n.includes('.skp') || n.includes('modelo 3d')) return 'sketchup';
    if (n.includes('autocad') || n.includes('cad') || ext === 'dwg' || ext === 'dxf') return 'autocad';
    if (ext === 'pdf' || t === 'pdf' || n.includes('.pdf') || (t === 'docs' && n.includes('informe')) || (t === 'docs' && n.includes('documento'))) return 'pdf';
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv' || n.includes('excel') || n.includes('finanzas')) return 'excel';
    if (ext === 'docx' || ext === 'doc' || ext === 'rtf' || n.includes('word') || n.includes('contrato')) return 'word';
    if (ext === 'pptx' || ext === 'ppt' || n.includes('powerpoint') || n.includes('presentac')) return 'powerpoint';
    if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'ico', 'tiff'].includes(ext) ||
        t === 'images' || t === 'image' || n.includes('wallpaper') || n.includes('foto') || n.includes('diseño') || n.includes('imagen')) {
      return 'image';
    }
    if (['ts', 'js', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'scss', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'sh', 'ps1'].includes(ext) ||
        t === 'code' || n.includes('arquitect') || n.includes('script') || n.includes('code')) {
      return 'code';
    }
    if (['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'wma'].includes(ext) ||
        t === 'audio' || n.includes('audio') || n.includes('chime') || n.includes('sonido') || n.includes('cancion') || n.includes('musica')) {
      return 'audio';
    }
    if (['mp4', 'mkv', 'avi', 'mov', 'wmv', 'webm'].includes(ext) ||
        t === 'video' || n.includes('video') || n.includes('pelicula') || n.includes('clip')) {
      return 'video';
    }
    if (t === 'docs' || t === 'doc') return 'doc';
    return 'generic';
  }

  renderFenceThumbnail(icon, size) {
    if (icon.customIcon) {
      return `
      <div class="thumb-container" style="background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center;">
        <img src="${icon.customIcon}" alt="${this.escapeHtml(icon.name)}" style="width: 78%; height: 78%; object-fit: contain;" />
      </div>`;
    }

    if (icon.thumbnail) {
      const ext = (icon.name && icon.name.includes('.')) ? icon.name.split('.').pop().toUpperCase() : 'IMG';
      return `
      <div class="thumb-container">
        <img src="${icon.thumbnail}" alt="${this.escapeHtml(icon.name)}" class="thumb-real-img" />
        <span class="thumb-tag" style="color:#fb923c;">${ext}</span>
      </div>`;
    }

    const isFolder = icon.type === 'folder' || icon.icon === 'folder' || (!icon.name?.includes('.') && icon.type !== 'app' && !icon.exe);
    if (isFolder) {
      return `
      <div class="thumb-container">
        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); border: 1px solid #06b6d4; border-radius: inherit; display: flex; align-items: center; justify-content: center;">
          ${SVGS.folderSmall}
        </div>
        <span class="thumb-tag" style="color:#06b6d4;">DIR</span>
      </div>`;
    }

    const thumbType = this.detectThumbnailType(icon.name, icon.type);

    switch (thumbType) {
      case 'photoshop':
        return `
        <div class="thumb-container">
          <div class="thumb-photoshop" title="Proyecto Adobe Photoshop">
            <div class="thumb-ps-art">
              <div class="thumb-ps-gradient-layer"></div>
              <div class="thumb-ps-orb"></div>
              <div class="thumb-ps-lines"></div>
            </div>
          </div>
          <span class="thumb-tag" style="color:#31a8ff;">PSD</span>
        </div>`;

      case 'coreldraw':
        return `
        <div class="thumb-container">
          <div class="thumb-coreldraw" title="Ilustración Vectorial CorelDRAW">
            <svg viewBox="0 0 44 44" class="thumb-cdr-art">
              <defs>
                <linearGradient id="cdr-bg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#022c22"/>
                  <stop offset="100%" stop-color="#064e3b"/>
                </linearGradient>
                <linearGradient id="cdr-curve-g" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#10b981"/>
                  <stop offset="50%" stop-color="#38bdf8"/>
                  <stop offset="100%" stop-color="#f59e0b"/>
                </linearGradient>
              </defs>
              <rect width="44" height="44" fill="url(#cdr-bg)"/>
              <path d="M4 36 C14 10, 26 12, 40 22" stroke="url(#cdr-curve-g)" stroke-width="2.4" fill="none" stroke-linecap="round"/>
              <path d="M6 18 C18 38, 30 36, 38 8" stroke="#34d399" stroke-width="1.4" stroke-dasharray="2 1" fill="none"/>
              <polygon points="22,12 30,26 14,26" fill="rgba(16, 185, 129, 0.4)" stroke="#34d399" stroke-width="0.8"/>
              <rect x="21" y="11" width="2.5" height="2.5" fill="#ffffff" stroke="#000" stroke-width="0.5"/>
              <rect x="29" y="25" width="2.5" height="2.5" fill="#ffffff" stroke="#000" stroke-width="0.5"/>
              <rect x="13" y="25" width="2.5" height="2.5" fill="#ffffff" stroke="#000" stroke-width="0.5"/>
            </svg>
          </div>
          <span class="thumb-tag" style="color:#34d399;">CDR</span>
        </div>`;

      case 'pdf':
        return `
        <div class="thumb-container">
          <div class="thumb-pdf" title="Documento PDF">
            <div class="thumb-doc-corner"></div>
            <div class="thumb-pdf-content">
              <div class="thumb-doc-header-line"></div>
              <div class="thumb-doc-lines">
                <div class="thumb-doc-line w-80"></div>
                <div class="thumb-doc-line w-60"></div>
              </div>
              <div class="thumb-doc-chart">
                <div class="thumb-doc-bar" style="height: 45%; background: #ef4444;"></div>
                <div class="thumb-doc-bar" style="height: 90%; background: #0284c7;"></div>
                <div class="thumb-doc-bar" style="height: 65%; background: #10b981;"></div>
                <div class="thumb-doc-bar" style="height: 100%; background: #f59e0b;"></div>
              </div>
              <div class="thumb-doc-lines">
                <div class="thumb-doc-line w-90"></div>
                <div class="thumb-doc-line w-50"></div>
              </div>
            </div>
          </div>
          <span class="thumb-tag" style="color:#ef4444;">PDF</span>
        </div>`;

      case 'image':
        const imgExt = (icon.name && icon.name.includes('.')) ? icon.name.split('.').pop().toUpperCase() : 'IMG';
        return `
        <div class="thumb-container">
          <div class="thumb-image" title="Imagen">
            <svg viewBox="0 0 44 44" class="thumb-img-art">
              <defs>
                <linearGradient id="photo-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#ff7e5f"/>
                  <stop offset="45%" stop-color="#feb47b"/>
                  <stop offset="100%" stop-color="#2c3e50"/>
                </linearGradient>
              </defs>
              <rect width="44" height="44" fill="url(#photo-grad)"/>
              <circle cx="33" cy="11" r="5" fill="#fef08a" opacity="0.95"/>
              <polygon points="0,44 16,24 28,44" fill="#1e1b4b" opacity="0.95"/>
              <polygon points="16,44 29,18 44,44" fill="#0f172a"/>
              <polygon points="29,18 32,23 26,23" fill="#e2e8f0" opacity="0.8"/>
            </svg>
          </div>
          <span class="thumb-tag" style="color:#fb923c;">${imgExt}</span>
        </div>`;

      case 'code':
        return `
        <div class="thumb-container">
          <div class="thumb-code" title="Archivo de Código">
            <div class="thumb-code-dots">
              <div class="thumb-code-dot" style="background:#ef4444;"></div>
              <div class="thumb-code-dot" style="background:#f59e0b;"></div>
              <div class="thumb-code-dot" style="background:#10b981;"></div>
            </div>
            <div class="thumb-code-lines">
              <div class="thumb-syntax-line" style="width: 75%; background: #f472b6;"></div>
              <div class="thumb-syntax-line" style="width: 50%; background: #38bdf8; margin-left: 4px;"></div>
              <div class="thumb-syntax-line" style="width: 85%; background: #4ade80; margin-left: 4px;"></div>
              <div class="thumb-syntax-line" style="width: 40%; background: #fbbf24;"></div>
            </div>
          </div>
          <span class="thumb-tag" style="color:#10b981;">&lt;/&gt;</span>
        </div>`;

      case 'audio':
        return `
        <div class="thumb-container">
          <div class="thumb-audio" title="Pista de Audio">
            <div class="thumb-audio-bars">
              <div class="thumb-audio-bar" style="height: 35%;"></div>
              <div class="thumb-audio-bar" style="height: 75%;"></div>
              <div class="thumb-audio-bar" style="height: 100%;"></div>
              <div class="thumb-audio-bar" style="height: 60%;"></div>
              <div class="thumb-audio-bar" style="height: 85%;"></div>
              <div class="thumb-audio-bar" style="height: 40%;"></div>
            </div>
          </div>
          <span class="thumb-tag" style="color:#c084fc;">WAV</span>
        </div>`;

      case 'illustrator':
        return `
        <div class="thumb-container">
          <div class="thumb-illustrator" title="Adobe Illustrator">
            <svg viewBox="0 0 44 44" style="width:100%; height:100%;">
              <rect width="44" height="44" fill="#1a0a00"/>
              <circle cx="22" cy="22" r="12" fill="none" stroke="#ff9a00" stroke-width="2"/>
              <polygon points="22,12 28,30 16,30" fill="rgba(255, 154, 0, 0.4)" stroke="#f59e0b" stroke-width="1"/>
            </svg>
          </div>
          <span class="thumb-tag" style="color:#ff9a00;">AI</span>
        </div>`;

      case 'sketchup':
        return `
        <div class="thumb-container">
          <div class="thumb-sketchup" title="Modelo 3D SketchUp">
            <svg viewBox="0 0 44 44" class="thumb-skp-svg">
              <rect width="44" height="44" fill="#181c24"/>
              <!-- Axis lines: Blue Z (vertical), Red X (down-right), Green Y (down-left) -->
              <line x1="22" y1="22" x2="22" y2="4" stroke="#3b82f6" stroke-width="1"/>
              <line x1="22" y1="22" x2="40" y2="32" stroke="#ef4444" stroke-width="1"/>
              <line x1="22" y1="22" x2="4" y2="32" stroke="#22c55e" stroke-width="1"/>
              <!-- 3D Architectural Isometric Building / House -->
              <polygon points="12,24 22,29 22,39 12,34" fill="#94a3b8" stroke="#334155" stroke-width="0.7"/>
              <polygon points="22,29 32,24 32,34 22,39" fill="#cbd5e1" stroke="#334155" stroke-width="0.7"/>
              <polygon points="12,24 17,16 22,20" fill="#dc2626" stroke="#991b1b" stroke-width="0.7"/>
              <polygon points="17,16 27,12 32,24 22,20" fill="#ef4444" stroke="#991b1b" stroke-width="0.7"/>
              <polygon points="24,30 28,27 28,31 24,34" fill="#38bdf8" opacity="0.8"/>
            </svg>
          </div>
          <span class="thumb-tag" style="color:#ef4444;">SKP</span>
        </div>`;

      case 'autocad':
        return `
        <div class="thumb-container">
          <div class="thumb-autocad" title="Plano y Dibujo AutoCAD">
            <svg viewBox="0 0 44 44" class="thumb-cad-svg">
              <rect width="44" height="44" fill="#08101e"/>
              <!-- Blueprint grid -->
              <path d="M0 8 H44 M0 16 H44 M0 24 H44 M0 32 H44 M0 40 H44 M8 0 V44 M16 0 V44 M24 0 V44 M32 0 V44 M40 0 V44" stroke="#13233c" stroke-width="0.6"/>
              <!-- Architectural Room Walls in Cyan -->
              <rect x="6" y="12" width="32" height="24" fill="none" stroke="#00e5db" stroke-width="1.6"/>
              <line x1="6" y1="24" x2="26" y2="24" stroke="#00e5db" stroke-width="1.4"/>
              <line x1="26" y1="24" x2="26" y2="36" stroke="#00e5db" stroke-width="1.4"/>
              <!-- Door Swing arc in amber/yellow -->
              <path d="M26 24 A 8 8 0 0 1 34 32" fill="none" stroke="#f59e0b" stroke-width="0.9" stroke-dasharray="1.5 1"/>
              <line x1="26" y1="24" x2="34" y2="24" stroke="#f59e0b" stroke-width="1"/>
              <!-- Dimension line with ticks -->
              <line x1="6" y1="9" x2="38" y2="9" stroke="#ef4444" stroke-width="0.7"/>
              <line x1="6" y1="7.5" x2="6" y2="10.5" stroke="#ef4444" stroke-width="0.8"/>
              <line x1="38" y1="7.5" x2="38" y2="10.5" stroke="#ef4444" stroke-width="0.8"/>
            </svg>
          </div>
          <span class="thumb-tag" style="color:#ef4444;">DWG</span>
        </div>`;

      case 'excel':
        return `
        <div class="thumb-container">
          <div class="thumb-excel" title="Hoja de Cálculo Excel">
            <div class="thumb-excel-content">
              <div class="thumb-excel-ribbon"></div>
              <div class="thumb-excel-grid">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
          <span class="thumb-tag" style="color:#10b981;">XLS</span>
        </div>`;

      case 'word':
        return `
        <div class="thumb-container">
          <div class="thumb-word" title="Documento Word">
            <div class="thumb-word-content">
              <div class="thumb-word-title"></div>
              <div class="thumb-doc-lines">
                <div class="thumb-doc-line w-90" style="background:#60a5fa;"></div>
                <div class="thumb-doc-line w-70" style="background:#93c5fd;"></div>
                <div class="thumb-doc-line w-80" style="background:#93c5fd;"></div>
              </div>
            </div>
          </div>
          <span class="thumb-tag" style="color:#3b82f6;">DOC</span>
        </div>`;

      case 'video':
        return `
        <div class="thumb-container">
          <div class="thumb-video" title="Vídeo / Grabación">
            <div class="thumb-video-screen">
              <div class="thumb-video-bg"></div>
              <div class="thumb-film-sprockets top">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <div class="thumb-video-play-disc">
                <div class="thumb-play-triangle"></div>
              </div>
              <div class="thumb-film-sprockets bottom">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <div class="thumb-video-timeline">
                <div class="thumb-timeline-progress"></div>
              </div>
            </div>
          </div>
          <span class="thumb-tag" style="color:#f43f5e;">MP4</span>
        </div>`;

      case 'folder':
        return `
        <div class="thumb-container">
          <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); border: 1px solid #06b6d4; border-radius: inherit; display: flex; align-items: center; justify-content: center;">
            ${SVGS.folderSmall}
          </div>
          <span class="thumb-tag" style="color:#06b6d4;">DIR</span>
        </div>`;

      default:
        return `
        <div class="thumb-container" style="background: ${this.getFenceIconGradient(icon.type, icon.color)};">
          ${this.renderFenceIconSvg(icon.icon || icon.type)}
        </div>`;
    }
  }

  renderFencesHtml(fences) {
    if (!fences || !fences.length) return '';
    return fences.map(fence => {
      const { iconSize, stepX, stepY, paddingX, paddingY, cols } = this.getFenceGridMetrics(fence);

      return `
      <div class="desktop-fence ${fence.isPinned ? 'fence-pinned' : ''}" id="fence-${fence.id}" style="left: ${fence.x}px; top: ${fence.y}px; width: ${fence.w}px; height: ${fence.h}px;" data-fence-id="${fence.id}" data-pinned="${fence.isPinned ? 'true' : 'false'}">
        <!-- Header -->
        <div class="fence-header" data-fence-id="${fence.id}">
          <div class="fence-header-left">
            ${!fence.isPinned ? `
              <!-- Botón redondo pequeño (arrastrar o pulsar para enfocar) -->
              <button class="fence-round-btn" title="Arrastrar para mover grupo" data-fence-id="${fence.id}">
                <span class="fence-round-dot"></span>
              </button>
              <!-- Botón alfiler para fijar en el escritorio como cajón posado -->
              <button class="fence-pin-btn" title="Fijar en el escritorio (modo cajón plano sin sombra ni barra oscura)" data-fence-id="${fence.id}">
                ${SVGS.pin}
              </button>
            ` : ''}
            <!-- Entrada a configuración de tamaño, separación y flotación -->
            <button class="fence-settings-btn" title="Ajustes del cajón y flotación" data-fence-id="${fence.id}">
              ${SVGS.gearSmall}
            </button>
            <!-- Título para identificar el grupo -->
            <input type="text" class="fence-title-input" value="${this.escapeHtml(fence.title)}" placeholder="Nombre del grupo..." data-fence-id="${fence.id}" title="Haz clic para renombrar" />
          </div>

          <div class="fence-header-right">
            ${!fence.isPinned ? `
              <!-- Botón + para crear un nuevo cuadrado independiente -->
              <button class="fence-add-btn" title="Crear un nuevo cuadrado de iconos independiente" data-fence-id="${fence.id}">+</button>
              <!-- Botón para cerrar o eliminar este grupo -->
              <button class="fence-close-btn" title="Eliminar este grupo" data-fence-id="${fence.id}">✕</button>
            ` : `
              <span class="fence-drawer-badge" title="Cajón de escritorio fijado">Cajón</span>
            `}
          </div>
        </div>

        <!-- Menú Popover de Configuración -->
        <div class="fence-settings-flyout" id="fence-settings-${fence.id}">
          <div class="fence-flyout-title">Configuración del ${fence.isPinned ? 'Cajón' : 'Grupo'}</div>
          
          <div style="margin-bottom: 6px;">
            ${fence.isPinned ? `
              <button class="tochka-btn-cyan btn-small fence-toggle-pin-btn" style="width: 100%; justify-content: center; gap: 5px; font-weight: 700;" data-fence-id="${fence.id}">
                ${SVGS.floatWindow} Flotar ventana
              </button>
            ` : `
              <button class="tochka-btn-dark btn-small fence-toggle-pin-btn" style="width: 100%; justify-content: center; gap: 5px;" data-fence-id="${fence.id}">
                ${SVGS.pin} Fijar en el escritorio (Modo Cajón)
              </button>
            `}
          </div>

          <div class="fence-flyout-row">
            <span class="fence-row-label">Tamaño iconos:</span>
            <div class="fence-pill-group">
              <button class="fence-size-pill ${fence.iconSize === 'small' ? 'active' : ''}" data-size="small" data-fence-id="${fence.id}">S</button>
              <button class="fence-size-pill ${fence.iconSize === 'medium' || !fence.iconSize ? 'active' : ''}" data-size="medium" data-fence-id="${fence.id}">M</button>
              <button class="fence-size-pill ${fence.iconSize === 'large' ? 'active' : ''}" data-size="large" data-fence-id="${fence.id}">G</button>
            </div>
          </div>

          <div class="fence-flyout-row">
            <span class="fence-row-label">Separación:</span>
            <div class="fence-pill-group">
              <button class="fence-gap-pill ${fence.iconGap === 4 ? 'active' : ''}" data-gap="4" data-fence-id="${fence.id}">4px</button>
              <button class="fence-gap-pill ${fence.iconGap === 10 || !fence.iconGap ? 'active' : ''}" data-gap="10" data-fence-id="${fence.id}">10px</button>
              <button class="fence-gap-pill ${fence.iconGap === 18 ? 'active' : ''}" data-gap="18" data-fence-id="${fence.id}">18px</button>
            </div>
          </div>

          <div class="fence-flyout-actions">
            <input type="file" id="fence-file-picker-${fence.id}" class="fence-hidden-file-input" data-fence-id="${fence.id}" style="display: none;" multiple />
            <button class="tochka-btn-cyan btn-small fence-open-explorer-btn" style="width: 100%; justify-content: center; gap: 6px; font-weight: 700;" data-fence-id="${fence.id}">
              <span style="display: inline-flex; align-items: center;">${SVGS.folderSmall}</span> Explorador de Archivos...
            </button>
          </div>
        </div>

        <!-- Contenedor de iconos con ajuste a cuadrícula perfecta -->
        <div class="fence-body size-${fence.iconSize || 'medium'}" style="position: relative; min-height: 110px;" data-fence-id="${fence.id}">
          ${fence.icons && fence.icons.length ? fence.icons.map((icon, idx) => {
            let posX;
            let posY;
            if (icon.x !== undefined && icon.x !== null && icon.y !== undefined && icon.y !== null) {
              const col = Math.max(0, Math.round((icon.x - paddingX) / stepX));
              const row = Math.max(0, Math.round((icon.y - paddingY) / stepY));
              posX = paddingX + col * stepX;
              posY = paddingY + row * stepY;
            } else {
              const col = idx % cols;
              const row = Math.floor(idx / cols);
              posX = paddingX + col * stepX;
              posY = paddingY + row * stepY;
            }

            const isLnk = icon.isShortcut || (icon.name && icon.name.toLowerCase().endsWith('.lnk')) || (icon.path && icon.path.toLowerCase().endsWith('.lnk'));
            const cleanName = (icon.name || '').replace(/\.lnk$/i, '');
            const shortcutBadge = isLnk ? '<span class="win-shortcut-arrow-badge"></span>' : '';
            const thumbHtml = this.renderFenceThumbnail(icon, iconSize);
            return `
            <div class="fence-icon-item" draggable="true" style="left: ${posX}px; top: ${posY}px; position: absolute;" data-icon-id="${icon.id}" data-parent-fence="${fence.id}" data-icon-name="${this.escapeHtml(cleanName)}" data-icon-type="${icon.type}" data-icon-color="${icon.color}" data-path="${this.escapeHtml(icon.path || '')}" data-app="${this.escapeHtml(icon.app || '')}" data-thumbnail="${this.escapeHtml(icon.thumbnail || '')}" data-custom-icon="${this.escapeHtml(icon.customIcon || '')}">
              <div class="fence-icon-squircle">
                ${thumbHtml}
                ${shortcutBadge}
              </div>
              <span class="fence-icon-label" title="${this.escapeHtml(cleanName)}">${this.escapeHtml(cleanName)}</span>
              <button class="fence-icon-delete" title="Quitar de este grupo" data-fence-id="${fence.id}" data-icon-id="${icon.id}">✕</button>
            </div>
            `;
          }).join('') : `
            <div class="fence-drop-hint" data-fence-id="${fence.id}">
              <span>Arrastra archivos o abre el Explorador para colocarlos alineados en cuadrícula</span>
            </div>
          `}
        </div>

        <!-- Tirador inferior para ajustar ancho y largo libremente -->
        <div class="fence-resize-handle" title="Arrastrar para ajustar ancho y alto todo lo que quieras" data-fence-id="${fence.id}">
          ${SVGS.resizeHandle}
        </div>
      </div>
      `;
    }).join('');
  }

  renderFencesOnly() {
    const layer = document.getElementById('desktop-fences-layer');
    if (layer) {
      const s = this.themeEngine.getState();
      layer.innerHTML = this.renderFencesHtml(s.desktopFences || []);
      this.bindFencesInteractions();
    }
  }

  bindFencesInteractions() {
    // 1. Create New Independent Fence Button (Header button & desktop floating button)
    const btnCreateFence = document.getElementById('btn-create-desktop-fence');
    if (btnCreateFence) {
      btnCreateFence.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playNotification();
        const currentCount = (this.themeEngine.getState().desktopFences || []).length + 1;
        this.themeEngine.addDesktopFence({
          title: `Grupo ${currentCount}`,
          x: 100 + ((currentCount * 25) % 200),
          y: 50 + ((currentCount * 25) % 150),
          w: 240,
          h: 180
        });
        this.renderFencesOnly();
      };
    }

    // '+' buttons inside fence headers to duplicate / create new independent group
    document.querySelectorAll('.fence-add-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playNotification();
        const currentCount = (this.themeEngine.getState().desktopFences || []).length + 1;
        this.themeEngine.addDesktopFence({
          title: `Grupo ${currentCount}`,
          x: 100 + ((currentCount * 30) % 220),
          y: 50 + ((currentCount * 30) % 160),
          w: 240,
          h: 180
        });
        this.renderFencesOnly();
      };
    });

    // 2. Delete / Close Fence
    document.querySelectorAll('.fence-close-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        const fenceId = btn.dataset.fenceId;
        this.themeEngine.removeDesktopFence(fenceId);
        this.renderFencesOnly();
      };
    });

    // 2b. Pin to Desktop Button (Alfiler - modo cajón)
    document.querySelectorAll('.fence-pin-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playNotification();
        const fenceId = btn.dataset.fenceId;
        this.themeEngine.setFencePin(fenceId, true);
        this.renderFencesOnly();
      };
    });

    // 2c. Toggle Pin Button inside Settings Flyout (Hacer flotar de nuevo o fijar)
    document.querySelectorAll('.fence-toggle-pin-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playStartup();
        const fenceId = btn.dataset.fenceId;
        this.themeEngine.toggleFencePin(fenceId);
        this.renderFencesOnly();
      };
    });

    // 3. Settings Flyout Toggle
    document.querySelectorAll('.fence-settings-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        const fenceId = btn.dataset.fenceId;
        const flyout = document.getElementById(`fence-settings-${fenceId}`);
        if (flyout) {
          const isOpen = flyout.classList.contains('open');
          document.querySelectorAll('.fence-settings-flyout, .fence-resize-flyout').forEach(f => f.classList.remove('open'));
          flyout.classList.toggle('open', !isOpen);
        }
      };
    });

    // 4. Size Pills
    document.querySelectorAll('.fence-size-pill').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        const fenceId = btn.dataset.fenceId;
        const size = btn.dataset.size;
        this.themeEngine.updateDesktopFence(fenceId, { iconSize: size });
        this.renderFencesOnly();
      };
    });

    // 5. Gap Pills
    document.querySelectorAll('.fence-gap-pill').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        const fenceId = btn.dataset.fenceId;
        const gap = parseInt(btn.dataset.gap, 10);
        this.themeEngine.updateDesktopFence(fenceId, { iconGap: gap });
        this.renderFencesOnly();
      };
    });

    // 6. Open File Explorer / Pick Files to Add to Fence
    document.querySelectorAll('.fence-open-explorer-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        const fenceId = btn.dataset.fenceId;

        // Close flyout
        document.querySelectorAll('.fence-settings-flyout').forEach(f => f.classList.remove('open'));

        // 1. Open the on-screen simulated Explorer window & bring to front
        const expWin = document.getElementById('sim-window-explorer');
        if (expWin) {
          expWin.style.display = 'flex';
          this.bringWindowToFront(expWin);
        }

        // 2. Trigger native OS file selector dialog to pick any real file/folder/shortcut
        const fileInput = document.getElementById(`fence-file-picker-${fenceId}`);
        if (fileInput) {
          fileInput.click();
        }
      };
    });

    // 6b. Hidden File Input Change Handler (Loads picked files into fence with real thumbnails & grid snap)
    document.querySelectorAll('.fence-hidden-file-input').forEach(input => {
      input.onchange = async (e) => {
        const fenceId = input.dataset.fenceId;
        const files = Array.from(input.files || []);
        if (!files.length) return;

        audioEngine.playStartup();
        const fence = (this.themeEngine.getState().desktopFences || []).find(f => f.id === fenceId);
        const { stepX, stepY, paddingX, paddingY, cols } = this.getFenceGridMetrics(fence);

        for (let idx = 0; idx < files.length; idx++) {
          const file = files[idx];
          const fileName = file.name;
          const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
          const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp', 'avif'].includes(ext);

          let thumbnail = null;
          if (isImage) {
            try {
              thumbnail = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (re) => resolve(re.target.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
              });
            } catch (err) {
              console.warn('Error reading file thumbnail', err);
            }
          }

          let type = 'docs';
          let icon = 'doc';
          let color = '#0284c7';

          if (['exe', 'lnk', 'bat', 'cmd', 'app'].includes(ext)) {
            type = 'app';
            icon = 'terminal';
            color = '#00e5db';
          } else if (isImage) {
            type = 'images';
            icon = 'image';
            color = '#f97316';
          } else if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) {
            type = 'audio';
            icon = 'audio';
            color = '#8b5cf6';
          } else if (['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'cpp', 'cs', 'php', 'rb'].includes(ext)) {
            type = 'code';
            icon = 'code';
            color = '#10b981';
          } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
            type = 'folder';
            icon = 'folder';
            color = '#eab308';
          } else if (['psd', 'psb'].includes(ext)) {
            type = 'app';
            icon = 'palette';
            color = '#001e36';
          } else if (['cdr'].includes(ext)) {
            type = 'app';
            icon = 'palette';
            color = '#047857';
          } else if (['ai'].includes(ext)) {
            type = 'app';
            icon = 'palette';
            color = '#ff9a00';
          } else if (['dwg', 'dxf'].includes(ext)) {
            type = 'app';
            icon = 'terminal';
            color = '#ef4444';
          } else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'xlsx', 'pptx'].includes(ext)) {
            type = 'docs';
            icon = 'doc';
            color = '#0284c7';
          } else if (!ext) {
            type = 'folder';
            icon = 'folder';
            color = '#06b6d4';
          }

          // Compute next available unallocated grid position
          const currentFence = (this.themeEngine.getState().desktopFences || []).find(f => f.id === fenceId);
          const currentIcons = (currentFence && currentFence.icons) ? currentFence.icons : [];
          const occupied = (c, r) => currentIcons.some(ic => {
            if (ic.x == null || ic.y == null) return false;
            const icC = Math.round((ic.x - paddingX) / stepX);
            const icR = Math.round((ic.y - paddingY) / stepY);
            return icC === c && icR === r;
          });

          let col = 0, row = 0;
          let foundSlot = false;
          for (let r = 0; r < 50 && !foundSlot; r++) {
            for (let c = 0; c < cols && !foundSlot; c++) {
              if (!occupied(c, r)) {
                col = c;
                row = r;
                foundSlot = true;
              }
            }
          }

          const posX = paddingX + col * stepX;
          const posY = paddingY + row * stepY;

          const realPath = getFilePath(file);
          this.themeEngine.addIconToFence(fenceId, {
            id: 'file-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substr(2, 4),
            name: fileName,
            type: type,
            icon: icon,
            color: color,
            thumbnail: thumbnail,
            path: realPath || file.path || '',
            x: posX,
            y: posY
          });
        }

        input.value = '';
        this.renderFencesOnly();
      };
    });

    // 7. Title Input Editing
    document.querySelectorAll('.fence-title-input').forEach(input => {
      input.oninput = () => {
        const fenceId = input.dataset.fenceId;
        this.themeEngine.updateDesktopFence(fenceId, { title: input.value });
      };
      input.onkeydown = (e) => {
        if (e.key === 'Enter') input.blur();
      };
    });

    // 8. Delete individual icon from fence
    document.querySelectorAll('.fence-icon-delete').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        const fenceId = btn.dataset.fenceId;
        const iconId = btn.dataset.iconId;
        this.themeEngine.removeIconFromFence(fenceId, iconId);
        this.renderFencesOnly();
      };
    });

    // 9. Move Fence (Dragging via Round Button or Header) & Resize / Move Popover
    document.querySelectorAll('.desktop-fence').forEach(fenceEl => {
      const fenceId = fenceEl.dataset.fenceId;
      const roundBtn = fenceEl.querySelector('.fence-round-btn');
      const header = fenceEl.querySelector('.fence-header');
      let dragMoved = false;

      const startMove = (e) => {
        if (fenceEl.classList.contains('fence-pinned')) return;
        if (e.target.closest('.fence-settings-btn') || e.target.closest('.fence-title-input') || e.target.closest('.fence-add-btn') || e.target.closest('.fence-close-btn') || e.target.closest('.fence-resize-flyout') || e.target.closest('.fence-settings-flyout') || e.target.closest('.fence-pin-btn')) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        dragMoved = false;
        this.bringFenceToFront(fenceEl);
        fenceEl.classList.add('is-dragging');
        document.body.classList.add('is-window-dragging');

        const startX = e.clientX;
        const startY = e.clientY;
        const initialX = fenceEl.offsetLeft;
        const initialY = fenceEl.offsetTop;

        const onMouseMove = (moveEvt) => {
          const dx = moveEvt.clientX - startX;
          const dy = moveEvt.clientY - startY;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            dragMoved = true;
          }
          const newX = Math.max(10, initialX + dx);
          const newY = Math.max(10, initialY + dy);
          fenceEl.style.left = `${newX}px`;
          fenceEl.style.top = `${newY}px`;
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          fenceEl.classList.remove('is-dragging');
          document.body.classList.remove('is-window-dragging');
          if (dragMoved) {
            this.themeEngine.updateDesktopFence(fenceId, {
              x: fenceEl.offsetLeft,
              y: fenceEl.offsetTop
            });
          }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };

      if (roundBtn) roundBtn.addEventListener('mousedown', startMove);
      if (header) header.addEventListener('mousedown', startMove);

      // Clicking round button highlights and focuses the group
      if (roundBtn) {
        roundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (dragMoved) {
            dragMoved = false;
            return;
          }
          audioEngine.playClick();
          this.bringFenceToFront(fenceEl);
          fenceEl.classList.add('fence-highlighted');
          setTimeout(() => fenceEl.classList.remove('fence-highlighted'), 1200);
        });
      }

      fenceEl.addEventListener('mousedown', () => {
        this.bringFenceToFront(fenceEl);
      });
    });

    // 9b. Click, Multi-Select (Ctrl / Shift), Double-click and Click-to-Rename on icon inside fence
    document.querySelectorAll('.fence-icon-item').forEach(item => {
      item.onclick = (e) => {
        if (e.target.closest('.fence-icon-delete')) return;
        if (e.target.closest('.fence-rename-input')) return;

        const fenceBody = item.closest('.fence-body');
        const wasSelected = item.classList.contains('is-selected');
        const clickedLabel = !!e.target.closest('.fence-icon-label');
        const clickedSquircle = !!e.target.closest('.fence-icon-squircle');

        if (e.ctrlKey || e.metaKey) {
          // Ctrl + Click: toggle selection on this specific icon
          e.stopPropagation();
          item.classList.toggle('is-selected');
          audioEngine.playClick();
        } else {
          // Normal Click without Ctrl
          const otherSelected = fenceBody ? Array.from(fenceBody.querySelectorAll('.fence-icon-item.is-selected')) : [];

          // If clicking specifically on label of ALREADY selected single item: initiate inline rename like Windows (doble click lento)
          if (wasSelected && otherSelected.length === 1 && clickedLabel) {
            e.stopPropagation();
            this.startInlineRename(item);
            return;
          }

          // Clear selection from other items across desktop & fences, select only this one
          document.querySelectorAll('.fence-icon-item.is-selected, .desktop-icon.is-selected').forEach(el => {
            if (el !== item) el.classList.remove('is-selected');
          });
          item.classList.add('is-selected');

          // Click and release on icon squircle: opens the file/app directly ("si hago click y suelto se abre")
          if (clickedSquircle) {
            this.openIconItem(item, 'fence');
          } else {
            audioEngine.playClick();
          }
        }
      };

      item.ondblclick = (e) => {
        if (e.target.closest('.fence-icon-delete')) return;
        if (e.target.closest('.fence-rename-input')) return;
        this.openIconItem(item, 'fence');
      };
    });

    // 9c. Rubber-Band / Marquee Selection Box (Lazo con el ratón) inside each fence
    document.querySelectorAll('.fence-body').forEach(fenceBody => {
      fenceBody.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Left mouse click only
        if (document.body.classList.contains('is-window-dragging') || document.body.classList.contains('is-icon-dragging') || document.querySelector('.fluent-window.is-dragging') || document.querySelector('.desktop-fence.is-dragging') || document.querySelector('.is-resizing')) {
          return;
        }
        // Strict target check: Only allow starting selection if clicking directly on empty space in fence-body or drop-hint
        if (e.target !== fenceBody && !e.target.classList.contains('fence-drop-hint') && !e.target.closest('.fence-drop-hint')) {
          return;
        }

        const rect = fenceBody.getBoundingClientRect();
        const originClientX = e.clientX;
        const originClientY = e.clientY;
        const startX = e.clientX - rect.left + fenceBody.scrollLeft;
        const startY = e.clientY - rect.top + fenceBody.scrollTop;

        const initialSelectedIds = new Set();
        if (!e.ctrlKey && !e.shiftKey) {
          document.querySelectorAll('.fence-icon-item.is-selected, .desktop-icon.is-selected').forEach(el => el.classList.remove('is-selected'));
        } else {
          fenceBody.querySelectorAll('.fence-icon-item.is-selected').forEach(el => initialSelectedIds.add(el.dataset.iconId));
        }

        let selBox = null;
        let hasMoved = false;

        const onMouseMove = (moveEvt) => {
          if (document.body.classList.contains('is-window-dragging') || document.body.classList.contains('is-icon-dragging') || document.querySelector('.fluent-window.is-dragging') || document.querySelector('.desktop-fence.is-dragging') || document.querySelector('.is-resizing')) {
            onMouseUp();
            return;
          }

          const dist = Math.hypot(moveEvt.clientX - originClientX, moveEvt.clientY - originClientY);
          if (!hasMoved && dist > 5) {
            hasMoved = true;
            selBox = document.createElement('div');
            selBox.className = 'fence-selection-box';
            fenceBody.appendChild(selBox);
          }

          if (hasMoved && selBox) {
            const curRect = fenceBody.getBoundingClientRect();
            const curX = moveEvt.clientX - curRect.left + fenceBody.scrollLeft;
            const curY = moveEvt.clientY - curRect.top + fenceBody.scrollTop;

            const boxLeft = Math.min(startX, curX);
            const boxTop = Math.min(startY, curY);
            const boxWidth = Math.abs(curX - startX);
            const boxHeight = Math.abs(curY - startY);

            selBox.style.left = `${boxLeft}px`;
            selBox.style.top = `${boxTop}px`;
            selBox.style.width = `${boxWidth}px`;
            selBox.style.height = `${boxHeight}px`;

            fenceBody.querySelectorAll('.fence-icon-item').forEach(item => {
              const itemL = item.offsetLeft;
              const itemT = item.offsetTop;
              const itemW = item.offsetWidth;
              const itemH = item.offsetHeight;

              const intersects = (
                boxLeft < itemL + itemW &&
                boxLeft + boxWidth > itemL &&
                boxTop < itemT + itemH &&
                boxTop + boxHeight > itemT
              );

              if (intersects) {
                item.classList.add('is-selected');
              } else if (!initialSelectedIds.has(item.dataset.iconId)) {
                item.classList.remove('is-selected');
              }
            });
          }
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          if (selBox && selBox.parentNode) {
            selBox.remove();
            selBox = null;
          }
          if (hasMoved) {
            audioEngine.playClick();
          }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    });


    // 9e. Global Keyboard Shortcuts (F2 = Rename, Delete/Supr = Eliminar, Ctrl+A = Seleccionar todo)
    if (!this._fenceKeyboardListener) {
      this._fenceKeyboardListener = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const selectedFenceIcons = Array.from(document.querySelectorAll('.fence-icon-item.is-selected'));
        const selectedDesktopIcons = Array.from(document.querySelectorAll('.desktop-icon.is-selected'));

        if (e.key === 'F2') {
          if (selectedFenceIcons.length > 0) {
            e.preventDefault();
            this.startInlineRename(selectedFenceIcons[0]);
          } else if (selectedDesktopIcons.length > 0) {
            e.preventDefault();
            this.startDesktopInlineRename(selectedDesktopIcons[0]);
          }
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedFenceIcons.length > 0 || selectedDesktopIcons.length > 0) {
            e.preventDefault();
            audioEngine.playClick();
            selectedFenceIcons.forEach(item => {
              const fId = item.dataset.parentFence;
              const icId = item.dataset.iconId;
              this.themeEngine.removeIconFromFence(fId, icId);
            });
            selectedDesktopIcons.forEach(item => {
              this.themeEngine.removeDesktopIcon(item.dataset.iconId);
            });
            if (selectedFenceIcons.length > 0) this.renderFencesOnly();
            if (selectedDesktopIcons.length > 0) this.renderDesktopIconsOnly();
          }
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
          const hoveredFence = document.querySelector('.desktop-fence:hover .fence-body') || document.querySelector('.fence-body');
          if (hoveredFence) {
            e.preventDefault();
            hoveredFence.querySelectorAll('.fence-icon-item').forEach(el => el.classList.add('is-selected'));
          }
        }
      };
      window.addEventListener('keydown', this._fenceKeyboardListener);
    }

    // 9c. Global click listener to close open fence flyouts when clicking outside
    if (!this._fenceFlyoutGlobalListener) {
      this._fenceFlyoutGlobalListener = (e) => {
        if (!e.target.closest('.fence-settings-btn') && !e.target.closest('.fence-settings-flyout')) {
          document.querySelectorAll('.fence-settings-flyout').forEach(f => f.classList.remove('open'));
        }
      };
      document.addEventListener('click', this._fenceFlyoutGlobalListener);
    }

    // 10. Resize Fence (Largo y ancho / width & height) - Aprovechar todo el espacio libre de pantalla
    document.querySelectorAll('.fence-resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const fenceId = handle.dataset.fenceId;
        const fenceEl = document.getElementById(`fence-${fenceId}`);
        if (!fenceEl) return;

        this.bringFenceToFront(fenceEl);
        fenceEl.classList.add('is-resizing');

        const startX = e.clientX;
        const startY = e.clientY;
        const initialW = fenceEl.offsetWidth;
        const initialH = fenceEl.offsetHeight;

        // Calculate available space on screen
        const desktopLayer = document.getElementById('desktop-fences-layer') || document.body;
        const containerW = desktopLayer.clientWidth || window.innerWidth;
        const containerH = desktopLayer.clientHeight || window.innerHeight;

        // Right margin limit (respect widgets column if open on right)
        const sidebar = document.querySelector('.tochka-sidebar') || document.querySelector('.widgets-column');
        let rightLimit = containerW - 12;
        if (sidebar) {
          const sRect = sidebar.getBoundingClientRect();
          if (sRect.left > fenceEl.offsetLeft + 100) {
            rightLimit = sRect.left - 10;
          }
        }

        // Bottom margin limit (respect dock / taskbar)
        const dock = document.getElementById('mac-dock-shelf') || document.querySelector('.mac-dock-container');
        let bottomLimit = containerH - 12;
        if (dock) {
          const dRect = dock.getBoundingClientRect();
          if (dRect.top > fenceEl.offsetTop + 80) {
            bottomLimit = dRect.top - 10;
          }
        }

        const maxW = Math.max(260, rightLimit - fenceEl.offsetLeft);
        const maxH = Math.max(140, bottomLimit - fenceEl.offsetTop);

        const onResizeMove = (moveEvt) => {
          const dw = moveEvt.clientX - startX;
          const dh = moveEvt.clientY - startY;
          const newW = Math.max(160, Math.min(maxW, initialW + dw));
          const newH = Math.max(100, Math.min(maxH, initialH + dh));
          fenceEl.style.width = `${newW}px`;
          fenceEl.style.height = `${newH}px`;
        };

        const onResizeUp = () => {
          window.removeEventListener('mousemove', onResizeMove);
          window.removeEventListener('mouseup', onResizeUp);
          fenceEl.classList.remove('is-resizing');
          this.themeEngine.updateDesktopFence(fenceId, {
            w: fenceEl.offsetWidth,
            h: fenceEl.offsetHeight
          });
        };

        window.addEventListener('mousemove', onResizeMove);
        window.addEventListener('mouseup', onResizeUp);
      });
    });

    // 11. Draggable items from Explorer Window
    document.querySelectorAll('#sim-window-explorer .file-item').forEach(item => {
      item.setAttribute('draggable', 'true');
      item.ondragstart = (e) => {
        const rawName = item.querySelector('.file-name')?.textContent || item.dataset.name || 'Archivo';
        const cleanName = (rawName || '').replace(/\.lnk$/i, '');
        const type = item.dataset.type || 'docs';
        const filePath = item.dataset.path || '';
        const isDir = item.dataset.isDir === 'true' || type === 'folder';
        const isWall = (rawName.toLowerCase().includes('.jpg') || rawName.toLowerCase().includes('.png') || type === 'wallpaper');
        const isImage = isWall || type === 'images' || /\.(png|jpe?g|webp|gif|bmp|ico|svg)$/i.test(rawName);
        const isLnk = item.classList.contains('is-shortcut') || (filePath && filePath.toLowerCase().endsWith('.lnk')) || (rawName && rawName.toLowerCase().endsWith('.lnk'));
        const iconUrl = item.dataset.iconUrl || item.dataset.customIcon || null;
        const iconData = {
          id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          name: cleanName,
          type: isDir ? 'folder' : (isImage ? 'images' : (type === 'script' ? 'code' : (type === 'theme' ? 'palette' : 'doc'))),
          icon: isDir ? 'folder' : (isImage ? 'image' : (type === 'script' ? 'code' : (type === 'theme' ? 'palette' : 'doc'))),
          color: isDir ? '#06b6d4' : (isImage ? '#f97316' : (type === 'script' ? '#10b981' : (type === 'theme' ? '#00e5db' : '#0284c7'))),
          thumbnail: isWall ? '/wallpapers/aurora_glass.jpg' : (isImage && filePath ? `/local-file/${encodeURIComponent(filePath)}` : null),
          customIcon: iconUrl,
          isShortcut: isLnk,
          path: filePath,
          isDirectory: isDir,
          source: 'explorer'
        };
        e.dataTransfer.setData('application/json', JSON.stringify(iconData));
        e.dataTransfer.effectAllowed = 'copyMove';
        item.style.opacity = '0.5';
      };
      item.ondragend = () => {
        item.style.opacity = '1';
      };
    });

    // 12. Drag and Drop Icons Inside Fences (Single & Multi-Item Grid-Snapped Placement)
    document.querySelectorAll('.fence-icon-item[draggable="true"]').forEach(item => {
      item.ondragstart = (e) => {
        const fenceId = item.dataset.parentFence;
        const fenceEl = document.getElementById(`fence-${fenceId}`);
        const currentFence = (this.themeEngine.getState().desktopFences || []).find(f => f.id === fenceId);
        const isSelected = item.classList.contains('is-selected');

        let selectedEls = fenceEl ? Array.from(fenceEl.querySelectorAll('.fence-icon-item.is-selected')) : [];
        if (!isSelected || selectedEls.length === 0) {
          document.querySelectorAll('.fence-icon-item.is-selected').forEach(el => el.classList.remove('is-selected'));
          item.classList.add('is-selected');
          selectedEls = [item];
        }

        if (selectedEls.length > 1) {
          // MULTI-ITEM DRAG
          const itemsData = selectedEls.map(el => {
            const icObj = (currentFence && currentFence.icons) ? currentFence.icons.find(i => i.id === el.dataset.iconId) : null;
            return {
              id: el.dataset.iconId,
              name: el.dataset.iconName,
              type: icObj?.type || el.dataset.iconType,
              icon: icObj?.icon || el.dataset.iconType,
              color: icObj?.color || el.dataset.iconColor,
              thumbnail: icObj ? icObj.thumbnail : (el.dataset.thumbnail || null),
              customIcon: icObj ? icObj.customIcon : (el.dataset.customIcon || null),
              exe: icObj?.exe || '',
              path: icObj?.path || el.dataset.path || '',
              app: icObj?.app || el.dataset.app || '',
              x: icObj && icObj.x != null ? icObj.x : el.offsetLeft,
              y: icObj && icObj.y != null ? icObj.y : el.offsetTop
            };
          });

          const primaryObj = (currentFence && currentFence.icons) ? currentFence.icons.find(i => i.id === item.dataset.iconId) : null;
          const multiData = {
            isMulti: true,
            primaryId: item.dataset.iconId,
            primaryX: primaryObj && primaryObj.x != null ? primaryObj.x : item.offsetLeft,
            primaryY: primaryObj && primaryObj.y != null ? primaryObj.y : item.offsetTop,
            fromFenceId: fenceId,
            source: 'fence',
            items: itemsData
          };

          e.dataTransfer.setData('application/json', JSON.stringify(multiData));
          e.dataTransfer.effectAllowed = 'move';
          selectedEls.forEach(el => { el.style.opacity = '0.35'; });
        } else {
          // SINGLE ITEM DRAG
          const iconObj = (currentFence && currentFence.icons) ? currentFence.icons.find(i => i.id === item.dataset.iconId) : null;
          const iconData = {
            id: item.dataset.iconId,
            name: item.dataset.iconName,
            type: iconObj?.type || item.dataset.iconType,
            icon: iconObj?.icon || item.dataset.iconType,
            color: iconObj?.color || item.dataset.iconColor,
            thumbnail: iconObj ? iconObj.thumbnail : (item.dataset.thumbnail || null),
            customIcon: iconObj ? iconObj.customIcon : (item.dataset.customIcon || null),
            exe: iconObj?.exe || '',
            path: iconObj?.path || item.dataset.path || '',
            app: iconObj?.app || item.dataset.app || '',
            fromFenceId: fenceId,
            source: 'fence'
          };
          e.dataTransfer.setData('application/json', JSON.stringify(iconData));
          e.dataTransfer.effectAllowed = 'move';
          item.style.opacity = '0.4';
        }
      };

      item.ondragend = () => {
        document.querySelectorAll('.fence-icon-item').forEach(el => { el.style.opacity = '1'; });
      };
    });

    document.querySelectorAll('.desktop-fence').forEach(fenceEl => {
      const fenceId = fenceEl.dataset.fenceId;

      fenceEl.ondragover = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        fenceEl.classList.add('fence-drag-over');
      };

      fenceEl.ondragleave = (e) => {
        if (!fenceEl.contains(e.relatedTarget)) {
          fenceEl.classList.remove('fence-drag-over');
        }
      };

      fenceEl.ondrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        fenceEl.classList.remove('fence-drag-over');

        const fence = (this.themeEngine.getState().desktopFences || []).find(f => f.id === fenceId);
        const { itemW, itemH, stepX, stepY, paddingX, paddingY } = this.getFenceGridMetrics(fence);

        const bodyEl = fenceEl.querySelector('.fence-body');
        const bodyRect = bodyEl ? bodyEl.getBoundingClientRect() : fenceEl.getBoundingClientRect();
        const scrollLeft = bodyEl ? bodyEl.scrollLeft : 0;
        const scrollTop = bodyEl ? bodyEl.scrollTop : 0;

        const rawX = e.clientX - bodyRect.left + scrollLeft - itemW / 2;
        const rawY = e.clientY - bodyRect.top + scrollTop - itemH / 2;

        let col = Math.max(0, Math.round((rawX - paddingX) / stepX));
        let row = Math.max(0, Math.round((rawY - paddingY) / stepY));

        // Case A: Real files dropped directly from Windows OS
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          audioEngine.playStartup();
          const files = Array.from(e.dataTransfer.files);
          const currentFence = (this.themeEngine.getState().desktopFences || []).find(f => f.id === fenceId);
          const currentIcons = (currentFence && currentFence.icons) ? [...currentFence.icons] : [];

          const occupied = (c, r) => currentIcons.some(ic => {
            if (ic.x == null || ic.y == null) return false;
            const icC = Math.round((ic.x - paddingX) / stepX);
            const icR = Math.round((ic.y - paddingY) / stepY);
            return icC === c && icR === r;
          });

          for (let fIdx = 0; fIdx < files.length; fIdx++) {
            const file = files[fIdx];
            const fileName = file.name;
            const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
            const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp', 'avif'].includes(ext);

            let thumbnail = null;
            if (isImage) {
              try {
                thumbnail = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (re) => resolve(re.target.result);
                  reader.onerror = () => resolve(null);
                  reader.readAsDataURL(file);
                });
              } catch (err) {
                console.warn('Error reading dropped image thumbnail', err);
              }
            }

            let type = 'docs';
            let icon = 'doc';
            let color = '#0284c7';
            if (['exe', 'lnk', 'bat', 'cmd', 'app'].includes(ext)) {
              type = 'app'; icon = 'terminal'; color = '#00e5db';
            } else if (isImage) {
              type = 'images'; icon = 'image'; color = '#f97316';
            } else if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) {
              type = 'audio'; icon = 'audio'; color = '#8b5cf6';
            } else if (['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'cpp', 'cs', 'php', 'rb'].includes(ext)) {
              type = 'code'; icon = 'code'; color = '#10b981';
            } else if (['psd', 'psb'].includes(ext)) {
              type = 'app'; icon = 'palette'; color = '#001e36';
            } else if (['cdr'].includes(ext)) {
              type = 'app'; icon = 'palette'; color = '#047857';
            } else if (['ai'].includes(ext)) {
              type = 'app'; icon = 'palette'; color = '#ff9a00';
            } else if (['dwg', 'dxf'].includes(ext)) {
              type = 'app'; icon = 'terminal'; color = '#ef4444';
            } else if (['skp'].includes(ext)) {
              type = 'app'; icon = 'palette'; color = '#dc2626';
            } else if (['mp4', 'mkv', 'mov', 'avi', 'webm'].includes(ext)) {
              type = 'video'; icon = 'video'; color = '#f43f5e';
            } else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'xlsx', 'pptx'].includes(ext)) {
              type = 'docs'; icon = 'doc'; color = '#0284c7';
            }

            let targetCol = col + fIdx;
            let targetRow = row;
            if (occupied(targetCol, targetRow)) {
              let found = false;
              for (let dist = 1; dist < 20 && !found; dist++) {
                const offsets = [
                  [targetCol + dist, targetRow],
                  [targetCol, targetRow + dist],
                  [targetCol - dist, targetRow],
                  [targetCol, targetRow - dist]
                ];
                for (const [cc, rr] of offsets) {
                  if (cc >= 0 && rr >= 0 && !occupied(cc, rr)) {
                    targetCol = cc;
                    targetRow = rr;
                    found = true;
                    break;
                  }
                }
              }
            }

            const dropX = paddingX + targetCol * stepX;
            const dropY = paddingY + targetRow * stepY;

            const realPath = getFilePath(file);
            this.themeEngine.addIconToFence(fenceId, {
              id: 'file-drop-' + Date.now() + '-' + fIdx + '-' + Math.random().toString(36).substr(2, 4),
              name: fileName,
              type: type,
              icon: icon,
              color: color,
              thumbnail: thumbnail,
              path: realPath || file.path || '',
              x: dropX,
              y: dropY
            });
            currentIcons.push({ x: dropX, y: dropY });
          }

          this.renderFencesOnly();
          return;
        }

        // Case B: In-app drag and drop (application/json)
        try {
          const raw = e.dataTransfer.getData('application/json');
          if (!raw) return;
          const data = JSON.parse(raw);

          // SUBCASE B1: MULTI-ITEM DROP
          if (data.isMulti && data.items && data.items.length > 1) {
            audioEngine.playStartup();
            const targetPrimaryCol = col;
            const targetPrimaryRow = row;

            const primItem = data.items.find(i => i.id === data.primaryId) || data.items[0];
            const primOrigCol = Math.round((primItem.x - paddingX) / stepX);
            const primOrigRow = Math.round((primItem.y - paddingY) / stepY);

            if (data.fromFenceId && data.fromFenceId !== fenceId) {
              data.items.forEach(it => {
                this.themeEngine.removeIconFromFence(data.fromFenceId, it.id);
              });
            } else if (data.source === 'desktop') {
              data.items.forEach(it => {
                this.themeEngine.removeDesktopIcon(it.id);
              });
              this.renderDesktopIconsOnly();
            }

            const currentFenceState = (this.themeEngine.getState().desktopFences || []).find(f => f.id === fenceId);
            const remainingIcons = (currentFenceState && currentFenceState.icons) 
              ? currentFenceState.icons.filter(ic => !data.items.some(di => di.id === ic.id || ((di.name || '').trim().toLowerCase() === (ic.name || '').trim().toLowerCase())))
              : [];

            const isSlotTaken = (c, r) => remainingIcons.some(ic => {
              if (ic.x == null || ic.y == null) return false;
              const icC = Math.round((ic.x - paddingX) / stepX);
              const icR = Math.round((ic.y - paddingY) / stepY);
              return icC === c && icR === r;
            });

            data.items.forEach(it => {
              const origC = Math.round((it.x - paddingX) / stepX);
              const origR = Math.round((it.y - paddingY) / stepY);
              const deltaC = origC - primOrigCol;
              const deltaR = origR - primOrigRow;

              let itCol = Math.max(0, targetPrimaryCol + deltaC);
              let itRow = Math.max(0, targetPrimaryRow + deltaR);

              if (isSlotTaken(itCol, itRow)) {
                let found = false;
                for (let d = 1; d < 20 && !found; d++) {
                  for (const [dc, dr] of [[d, 0], [0, d], [-d, 0], [0, -d], [d, d]]) {
                    const testC = itCol + dc;
                    const testR = itRow + dr;
                    if (testC >= 0 && testR >= 0 && !isSlotTaken(testC, testR)) {
                      itCol = testC;
                      itRow = testR;
                      found = true;
                      break;
                    }
                  }
                }
              }

              const newX = paddingX + itCol * stepX;
              const newY = paddingY + itRow * stepY;

              const itNormName = (it.name || '').trim().toLowerCase();
              const existInFence = (currentFenceState && currentFenceState.icons)
                ? currentFenceState.icons.find(ic => ic.id === it.id || ((ic.name || '').trim().toLowerCase() === itNormName))
                : null;

              if (existInFence || data.fromFenceId === fenceId) {
                const targetId = existInFence ? existInFence.id : it.id;
                this.themeEngine.updateIconInFence(fenceId, targetId, { x: newX, y: newY });
              } else {
                this.themeEngine.addIconToFence(fenceId, {
                  id: it.id,
                  name: it.name,
                  type: it.type,
                  icon: it.icon,
                  color: it.color,
                  thumbnail: it.thumbnail,
                  x: newX,
                  y: newY
                });
              }

              remainingIcons.push({ x: newX, y: newY });
            });

            this.renderFencesOnly();
            return;
          }

          // SUBCASE B2: SINGLE ITEM DROP
          const currentIcons = (fence && fence.icons) ? fence.icons : [];
          const normDataName = (data.name || '').trim().toLowerCase();
          
          // Strict check: Is this icon already inside this fence (by id or by exact name)?
          const existingInFence = currentIcons.find(i => 
            (data.id && i.id === data.id) || 
            (normDataName && (i.name || '').trim().toLowerCase() === normDataName)
          );

          const otherIcons = currentIcons.filter(i => i !== existingInFence && (!data.id || i.id !== data.id));
          const isOccupied = (c, r) => otherIcons.some(i => {
            if (i.x === undefined || i.y === undefined || i.x === null || i.y === null) return false;
            const icC = Math.round((i.x - paddingX) / stepX);
            const icR = Math.round((i.y - paddingY) / stepY);
            return icC === c && icR === r;
          });

          const isSameFence = existingInFence || (data.source === 'fence' && (!data.fromFenceId || data.fromFenceId === fenceId));
          const targetId = existingInFence ? existingInFence.id : data.id;

          // If moving within the same fence, user has complete freedom to position anywhere!
          if (isSameFence) {
            audioEngine.playClick();
            const dropX = paddingX + col * stepX;
            const dropY = paddingY + row * stepY;

            // If the targeted slot is already occupied, swap their positions!
            const occupant = otherIcons.find(i => {
              if (i.x === undefined || i.y === undefined || i.x === null || i.y === null) return false;
              const icC = Math.round((i.x - paddingX) / stepX);
              const icR = Math.round((i.y - paddingY) / stepY);
              return icC === col && icR === row;
            });

            if (occupant && existingInFence && existingInFence.x != null && existingInFence.y != null) {
              this.themeEngine.updateIconInFence(fenceId, occupant.id, { x: existingInFence.x, y: existingInFence.y });
            }
            this.themeEngine.updateIconInFence(fenceId, targetId, { x: dropX, y: dropY });
            this.renderFencesOnly();
            return;
          }

          if (isOccupied(col, row)) {
            let found = false;
            for (let dist = 1; dist < 20 && !found; dist++) {
              const offsets = [
                [col + dist, row],
                [col, row + dist],
                [col - dist, row],
                [col, row - dist]
              ];
              for (const [cc, rr] of offsets) {
                if (cc >= 0 && rr >= 0 && !isOccupied(cc, rr)) {
                  col = cc;
                  row = rr;
                  found = true;
                  break;
                }
              }
            }
          }

          const dropX = paddingX + col * stepX;
          const dropY = paddingY + row * stepY;

          // If moving from another drawer
          if (data.source === 'fence' && data.fromFenceId && data.fromFenceId !== fenceId) {
            this.themeEngine.removeIconFromFence(data.fromFenceId, data.id);
          } else if (data.source === 'desktop') {
            this.themeEngine.removeDesktopIcon(data.id);
            this.renderDesktopIconsOnly();
          }

          audioEngine.playStartup();
          this.themeEngine.addIconToFence(fenceId, {
            id: data.id || ('f-' + Date.now()),
            name: data.name,
            type: data.type || 'docs',
            icon: data.icon || data.type || 'doc',
            color: data.color || '#3b82f6',
            thumbnail: data.thumbnail || null,
            customIcon: data.customIcon || null,
            isShortcut: !!data.isShortcut,
            exe: data.exe || '',
            path: data.path || '',
            app: data.app || '',
            x: dropX,
            y: dropY
          });
          this.renderFencesOnly();
        } catch (err) {
          console.error('Drop error', err);
        }
      };
    });
  }

  bindExplorerMarquee() {
    const contentArea = document.getElementById('explorer-content-area');
    if (!contentArea || this._explorerMarqueeBound) return;
    this._explorerMarqueeBound = true;

    contentArea.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('.file-item') || e.target.closest('button') || e.target.closest('input') || e.target.closest('.path-bar')) return;

      const areaRect = contentArea.getBoundingClientRect();
      const originClientX = e.clientX;
      const originClientY = e.clientY;
      const startX = e.clientX - areaRect.left + contentArea.scrollLeft;
      const startY = e.clientY - areaRect.top + contentArea.scrollTop;

      const initialSelectedPaths = new Set();
      if (!e.ctrlKey && !e.shiftKey) {
        contentArea.querySelectorAll('.file-item.is-selected').forEach(el => el.classList.remove('is-selected'));
      } else {
        contentArea.querySelectorAll('.file-item.is-selected').forEach(el => initialSelectedPaths.add(el.dataset.path));
      }

      let selBox = null;
      let hasMoved = false;

      const onMouseMove = (moveEvt) => {
        const dist = Math.hypot(moveEvt.clientX - originClientX, moveEvt.clientY - originClientY);
        if (!hasMoved && dist > 4) {
          hasMoved = true;
          selBox = document.createElement('div');
          selBox.className = 'explorer-selection-box';
          contentArea.appendChild(selBox);
        }

        if (hasMoved && selBox) {
          const curX = moveEvt.clientX - areaRect.left + contentArea.scrollLeft;
          const curY = moveEvt.clientY - areaRect.top + contentArea.scrollTop;

          const boxLeft = Math.min(startX, curX);
          const boxTop = Math.min(startY, curY);
          const boxWidth = Math.abs(curX - startX);
          const boxHeight = Math.abs(curY - startY);

          selBox.style.left = `${boxLeft}px`;
          selBox.style.top = `${boxTop}px`;
          selBox.style.width = `${boxWidth}px`;
          selBox.style.height = `${boxHeight}px`;

          contentArea.querySelectorAll('.file-item').forEach(item => {
            const iL = item.offsetLeft;
            const iT = item.offsetTop;
            const iW = item.offsetWidth;
            const iH = item.offsetHeight;

            const intersects = (
              boxLeft < iL + iW &&
              boxLeft + boxWidth > iL &&
              boxTop < iT + iH &&
              boxTop + boxHeight > iT
            );

            if (intersects) {
              item.classList.add('is-selected');
            } else if (!initialSelectedPaths.has(item.dataset.path)) {
              item.classList.remove('is-selected');
            }
          });
        }
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        if (selBox && selBox.parentNode) {
          selBox.remove();
          selBox = null;
        }
        if (hasMoved) {
          audioEngine.playClick();
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }
}

