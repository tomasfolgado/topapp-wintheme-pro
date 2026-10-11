/**
 * TopApp WinTheme Pro — Unified Widget Runtime Core Engine
 * Renders any of the 12 widgets on either side (left or right column)
 * with independent real-time telemetry, animations, and height reporting.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.initWidgetDashboard = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {

  return function initWidgetDashboard(options = {}) {
    const side = options.side || 'right'; // 'left' or 'right'
    let config = null;
    let isTogglingRadio = false;
    let lastRadioState = { wifi: true, wifiSsid: '', bluetooth: false };
    let cpuHistory = [28, 30, 32, 29, 31, 33, 30, 28, 29, 30];
    let gpuHistory = [35, 34, 36, 35, 37, 36, 35, 36, 35, 36];
    let lastRenderedMonthKey = '';
    let lastDrivesFingerprint = '';
    let cachedDrivesData = null;
    let lastReportedHeight = 0;
    let calMonthOffset = 0;
    let clipboardDrawerOpen = false;
    let cachedClipboardItems = [];

    function hexToRgb(hex) {
      if (!hex) return null;
      let c = hex.replace('#', '').trim();
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      if (c.length !== 6) return null;
      const num = parseInt(c, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    function applyStyles() {
      const r = document.documentElement;
      r.style.setProperty('--widget-glass-blur', (config?.widgetGlassBlur || 18) + 'px');
      r.style.setProperty('--accent', config?.accentColor || '#00e5db');

      const cardBg = config?.widgetCardBg || '#12161e';
      const op = config?.widgetCardBgOpacity != null ? config.widgetCardBgOpacity : (config?.widgetGlassOpacity != null ? config.widgetGlassOpacity : 0.85);
      r.style.setProperty('--widget-glass-opacity', op);
      const rgb = hexToRgb(cardBg) || { r: 18, g: 22, b: 30 };
      r.style.setProperty('--widget-card-bg-computed', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${op})`);

      const rawTextCol = config?.iconTextColor || 'white';
      const isBlack = rawTextCol === 'black' || rawTextCol === 'negro' || rawTextCol === '#000000';
      if (isBlack) {
        r.style.setProperty('--w-text-main', '#0f172a');
        r.style.setProperty('--w-text-sub', 'rgba(15, 23, 42, 0.82)');
        r.style.setProperty('--w-text-muted', 'rgba(15, 23, 42, 0.62)');
        r.style.setProperty('--w-box-bg', 'rgba(0, 0, 0, 0.05)');
        r.style.setProperty('--w-box-border', 'rgba(0, 0, 0, 0.12)');
        r.style.setProperty('--w-box-hover', 'rgba(0, 0, 0, 0.1)');
        r.style.setProperty('--qa-text-primary', '#0f172a');
        r.style.setProperty('--qa-text-secondary', 'rgba(15, 23, 42, 0.78)');
        r.style.setProperty('--qa-text-head', 'rgba(15, 23, 42, 0.88)');
        r.style.setProperty('--qa-item-hover-bg', 'rgba(0, 0, 0, 0.08)');
        r.style.setProperty('--qa-font-weight', '550');
        r.style.setProperty('--qa-font-weight-title', '650');
      } else {
        r.style.setProperty('--w-text-main', '#f8fafc');
        r.style.setProperty('--w-text-sub', 'rgba(255, 255, 255, 0.65)');
        r.style.setProperty('--w-text-muted', 'rgba(255, 255, 255, 0.45)');
        r.style.setProperty('--w-box-bg', 'rgba(255, 255, 255, 0.04)');
        r.style.setProperty('--w-box-border', 'rgba(255, 255, 255, 0.08)');
        r.style.setProperty('--w-box-hover', 'rgba(255, 255, 255, 0.1)');
        r.style.setProperty('--qa-text-primary', '#f1f5f9');
        r.style.setProperty('--qa-text-secondary', 'rgba(255, 255, 255, 0.55)');
        r.style.setProperty('--qa-text-head', 'rgba(255, 255, 255, 0.65)');
        r.style.setProperty('--qa-item-hover-bg', 'rgba(255, 255, 255, 0.08)');
        r.style.setProperty('--qa-font-weight', '400');
        r.style.setProperty('--qa-font-weight-title', '450');
      }
    }

    function reportHeight() {
      const list = side === 'left'
        ? (document.getElementById('left-widget-container') || document.getElementById('widgets-list'))
        : (document.getElementById('widgets-list') || document.getElementById('left-widget-container'));
      const cards = list ? list.querySelectorAll('.w-card') : [];
      const updateFn = side === 'left' ? window.topapp?.updateLeftWidgetHeight : window.topapp?.updateWidgetsHeight;
      if (!updateFn) return;

      if (!cards || cards.length === 0) {
        if (lastReportedHeight !== 0) {
          lastReportedHeight = 0;
          updateFn(0);
        }
        return;
      }
      const rect = list.getBoundingClientRect();
      const scrollH = list.scrollHeight || rect.height;
      const contentHeight = Math.ceil(Math.max(scrollH, rect.height)) + 28;
      if (Math.abs(contentHeight - lastReportedHeight) < 2) return;
      lastReportedHeight = contentHeight;
      updateFn(contentHeight);
    }

    // 12 Widget Generators
    const generators = {
      ai: (v) => {
        if (v.ai === false) return '';
        if (config?.aiConfig?.enabled === false && config?.aiEnabled === false) return '';
        if (window.renderAIAssistantCard) {
          return window.renderAIAssistantCard();
        }
        return '';
      },

      quickaccess: (v) => {
        if (v.quickaccess === false) return '';
        const folders = [
          { id: 'downloads', name: 'Descargas', badge: '📥' },
          { id: 'documents', name: 'Documentos', badge: '📄' },
          { id: 'desktop', name: 'Escritorio', badge: '🖥️' },
          { id: 'pictures', name: 'Imágenes', badge: '🖼️' },
          { id: 'music', name: 'Música', badge: '🎵' },
          { id: 'videos', name: 'Vídeos', badge: '🎬' }
        ];
        return `
        <div class="w-card" id="card-quick-access">
          <div class="w-head">
            <span><span class="w-dot dot-cyan"></span>Acceso Rápido</span>
            <span class="w-sub">Carpetas</span>
          </div>
          <div class="folder-list" id="quick-folders-list">
            ${folders.map(f => `
              <div class="folder-item" data-folder="${f.id}" title="Abrir carpeta ${f.name} en Windows Explorer">
                <div class="folder-icon-wrap">
                  <img src="../../assets/folder.png" alt="Carpeta">
                  <span class="folder-badge-icon">${f.badge}</span>
                </div>
                <span class="folder-name">${f.name}</span>
                <span class="folder-arrow">›</span>
              </div>
            `).join('')}
          </div>
        </div>
        `;
      },
 
      clipboard: (v) => {
        if (v.clipboard === false) return '';
        return `
        <div class="w-card" id="card-clipboard">
          <div class="w-head">
            <span><span class="w-dot dot-cyan"></span>Portapapeles</span>
            <div style="display: flex; align-items: center; gap: 5px;">
              <span class="w-sub" id="clip-count-badge">0 clips</span>
              <button class="cal-toggle-pill ${clipboardDrawerOpen ? 'is-open' : ''}" id="btn-toggle-clipboard" title="Desplegar u ocultar historial con miniaturas">
                <svg class="cal-toggle-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>
          <div class="clip-collapsed-preview" id="clip-collapsed-preview" title="Hacer clic para volver a copiar el último elemento">
            <div class="clip-preview-empty" id="clip-preview-empty">Portapapeles en espera de copiado...</div>
            <div class="clip-preview-content" id="clip-preview-content" style="display: none;">
              <div class="clip-preview-thumb-box" id="clip-preview-thumb-box"></div>
              <div class="clip-preview-info">
                <div class="clip-preview-title" id="clip-preview-title"></div>
                <div class="clip-preview-sub" id="clip-preview-sub"></div>
              </div>
              <button class="w-action-btn clip-btn-recopy" id="btn-quick-recopy" title="Volver a copiar al portapapeles">Copiar</button>
            </div>
          </div>
          <div class="clipboard-drawer ${clipboardDrawerOpen ? 'is-open' : ''}" id="clipboard-drawer">
            <div class="clipboard-drawer-bar">
              <span class="clipboard-drawer-title">Historial con Miniaturas</span>
              <button class="w-action-btn clipboard-clear-btn" id="btn-clear-clipboard" title="Vaciar todo el historial">Vaciar</button>
            </div>
            <div class="clipboard-drawer-scroll" id="clipboard-drawer-items"></div>
          </div>
        </div>
        `;
      },

      drives: (v) => {
        if (v.drives === false) return '';
        const count = cachedDrivesData ? ((cachedDrivesData.drives?.length || 0) + (cachedDrivesData.devices?.length || 0)) : 0;
        return `
        <div class="w-card" id="card-drives">
          <div class="w-head">
            <span><span class="w-dot dot-cyan"></span>Dispositivos y Unidades</span>
            <span class="w-sub" id="lbl-drives-count">${count}</span>
          </div>
          <div class="drives-list" id="drives-items-list">
            <div style="font-size: 0.6rem; color: #64748b; padding: 4px;">Cargando unidades...</div>
          </div>
        </div>
        `;
      },

      music: (v) => {
        if (v.music === false) return '';
        return window.renderMusicWidgetCard ? window.renderMusicWidgetCard() : '';
      },

      datetime: (v) => {
        if (v.datetime === false) return '';
        return `
        <div class="w-card" id="card-clock">
          <div class="w-head">
            <span><span class="w-dot dot-cyan"></span>Hora & Fecha</span>
            <span class="w-sub" id="clock-month-year" title="Click para volver al mes actual" style="cursor: pointer;">CALENDARIO</span>
          </div>
          <div class="clock-banner">
            <div class="time-digits" id="clock-time" title="Click para abrir reloj y alarmas">--:--:--</div>
            <div class="cal-toggle-wrap">
              <div class="cal-nav-arrows">
                <button class="cal-nav-btn" id="btn-cal-prev" title="Mes anterior">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <button class="cal-nav-btn" id="btn-cal-next" title="Mes siguiente">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
              <button class="cal-toggle-pill" id="btn-toggle-calendar" title="Desplegar / Ocultar calendario mensual">
                <svg class="cal-toggle-chevron" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                <div class="cal-toggle-text">
                  <span class="cal-day-name" id="clock-day-name">JUEVES</span>
                  <span class="cal-day-date" id="clock-date">DÍA 8</span>
                </div>
              </button>
            </div>
          </div>
          <div class="mini-calendar-drawer" id="mini-calendar-drawer">
            <div class="mini-calendar" id="mini-calendar" title="Click para abrir el calendario de Windows">
              <div class="cal-weekdays">
                <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
              </div>
              <div class="cal-days-grid" id="cal-days-grid"></div>
            </div>
          </div>
        </div>
        `;
      },

      syscontrols: (v) => {
        if (v.syscontrols === false) return '';
        return `
        <div class="w-card" id="card-syscontrols">
          <div class="w-head">
            <span><span class="w-dot dot-cyan"></span>Control & Batería</span>
            <span class="w-sub" id="sys-bat-badge">--%</span>
          </div>
          <div class="sys-ctrl-grid">
            <div class="sys-ctrl-row">
              <button class="sys-icon-btn" id="btn-sys-mute" title="Sonido Encendido - Clic para silenciar">
                <svg id="sys-vol-icon-active" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path id="sys-vol-wave" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
                <svg id="sys-vol-icon-muted" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              </button>
              <div class="sys-slider-wrap">
                <input type="range" class="sys-slider" id="sys-vol-slider" min="0" max="100" value="50" title="Volumen de Audio">
              </div>
              <span class="sys-val-label" id="sys-vol-val">50%</span>
            </div>

            <div class="sys-ctrl-row">
              <div class="sys-icon-btn is-static" title="Brillo de Pantalla">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              </div>
              <div class="sys-slider-wrap">
                <input type="range" class="sys-slider sys-slider-bright" id="sys-bright-slider" min="0" max="100" value="100" title="Brillo de Pantalla">
              </div>
              <span class="sys-val-label sys-val-bright" id="sys-bright-val">100%</span>
            </div>

            <div class="sys-ctrl-row sys-bat-row">
              <div class="sys-icon-btn is-static" id="sys-bat-icon-wrap" title="Nivel de Batería">
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="16" height="10" rx="2" ry="2"/>
                  <line x1="22" y1="11" x2="22" y2="13"/>
                </svg>
              </div>
              <div class="sys-bat-bar-wrap" title="Nivel de Batería">
                <div class="sys-bat-bar-fill" id="sys-bat-fill" style="width: 100%;"></div>
              </div>
              <span class="sys-bat-text" id="sys-bat-text">100% CA</span>
            </div>
          </div>
        </div>
        `;
      },

      ram: (v) => {
        if (v.ram === false) return '';
        return `
        <div class="w-card" id="card-ram">
          <div class="w-head">
            <span><span class="w-dot dot-cyan"></span>Memoria RAM</span>
            <button class="w-action-btn" id="btn-open-taskmgr" title="Abrir Administrador de Tareas (Ver procesos de Windows)">Procesos</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <div class="w-huge"><span id="ram-used">0.0</span> <span style="font-size: 0.68rem; color: #00e5db;">GB</span></div>
            <div class="w-sub"><span id="ram-pct">0</span>% en uso</div>
          </div>
          <div class="w-bar">
            <div class="w-bar-fill" id="ram-bar" style="width: 0%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="w-sub">Total: <span id="ram-total" style="color: var(--w-text-main); font-weight: 350;">16.0 GB</span></span>
            <button class="w-action-btn" id="btn-purge-ram">Liberar RAM</button>
          </div>
        </div>
        `;
      },

      thermals: (v) => {
        if (v.thermals === false) return '';
        return `
        <div class="w-card" id="card-thermals">
          <div class="w-head">
            <span><span class="w-dot dot-orange"></span>Telemetría Térmica</span>
            <span class="w-sub" id="thermals-sensor-badge">Sensores HW</span>
          </div>
          <div class="dual-thermals-grid">
            <div class="thermal-box">
              <div style="display: flex; justify-content: space-between; font-size: 0.6rem;">
                <span style="color: #00e5db; font-weight: 350;">CPU Temp</span>
                <span id="cpu-temp-val" style="color: #00e5db; font-weight: 350;">--°C</span>
              </div>
              <canvas id="cpu-temp-canvas" width="105" height="18" class="sparkline-canvas"></canvas>
            </div>
            <div class="thermal-box">
              <div style="display: flex; justify-content: space-between; font-size: 0.6rem;">
                <span style="color: #ff7043; font-weight: 350;">GPU Temp</span>
                <span id="gpu-temp-val" style="color: #ff7043; font-weight: 350;">--°C</span>
              </div>
              <canvas id="gpu-temp-canvas" width="105" height="18" class="sparkline-canvas"></canvas>
            </div>
          </div>
        </div>
        `;
      },

      cpu: (v) => {
        if (v.cpu === false) return '';
        return `
        <div class="w-card" id="card-cpu">
          <div class="w-head">
            <span><span class="w-dot dot-yellow"></span>Procesadores Activos</span>
            <span class="w-sub" id="cpu-speed-sub">Núcleos</span>
          </div>
          <div style="font-size: 0.68rem; font-weight: 350; color: var(--w-text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" id="cpu-name">Procesador</div>
          <div class="cores-grid" id="cores-container"></div>
        </div>
        `;
      },

      network: (v) => {
        if (v.network === false) return '';
        return `
        <div class="w-card" id="card-network">
          <div class="w-head">
            <span><span class="w-dot dot-blue"></span>Tráfico de Red I/O</span>
            <span class="w-sub" id="net-badge">En vivo</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div class="w-sub">Bajada</div>
              <div style="font-size: 0.95rem; font-weight: 300; color: #00e5db;" id="net-down">0.0 KB/s</div>
            </div>
            <div style="text-align: right;">
              <div class="w-sub">Subida</div>
              <div style="font-size: 0.95rem; font-weight: 300; color: #ff7043;" id="net-up">0.0 KB/s</div>
            </div>
          </div>
        </div>
        `;
      },

      printer: (v) => {
        if (v.printer === false) return '';
        return `
        <div class="w-card" id="card-printer">
          <div class="w-head">
            <span><span class="w-dot dot-cyan"></span>Impresoras & Escáneres</span>
            <span class="w-sub" id="printer-online-badge" style="color: #00e5db;">Online</span>
          </div>
          <div style="font-size: 0.66rem; font-weight: 350; color: var(--w-text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">HP LaserJet Pro MFP 4102dw</div>
          <div style="display: flex; justify-content: space-between; font-size: 0.58rem; color: var(--w-text-muted); margin-top: 4px;">
            <span id="printer-doc-label">Estado</span>
            <span id="printer-status-text" style="color: #00e5db;">Preparada • 0 trabajos</span>
          </div>
          <div class="w-bar" id="printer-progress-bar-wrap" style="display: none;">
            <div class="w-bar-fill" id="printer-progress-bar" style="width: 0%; background: #00e5db;"></div>
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 5px;">
            <button class="w-action-btn" id="btn-open-print-queue">Abrir Cola Windows</button>
          </div>
        </div>
        `;
      },

      connectivity: (v) => {
        if (v.connectivity === false) return '';
        return `
        <div class="w-card" id="card-conn">
          <div class="w-head">
            <span><span class="w-dot dot-cyan"></span>Conectividad & Red</span>
            <span class="w-sub" id="conn-hint">Click para alternar</span>
          </div>
          <div class="connectivity-grid">
            <div class="conn-pill ${lastRadioState.wifi ? 'is-active' : 'is-inactive'}" id="btn-toggle-wifi" title="Clic para activar o desactivar Wi-Fi">
              <span id="wifi-label">${lastRadioState.wifi && lastRadioState.wifiSsid ? `Wi-Fi (${lastRadioState.wifiSsid})` : 'Wi-Fi'}</span>
              <span class="conn-status-badge ${lastRadioState.wifi ? 'conn-status-on' : 'conn-status-off'}" id="wifi-status-badge">${lastRadioState.wifi ? 'ON' : 'OFF'}</span>
            </div>
            <div class="conn-pill ${lastRadioState.bluetooth ? 'is-active' : 'is-inactive'}" id="btn-toggle-bt" title="Clic para activar o desactivar Bluetooth">
              <span>Bluetooth</span>
              <span class="conn-status-badge ${lastRadioState.bluetooth ? 'conn-status-on' : 'conn-status-off'}" id="bt-status-badge">${lastRadioState.bluetooth ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>
        `;
      },

      search: (v) => {
        if (v.search === false) return '';
        const folder = config?.searchFolder || 'C:\\';
        const folderName = folder.split(/[\\/]/).filter(Boolean).pop() || folder;
        return `
        <div class="w-card" id="card-search">
          <div class="w-head">
            <span><span class="w-dot dot-cyan"></span>Buscador Rápido</span>
            <button class="w-action-btn" id="btn-do-search" style="padding: 2px 9px; font-size: 0.6rem; background: var(--accent); color: #0c0f14; font-weight: 400; border-color: var(--accent);" title="Abrir búsqueda en Windows">Buscar</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; margin-bottom: 5px;">
            <div style="font-size: 0.6rem; color: var(--w-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 175px;" id="current-search-folder" title="${folder}">
              <img src="../../assets/folder.png" style="width: 13px; height: 13px; vertical-align: -2px; margin-right: 3px;" alt="📁"> <span style="color: #00e5db;">${folderName}</span>
            </div>
            <button class="w-action-btn" id="btn-browse-folder-widget" style="padding: 1px 6px; font-size: 0.55rem;">Examinar...</button>
          </div>
          <select class="filter-select" id="search-filter-select">
            <option value="all">Todos los archivos (*.*)</option>
            <option value="pdf">Archivos PDF (*.pdf)</option>
            <option value="docs">Documentos (*.docx, *.doc, *.txt)</option>
            <option value="images">Imágenes (*.png, *.jpg, *.jpeg)</option>
            <option value="videos">Vídeos (*.mp4, *.mkv)</option>
            <option value="code">Código fuente (*.js, *.py, *.html)</option>
            <option value="audio">Música y Audio (*.mp3, *.wav)</option>
          </select>
          <input type="text" class="search-input" id="search-box" placeholder="Nombre a buscar en la carpeta..." />
          <div class="search-results" id="search-results-list" style="display: none;"></div>
        </div>
        `;
      }
    };

    function renderMiniCalendar(viewDate, container) {
      if (!container) return;
      const today = new Date();
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const isCurrentMonth = (year === today.getFullYear() && month === today.getMonth());
      const todayDate = today.getDate();

      const firstDay = new Date(year, month, 1).getDay();
      const startOffset = (firstDay + 6) % 7; // Monday = 0
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      let html = '';
      for (let i = 0; i < startOffset; i++) {
        html += '<div class="cal-day-cell cal-empty"></div>';
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const isToday = isCurrentMonth && (d === todayDate);
        html += `<div class="cal-day-cell ${isToday ? 'cal-today' : ''}" title="${d}/${month + 1}/${year}">${d}</div>`;
      }
      container.innerHTML = html;
    }

    function updateClock() {
      if (!document.getElementById('card-clock')) return;
      const now = new Date();
      const timeEl = document.getElementById('clock-time');
      const dayEl = document.getElementById('clock-day-name');
      const dateEl = document.getElementById('clock-date');
      const monthYearEl = document.getElementById('clock-month-year');
      const daysGridEl = document.getElementById('cal-days-grid');

      if (timeEl) timeEl.textContent = now.toTimeString().split(' ')[0];
      if (dayEl) dayEl.textContent = now.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
      if (dateEl) dateEl.textContent = `DÍA ${now.getDate()}`;

      const viewDate = new Date(now.getFullYear(), now.getMonth() + calMonthOffset, 1);
      if (monthYearEl) {
        const mName = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        monthYearEl.textContent = (calMonthOffset !== 0 ? '◀ ' : '') + mName.toUpperCase() + (calMonthOffset !== 0 ? ' ▶' : '');
        monthYearEl.title = calMonthOffset !== 0 ? 'Click para volver al mes actual' : 'Calendario mensual';
      }

      const isCurrentMonth = (calMonthOffset === 0);
      const viewKey = `${viewDate.getFullYear()}-${viewDate.getMonth()}-${isCurrentMonth ? now.getDate() : 'other'}`;
      if (daysGridEl && (!daysGridEl.children.length || lastRenderedMonthKey !== viewKey)) {
        lastRenderedMonthKey = viewKey;
        renderMiniCalendar(viewDate, daysGridEl);
      }
    }

    function drawSparkline(canvasId, history, color) {
      const c = document.getElementById(canvasId);
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width;
      const h = c.height;
      ctx.clearRect(0, 0, w, h);
      if (!history || history.length < 2) return;

      const min = Math.min(...history) - 2;
      const max = Math.max(...history) + 2;
      const range = (max - min) || 1;

      ctx.beginPath();
      history.forEach((val, i) => {
        const x = (i / (history.length - 1)) * w;
        const y = h - ((val - min) / range) * (h - 2) - 1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    function updateThermalsUI(cpuTemp, gpuTemp) {
      if (!document.getElementById('card-thermals')) return;
      if (typeof cpuTemp === 'number' && cpuTemp > 0) {
        cpuHistory = [...cpuHistory.slice(1), cpuTemp];
        const cVal = document.getElementById('cpu-temp-val');
        if (cVal) cVal.textContent = `${cpuTemp}°C`;
        drawSparkline('cpu-temp-canvas', cpuHistory, '#00e5db');
      }

      if (typeof gpuTemp === 'number' && gpuTemp > 0) {
        gpuHistory = [...gpuHistory.slice(1), gpuTemp];
        const gVal = document.getElementById('gpu-temp-val');
        if (gVal) gVal.textContent = `${gpuTemp}°C`;
        drawSparkline('gpu-temp-canvas', gpuHistory, '#ff7043');
      } else if (gpuTemp === null) {
        const gVal = document.getElementById('gpu-temp-val');
        if (gVal && gVal.textContent === '--°C') gVal.textContent = 'N/A';
      }
    }

    async function updateStats() {
      if (!window.topapp) return;
      const hasRam = !!document.getElementById('card-ram');
      const hasCpu = !!document.getElementById('card-cpu');
      const hasThermals = !!document.getElementById('card-thermals');
      const hasNet = !!document.getElementById('card-network');
      if (!hasRam && !hasCpu && !hasThermals && !hasNet) return;

      try {
        const stats = await window.topapp.getStats();
        if (stats) {
          // RAM
          if (hasRam) {
            const usedEl = document.getElementById('ram-used');
            const totalEl = document.getElementById('ram-total');
            const pctEl = document.getElementById('ram-pct');
            const barEl = document.getElementById('ram-bar');
            if (usedEl && typeof stats.ramUsedGB === 'number') usedEl.textContent = stats.ramUsedGB.toFixed(1);
            if (totalEl && typeof stats.ramTotalGB === 'number') totalEl.textContent = `${stats.ramTotalGB.toFixed(1)} GB`;
            const pct = Math.round((stats.ramUsedGB / stats.ramTotalGB) * 100);
            if (pctEl) pctEl.textContent = pct;
            if (barEl) barEl.style.width = `${pct}%`;
          }

          // CPU Model & Cores
          if (hasCpu) {
            const cpuNameEl = document.getElementById('cpu-name');
            if (cpuNameEl && stats.cpuModel) cpuNameEl.textContent = stats.cpuModel;
            const cpuSpeedEl = document.getElementById('cpu-speed-sub');
            if (cpuSpeedEl && stats.cpuSpeed) cpuSpeedEl.textContent = stats.cpuSpeed;
            const coresBox = document.getElementById('cores-container');
            if (coresBox && stats.coresLoad) {
              coresBox.innerHTML = stats.coresLoad.map(l => `
                <div class="core-cell" title="${l}%">
                  <div class="core-fill" style="height: ${l}%; background: ${l > 75 ? '#ff7043' : '#00e5db'};"></div>
                </div>
              `).join('');
            }
          }

          // Thermals
          if (hasThermals) {
            updateThermalsUI(stats.cpuTemp, stats.gpuTemp);
          }

          // Network
          if (hasNet) {
            const dEl = document.getElementById('net-down');
            const uEl = document.getElementById('net-up');
            if (dEl && stats.netDown) dEl.textContent = stats.netDown;
            if (uEl && stats.netUp) uEl.textContent = stats.netUp;
          }
        }
      } catch (err) {}
    }

    async function updatePrinter() {
      if (!window.topapp?.getPrinterStatus || !document.getElementById('card-printer')) return;
      try {
        const status = await window.topapp.getPrinterStatus();
        const barWrap = document.getElementById('printer-progress-bar-wrap');
        const pBar = document.getElementById('printer-progress-bar');
        const docLabel = document.getElementById('printer-doc-label');
        const statusText = document.getElementById('printer-status-text');

        if (!statusText) return;
        if (status && status.isPrinting) {
          if (barWrap) barWrap.style.display = 'block';
          if (pBar) pBar.style.width = `${status.progressPct}%`;
          if (docLabel) docLabel.textContent = status.docName || 'Imprimiendo...';
          statusText.textContent = `${status.progressPct}% (${status.pagesPrinted}/${status.totalPages} pág)`;
          statusText.style.color = '#38bdf8';
        } else {
          if (barWrap) barWrap.style.display = 'none';
          if (docLabel) docLabel.textContent = 'Estado';
          statusText.textContent = 'Preparada • 0 trabajos';
          statusText.style.color = '#00e5db';
        }
      } catch (e) {}
    }

    function applyRadioUI(state) {
      const wifiPill = document.getElementById('btn-toggle-wifi');
      const wifiBadge = document.getElementById('wifi-status-badge');
      const wifiLabel = document.getElementById('wifi-label');
      const btPill = document.getElementById('btn-toggle-bt');
      const btBadge = document.getElementById('bt-status-badge');

      if (wifiPill && wifiBadge) {
        if (state.wifi) {
          wifiPill.classList.add('is-active');
          wifiPill.classList.remove('is-inactive');
          wifiBadge.className = 'conn-status-badge conn-status-on';
          wifiBadge.textContent = 'ON';
          if (wifiLabel) {
            wifiLabel.textContent = state.wifiSsid ? `Wi-Fi (${state.wifiSsid})` : 'Wi-Fi';
          }
        } else {
          wifiPill.classList.remove('is-active');
          wifiPill.classList.add('is-inactive');
          wifiBadge.className = 'conn-status-badge conn-status-off';
          wifiBadge.textContent = 'OFF';
          if (wifiLabel) wifiLabel.textContent = 'Wi-Fi';
        }
      }

      if (btPill && btBadge) {
        if (state.bluetooth) {
          btPill.classList.add('is-active');
          btPill.classList.remove('is-inactive');
          btBadge.className = 'conn-status-badge conn-status-on';
          btBadge.textContent = 'ON';
        } else {
          btPill.classList.remove('is-active');
          btPill.classList.add('is-inactive');
          btBadge.className = 'conn-status-badge conn-status-off';
          btBadge.textContent = 'OFF';
        }
      }
    }

    async function updateConnectivity() {
      if (!window.topapp?.getRadioStatus || isTogglingRadio || !document.getElementById('card-conn')) return;
      try {
        const state = await window.topapp.getRadioStatus();
        if (state) {
          lastRadioState = state;
          applyRadioUI(state);
        }
      } catch (err) {}
    }

    function applyDrivesUI(data) {
      if (!data) return;
      const drives = data.drives || [];
      const devices = data.devices || [];

      const container = document.getElementById('drives-items-list');
      const countLbl = document.getElementById('lbl-drives-count');
      if (!container) return;

      const totalItemsCount = drives.length + devices.length;
      if (countLbl) countLbl.textContent = `${totalItemsCount}`;

      if (!drives.length && !devices.length) {
        container.innerHTML = '<div style="font-size: 0.6rem; color: #64748b; padding: 4px;">No se detectaron unidades.</div>';
        reportHeight();
        return;
      }

      let html = '';
      drives.forEach(d => {
        const isWarning = d.usedPct >= 85;
        const driveLabel = d.name ? `${d.name} (${d.letter})` : `Unidad (${d.letter})`;

        if (d.type === 5) {
          html += `
            <div class="drive-item" data-path="${d.path}" title="Abrir ${driveLabel}">
              <div class="drive-head">
                <div class="drive-title-wrap">
                  <span class="drive-ico">💿</span>
                  <span class="drive-name">${d.name || 'Unidad de DVD RW'} (${d.letter})</span>
                </div>
                <span class="w-sub">Óptica</span>
              </div>
              <div class="drive-info-sub">Unidad de disco óptico</div>
            </div>
          `;
        } else {
          const freeText = d.freeGB != null ? `${d.freeGB} GB disponibles de ${d.totalGB} GB` : 'Listo';
          html += `
            <div class="drive-item" data-path="${d.path}" title="Abrir unidad ${driveLabel} en Windows Explorer">
              <div class="drive-head">
                <div class="drive-title-wrap">
                  <span class="drive-ico">💾</span>
                  <span class="drive-name">${driveLabel}</span>
                </div>
                <span class="drive-pct">${d.usedPct != null ? d.usedPct + '%' : ''}</span>
              </div>
              <div class="w-bar">
                <div class="w-bar-fill ${isWarning ? 'warning' : ''}" style="width: ${d.usedPct || 0}%;"></div>
              </div>
              <div class="drive-info-sub">${freeText}</div>
            </div>
          `;
        }
      });

      devices.forEach(dev => {
        html += `
          <div class="device-badge-row" data-path="shell:MyComputerFolder" title="Dispositivo móvil conectado: ${dev.name}">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 0.8rem;">📱</span>
              <span style="font-weight: 450;">${dev.name}</span>
            </div>
            <span style="font-size: 0.55rem; color: #00e5db; font-weight: 500;">✓ Conectado</span>
          </div>
        `;
      });

      container.innerHTML = html;
      container.querySelectorAll('.drive-item, .device-badge-row').forEach(el => {
        el.onclick = () => {
          const p = el.dataset.path;
          if (p && window.topapp) window.topapp.launchApp(p);
        };
      });

      reportHeight();
    }

    async function loadDrives(force = false) {
      if (!window.topapp || !window.topapp.getDrivesStatus || !document.getElementById('card-drives')) return;
      try {
        const data = await window.topapp.getDrivesStatus();
        if (data && (Array.isArray(data.drives) || Array.isArray(data.devices))) {
          cachedDrivesData = data;
        }
        const drives = data?.drives || [];
        const devices = data?.devices || [];

        const fingerprint = JSON.stringify({ drives, devices });
        if (!force && fingerprint === lastDrivesFingerprint) return;
        lastDrivesFingerprint = fingerprint;

        applyDrivesUI(data);
      } catch (err) {}
    }

    function formatTimeAgo(ts) {
      if (!ts) return '';
      const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
      if (diff < 45) return 'Ahora';
      if (diff < 3600) return `${Math.floor(diff / 60)}m`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
      return new Date(ts).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function renderClipboardUI(items) {
      const card = document.getElementById('card-clipboard');
      if (!card) return;

      const badgeCount = document.getElementById('clip-count-badge');
      if (badgeCount) {
        badgeCount.textContent = `${items.length} clip${items.length === 1 ? '' : 's'}`;
      }

      // 1. Collapsed Preview
      const emptyEl = document.getElementById('clip-preview-empty');
      const contentEl = document.getElementById('clip-preview-content');
      const thumbBox = document.getElementById('clip-preview-thumb-box');
      const titleEl = document.getElementById('clip-preview-title');
      const subEl = document.getElementById('clip-preview-sub');

      if (!items || !items.length) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (contentEl) contentEl.style.display = 'none';
      } else {
        if (emptyEl) emptyEl.style.display = 'none';
        if (contentEl) contentEl.style.display = 'flex';

        const top = items[0];
        if (top.type === 'image') {
          if (thumbBox) thumbBox.innerHTML = `<img src="${top.thumbnail}" class="clip-mini-thumb" alt="Miniatura">`;
          if (titleEl) titleEl.textContent = `Captura ${top.sizeStr || ''}`;
          if (subEl) subEl.textContent = `${top.fileSizeKB ? top.fileSizeKB + ' KB • ' : ''}${formatTimeAgo(top.timestamp)}`;
        } else if (top.type === 'color') {
          if (thumbBox) thumbBox.innerHTML = `<span class="clip-color-swatch" style="background:${top.text};"></span>`;
          if (titleEl) titleEl.textContent = top.text;
          if (subEl) subEl.textContent = `Color • ${formatTimeAgo(top.timestamp)}`;
        } else if (top.type === 'url') {
          if (thumbBox) thumbBox.innerHTML = `<span class="clip-type-icon">🔗</span>`;
          if (titleEl) titleEl.textContent = top.preview;
          if (subEl) subEl.textContent = `Enlace web • ${formatTimeAgo(top.timestamp)}`;
        } else if (top.type === 'code') {
          if (thumbBox) thumbBox.innerHTML = `<span class="clip-type-icon">💻</span>`;
          if (titleEl) titleEl.textContent = top.preview;
          if (subEl) subEl.textContent = `Código • ${top.charCount} car. • ${formatTimeAgo(top.timestamp)}`;
        } else {
          if (thumbBox) thumbBox.innerHTML = `<span class="clip-type-icon">📝</span>`;
          if (titleEl) titleEl.textContent = top.preview;
          if (subEl) subEl.textContent = `${top.charCount} car. • ${formatTimeAgo(top.timestamp)}`;
        }
      }

      // 2. Expandable Drawer Items List
      const drawerList = document.getElementById('clipboard-drawer-items');
      if (drawerList) {
        if (!items || !items.length) {
          drawerList.innerHTML = '<div style="font-size: 0.6rem; color: #64748b; padding: 12px; text-align: center;">El portapapeles está vacío.<br>Copia textos o capturas con Win+Shift+S.</div>';
        } else {
          drawerList.innerHTML = items.map(it => {
            if (it.type === 'image') {
              return `
              <div class="clip-tile clip-tile-image" data-id="${it.id}" title="Clic para copiar captura al portapapeles">
                <div class="clip-img-wrap">
                  <img src="${it.thumbnail}" class="clip-thumb-img" alt="Captura">
                  <span class="clip-thumb-badge">📸 ${it.sizeStr || 'Imagen'}</span>
                </div>
                <div class="clip-tile-image-info">
                  <span class="clip-tile-subtext">${it.fileSizeKB ? it.fileSizeKB + ' KB' : 'Imagen'}</span>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span class="clip-tile-subtext">${formatTimeAgo(it.timestamp)}</span>
                    <button class="clip-btn-del" data-id="${it.id}" title="Eliminar de historial">✕</button>
                  </div>
                </div>
                <div class="clip-toast-feedback">✓ ¡Copiado!</div>
              </div>
              `;
            } else {
              let typeClass = 'text';
              let typeLabel = 'Texto';
              if (it.type === 'url') { typeClass = 'url'; typeLabel = '🔗 Enlace'; }
              else if (it.type === 'code') { typeClass = 'code'; typeLabel = '💻 Código'; }
              else if (it.type === 'color') { typeClass = 'color'; typeLabel = '🎨 Color'; }

              return `
              <div class="clip-tile clip-tile-text clip-type-${it.type}" data-id="${it.id}" title="Clic para copiar texto al portapapeles">
                <div class="clip-tile-top">
                  <span class="clip-badge-pill ${typeClass}">${typeLabel}</span>
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span class="clip-tile-time">${formatTimeAgo(it.timestamp)}</span>
                    <button class="clip-btn-del" data-id="${it.id}" title="Eliminar de historial">✕</button>
                  </div>
                </div>
                <div class="clip-tile-snippet ${it.type === 'code' ? 'font-mono' : ''}">${escapeHtml(it.preview)}</div>
                <div class="clip-tile-meta">
                  <span>${it.charCount} car.</span>
                  ${it.wordCount ? `<span>• ${it.wordCount} pal.</span>` : ''}
                </div>
                <div class="clip-toast-feedback">✓ ¡Copiado!</div>
              </div>
              `;
            }
          }).join('');

          // Tile click to copy
          drawerList.querySelectorAll('.clip-tile').forEach(tile => {
            tile.onclick = async () => {
              const id = tile.dataset.id;
              if (window.topapp?.copyClipboardItem) {
                const res = await window.topapp.copyClipboardItem(id);
                if (res && res.ok) {
                  const toast = tile.querySelector('.clip-toast-feedback');
                  if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 950);
                  }
                }
              }
            };
          });

          // Delete button
          drawerList.querySelectorAll('.clip-btn-del').forEach(btn => {
            btn.onclick = async (e) => {
              e.stopPropagation();
              const id = btn.dataset.id;
              if (window.topapp?.deleteClipboardItem) {
                await window.topapp.deleteClipboardItem(id);
              }
            };
          });
        }
      }

      // Quick recopy button
      const quickRecopyBtn = document.getElementById('btn-quick-recopy');
      if (quickRecopyBtn) {
        quickRecopyBtn.onclick = async (e) => {
          e.stopPropagation();
          if (items.length && window.topapp?.copyClipboardItem) {
            quickRecopyBtn.textContent = '✓ Copiado';
            quickRecopyBtn.style.color = '#00e5db';
            await window.topapp.copyClipboardItem(items[0].id);
            setTimeout(() => {
              quickRecopyBtn.textContent = 'Copiar';
              quickRecopyBtn.style.color = '';
            }, 1200);
          }
        };
      }

      // Clear all
      const clearBtn = document.getElementById('btn-clear-clipboard');
      if (clearBtn) {
        clearBtn.onclick = async (e) => {
          e.stopPropagation();
          if (window.topapp?.clearClipboardHistory) {
            await window.topapp.clearClipboardHistory();
          }
        };
      }

      // Drawer toggle button
      const toggleBtn = document.getElementById('btn-toggle-clipboard');
      const drawer = document.getElementById('clipboard-drawer');
      if (toggleBtn && drawer) {
        toggleBtn.onclick = (e) => {
          e.stopPropagation();
          clipboardDrawerOpen = !clipboardDrawerOpen;
          drawer.classList.toggle('is-open', clipboardDrawerOpen);
          toggleBtn.classList.toggle('is-open', clipboardDrawerOpen);
          reportHeight();
          setTimeout(reportHeight, 40);
          setTimeout(reportHeight, 120);
          setTimeout(reportHeight, 260);
          setTimeout(reportHeight, 380);
        };
      }

      // Click on collapsed preview to copy
      const collapsedWrap = document.getElementById('clip-collapsed-preview');
      if (collapsedWrap) {
        collapsedWrap.onclick = async () => {
          if (items.length && window.topapp?.copyClipboardItem) {
            await window.topapp.copyClipboardItem(items[0].id);
            if (quickRecopyBtn) {
              quickRecopyBtn.textContent = '✓ Copiado';
              quickRecopyBtn.style.color = '#00e5db';
              setTimeout(() => {
                quickRecopyBtn.textContent = 'Copiar';
                quickRecopyBtn.style.color = '';
              }, 1200);
            }
          }
        };
      }
    }

    let isUserDraggingVol = false;
    let isUserDraggingBright = false;
    let lastSysControlsData = null;
    let volDebounceTimer = null;
    let brightDebounceTimer = null;
    let dragVolReleaseTimer = null;
    let dragBrightReleaseTimer = null;

    function applySysControlsUI(data) {
      if (!data) return;
      lastSysControlsData = data;
      const volSlider = document.getElementById('sys-vol-slider');
      const volVal = document.getElementById('sys-vol-val');
      const brightSlider = document.getElementById('sys-bright-slider');
      const brightVal = document.getElementById('sys-bright-val');
      const batBadge = document.getElementById('sys-bat-badge');
      const batFill = document.getElementById('sys-bat-fill');
      const batText = document.getElementById('sys-bat-text');
      const muteBtn = document.getElementById('btn-sys-mute');
      const iconActive = document.getElementById('sys-vol-icon-active');
      const iconMuted = document.getElementById('sys-vol-icon-muted');

      const vol = typeof data.volume === 'number' ? data.volume : 50;
      const isMuted = !!data.isMuted;

      if (volSlider && !isUserDraggingVol) {
        volSlider.value = vol;
      }
      if (volVal) {
        if (isMuted) {
          volVal.textContent = 'SILENCIO';
          volVal.style.color = '#ef4444';
        } else {
          volVal.textContent = `${vol}%`;
          volVal.style.color = '#00e5db';
        }
      }
      if (iconActive) iconActive.style.display = isMuted ? 'none' : 'block';
      if (iconMuted) iconMuted.style.display = isMuted ? 'block' : 'none';
      if (muteBtn) {
        muteBtn.classList.toggle('is-muted', isMuted);
        muteBtn.style.color = isMuted ? '#ef4444' : '#00e5db';
        muteBtn.style.borderColor = isMuted ? 'rgba(239, 68, 68, 0.45)' : 'rgba(255, 255, 255, 0.1)';
        muteBtn.title = isMuted ? 'Silenciado - Clic para activar sonido (Encendido)' : 'Sonido Encendido - Clic para silenciar';
      }

      const bright = typeof data.brightness === 'number' ? data.brightness : 100;
      if (brightSlider && !isUserDraggingBright) {
        brightSlider.value = bright;
      }
      if (brightVal) {
        brightVal.textContent = `${bright}%`;
      }

      const batPct = typeof data.battery === 'number' ? data.battery : 100;
      if (batBadge) {
        batBadge.textContent = data.hasBattery ? `${data.isCharging ? '⚡' : ''}${batPct}%` : 'CA';
      }
      if (batFill) {
        batFill.style.width = `${batPct}%`;
        if (batPct <= 20 && !data.isCharging) {
          batFill.style.background = '#ef4444';
        } else {
          batFill.style.background = 'linear-gradient(90deg, #00e5db, #38bdf8)';
        }
      }
      if (batText) {
        if (!data.hasBattery) {
          batText.textContent = '100% • Sobremesa (CA)';
        } else if (data.isCharging) {
          batText.textContent = `${batPct}% • Cargando (CA)`;
        } else {
          batText.textContent = `${batPct}% • En batería`;
        }
      }
    }

    function initSysControls() {
      const volSlider = document.getElementById('sys-vol-slider');
      const volVal = document.getElementById('sys-vol-val');
      const brightSlider = document.getElementById('sys-bright-slider');
      const brightVal = document.getElementById('sys-bright-val');
      const muteBtn = document.getElementById('btn-sys-mute');

      if (lastSysControlsData) {
        applySysControlsUI(lastSysControlsData);
      }

      if (volSlider) {
        volSlider.oninput = () => {
          isUserDraggingVol = true;
          clearTimeout(dragVolReleaseTimer);
          const v = parseInt(volSlider.value, 10);
          if (volVal) {
            volVal.textContent = `${v}%`;
            volVal.style.color = '#00e5db';
          }
          const iconActive = document.getElementById('sys-vol-icon-active');
          const iconMuted = document.getElementById('sys-vol-icon-muted');
          if (iconActive) iconActive.style.display = 'block';
          if (iconMuted) iconMuted.style.display = 'none';
          if (muteBtn) {
            muteBtn.classList.remove('is-muted');
            muteBtn.style.color = '#00e5db';
            muteBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            muteBtn.title = 'Sonido Encendido - Clic para silenciar';
          }
          clearTimeout(volDebounceTimer);
          volDebounceTimer = setTimeout(() => {
            if (window.topapp?.setSystemVolume) {
              window.topapp.setSystemVolume(v).then(res => {
                if (res) lastSysControlsData = res;
              });
            }
          }, 60);
        };

        volSlider.onchange = () => {
          clearTimeout(volDebounceTimer);
          const v = parseInt(volSlider.value, 10);
          if (window.topapp?.setSystemVolume) {
            window.topapp.setSystemVolume(v).then(res => {
              if (res) lastSysControlsData = res;
            });
          }
          dragVolReleaseTimer = setTimeout(() => {
            isUserDraggingVol = false;
          }, 1500);
        };
      }

      if (brightSlider) {
        brightSlider.oninput = () => {
          isUserDraggingBright = true;
          clearTimeout(dragBrightReleaseTimer);
          const b = parseInt(brightSlider.value, 10);
          if (brightVal) brightVal.textContent = `${b}%`;
          clearTimeout(brightDebounceTimer);
          brightDebounceTimer = setTimeout(() => {
            if (window.topapp?.setSystemBrightness) {
              window.topapp.setSystemBrightness(b).then(res => {
                if (res) lastSysControlsData = res;
              });
            }
          }, 80);
        };

        brightSlider.onchange = () => {
          clearTimeout(brightDebounceTimer);
          const b = parseInt(brightSlider.value, 10);
          if (window.topapp?.setSystemBrightness) {
            window.topapp.setSystemBrightness(b).then(res => {
              if (res) lastSysControlsData = res;
            });
          }
          dragBrightReleaseTimer = setTimeout(() => {
            isUserDraggingBright = false;
          }, 1500);
        };
      }

      if (muteBtn) {
        muteBtn.onclick = async () => {
          const currentMuted = !!(lastSysControlsData?.isMuted);
          const nextMuted = !currentMuted;
          if (!lastSysControlsData) lastSysControlsData = { volume: 50 };
          lastSysControlsData.isMuted = nextMuted;
          applySysControlsUI(lastSysControlsData);
          if (window.topapp?.toggleSystemMute) {
            const res = await window.topapp.toggleSystemMute();
            if (res) applySysControlsUI(res);
          }
        };
      }

      if (window.topapp?.getSystemControls) {
        window.topapp.getSystemControls().then(applySysControlsUI);
      }
    }

    function render() {
      lastRenderedMonthKey = '';
      lastDrivesFingerprint = '';
      const list = side === 'left'
        ? (document.getElementById('left-widget-container') || document.getElementById('widgets-list'))
        : (document.getElementById('widgets-list') || document.getElementById('left-widget-container'));
      if (!list) return;

      const v = config?.visibleWidgets || {
        ai: true, quickaccess: true, clipboard: true, drives: true,
        music: true, datetime: true, syscontrols: true, ram: true,
        thermals: true, cpu: true, network: true,
        printer: true, connectivity: true, search: true
      };

      const defaultLeft = ['ai', 'quickaccess', 'clipboard', 'drives'];
      const defaultRight = ['music', 'datetime', 'syscontrols', 'ram', 'thermals', 'cpu', 'network', 'printer', 'connectivity', 'search'];
      const order = side === 'left'
        ? (Array.isArray(config?.widgetsLeft) ? config.widgetsLeft : defaultLeft)
        : (Array.isArray(config?.widgetsRight) ? config.widgetsRight : (Array.isArray(config?.widgetsOrder) ? config.widgetsOrder : defaultRight));

      let html = '';
      for (const widgetId of order) {
        if (generators[widgetId]) {
          html += generators[widgetId](v);
        }
      }
      list.innerHTML = html;

      if (typeof ResizeObserver !== 'undefined' && list && !list.__roObserved) {
        list.__roObserved = true;
        const ro = new ResizeObserver(() => {
          reportHeight();
        });
        ro.observe(list);
      }

      // Bind dynamic handlers
      // 1. AI Assistant
      if (document.getElementById('card-ai-assistant') && window.initAIAssistant) {
        try { window.initAIAssistant(); } catch (e) {}
      }

      // 2. Quick Folders
      const folderList = document.getElementById('quick-folders-list');
      if (folderList) {
        folderList.querySelectorAll('.folder-item').forEach(el => {
          el.onclick = () => {
            const fid = el.dataset.folder;
            if (fid && window.topapp) window.topapp.launchApp(fid);
          };
        });
      }

      // 3. Drives
      if (document.getElementById('card-drives')) {
        if (cachedDrivesData) {
          applyDrivesUI(cachedDrivesData);
        }
        loadDrives(true);
      }

      // 4. Music
      if (document.getElementById('card-music') && window.initMusicWidget) {
        try { window.initMusicWidget(); } catch (e) {}
      }

      // 5. Datetime / Clock & Calendar
      const timeBtn = document.getElementById('clock-time');
      if (timeBtn) {
        timeBtn.onclick = () => { if (window.topapp?.openAlarms) window.topapp.openAlarms(); };
      }

      const applyCalendarMonthChange = () => {
        const now = new Date();
        const viewDate = new Date(now.getFullYear(), now.getMonth() + calMonthOffset, 1);
        const daysGridEl = document.getElementById('cal-days-grid');
        const mYearEl = document.getElementById('clock-month-year');
        if (mYearEl) {
          const mName = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
          mYearEl.textContent = (calMonthOffset !== 0 ? '◀ ' : '') + mName.toUpperCase() + (calMonthOffset !== 0 ? ' ▶' : '');
          mYearEl.title = calMonthOffset !== 0 ? 'Click para volver al mes actual' : 'Calendario mensual';
        }
        if (daysGridEl) {
          renderMiniCalendar(viewDate, daysGridEl);
        }
        // Auto-open calendar drawer so user sees the newly selected month
        const drawer = document.getElementById('mini-calendar-drawer');
        const toggleBtn = document.getElementById('btn-toggle-calendar');
        if (drawer && !drawer.classList.contains('is-open')) {
          drawer.classList.add('is-open');
          if (toggleBtn) toggleBtn.classList.add('is-open');
        }
        reportHeight();
        setTimeout(reportHeight, 40);
        setTimeout(reportHeight, 120);
        setTimeout(reportHeight, 260);
      };

      const btnCalPrev = document.getElementById('btn-cal-prev');
      if (btnCalPrev) {
        btnCalPrev.onclick = (e) => {
          e.stopPropagation();
          calMonthOffset--;
          applyCalendarMonthChange();
        };
      }
      const btnCalNext = document.getElementById('btn-cal-next');
      if (btnCalNext) {
        btnCalNext.onclick = (e) => {
          e.stopPropagation();
          calMonthOffset++;
          applyCalendarMonthChange();
        };
      }
      const monthYearTitleEl = document.getElementById('clock-month-year');
      if (monthYearTitleEl) {
        monthYearTitleEl.onclick = (e) => {
          e.stopPropagation();
          if (calMonthOffset !== 0) {
            calMonthOffset = 0;
            applyCalendarMonthChange();
          }
        };
      }

      const toggleCalBtn = document.getElementById('btn-toggle-calendar');
      if (toggleCalBtn) {
        toggleCalBtn.onclick = (e) => {
          e.stopPropagation();
          const drawer = document.getElementById('mini-calendar-drawer');
          if (!drawer) return;
          const isOpen = drawer.classList.toggle('is-open');
          toggleCalBtn.classList.toggle('is-open', isOpen);

          const daysGridEl = document.getElementById('cal-days-grid');
          if (daysGridEl && isOpen) {
            const now = new Date();
            const viewDate = new Date(now.getFullYear(), now.getMonth() + calMonthOffset, 1);
            renderMiniCalendar(viewDate, daysGridEl);
          }

          reportHeight();
          setTimeout(reportHeight, 40);
          setTimeout(reportHeight, 100);
          setTimeout(reportHeight, 200);
          setTimeout(reportHeight, 340);
        };
      }
      const calEl = document.getElementById('mini-calendar');
      if (calEl) {
        calEl.onclick = () => { if (window.topapp?.openCalendar) window.topapp.openCalendar(); };
      }
      updateClock();

      // 5b. Syscontrols (Volume, Brightness, Battery)
      if (document.getElementById('card-syscontrols')) {
        initSysControls();
      }

      // 6. RAM & Taskmgr
      const taskMgrBtn = document.getElementById('btn-open-taskmgr');
      if (taskMgrBtn) {
        taskMgrBtn.onclick = () => { if (window.topapp?.openTaskManager) window.topapp.openTaskManager(); };
      }
      const purgeBtn = document.getElementById('btn-purge-ram');
      if (purgeBtn) {
        purgeBtn.onclick = async () => {
          if (!window.topapp?.purgeRam) return;
          purgeBtn.textContent = 'Liberando...';
          purgeBtn.style.opacity = '0.7';
          try {
            const res = await window.topapp.purgeRam();
            if (res && res.ok && res.ramUsedGB) {
              const usedEl = document.getElementById('ram-used');
              const pctEl = document.getElementById('ram-pct');
              const barEl = document.getElementById('ram-bar');
              if (usedEl) usedEl.textContent = res.ramUsedGB.toFixed(1);
              const pct = Math.round((res.ramUsedGB / res.ramTotalGB) * 100);
              if (pctEl) pctEl.textContent = pct;
              if (barEl) barEl.style.width = pct + '%';
              const freedText = res.freedMB > 1024 ? (res.freedMB / 1024).toFixed(1) + ' GB' : Math.round(res.freedMB) + ' MB';
              purgeBtn.textContent = `✓ -${freedText}`;
              purgeBtn.style.color = '#00e5db';
            } else {
              purgeBtn.textContent = '✓ Liberada';
            }
          } catch (e) {
            purgeBtn.textContent = 'Liberar RAM';
          }
          purgeBtn.style.opacity = '1';
          setTimeout(() => {
            purgeBtn.textContent = 'Liberar RAM';
            purgeBtn.style.color = '';
          }, 3000);
        };
      }

      // 7. Printer
      const printBtn = document.getElementById('btn-open-print-queue');
      if (printBtn) {
        printBtn.onclick = () => {
          if (window.topapp?.openPrinterQueue) window.topapp.openPrinterQueue();
          else if (window.topapp) window.topapp.launchApp('ms-settings:printers');
        };
      }
      updatePrinter();

      // 8. Connectivity
      const wifiBtn = document.getElementById('btn-toggle-wifi');
      if (wifiBtn) {
        wifiBtn.onclick = async () => {
          if (!window.topapp?.toggleRadio || isTogglingRadio) return;
          isTogglingRadio = true;
          const badge = document.getElementById('wifi-status-badge');
          if (badge) { badge.className = 'conn-status-badge conn-status-busy'; badge.textContent = '...'; }
          try {
            const newState = await window.topapp.toggleRadio('wifi');
            if (newState) { lastRadioState = newState; applyRadioUI(newState); }
          } catch (e) {}
          isTogglingRadio = false;
        };
      }
      const btBtn = document.getElementById('btn-toggle-bt');
      if (btBtn) {
        btBtn.onclick = async () => {
          if (!window.topapp?.toggleRadio || isTogglingRadio) return;
          isTogglingRadio = true;
          const badge = document.getElementById('bt-status-badge');
          if (badge) { badge.className = 'conn-status-badge conn-status-busy'; badge.textContent = '...'; }
          try {
            const newState = await window.topapp.toggleRadio('bluetooth');
            if (newState) { lastRadioState = newState; applyRadioUI(newState); }
          } catch (e) {}
          isTogglingRadio = false;
        };
      }
      updateConnectivity();

      // 9. Search
      const doSearchBtn = document.getElementById('btn-do-search');
      const searchBox = document.getElementById('search-box');
      const filterSelect = document.getElementById('search-filter-select');
      const executeSearch = () => {
        const folder = config?.searchFolder || 'C:\\';
        const query = searchBox ? searchBox.value.trim() : '';
        const filterType = filterSelect ? filterSelect.value : 'all';
        if (window.topapp?.launchSearchExplorer) {
          window.topapp.launchSearchExplorer({ folder, query, filterType });
        }
      };
      if (doSearchBtn) doSearchBtn.onclick = executeSearch;
      if (searchBox) {
        searchBox.onkeydown = (e) => { if (e.key === 'Enter') executeSearch(); };
      }
      const browseBtn = document.getElementById('btn-browse-folder-widget');
      if (browseBtn) {
        browseBtn.onclick = async () => {
          if (window.topapp) {
            const folder = await window.topapp.chooseFolder();
            if (folder) {
              await window.topapp.saveConfig({ searchFolder: folder });
              render();
            }
          }
        };
      }

      if (document.getElementById('card-clipboard')) {
        renderClipboardUI(cachedClipboardItems);
      }

      updateStats();
      reportHeight();
    }

    async function init() {
      if (window.topapp) {
        config = await window.topapp.getConfig();
        window.config = config;
        applyStyles();
        render();

        window.topapp.onConfigChanged((cfg) => {
          config = cfg;
          window.config = cfg;
          applyStyles();
          render();
        });

        if (window.topapp.onClipboardChanged) {
          window.topapp.onClipboardChanged((items) => {
            cachedClipboardItems = items || [];
            renderClipboardUI(cachedClipboardItems);
          });
        }

        if (window.topapp.getClipboardHistory) {
          window.topapp.getClipboardHistory().then(items => {
            cachedClipboardItems = items || [];
            renderClipboardUI(cachedClipboardItems);
          });
        }
      }

      // Interval timers with presence gating for 0% idle CPU
      setInterval(() => {
        updateClock();
      }, 1000);

      setInterval(() => {
        updateStats();
      }, 2000);

      setInterval(() => {
        updatePrinter();
      }, 8000);

      setInterval(() => {
        updateConnectivity();
      }, 5000);

      setInterval(() => {
        if (document.getElementById('card-syscontrols') && window.topapp?.getSystemControls && !isUserDraggingVol && !isUserDraggingBright) {
          window.topapp.getSystemControls().then(applySysControlsUI);
        }
      }, 5000);

      setInterval(() => {
        loadDrives();
      }, 30000);

      // Auto-fit height to content
      const colEl = document.getElementById('widgets-list') || document.getElementById('left-widget-container');
      if (colEl && typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          reportHeight();
        });
        ro.observe(colEl);
      }

      // Curtain slide listeners
      if (side === 'left' && window.topapp?.onCurtainToggleLeft) {
        window.topapp.onCurtainToggleLeft((data) => {
          if (data && data.open === false) document.body.classList.add('curtain-closed');
          else document.body.classList.remove('curtain-closed');
        });
      } else if (side === 'right' && window.topapp?.onCurtainToggleRight) {
        window.topapp.onCurtainToggleRight((data) => {
          if (data && data.open === false) document.body.classList.add('curtain-closed');
          else document.body.classList.remove('curtain-closed');
        });
      }

      // Mouse pass-through solid barrier
      if (side === 'left' && window.topapp?.setLeftWidgetIgnoreMouse) {
        window.topapp.setLeftWidgetIgnoreMouse(false);
      } else if (side === 'right' && window.topapp?.setWidgetsIgnoreMouse) {
        window.topapp.setWidgetsIgnoreMouse(false);
      }

      reportHeight();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  };
});
