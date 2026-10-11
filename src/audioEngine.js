// TopApp WinTheme Pro - Synthesized Glassmorphism Audio Engine
// Web Audio API based generative sound schemes & real-time audio visualizer
// Supports individual activation, custom sound profiles, and persistent configuration

export const SOUND_PROFILES = {
  startup: [
    { id: 'crystal', name: 'Cristalino Tochka (Por defecto)', desc: 'Acorde mayor novena majestuoso con sobretonos de cristal' },
    { id: 'cyber', name: 'Cyberpunk Synthwave', desc: 'Fanfarria sintética retro 80s con filtro resonante' },
    { id: 'zen', name: 'Campana Zen / Cuenco', desc: 'Armónicos tibetanos relajantes con decaimiento prolongado' },
    { id: 'minimal', name: 'Pulso Moderno Minimal', desc: 'Doble chime sutil y etéreo de alta fidelidad' }
  ],
  notification: [
    { id: 'crystal', name: 'Triada Cristal (Por defecto)', desc: 'Campanas ascendentes en escala diatónica' },
    { id: 'cyber', name: 'Arpegio Sci-Fi', desc: 'Trill electrónico futurista rápido' },
    { id: 'zen', name: 'Cuenco Armónico', desc: 'Tono acústico sereno y suave' },
    { id: 'bubble', name: 'Gota / Burbuja Líquida', desc: 'Pop acústico redondeado de agua cristalina' }
  ],
  click: [
    { id: 'tactile', name: 'Micro-Impulso Táctil (Por defecto)', desc: 'Pulsación háptica de baja frecuencia ultra sobria' },
    { id: 'pop', name: 'Burbuja Suave (Pop)', desc: 'Sonido suave de interfaz moderna redondeada' },
    { id: 'mechanical', name: 'Interruptor Mecánico', desc: 'Doble clic nítido estilo Cherry MX Blue' },
    { id: 'wood', name: 'Tock de Madera Acústico', desc: 'Impacto orgánico de madera pulida' }
  ],
  switch: [
    { id: 'tactile', name: 'Doble Impulso (Por defecto)', desc: 'Respuesta háptica doble al conmutar' },
    { id: 'crisp', name: 'Palanca Nítida', desc: 'Chasquido metálico claro y definido' },
    { id: 'soft', name: 'Deslizamiento Suave', desc: 'Filtro de aire amortiguado tipo fader' }
  ],
  ambient: [
    { id: 'synth', name: 'Acorde Etéreo C-E-G-B (Por defecto)', desc: 'Colchón de sintetizador analógico con osciladores LFO' },
    { id: 'space', name: 'Nebulosa Cósmica', desc: 'Graves profundos y brillo estelar flotante' },
    { id: 'calm', name: 'Brisa Zen Mate', desc: 'Ondas senoidales puras y armónicos de descanso' }
  ]
};

const DEFAULT_SETTINGS = {
  startup: { enabled: true, profile: 'crystal' },
  notification: { enabled: true, profile: 'crystal' },
  click: { enabled: true, profile: 'tactile' },
  switch: { enabled: true, profile: 'tactile' },
  ambient: { enabled: true, profile: 'synth' }
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.ambientOscillators = [];
    this.ambientGain = null;
    this.isAmbientPlaying = false;
    this.volume = 0.7;
    this.muted = false;
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('topapp_sound_settings_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          startup: { ...DEFAULT_SETTINGS.startup, ...parsed.startup },
          notification: { ...DEFAULT_SETTINGS.notification, ...parsed.notification },
          click: { ...DEFAULT_SETTINGS.click, ...parsed.click },
          switch: { ...DEFAULT_SETTINGS.switch, ...parsed.switch },
          ambient: { ...DEFAULT_SETTINGS.ambient, ...parsed.ambient }
        };
      }
    } catch (e) {
      console.warn('Error loading sound settings', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  saveSettings() {
    try {
      localStorage.setItem('topapp_sound_settings_v3', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Error saving sound settings', e);
    }
  }

  setSoundEnabled(eventKey, enabled) {
    if (this.settings[eventKey]) {
      this.settings[eventKey].enabled = !!enabled;
      this.saveSettings();
    }
  }

  setSoundProfile(eventKey, profile) {
    if (this.settings[eventKey]) {
      this.settings[eventKey].profile = profile;
      this.saveSettings();
    }
  }

  getSoundSettings() {
    return JSON.parse(JSON.stringify(this.settings));
  }

  resetToDefaults() {
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    this.saveSettings();
    this.setMuted(false);
    this.setVolume(0.7);
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  setMuted(muted) {
    this.muted = !!muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  // Windows Glass Startup Sound
  playStartup(forceProfile = null) {
    const prof = forceProfile || this.settings.startup.profile;
    if (!forceProfile && (this.muted || !this.settings.startup.enabled)) return;
    this.init();
    const now = this.ctx.currentTime;

    if (prof === 'cyber') {
      // 80s Cyber synth fanfare with ascending fifths
      const notes = [146.83, 220.00, 293.66, 440.00, 587.33]; // D3, A3, D4, A4, D5
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.6);
        filter.Q.setValueAtTime(4.0, now);

        const startTime = now + idx * 0.07;
        const duration = 2.0;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.2 / (idx + 1), startTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
      return;
    }

    if (prof === 'zen') {
      // Tibetan Singing Bell
      const baseFreq = 216.0; // A3 harmonic
      const partials = [1, 2.76, 5.4, 8.9];
      partials.forEach((mult, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * mult, now);

        const dur = 3.5 - i * 0.5;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.25 / (i + 1), now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + dur);
      });
      return;
    }

    if (prof === 'minimal') {
      // Clean modern dual chime (F#5, C#6)
      [739.99, 1108.73].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        const start = now + idx * 0.14;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(start);
        osc.stop(start + 1.9);
      });
      return;
    }

    // Default: 'crystal' - Major 9th chord C3, G3, D4, E4, B4, D5
    const freqs = [130.81, 196.00, 293.66, 329.63, 493.88, 587.33];
    freqs.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200 + index * 400, now);

      const delay = index * 0.09;
      const startTime = now + delay;
      const duration = 2.8;

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.22 / (index + 1), startTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  // Futuristic Notification Chime
  playNotification(forceProfile = null) {
    const prof = forceProfile || this.settings.notification.profile;
    if (!forceProfile && (this.muted || !this.settings.notification.enabled)) return;
    this.init();
    const now = this.ctx.currentTime;

    if (prof === 'cyber') {
      const notes = [587.33, 880, 1174.66, 1479.98]; // D5, A5, D6, F#6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        const start = now + idx * 0.05;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(start);
        osc.stop(start + 0.5);
      });
      return;
    }

    if (prof === 'zen') {
      const notes = [440, 659.25]; // A4, E5
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        const start = now + idx * 0.12;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.24, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(start);
        osc.stop(start + 1.3);
      });
      return;
    }

    if (prof === 'bubble') {
      // Liquid droplet pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
      return;
    }

    // Default: 'crystal' (C5, E5, C6)
    const notes = [523.25, 659.25, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const start = now + idx * 0.08;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.7);
    });
  }

  // Tactile UI click
  playClick(forceProfile = null) {
    const prof = forceProfile || this.settings.click.profile;
    if (!forceProfile && (this.muted || !this.settings.click.enabled)) return;
    this.init();
    const now = this.ctx.currentTime;

    if (prof === 'pop') {
      // Rounded soft bubble pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.03);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
      return;
    }

    if (prof === 'mechanical') {
      // Dual crisp micro-click like Cherry MX
      [0, 0.012].forEach((delay, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(i === 0 ? 1800 : 1200, now + delay);

        gain.gain.setValueAtTime(0.14, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.02);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + delay);
        osc.stop(now + delay + 0.025);
      });
      return;
    }

    if (prof === 'wood') {
      // Acoustic wood tock
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.045);
      return;
    }

    // Default: 'tactile' (subtle low sine pulse 800Hz -> 200Hz)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Double tactile toggle switch
  playSwitch(forceProfile = null) {
    const prof = forceProfile || this.settings.switch.profile;
    if (!forceProfile && (this.muted || !this.settings.switch.enabled)) return;
    this.init();
    const now = this.ctx.currentTime;

    if (prof === 'crisp') {
      [0, 0.03].forEach((delay, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(i === 0 ? 1200 : 1600, now + delay);

        gain.gain.setValueAtTime(0.08, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.025);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + delay);
        osc.stop(now + delay + 0.03);
      });
      return;
    }

    if (prof === 'soft') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(550, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
      return;
    }

    // Default: 'tactile'
    [0, 0.045].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(i === 0 ? 550 : 820, now + delay);

      gain.gain.setValueAtTime(0.1, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.03);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.04);
    });
  }

  playDevice() {
    this.init();
    if (this.muted) return;
    const now = this.ctx.currentTime;

    [440, 880].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0.15, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.4);
    });
  }

  playAlert() {
    this.init();
    if (this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(260, now + 0.12);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  // Generative Ambient Synth Drone
  toggleAmbient() {
    this.init();
    if (this.isAmbientPlaying) {
      this.stopAmbient();
      return false;
    } else {
      if (!this.settings.ambient.enabled) {
        this.setSoundEnabled('ambient', true);
      }
      this.startAmbient();
      return true;
    }
  }

  startAmbient(forceProfile = null) {
    if (this.isAmbientPlaying) return;
    const prof = forceProfile || this.settings.ambient.profile;
    if (!forceProfile && (this.muted || !this.settings.ambient.enabled)) return;
    this.init();
    const now = this.ctx.currentTime;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, now);
    this.ambientGain.gain.linearRampToValueAtTime(0.18, now + 2.0);

    let notes = [130.81, 164.81, 196.00, 246.94]; // C-E-G-B warm ambient chord
    if (prof === 'space') {
      notes = [65.41, 98.00, 130.81, 196.00, 293.66]; // Deep cosmic C2-G2-C3-G3-D4
    } else if (prof === 'calm') {
      notes = [174.61, 220.00, 261.63, 329.63]; // F3-A3-C4-E4 Fmaj7
    }

    this.ambientOscillators = notes.map((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle LFO detune for ethereal shimmer
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.05, now);
      lfoGain.gain.setValueAtTime(3.0, now);
      lfo.connect(osc.frequency);
      lfo.start(now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + idx * 200, now);

      if (pan) {
        pan.pan.setValueAtTime((idx / (notes.length - 1)) * 1.6 - 0.8, now);
        osc.connect(filter);
        filter.connect(pan);
        pan.connect(this.ambientGain);
      } else {
        osc.connect(filter);
        filter.connect(this.ambientGain);
      }

      osc.start(now);
      return { osc, lfo };
    });

    this.ambientGain.connect(this.masterGain);
    this.isAmbientPlaying = true;
  }

  stopAmbient() {
    if (!this.isAmbientPlaying || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    setTimeout(() => {
      this.ambientOscillators.forEach(({ osc, lfo }) => {
        try {
          osc.stop();
          lfo.stop();
        } catch (e) {}
      });
      this.ambientOscillators = [];
      this.isAmbientPlaying = false;
    }, 1300);
  }

  getVisualizerData(dataArray) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(dataArray);
      return true;
    }
    return false;
  }
}

export const audioEngine = new AudioEngine();
