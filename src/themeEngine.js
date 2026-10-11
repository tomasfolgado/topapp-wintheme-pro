// TopApp WinTheme Pro - Core Theme Engine
// Handles state, presets, smooth gradients, real-time CSS variable bindings, and persistence

export const SMOOTH_GRADIENTS = [
  {
    id: 'tochka-charcoal',
    name: 'Tochka Slate Minimal',
    subtitle: 'Degradado mate ultra suave estilo editorial',
    css: 'linear-gradient(180deg, #222631 0%, #181b23 100%)',
    c1: '#222631',
    c2: '#181b23',
    angle: 180
  },
  {
    id: 'obsidian-smooth',
    name: 'Obsidian Pure Smooth',
    subtitle: 'Carbón profundo liso con matiz neutral',
    css: 'linear-gradient(135deg, #1f2128 0%, #131418 100%)',
    c1: '#1f2128',
    c2: '#131418',
    angle: 135
  },
  {
    id: 'petrol-slate',
    name: 'Petrol Slate Minimal',
    subtitle: 'Grafito con toque cian petróleo muy tenue',
    css: 'linear-gradient(180deg, #1b242c 0%, #11171d 100%)',
    c1: '#1b242c',
    c2: '#11171d',
    angle: 180
  },
  {
    id: 'nordic-mist',
    name: 'Nordic Mist Clean',
    subtitle: 'Gris escandinavo ultra mate y limpio',
    css: 'linear-gradient(160deg, #282c37 0%, #1d2028 100%)',
    c1: '#282c37',
    c2: '#1d2028',
    angle: 160
  },
  {
    id: 'deep-dusk',
    name: 'Deep Dusk Charcoal',
    subtitle: 'Sombra suave con sutil calidez nocturna',
    css: 'linear-gradient(180deg, #24212c 0%, #16141d 100%)',
    c1: '#24212c',
    c2: '#16141d',
    angle: 180
  },
  {
    id: 'warm-graphite',
    name: 'Warm Espresso Minimal',
    subtitle: 'Grafito oscuro sobrio y liso',
    css: 'linear-gradient(180deg, #252322 0%, #171615 100%)',
    c1: '#252322',
    c2: '#171615',
    angle: 180
  },
  {
    id: 'nordic-frost-light',
    name: 'Nordic Frost (Claro)',
    subtitle: 'Gris perla y blanco escandinavo mate',
    css: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    c1: '#f8fafc',
    c2: '#e2e8f0',
    angle: 180
  },
  {
    id: 'pure-silver-light',
    name: 'Silver Mist (Claro)',
    subtitle: 'Blanco puro con sutil degradado plateado',
    css: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
    c1: '#ffffff',
    c2: '#e2e8f0',
    angle: 135
  }
];

export const THEME_PRESETS = {
  'minimal-tochka': {
    name: 'Minimal Editorial (Tochka)',
    subtitle: 'Estilo analítico profesional y compacto',
    primary: '#00e5db', // Electric Cyan
    secondary: '#ff7043', // Vibrant Coral
    gradient: 'linear-gradient(135deg, #00e5db 0%, #00b4d8 100%)',
    glow: 'rgba(0, 229, 219, 0.35)',
    rgb: '0, 229, 219',
    wallpaper: '/wallpapers/aurora_glass.jpg',
    wallpaperType: 'gradient',
    smoothGradient: 'linear-gradient(180deg, #222631 0%, #181b23 100%)',
    liveWallpaperId: 'aurora-waves',
    glassBlur: 14,
    glassOpacity: 0.88,
    mode: 'dark',
    badge: 'Por Defecto (Tochka)'
  },
  'nordic-frost': {
    name: 'Nordic Frost (Modo Claro)',
    subtitle: 'Minimalismo escandinavo blanco & azul glaciar',
    primary: '#0284c7', // Sky Azure
    secondary: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    glow: 'rgba(2, 132, 199, 0.25)',
    rgb: '2, 132, 199',
    wallpaper: '/wallpapers/aurora_glass.jpg',
    wallpaperType: 'gradient',
    smoothGradient: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    liveWallpaperId: 'aurora-waves',
    glassBlur: 16,
    glassOpacity: 0.92,
    mode: 'light',
    badge: 'Modo Claro'
  },
  'azure-glass': {
    name: 'Azure Glass',
    subtitle: 'Fluent Holographic Aero',
    primary: '#00d2ff',
    secondary: '#0078d4',
    gradient: 'linear-gradient(135deg, #00d2ff 0%, #0078d4 100%)',
    glow: 'rgba(0, 210, 255, 0.45)',
    rgb: '0, 210, 255',
    wallpaper: '/wallpapers/aurora_glass.jpg',
    wallpaperType: 'image',
    smoothGradient: 'linear-gradient(180deg, #1b242c 0%, #11171d 100%)',
    liveWallpaperId: 'aurora-waves',
    glassBlur: 24,
    glassOpacity: 0.65,
    mode: 'dark',
    badge: 'Popular'
  },
  'obsidian-amethyst': {
    name: 'Obsidian Amethyst',
    subtitle: 'Deep Dark Refraction',
    primary: '#c084fc',
    secondary: '#7928ca',
    gradient: 'linear-gradient(135deg, #c084fc 0%, #7928ca 100%)',
    glow: 'rgba(192, 132, 252, 0.45)',
    rgb: '192, 132, 252',
    wallpaper: '/wallpapers/obsidian_prism.jpg',
    wallpaperType: 'image',
    smoothGradient: 'linear-gradient(135deg, #1f2128 0%, #131418 100%)',
    liveWallpaperId: 'cyber-grid',
    glassBlur: 28,
    glassOpacity: 0.72,
    mode: 'oled',
    badge: 'Neo-Dark'
  },
  'cyber-emerald': {
    name: 'Cyber Emerald',
    subtitle: 'Quantum Bioluminescent',
    primary: '#00f5a0',
    secondary: '#00d9e9',
    gradient: 'linear-gradient(135deg, #00f5a0 0%, #00d9e9 100%)',
    glow: 'rgba(0, 245, 160, 0.4)',
    rgb: '0, 245, 160',
    wallpaper: '/wallpapers/neon_cyber.jpg',
    wallpaperType: 'image',
    smoothGradient: 'linear-gradient(180deg, #1b242c 0%, #11171d 100%)',
    liveWallpaperId: 'glass-orbs',
    glassBlur: 20,
    glassOpacity: 0.6,
    mode: 'dark',
    badge: 'High Tech'
  },
  'solar-amber': {
    name: 'Solar Amber',
    subtitle: 'Warm Radiant Sunset',
    primary: '#ff9a3c',
    secondary: '#ff6f3c',
    gradient: 'linear-gradient(135deg, #ff9a3c 0%, #ff6f3c 100%)',
    glow: 'rgba(255, 154, 60, 0.45)',
    rgb: '255, 154, 60',
    wallpaper: '/wallpapers/aurora_glass.jpg',
    wallpaperType: 'image',
    smoothGradient: 'linear-gradient(180deg, #252322 0%, #171615 100%)',
    liveWallpaperId: 'aurora-waves',
    glassBlur: 24,
    glassOpacity: 0.65,
    mode: 'dark',
    badge: 'Warm'
  },
  'electric-neon': {
    name: 'Electric Neon',
    subtitle: 'Cyberpunk Synthwave',
    primary: '#f72585',
    secondary: '#4361ee',
    gradient: 'linear-gradient(135deg, #f72585 0%, #4361ee 100%)',
    glow: 'rgba(247, 37, 133, 0.45)',
    rgb: '247, 37, 133',
    wallpaper: '/wallpapers/obsidian_prism.jpg',
    wallpaperType: 'image',
    smoothGradient: 'linear-gradient(180deg, #24212c 0%, #16141d 100%)',
    liveWallpaperId: 'cyber-grid',
    glassBlur: 30,
    glassOpacity: 0.75,
    mode: 'oled',
    badge: 'Synth'
  }
};

class ThemeEngine {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadInitialState();
    this.applyThemeToDOM();
  }

  loadInitialState() {
    // Default to the new Tochka Minimal Editorial preset!
    const preset = THEME_PRESETS['minimal-tochka'];
    const defaultState = {
      activePresetKey: 'minimal-tochka',
      presetName: preset.name,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      primaryRgb: preset.rgb,
      glowColor: preset.glow,
      mode: preset.mode, // 'dark', 'oled', 'light'
      glassBlur: preset.glassBlur,
      glassOpacity: preset.glassOpacity,
      glassBorders: true,
      glowIntensity: 0.7,
      cornerRadius: 10,
      
      // Wallpaper & Smooth Gradients
      wallpaperType: 'gradient', // 'gradient', 'image', 'live'
      wallpaperSrc: preset.wallpaper,
      smoothGradient: preset.smoothGradient,
      gradientAngle: 180,
      gradientColor1: '#222631',
      gradientColor2: '#181b23',
      liveWallpaperId: preset.liveWallpaperId,
      liveSpeed: 1.0,

      taskbarStyle: 'win11-center', // 'win11-center', 'win10-left', 'floating-island'
      soundScheme: 'crystal',
      soundVolume: 0.75,
      soundMuted: false,

      // Compact System Controls & Hardware Status
      volume: 75,
      isMuted: false,
      wifiEnabled: true,
      wifiSSID: 'Wi-Fi 6 Pro (5 GHz)',
      wifiDownloadSpeed: '420 Mbps',
      wifiUploadSpeed: '115 Mbps',
      bluetoothEnabled: true,
      bluetoothDevice: 'Sony WH-1000XM5',
      ethernetConnected: true,
      ethernetIP: '192.168.1.142',
      
      // Printer & Live Print Progress
      printerStatus: 'idle', // 'idle', 'printing', 'paused'
      printerName: 'Impresora de Windows',
      printJob: {
        docName: 'Sin trabajos en cola (Lista)',
        totalPages: 0,
        currentPage: 0,
        percent: 0,
        speedPpm: 0
      },

      // CPU Multi-Core status (16 cores array)
      coresCount: 16,
      coresLoad: [18, 42, 12, 65, 28, 15, 33, 50, 22, 19, 44, 30, 16, 58, 26, 38],

      // RAM specs & Liberar RAM state
      ramTotalGB: 16.0,
      ramUsedGB: 5.6,
      ramCachedGB: 3.2,
      ramHistory: [32, 34, 36, 35, 38, 37, 36, 35, 34, 35],
      isPurgingRam: false,

      // Battery status & telemetry
      batteryLevel: 94,
      batteryCharging: true,
      batteryTimeRemaining: '5h 48m',
      batteryPowerMode: 'Mejor rendimiento', // 'Ahorro', 'Equilibrado', 'Mejor rendimiento'
      batteryHealth: 100,
      batteryCycles: 42,
      batteryHistory: [96, 95, 95, 94, 94, 95, 94, 94, 94, 94],

      // Network Traffic I/O Telemetry (Professional Live Bandwidth Monitor)
      netDownSpeed: 42.8,
      netUpSpeed: 12.4,
      netPingMs: 11,
      netDownHistory: [28, 35, 42, 38, 45, 52, 48, 42, 44, 43],
      netUpHistory: [8, 10, 14, 11, 12, 16, 13, 11, 12, 12],

      // Storage NVMe Telemetry
      storageUsedGB: 1180,
      storageTotalGB: 2000,
      storageReadMB: 6850,
      storageWriteMB: 5100,

      // Temperature telemetry (Equal prominence for CPU & GPU)
      cpuTemp: 44,
      gpuTemp: 41,
      fanSpeedRPM: 1420,
      cpuTempHistory: [44, 45, 43, 44, 46, 45, 44, 45, 44, 44],
      gpuTempHistory: [40, 41, 40, 42, 41, 40, 41, 40, 41, 41],
      tempHistory: [42, 43, 45, 44, 46, 45, 44, 45, 44, 44],

      // Customizable Widgets Order and Visibility (Including DateTime Dual Squares, Battery, and Network)
      widgetOrder: ['datetime', 'battery', 'network', 'ram', 'thermals', 'audio', 'cores', 'connectivity', 'printer', 'search'],
      visibleWidgets: {
        datetime: true,
        battery: true,
        network: true,
        ram: true,
        thermals: true,
        audio: true,
        cores: true,
        connectivity: true,
        printer: true,
        search: true
      },

      // File Search Filter
      activeSearchFilter: 'all', // 'all', 'images', 'videos', 'docs', 'pdf', 'audio', 'code'
      searchQuery: '',

      // macOS Style Customizable Dock Applications (includes Finder/Carpeta and Papelera)
      dockApps: [
        { id: 'finder', name: 'Carpeta', icon: 'finder', color: '#2563eb', isRunning: true },
        { id: 'safari', name: 'Safari', icon: 'safari', color: '#0284c7', isRunning: false },
        { id: 'terminal', name: 'Terminal', icon: 'terminal', color: '#0f172a', isRunning: true },
        { id: 'code', name: 'VS Code', icon: 'code', color: '#0284c7', isRunning: true },
        { id: 'spotify', name: 'Spotify', icon: 'spotify', color: '#10b981', isRunning: false },
        { id: 'photos', name: 'Fotos', icon: 'photos', color: '#e11d48', isRunning: false },
        { id: 'settings', name: 'Ajustes', icon: 'settings', color: '#475569', isRunning: false },
        { id: 'trash', name: 'Papelera', icon: 'trash', color: '#334155', isRunning: false }
      ],
      customWallpaper: null,

      // Windows Taskbar / Start Bar Visibility (Por defecto una vez activado el tema NO aparecerá)
      showWindowsTaskbar: false,

      // PRO Dock Configuration (Icon size, gap, wave magnification, presentation mode, alignment)
      dockConfig: {
        iconSize: 38,
        iconGap: 7,
        waveEnabled: true,
        waveScale: 1.45,
        waveRadius: 90,
        presentationMode: 'floating', // 'floating', 'pinned-bar', 'minimal'
        alignment: 'center', // 'center', 'left', 'right'
        autoHide: false,
        indicatorStyle: 'dot' // 'dot', 'line', 'glow'
      },

      // Desktop Icon Stash / Fences (Square boxes with rounded corners for grouping icons)
      // Movable Desktop Icons (Snap to Desktop Grid)
      desktopIcons: [
        { id: 'd-thispc', app: 'thispc', name: 'Macintosh HD', type: 'disk', color: '#3b82f6', x: 16, y: 52 },
        { id: 'd-explorer', app: 'explorer', name: 'Proyectos', type: 'folder', color: '#06b6d4', x: 16, y: 146 },
        { id: 'd-terminal', app: 'terminal', name: 'Terminal', type: 'terminal', color: '#0f172a', x: 16, y: 240 },
        { id: 'd-theme-settings', app: 'theme-settings', name: 'Tema Pro', type: 'palette', color: '#ea580c', x: 16, y: 334 },
        { id: 'd-group', app: 'create-group', name: 'Grupo', type: 'fence', color: '#00e5db', isPermanent: true, x: 16, y: 428 }
      ],

      desktopFences: [
        {
          id: 'fence-1',
          title: 'Proyectos & Trabajo',
          x: 95,
          y: 35,
          w: 480,
          h: 280,
          isPinned: true, // Fijado en el escritorio como cajón posado
          iconSize: 'medium', // 'small', 'medium', 'large'
          iconGap: 10,
          icons: [
            { id: 'f-item-1', name: 'Documento Q4.pdf', type: 'pdf', icon: 'doc', color: '#0284c7' },
            { id: 'f-item-2', name: 'Photoshop CC.psd', type: 'app', icon: 'palette', color: '#001e36' },
            { id: 'f-item-3', name: 'CorelDRAW 2026.cdr', type: 'app', icon: 'palette', color: '#047857' },
            { id: 'f-item-dwg', name: 'AutoCAD Planta 2026.dwg', type: 'app', icon: 'terminal', color: '#ef4444' },
            { id: 'f-item-skp', name: 'Edificio 3D Modelo.skp', type: 'app', icon: 'palette', color: '#dc2626' },
            { id: 'f-item-video', name: 'Video Render 4K.mp4', type: 'video', icon: 'video', color: '#f43f5e' },
            { id: 'f-item-4', name: 'Wallpaper 8K.jpg', type: 'images', icon: 'image', color: '#ff7043', thumbnail: '/wallpapers/aurora_glass.jpg' },
            { id: 'f-item-5', name: 'Arquitectura.ts', type: 'code', icon: 'code', color: '#10b981' },
            { id: 'f-item-6', name: 'Audio Chime.wav', type: 'audio', icon: 'audio', color: '#8b5cf6' }
          ]
        }
      ]
    };

    const saved = localStorage.getItem('topapp_wintheme_state_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...defaultState, ...parsed };

        // Ensure newly introduced widgets are present in widgetOrder
        if (Array.isArray(merged.widgetOrder)) {
          const requiredWidgets = ['datetime', 'battery', 'network'];
          requiredWidgets.forEach(w => {
            if (!merged.widgetOrder.includes(w)) {
              merged.widgetOrder.unshift(w);
            }
          });
        } else {
          merged.widgetOrder = defaultState.widgetOrder;
        }

        merged.visibleWidgets = {
          ...defaultState.visibleWidgets,
          ...(merged.visibleWidgets || {})
        };

        merged.dockConfig = {
          ...defaultState.dockConfig,
          ...(merged.dockConfig || {})
        };

        // Reset fake printer demo loop to real idle status
        merged.printerStatus = 'idle';
        merged.printJob = { docName: 'Sin trabajos en cola', totalPages: 0, currentPage: 0, percent: 0 };

        if (!Array.isArray(merged.desktopIcons) || merged.desktopIcons.length === 0) {
          merged.desktopIcons = defaultState.desktopIcons;
        } else {
          const hasGroup = merged.desktopIcons.some(i => i.id === 'd-group' || i.app === 'create-group');
          if (!hasGroup) {
            merged.desktopIcons.push({
              id: 'd-group',
              app: 'create-group',
              name: 'Grupo',
              type: 'fence',
              color: '#00e5db',
              isPermanent: true,
              x: 16,
              y: 428
            });
          }
        }

        if (!Array.isArray(merged.desktopFences) || merged.desktopFences.length === 0) {
          merged.desktopFences = defaultState.desktopFences;
        } else {
          merged.desktopFences.forEach(f => {
            if (f.isPinned === undefined) f.isPinned = false;
            if (!Array.isArray(f.icons)) f.icons = [];
            const hasCorel = f.icons.some(i => (i.name || '').toLowerCase().includes('corel'));
            if (!hasCorel) {
              f.icons.push({ id: 'f-item-cdr', name: 'CorelDRAW 2026.cdr', type: 'app', icon: 'palette', color: '#047857' });
            }
            const hasPdf = f.icons.some(i => (i.name || '').toLowerCase().includes('pdf'));
            if (!hasPdf) {
              f.icons.push({ id: 'f-item-pdf', name: 'Documento Q4.pdf', type: 'pdf', icon: 'doc', color: '#0284c7' });
            }
            const hasDwg = f.icons.some(i => (i.name || '').toLowerCase().includes('.dwg') || (i.name || '').toLowerCase().includes('autocad'));
            if (!hasDwg) {
              f.icons.push({ id: 'f-item-dwg', name: 'AutoCAD Planta 2026.dwg', type: 'app', icon: 'terminal', color: '#ef4444' });
            }
            const hasSkp = f.icons.some(i => (i.name || '').toLowerCase().includes('.skp') || (i.name || '').toLowerCase().includes('sketchup'));
            if (!hasSkp) {
              f.icons.push({ id: 'f-item-skp', name: 'Edificio 3D Modelo.skp', type: 'app', icon: 'palette', color: '#dc2626' });
            }
            const hasVideo = f.icons.some(i => (i.name || '').toLowerCase().includes('.mp4') || (i.name || '').toLowerCase().includes('video'));
            if (!hasVideo) {
              f.icons.push({ id: 'f-item-video', name: 'Video Render 4K.mp4', type: 'video', icon: 'video', color: '#f43f5e' });
            }

            // Deduplicate icons in this fence (prefer the one with explicit grid coordinates if duplicate names exist)
            const iconMap = new Map();
            f.icons.forEach(ic => {
              const normKey = (ic.name || '').trim().toLowerCase();
              if (!iconMap.has(normKey)) {
                iconMap.set(normKey, ic);
              } else {
                const current = iconMap.get(normKey);
                // If the new one has explicit x and y coordinates, keep it instead
                if ((current.x == null || current.y == null) && (ic.x != null && ic.y != null)) {
                  iconMap.set(normKey, ic);
                }
              }
            });
            f.icons = Array.from(iconMap.values());

            // Hydrate missing thumbnails for existing image files (such as e1af files uploaded previously)
            f.icons.forEach(ic => {
              if (!ic.thumbnail) {
                const n = (ic.name || '').toLowerCase();
                if (n.includes('wallpaper') || n.includes('8k') || n.includes('foto') || n.includes('e1af') || ic.type === 'images') {
                  ic.thumbnail = '/wallpapers/aurora_glass.jpg';
                }
              }
            });
          });
        }

        if (merged.showWindowsTaskbar === undefined) {
          merged.showWindowsTaskbar = false;
        }

        return merged;
      } catch (e) {
        console.error('Error parsing stored theme state', e);
      }
    }
    return defaultState;
  }

  toggleWindowsTaskbar() {
    this.state.showWindowsTaskbar = !this.state.showWindowsTaskbar;
    this.saveState();
    this.notify();
    return this.state.showWindowsTaskbar;
  }

  setWindowsTaskbarVisibility(visible) {
    this.state.showWindowsTaskbar = !!visible;
    this.saveState();
    this.notify();
  }

  toggleFencePin(fenceId) {
    if (!this.state.desktopFences) return;
    const fence = this.state.desktopFences.find(f => f.id === fenceId);
    if (fence) {
      fence.isPinned = !fence.isPinned;
      this.saveState();
      this.notify();
      return fence.isPinned;
    }
  }

  setFencePin(fenceId, isPinned) {
    if (!this.state.desktopFences) return;
    const fence = this.state.desktopFences.find(f => f.id === fenceId);
    if (fence) {
      fence.isPinned = !!isPinned;
      this.saveState();
      this.notify();
    }
  }

  moveWidget(widgetId, direction) {
    if (!this.state.widgetOrder) {
      this.state.widgetOrder = ['datetime', 'battery', 'network', 'ram', 'thermals', 'audio', 'cores', 'connectivity', 'printer', 'search'];
    }
    const list = [...this.state.widgetOrder];
    const idx = list.indexOf(widgetId);
    if (idx === -1) return;
    if (direction === 'up' && idx > 0) {
      const temp = list[idx - 1];
      list[idx - 1] = list[idx];
      list[idx] = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx + 1];
      list[idx + 1] = list[idx];
      list[idx] = temp;
    }
    this.state.widgetOrder = list;
    this.saveState();
    this.notify();
  }

  toggleWidgetVisible(widgetId, isVisible = null) {
    if (!this.state.visibleWidgets) {
      this.state.visibleWidgets = { ram: true, thermals: true, audio: true, cores: true, connectivity: true, printer: true, search: true };
    }
    const current = this.state.visibleWidgets[widgetId] !== false;
    this.state.visibleWidgets[widgetId] = isVisible !== null ? isVisible : !current;
    this.saveState();
    this.notify();
  }

  addDockApp(app) {
    if (!this.state.dockApps) this.state.dockApps = [];
    this.state.dockApps.push({
      id: 'app-' + Date.now(),
      name: app.name || 'Nueva App',
      icon: app.icon || 'star',
      color: app.color || '#00e5db',
      customIcon: app.customIcon || null,
      exe: app.exe || '',
      path: app.path || '',
      isRunning: false
    });
    this.saveState();
    this.notify();
  }

  removeDockApp(id) {
    if (!this.state.dockApps) return;
    this.state.dockApps = this.state.dockApps.filter(a => a.id !== id);
    this.saveState();
    this.notify();
  }

  moveDockApp(id, direction) {
    if (!this.state.dockApps) return;
    const idx = this.state.dockApps.findIndex(a => a.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= this.state.dockApps.length) return;
    const temp = this.state.dockApps[idx];
    this.state.dockApps[idx] = this.state.dockApps[targetIdx];
    this.state.dockApps[targetIdx] = temp;
    this.saveState();
    this.notify();
  }

  // Desktop Fences / Icon Stash Management
  addDesktopFence(fence = {}) {
    if (!this.state.desktopFences) this.state.desktopFences = [];
    const count = this.state.desktopFences.length + 1;
    const newFence = {
      id: 'fence-' + Date.now(),
      title: fence.title || `Grupo ${count}`,
      x: fence.x !== undefined ? fence.x : (100 + (count - 1) * 35),
      y: fence.y !== undefined ? fence.y : (50 + (count - 1) * 35),
      w: fence.w || 480, // +200px wider as requested
      h: fence.h || 260,
      isPinned: fence.isPinned || false,
      iconSize: fence.iconSize || 'medium',
      iconGap: fence.iconGap || 10,
      icons: fence.icons || []
    };
    this.state.desktopFences.push(newFence);
    this.saveState();
    this.notify();
    return newFence;
  }

  updateDesktopFence(fenceId, patch) {
    if (!this.state.desktopFences) return;
    const idx = this.state.desktopFences.findIndex(f => f.id === fenceId);
    if (idx !== -1) {
      this.state.desktopFences[idx] = { ...this.state.desktopFences[idx], ...patch };
      this.saveState();
      this.notify();
    }
  }

  removeDesktopFence(fenceId) {
    if (!this.state.desktopFences) return;
    this.state.desktopFences = this.state.desktopFences.filter(f => f.id !== fenceId);
    this.saveState();
    this.notify();
  }

  addIconToFence(fenceId, iconData) {
    if (!this.state.desktopFences) return;
    const fence = this.state.desktopFences.find(f => f.id === fenceId);
    if (fence) {
      if (!fence.icons) fence.icons = [];
      const normName = (iconData.name || '').trim().toLowerCase();
      const existing = fence.icons.find(i => 
        (iconData.id && i.id === iconData.id) || 
        (normName && (i.name || '').trim().toLowerCase() === normName)
      );
      if (existing) {
        if (iconData.x !== undefined) existing.x = iconData.x;
        if (iconData.y !== undefined) existing.y = iconData.y;
        if (iconData.thumbnail !== undefined && iconData.thumbnail !== null) existing.thumbnail = iconData.thumbnail;
        if (iconData.type !== undefined) existing.type = iconData.type;
        if (iconData.icon !== undefined) existing.icon = iconData.icon;
        if (iconData.color !== undefined) existing.color = iconData.color;
      } else {
        fence.icons.push({
          id: iconData.id || ('f-item-' + Date.now()),
          name: iconData.name || 'Archivo',
          type: iconData.type || 'docs',
          icon: iconData.icon || 'doc',
          color: iconData.color || '#00e5db',
          thumbnail: iconData.thumbnail || null,
          x: iconData.x !== undefined ? iconData.x : null,
          y: iconData.y !== undefined ? iconData.y : null
        });
      }
      this.saveState();
      this.notify();
    }
  }

  updateIconInFence(fenceId, iconId, patch) {
    if (!this.state.desktopFences) return;
    const fence = this.state.desktopFences.find(f => f.id === fenceId);
    if (fence && fence.icons) {
      let idx = fence.icons.findIndex(i => i.id === iconId);
      if (idx === -1 && patch && patch.name) {
        const norm = patch.name.trim().toLowerCase();
        idx = fence.icons.findIndex(i => (i.name || '').trim().toLowerCase() === norm);
      }
      if (idx !== -1) {
        fence.icons[idx] = { ...fence.icons[idx], ...patch };
        this.saveState();
        this.notify();
      }
    }
  }

  removeIconFromFence(fenceId, iconId) {
    if (!this.state.desktopFences) return;
    const fence = this.state.desktopFences.find(f => f.id === fenceId);
    if (fence && fence.icons) {
      fence.icons = fence.icons.filter(i => i.id !== iconId && (i.name || '') !== iconId);
      this.saveState();
      this.notify();
    }
  }

  updateDesktopIcon(id, patch) {
    if (!this.state.desktopIcons) return;
    const idx = this.state.desktopIcons.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.state.desktopIcons[idx] = { ...this.state.desktopIcons[idx], ...patch };
      this.saveState();
      this.notify();
    }
  }

  addDesktopIcon(icon) {
    if (!this.state.desktopIcons) this.state.desktopIcons = [];
    this.state.desktopIcons.push(icon);
    this.saveState();
    this.notify();
  }

  removeDesktopIcon(id) {
    if (!this.state.desktopIcons) return;
    const item = this.state.desktopIcons.find(i => i.id === id);
    if (item && item.isPermanent) return; // Special permanent desktop icons cannot be deleted
    this.state.desktopIcons = this.state.desktopIcons.filter(i => i.id !== id);
    this.saveState();
    this.notify();
  }

  saveState() {
    try {
      localStorage.setItem('topapp_wintheme_state_v2', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Unable to persist to localStorage, attempting fallback without large media', e);
      try {
        const copy = { ...this.state };
        if (copy.customWallpaper && copy.customWallpaper.src && copy.customWallpaper.src.length > 500) {
          copy.customWallpaper = { ...copy.customWallpaper, src: '' };
        }
        localStorage.setItem('topapp_wintheme_state_v2', JSON.stringify(copy));
      } catch (e2) {}
    }
  }

  getState() {
    return { ...this.state };
  }

  update(patch) {
    this.state = { ...this.state, ...patch };
    this.saveState();
    this.applyThemeToDOM();
    this.notify();
  }

  setPreset(key) {
    const p = THEME_PRESETS[key];
    if (!p) return;
    this.state.activePresetKey = key;
    this.state.presetName = p.name;
    this.state.primaryColor = p.primary;
    this.state.secondaryColor = p.secondary;
    this.state.primaryRgb = p.rgb;
    this.state.glowColor = p.glow;
    this.state.mode = p.mode;
    this.state.glassBlur = p.glassBlur;
    this.state.glassOpacity = p.glassOpacity;
    this.state.wallpaperType = p.wallpaperType;
    this.state.wallpaperSrc = p.wallpaper;
    if (p.smoothGradient) {
      this.state.smoothGradient = p.smoothGradient;
    }
    this.state.liveWallpaperId = p.liveWallpaperId;
    this.saveState();
    this.applyThemeToDOM();
    this.notify();
  }

  setSmoothGradient(gradObj) {
    this.state.wallpaperType = 'gradient';
    this.state.smoothGradient = gradObj.css;
    this.state.gradientColor1 = gradObj.c1;
    this.state.gradientColor2 = gradObj.c2;
    this.state.gradientAngle = gradObj.angle;
    this.saveState();
    this.applyThemeToDOM();
    this.notify();
  }

  setCustomGradient(c1, c2, angle) {
    const css = `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
    this.state.wallpaperType = 'gradient';
    this.state.smoothGradient = css;
    this.state.gradientColor1 = c1;
    this.state.gradientColor2 = c2;
    this.state.gradientAngle = angle;
    this.saveState();
    this.applyThemeToDOM();
    this.notify();
  }

  setCustomWallpaper(dataUrlOrUrl, name) {
    this.state.wallpaperType = 'image';
    this.state.wallpaperSrc = dataUrlOrUrl;
    this.state.customWallpaper = {
      src: dataUrlOrUrl,
      name: name || 'Fondo Personalizado'
    };
    this.saveState();
    this.applyThemeToDOM();
    this.notify();
  }

  // Interactive RAM Purge (Liberar RAM)
  purgeRam() {
    this.state.isPurgingRam = true;
    this.notify();

    setTimeout(() => {
      // Simulate real RAM cache purge
      const freedAmount = (Math.random() * 1.2 + 0.8).toFixed(1); // Free ~1.2 GB
      this.state.ramUsedGB = Math.max(2.4, +(this.state.ramUsedGB - freedAmount).toFixed(1));
      this.state.ramCachedGB = Math.max(0.6, +(this.state.ramCachedGB - 1.0).toFixed(1));
      this.state.ramHistory.push(Math.round((this.state.ramUsedGB / this.state.ramTotalGB) * 100));
      if (this.state.ramHistory.length > 20) this.state.ramHistory.shift();
      this.state.isPurgingRam = false;
      this.saveState();
      this.notify();
      return freedAmount;
    }, 1200);
  }

  toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    this.saveState();
    this.notify();
  }

  setVolume(vol) {
    this.state.volume = vol;
    if (vol === 0) this.state.isMuted = true;
    else if (this.state.isMuted) this.state.isMuted = false;
    this.saveState();
    this.notify();
  }

  toggleWifi() {
    this.state.wifiEnabled = !this.state.wifiEnabled;
    this.saveState();
    this.notify();
  }

  toggleBluetooth() {
    this.state.bluetoothEnabled = !this.state.bluetoothEnabled;
    this.saveState();
    this.notify();
  }

  togglePrintPause() {
    if (this.state.printerStatus === 'printing') {
      this.state.printerStatus = 'paused';
    } else if (this.state.printerStatus === 'paused') {
      this.state.printerStatus = 'printing';
    }
    this.saveState();
    this.notify();
  }

  setSearchFilter(filterKey) {
    this.state.activeSearchFilter = filterKey;
    this.notify();
  }

  setSearchQuery(q) {
    this.state.searchQuery = q;
    this.notify();
  }

  setCustomColor(hex) {
    if (!hex) return;
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const rgb = `${r}, ${g}, ${b}`;
    const glow = `rgba(${rgb}, 0.4)`;

    this.state.activePresetKey = 'custom';
    this.state.presetName = 'Color Personalizado';
    this.state.primaryColor = hex;
    this.state.primaryRgb = rgb;
    this.state.glowColor = glow;

    this.saveState();
    this.applyThemeToDOM();
    this.notify();
  }

  resetToDefault() {
    this.setPreset('minimal-tochka');
  }

  applyThemeToDOM() {
    const root = document.documentElement;
    const body = document.body;

    const primary = this.state.primaryColor || '#00e5db';
    const secondary = this.state.secondaryColor || '#ff7043';
    const rgb = this.state.primaryRgb || '0, 229, 219';
    const glow = this.state.glowColor || `rgba(${rgb}, 0.35)`;

    // Variables on root
    root.style.setProperty('--win-accent', primary);
    root.style.setProperty('--win-accent-rgb', rgb);
    root.style.setProperty('--win-accent-secondary', secondary);
    root.style.setProperty('--win-accent-glow', glow);
    root.style.setProperty('--color-cyan', primary);
    root.style.setProperty('--color-coral', secondary);
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--glass-blur', `${this.state.glassBlur}px`);
    root.style.setProperty('--glass-opacity', this.state.glassOpacity);
    root.style.setProperty('--corner-radius', `${this.state.cornerRadius}px`);
    root.style.setProperty('--glow-multiplier', this.state.glowIntensity);
    root.style.setProperty('--smooth-gradient', this.state.smoothGradient);

    // Also set directly on body to override any specific class rules like theme-fluent-light
    body.style.setProperty('--win-accent', primary);
    body.style.setProperty('--win-accent-rgb', rgb);
    body.style.setProperty('--win-accent-secondary', secondary);
    body.style.setProperty('--win-accent-glow', glow);
    body.style.setProperty('--color-cyan', primary);
    body.style.setProperty('--color-coral', secondary);
    body.style.setProperty('--color-primary', primary);

    body.classList.remove('theme-fluent-dark', 'theme-fluent-oled', 'theme-fluent-light');
    if (this.state.mode === 'oled') {
      body.classList.add('theme-fluent-oled');
    } else if (this.state.mode === 'light') {
      body.classList.add('theme-fluent-light');
    } else {
      body.classList.add('theme-fluent-dark');
    }

    // Dock PRO bindings
    const dockCfg = this.state.dockConfig || {
      iconSize: 38,
      iconGap: 7,
      waveEnabled: true,
      waveScale: 1.45,
      waveRadius: 90,
      presentationMode: 'floating',
      alignment: 'center',
      autoHide: false,
      indicatorStyle: 'dot'
    };

    root.style.setProperty('--dock-icon-size', `${dockCfg.iconSize}px`);
    root.style.setProperty('--dock-icon-gap', `${dockCfg.iconGap}px`);

    body.classList.remove('dock-mode-floating', 'dock-mode-pinned-bar', 'dock-mode-minimal');
    body.classList.add(`dock-mode-${dockCfg.presentationMode || 'floating'}`);

    body.classList.remove('dock-align-center', 'dock-align-left', 'dock-align-right');
    body.classList.add(`dock-align-${dockCfg.alignment || 'center'}`);

    body.classList.toggle('dock-autohide-enabled', !!dockCfg.autoHide);

    body.classList.remove('dock-ind-dot', 'dock-ind-line', 'dock-ind-glow');
    body.classList.add(`dock-ind-${dockCfg.indicatorStyle || 'dot'}`);
  }

  updateDockConfig(patch) {
    if (!this.state.dockConfig) {
      this.state.dockConfig = {
        iconSize: 38,
        iconGap: 7,
        waveEnabled: true,
        waveScale: 1.45,
        waveRadius: 90,
        presentationMode: 'floating',
        alignment: 'center',
        autoHide: false,
        indicatorStyle: 'dot'
      };
    }
    this.state.dockConfig = { ...this.state.dockConfig, ...patch };
    this.saveState();
    this.applyThemeToDOM();
    this.notify();
  }

  resetDockConfig() {
    this.updateDockConfig({
      iconSize: 38,
      iconGap: 7,
      waveEnabled: true,
      waveScale: 1.45,
      waveRadius: 90,
      presentationMode: 'floating',
      alignment: 'center',
      autoHide: false,
      indicatorStyle: 'dot'
    });
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Theme listener error', err);
      }
    }
  }
}

export const themeEngine = new ThemeEngine();
