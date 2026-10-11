// TopApp WinTheme Pro - Procedural Interactive Live Wallpapers Engine
// High performance 60fps Canvas renderers

export class LiveWallpaperManager {
  constructor(canvasElement, themeEngine) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.themeEngine = themeEngine;
    this.animId = null;
    this.time = 0;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
    this.orbs = [];
    this.gridLines = [];
    this.running = false;

    this.initCanvasSize();
    this.initEvents();
    this.initOrbs();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  resize() {
    this.initCanvasSize();
    this.initOrbs();
  }

  initEvents() {
    const handleMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.targetX = e.clientX - rect.left;
      this.mouse.targetY = e.clientY - rect.top;
      this.mouse.active = true;
    };

    window.addEventListener('resize', () => this.resize());
    if (this.canvas.parentElement) {
      this.canvas.parentElement.addEventListener('mousemove', handleMove);
      this.canvas.parentElement.addEventListener('mouseleave', () => {
        this.mouse.active = false;
      });
    }
  }

  initOrbs() {
    const count = 18;
    this.orbs = [];
    for (let i = 0; i < count; i++) {
      this.orbs.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 35 + Math.random() * 85,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        hueOffset: Math.random() * 60 - 30,
        opacity: 0.25 + Math.random() * 0.45,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  render() {
    const { wallpaperType, liveWallpaperId, primaryColor, secondaryColor, mode } = this.themeEngine.getState();
    if (wallpaperType !== 'live') {
      return; // Skip rendering when a static image wallpaper is active
    }

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;
    this.time += 0.016;

    this.ctx.clearRect(0, 0, this.width, this.height);

    switch (liveWallpaperId) {
      case 'glass-orbs':
        this.renderGlassOrbs(primaryColor, secondaryColor, mode);
        break;
      case 'cyber-grid':
        this.renderCyberGrid(primaryColor, secondaryColor, mode);
        break;
      case 'aurora-waves':
      default:
        this.renderAuroraWaves(primaryColor, secondaryColor, mode);
        break;
    }
  }

  // Live Aurora Waves (Fluid luminous ribbons with mouse warp)
  renderAuroraWaves(color1, color2, mode) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Dark gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    if (mode === 'oled') {
      bgGrad.addColorStop(0, '#030508');
      bgGrad.addColorStop(1, '#080d1a');
    } else {
      bgGrad.addColorStop(0, '#070b19');
      bgGrad.addColorStop(0.5, '#0b132b');
      bgGrad.addColorStop(1, '#050711');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const waveCount = 5;
    const segments = 45;

    for (let wave = 0; wave < waveCount; wave++) {
      ctx.beginPath();
      const waveProgress = wave / waveCount;
      const baseFreq = 0.0025 + wave * 0.001;
      const speed = this.time * (0.8 + wave * 0.2);
      const baseY = h * 0.35 + wave * (h * 0.1);

      ctx.moveTo(0, h);

      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * w;
        let y = baseY +
          Math.sin(x * baseFreq + speed) * (60 + wave * 25) +
          Math.cos(x * 0.005 - speed * 0.8) * 35;

        // Interaction with mouse
        if (this.mouse.active) {
          const dx = x - this.mouse.x;
          const dy = y - this.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 260) {
            const force = (1 - dist / 260) * 60;
            y += (dy > 0 ? 1 : -1) * force;
          }
        }

        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineTo(w, h);
      ctx.closePath();

      const waveGrad = ctx.createLinearGradient(0, baseY - 80, w, h);
      const isAlt = wave % 2 === 0;
      const activeColor = isAlt ? color1 : color2;

      waveGrad.addColorStop(0, activeColor + '88');
      waveGrad.addColorStop(0.5, isAlt ? color2 + '44' : color1 + '33');
      waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = waveGrad;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fill();

      // Top luminous stroke
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Floating Glass Orbs with iridescent refraction
  renderGlassOrbs(color1, color2, mode) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Deep backdrop
    ctx.fillStyle = mode === 'oled' ? '#020305' : '#080d19';
    ctx.fillRect(0, 0, w, h);

    // Subtle background mesh
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Update and draw orbs
    this.orbs.forEach((orb, idx) => {
      orb.x += orb.vx;
      orb.y += orb.vy;

      // Mouse repulsion
      if (this.mouse.active) {
        const dx = orb.x - this.mouse.x;
        const dy = orb.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          const force = (1 - dist / 180) * 3;
          orb.x += (dx / dist) * force;
          orb.y += (dy / dist) * force;
        }
      }

      // Bounce on edges
      if (orb.x < -orb.radius) orb.x = w + orb.radius;
      if (orb.x > w + orb.radius) orb.x = -orb.radius;
      if (orb.y < -orb.radius) orb.y = h + orb.radius;
      if (orb.y > h + orb.radius) orb.y = -orb.radius;

      const currentRadius = orb.radius + Math.sin(this.time * orb.pulseSpeed + orb.phase) * 6;

      ctx.save();
      // Glass body gradient
      const orbGrad = ctx.createRadialGradient(
        orb.x - currentRadius * 0.35,
        orb.y - currentRadius * 0.35,
        currentRadius * 0.1,
        orb.x,
        orb.y,
        currentRadius
      );

      const orbColor = idx % 2 === 0 ? color1 : color2;
      orbGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      orbGrad.addColorStop(0.3, orbColor + '66');
      orbGrad.addColorStop(0.8, orbColor + '22');
      orbGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

      ctx.beginPath();
      ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = orbGrad;
      ctx.fill();

      // Outer glass rim sheen
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = orbColor;
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Specular highlight
      ctx.beginPath();
      ctx.ellipse(
        orb.x - currentRadius * 0.35,
        orb.y - currentRadius * 0.35,
        currentRadius * 0.25,
        currentRadius * 0.12,
        Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.fill();

      ctx.restore();
    });
  }

  // 3D Perspective Cyber Grid Horizon
  renderCyberGrid(color1, color2, mode) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const horizon = h * 0.52;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, mode === 'oled' ? '#000000' : '#040714');
    skyGrad.addColorStop(1, '#110a28');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizon);

    // Glowing Neon Sun/Horizon Orb
    ctx.save();
    const sunGrad = ctx.createRadialGradient(w / 2, horizon - 20, 10, w / 2, horizon - 20, 140);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.3, color1);
    sunGrad.addColorStop(0.8, color2 + '66');
    sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w / 2, horizon - 20, 140, Math.PI, 0, false);
    ctx.fill();
    ctx.restore();

    // Horizon line
    ctx.strokeStyle = color1;
    ctx.shadowColor = color1;
    ctx.shadowBlur = 20;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();

    // Floor area
    ctx.fillStyle = mode === 'oled' ? '#010204' : '#070a18';
    ctx.fillRect(0, horizon, w, h - horizon);

    // Perspective lines (Vertical radiating from center)
    const lineCount = 22;
    const vanishX = w / 2 + (this.mouse.active ? (this.mouse.x - w / 2) * 0.15 : 0);

    ctx.save();
    ctx.strokeStyle = color1 + '55';
    ctx.lineWidth = 1.5;

    for (let i = -lineCount; i <= lineCount; i++) {
      const startX = vanishX + i * 25;
      const endX = w / 2 + i * (w / 8);
      ctx.beginPath();
      ctx.moveTo(startX, horizon);
      ctx.lineTo(endX, h);
      ctx.stroke();
    }

    // Moving horizontal grid lines (Perspective spacing)
    const speed = (this.time * 65) % 80;
    for (let i = 0; i < 16; i++) {
      const p = Math.pow((i * 45 + speed) / 720, 2.2);
      const lineY = horizon + p * (h - horizon);
      if (lineY > horizon && lineY <= h) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + p * 0.4})`;
        ctx.lineWidth = 1 + p * 1.5;
        ctx.moveTo(0, lineY);
        ctx.lineTo(w, lineY);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
