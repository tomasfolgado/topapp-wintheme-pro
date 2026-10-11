/**
 * TopApp WinTheme Pro — Modular Music Player Widget Component
 * Vanguardist Audio Player with Web Audio API, Dual-Tone Spectrum Visualizer & 5-Band EQ
 */

(function () {
  let audioEl = null;
  let audioCtx = null;
  let audioSource = null;
  let analyser = null;
  let gainNode = null;
  let eqFilters = [];
  let isAudioGraphReady = false;

  // Synthesized demo audio buffer generator
  let demoAudioUrl = null;

  // Visualizer state
  let visualizerAnimId = null;
  let peakHeights = new Array(28).fill(0);
  let peakDropSpeed = new Array(28).fill(0);

  // Equalizer Frequencies (5-Band)
  const EQ_FREQS = [60, 250, 1000, 4000, 14000];
  const EQ_PRESETS = {
    flat: [0, 0, 0, 0, 0],
    bass: [8, 6, 0, 1, 2],
    vocal: [-2, 1, 6, 4, 0],
    rock: [6, 4, -1, 5, 6],
    electro: [7, 5, 1, 4, 7]
  };

  // Playlist state
  let playlist = [];
  let currentTrackIndex = 0;
  let isPlaying = false;
  let isShuffle = false;
  let isRepeat = false;
  let currentSearchQuery = '';
  let isPlaylistDrawerOpen = false;

  // Generate a soft ambient synthwave demo loop so user can play immediately
  function generateSynthDemo() {
    if (demoAudioUrl) return demoAudioUrl;
    try {
      const sampleRate = 22050;
      const durationSec = 6.0;
      const numFrames = Math.floor(sampleRate * durationSec);
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, numFrames, sampleRate);

      // Chords: Fm7 -> Ab -> Eb -> Bb
      const notes = [174.61, 220.0, 261.63, 329.63, 392.0];
      notes.forEach((freq, i) => {
        const osc = offlineCtx.createOscillator();
        const g = offlineCtx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, 0);

        // Gentle tremolo
        g.gain.setValueAtTime(0.08 / notes.length, 0);
        g.gain.linearRampToValueAtTime(0.18 / notes.length, 3.0);
        g.gain.linearRampToValueAtTime(0.08 / notes.length, 6.0);

        osc.connect(g);
        g.connect(offlineCtx.destination);
        osc.start(0);
        osc.stop(durationSec);
      });

      // Simple beat pulse
      const kickOsc = offlineCtx.createOscillator();
      const kickGain = offlineCtx.createGain();
      kickOsc.frequency.setValueAtTime(110, 0);
      kickOsc.frequency.exponentialRampToValueAtTime(35, 0.25);
      kickGain.gain.setValueAtTime(0.25, 0);
      kickGain.gain.exponentialRampToValueAtTime(0.001, 0.35);
      kickOsc.connect(kickGain);
      kickGain.connect(offlineCtx.destination);
      kickOsc.start(0);
      kickOsc.stop(0.4);

      offlineCtx.startRendering().then(renderedBuffer => {
        demoAudioUrl = bufferToWavUrl(renderedBuffer);
        if (playlist.length === 0) {
          playlist.push({
            id: 'demo-synth',
            name: 'TopApp Cyber Ambience (Demo)',
            artist: 'Sintetizador Modular',
            ext: 'SYNTH',
            url: demoAudioUrl,
            duration: 6.0
          });
          updateCurrentTrackUI();
          renderPlaylistItems();
        }
      }).catch(() => {});
    } catch (e) {}
    return null;
  }

  function bufferToWavUrl(abuffer) {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels = [];
    let pos = 0;

    function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

    let sampleIdx = 0;
    while (sampleIdx < abuffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][sampleIdx]));
        out.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        pos += 2;
      }
      sampleIdx++;
    }
    return URL.createObjectURL(new Blob([out.buffer], { type: 'audio/wav' }));
  }

  // Generate Widget Card Markup
  window.renderMusicWidgetCard = function () {
    return `
    <div class="w-card" id="card-music">
      <!-- Hidden Native Audio Element -->
      <audio id="music-audio-element" preload="metadata" crossorigin="anonymous"></audio>

      <!-- Card Header -->
      <div class="w-head">
        <span><span class="w-dot dot-orange"></span>Música</span>
        <div class="music-head-actions">
          <button class="music-btn-head ${isPlaylistDrawerOpen ? 'active' : ''}" id="btn-toggle-playlist" title="Lista de Canciones">
            <svg class="head-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
          </button>
          <button class="music-btn-head" id="btn-toggle-eq" title="Ecualizador">
            <svg class="head-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><circle cx="4" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="6" r="2" fill="currentColor"/><circle cx="20" cy="14" r="2" fill="currentColor"/></svg>
          </button>
          <button class="music-btn-head" id="btn-add-music" title="Cargar Archivos de Música">
            <svg class="head-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>

      <!-- Hero Track Presentation (Disc + Info) -->
      <div class="music-hero">
        <div class="music-disc-wrap">
          <div class="music-disc" id="music-disc">
            <img class="music-disc-cover-img" id="music-disc-cover" style="display:none;" alt="Carátula" />
            <div class="music-disc-center">
              <div class="music-disc-hole"></div>
            </div>
          </div>
          <!-- Popover Zoom Cuadrada 150x150px al colocar el ratón -->
          <div class="music-cover-zoom-card" id="music-cover-zoom-card">
            <img class="music-cover-zoom-img" id="music-cover-zoom-img" style="display:none;" alt="Carátula ampliada" />
            <div class="music-cover-zoom-fallback" id="music-cover-zoom-fallback">
              <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span style="font-size: 0.58rem; margin-top: 6px; color: var(--accent); font-weight: 600;">Disco de Audio</span>
            </div>
            <div class="music-cover-zoom-title" id="music-cover-zoom-title"></div>
          </div>
        </div>
        <div class="music-info">
          <div class="music-title-marquee" id="music-title">Cargando música...</div>
          <div class="music-meta-row">
            <span class="music-artist" id="music-artist">TopApp Suite Audio</span>
            <span class="music-badge-format" id="music-format">AUDIO</span>
          </div>
        </div>
      </div>

      <!-- Vanguardist Audio Visualizer Spectrum -->
      <div class="music-visualizer-container">
        <canvas id="music-visualizer-canvas" width="192" height="30"></canvas>
      </div>

      <!-- Interactive Seekbar / Timeline -->
      <div class="music-timeline-wrap">
        <span class="music-time" id="music-time-cur">00:00</span>
        <input type="range" class="music-seek-bar" id="music-seek-bar" min="0" max="100" value="0" step="0.1">
        <span class="music-time right" id="music-time-total">00:00</span>
      </div>

      <!-- Main Controls Row - Transparent, Modern Vector Icons -->
      <div class="music-controls-row">
        <button class="music-ctrl-btn" id="btn-music-shuffle" title="Reproducción Aleatoria">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
        </button>
        <button class="music-ctrl-btn" id="btn-music-prev" title="Canción Anterior">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
        </button>
        <button class="music-play-btn" id="btn-music-play" title="Reproducir / Pausar">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><polygon points="7 4 19 12 7 20 7 4"/></svg>
        </button>
        <button class="music-ctrl-btn" id="btn-music-next" title="Siguiente Canción">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
        </button>
        <button class="music-ctrl-btn" id="btn-music-repeat" title="Repetir Canción">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        </button>
        <div class="music-vol-wrap" title="Volumen">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          <input type="range" class="music-vol-slider" id="music-volume" min="0" max="1" step="0.02" value="0.85">
        </div>
      </div>

      <!-- Quick Search / File Filter Bar -->
      <div class="music-search-bar" id="music-search-bar">
        <input type="text" class="music-search-input" id="music-search-input" placeholder="🔍 Buscar canción..." />
        <button class="music-btn-head" id="btn-browse-folder-music" title="Cargar carpeta completa de música">
          <svg class="head-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>

      <!-- Collapsible Equalizer Drawer Panel -->
      <div class="music-eq-drawer" id="music-eq-drawer">
        <div class="music-eq-head">
          <span>Ecualizador Paramétrico 5-Bandas</span>
          <span id="music-eq-active-preset" style="color: #00e5db; font-size: 0.52rem;">Plano</span>
        </div>
        <div class="music-eq-presets">
          <button class="music-preset-chip active" data-preset="flat">Plano</button>
          <button class="music-preset-chip" data-preset="bass">Bass Boost</button>
          <button class="music-preset-chip" data-preset="vocal">Vocal</button>
          <button class="music-preset-chip" data-preset="rock">Rock</button>
          <button class="music-preset-chip" data-preset="electro">Electrónica</button>
        </div>
        <div class="music-eq-sliders-grid">
          <div class="music-eq-col">
            <span class="music-eq-val" id="eq-val-0">0dB</span>
            <input type="range" class="music-eq-slider" id="eq-slider-0" data-band="0" min="-12" max="12" step="1" value="0">
            <span class="music-eq-freq">60Hz</span>
          </div>
          <div class="music-eq-col">
            <span class="music-eq-val" id="eq-val-1">0dB</span>
            <input type="range" class="music-eq-slider" id="eq-slider-1" data-band="1" min="-12" max="12" step="1" value="0">
            <span class="music-eq-freq">250Hz</span>
          </div>
          <div class="music-eq-col">
            <span class="music-eq-val" id="eq-val-2">0dB</span>
            <input type="range" class="music-eq-slider" id="eq-slider-2" data-band="2" min="-12" max="12" step="1" value="0">
            <span class="music-eq-freq">1kHz</span>
          </div>
          <div class="music-eq-col">
            <span class="music-eq-val" id="eq-val-3">0dB</span>
            <input type="range" class="music-eq-slider" id="eq-slider-3" data-band="3" min="-12" max="12" step="1" value="0">
            <span class="music-eq-freq">4kHz</span>
          </div>
          <div class="music-eq-col">
            <span class="music-eq-val" id="eq-val-4">0dB</span>
            <input type="range" class="music-eq-slider" id="eq-slider-4" data-band="4" min="-12" max="12" step="1" value="0">
            <span class="music-eq-freq">14kHz</span>
          </div>
        </div>
      </div>

      <!-- Collapsible Playlist Drawer Panel -->
      <div class="music-playlist-drawer ${isPlaylistDrawerOpen ? 'is-open' : ''}" id="music-playlist-drawer">
        <div class="music-playlist-items" id="music-playlist-items"></div>
      </div>
    </div>
    `;
  };

  function ensureAudioElement() {
    if (!audioEl) {
      let existing = document.getElementById('music-audio-element');
      if (existing) {
        audioEl = existing;
      } else {
        audioEl = document.createElement('audio');
        audioEl.id = 'music-audio-element';
        audioEl.preload = 'metadata';
        audioEl.crossOrigin = 'anonymous';
        audioEl.style.display = 'none';
        document.body.appendChild(audioEl);
      }
    }
    return audioEl;
  }

  // Initialize Engine & Bind UI Events
  window.initMusicWidget = function () {
    const card = document.getElementById('card-music');
    if (!card) return;

    ensureAudioElement();

    // Load saved playlist from config if any
    const cfg = window.config || (typeof config !== 'undefined' ? config : null);
    if (cfg?.musicPlaylist && Array.isArray(cfg.musicPlaylist) && cfg.musicPlaylist.length) {
      playlist = cfg.musicPlaylist;
    } else if (playlist.length === 0) {
      generateSynthDemo();
    }

    setupAudioEngine();
    bindWidgetEvents();
    setupDragAndDrop();
    startVisualizerLoop();
    updateCurrentTrackUI();
    updatePlayStateUI();
    renderPlaylistItems();

    const drawer = document.getElementById('music-playlist-drawer');
    const togglePlaylistBtn = document.getElementById('btn-toggle-playlist');
    if (drawer && togglePlaylistBtn) {
      drawer.classList.toggle('is-open', isPlaylistDrawerOpen);
      togglePlaylistBtn.classList.toggle('active', isPlaylistDrawerOpen);
    }
  };

  function setupAudioEngine() {
    if (isAudioGraphReady) return;
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;

      audioCtx = new AudioCtxClass();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.82;

      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.85;

      // Create 5-band equalizer filters
      eqFilters = EQ_FREQS.map((freq, index) => {
        const filter = audioCtx.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQ_FREQS.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.0;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // Chain: audioSource -> Filter0 -> Filter1 -> Filter2 -> Filter3 -> Filter4 -> Analyser -> Gain -> Destination
      audioSource = audioCtx.createMediaElementSource(audioEl);

      let prevNode = audioSource;
      eqFilters.forEach(f => {
        prevNode.connect(f);
        prevNode = f;
      });

      prevNode.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      isAudioGraphReady = true;
    } catch (e) {
      console.warn('Web Audio API initialization notice:', e);
    }
  }

  function ensureAudioCtxActive() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function bindWidgetEvents() {
    const playBtn = document.getElementById('btn-music-play');
    const prevBtn = document.getElementById('btn-music-prev');
    const nextBtn = document.getElementById('btn-music-next');
    const shuffleBtn = document.getElementById('btn-music-shuffle');
    const repeatBtn = document.getElementById('btn-music-repeat');
    const seekSlider = document.getElementById('music-seek-bar');
    const volSlider = document.getElementById('music-volume');
    const searchInput = document.getElementById('music-search-input');
    const addMusicBtn = document.getElementById('btn-add-music');
    const browseFolderBtn = document.getElementById('btn-browse-folder-music');
    const toggleEqBtn = document.getElementById('btn-toggle-eq');
    const togglePlaylistBtn = document.getElementById('btn-toggle-playlist');

    if (playBtn) playBtn.onclick = togglePlay;
    if (prevBtn) prevBtn.onclick = playPrevTrack;
    if (nextBtn) nextBtn.onclick = playNextTrack;

    if (shuffleBtn) {
      shuffleBtn.onclick = () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
      };
    }

    if (repeatBtn) {
      repeatBtn.onclick = () => {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle('active', isRepeat);
      };
    }

    if (seekSlider) {
      seekSlider.oninput = () => {
        if (!audioEl.duration) return;
        const targetTime = (seekSlider.value / 100) * audioEl.duration;
        audioEl.currentTime = targetTime;
        document.getElementById('music-time-cur').textContent = formatSeconds(targetTime);
      };
    }

    if (volSlider) {
      volSlider.oninput = () => {
        const vol = parseFloat(volSlider.value);
        if (gainNode) gainNode.gain.value = vol;
        audioEl.volume = vol;
      };
    }

    if (searchInput) {
      searchInput.oninput = () => {
        currentSearchQuery = searchInput.value.toLowerCase().trim();
        renderPlaylistItems();
      };
    }

    if (addMusicBtn) {
      addMusicBtn.onclick = async () => {
        if (window.topapp && window.topapp.chooseAudioFiles) {
          const files = await window.topapp.chooseAudioFiles();
          if (files && files.length) {
            addTracksToPlaylist(files);
          }
        } else {
          // Input file fallback
          triggerFileInput();
        }
      };
    }

    if (browseFolderBtn) {
      browseFolderBtn.onclick = async () => {
        if (window.topapp && window.topapp.chooseAudioFolder) {
          const files = await window.topapp.chooseAudioFolder();
          if (files && files.length) {
            addTracksToPlaylist(files);
          }
        }
      };
    }

    if (toggleEqBtn) {
      toggleEqBtn.onclick = () => {
        const drawer = document.getElementById('music-eq-drawer');
        if (!drawer) return;
        const isOpen = drawer.classList.toggle('is-open');
        toggleEqBtn.classList.toggle('active', isOpen);
        notifyHeightChange();
      };
    }

    if (togglePlaylistBtn) {
      togglePlaylistBtn.onclick = () => {
        const drawer = document.getElementById('music-playlist-drawer');
        if (!drawer) return;
        isPlaylistDrawerOpen = !isPlaylistDrawerOpen;
        drawer.classList.toggle('is-open', isPlaylistDrawerOpen);
        togglePlaylistBtn.classList.toggle('active', isPlaylistDrawerOpen);
        notifyHeightChange();
      };
    }

    // Bind Equalizer Slider Inputs
    for (let i = 0; i < 5; i++) {
      const slider = document.getElementById(`eq-slider-${i}`);
      const valLabel = document.getElementById(`eq-val-${i}`);
      if (slider) {
        slider.oninput = () => {
          const val = parseInt(slider.value, 10);
          if (valLabel) valLabel.textContent = (val > 0 ? `+${val}` : `${val}`) + 'dB';
          if (eqFilters[i] && audioCtx) {
            eqFilters[i].gain.setTargetAtTime(val, audioCtx.currentTime, 0.05);
          }
          document.getElementById('music-eq-active-preset').textContent = 'Personalizado';
          document.querySelectorAll('.music-preset-chip').forEach(c => c.classList.remove('active'));
        };
      }
    }

    // Bind Equalizer Presets
    document.querySelectorAll('.music-preset-chip').forEach(chip => {
      chip.onclick = () => {
        const presetKey = chip.dataset.preset;
        const values = EQ_PRESETS[presetKey];
        if (!values) return;

        document.querySelectorAll('.music-preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        document.getElementById('music-eq-active-preset').textContent = chip.textContent;

        values.forEach((gainVal, idx) => {
          const s = document.getElementById(`eq-slider-${idx}`);
          const lbl = document.getElementById(`eq-val-${idx}`);
          if (s) s.value = gainVal;
          if (lbl) lbl.textContent = (gainVal > 0 ? `+${gainVal}` : `${gainVal}`) + 'dB';
          if (eqFilters[idx] && audioCtx) {
            eqFilters[idx].gain.setTargetAtTime(gainVal, audioCtx.currentTime, 0.05);
          }
        });
      };
    });

    // Native Audio events
    audioEl.ontimeupdate = () => {
      if (!audioEl.duration || isNaN(audioEl.duration)) return;
      const pct = (audioEl.currentTime / audioEl.duration) * 100;
      const seekSlider = document.getElementById('music-seek-bar');
      if (seekSlider && document.activeElement !== seekSlider) {
        seekSlider.value = pct;
      }
      document.getElementById('music-time-cur').textContent = formatSeconds(audioEl.currentTime);
      document.getElementById('music-time-total').textContent = formatSeconds(audioEl.duration);
    };

    audioEl.onended = () => {
      if (isRepeat) {
        audioEl.currentTime = 0;
        audioEl.play();
      } else {
        playNextTrack();
      }
    };

    audioEl.onplay = () => {
      isPlaying = true;
      updatePlayStateUI();
      startVisualizerLoop();
    };

    audioEl.onpause = () => {
      isPlaying = false;
      updatePlayStateUI();
      startVisualizerLoop();
    };
  }

  function triggerFileInput() {
    let inp = document.getElementById('music-hidden-file-input');
    if (!inp) {
      inp = document.createElement('input');
      inp.id = 'music-hidden-file-input';
      inp.type = 'file';
      inp.multiple = true;
      inp.accept = 'audio/*';
      inp.style.display = 'none';
      document.body.appendChild(inp);
    }
    inp.onchange = (e) => {
      if (e.target.files && e.target.files.length) {
        const items = Array.from(e.target.files).map(f => ({
          name: f.name.replace(/\.[^/.]+$/, ''),
          ext: f.name.split('.').pop().toUpperCase(),
          url: URL.createObjectURL(f),
          size: f.size
        }));
        addTracksToPlaylist(items);
      }
    };
    inp.click();
  }

  function setupDragAndDrop() {
    const card = document.getElementById('card-music');
    if (!card) return;

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      card.classList.add('drag-over-active');
    });

    card.addEventListener('dragleave', (e) => {
      if (e.relatedTarget && card.contains(e.relatedTarget)) return;
      card.classList.remove('drag-over-active');
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drag-over-active');

      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        const audioExts = new Set(['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'wma']);
        const valid = [];

        Array.from(e.dataTransfer.files).forEach(f => {
          const ext = f.name.split('.').pop().toLowerCase();
          if (audioExts.has(ext)) {
            const realPath = window.topapp && window.topapp.getPathForFile ? window.topapp.getPathForFile(f) : null;
            valid.push({
              name: f.name.replace(/\.[^/.]+$/, ''),
              ext: ext.toUpperCase(),
              path: realPath || null,
              url: realPath ? `file:///${realPath.replace(/\\/g, '/')}` : URL.createObjectURL(f),
              size: f.size
            });
          }
        });

        if (valid.length) {
          addTracksToPlaylist(valid);
        }
      }
    });
  }

  function addTracksToPlaylist(newTracks) {
    // If the only track was the synthetic demo, replace it
    if (playlist.length === 1 && playlist[0].id === 'demo-synth') {
      playlist = [];
    }

    const wasEmpty = playlist.length === 0;
    newTracks.forEach(t => {
      const exists = playlist.some(p => (t.path && p.path === t.path) || (p.name === t.name));
      if (!exists) {
        playlist.push({
          id: 'track-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          name: t.name || 'Canción',
          artist: t.artist || 'Pista Local',
          ext: t.ext || 'AUDIO',
          path: t.path || null,
          url: t.url || (t.path ? `file:///${t.path.replace(/\\/g, '/')}` : null),
          size: t.size || 0
        });
      }
    });

    renderPlaylistItems();

    if (wasEmpty && playlist.length) {
      currentTrackIndex = 0;
      loadTrack(0, true);
    }

    savePlaylistConfig();
    notifyHeightChange();
  }

  function savePlaylistConfig() {
    if (window.topapp && window.topapp.saveConfig) {
      const saved = playlist.filter(t => t.id !== 'demo-synth').map(t => ({
        id: t.id,
        name: t.name,
        artist: t.artist,
        ext: t.ext,
        path: t.path
      }));
      window.topapp.saveConfig({ musicPlaylist: saved });
    }
  }

  function loadTrack(index, autoplay = false) {
    if (!playlist.length || index < 0 || index >= playlist.length) return;
    currentTrackIndex = index;
    const track = playlist[index];

    ensureAudioCtxActive();

    const srcUrl = track.url || (track.path ? `file:///${track.path.replace(/\\/g, '/')}` : null);
    if (!srcUrl) return;

    audioEl.src = srcUrl;
    audioEl.load();

    updateCurrentTrackUI();
    renderPlaylistItems();

    if (autoplay) {
      audioEl.play().catch(() => {});
    }
  }

  function togglePlay() {
    ensureAudioCtxActive();
    if (!playlist.length) {
      generateSynthDemo();
      return;
    }

    if (!audioEl.src || audioEl.src === window.location.href) {
      loadTrack(currentTrackIndex, true);
      return;
    }

    if (audioEl.paused) {
      audioEl.play().catch(() => {});
    } else {
      audioEl.pause();
    }
  }

  function playPrevTrack() {
    if (!playlist.length) return;
    if (audioEl.currentTime > 3) {
      audioEl.currentTime = 0;
      return;
    }
    let prev = currentTrackIndex - 1;
    if (prev < 0) prev = playlist.length - 1;
    loadTrack(prev, true);
  }

  function playNextTrack() {
    if (!playlist.length) return;
    let next = currentTrackIndex + 1;
    if (isShuffle) {
      next = Math.floor(Math.random() * playlist.length);
    } else if (next >= playlist.length) {
      next = 0;
    }
    loadTrack(next, true);
  }

  function updateCurrentTrackUI() {
    const track = playlist[currentTrackIndex] || { name: 'Sin reproducción', artist: 'Arrastra música o pulsa +', ext: 'AUDIO' };
    const titleEl = document.getElementById('music-title');
    const artistEl = document.getElementById('music-artist');
    const formatEl = document.getElementById('music-format');
    const coverEl = document.getElementById('music-disc-cover');

    if (titleEl) titleEl.textContent = track.name;
    if (artistEl) artistEl.textContent = track.artist || 'Pista de audio';
    if (formatEl) formatEl.textContent = track.ext || 'AUDIO';

    const zoomImg = document.getElementById('music-cover-zoom-img');
    const zoomFallback = document.getElementById('music-cover-zoom-fallback');
    const zoomTitle = document.getElementById('music-cover-zoom-title');
    if (zoomTitle) zoomTitle.textContent = track ? track.name : '';

    if (coverEl) {
      if (track && track.path && window.topapp && window.topapp.getAudioCover) {
        window.topapp.getAudioCover(track.path).then(coverData => {
          // Verify current track didn't change while awaiting
          if (playlist[currentTrackIndex] && playlist[currentTrackIndex].path === track.path) {
            if (coverData) {
              coverEl.src = coverData;
              coverEl.style.display = 'block';
              if (zoomImg) {
                zoomImg.src = coverData;
                zoomImg.style.display = 'block';
              }
              if (zoomFallback) zoomFallback.style.display = 'none';
            } else {
              coverEl.src = '';
              coverEl.style.display = 'none';
              if (zoomImg) {
                zoomImg.src = '';
                zoomImg.style.display = 'none';
              }
              if (zoomFallback) zoomFallback.style.display = 'flex';
            }
          }
        }).catch(() => {
          coverEl.src = '';
          coverEl.style.display = 'none';
          if (zoomImg) {
            zoomImg.src = '';
            zoomImg.style.display = 'none';
          }
          if (zoomFallback) zoomFallback.style.display = 'flex';
        });
      } else {
        coverEl.src = '';
        coverEl.style.display = 'none';
        if (zoomImg) {
          zoomImg.src = '';
          zoomImg.style.display = 'none';
        }
        if (zoomFallback) zoomFallback.style.display = 'flex';
      }
    }
  }

  const SVG_PLAY = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><polygon points="7 4 19 12 7 20 7 4"/></svg>';
  const SVG_PAUSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>';

  function updatePlayStateUI() {
    const playBtn = document.getElementById('btn-music-play');
    const disc = document.getElementById('music-disc');

    if (playBtn) {
      playBtn.innerHTML = isPlaying ? SVG_PAUSE : SVG_PLAY;
    }

    if (disc) {
      if (isPlaying) {
        disc.classList.remove('is-paused');
        disc.classList.add('is-playing');
      } else {
        disc.classList.add('is-paused');
      }
    }
  }

  function renderPlaylistItems() {
    const container = document.getElementById('music-playlist-items');
    if (!container) return;

    let filtered = playlist;
    if (currentSearchQuery) {
      filtered = playlist.filter(t => t.name.toLowerCase().includes(currentSearchQuery) || (t.artist && t.artist.toLowerCase().includes(currentSearchQuery)));
    }

    if (!filtered.length) {
      container.innerHTML = '<div style="font-size: 0.58rem; color: #64748b; padding: 4px; text-align: center;">No se encontraron canciones.</div>';
      return;
    }

    container.innerHTML = filtered.map((track) => {
      const realIndex = playlist.indexOf(track);
      const isCur = realIndex === currentTrackIndex;
      return `
        <div class="music-track-item ${isCur ? 'is-active' : ''}" data-idx="${realIndex}">
          <span style="font-size: 0.52rem; opacity: 0.7; min-width: 12px;">${realIndex + 1}</span>
          <span class="music-track-title" title="${track.name}">${track.name}</span>
          <div class="music-track-actions">
            <span style="font-size: 0.48rem; color: #00e5db; opacity: 0.8;">${track.ext || ''}</span>
            <button class="music-track-del-btn" data-del="${realIndex}" title="Eliminar de la lista">✕</button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.music-track-item').forEach(item => {
      item.onclick = (e) => {
        if (e.target.classList.contains('music-track-del-btn')) return;
        const idx = parseInt(item.dataset.idx, 10);
        loadTrack(idx, true);
      };
    });

    container.querySelectorAll('.music-track-del-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const delIdx = parseInt(btn.dataset.del, 10);
        removeTrack(delIdx);
      };
    });
  }

  function removeTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    playlist.splice(index, 1);
    if (currentTrackIndex >= playlist.length) {
      currentTrackIndex = Math.max(0, playlist.length - 1);
    }
    isPlaylistDrawerOpen = true;
    const drawer = document.getElementById('music-playlist-drawer');
    const togglePlaylistBtn = document.getElementById('btn-toggle-playlist');
    if (drawer) drawer.classList.add('is-open');
    if (togglePlaylistBtn) togglePlaylistBtn.classList.add('active');
    renderPlaylistItems();
    updateCurrentTrackUI();
    savePlaylistConfig();
    notifyHeightChange();
  }

  // Dual-Tone Turquoise & Orange Spectrum Visualizer Canvas Loop
  function startVisualizerLoop() {
    const canvas = document.getElementById('music-visualizer-canvas');
    if (!canvas) return;
    if (visualizerAnimId) {
      cancelAnimationFrame(visualizerAnimId);
      visualizerAnimId = null;
    }
    const ctx = canvas.getContext('2d');
    const numBars = 28;
    const freqData = new Uint8Array(numBars);

    function drawIdleFrame() {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      const barWidth = (width / numBars) - 2;
      ctx.fillStyle = 'rgba(0, 229, 219, 0.25)';
      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + 2) + 2;
        const barHeight = 2.5;
        const y = height - barHeight;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }

    if (!isPlaying) {
      drawIdleFrame();
      return; // ZERO CPU / GPU load when paused or idle!
    }

    function renderFrame() {
      if (!isPlaying) {
        drawIdleFrame();
        visualizerAnimId = null;
        return;
      }

      visualizerAnimId = requestAnimationFrame(renderFrame);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyser) {
        analyser.getByteFrequencyData(freqData);
      }

      const barWidth = (width / numBars) - 2;
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#00e5db');       // Electric turquoise base
      gradient.addColorStop(0.55, '#00f7ea');    // Luminous turquoise mid
      gradient.addColorStop(0.85, '#ff7043');    // Vibrant orange near top
      gradient.addColorStop(1.0, '#ff9800');     // Golden orange peaks

      for (let i = 0; i < numBars; i++) {
        const val = freqData[i] || 0;
        const barHeight = Math.max(3, (val / 255) * (height - 6));
        const x = i * (barWidth + 2) + 2;
        const y = height - barHeight;

        // Draw frequency bar
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Studio peak cap drop physics
        if (barHeight >= peakHeights[i]) {
          peakHeights[i] = barHeight;
          peakDropSpeed[i] = 0.2;
        } else {
          peakDropSpeed[i] += 0.12;
          peakHeights[i] = Math.max(0, peakHeights[i] - peakDropSpeed[i]);
        }

        // Draw floating peak cap in electric orange
        const peakY = height - peakHeights[i] - 2;
        if (peakY >= 0 && peakHeights[i] > 4) {
          ctx.fillStyle = '#ff7043';
          ctx.fillRect(x, peakY, barWidth, 1.5);
        }
      }
    }

    renderFrame();
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function formatSeconds(sec) {
    if (isNaN(sec) || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function notifyHeightChange() {
    if (typeof window.reportWidgetsHeight === 'function') {
      setTimeout(window.reportWidgetsHeight, 150);
    } else if (typeof reportWidgetsHeight === 'function') {
      setTimeout(reportWidgetsHeight, 150);
    }
  }
})();
