// TopApp WinTheme Pro - Master Application Controller
// Ana Tochka Editorial Minimal & Smooth Gradients Studio

import './style.css';
import { themeEngine, THEME_PRESETS, SMOOTH_GRADIENTS } from './themeEngine.js';
import { audioEngine, SOUND_PROFILES } from './audioEngine.js';
import { LiveWallpaperManager } from './liveWallpapers.js';
import { WidgetSuite } from './widgets.js';
import { DesktopSimulator } from './desktopSimulator.js';
import { WindowsThemeExporter } from './windowsThemeExporter.js';

class AppController {
  constructor() {
    this.appEl = document.getElementById('app');
    this.currentTab = 'desktop';
    this.exporter = new WindowsThemeExporter(themeEngine);
    this.liveWpManager = null;
    this.widgetSuite = null;
    this.desktopSim = null;

    this.init();
  }

  init() {
    this.renderAppShell();
    this.initSubsystems();
    this.bindGlobalEvents();
    this.renderActiveTab();
    this.updateBackground();

    themeEngine.subscribe((state) => {
      this.updateBackground();
      this.syncUIWithState(state);
    });
  }

  renderAppShell() {
    const s = themeEngine.getState();

    this.appEl.innerHTML = `
      <!-- Top Master Compact Header -->
      <header class="top-header">
        <div class="brand-section">
          <img src="/logo.svg" alt="TopApp Logo" class="brand-logo" />
          <div class="brand-text-col">
            <span class="brand-name">TopApp WinTheme Pro</span>
            <span class="brand-badge">Minimal Editorial Suite</span>
          </div>
        </div>

        <nav class="header-tabs">
          <button class="tab-btn active" data-tab="desktop">
            Escritorio en Vivo
          </button>
          <button class="tab-btn" data-tab="gradients">
            Degradados Suaves
          </button>
          <button class="tab-btn" data-tab="theme-studio">
            Paletas & Mica
          </button>
          <button class="tab-btn" data-tab="dock">
            Dock & Barra
          </button>
          <button class="tab-btn" data-tab="wallpapers">
            Fondo Personalizado
          </button>
          <button class="tab-btn" data-tab="sounds">
            Sonidos
          </button>
          <button class="tab-btn" data-tab="export">
            Exportar a Windows
          </button>
        </nav>

        <div class="header-actions">
          <button id="header-ambient-btn" class="action-pill-btn" title="Música Ambiente Relajante">
            Ambient Synth
          </button>
          <button id="header-fullscreen-btn" class="action-pill-btn" title="Modo Pantalla Completa">
            Inmersivo
          </button>
          <button id="header-export-btn" class="action-pill-btn primary" title="Exportar para Windows 10/11">
            Aplicar a Windows
          </button>
        </div>
      </header>

      <!-- Main Workspace Views -->
      <main class="app-workspace">
        <button id="exit-fullscreen-btn" class="fullscreen-exit-btn">✕ Salir de Pantalla Completa</button>

        <!-- VIEW 1: Live Desktop Simulator with Tochka Dashboard Widgets -->
        <section id="view-desktop" class="tab-view active-view">
          <div class="desktop-view-container">
            <div id="desktop-bg-image" class="desktop-bg-layer ${s.wallpaperType === 'gradient' ? 'bg-gradient' : ''}"></div>
            <canvas id="live-wallpaper-canvas" class="live-wallpaper-canvas"></canvas>

            <!-- Compact Editorial Dashboard Layer -->
            <div id="desktop-widgets-layer"></div>
            <!-- Interactive Desktop Canvas Layer (Taskbar, Windows, Icons) -->
            <div id="desktop-simulator-layer" class="desktop-canvas"></div>
          </div>
        </section>

        <!-- VIEW 2: Smooth Gradients Studio (Degradados Suaves & Lisos) -->
        <section id="view-gradients" class="tab-view">
          <div class="wallpapers-container">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 8px;">
              <div>
                <h2 class="wallpapers-category-title">Colección de Degradados Suaves & Lisos</h2>
                <p class="section-sub">Fondos mates, sobrios y continuos diseñados para máxima legibilidad, elegancia y estética profesional.</p>
              </div>
              <button id="btn-default-smooth-grad" class="tochka-btn-dark" style="font-weight: 700; gap: 6px; padding: 7px 14px; display: inline-flex; align-items: center;" title="Restablecer al degradado suave original Tochka">
                ↺ Degradado por Defecto
              </button>
            </div>

            <!-- Gradients Grid -->
            <div class="gradients-grid" id="smooth-gradients-grid">
              ${SMOOTH_GRADIENTS.map(g => `
                <div class="gradient-card ${s.smoothGradient === g.css ? 'active-gradient' : ''}" data-id="${g.id}">
                  <div class="gradient-preview-swatch" style="background: ${g.css};"></div>
                  <div class="gradient-card-info">
                    <div>
                      <div class="gradient-card-name">${g.name}</div>
                      <div class="gradient-card-sub">${g.subtitle}</div>
                    </div>
                    <button class="tochka-btn-cyan btn-small btn-apply-grad" data-id="${g.id}">Aplicar</button>
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="margin-top: 18px;">
              <h2 class="wallpapers-category-title">Generador Personalizado de Degradado Suave</h2>
              <p class="section-sub">Ajusta los tonos exactos y la dirección angular para crear tu fondo a medida.</p>
            </div>

            <div class="tochka-card" style="max-width: 640px; padding: 20px;">
              <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                <div>
                  <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Color Primario (Superior):</label>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="color" id="custom-grad-c1" class="color-swatch-input" value="${s.gradientColor1}" />
                    <span id="label-grad-c1" style="font-family: var(--font-mono); font-size: 0.8rem;">${s.gradientColor1}</span>
                  </div>
                </div>

                <div>
                  <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Color Secundario (Inferior):</label>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="color" id="custom-grad-c2" class="color-swatch-input" value="${s.gradientColor2}" />
                    <span id="label-grad-c2" style="font-family: var(--font-mono); font-size: 0.8rem;">${s.gradientColor2}</span>
                  </div>
                </div>

                <div style="flex: 1; min-width: 180px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 6px;">
                    <span>Ángulo del Degradado:</span>
                    <span id="label-grad-angle" class="tochka-tag-cyan" style="font-size: 0.75rem;">${s.gradientAngle}°</span>
                  </div>
                  <input type="range" id="slider-grad-angle" min="0" max="360" value="${s.gradientAngle}" class="tochka-range" />
                </div>
              </div>

              <div style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div id="custom-grad-preview" style="width: 140px; height: 38px; border-radius: 6px; border: 1px solid var(--card-border); background: ${s.smoothGradient};"></div>
                <button id="btn-apply-custom-grad" class="tochka-btn-cyan">
                  Establecer Degradado Personalizado
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- VIEW 3: Theme Studio (Presets & Mica) -->
        <section id="view-theme-studio" class="tab-view">
          <div class="studio-container">
            <aside class="studio-sidebar">
              <div>
                <h3 class="section-title">Esquemas Armónicos</h3>
                <p class="section-sub">Selecciona un esquema de colores para los indicadores y paneles.</p>
              </div>

              <div class="preset-grid">
                ${Object.entries(THEME_PRESETS).map(([key, p]) => `
                  <div class="preset-card ${s.activePresetKey === key ? 'active-preset' : ''}" data-preset="${key}">
                    <div class="preset-color-strip" style="background: ${p.gradient};"></div>
                    <div class="preset-info">
                      <span class="preset-name">${p.name}</span>
                      <span class="preset-sub">${p.subtitle}</span>
                    </div>
                    <span class="preset-badge">${p.badge}</span>
                  </div>
                `).join('')}
              </div>

              <button id="btn-reset-theme-default" class="tochka-btn-dark btn-small" style="width: 100%; justify-content: center; margin-top: 8px; font-weight: 700;" title="Restablecer al estilo Minimal Editorial (Tochka) por defecto">
                ↺ Restablecer al Estilo por Defecto (Tochka)
              </button>

              <div>
                <h3 class="section-title">Color de Énfasis Custom</h3>
                <div class="color-swatches-row" style="margin-top: 10px;">
                  <input type="color" id="custom-color-picker" class="color-swatch-input" value="${s.primaryColor}" />
                  <span id="custom-color-hex" style="font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem;">${s.primaryColor}</span>
                </div>
              </div>

              <div class="control-group">
                <div class="control-label-row">
                  <span>Desenfoque Mica / Acrylic</span>
                  <span id="val-blur" class="control-val-tag">${s.glassBlur}px</span>
                </div>
                <input type="range" id="slider-blur" class="fluent-range" min="4" max="36" value="${s.glassBlur}" />
              </div>

              <div class="control-group">
                <div class="control-label-row">
                  <span>Opacidad de Paneles</span>
                  <span id="val-opacity" class="control-val-tag">${Math.round(s.glassOpacity * 100)}%</span>
                </div>
                <input type="range" id="slider-opacity" class="fluent-range" min="30" max="98" value="${Math.round(s.glassOpacity * 100)}" />
              </div>

              <div>
                <h3 class="section-title">Modo de Contraste</h3>
                <div class="mode-toggle-group" style="margin-top: 10px;">
                  <button class="mode-btn ${s.mode === 'dark' ? 'active' : ''}" data-mode="dark">Oscuro Slate</button>
                  <button class="mode-btn ${s.mode === 'oled' ? 'active' : ''}" data-mode="oled">OLED Puro</button>
                  <button class="mode-btn ${s.mode === 'light' ? 'active' : ''}" data-mode="light">Claro</button>
                </div>
              </div>

              <div style="margin-top: 14px;">
                <h3 class="section-title">Barra de Tareas de Windows</h3>
                <p class="section-sub" style="font-size: 0.62rem; color: var(--text-muted); margin-bottom: 8px;">Por defecto una vez activado el tema NO aparecerá.</p>
                <label class="tochka-toggle-label" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255,255,255,0.04); padding: 8px 10px; border-radius: 6px; border: 1px solid var(--card-border);">
                  <span style="font-size: 0.72rem; font-weight: 600; color: var(--text-white);">Mostrar Barra Inferior</span>
                  <input type="checkbox" id="toggle-taskbar-studio-checkbox" ${s.showWindowsTaskbar ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-cyan);" />
                </label>
                <button id="btn-goto-dock-config" class="tochka-btn-cyan btn-small" style="width: 100%; justify-content: center; margin-top: 8px; font-weight: 600;">
                  ⚙ Ajustes PRO del Dock →
                </button>
              </div>
            </aside>

            <div class="studio-main-preview">
              <div class="preview-header-row">
                <div>
                  <h2 class="section-title">Vista Previa de Ventana Mica & Acrylic en Vivo</h2>
                  <p class="section-sub">Observa en tiempo real cómo reacciona el cristal translúcido, desenfoque de fondo y color de énfasis al modificar los controles.</p>
                </div>
                <div class="preview-live-badges">
                  <span class="preview-badge-pill">Desenfoque: <strong id="badge-live-blur">${s.glassBlur}px</strong></span>
                  <span class="preview-badge-pill">Opacidad: <strong id="badge-live-opacity">${Math.round(s.glassOpacity * 100)}%</strong></span>
                  <span class="preview-badge-pill">Modo: <strong id="badge-live-mode">${s.mode === 'oled' ? 'OLED Puro' : (s.mode === 'light' ? 'Claro' : 'Oscuro Slate')}</strong></span>
                </div>
              </div>

              <!-- Live Mica Window Showcase Stage -->
              <div class="studio-stage-canvas" id="studio-stage-canvas" style="${s.wallpaperType === 'image' ? `background-image: url('${s.wallpaperSrc}'); background-size: cover;` : `background: ${s.smoothGradient};`}">
                <div class="stage-floating-orb stage-orb-1"></div>
                <div class="stage-floating-orb stage-orb-2"></div>
                <div class="stage-floating-grid"></div>

                <!-- Realistic Acrylic Glass Sample Window -->
                <div class="studio-sample-window" id="studio-sample-window">
                  <div class="sample-window-titlebar">
                    <div class="mac-window-traffic-lights">
                      <span class="traffic-light light-close"><span class="traffic-symbol">✕</span></span>
                      <span class="traffic-light light-minimize"><span class="traffic-symbol">─</span></span>
                      <span class="traffic-light light-maximize"><span class="traffic-symbol">□</span></span>
                    </div>
                    <div class="sample-titlebar-title">TopApp Workspace — Explorador (Vista Previa en Vivo)</div>
                    <div class="sample-search-pill">Buscar archivos</div>
                  </div>

                  <div class="sample-window-toolbar">
                    <div class="path-bar">
                      <span>📁 Proyectos</span> › <span class="path-active" style="color: var(--win-accent);">TopApp-WinTheme</span>
                    </div>
                    <div class="sample-badge-mica">Material: Mica Alt Fluent</div>
                  </div>

                  <div class="sample-window-body">
                    <div class="sample-window-sidebar">
                      <div class="sidebar-cat">Favoritos</div>
                      <div class="sidebar-item active"><span>★</span> Proyectos</div>
                      <div class="sidebar-item"><span>🖼️</span> Fondos 8K</div>
                      <div class="sidebar-item"><span>🎵</span> Sonidos</div>
                      <div class="sidebar-cat" style="margin-top: 6px;">Ubicaciones</div>
                      <div class="sidebar-item"><span>💿</span> Disco C:</div>
                    </div>

                    <div class="sample-window-content">
                      <div class="file-grid" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 6px;">
                        <div class="file-item">
                          <div class="file-thumb" style="background: rgba(220, 38, 38, 0.2); color: #ef4444; font-weight: 800; font-size: 0.6rem;">PDF</div>
                          <div>
                            <div class="file-name">Informe_Q4.pdf</div>
                            <div class="file-meta">1.4 MB</div>
                          </div>
                        </div>
                        <div class="file-item">
                          <div class="file-thumb" style="background: rgba(var(--win-accent-rgb), 0.2); color: var(--win-accent); font-weight: 800; font-size: 0.65rem;">PSD</div>
                          <div>
                            <div class="file-name">Photoshop.psd</div>
                            <div class="file-meta">45 MB</div>
                          </div>
                        </div>
                        <div class="file-item">
                          <div class="file-thumb" style="background: #064e3b; color: #34d399; font-weight: 800; font-size: 0.6rem;">CDR</div>
                          <div>
                            <div class="file-name">CorelDRAW.cdr</div>
                            <div class="file-meta">18 MB</div>
                          </div>
                        </div>
                        <div class="file-item">
                          <div class="file-thumb file-thumb-blue">🖼️</div>
                          <div>
                            <div class="file-name">Fondo_8K.jpg</div>
                            <div class="file-meta">2.8 MB</div>
                          </div>
                        </div>
                        <div class="file-item">
                          <div class="file-thumb file-thumb-coral">&lt;/&gt;</div>
                          <div>
                            <div class="file-name">Engine.ts</div>
                            <div class="file-meta">12 KB</div>
                          </div>
                        </div>
                        <div class="file-item">
                          <div class="file-thumb" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;">♫</div>
                          <div>
                            <div class="file-name">Chime.wav</div>
                            <div class="file-meta">1.2 MB</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="sample-window-statusbar">
                    <span class="sample-status-text">6 elementos • 1 seleccionado (1.4 MB) • Énfasis: <strong id="preview-accent-color-hex" style="color: var(--win-accent); font-family: var(--font-mono);">${s.primaryColor}</strong></span>
                    <span class="sample-resize-icon">⤡</span>
                  </div>
                </div>
              </div>

              <!-- Quick Info Cards -->
              <div class="showcase-grid">
                <div class="tochka-card" style="padding: 16px;">
                  <div class="tochka-badge-row" style="margin-bottom: 8px;">
                    <span class="tochka-pill">Resumen de Eficiencia</span>
                    <span class="tochka-sub-tag">July 2025 vs 2026</span>
                  </div>
                  <div class="tochka-headline-row">
                    <div>
                      <div class="metric-huge" style="color: var(--color-cyan);">+295%</div>
                      <div class="metric-desc">Rendimiento de procesamiento optimizado</div>
                    </div>
                    <div style="text-align: right;">
                      <div class="metric-huge color-coral">-42%</div>
                      <div class="metric-desc">Consumo de recursos en espera</div>
                    </div>
                  </div>
                </div>

                <div class="tochka-card" style="padding: 16px;">
                  <div class="tochka-badge-row" style="margin-bottom: 8px;">
                    <span class="tochka-pill">Telemetría Gráfica</span>
                    <span class="tochka-sub-tag">Visualización Minimalista</span>
                  </div>
                  <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.45;">
                    Los widgets en la vista principal integran en un espacio comprimido la monitorización de <strong>16 núcleos CPU</strong>, telemetría térmica, cola de impresión y purga de RAM.
                  </p>
                  <button class="action-pill-btn primary" id="btn-show-desktop-direct" style="margin-top: 10px; width: fit-content;">
                    Ver en el Escritorio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- VIEW: PRO Dock & Taskbar Studio -->
        <section id="view-dock" class="tab-view">
          <div class="dock-studio-container">
            <!-- Stage Hero Live Preview -->
            <div class="dock-preview-hero">
              <div class="preview-header-row">
                <div>
                  <div class="tochka-badge-row" style="margin-bottom: 6px;">
                    <span class="tochka-pill">Simulación en Tiempo Real</span>
                    <span class="tochka-sub-tag">macOS Wave Physics + Windows 11 Fluent</span>
                  </div>
                  <h2 class="section-title">Estudio PRO del Dock & Barra de Tareas</h2>
                  <p class="section-sub">Ajusta milimétricamente el tamaño de los iconos, separación, efecto de aumento por onda y los modos de integración.</p>
                </div>
                <div class="preview-live-badges">
                  <span class="preview-badge-pill">Modo: <strong id="badge-dock-mode">Isla Flotante</strong></span>
                  <span class="preview-badge-pill">Iconos: <strong id="badge-dock-size">${(s.dockConfig && s.dockConfig.iconSize) || 38}px</strong></span>
                  <span class="preview-badge-pill">Separación: <strong id="badge-dock-gap">${(s.dockConfig && s.dockConfig.iconGap) || 7}px</strong></span>
                  <span class="preview-badge-pill">Onda: <strong id="badge-dock-wave">${(s.dockConfig && s.dockConfig.waveEnabled) ? `Activa (${(s.dockConfig && s.dockConfig.waveScale) || 1.45}x)` : 'Desactivada'}</strong></span>
                </div>
              </div>

              <!-- Interactive Stage Canvas -->
              <div class="dock-stage-canvas" id="dock-stage-canvas" style="${s.wallpaperType === 'image' ? `background-image: url('${s.wallpaperSrc}'); background-size: cover;` : `background: ${s.smoothGradient};`}">
                <div class="stage-floating-orb stage-orb-1"></div>
                <div class="stage-floating-orb stage-orb-2"></div>
                <div class="stage-floating-grid"></div>

                <div class="dock-stage-hint">
                  <span>✨ Pasa el ratón por encima del dock de prueba para sentir la física del aumento dinámico</span>
                </div>

                <!-- Live Sample Dock Wrap -->
                <div class="dock-stage-dock-wrap align-${(s.dockConfig && s.dockConfig.alignment) || 'center'}" id="dock-stage-dock-wrap">
                  <div class="mac-dock-shelf sample-dock-shelf" id="sample-dock-shelf">
                    <div class="mac-dock-item win-start-dock-item" title="Inicio de Windows">
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

                    <div class="mac-dock-separator"></div>

                    <div class="mac-dock-item" data-name="Carpeta de Archivos">
                      <div class="mac-dock-icon" style="background: linear-gradient(135deg, #2563eb, #1d4ed8);">
                        <span class="dock-glyph-svg" style="color: #ffffff;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></span>
                      </div>
                      <span class="dock-running-dot"></span>
                      <div class="dock-hover-tooltip">Explorador</div>
                    </div>

                    <div class="mac-dock-item" data-name="Safari Web">
                      <div class="mac-dock-icon" style="background: linear-gradient(135deg, #0284c7, #0369a1);">
                        <span class="dock-glyph-svg" style="color: #ffffff;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg></span>
                      </div>
                      <div class="dock-hover-tooltip">Navegador</div>
                    </div>

                    <div class="mac-dock-item" data-name="Terminal PowerShell">
                      <div class="mac-dock-icon" style="background: linear-gradient(135deg, #0f172a, #020617);">
                        <span class="dock-glyph-svg" style="color: #ffffff;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg></span>
                      </div>
                      <span class="dock-running-dot"></span>
                      <div class="dock-hover-tooltip">Terminal</div>
                    </div>

                    <div class="mac-dock-item" data-name="Visual Studio Code">
                      <div class="mac-dock-icon" style="background: linear-gradient(135deg, #0284c7, #007acc);">
                        <span class="dock-glyph-svg" style="color: #ffffff;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg></span>
                      </div>
                      <span class="dock-running-dot"></span>
                      <div class="dock-hover-tooltip">VS Code</div>
                    </div>

                    <div class="mac-dock-item" data-name="Spotify">
                      <div class="mac-dock-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <span class="dock-glyph-svg" style="color: #ffffff;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></span>
                      </div>
                      <div class="dock-hover-tooltip">Spotify</div>
                    </div>

                    <div class="mac-dock-item" data-name="Ajustes TopApp">
                      <div class="mac-dock-icon" style="background: linear-gradient(135deg, #475569, #334155);">
                        <span class="dock-glyph-svg" style="color: #ffffff;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span>
                      </div>
                      <div class="dock-hover-tooltip">Ajustes</div>
                    </div>

                    <div class="mac-dock-separator"></div>

                    <!-- Add Application Button (+) -->
                    <div class="mac-dock-item btn-add-dock-app" title="Añadir Aplicación">
                      <div class="mac-dock-icon add-icon-box">
                        <span class="plus-symbol">+</span>
                      </div>
                      <div class="dock-hover-tooltip">Añadir</div>
                    </div>

                    <!-- Settings Button (⚙) -->
                    <div class="mac-dock-item btn-dock-settings" title="Configuración PRO">
                      <div class="mac-dock-icon add-icon-box" style="border-style: solid; border-color: rgba(255, 255, 255, 0.2); background: rgba(0, 229, 219, 0.12) !important;">
                        <span style="font-size: 0.95rem; color: var(--color-cyan); line-height: 1;">⚙</span>
                      </div>
                      <div class="dock-hover-tooltip">Ajustes PRO</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Controls Cards Grid -->
            <div class="dock-controls-grid">
              <!-- CARD 1: Dimensiones y Espaciado -->
              <div class="dock-control-card">
                <div class="dock-card-header">
                  <div class="dock-card-title-group">
                    <span class="dock-card-title">📏 Tamaño de Iconos y Distancia</span>
                    <span class="dock-card-sub">Escala milimétrica adaptativa y separación</span>
                  </div>
                  <button class="action-pill-btn" id="btn-reset-dock-default" style="font-size: 0.64rem; padding: 4px 10px;">
                    Restaurar Predeterminado
                  </button>
                </div>

                <!-- Slider 1: Tamaño de Icono -->
                <div class="dock-slider-row">
                  <div class="dock-slider-label-row">
                    <span class="dock-slider-label">Tamaño de Iconos del Dock</span>
                    <span class="dock-slider-val" id="val-dock-size">${(s.dockConfig && s.dockConfig.iconSize) || 38}px</span>
                  </div>
                  <input type="range" id="slider-dock-size" min="28" max="64" step="2" value="${(s.dockConfig && s.dockConfig.iconSize) || 38}" style="width: 100%; accent-color: var(--color-cyan);" />
                  <div class="dock-chip-group">
                    <button class="dock-chip btn-dock-chip" data-size="30">30px Compacto</button>
                    <button class="dock-chip btn-dock-chip" data-size="38">38px Estándar PRO</button>
                    <button class="dock-chip btn-dock-chip" data-size="48">48px Grande</button>
                    <button class="dock-chip btn-dock-chip" data-size="58">58px Máximo</button>
                  </div>
                </div>

                <!-- Slider 2: Separación / Distancia -->
                <div class="dock-slider-row">
                  <div class="dock-slider-label-row">
                    <span class="dock-slider-label">Distancia entre Iconos (Espaciado)</span>
                    <span class="dock-slider-val" id="val-dock-gap">${(s.dockConfig && s.dockConfig.iconGap) || 7}px</span>
                  </div>
                  <input type="range" id="slider-dock-gap" min="2" max="22" step="1" value="${(s.dockConfig && s.dockConfig.iconGap) || 7}" style="width: 100%; accent-color: var(--color-cyan);" />
                  <div class="dock-chip-group">
                    <button class="dock-chip btn-dock-gap-chip" data-gap="3">3px Pegado</button>
                    <button class="dock-chip btn-dock-gap-chip" data-gap="7">7px Pro Tochka</button>
                    <button class="dock-chip btn-dock-gap-chip" data-gap="12">12px Aireado</button>
                    <button class="dock-chip btn-dock-gap-chip" data-gap="18">18px Amplio</button>
                  </div>
                </div>
              </div>

              <!-- CARD 2: Física de Onda de Aumento -->
              <div class="dock-control-card">
                <div class="dock-card-header">
                  <div class="dock-card-title-group">
                    <span class="dock-card-title">🌊 Efecto Onda de Aumento (Wave Magnification)</span>
                    <span class="dock-card-sub">Física fluida interactiva tipo macOS Dock</span>
                  </div>
                  <label class="tochka-toggle-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <span style="font-size: 0.68rem; font-weight: 600; color: var(--text-white);">Activar Onda</span>
                    <input type="checkbox" id="toggle-dock-wave" ${(s.dockConfig && s.dockConfig.waveEnabled) !== false ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-cyan);" />
                  </label>
                </div>

                <!-- Slider Wave Scale -->
                <div class="dock-slider-row">
                  <div class="dock-slider-label-row">
                    <span class="dock-slider-label">Factor de Aumento (Escala de Onda)</span>
                    <span class="dock-slider-val" id="val-dock-scale">${((s.dockConfig && s.dockConfig.waveScale) || 1.45).toFixed(2)}x</span>
                  </div>
                  <input type="range" id="slider-dock-scale" min="1.10" max="2.00" step="0.05" value="${(s.dockConfig && s.dockConfig.waveScale) || 1.45}" style="width: 100%; accent-color: var(--color-cyan);" />
                  <div class="dock-chip-group">
                    <button class="dock-chip btn-dock-scale-chip" data-scale="1.25">1.25x Suave</button>
                    <button class="dock-chip btn-dock-scale-chip" data-scale="1.45">1.45x macOS Natural</button>
                    <button class="dock-chip btn-dock-scale-chip" data-scale="1.70">1.70x Destacado</button>
                    <button class="dock-chip btn-dock-scale-chip" data-scale="1.95">1.95x Épico</button>
                  </div>
                </div>

                <!-- Slider Wave Radius -->
                <div class="dock-slider-row">
                  <div class="dock-slider-label-row">
                    <span class="dock-slider-label">Radio de Influencia de la Onda</span>
                    <span class="dock-slider-val" id="val-dock-radius">${(s.dockConfig && s.dockConfig.waveRadius) || 90}px</span>
                  </div>
                  <input type="range" id="slider-dock-radius" min="40" max="180" step="5" value="${(s.dockConfig && s.dockConfig.waveRadius) || 90}" style="width: 100%; accent-color: var(--color-cyan);" />
                  <p style="font-size: 0.62rem; color: var(--text-muted); margin: 0; line-height: 1.35;">
                    Determina a qué distancia los iconos contiguos comienzan a curvarse hacia arriba y expandirse suavemente según el puntero.
                  </p>
                </div>
              </div>

              <!-- CARD 3: Modos de Presentación -->
              <div class="dock-control-card">
                <div class="dock-card-header">
                  <div class="dock-card-title-group">
                    <span class="dock-card-title">🖥️ Modo de Presentación</span>
                    <span class="dock-card-sub">Elige cómo se integra el dock en la pantalla</span>
                  </div>
                </div>

                <div class="dock-mode-list">
                  <!-- Mode 1: Floating Island -->
                  <div class="dock-mode-card ${(!s.dockConfig || s.dockConfig.presentationMode === 'floating') ? 'active-mode' : ''}" data-mode="floating">
                    <div class="dock-mode-info">
                      <div class="dock-mode-icon-box">🏝️</div>
                      <div class="dock-mode-texts">
                        <div class="dock-mode-name">Isla Flotante Glass</div>
                        <div class="dock-mode-desc">Cápsula de cristal acrílico curvada y suspendida sobre el escritorio con Mica y sombras fluidas.</div>
                      </div>
                    </div>
                    <span class="dock-mode-tag">RECOMENDADO</span>
                  </div>

                  <!-- Mode 2: Windows 11 Taskbar -->
                  <div class="dock-mode-card ${(s.dockConfig && s.dockConfig.presentationMode === 'pinned-bar') ? 'active-mode' : ''}" data-mode="pinned-bar">
                    <div class="dock-mode-info">
                      <div class="dock-mode-icon-box">🪟</div>
                      <div class="dock-mode-texts">
                        <div class="dock-mode-name">Barra Windows 11 Fluent</div>
                        <div class="dock-mode-desc">Barra continua de borde a borde inferior de pantalla con Mica Alt y borde superior iluminado.</div>
                      </div>
                    </div>
                    <span class="dock-mode-tag">FULL WIDTH</span>
                  </div>

                  <!-- Mode 3: Minimal -->
                  <div class="dock-mode-card ${(s.dockConfig && s.dockConfig.presentationMode === 'minimal') ? 'active-mode' : ''}" data-mode="minimal">
                    <div class="dock-mode-info">
                      <div class="dock-mode-icon-box">✨</div>
                      <div class="dock-mode-texts">
                        <div class="dock-mode-name">Minimalista Flotante</div>
                        <div class="dock-mode-desc">Iconos limpios flotantes sin carcasa ni fondo, máxima pureza gráfica y ligereza visual.</div>
                      </div>
                    </div>
                    <span class="dock-mode-tag">PURE ICONS</span>
                  </div>
                </div>
              </div>

              <!-- CARD 4: Alineación, Ocultación y Marcadores -->
              <div class="dock-control-card">
                <div class="dock-card-header">
                  <div class="dock-card-title-group">
                    <span class="dock-card-title">⚙️ Alineación & Conducta PRO</span>
                    <span class="dock-card-sub">Posición horizontal, auto-ocultar e indicadores</span>
                  </div>
                </div>

                <!-- Alignment Selector -->
                <div class="dock-slider-row">
                  <span class="dock-slider-label">Alineación Horizontal en Pantalla</span>
                  <div class="dock-segmented-group">
                    <button class="dock-segmented-btn dock-align-btn ${(!s.dockConfig || s.dockConfig.alignment === 'center') ? 'active-seg' : ''}" data-align="center">
                      <span>↔ Centrado</span>
                    </button>
                    <button class="dock-segmented-btn dock-align-btn ${(s.dockConfig && s.dockConfig.alignment === 'left') ? 'active-seg' : ''}" data-align="left">
                      <span>⬅ Izquierda</span>
                    </button>
                    <button class="dock-segmented-btn dock-align-btn ${(s.dockConfig && s.dockConfig.alignment === 'right') ? 'active-seg' : ''}" data-align="right">
                      <span>➡ Derecha</span>
                    </button>
                  </div>
                </div>

                <!-- Auto-hide & Taskbar options -->
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <label class="tochka-toggle-label" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--card-border);">
                    <div>
                      <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-white);">Auto-ocultar Dock Automáticamente</div>
                      <div style="font-size: 0.62rem; color: var(--text-muted);">Se esconde en el borde y reaparece suavemente al acercar el puntero</div>
                    </div>
                    <input type="checkbox" id="toggle-dock-autohide-cb" ${(s.dockConfig && s.dockConfig.autoHide) ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-cyan);" />
                  </label>

                  <label class="tochka-toggle-label" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--card-border);">
                    <div>
                      <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-white);">Visibilidad de Barra de Windows</div>
                      <div style="font-size: 0.62rem; color: var(--text-muted);">Oculta o muestra la barra de tareas por defecto de Windows</div>
                    </div>
                    <input type="checkbox" id="toggle-dock-visibility-cb" ${s.showWindowsTaskbar ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-cyan);" />
                  </label>
                </div>

                <!-- Indicator Style -->
                <div class="dock-slider-row">
                  <span class="dock-slider-label">Estilo del Indicador de App en Ejecución</span>
                  <div class="dock-segmented-group">
                    <button class="dock-segmented-btn dock-indicator-btn ${(!s.dockConfig || s.dockConfig.indicatorStyle === 'dot') ? 'active-seg' : ''}" data-indicator="dot">
                      <span>• Punto Neón</span>
                    </button>
                    <button class="dock-segmented-btn dock-indicator-btn ${(s.dockConfig && s.dockConfig.indicatorStyle === 'line') ? 'active-seg' : ''}" data-indicator="line">
                      <span>▬ Línea Cápsula</span>
                    </button>
                    <button class="dock-segmented-btn dock-indicator-btn ${(s.dockConfig && s.dockConfig.indicatorStyle === 'glow') ? 'active-seg' : ''}" data-indicator="glow">
                      <span>🔆 Resplandor</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- VIEW 4: Wallpapers 8K & Custom Wallpaper -->
        <section id="view-wallpapers" class="tab-view">
          <div class="wallpapers-container">
            <!-- Custom Wallpaper Upload Section -->
            <div class="custom-wp-section">
              <div class="custom-wp-header">
                <h2 class="wallpapers-category-title">Tu Fondo Personalizado</h2>
                <p class="section-sub">Sube cualquier imagen desde tu ordenador o introduce una dirección URL para usarla como fondo del sistema.</p>
              </div>

              <div class="custom-wp-card">
                <div class="custom-wp-inputs-col">
                  <!-- File input from PC -->
                  <input type="file" id="custom-wallpaper-file-input" accept="image/*" style="display: none;" />
                  <button id="btn-browse-custom-wp" class="tochka-btn-cyan" style="width: 100%; justify-content: center; padding: 10px 14px; font-size: 0.75rem;">
                    Seleccionar Imagen desde tu PC (.jpg, .png, .webp)
                  </button>

                  <div class="custom-wp-divider">
                    <span>o bien introduce una URL web directa</span>
                  </div>

                  <!-- URL Input -->
                  <div class="custom-wp-url-row">
                    <input type="url" id="custom-wallpaper-url-input" class="tochka-input-text" placeholder="https://ejemplo.com/mi-fondo-4k.jpg" />
                    <button id="btn-apply-wp-url" class="tochka-btn-dark btn-small" style="white-space: nowrap;">Cargar URL</button>
                  </div>
                </div>

                <!-- Preview Box of Current Wallpaper -->
                <div class="custom-wp-preview-box">
                  <div class="custom-wp-preview-thumb" id="custom-wp-preview-thumb" style="${s.wallpaperType === 'image' ? `background-image: url('${s.wallpaperSrc}'); background-size: cover;` : `background: ${s.smoothGradient};`}">
                    <span class="custom-wp-current-badge">${s.wallpaperType === 'image' ? 'Imagen Activa' : 'Degradado'}</span>
                  </div>
                  <div class="custom-wp-preview-label">
                    <span id="custom-wp-filename" style="font-weight: 600; font-size: 0.65rem; color: var(--text-white);">${s.customWallpaper ? s.customWallpaper.name : (s.wallpaperType === 'image' ? 'Fondo Personalizado Activo' : 'Degradado Suave Activo')}</span>
                    <button id="btn-reset-default-wp" class="tochka-btn-dark btn-small" title="Restablecer fondo por defecto">Restablecer a Degradado</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- VIEW 5: Sound Schemes Studio -->
        <section id="view-sounds" class="tab-view">
          <div class="sound-studio-container">
            <div class="sound-studio-header">
              <div>
                <h2 class="section-title">Laboratorio de Sonidos Sintetizados (Web Audio)</h2>
                <p class="section-sub">Activa o desactiva cada evento sonoro de forma independiente y elige su perfil o timbre acústico.</p>
              </div>
              <div class="sound-global-controls">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 0.68rem; color: var(--text-muted);">Volumen:</span>
                  <input type="range" id="sound-master-volume" min="0" max="100" value="${Math.round(audioEngine.volume * 100)}" class="tochka-range" style="width: 80px;" />
                  <span id="sound-volume-label" style="font-size: 0.68rem; font-family: var(--font-mono); color: var(--color-cyan);">${Math.round(audioEngine.volume * 100)}%</span>
                </div>
                <button id="btn-master-mute" class="tochka-btn-dark btn-small" title="Silenciar o reactivar todos los sonidos">
                  ${audioEngine.muted ? '🔇 Desmutear' : '🔊 Silenciar Todo'}
                </button>
                <button id="btn-reset-sounds-default" class="tochka-btn-dark btn-small" title="Restablecer todos los sonidos a la configuración de fábrica">
                  ↺ Por Defecto
                </button>
              </div>
            </div>

            <div class="sound-events-table" id="sound-events-table"></div>
          </div>
        </section>

        <!-- VIEW 6: Windows Native Exporter -->
        <section id="view-export" class="tab-view">
          <div class="export-container">
            <div class="export-hero-banner">
              <div class="export-hero-content">
                <h1 class="export-hero-title">Aplica este Tema a tu Windows Real</h1>
                <p class="export-hero-text">
                  Descarga el paquete oficial nativo de Windows (<code>.theme</code>) o ejecuta el script de PowerShell automatizado que configura el fondo degradado liso o 8K, color de énfasis cian, y modo oscuro en 1 clic.
                </p>
              </div>
              <button id="download-all-btn" class="action-pill-btn primary" style="font-size: 0.95rem; padding: 12px 24px;">
                Descargar Script 1-Clic (.ps1)
              </button>
            </div>

            <div class="export-cards-grid">
              <div class="export-card">
                <h3 class="export-card-title">Archivo de Tema Oficial (.theme)</h3>
                <p class="export-card-desc">Formato estándar de Windows 10/11 con paleta Cyan Tochka y modo oscuro.</p>
                <button id="btn-download-theme" class="action-pill-btn">
                  Descargar Archivo .theme
                </button>
              </div>

              <div class="export-card">
                <h3 class="export-card-title">Instalador Automático PowerShell</h3>
                <p class="export-card-desc">Script que aplica el color de énfasis DWM y modo oscuro en tu Windows real.</p>
                <button id="btn-download-ps1" class="action-pill-btn primary">
                  Descargar Apply-WinTheme.ps1
                </button>
              </div>
            </div>

            <div class="export-card" style="margin-top: 10px;">
              <h3 class="export-card-title">Ejecución Directa en PowerShell:</h3>
              <div class="code-snippet-box">
                <span id="snippet-code-text">powershell -ExecutionPolicy Bypass -File .\\Apply-TopApp-WinTheme.ps1</span>
                <button id="btn-copy-snippet" class="btn-copy-code">Copiar</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  }

  initSubsystems() {
    const canvas = document.getElementById('live-wallpaper-canvas');
    if (canvas) {
      this.liveWpManager = new LiveWallpaperManager(canvas, themeEngine);
      this.liveWpManager.start();
    }

    const widgetsLayer = document.getElementById('desktop-widgets-layer');
    if (widgetsLayer) {
      this.widgetSuite = new WidgetSuite(widgetsLayer, themeEngine);
    }

    const simLayer = document.getElementById('desktop-simulator-layer');
    if (simLayer) {
      this.desktopSim = new DesktopSimulator(simLayer, themeEngine);
    }

    this.renderSoundEventsTable();
  }

  updateBackground() {
    const s = themeEngine.getState();
    const bgImage = document.getElementById('desktop-bg-image');
    const canvas = document.getElementById('live-wallpaper-canvas');

    if (!bgImage) return;

    if (s.wallpaperType === 'image') {
      bgImage.classList.remove('bg-gradient');
      bgImage.style.background = 'none';
      bgImage.style.backgroundColor = 'transparent';
      const src = (s.customWallpaper && s.customWallpaper.src) || s.wallpaperSrc;
      bgImage.style.backgroundImage = `url("${src}")`;
      bgImage.style.backgroundSize = 'cover';
      bgImage.style.backgroundPosition = 'center';
      bgImage.style.backgroundRepeat = 'no-repeat';
      bgImage.style.display = 'block';
      if (canvas) canvas.style.display = 'none';
    } else if (s.wallpaperType === 'gradient') {
      bgImage.classList.add('bg-gradient');
      bgImage.style.backgroundImage = 'none';
      bgImage.style.background = s.smoothGradient;
      bgImage.style.display = 'block';
      if (canvas) canvas.style.display = 'none';
    } else {
      bgImage.classList.remove('bg-gradient');
      bgImage.style.display = 'none';
      if (canvas) canvas.style.display = 'block';
    }
  }

  syncUIWithState(state) {
    document.querySelectorAll('.preset-card[data-preset]').forEach(card => {
      card.classList.toggle('active-preset', card.dataset.preset === state.activePresetKey);
    });

    document.querySelectorAll('.gradient-card').forEach(card => {
      const gradObj = SMOOTH_GRADIENTS.find(g => g.id === card.dataset.id);
      card.classList.toggle('active-gradient', gradObj && gradObj.css === state.smoothGradient);
    });

    const valBlur = document.getElementById('val-blur');
    if (valBlur) valBlur.textContent = `${state.glassBlur}px`;
    const sliderBlur = document.getElementById('slider-blur');
    if (sliderBlur) sliderBlur.value = state.glassBlur;

    const valOpacity = document.getElementById('val-opacity');
    if (valOpacity) valOpacity.textContent = `${Math.round(state.glassOpacity * 100)}%`;
    const sliderOpacity = document.getElementById('slider-opacity');
    if (sliderOpacity) sliderOpacity.value = Math.round(state.glassOpacity * 100);

    const colorPicker = document.getElementById('custom-color-picker');
    const colorHex = document.getElementById('custom-color-hex');
    if (colorPicker) colorPicker.value = state.primaryColor;
    if (colorHex) colorHex.textContent = state.primaryColor;

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === state.mode);
    });

    // Sync wallpaper preview thumb & active card
    const wpThumb = document.getElementById('custom-wp-preview-thumb');
    const wpFname = document.getElementById('custom-wp-filename');
    if (wpThumb) {
      if (state.wallpaperType === 'image') {
        wpThumb.style.backgroundImage = `url('${state.wallpaperSrc}')`;
        wpThumb.style.backgroundSize = 'cover';
        wpThumb.style.background = '';
      } else {
        wpThumb.style.backgroundImage = 'none';
        wpThumb.style.background = state.smoothGradient;
      }
    }
    if (wpFname) {
      wpFname.textContent = state.customWallpaper 
        ? state.customWallpaper.name 
        : (state.wallpaperType === 'image' ? 'Fondo Personalizado Activo' : 'Degradado Activo');
    }

    const taskbarStudioCb = document.getElementById('toggle-taskbar-studio-checkbox');
    if (taskbarStudioCb) {
      taskbarStudioCb.checked = !!state.showWindowsTaskbar;
    }

    // Sync Live Mica Window Preview Badges & Stage Background
    const bBlur = document.getElementById('badge-live-blur');
    if (bBlur) bBlur.textContent = `${state.glassBlur}px`;

    const bOpacity = document.getElementById('badge-live-opacity');
    if (bOpacity) bOpacity.textContent = `${Math.round(state.glassOpacity * 100)}%`;

    const bMode = document.getElementById('badge-live-mode');
    if (bMode) bMode.textContent = state.mode === 'oled' ? 'OLED Puro' : (state.mode === 'light' ? 'Claro' : 'Oscuro Slate');

    const pAccentHex = document.getElementById('preview-accent-color-hex');
    if (pAccentHex) pAccentHex.textContent = state.primaryColor;

    const stageCanvas = document.getElementById('studio-stage-canvas');
    if (stageCanvas) {
      if (state.wallpaperType === 'image') {
        stageCanvas.style.backgroundImage = `url('${state.wallpaperSrc}')`;
        stageCanvas.style.backgroundSize = 'cover';
        stageCanvas.style.background = '';
      } else {
        stageCanvas.style.backgroundImage = 'none';
        stageCanvas.style.background = state.smoothGradient;
      }
    }

    // Sync PRO Dock Studio
    const dockCfg = state.dockConfig || {
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

    const bDockMode = document.getElementById('badge-dock-mode');
    if (bDockMode) {
      bDockMode.textContent = dockCfg.presentationMode === 'pinned-bar'
        ? 'Barra Windows 11 Fluent'
        : (dockCfg.presentationMode === 'minimal' ? 'Minimalista Flotante' : 'Isla Flotante Glass');
    }

    const bDockSize = document.getElementById('badge-dock-size');
    if (bDockSize) bDockSize.textContent = `${dockCfg.iconSize}px`;
    const sDockSize = document.getElementById('slider-dock-size');
    if (sDockSize) sDockSize.value = dockCfg.iconSize;
    const vDockSize = document.getElementById('val-dock-size');
    if (vDockSize) vDockSize.textContent = `${dockCfg.iconSize}px`;

    const bDockGap = document.getElementById('badge-dock-gap');
    if (bDockGap) bDockGap.textContent = `${dockCfg.iconGap}px`;
    const sDockGap = document.getElementById('slider-dock-gap');
    if (sDockGap) sDockGap.value = dockCfg.iconGap;
    const vDockGap = document.getElementById('val-dock-gap');
    if (vDockGap) vDockGap.textContent = `${dockCfg.iconGap}px`;

    const bDockWave = document.getElementById('badge-dock-wave');
    if (bDockWave) {
      bDockWave.textContent = dockCfg.waveEnabled !== false
        ? `Activa (${(dockCfg.waveScale || 1.45).toFixed(2)}x)`
        : 'Desactivada';
    }
    const tDockWave = document.getElementById('toggle-dock-wave');
    if (tDockWave) tDockWave.checked = dockCfg.waveEnabled !== false;

    const sDockScale = document.getElementById('slider-dock-scale');
    if (sDockScale) sDockScale.value = dockCfg.waveScale || 1.45;
    const vDockScale = document.getElementById('val-dock-scale');
    if (vDockScale) vDockScale.textContent = `${(dockCfg.waveScale || 1.45).toFixed(2)}x`;

    const sDockRadius = document.getElementById('slider-dock-radius');
    if (sDockRadius) sDockRadius.value = dockCfg.waveRadius || 90;
    const vDockRadius = document.getElementById('val-dock-radius');
    if (vDockRadius) vDockRadius.textContent = `${dockCfg.waveRadius || 90}px`;

    // Active mode card
    document.querySelectorAll('.dock-mode-card').forEach(card => {
      card.classList.toggle('active-mode', card.dataset.mode === (dockCfg.presentationMode || 'floating'));
    });

    // Active alignment button
    document.querySelectorAll('.dock-align-btn').forEach(btn => {
      btn.classList.toggle('active-seg', btn.dataset.align === (dockCfg.alignment || 'center'));
    });

    // Active indicator button
    document.querySelectorAll('.dock-indicator-btn').forEach(btn => {
      btn.classList.toggle('active-seg', btn.dataset.indicator === (dockCfg.indicatorStyle || 'dot'));
    });

    // Active size chips
    document.querySelectorAll('.btn-dock-chip').forEach(chip => {
      chip.classList.toggle('active-chip', parseInt(chip.dataset.size, 10) === dockCfg.iconSize);
    });

    // Active gap chips
    document.querySelectorAll('.btn-dock-gap-chip').forEach(chip => {
      chip.classList.toggle('active-chip', parseInt(chip.dataset.gap, 10) === dockCfg.iconGap);
    });

    // Active scale chips
    document.querySelectorAll('.btn-dock-scale-chip').forEach(chip => {
      chip.classList.toggle('active-chip', Math.abs(parseFloat(chip.dataset.scale) - (dockCfg.waveScale || 1.45)) < 0.04);
    });

    // Dock auto-hide checkbox
    const cbAutoHide = document.getElementById('toggle-dock-autohide-cb');
    if (cbAutoHide) cbAutoHide.checked = !!dockCfg.autoHide;

    // Windows taskbar checkbox in dock view
    const cbDockTaskbar = document.getElementById('toggle-dock-visibility-cb');
    if (cbDockTaskbar) cbDockTaskbar.checked = !!state.showWindowsTaskbar;

    // Stage canvas background & alignment wrap
    const dockStageCanvas = document.getElementById('dock-stage-canvas');
    if (dockStageCanvas) {
      if (state.wallpaperType === 'image') {
        dockStageCanvas.style.backgroundImage = `url('${state.wallpaperSrc}')`;
        dockStageCanvas.style.backgroundSize = 'cover';
        dockStageCanvas.style.background = '';
      } else {
        dockStageCanvas.style.backgroundImage = 'none';
        dockStageCanvas.style.background = state.smoothGradient;
      }
    }

    const dockStageWrap = document.getElementById('dock-stage-dock-wrap');
    if (dockStageWrap) {
      dockStageWrap.className = `dock-stage-dock-wrap align-${dockCfg.alignment || 'center'}`;
    }
  }

  switchTab(tabId) {
    if (this.currentTab === tabId) return;
    this.currentTab = tabId;

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.toggle('active-view', view.id === `view-${tabId}`);
    });

    if (tabId === 'sounds') {
      this.renderSoundEventsTable();
    }

    audioEngine.playClick();
  }

  bindGlobalEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.switchTab(btn.dataset.tab);
      };
    });

    window.addEventListener('switch-tab', (e) => {
      if (e.detail && e.detail.tab) {
        this.switchTab(e.detail.tab);
      }
    });

    const jumpBtn = document.getElementById('btn-show-desktop-direct');
    if (jumpBtn) {
      jumpBtn.onclick = () => this.switchTab('desktop');
    }

    // Ambient Synth
    const ambientBtn = document.getElementById('header-ambient-btn');
    if (ambientBtn) {
      ambientBtn.onclick = () => {
        const isPlaying = audioEngine.toggleAmbient();
        if (isPlaying) {
          ambientBtn.textContent = 'Pausar Synth';
          ambientBtn.classList.add('primary');
        } else {
          ambientBtn.textContent = 'Ambient Synth';
          ambientBtn.classList.remove('primary');
        }
      };
    }

    // Fullscreen toggle
    const fsBtn = document.getElementById('header-fullscreen-btn');
    const exitFsBtn = document.getElementById('exit-fullscreen-btn');
    const toggleFullscreen = () => {
      const isFs = document.body.classList.toggle('fullscreen-desktop-mode');
      audioEngine.playSwitch();
      if (isFs) {
        this.switchTab('desktop');
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    if (fsBtn) fsBtn.onclick = toggleFullscreen;
    if (exitFsBtn) exitFsBtn.onclick = toggleFullscreen;

    const headerExportBtn = document.getElementById('header-export-btn');
    if (headerExportBtn) {
      headerExportBtn.onclick = () => this.switchTab('export');
    }

    // Preset Selection
    document.querySelectorAll('.preset-card[data-preset]').forEach(card => {
      card.onclick = () => {
        audioEngine.playNotification();
        themeEngine.setPreset(card.dataset.preset);
      };
    });

    const btnResetDefault = document.getElementById('btn-reset-theme-default');
    if (btnResetDefault) {
      btnResetDefault.onclick = () => {
        audioEngine.playStartup();
        themeEngine.resetToDefault();
      };
    }

    // Smooth Gradients Selection
    document.querySelectorAll('.btn-apply-grad, .gradient-card').forEach(item => {
      item.onclick = (e) => {
        const gradId = item.dataset.id;
        const gradObj = SMOOTH_GRADIENTS.find(g => g.id === gradId);
        if (gradObj) {
          audioEngine.playNotification();
          themeEngine.setSmoothGradient(gradObj);
          this.switchTab('desktop');
        }
      };
    });

    // Custom Gradient Sliders & Color Pickers
    const gradC1 = document.getElementById('custom-grad-c1');
    const gradC2 = document.getElementById('custom-grad-c2');
    const gradAngle = document.getElementById('slider-grad-angle');
    const labelC1 = document.getElementById('label-grad-c1');
    const labelC2 = document.getElementById('label-grad-c2');
    const labelAngle = document.getElementById('label-grad-angle');
    const gradPreview = document.getElementById('custom-grad-preview');
    const btnApplyCustomGrad = document.getElementById('btn-apply-custom-grad');

    const updateGradPreview = () => {
      if (!gradC1 || !gradC2 || !gradAngle) return;
      const c1 = gradC1.value;
      const c2 = gradC2.value;
      const ang = gradAngle.value;
      if (labelC1) labelC1.textContent = c1;
      if (labelC2) labelC2.textContent = c2;
      if (labelAngle) labelAngle.textContent = `${ang}°`;
      const css = `linear-gradient(${ang}deg, ${c1} 0%, ${c2} 100%)`;
      if (gradPreview) gradPreview.style.background = css;
    };

    if (gradC1) gradC1.oninput = updateGradPreview;
    if (gradC2) gradC2.oninput = updateGradPreview;
    if (gradAngle) gradAngle.oninput = updateGradPreview;

    if (btnApplyCustomGrad) {
      btnApplyCustomGrad.onclick = () => {
        const c1 = gradC1.value;
        const c2 = gradC2.value;
        const ang = gradAngle.value;
        audioEngine.playStartup();
        themeEngine.setCustomGradient(c1, c2, ang);
        this.switchTab('desktop');
      };
    }

    // Custom Color picker
    const colorPicker = document.getElementById('custom-color-picker');
    const colorHex = document.getElementById('custom-color-hex');
    if (colorPicker) {
      colorPicker.oninput = (e) => {
        if (colorHex) colorHex.textContent = e.target.value;
        themeEngine.setCustomColor(e.target.value);
      };
    }

    // Sliders
    const sliderBlur = document.getElementById('slider-blur');
    if (sliderBlur) {
      sliderBlur.oninput = (e) => {
        const val = parseInt(e.target.value, 10);
        const valBlur = document.getElementById('val-blur');
        if (valBlur) valBlur.textContent = `${val}px`;
        const bBlur = document.getElementById('badge-live-blur');
        if (bBlur) bBlur.textContent = `${val}px`;
        themeEngine.update({ glassBlur: val });
      };
    }

    const sliderOpacity = document.getElementById('slider-opacity');
    if (sliderOpacity) {
      sliderOpacity.oninput = (e) => {
        const pct = parseInt(e.target.value, 10);
        const valOpacity = document.getElementById('val-opacity');
        if (valOpacity) valOpacity.textContent = `${pct}%`;
        const bOpacity = document.getElementById('badge-live-opacity');
        if (bOpacity) bOpacity.textContent = `${pct}%`;
        themeEngine.update({ glassOpacity: pct / 100 });
      };
    }

    // Mode buttons (Oscuro Slate, OLED Puro, Claro)
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.onclick = () => {
        audioEngine.playClick();
        const mode = btn.dataset.mode;
        if (mode === 'light') {
          themeEngine.update({
            mode: 'light',
            primaryColor: '#0284c7',
            secondaryColor: '#38bdf8',
            primaryRgb: '2, 132, 199',
            glowColor: 'rgba(2, 132, 199, 0.25)',
            smoothGradient: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)'
          });
        } else if (mode === 'oled') {
          themeEngine.update({
            mode: 'oled',
            smoothGradient: 'linear-gradient(180deg, #101217 0%, #050608 100%)'
          });
        } else {
          themeEngine.update({
            mode: 'dark',
            primaryColor: '#00e5db',
            secondaryColor: '#ff7043',
            primaryRgb: '0, 229, 219',
            glowColor: 'rgba(0, 229, 219, 0.35)',
            smoothGradient: 'linear-gradient(180deg, #222631 0%, #181b23 100%)'
          });
        }
      };
    });

    // Custom Wallpaper Uploader (File & URL)
    const customWpFileInput = document.getElementById('custom-wallpaper-file-input');
    const btnBrowseCustomWp = document.getElementById('btn-browse-custom-wp');
    const customWpUrlInput = document.getElementById('custom-wallpaper-url-input');
    const btnApplyWpUrl = document.getElementById('btn-apply-wp-url');
    const btnResetDefaultWp = document.getElementById('btn-reset-default-wp');
    const btnGotoCustomWp = document.getElementById('btn-goto-custom-wp');

    if (btnGotoCustomWp) {
      btnGotoCustomWp.onclick = () => this.switchTab('wallpapers');
    }

    if (btnBrowseCustomWp && customWpFileInput) {
      btnBrowseCustomWp.onclick = () => customWpFileInput.click();
    }

    if (customWpFileInput) {
      customWpFileInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            // Compress and optimize resolution to max 1600x900 for instant load and zero quota issues
            const maxW = 1600;
            const maxH = 900;
            let w = img.width;
            let h = img.height;
            if (w > maxW || h > maxH) {
              const ratio = Math.min(maxW / w, maxH / h);
              w = Math.round(w * ratio);
              h = Math.round(h * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.80);

            themeEngine.setCustomWallpaper(optimizedDataUrl, file.name);
            audioEngine.playStartup();
            this.updateBackground();

            const thumb = document.getElementById('custom-wp-preview-thumb');
            const fname = document.getElementById('custom-wp-filename');
            if (thumb) {
              thumb.style.backgroundImage = `url('${optimizedDataUrl}')`;
              thumb.style.backgroundSize = 'cover';
              thumb.style.background = '';
            }
            if (fname) fname.textContent = file.name;

            this.switchTab('desktop');
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      };
    }

    if (btnApplyWpUrl && customWpUrlInput) {
      btnApplyWpUrl.onclick = () => {
        const url = customWpUrlInput.value.trim();
        if (!url) return;
        themeEngine.setCustomWallpaper(url, 'Fondo URL Personalizado');
        audioEngine.playStartup();
        this.updateBackground();

        const thumb = document.getElementById('custom-wp-preview-thumb');
        const fname = document.getElementById('custom-wp-filename');
        if (thumb) {
          thumb.style.backgroundImage = `url('${url}')`;
          thumb.style.backgroundSize = 'cover';
          thumb.style.background = '';
        }
        if (fname) fname.textContent = 'Fondo Web Personalizado';

        this.switchTab('desktop');
      };
    }

    if (btnResetDefaultWp) {
      btnResetDefaultWp.onclick = () => {
        audioEngine.playNotification();
        themeEngine.update({
          wallpaperType: 'gradient',
          customWallpaper: null,
          smoothGradient: 'linear-gradient(180deg, #222631 0%, #181b23 100%)'
        });
        this.updateBackground();
        const fname = document.getElementById('custom-wp-filename');
        if (fname) fname.textContent = 'Degradado Suave Activo';
        this.switchTab('desktop');
      };
    }

    // Toggle Windows Taskbar Checkbox in Theme Studio
    const taskbarStudioCb = document.getElementById('toggle-taskbar-studio-checkbox');
    if (taskbarStudioCb) {
      taskbarStudioCb.onchange = (e) => {
        audioEngine.playClick();
        themeEngine.setWindowsTaskbarVisibility(e.target.checked);
      };
    }

    // Quick jump button to PRO Dock Config
    const btnGotoDockConfig = document.getElementById('btn-goto-dock-config');
    if (btnGotoDockConfig) {
      btnGotoDockConfig.onclick = () => {
        audioEngine.playClick();
        this.switchTab('dock');
      };
    }

    // =========================================================================
    // PRO DOCK STUDIO CONTROLS & LIVE STAGE EVENTS
    // =========================================================================
    const btnResetDock = document.getElementById('btn-reset-dock-default');
    if (btnResetDock) {
      btnResetDock.onclick = () => {
        audioEngine.playStartup();
        themeEngine.resetDockConfig();
      };
    }

    const sliderDockSize = document.getElementById('slider-dock-size');
    if (sliderDockSize) {
      sliderDockSize.oninput = (e) => {
        const val = parseInt(e.target.value, 10);
        const valEl = document.getElementById('val-dock-size');
        if (valEl) valEl.textContent = `${val}px`;
        const bSize = document.getElementById('badge-dock-size');
        if (bSize) bSize.textContent = `${val}px`;
        themeEngine.updateDockConfig({ iconSize: val });
      };
    }

    const sliderDockGap = document.getElementById('slider-dock-gap');
    if (sliderDockGap) {
      sliderDockGap.oninput = (e) => {
        const val = parseInt(e.target.value, 10);
        const valEl = document.getElementById('val-dock-gap');
        if (valEl) valEl.textContent = `${val}px`;
        const bGap = document.getElementById('badge-dock-gap');
        if (bGap) bGap.textContent = `${val}px`;
        themeEngine.updateDockConfig({ iconGap: val });
      };
    }

    const toggleDockWave = document.getElementById('toggle-dock-wave');
    if (toggleDockWave) {
      toggleDockWave.onchange = (e) => {
        audioEngine.playSwitch();
        const enabled = e.target.checked;
        const bWave = document.getElementById('badge-dock-wave');
        const scale = (themeEngine.getState().dockConfig && themeEngine.getState().dockConfig.waveScale) || 1.45;
        if (bWave) bWave.textContent = enabled ? `Activa (${scale.toFixed(2)}x)` : 'Desactivada';
        themeEngine.updateDockConfig({ waveEnabled: enabled });
      };
    }

    const sliderDockScale = document.getElementById('slider-dock-scale');
    if (sliderDockScale) {
      sliderDockScale.oninput = (e) => {
        const val = parseFloat(e.target.value);
        const valEl = document.getElementById('val-dock-scale');
        if (valEl) valEl.textContent = `${val.toFixed(2)}x`;
        const bWave = document.getElementById('badge-dock-wave');
        const enabled = (themeEngine.getState().dockConfig && themeEngine.getState().dockConfig.waveEnabled) !== false;
        if (bWave && enabled) bWave.textContent = `Activa (${val.toFixed(2)}x)`;
        themeEngine.updateDockConfig({ waveScale: val });
      };
    }

    const sliderDockRadius = document.getElementById('slider-dock-radius');
    if (sliderDockRadius) {
      sliderDockRadius.oninput = (e) => {
        const val = parseInt(e.target.value, 10);
        const valEl = document.getElementById('val-dock-radius');
        if (valEl) valEl.textContent = `${val}px`;
        themeEngine.updateDockConfig({ waveRadius: val });
      };
    }

    document.querySelectorAll('.dock-mode-card').forEach(card => {
      card.onclick = () => {
        audioEngine.playNotification();
        themeEngine.updateDockConfig({ presentationMode: card.dataset.mode });
      };
    });

    document.querySelectorAll('.dock-align-btn').forEach(btn => {
      btn.onclick = () => {
        audioEngine.playClick();
        themeEngine.updateDockConfig({ alignment: btn.dataset.align });
      };
    });

    document.querySelectorAll('.dock-indicator-btn').forEach(btn => {
      btn.onclick = () => {
        audioEngine.playClick();
        themeEngine.updateDockConfig({ indicatorStyle: btn.dataset.indicator });
      };
    });

    document.querySelectorAll('.btn-dock-chip').forEach(chip => {
      chip.onclick = () => {
        audioEngine.playClick();
        themeEngine.updateDockConfig({ iconSize: parseInt(chip.dataset.size, 10) });
      };
    });

    document.querySelectorAll('.btn-dock-gap-chip').forEach(chip => {
      chip.onclick = () => {
        audioEngine.playClick();
        themeEngine.updateDockConfig({ iconGap: parseInt(chip.dataset.gap, 10) });
      };
    });

    document.querySelectorAll('.btn-dock-scale-chip').forEach(chip => {
      chip.onclick = () => {
        audioEngine.playClick();
        themeEngine.updateDockConfig({ waveScale: parseFloat(chip.dataset.scale) });
      };
    });

    const toggleDockAutoHide = document.getElementById('toggle-dock-autohide-cb');
    if (toggleDockAutoHide) {
      toggleDockAutoHide.onchange = (e) => {
        audioEngine.playSwitch();
        themeEngine.updateDockConfig({ autoHide: e.target.checked });
      };
    }

    const toggleDockVisibility = document.getElementById('toggle-dock-visibility-cb');
    if (toggleDockVisibility) {
      toggleDockVisibility.onchange = (e) => {
        audioEngine.playClick();
        themeEngine.setWindowsTaskbarVisibility(e.target.checked);
      };
    }

    // Interactive sample dock on stage
    const sampleDockShelf = document.getElementById('sample-dock-shelf');
    if (sampleDockShelf) {
      sampleDockShelf.addEventListener('mousemove', (e) => {
        const cfg = (themeEngine.getState && themeEngine.getState().dockConfig) || {};
        const items = sampleDockShelf.querySelectorAll('.mac-dock-item');
        if (cfg.waveEnabled === false) {
          items.forEach(item => { item.style.transform = 'scale(1) translateY(0)'; });
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
            item.style.transform = `scale(${scale}) translateY(-${(scale - 1) * 14}px)`;
          } else {
            item.style.transform = 'scale(1) translateY(0)';
          }
        });
      });

      sampleDockShelf.addEventListener('mouseleave', () => {
        const items = sampleDockShelf.querySelectorAll('.mac-dock-item');
        items.forEach(item => {
          item.style.transform = 'scale(1) translateY(0)';
        });
      });

      sampleDockShelf.addEventListener('click', (e) => {
        const item = e.target.closest('.mac-dock-item');
        if (!item) return;
        audioEngine.playClick();
        item.classList.add('dock-bouncing');
        setTimeout(() => item.classList.remove('dock-bouncing'), 700);
      });
    }

    // Default Smooth Gradient Button in View 2
    const btnDefaultSmoothGrad = document.getElementById('btn-default-smooth-grad');
    if (btnDefaultSmoothGrad) {
      btnDefaultSmoothGrad.onclick = () => {
        audioEngine.playNotification();
        const defaultGrad = SMOOTH_GRADIENTS[0]; // Tochka Slate Minimal
        themeEngine.setSmoothGradient(defaultGrad);
        const gradC1 = document.getElementById('custom-grad-c1');
        const gradC2 = document.getElementById('custom-grad-c2');
        const gradAngle = document.getElementById('slider-grad-angle');
        const labelC1 = document.getElementById('label-grad-c1');
        const labelC2 = document.getElementById('label-grad-c2');
        const labelAngle = document.getElementById('label-grad-angle');
        const gradPreview = document.getElementById('custom-grad-preview');
        if (gradC1) gradC1.value = defaultGrad.c1;
        if (gradC2) gradC2.value = defaultGrad.c2;
        if (gradAngle) gradAngle.value = defaultGrad.angle;
        if (labelC1) labelC1.textContent = defaultGrad.c1;
        if (labelC2) labelC2.textContent = defaultGrad.c2;
        if (labelAngle) labelAngle.textContent = `${defaultGrad.angle}°`;
        if (gradPreview) gradPreview.style.background = defaultGrad.css;
        this.switchTab('desktop');
      };
    }

    // Global Sound Controls
    const soundVolumeSlider = document.getElementById('sound-master-volume');
    const soundVolumeLabel = document.getElementById('sound-volume-label');
    if (soundVolumeSlider) {
      soundVolumeSlider.oninput = (e) => {
        const val = parseInt(e.target.value);
        if (soundVolumeLabel) soundVolumeLabel.textContent = `${val}%`;
        audioEngine.setVolume(val / 100);
      };
    }

    const btnMasterMute = document.getElementById('btn-master-mute');
    if (btnMasterMute) {
      btnMasterMute.onclick = () => {
        audioEngine.setMuted(!audioEngine.muted);
        btnMasterMute.textContent = audioEngine.muted ? '🔇 Desmutear' : '🔊 Silenciar Todo';
      };
    }

    const btnResetSoundsDefault = document.getElementById('btn-reset-sounds-default');
    if (btnResetSoundsDefault) {
      btnResetSoundsDefault.onclick = () => {
        audioEngine.resetToDefaults();
        if (soundVolumeSlider) soundVolumeSlider.value = 70;
        if (soundVolumeLabel) soundVolumeLabel.textContent = '70%';
        if (btnMasterMute) btnMasterMute.textContent = '🔊 Silenciar Todo';
        this.renderSoundEventsTable();
        audioEngine.playStartup();
      };
    }

    // Exporter triggers
    const btnDownloadTheme = document.getElementById('btn-download-theme');
    if (btnDownloadTheme) {
      btnDownloadTheme.onclick = () => {
        audioEngine.playNotification();
        this.exporter.downloadThemeFile();
      };
    }

    const btnDownloadPs1 = document.getElementById('btn-download-ps1');
    const btnDownloadAll = document.getElementById('download-all-btn');
    const handlePs1Download = () => {
      audioEngine.playStartup();
      this.exporter.downloadPowerShellScript();
    };
    if (btnDownloadPs1) btnDownloadPs1.onclick = handlePs1Download;
    if (btnDownloadAll) btnDownloadAll.onclick = handlePs1Download;

    // Copy command snippet to clipboard
    const copySnippetBtn = document.getElementById('btn-copy-snippet');
    const snippetCode = document.getElementById('snippet-code-text');
    if (copySnippetBtn && snippetCode) {
      copySnippetBtn.onclick = () => {
        navigator.clipboard.writeText(snippetCode.textContent.trim()).then(() => {
          audioEngine.playClick();
          copySnippetBtn.textContent = '✓ Copiado';
          setTimeout(() => { copySnippetBtn.textContent = 'Copiar'; }, 2000);
        }).catch(() => {});
      };
    }
  }

  renderSoundEventsTable() {
    const table = document.getElementById('sound-events-table');
    if (!table) return;
    const settings = audioEngine.getSoundSettings();

    const eventsMeta = [
      {
        key: 'startup',
        tag: 'INICIO',
        name: 'Inicio de Windows (Startup Sound)',
        fallbackDesc: 'Acorde majestuoso al arrancar o aplicar temas'
      },
      {
        key: 'notification',
        tag: 'NOTIF',
        name: 'Notificación del Sistema',
        fallbackDesc: 'Alerta sonora para cambios de modo, avisos y eventos'
      },
      {
        key: 'click',
        tag: 'CLIC',
        name: 'Clic Táctil de Botón',
        fallbackDesc: 'Feedback táctil al pulsar botones, ventanas e iconos'
      },
      {
        key: 'switch',
        tag: 'SWITCH',
        name: 'Conmutador / Interruptor',
        fallbackDesc: 'Respuesta al cambiar de pantalla completa o alternar estados'
      },
      {
        key: 'ambient',
        tag: 'AMBIENT',
        name: 'Música Ambiente Relajante (Synth)',
        fallbackDesc: 'Paisaje sonoro analógico generativo continuo'
      }
    ];

    table.innerHTML = eventsMeta.map(ev => {
      const cfg = settings[ev.key] || { enabled: true, profile: 'crystal' };
      const profiles = SOUND_PROFILES[ev.key] || [];
      const currentProfile = profiles.find(p => p.id === cfg.profile) || profiles[0];
      const desc = currentProfile ? currentProfile.desc : ev.fallbackDesc;

      return `
        <div class="sound-event-row ${cfg.enabled ? '' : 'sound-disabled'}" data-sound-event="${ev.key}">
          <div class="sound-event-main">
            <div class="sound-event-info">
              <span class="tochka-sub-tag">${ev.tag}</span>
              <div>
                <div class="sound-event-name">${ev.name}</div>
                <div class="sound-event-desc" id="desc-sound-${ev.key}">${desc}</div>
              </div>
            </div>
          </div>

          <div class="sound-event-customizer">
            <label class="sound-toggle-btn" title="Activar o desactivar este sonido de forma independiente">
              <input type="checkbox" class="sound-event-checkbox" data-event="${ev.key}" ${cfg.enabled ? 'checked' : ''} />
              <span>${cfg.enabled ? 'Activo' : 'Desactivado'}</span>
            </label>

            <select class="sound-profile-select" data-event="${ev.key}" title="Cambiar por otro estilo o timbre de sonido">
              ${profiles.map(p => `
                <option value="${p.id}" ${p.id === cfg.profile ? 'selected' : ''}>${p.name}</option>
              `).join('')}
            </select>

            <button class="sound-play-btn" data-play="${ev.key}" title="Probar cómo suena este perfil">
              Probar Sonido
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.bindSoundTableEvents();
  }

  bindSoundTableEvents() {
    document.querySelectorAll('.sound-event-checkbox').forEach(cb => {
      cb.onchange = (e) => {
        const evKey = cb.dataset.event;
        const isEnabled = e.target.checked;
        audioEngine.setSoundEnabled(evKey, isEnabled);
        const row = cb.closest('.sound-event-row');
        if (row) row.classList.toggle('sound-disabled', !isEnabled);
        const label = cb.nextElementSibling;
        if (label) label.textContent = isEnabled ? 'Activo' : 'Desactivado';
        audioEngine.playClick();
      };
    });

    document.querySelectorAll('.sound-profile-select').forEach(sel => {
      sel.onchange = (e) => {
        const evKey = sel.dataset.event;
        const profile = e.target.value;
        audioEngine.setSoundProfile(evKey, profile);

        const profiles = SOUND_PROFILES[evKey] || [];
        const found = profiles.find(p => p.id === profile);
        const descEl = document.getElementById(`desc-sound-${evKey}`);
        if (descEl && found) descEl.textContent = found.desc;

        if (evKey === 'startup') audioEngine.playStartup(profile);
        else if (evKey === 'notification') audioEngine.playNotification(profile);
        else if (evKey === 'click') audioEngine.playClick(profile);
        else if (evKey === 'switch') audioEngine.playSwitch(profile);
        else if (evKey === 'ambient') {
          audioEngine.startAmbient(profile);
          setTimeout(() => audioEngine.stopAmbient(), 2500);
        }
      };
    });

    document.querySelectorAll('.sound-play-btn').forEach(btn => {
      btn.onclick = () => {
        const eventType = btn.dataset.play;
        const row = btn.closest('.sound-event-row');
        const sel = row ? row.querySelector('.sound-profile-select') : null;
        const profile = sel ? sel.value : null;

        if (eventType === 'startup') audioEngine.playStartup(profile);
        else if (eventType === 'notification') audioEngine.playNotification(profile);
        else if (eventType === 'click') audioEngine.playClick(profile);
        else if (eventType === 'switch') audioEngine.playSwitch(profile);
        else if (eventType === 'ambient') {
          audioEngine.startAmbient(profile);
          setTimeout(() => audioEngine.stopAmbient(), 2800);
        }
      };
    });
  }

  renderActiveTab() {
    this.syncUIWithState(themeEngine.getState());
    if (this.currentTab === 'sounds') {
      this.renderSoundEventsTable();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new AppController();
});
