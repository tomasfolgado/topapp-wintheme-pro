// TopApp WinTheme Pro - Ultra-Compact Editorial Control Center
// Single unified typography, equal CPU/GPU temperatures, live sound wave, reorderable widgets, and text-only buttons

import { audioEngine } from './audioEngine.js';
import { isNative, openUri, launchApp, getStats, openPath, showInFolder, chooseFolder, searchFiles } from './nativeBridge.js';

export class WidgetSuite {
  constructor(containerElement, themeEngine) {
    this.container = containerElement;
    this.themeEngine = themeEngine;
    this.timers = [];
    this.isTaskManagerOpen = false;
    this.isSearchModalOpen = false;
    this.isWidgetManagerOpen = false;
    this.audioWavePhase = 0;
    this.searchFolder = '';
    this.searchFolderName = 'Documentos';
    this.realSearchResults = [];

    this.processes = [
      { pid: 1042, name: 'Google Chrome', cpu: 14.2, ram: 1420, icon: '🌐' },
      { pid: 2198, name: 'VS Code', cpu: 8.5, ram: 980, icon: '💻' },
      { pid: 3410, name: 'TopApp WinTheme', cpu: 1.8, ram: 190, icon: '💎' },
      { pid: 4890, name: 'Spotify', cpu: 1.2, ram: 310, icon: '🎧' },
      { pid: 5612, name: 'Discord', cpu: 2.9, ram: 380, icon: '💬' },
      { pid: 6720, name: 'Explorer', cpu: 0.8, ram: 160, icon: '📁' },
      { pid: 7810, name: 'DWM.exe', cpu: 2.4, ram: 240, icon: '🪟' }
    ];

    this.files = [
      { name: 'Balance_Financiero_Q3.pdf', type: 'pdf', size: '2.4 MB', date: 'Hoy, 10:14', icon: '📑' },
      { name: 'Wallpaper_Tochka_Slate.png', type: 'images', size: '4.8 MB', date: 'Ayer', icon: '🖼️' },
      { name: 'Arquitectura_Fluent_4K.mp4', type: 'videos', size: '84 MB', date: '02/10/2026', icon: '🎬' },
      { name: 'Contrato_Servicios_TopApp.docx', type: 'docs', size: '520 KB', date: '28/09/2026', icon: '📄' },
      { name: 'Manual_HP_LaserJet_Pro.pdf', type: 'pdf', size: '1.8 MB', date: '25/09/2026', icon: '📑' },
      { name: 'ThemeEngine_Core.ts', type: 'code', size: '14 KB', date: 'Hoy, 09:30', icon: '💻' },
      { name: 'Startup_Chime_Audio.wav', type: 'audio', size: '1.2 MB', date: '01/10/2026', icon: '🎵' },
      { name: 'Captura_Diseno_Editorial.jpg', type: 'images', size: '890 KB', date: 'Ayer', icon: '🖼️' },
      { name: 'Auditoria_Seguridad_Sistemas.pdf', type: 'pdf', size: '3.1 MB', date: '22/09/2026', icon: '📑' },
      { name: 'Configuracion_DWM_Windows.json', type: 'code', size: '4 KB', date: 'Hoy, 08:15', icon: '💻' }
    ];

    this.render();
    this.startTimers();
    if (isNative) {
      this.triggerSearch();
    }
    this.themeUnsub = this.themeEngine.subscribe(() => {
      this.redrawAllCanvases();
    });
  }

  redrawAllCanvases() {
    const s = this.themeEngine.getState();
    this.drawRamCanvas(s.ramHistory || []);
    this.drawCpuTempCanvas(s.cpuTempHistory || []);
    this.drawGpuTempCanvas(s.gpuTempHistory || []);
    this.drawNetDownCanvas(s.netDownHistory || []);
    this.drawNetUpCanvas(s.netUpHistory || []);
  }

  startTimers() {
    // 0. Real hardware stats from Windows (desktop app only)
    this.realStats = null;
    if (isNative) {
      const pollStats = async () => { this.realStats = await getStats(); };
      pollStats();
      this.timers.push(setInterval(pollStats, 1500));
    }

    // 1. Hardware metrics & telemetry update
    const metricsTimer = setInterval(() => {
      this.updateLiveTelemetry();
    }, 1500);
    this.timers.push(metricsTimer);

    // 3. Live Sound Waveform Animation loop (60fps)
    const audioWaveLoop = () => {
      this.drawAudioWaveform();
      this.audioAnimId = requestAnimationFrame(audioWaveLoop);
    };
    this.audioAnimId = requestAnimationFrame(audioWaveLoop);

    // 4. Live Clock & Calendar Update (Every 1 second)
    const clockTimer = setInterval(() => {
      this.updateLiveClock();
    }, 1000);
    this.timers.push(clockTimer);
  }

  destroy() {
    this.timers.forEach(t => clearInterval(t));
    this.timers = [];
    if (this.audioAnimId) cancelAnimationFrame(this.audioAnimId);
    if (this.themeUnsub) this.themeUnsub();
  }

  updateLiveClock() {
    const now = new Date();
    const clockEl = document.getElementById('clock-live-time');
    const calDayNum = document.getElementById('cal-day-num');
    const calDayName = document.getElementById('cal-day-name');
    const calMonthYear = document.getElementById('cal-month-year');

    if (clockEl) {
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const sec = String(now.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}:${sec}`;
    }

    if (calDayNum) calDayNum.textContent = String(now.getDate()).padStart(2, '0');
    if (calDayName) calDayName.textContent = now.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
    if (calMonthYear) calMonthYear.textContent = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
  }

  updateLiveTelemetry() {
    const s = this.themeEngine.getState();
    const timeSec = Date.now() / 1000;

    // Multi-core variation
    const real = this.realStats;
    const updatedCores = real && real.coresLoad && real.coresLoad.length
      ? real.coresLoad
      : s.coresLoad.map(load => {
          const delta = Math.floor(Math.random() * 14 - 7);
          return Math.min(92, Math.max(6, load + delta));
        });

    // CPU & GPU Temperatures (Pronounced, visible dynamic wave oscillations)
    const cpuWave = Math.sin(timeSec * 0.65) * 5.2 + Math.sin(timeSec * 0.18) * 2.8;
    const newCpuTemp = Math.min(74, Math.max(38, Math.round(45 + cpuWave + (Math.random() * 2 - 1))));
    
    const gpuWave = Math.cos(timeSec * 0.55) * 6.0 + Math.sin(timeSec * 0.22) * 2.5;
    const newGpuTemp = Math.min(72, Math.max(36, Math.round(43 + gpuWave + (Math.random() * 2 - 1))));
    
    const cpuHist = s.cpuTempHistory || [42, 45, 48, 51, 47, 44, 42, 40, 43, 46];
    const gpuHist = s.gpuTempHistory || [39, 41, 45, 48, 44, 41, 38, 40, 44, 46];
    const newCpuHist = [...cpuHist.slice(1), newCpuTemp];
    const newGpuHist = [...gpuHist.slice(1), newGpuTemp];

    // RAM variation
    let newRamUsed = s.ramUsedGB;
    const ramTotal = real ? real.ramTotalGB : s.ramTotalGB;
    if (real) {
      newRamUsed = real.ramUsedGB;
    } else if (!s.isPurgingRam) {
      newRamUsed = Math.min(14.0, Math.max(3.8, +(s.ramUsedGB + (Math.random() * 0.16 - 0.08)).toFixed(1)));
    }
    const ramPct = Math.round((newRamUsed / ramTotal) * 100);
    const newRamHist = [...s.ramHistory.slice(1), ramPct];

    // Network Bandwidth variation (Clear packet burst peaks and valleys)
    const netDownWave = Math.abs(Math.sin(timeSec * 0.55)) * 48 + Math.abs(Math.cos(timeSec * 0.18)) * 26;
    const newNetDown = +(18.0 + netDownWave + (Math.random() * 4 - 2)).toFixed(1);

    const netUpWave = Math.abs(Math.cos(timeSec * 0.65)) * 15 + Math.abs(Math.sin(timeSec * 0.25)) * 7;
    const newNetUp = +(4.0 + netUpWave + (Math.random() * 2 - 1)).toFixed(1);

    const newNetDownHist = [...(s.netDownHistory || [24, 38, 62, 75, 54, 32, 28, 45, 68, 55]).slice(1), newNetDown];
    const newNetUpHist = [...(s.netUpHistory || [6, 11, 18, 22, 16, 9, 8, 14, 20, 15]).slice(1), newNetUp];

    this.themeEngine.update({
      coresLoad: updatedCores,
      cpuTemp: newCpuTemp,
      gpuTemp: newGpuTemp,
      cpuTempHistory: newCpuHist,
      gpuTempHistory: newGpuHist,
      ramUsedGB: newRamUsed,
      ramTotalGB: ramTotal,
      ramHistory: newRamHist,
      netDownSpeed: newNetDown,
      netUpSpeed: newNetUp,
      netDownHistory: newNetDownHist,
      netUpHistory: newNetUpHist
    });

    this.renderCoresGrid(updatedCores);
    this.drawRamCanvas(newRamHist);
    this.drawCpuTempCanvas(newCpuHist);
    this.drawGpuTempCanvas(newGpuHist);
    this.drawNetDownCanvas(newNetDownHist);
    this.drawNetUpCanvas(newNetUpHist);

    const ramValEl = document.getElementById('ram-metric-val');
    const ramPctEl = document.getElementById('ram-pct-badge');
    if (ramValEl) ramValEl.textContent = `${newRamUsed} GB`;
    if (ramPctEl) ramPctEl.textContent = `${ramPct}%`;

    const cpuValEl = document.getElementById('cpu-temp-val');
    const gpuValEl = document.getElementById('gpu-temp-val');
    if (cpuValEl) cpuValEl.textContent = `${newCpuTemp}°C`;
    if (gpuValEl) gpuValEl.textContent = `${newGpuTemp}°C`;

    const netDownEl = document.getElementById('net-down-val');
    const netUpEl = document.getElementById('net-up-val');
    if (netDownEl) netDownEl.textContent = `${newNetDown} MB/s`;
    if (netUpEl) netUpEl.textContent = `${newNetUp} MB/s`;
  }

  updatePrinterProgress() {
    const s = this.themeEngine.getState();
    if (s.printerStatus !== 'printing') return;

    let { currentPage, totalPages, percent } = s.printJob;
    if (currentPage < totalPages) {
      currentPage += 1;
      percent = Math.min(100, Math.round((currentPage / totalPages) * 100));
    } else {
      currentPage = 1;
      percent = 4;
    }

    this.themeEngine.update({
      printJob: {
        ...s.printJob,
        currentPage,
        percent
      }
    });

    const pageCountEl = document.getElementById('print-pages-count');
    const printBarEl = document.getElementById('print-bar-progress');
    const printPctEl = document.getElementById('print-pct-val');

    if (pageCountEl) pageCountEl.textContent = `${currentPage}/${totalPages} pág`;
    if (printBarEl) printBarEl.style.width = `${percent}%`;
    if (printPctEl) printPctEl.textContent = `${percent}%`;
  }

  drawSmoothChart(ctx, history, w, h, strokeColor, fillColor, minVal, maxVal) {
    ctx.clearRect(0, 0, w, h);

    const isLight = document.body.classList.contains('theme-fluent-light');

    // Subtle reference grid line
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.lineTo(w, h * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    if (!history || history.length < 2) return;

    // Dynamic auto-scaling to strongly emphasize oscillations (peaks and valleys)
    let lo = minVal;
    let hi = maxVal;
    if (minVal === 'auto' || maxVal === 'auto' || minVal === undefined) {
      const hMin = Math.min(...history);
      const hMax = Math.max(...history);
      const span = hMax - hMin;
      const margin = Math.max(span * 0.1, 1.2);
      lo = hMin - margin;
      hi = hMax + margin;
    }

    const range = (hi - lo) || 1;
    const points = [];
    const step = w / (history.length - 1);

    history.forEach((val, i) => {
      const x = i * step;
      const clamped = Math.max(lo, Math.min(hi, val));
      const norm = (clamped - lo) / range;
      const y = h - 2 - norm * (h - 4);
      points.push({ x, y });
    });

    // Smooth quadratic curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Subtle gradient fill under curve
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.lineTo(points[0].x, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, fillColor);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Glowing indicator dot at latest telemetry point
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = isLight ? 2 : 4;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawRamCanvas(history) {
    const canvas = document.getElementById('ram-history-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = this.themeEngine.getState();
    const isLight = document.body.classList.contains('theme-fluent-light');
    const stroke = s.primaryColor || (isLight ? '#0284c7' : '#00e5db');
    const rgb = s.primaryRgb || '0, 229, 219';
    const fill = isLight ? `rgba(${rgb}, 0.22)` : `rgba(${rgb}, 0.18)`;
    this.drawSmoothChart(ctx, history, canvas.width, canvas.height, stroke, fill, 0, 100);
  }

  // Dual temperature charts: CPU (Secondary / Warm) & GPU (Primary Accent)
  drawCpuTempCanvas(history) {
    const canvas = document.getElementById('cpu-temp-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = this.themeEngine.getState();
    const isLight = document.body.classList.contains('theme-fluent-light');
    const stroke = s.secondaryColor || (isLight ? '#d97706' : '#fbbf24');
    const fill = isLight ? 'rgba(217, 119, 6, 0.25)' : 'rgba(251, 191, 36, 0.22)';
    this.drawSmoothChart(ctx, history, canvas.width, canvas.height, stroke, fill, 'auto', 'auto');
  }

  drawGpuTempCanvas(history) {
    const canvas = document.getElementById('gpu-temp-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = this.themeEngine.getState();
    const isLight = document.body.classList.contains('theme-fluent-light');
    const stroke = s.primaryColor || (isLight ? '#0284c7' : '#00e5db');
    const rgb = s.primaryRgb || '0, 229, 219';
    const fill = isLight ? `rgba(${rgb}, 0.25)` : `rgba(${rgb}, 0.22)`;
    this.drawSmoothChart(ctx, history, canvas.width, canvas.height, stroke, fill, 'auto', 'auto');
  }

  // Network I/O Bandwidth Sparklines: Download (Primary Accent) & Upload (Secondary / Amber)
  drawNetDownCanvas(history) {
    const canvas = document.getElementById('net-down-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = this.themeEngine.getState();
    const isLight = document.body.classList.contains('theme-fluent-light');
    const stroke = s.primaryColor || (isLight ? '#0284c7' : '#00e5db');
    const rgb = s.primaryRgb || '0, 229, 219';
    const fill = isLight ? `rgba(${rgb}, 0.25)` : `rgba(${rgb}, 0.22)`;
    this.drawSmoothChart(ctx, history, canvas.width, canvas.height, stroke, fill, 'auto', 'auto');
  }

  drawNetUpCanvas(history) {
    const canvas = document.getElementById('net-up-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = this.themeEngine.getState();
    const isLight = document.body.classList.contains('theme-fluent-light');
    const stroke = s.secondaryColor || (isLight ? '#ea580c' : '#fbbf24');
    const fill = isLight ? 'rgba(234, 88, 12, 0.25)' : 'rgba(251, 191, 36, 0.22)';
    this.drawSmoothChart(ctx, history, canvas.width, canvas.height, stroke, fill, 'auto', 'auto');
  }

  // Live Sound Waveform Chart (Oscilloscope moving with audio/voice)
  drawAudioWaveform() {
    const canvas = document.getElementById('audio-waveform-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    this.audioWavePhase += 0.08;
    const s = this.themeEngine.getState();
    const isMuted = s.isMuted || s.volume === 0;
    const isLight = document.body.classList.contains('theme-fluent-light');

    // Center reference axis
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    if (isMuted) {
      // Flat resting line when muted
      ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      return;
    }

    const dummyData = new Uint8Array(32);
    const hasRealAudio = audioEngine.getVisualizerData(dummyData);
    const isAmbient = audioEngine.isAmbientPlaying;

    ctx.beginPath();
    const points = 32;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * w;
      let amp = 0;

      if (hasRealAudio && dummyData[i % 16] > 10) {
        amp = (dummyData[i % 16] / 255) * (h * 0.44);
      } else if (isAmbient) {
        amp = (h * 0.35) * Math.sin(i * 0.4 + this.audioWavePhase) * (s.volume / 100);
      } else {
        // Living dynamic audio oscillation
        amp = (h * 0.22) * Math.sin(i * 0.35 + this.audioWavePhase * 0.7) * (s.volume / 100);
      }

      const y = h / 2 + amp * Math.cos(i * 0.22 + this.audioWavePhase);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    const stroke = s.primaryColor || (isLight ? '#0284c7' : '#00e5db');
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = stroke;
    ctx.shadowBlur = isLight ? 1 : 3;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  renderCoresGrid(loads) {
    const container = document.getElementById('cores-grid-container');
    if (!container) return;
    container.innerHTML = loads.map((load, idx) => `
      <div class="core-cell" title="Núcleo ${idx}: ${load}%">
        <div class="core-bar-track">
          <div class="core-bar-fill ${load > 70 ? 'core-high' : ''}" style="height: ${load}%;"></div>
        </div>
        <span class="core-label">${idx}</span>
      </div>
    `).join('');
  }

  getFilteredFiles() {
    const s = this.themeEngine.getState();
    if (this.realSearchResults && this.realSearchResults.length > 0) {
      return this.realSearchResults;
    }
    let filtered = this.files;
    if (s.activeSearchFilter !== 'all') {
      filtered = filtered.filter(f => f.type === s.activeSearchFilter);
    }
    if (s.searchQuery && s.searchQuery.trim()) {
      const q = s.searchQuery.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(q) || f.type.includes(q));
    }
    return filtered;
  }

  render() {
    const s = this.themeEngine.getState();
    const ramPct = Math.round((s.ramUsedGB / s.ramTotalGB) * 100);
    const matchingFiles = this.getFilteredFiles();

    const order = s.widgetOrder || ['ram', 'thermals', 'audio', 'cores', 'connectivity', 'printer', 'search'];
    const visible = s.visibleWidgets || { ram: true, thermals: true, audio: true, cores: true, connectivity: true, printer: true, search: true };

    const widgetTemplates = {
      // WIDGET: DATETIME (DUAL SQUARES ROW: LEFT CALENDAR, RIGHT CLOCK)
      datetime: `
        <div class="tochka-card datetime-card" data-widget="datetime">
          <div class="widget-clean-header">
            <div class="widget-clean-title">
              <span class="title-dot-cyan"></span>
              <span>Calendario y Hora</span>
            </div>
            <div class="widget-header-controls">
              <button class="w-ctrl-btn btn-w-up" data-w="datetime" title="Subir">▲</button>
              <button class="w-ctrl-btn btn-w-down" data-w="datetime" title="Bajar">▼</button>
              <button class="w-ctrl-btn btn-w-hide" data-w="datetime" title="Ocultar">✕</button>
            </div>
          </div>

          <!-- Dual Squares in the same row: Left Calendar, Right Clock -->
          <div class="dual-squares-row">
            <!-- Left Square: Calendario -->
            <div class="square-widget-box square-calendar-box" id="widget-calendar-box" title="Clic para abrir Calendario de Windows">
              <div class="square-header-line">
                <span class="square-small-tag" id="cal-day-name">SÁBADO</span>
                <span class="cal-mini-badge">CAL</span>
              </div>
              <div class="cal-huge-day" id="cal-day-num">03</div>
              <div class="cal-month-year" id="cal-month-year">OCTUBRE 2026</div>
              <div class="square-bottom-status">
                <span class="cal-status-dot"></span>
                <span>Agenda al día</span>
              </div>
            </div>

            <!-- Right Square: Reloj -->
            <div class="square-widget-box square-clock-box" id="widget-clock-box" title="Clic para abrir Reloj y Alarmas de Windows">
              <div class="square-header-line">
                <span class="square-small-tag">HORA LOCAL</span>
                <span class="live-clock-pulse"></span>
              </div>
              <div class="clock-huge-digits" id="clock-live-time">14:07:37</div>
              <div class="clock-tz-line" id="clock-live-tz">CEST • UTC+2</div>
              <div class="square-bottom-status">
                <span class="clock-status-dot"></span>
                <span>Sincronizado</span>
              </div>
            </div>
          </div>
        </div>
      `,

      // WIDGET: BATTERY
      battery: `
        <div class="tochka-card" data-widget="battery">
          <div class="widget-clean-header">
            <div class="widget-clean-title">
              <span class="title-dot-green"></span>
              <span>Batería</span>
            </div>
            <div class="widget-header-controls">
              <span class="tochka-sub-tag">Ion de Litio</span>
              <button class="w-ctrl-btn btn-w-up" data-w="battery" title="Subir">▲</button>
              <button class="w-ctrl-btn btn-w-down" data-w="battery" title="Bajar">▼</button>
              <button class="w-ctrl-btn btn-w-hide" data-w="battery" title="Ocultar">✕</button>
            </div>
          </div>

          <div class="tochka-headline-row">
            <div class="metric-huge-box">
              <div class="metric-huge" id="battery-level-val">${s.batteryLevel}%</div>
              <div class="metric-desc" id="battery-status-desc">${s.batteryCharging ? 'Conectado a CA' : 'Uso en Batería'}</div>
            </div>
            <div class="metric-stat-box">
              <span class="tochka-tag-cyan" style="font-size: 0.72rem;" id="battery-runtime-val">${s.batteryTimeRemaining}</span>
            </div>
          </div>

          <!-- Battery Progress Level Bar -->
          <div class="battery-level-track">
            <div class="battery-level-fill" id="battery-fill-bar" style="width: ${s.batteryLevel}%;"></div>
          </div>

          <div class="tochka-action-row">
            <span class="chip-metric">Modo: <strong>${s.batteryPowerMode}</strong></span>
            <button id="btn-open-battery-settings" class="tochka-btn-dark btn-small">
              Ajustes de Energía
            </button>
          </div>
        </div>
      `,

      // WIDGET: NETWORK TRAFFIC I/O (PROFESSIONAL DUAL SPEED MONITOR)
      network: `
        <div class="tochka-card" data-widget="network">
          <div class="widget-clean-header">
            <div class="widget-clean-title">
              <span class="title-dot-blue"></span>
              <span>Tráfico de Red I/O</span>
            </div>
            <div class="widget-header-controls">
              <span class="tochka-sub-tag" id="net-ping-val">11ms ping</span>
              <button class="w-ctrl-btn btn-w-up" data-w="network" title="Subir">▲</button>
              <button class="w-ctrl-btn btn-w-down" data-w="network" title="Bajar">▼</button>
              <button class="w-ctrl-btn btn-w-hide" data-w="network" title="Ocultar">✕</button>
            </div>
          </div>

          <div class="dual-thermals-grid">
            <div class="thermal-column">
              <div class="thermal-col-head">
                <span class="legend-dot dot-cyan"></span>
                <span class="thermal-col-name">Bajada</span>
                <strong class="metric-huge text-cyan" id="net-down-val" style="font-size: 0.88rem;">${s.netDownSpeed} MB/s</strong>
              </div>
              <div class="tochka-chart-box-mini">
                <canvas id="net-down-canvas" width="112" height="18" class="sparkline-canvas"></canvas>
              </div>
            </div>

            <div class="thermal-column">
              <div class="thermal-col-head">
                <span class="legend-dot dot-coral"></span>
                <span class="thermal-col-name">Subida</span>
                <strong class="metric-huge color-coral" id="net-up-val" style="font-size: 0.88rem;">${s.netUpSpeed} MB/s</strong>
              </div>
              <div class="tochka-chart-box-mini">
                <canvas id="net-up-canvas" width="112" height="18" class="sparkline-canvas"></canvas>
              </div>
            </div>
          </div>

          <div class="tochka-action-row">
            <span class="chip-metric">IP: <strong>192.168.1.142</strong></span>
            <button id="btn-open-net-settings" class="tochka-btn-dark btn-small">
              Configurar Red
            </button>
          </div>
        </div>
      `,

      // WIDGET 1: RAM
      ram: `
        <div class="tochka-card" data-widget="ram">
          <div class="widget-clean-header">
            <div class="widget-clean-title">
              <span class="title-dot-cyan"></span>
              <span>Memoria RAM</span>
            </div>
            <div class="widget-header-controls">
              <span class="tochka-sub-tag">16GB DDR5</span>
              <button class="w-ctrl-btn btn-w-up" data-w="ram" title="Subir">▲</button>
              <button class="w-ctrl-btn btn-w-down" data-w="ram" title="Bajar">▼</button>
              <button class="w-ctrl-btn btn-w-hide" data-w="ram" title="Ocultar">✕</button>
            </div>
          </div>

          <div class="tochka-headline-row">
            <div class="metric-huge-box">
              <div class="metric-huge" id="ram-metric-val">${s.ramUsedGB} GB</div>
              <div class="metric-desc">Activa en uso</div>
            </div>
            <div class="metric-stat-box">
              <span class="tochka-tag-cyan" id="ram-pct-badge">${ramPct}%</span>
            </div>
          </div>

          <div class="tochka-chart-box">
            <canvas id="ram-history-canvas" width="240" height="22" class="sparkline-canvas"></canvas>
          </div>

          <div class="tochka-action-row">
            <span class="chip-metric">Libre: <strong>${(s.ramTotalGB - s.ramUsedGB).toFixed(1)}GB</strong></span>
            <button id="btn-purge-ram" class="tochka-btn-cyan ${s.isPurgingRam ? 'btn-loading' : ''}">
              ${s.isPurgingRam ? 'Liberando...' : 'Liberar RAM'}
            </button>
          </div>
        </div>
      `,

      // WIDGET 2: THERMALS (EQUAL PROMINENCE FOR CPU & GPU WITH SEPARATE CHARTS)
      thermals: `
        <div class="tochka-card" data-widget="thermals">
          <div class="widget-clean-header">
            <div class="widget-clean-title">
              <span class="title-dot-coral"></span>
              <span>Telemetría Térmica</span>
            </div>
            <div class="widget-header-controls">
              <button class="w-ctrl-btn btn-w-up" data-w="thermals" title="Subir">▲</button>
              <button class="w-ctrl-btn btn-w-down" data-w="thermals" title="Bajar">▼</button>
              <button class="w-ctrl-btn btn-w-hide" data-w="thermals" title="Ocultar">✕</button>
            </div>
          </div>

          <!-- Dual Column: CPU & GPU side-by-side with identical font sizes and separate charts -->
          <div class="dual-thermals-grid">
            <!-- CPU Block -->
            <div class="thermal-column">
              <div class="thermal-col-head">
                <span class="legend-dot dot-coral"></span>
                <span class="thermal-col-name">CPU</span>
                <strong class="metric-huge color-coral" id="cpu-temp-val" style="font-size: 0.95rem;">${s.cpuTemp}°C</strong>
              </div>
              <div class="tochka-chart-box-mini">
                <canvas id="cpu-temp-canvas" width="112" height="18" class="sparkline-canvas"></canvas>
              </div>
            </div>

            <!-- GPU Block -->
            <div class="thermal-column">
              <div class="thermal-col-head">
                <span class="legend-dot dot-cyan"></span>
                <span class="thermal-col-name">GPU</span>
                <strong class="metric-huge text-cyan" id="gpu-temp-val" style="font-size: 0.95rem;">${s.gpuTemp}°C</strong>
              </div>
              <div class="tochka-chart-box-mini">
                <canvas id="gpu-temp-canvas" width="112" height="18" class="sparkline-canvas"></canvas>
              </div>
            </div>
          </div>

          <div class="tochka-action-row">
            <span class="headroom-label">Fan: <strong>${s.fanSpeedRPM} RPM</strong></span>
            <button id="btn-open-taskmgr" class="tochka-btn-dark">
              Admin. Tareas
            </button>
          </div>
        </div>
      `,

      // WIDGET 3: AUDIO & LIVE WAVEFORM
      audio: `
        <div class="tochka-card" data-widget="audio">
          <div class="widget-clean-header">
            <div class="widget-clean-title">
              <span class="title-dot-cyan"></span>
              <span>Audio</span>
            </div>
            <div class="widget-header-controls">
              <button class="w-ctrl-btn btn-w-up" data-w="audio" title="Subir">▲</button>
              <button class="w-ctrl-btn btn-w-down" data-w="audio" title="Bajar">▼</button>
              <button class="w-ctrl-btn btn-w-hide" data-w="audio" title="Ocultar">✕</button>
            </div>
          </div>

          <!-- Live Oscilloscope Audio Waveform -->
          <div class="tochka-chart-box" style="height: 20px;">
            <canvas id="audio-waveform-canvas" width="240" height="20" class="sparkline-canvas"></canvas>
          </div>

          <div class="volume-slider-container">
            <button id="btn-toggle-mute" class="tochka-btn-dark btn-small ${s.isMuted ? 'muted' : ''}">
              ${s.isMuted ? 'Activar Sonido' : 'Silenciar'}
            </button>
            <div class="slider-fill-track">
              <input type="range" id="widget-volume-slider" min="0" max="100" value="${s.isMuted ? 0 : s.volume}" class="tochka-range" />
            </div>
            <span class="volume-percent-badge" id="widget-volume-text">${s.isMuted ? '0%' : s.volume + '%'}</span>
          </div>
        </div>
      `,

      // WIDGET 4: CORES
      cores: `
        <div class="tochka-card" data-widget="cores">
          <div class="widget-clean-header">
            <div class="widget-clean-title">
              <span class="title-dot-yellow"></span>
              <span>Procesadores Activos</span>
            </div>
            <div class="widget-header-controls">
              <span class="tochka-sub-tag">16C / 32T</span>
              <button class="w-ctrl-btn btn-w-up" data-w="cores" title="Subir">▲</button>
              <button class="w-ctrl-btn btn-w-down" data-w="cores" title="Bajar">▼</button>
              <button class="w-ctrl-btn btn-w-hide" data-w="cores" title="Ocultar">✕</button>
            </div>
          </div>

          <div class="tochka-headline-row">
            <div class="metric-medium">Ryzen™ 9 7950X</div>
            <span class="tochka-tag-cyan" style="font-size: 0.8rem;">4.85 GHz</span>
          </div>

          <div class="cores-visual-grid" id="cores-grid-container"></div>
        </div>
      `,

      // WIDGET 5: CONNECTIVITY
      connectivity: `
        <div class="tochka-card" data-widget="connectivity">
          <div class="widget-clean-header">
            <div class="widget-clean-title">
              <span class="title-dot-blue"></span>
              <span>Conectividad & Red</span>
            </div>
            <div class="widget-header-controls">
              <button class="w-ctrl-btn btn-w-up" data-w="connectivity" title="Subir">▲</button>
              <button class="w-ctrl-btn btn-w-down" data-w="connectivity" title="Bajar">▼</button>
              <button class="w-ctrl-btn btn-w-hide" data-w="connectivity" title="Ocultar">✕</button>
            </div>
          </div>

          <div class="connectivity-toggles-grid">
            <div class="conn-item ${s.wifiEnabled ? 'conn-active' : ''}" id="toggle-wifi-box" title="Clic para configurar Wi-Fi de Windows">
              <div class="conn-top">
                <span class="conn-icon-text">Wi-Fi</span>
                <span class="conn-switch">${s.wifiEnabled ? 'ON' : 'OFF'}</span>
              </div>
              <div class="conn-name">Wi-Fi 6 Pro</div>
              <div class="conn-sub">↓420M • ↑115M</div>
            </div>

            <div class="conn-item ${s.bluetoothEnabled ? 'conn-active' : ''}" id="toggle-bt-box" title="Clic para configurar Bluetooth de Windows">
              <div class="conn-top">
                <span class="conn-icon-text">Bluetooth</span>
                <span class="conn-switch">${s.bluetoothEnabled ? 'ON' : 'OFF'}</span>
              </div>
              <div class="conn-name">WH-1000XM5</div>
              <div class="conn-sub">Batería 85%</div>
            </div>
          </div>
        </div>
      `,

      // WIDGET 6: PRINTER
      printer: `
        <div class="tochka-card" data-widget="printer">
          <div class="widget-clean-header">
            <div class="widget-clean-title">
              <span class="title-dot-cyan"></span>
              <span>Impresoras & Escáneres</span>
            </div>
            <div class="widget-header-controls">
              <span class="status-pill-cyan" style="${s.printerStatus === 'printing' ? '' : 'background: rgba(16, 185, 129, 0.15); color: #34d399;'}">${s.printerStatus === 'printing' ? 'Imprimiendo' : 'Lista'}</span>
              <button class="w-ctrl-btn btn-w-up" data-w="printer" title="Subir">▲</button>
              <button class="w-ctrl-btn btn-w-down" data-w="printer" title="Bajar">▼</button>
              <button class="w-ctrl-btn btn-w-hide" data-w="printer" title="Ocultar">✕</button>
            </div>
          </div>

          <div class="printer-info-row">
            <div class="printer-text-col">
              <div class="printer-model">${s.printerName || 'Dispositivos de Impresión'}</div>
              <div class="printer-doc" title="${s.printJob.docName || 'Sin trabajos en cola'}">${s.printJob.docName || 'Sin trabajos en cola'}</div>
            </div>
          </div>

          ${s.printerStatus === 'printing' ? `
            <div class="print-graphic-box">
              <div class="print-stats-header">
                <span id="print-pages-count">${s.printJob.currentPage}/${s.printJob.totalPages} pág</span>
                <span id="print-pct-val" class="tochka-tag-cyan" style="font-size: 0.7rem;">${s.printJob.percent}%</span>
              </div>
              <div class="print-bar-outer">
                <div class="print-bar-inner" id="print-bar-progress" style="width: ${s.printJob.percent}%;"></div>
              </div>
            </div>
          ` : `
            <div style="font-size: 0.62rem; color: var(--text-dim); margin: 6px 0; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #34d399;"></span>
              <span>Cola de impresión vacía • Sistema listo</span>
            </div>
          `}

          <div class="printer-actions-row">
            <button id="btn-open-printer-settings" class="tochka-btn-dark btn-small" title="Abrir configuración de impresoras en Windows">
              Abrir Cola Windows
            </button>
            <button id="btn-print-test-page" class="tochka-btn-dark btn-small" style="color: var(--color-cyan);" title="Enviar página de prueba">
              Página de prueba
            </button>
          </div>
        </div>
      `,

      // WIDGET 7: SEARCH (WITH COMPACT DROPDOWN, ZERO HORIZONTAL SCROLLING)
      search: `
        <div class="tochka-card" data-widget="search">
          <div class="widget-clean-header">
            <div class="widget-clean-title">
              <span class="title-dot-cyan"></span>
              <span>Búsqueda</span>
            </div>
            <div class="widget-header-controls">
              <span class="tochka-sub-tag">Filtro</span>
              <button class="w-ctrl-btn btn-w-up" data-w="search" title="Subir">▲</button>
              <button class="w-ctrl-btn btn-w-down" data-w="search" title="Bajar">▼</button>
              <button class="w-ctrl-btn btn-w-hide" data-w="search" title="Ocultar">✕</button>
            </div>
          </div>

          <div class="search-folder-row" style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin: 4px 0 6px 0; font-size: 0.65rem;">
            <span style="color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px;" id="current-search-folder-label" title="${this.searchFolder || 'Carpeta de Documentos'}">📁 ${this.searchFolderName}</span>
            <button id="btn-browse-search-folder" class="tochka-btn-dark btn-small" style="font-size: 0.58rem; padding: 2px 7px;">Cambiar...</button>
          </div>

          <div class="search-input-wrapper">
            <input type="text" id="file-search-input" class="tochka-search-field" placeholder="Buscar archivos y presionar Enter..." value="${s.searchQuery}" />
            <button id="clear-search-btn" class="clear-search-btn ${s.searchQuery ? '' : 'hidden'}">✕</button>
          </div>

          <!-- Space-saving Dropdown for file type filter (NO scrollbar) -->
          <div class="search-filter-select-wrapper">
            <select id="file-type-dropdown" class="tochka-filter-select" title="Seleccionar tipo de archivo">
              <option value="all" ${s.activeSearchFilter === 'all' ? 'selected' : ''}>Todos los archivos (*.*)</option>
              <option value="images" ${s.activeSearchFilter === 'images' ? 'selected' : ''}>Imágenes (.png, .jpg, .svg)</option>
              <option value="videos" ${s.activeSearchFilter === 'videos' ? 'selected' : ''}>Videos (.mp4, .mkv)</option>
              <option value="docs" ${s.activeSearchFilter === 'docs' ? 'selected' : ''}>Documentos (.docx, .txt)</option>
              <option value="pdf" ${s.activeSearchFilter === 'pdf' ? 'selected' : ''}>Archivos PDF (.pdf)</option>
              <option value="code" ${s.activeSearchFilter === 'code' ? 'selected' : ''}>Código (.ts, .js, .py, .ps1)</option>
              <option value="audio" ${s.activeSearchFilter === 'audio' ? 'selected' : ''}>Audio y Música (.mp3, .wav)</option>
            </select>
          </div>

          <button id="btn-open-search-modal" class="tochka-open-search-modal-btn">
            <span id="search-modal-summary-text">Ver archivos encontrados (${matchingFiles.length})</span>
          </button>
        </div>
      `
    };

    // Render in custom ordered sequence, filtering by visible status
    const renderedWidgetsHtml = order
      .filter(wId => visible[wId] !== false && widgetTemplates[wId])
      .map(wId => widgetTemplates[wId])
      .join('');

    this.container.innerHTML = `
      <div class="tochka-dashboard">
        <!-- Dashboard Top Control: Restore/Customize Widgets -->
        <div class="dashboard-customizer-bar">
          <button id="btn-toggle-widget-manager" class="btn-manage-widgets">
            Gestionar Módulos
          </button>
          <div id="widget-manager-dropdown" class="widget-manager-dropdown ${this.isWidgetManagerOpen ? 'open' : ''}">
            <div class="wm-title">Módulos Visibles:</div>
            <label class="wm-checkbox"><input type="checkbox" data-wm="datetime" ${visible.datetime !== false ? 'checked' : ''}/> Calendario y Hora</label>
            <label class="wm-checkbox"><input type="checkbox" data-wm="battery" ${visible.battery !== false ? 'checked' : ''}/> Batería</label>
            <label class="wm-checkbox"><input type="checkbox" data-wm="network" ${visible.network !== false ? 'checked' : ''}/> Tráfico de Red</label>
            <label class="wm-checkbox"><input type="checkbox" data-wm="ram" ${visible.ram !== false ? 'checked' : ''}/> Memoria RAM</label>
            <label class="wm-checkbox"><input type="checkbox" data-wm="thermals" ${visible.thermals !== false ? 'checked' : ''}/> Telemetría Térmica</label>
            <label class="wm-checkbox"><input type="checkbox" data-wm="audio" ${visible.audio !== false ? 'checked' : ''}/> Audio</label>
            <label class="wm-checkbox"><input type="checkbox" data-wm="cores" ${visible.cores !== false ? 'checked' : ''}/> Procesadores</label>
            <label class="wm-checkbox"><input type="checkbox" data-wm="connectivity" ${visible.connectivity !== false ? 'checked' : ''}/> Conectividad</label>
            <label class="wm-checkbox"><input type="checkbox" data-wm="printer" ${visible.printer !== false ? 'checked' : ''}/> Impresora</label>
            <label class="wm-checkbox"><input type="checkbox" data-wm="search" ${visible.search !== false ? 'checked' : ''}/> Búsqueda</label>
          </div>
        </div>

        ${renderedWidgetsHtml}
      </div>

      <!-- POPUP MODAL 1: FILE SEARCH RESULTS -->
      <div id="modal-search-results" class="tochka-modal-backdrop ${this.isSearchModalOpen ? 'modal-open' : ''}">
        <div class="tochka-modal-window search-results-modal">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-clean-title">Explorador de Archivos Encontrados</span>
              <span class="modal-sub" id="search-modal-count-badge">${matchingFiles.length} coincidencias</span>
            </div>
            <button id="close-search-modal-btn" class="modal-close-btn">✕</button>
          </div>

          <div class="modal-search-bar-row">
            <input type="text" id="modal-search-field" class="tochka-search-field-modal" placeholder="Filtrar por nombre..." value="${s.searchQuery}" />
            <div class="search-filters-row modal-filters">
              <button class="filter-pill ${s.activeSearchFilter === 'all' ? 'active-filter' : ''}" data-filter="all">Todos</button>
              <button class="filter-pill ${s.activeSearchFilter === 'images' ? 'active-filter' : ''}" data-filter="images">Imágenes</button>
              <button class="filter-pill ${s.activeSearchFilter === 'videos' ? 'active-filter' : ''}" data-filter="videos">Videos</button>
              <button class="filter-pill ${s.activeSearchFilter === 'docs' ? 'active-filter' : ''}" data-filter="docs">Docs</button>
              <button class="filter-pill ${s.activeSearchFilter === 'pdf' ? 'active-filter' : ''}" data-filter="pdf">PDF</button>
              <button class="filter-pill ${s.activeSearchFilter === 'code' ? 'active-filter' : ''}" data-filter="code">Código</button>
            </div>
          </div>

          <div class="modal-results-grid" id="modal-results-container">
            ${matchingFiles.map(f => `
              <div class="modal-file-card" data-name="${f.name}" data-path="${f.path || ''}">
                <div class="modal-file-info">
                  <div class="modal-file-name" title="${f.path || f.name}">${f.name}</div>
                  <div class="modal-file-meta">${f.size} • ${f.date || 'Reciente'}</div>
                </div>
                <div style="display: flex; gap: 4px;">
                  <button class="modal-file-btn tochka-btn-cyan btn-small" data-name="${f.name}" data-path="${f.path || ''}">Abrir</button>
                  ${f.path ? `<button class="modal-file-reveal-btn tochka-btn-dark btn-small" data-path="${f.path}">Carpeta</button>` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="modal-footer">
            <span style="font-size: 0.65rem; color: var(--text-muted);" id="modal-search-location-text">Buscando en: <strong>${this.searchFolder || 'Documentos de Windows'}</strong></span>
            <button id="close-search-modal-footer" class="tochka-btn-dark btn-small">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- POPUP MODAL 2: TASK MANAGER -->
      <div id="modal-task-manager" class="tochka-modal-backdrop ${this.isTaskManagerOpen ? 'modal-open' : ''}">
        <div class="tochka-modal-window">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-clean-title">Administrador de Tareas</span>
              <span class="modal-sub">${this.processes.length} procesos</span>
            </div>
            <button id="close-taskmgr-btn" class="modal-close-btn">✕</button>
          </div>

          <div class="taskmgr-table-container">
            <table class="tochka-table">
              <thead>
                <tr>
                  <th>Proceso</th>
                  <th>PID</th>
                  <th>CPU</th>
                  <th>RAM</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody id="taskmgr-tbody">
                ${this.processes.map(p => `
                  <tr data-pid="${p.pid}">
                    <td>
                      <div class="proc-name-col">
                        <strong>${p.name}</strong>
                      </div>
                    </td>
                    <td class="font-mono">${p.pid}</td>
                    <td class="font-mono ${p.cpu > 5 ? 'text-cyan' : ''}">${p.cpu}%</td>
                    <td class="font-mono">${p.ram}MB</td>
                    <td>
                      <button class="btn-kill-proc" data-pid="${p.pid}">Finalizar</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <span style="font-size: 0.65rem; color: var(--text-muted);">CPU: <strong>24%</strong> • RAM: <strong>5.6/16GB</strong></span>
            <button id="btn-native-taskmgr" class="tochka-btn-cyan btn-small">
              Abrir taskmgr.exe
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderCoresGrid(s.coresLoad);
    this.drawRamCanvas(s.ramHistory);
    this.drawCpuTempCanvas(s.cpuTempHistory || [44, 45, 43, 44, 46, 45, 44, 45, 44, 44]);
    this.drawGpuTempCanvas(s.gpuTempHistory || [40, 41, 40, 42, 41, 40, 41, 40, 41, 41]);
    this.drawNetDownCanvas(s.netDownHistory || [28, 35, 42, 38, 45, 52, 48, 42, 44, 43]);
    this.drawNetUpCanvas(s.netUpHistory || [8, 10, 14, 11, 12, 16, 13, 11, 12, 12]);
    this.updateLiveClock();
  }

  async triggerSearch() {
    const s = this.themeEngine.getState();
    if (isNative) {
      try {
        const res = await searchFiles(this.searchFolder || '', s.searchQuery || '', s.activeSearchFilter || 'all');
        if (res && res.ok) {
          this.realSearchResults = res.results || [];
          if (res.searchDir && !this.searchFolder) {
            this.searchFolder = res.searchDir;
            this.searchFolderName = res.searchDir.split(/[\\/]/).pop() || res.searchDir;
          }
        }
      } catch (err) {
        console.warn('Search error', err);
      }
    }
    this.updateSearchModalResults();
  }

  updateSearchModalResults() {
    const container = document.getElementById('modal-results-container');
    const countBadge = document.getElementById('search-modal-count-badge');
    const summaryText = document.getElementById('search-modal-summary-text');
    const matching = this.getFilteredFiles();

    if (countBadge) countBadge.textContent = `${matching.length} coincidencias`;
    if (summaryText) summaryText.textContent = `Ver archivos encontrados (${matching.length})`;

    if (!container) return;
    if (!matching.length) {
      container.innerHTML = `<div class="no-results-msg" style="grid-column: 1 / -1; padding: 30px;">No se encontraron archivos</div>`;
      return;
    }

    container.innerHTML = matching.map(f => `
      <div class="modal-file-card" data-name="${f.name}" data-path="${f.path || ''}">
        <div class="modal-file-info">
          <div class="modal-file-name" title="${f.path || f.name}">${f.name}</div>
          <div class="modal-file-meta">${f.size || ''} • ${f.date || 'Reciente'}</div>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="modal-file-btn tochka-btn-cyan btn-small" data-name="${f.name}" data-path="${f.path || ''}">Abrir</button>
          ${f.path ? `<button class="modal-file-reveal-btn tochka-btn-dark btn-small" data-path="${f.path}">Carpeta</button>` : ''}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.modal-file-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playNotification();
        const fPath = btn.dataset.path;
        if (fPath) {
          openPath(fPath);
        } else {
          alert(`Abriendo archivo: ${btn.dataset.name}`);
        }
      };
    });

    container.querySelectorAll('.modal-file-reveal-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const fPath = btn.dataset.path;
        if (fPath) showInFolder(fPath);
      };
    });
  }

  bindEvents() {
    // Reorder & Hide Widget Buttons
    document.querySelectorAll('.btn-w-up').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        this.themeEngine.moveWidget(btn.dataset.w, 'up');
        this.render();
      };
    });

    document.querySelectorAll('.btn-w-down').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        this.themeEngine.moveWidget(btn.dataset.w, 'down');
        this.render();
      };
    });

    document.querySelectorAll('.btn-w-hide').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        this.themeEngine.toggleWidgetVisible(btn.dataset.w, false);
        this.render();
      };
    });

    // Toggle Widget Manager Dropdown
    const toggleWmBtn = document.getElementById('btn-toggle-widget-manager');
    const wmDropdown = document.getElementById('widget-manager-dropdown');
    if (toggleWmBtn && wmDropdown) {
      toggleWmBtn.onclick = () => {
        this.isWidgetManagerOpen = !this.isWidgetManagerOpen;
        wmDropdown.classList.toggle('open', this.isWidgetManagerOpen);
      };

      wmDropdown.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.onchange = () => {
          const wId = chk.dataset.wm;
          this.themeEngine.toggleWidgetVisible(wId, chk.checked);
          this.render();
        };
      });
    }

    // Purge RAM Button (Text Only)
    const purgeBtn = document.getElementById('btn-purge-ram');
    if (purgeBtn) {
      purgeBtn.onclick = () => {
        audioEngine.playSwitch();
        this.themeEngine.purgeRam();
      };
    }

    // Task Manager Modal Toggles
    const openTaskMgr = document.getElementById('btn-open-taskmgr');
    const closeTaskMgr = document.getElementById('close-taskmgr-btn');
    const modalTaskMgr = document.getElementById('modal-task-manager');

    if (openTaskMgr) {
      openTaskMgr.onclick = () => {
        audioEngine.playClick();
        this.isTaskManagerOpen = true;
        if (modalTaskMgr) modalTaskMgr.classList.add('modal-open');
      };
    }

    if (closeTaskMgr) {
      closeTaskMgr.onclick = () => {
        audioEngine.playClick();
        this.isTaskManagerOpen = false;
        if (modalTaskMgr) modalTaskMgr.classList.remove('modal-open');
      };
    }

    // Search Results Modal Toggles
    const openSearchModalBtn = document.getElementById('btn-open-search-modal');
    const closeSearchModalBtn = document.getElementById('close-search-modal-btn');
    const closeSearchModalFooter = document.getElementById('close-search-modal-footer');
    const modalSearch = document.getElementById('modal-search-results');

    const openSearchModal = async () => {
      audioEngine.playClick();
      this.isSearchModalOpen = true;
      if (modalSearch) modalSearch.classList.add('modal-open');
      await this.triggerSearch();
    };

    const closeSearchModal = () => {
      audioEngine.playClick();
      this.isSearchModalOpen = false;
      if (modalSearch) modalSearch.classList.remove('modal-open');
    };

    if (openSearchModalBtn) openSearchModalBtn.onclick = openSearchModal;
    if (closeSearchModalBtn) closeSearchModalBtn.onclick = closeSearchModal;
    if (closeSearchModalFooter) closeSearchModalFooter.onclick = closeSearchModal;

    // Browse search folder button
    const browseFolderBtn = document.getElementById('btn-browse-search-folder');
    if (browseFolderBtn) {
      browseFolderBtn.onclick = async () => {
        audioEngine.playClick();
        if (isNative) {
          const folder = await chooseFolder();
          if (folder) {
            this.searchFolder = folder;
            this.searchFolderName = folder.split(/[\\/]/).pop() || folder;
            const labelEl = document.getElementById('current-search-folder-label');
            if (labelEl) {
              labelEl.textContent = `📁 ${this.searchFolderName}`;
              labelEl.title = folder;
            }
            const modalLoc = document.getElementById('modal-search-location-text');
            if (modalLoc) modalLoc.innerHTML = `Buscando en: <strong>${folder}</strong>`;
            await this.triggerSearch();
          }
        }
      };
    }

    // Search input
    const searchInput = document.getElementById('file-search-input');
    const modalSearchField = document.getElementById('modal-search-field');
    const clearBtn = document.getElementById('clear-search-btn');

    if (searchInput) {
      searchInput.oninput = (e) => {
        const val = e.target.value;
        this.themeEngine.setSearchQuery(val);
        if (clearBtn) clearBtn.classList.toggle('hidden', !val);
        if (modalSearchField) modalSearchField.value = val;
        this.triggerSearch();
      };
      searchInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          openSearchModal();
        }
      };
    }

    if (modalSearchField) {
      modalSearchField.oninput = (e) => {
        const val = e.target.value;
        this.themeEngine.setSearchQuery(val);
        if (searchInput) searchInput.value = val;
        this.triggerSearch();
      };
    }

    if (clearBtn && searchInput) {
      clearBtn.onclick = () => {
        searchInput.value = '';
        this.themeEngine.setSearchQuery('');
        clearBtn.classList.add('hidden');
        if (modalSearchField) modalSearchField.value = '';
        this.triggerSearch();
      };
    }

    // Helper for native Windows ms-settings and ms-clock protocols
    const openWindowsUri = (uri) => openUri(uri);

    // File Type Dropdown filter (Compact space-saver, no horizontal scroll)
    const fileTypeDropdown = document.getElementById('file-type-dropdown');
    if (fileTypeDropdown) {
      fileTypeDropdown.onchange = (e) => {
        audioEngine.playClick();
        const filter = e.target.value;
        this.themeEngine.setSearchFilter(filter);
        this.updateSearchModalResults();
      };
    }

    // Modal filter pills
    document.querySelectorAll('.modal-filters .filter-pill').forEach(pill => {
      pill.onclick = () => {
        audioEngine.playClick();
        const filter = pill.dataset.filter;
        this.themeEngine.setSearchFilter(filter);
        document.querySelectorAll('.modal-filters .filter-pill').forEach(p => {
          p.classList.toggle('active-filter', p.dataset.filter === filter);
        });
        if (fileTypeDropdown) fileTypeDropdown.value = filter;
        this.updateSearchModalResults();
      };
    });

    // Battery Settings Action
    const batterySettingsBtn = document.getElementById('btn-open-battery-settings');
    if (batterySettingsBtn) {
      batterySettingsBtn.onclick = () => {
        audioEngine.playClick();
        openWindowsUri('ms-settings:powersleep');
      };
    }

    // Network Settings Action
    const netSettingsBtn = document.getElementById('btn-open-net-settings');
    if (netSettingsBtn) {
      netSettingsBtn.onclick = () => {
        audioEngine.playClick();
        openWindowsUri('ms-settings:network');
      };
    }

    // Calendar & Clock Squares Action
    const calBox = document.getElementById('widget-calendar-box');
    if (calBox) {
      calBox.onclick = () => {
        audioEngine.playClick();
        openWindowsUri('ms-clock:');
      };
    }

    const clockBox = document.getElementById('widget-clock-box');
    if (clockBox) {
      clockBox.onclick = () => {
        audioEngine.playClick();
        openWindowsUri('ms-clock:');
      };
    }

    // Native task manager button
    const nativeTaskMgrBtn = document.getElementById('btn-native-taskmgr');
    if (nativeTaskMgrBtn) {
      nativeTaskMgrBtn.onclick = () => {
        audioEngine.playNotification();
        if (isNative) {
          launchApp({ id: 'taskmgr' });
          return;
        }
        alert('Abriendo el Administrador de Tareas nativo de Windows (Ctrl + Shift + Esc).');
        window.location.href = 'ms-settings:';
      };
    }

    // Kill process
    const tbody = document.getElementById('taskmgr-tbody');
    if (tbody) {
      tbody.onclick = (e) => {
        const killBtn = e.target.closest('.btn-kill-proc');
        if (killBtn) {
          const pid = parseInt(killBtn.dataset.pid, 10);
          audioEngine.playAlert();
          this.processes = this.processes.filter(p => p.pid !== pid);
          const row = killBtn.closest('tr');
          if (row) row.remove();
        }
      };
    }

    // Volume & Mute
    const muteBtn = document.getElementById('btn-toggle-mute');
    const volSlider = document.getElementById('widget-volume-slider');
    const volText = document.getElementById('widget-volume-text');

    if (muteBtn) {
      muteBtn.onclick = () => {
        audioEngine.playClick();
        this.themeEngine.toggleMute();
        const s = this.themeEngine.getState();
        muteBtn.classList.toggle('muted', s.isMuted);
        muteBtn.textContent = s.isMuted ? 'Activar Sonido' : 'Silenciar';
        if (volText) volText.textContent = s.isMuted ? '0%' : `${s.volume}%`;
        if (volSlider) volSlider.value = s.isMuted ? 0 : s.volume;
      };
    }

    if (volSlider) {
      volSlider.oninput = (e) => {
        const val = parseInt(e.target.value, 10);
        this.themeEngine.setVolume(val);
        if (volText) volText.textContent = `${val}%`;
        if (muteBtn) {
          muteBtn.classList.toggle('muted', val === 0);
          muteBtn.textContent = val === 0 ? 'Activar Sonido' : 'Silenciar';
        }
      };
    }

    // Wi-Fi: Click to open Windows Network Settings!
    const wifiBox = document.getElementById('toggle-wifi-box');
    if (wifiBox) {
      wifiBox.onclick = () => {
        audioEngine.playClick();
        // Native Windows URI protocol for Wi-Fi settings
        try {
          window.location.href = 'ms-settings:network-wifi';
        } catch (e) {}
        this.themeEngine.toggleWifi();
        wifiBox.classList.toggle('conn-active', this.themeEngine.getState().wifiEnabled);
        const sw = wifiBox.querySelector('.conn-switch');
        if (sw) sw.textContent = this.themeEngine.getState().wifiEnabled ? 'ON' : 'OFF';
      };
    }

    // Bluetooth: Click to open Windows Bluetooth Settings!
    const btBox = document.getElementById('toggle-bt-box');
    if (btBox) {
      btBox.onclick = () => {
        audioEngine.playClick();
        // Native Windows URI protocol for Bluetooth settings
        try {
          window.location.href = 'ms-settings:bluetooth';
        } catch (e) {}
        this.themeEngine.toggleBluetooth();
        btBox.classList.toggle('conn-active', this.themeEngine.getState().bluetoothEnabled);
        const sw = btBox.querySelector('.conn-switch');
        if (sw) sw.textContent = this.themeEngine.getState().bluetoothEnabled ? 'ON' : 'OFF';
      };
    }

    // Printer Actions
    const openPrinterSettingsBtn = document.getElementById('btn-open-printer-settings');
    if (openPrinterSettingsBtn) {
      openPrinterSettingsBtn.onclick = () => {
        audioEngine.playClick();
        openUri('ms-settings:printers');
      };
    }

    const printTestPageBtn = document.getElementById('btn-print-test-page');
    if (printTestPageBtn) {
      printTestPageBtn.onclick = () => {
        audioEngine.playNotification();
        this.themeEngine.update({
          printerStatus: 'printing',
          printJob: {
            docName: 'Pagina_De_Prueba_Windows.pdf',
            totalPages: 1,
            currentPage: 1,
            percent: 100,
            speedPpm: 22
          }
        });
        setTimeout(() => {
          this.themeEngine.update({
            printerStatus: 'idle',
            printJob: {
              docName: 'Sin trabajos en cola (Lista)',
              totalPages: 0,
              currentPage: 0,
              percent: 0,
              speedPpm: 0
            }
          });
        }, 4000);
      };
    }
  }
}
