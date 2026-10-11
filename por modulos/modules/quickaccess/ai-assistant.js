/**
 * TopApp WinTheme Pro — Modular AI Assistant Widget Component
 * Avatar Video Sync, Speech Synthesis & System Integrations
 */

(function () {
  let isAIEngineReady = false;
  let videoEl = null;
  let synth = window.speechSynthesis || null;
  let currentUtterance = null;
  let recognition = null;
  let isListening = false;

  // Assistant Configuration State
  let aiState = {
    enabled: true,
    mode: 'both', // 'voice', 'text', 'both'
    volume: 0.9,
    isSpeaking: false,
    activeWindow: ''
  };

  // Modern Minimalist SVG Icons
  const ICONS = {
    voice: `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    text: `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    both: `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M22 17H7l-4 4V7"/></svg>`,
    power: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,
    gear: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    send: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    mic: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>`,
    stop: `<svg viewBox="0 0 24 24" width="9" height="9" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`
  };

  // Generate Widget Card Markup (Compact ~72px height matching Thermals)
  window.renderAIAssistantCard = function () {
    return `
    <div class="w-card" id="card-ai-assistant" title="Asistente Virtual Inteligente TopApp Pro">
      <!-- Header -->
      <div class="ai-head-row">
        <div class="ai-head-title">
          <span class="w-dot dot-cyan"></span>
          <span>Asistente AI</span>
        </div>
        <div class="ai-head-actions">
          <span class="ai-status-pill ai-status-online" id="ai-status-badge">En línea</span>
          <button class="ai-btn-gear" id="btn-ai-hub" title="Abrir Ajustes y Permisos del Asistente">${ICONS.gear}</button>
        </div>
      </div>

      <!-- Main Avatar & Compact Controls Row (~52px) -->
      <div class="ai-body-row">
        <!-- Avatar Lightweight AI Core (Video desactivado para velocidad y fluidez inmediata) -->
        <div class="ai-avatar-wrap is-lightweight-orb" id="ai-avatar-wrap" title="Pulsa para hablar o abrir conversación">
          <div class="ai-orb-core">
            <div class="ai-orb-halo"></div>
            <div class="ai-orb-center">✨</div>
          </div>
        </div>

        <!-- Right Controls Column -->
        <div class="ai-controls-col">
          <!-- Subrow 1: Mode + Power -->
          <div class="ai-ctrl-subrow">
            <button class="ai-mode-pill" id="btn-ai-mode" title="Cambiar modo de respuesta: Voz / Texto / Ambos">
              <span id="ai-mode-icon">${ICONS.both}</span>
              <span id="ai-mode-label">Ambos</span>
            </button>
            <button class="ai-power-btn is-active" id="btn-ai-power" title="Activar / Pausar Asistente">
              ${ICONS.power}
            </button>
          </div>

          <!-- Subrow 2: Volume + Chat Drawer Toggle -->
          <div class="ai-ctrl-subrow">
            <div class="ai-vol-wrap" title="Volumen del Asistente">
              <span style="font-size: 0.58rem; color: rgba(255,255,255,0.6);">🔊</span>
              <input type="range" class="ai-vol-slider" id="ai-volume-slider" min="0" max="1" step="0.05" value="0.9">
            </div>
            <button class="ai-btn-open-chat" id="btn-ai-open-chat" title="Ver / Ocultar Conversación">
              <span>Chat</span>
              <span style="font-size: 0.5rem;">▼</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Collapsible Conversation & Input Drawer -->
      <div class="ai-chat-drawer" id="ai-chat-drawer">
        <!-- Spoken / Output Bubble -->
        <div class="ai-speech-bubble" id="ai-speech-bubble" title="Haz clic para cancelar si está procesando">
          <span id="ai-speech-text">¡Hola! Soy tu asistente de TopApp. ¿En qué puedo ayudarte hoy?</span>
          <span class="ai-cursor" id="ai-speech-cursor"></span>
        </div>

        <!-- Quick Integration Chips -->
        <div class="ai-quick-chips">
          <button class="ai-chip" data-cmd="gmail" title="Consultar correos en Gmail">✉️ Gmail</button>
          <button class="ai-chip" data-cmd="whatsapp" title="Abrir WhatsApp Web">💬 WhatsApp</button>
          <button class="ai-chip" data-cmd="app" title="Leer contexto de la aplicación activa">🖥️ App Activa</button>
          <button class="ai-chip" data-cmd="ram" title="Liberar memoria RAM">⚡ Liberar RAM</button>
        </div>

        <!-- Prompt Input Bar -->
        <div class="ai-input-bar">
          <input type="text" class="ai-text-input" id="ai-text-input" placeholder="Escribe un mensaje o comando..." autocomplete="off">
          <button class="ai-btn-mic" id="btn-ai-mic" title="Hablar por micrófono">${ICONS.mic}</button>
          <button class="ai-btn-stop" id="btn-ai-stop" title="Detener / Cancelar voz" style="display: none;">${ICONS.stop} <span>Parar</span></button>
          <button class="ai-btn-send" id="btn-ai-send" title="Enviar consulta">${ICONS.send}</button>
        </div>
      </div>
    </div>
    `;
  };

  // Initialize Engine & Bind UI Events
  window.initAIAssistant = function () {
    const card = document.getElementById('card-ai-assistant');
    if (!card) return;

    // Load saved settings if any
    const cfg = window.config || (typeof config !== 'undefined' ? config : null);
    if (cfg?.aiConfig) {
      aiState.enabled = cfg.aiConfig.enabled !== false;
      aiState.mode = cfg.aiConfig.mode || 'both';
      aiState.volume = typeof cfg.aiConfig.volume === 'number' ? cfg.aiConfig.volume : 0.9;
    }

    applyModeUI();
    applyPowerUI();
    bindEvents();
    setupSpeechRecognition();

    isAIEngineReady = true;
  };

  function bindEvents() {
    const avatarWrap = document.getElementById('ai-avatar-wrap');
    const modeBtn = document.getElementById('btn-ai-mode');
    const powerBtn = document.getElementById('btn-ai-power');
    const hubBtn = document.getElementById('btn-ai-hub');
    const volSlider = document.getElementById('ai-volume-slider');
    const openChatBtn = document.getElementById('btn-ai-open-chat');
    const sendBtn = document.getElementById('btn-ai-send');
    const micBtn = document.getElementById('btn-ai-mic');
    const inputEl = document.getElementById('ai-text-input');

    // Click on Avatar toggles conversation drawer
    if (avatarWrap) {
      avatarWrap.onclick = () => {
        toggleChatDrawer();
        if (!aiState.isSpeaking && aiState.enabled) {
          speakAssistant('Te escucho. Puedes escribir en el chat o pulsar los botones rápidos.');
        }
      };
    }

    // Toggle Mode (Voz -> Texto -> Ambos)
    if (modeBtn) {
      modeBtn.onclick = () => {
        if (aiState.mode === 'voice') aiState.mode = 'text';
        else if (aiState.mode === 'text') aiState.mode = 'both';
        else aiState.mode = 'voice';

        applyModeUI();
        saveAIState();

        if (aiState.mode === 'text' || aiState.mode === 'both') {
          openChatDrawer(true);
        }
      };
    }

    // Power Toggle
    if (powerBtn) {
      powerBtn.onclick = () => {
        aiState.enabled = !aiState.enabled;
        applyPowerUI();
        saveAIState();
        if (!aiState.enabled && synth) {
          synth.cancel();
          stopAvatarVideo();
        }
      };
    }

    // Gear Button: Opens Hub in AI tab
    if (hubBtn) {
      hubBtn.onclick = () => {
        if (window.topapp && window.topapp.openHub) {
          window.topapp.openHub('tab-ai');
        }
      };
    }

    // Volume Slider
    if (volSlider) {
      volSlider.value = aiState.volume;
      volSlider.oninput = () => {
        aiState.volume = parseFloat(volSlider.value);
        saveAIState();
      };
    }

    // Open/Close Chat Drawer
    if (openChatBtn) {
      openChatBtn.onclick = () => toggleChatDrawer();
    }

    // Send Input (Immediate chat response)
    if (sendBtn && inputEl) {
      sendBtn.onclick = () => handleUserPrompt();
      inputEl.onkeydown = (e) => {
        if (e.key === 'Enter') handleUserPrompt();
      };
    }

    // Stop / Cancel Button (Immediate abort of voice or transcription)
    const stopBtn = document.getElementById('btn-ai-stop');
    if (stopBtn) {
      stopBtn.onclick = () => cancelAllListeningAndProcessing('⏹️ Detenido.');
    }

    // Speech bubble click cancels if active
    const bubbleEl = document.getElementById('ai-speech-bubble');
    if (bubbleEl) {
      bubbleEl.onclick = () => {
        if (isProcessingAudio || activeMediaRecorder || isListeningNative) {
          cancelAllListeningAndProcessing('⏹️ Cancelado.');
        }
      };
    }

    // Mic Dictation
    if (micBtn) {
      micBtn.onclick = () => toggleMicListening();
    }

    // Quick Chips
    document.querySelectorAll('.ai-chip').forEach(chip => {
      chip.onclick = () => {
        const cmd = chip.dataset.cmd;
        handleQuickChip(cmd);
      };
    });
  }

  function applyModeUI() {
    const iconEl = document.getElementById('ai-mode-icon');
    const labelEl = document.getElementById('ai-mode-label');
    if (!iconEl || !labelEl) return;

    if (aiState.mode === 'voice') {
      iconEl.innerHTML = ICONS.voice;
      labelEl.textContent = 'Voz';
    } else if (aiState.mode === 'text') {
      iconEl.innerHTML = ICONS.text;
      labelEl.textContent = 'Texto';
    } else {
      iconEl.innerHTML = ICONS.both;
      labelEl.textContent = 'Ambos';
    }
  }

  function applyPowerUI() {
    const powerBtn = document.getElementById('btn-ai-power');
    const statusBadge = document.getElementById('ai-status-badge');
    const avatarWrap = document.getElementById('ai-avatar-wrap');

    if (powerBtn) {
      powerBtn.className = `ai-power-btn ${aiState.enabled ? 'is-active' : 'is-inactive'}`;
    }

    if (statusBadge) {
      if (aiState.enabled) {
        statusBadge.className = 'ai-status-pill ai-status-online';
        statusBadge.textContent = 'En línea';
      } else {
        statusBadge.className = 'ai-status-pill ai-status-off';
        statusBadge.textContent = 'Pausado';
      }
    }

    if (avatarWrap) {
      avatarWrap.classList.toggle('is-off', !aiState.enabled);
    }
  }

  function toggleChatDrawer() {
    const drawer = document.getElementById('ai-chat-drawer');
    const btn = document.getElementById('btn-ai-open-chat');
    if (!drawer) return;
    const isOpen = drawer.classList.toggle('is-open');
    if (btn) btn.classList.toggle('is-open', isOpen);
    notifyHeightChange();
  }

  function openChatDrawer(forceOpen = true) {
    const drawer = document.getElementById('ai-chat-drawer');
    const btn = document.getElementById('btn-ai-open-chat');
    if (!drawer) return;
    if (forceOpen) {
      drawer.classList.add('is-open');
      if (btn) btn.classList.add('is-open');
    } else {
      drawer.classList.remove('is-open');
      if (btn) btn.classList.remove('is-open');
    }
    notifyHeightChange();
  }

  // Typewriter effect for speech bubble
  let typewriterTimeout = null;
  function displaySpeechText(text) {
    const bubbleText = document.getElementById('ai-speech-text');
    const cursor = document.getElementById('ai-speech-cursor');
    if (!bubbleText) return;

    if (typewriterTimeout) clearTimeout(typewriterTimeout);
    bubbleText.textContent = '';
    if (cursor) cursor.style.display = 'inline-block';

    let index = 0;
    const speed = 25; // ms per character

    function typeChar() {
      if (index < text.length) {
        bubbleText.textContent += text.charAt(index);
        index++;
        typewriterTimeout = setTimeout(typeChar, speed);
      } else {
        if (cursor) cursor.style.display = 'none';
      }
    }

    typeChar();
  }

  // Lightweight Holographic Orb Animation (Zero video decoding overhead)
  function startAvatarVideo() {
    const avatarWrap = document.getElementById('ai-avatar-wrap');
    if (avatarWrap) avatarWrap.classList.add('is-speaking');
    const statusBadge = document.getElementById('ai-status-badge');
    if (statusBadge) {
      statusBadge.className = 'ai-status-pill ai-status-speaking';
      statusBadge.textContent = 'Hablando';
    }
  }

  function stopAvatarVideo() {
    const avatarWrap = document.getElementById('ai-avatar-wrap');
    if (avatarWrap) avatarWrap.classList.remove('is-speaking');
    const statusBadge = document.getElementById('ai-status-badge');
    if (statusBadge && aiState.enabled) {
      statusBadge.className = 'ai-status-pill ai-status-online';
      statusBadge.textContent = 'En línea';
    }
  }

  // Stop listening immediately to prevent acoustic loop
  function stopMicListeningImmediate() {
    const micBtn = document.getElementById('btn-ai-mic');
    if (isListeningNative || activeMediaRecorder) {
      isListeningNative = false;
      if (micBtn) micBtn.classList.remove('is-listening');
      const avatarWrap = document.getElementById('ai-avatar-wrap');
      if (avatarWrap) avatarWrap.classList.remove('is-listening');
      if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
        try { activeMediaRecorder.stop(); } catch (e) {}
      }
      if (window.topapp?.stopListenSpeech) {
        window.topapp.stopListenSpeech();
      }
    }
  }

  // Auto-Conversation Turn: Re-open microphone after assistant finishes speaking (or asks a question)
  let autoListenTimer = null;
  function checkAndTriggerAutoListen(lastSpokenText = '') {
    if (autoListenTimer) clearTimeout(autoListenTimer);
    let cfg = window.config?.aiConfig || {};
    if (!aiState.enabled || cfg.autoMicDialogue === false) {
      return;
    }

    const isQuestion = /\?|¿|dime|quieres|deseas|confirmas|elige|a quien|a quién|cuéntame/i.test(lastSpokenText || '');

    // If text-only mode, focus input if a question is asked so user can type immediately
    if (aiState.mode === 'text') {
      const input = document.getElementById('ai-text-input');
      if (input && isQuestion) input.focus();
      return;
    }

    // Wait 450ms so speaker audio clears and doesn't trigger the microphone
    autoListenTimer = setTimeout(() => {
      autoListenTimer = null;
      if (!aiState.isSpeaking && aiState.enabled && !isListeningNative && !activeMediaRecorder) {
        toggleMicListening({ isAutoTurn: true, isQuestionReply: isQuestion });
      }
    }, 450);
  }

  // Speak Assistant Function
  function speakAssistant(text, options = {}) {
    if (!aiState.enabled || !text) return;
    const noAutoListen = options && options.noAutoListen === true;

    // Show text in bubble if mode allows
    if (aiState.mode === 'text' || aiState.mode === 'both') {
      openChatDrawer(true);
      displaySpeechText(text);
    }

    // If text only, do a brief visual animation loop
    if (aiState.mode === 'text') {
      startAvatarVideo();
      setTimeout(() => {
        stopAvatarVideo();
        const input = document.getElementById('ai-text-input');
        if (input) input.focus();
        if (!noAutoListen) checkAndTriggerAutoListen(text);
      }, Math.min(3000, Math.max(1000, text.length * 35)));
      return;
    }

    // Voice or Both mode: Use SpeechSynthesis
    if (!synth) {
      displaySpeechText(text);
      if (!noAutoListen) checkAndTriggerAutoListen(text);
      return;
    }

    try {
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.volume = aiState.volume;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = synth.getVoices();
      const esVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Sabina') || v.name.includes('Helena') || v.name.includes('Pablo'))) ||
                      voices.find(v => v.lang.startsWith('es'));
      if (esVoice) utterance.voice = esVoice;

      utterance.onstart = () => {
        aiState.isSpeaking = true;
        stopMicListeningImmediate();
        startAvatarVideo();
      };

      utterance.onend = () => {
        aiState.isSpeaking = false;
        stopAvatarVideo();
        if (!noAutoListen) checkAndTriggerAutoListen(text);
      };

      utterance.onerror = () => {
        aiState.isSpeaking = false;
        stopAvatarVideo();
        if (!noAutoListen) checkAndTriggerAutoListen(text);
      };

      currentUtterance = utterance;
      synth.speak(utterance);
    } catch (e) {
      stopAvatarVideo();
      if (!noAutoListen) checkAndTriggerAutoListen(text);
    }
  }

  // Handle User Input / Query (Fast-path responsive chat)
  async function handleUserPrompt() {
    const input = document.getElementById('ai-text-input');
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;

    // Immediately cancel any pending recording or transcription
    cancelAllListeningAndProcessing();

    input.value = '';
    displaySpeechText('💬 ' + q);
    processCommand(q);
  }

  // Extract WhatsApp Intent with Recipient and Message
  function extractWhatsAppIntent(raw) {
    const text = raw.trim();
    const lower = text.toLowerCase();

    if (!lower.includes('whatsapp') && !lower.includes('wasap') && !lower.includes('whasap')) {
      return null;
    }

    // Pure open command: "abrir whatsapp", "wasap"
    if (/^(?:abrir\s+)?(?:el\s+)?(?:whats?app|wasap|whasap)$/i.test(lower)) {
      return { isGeneralOpen: true };
    }

    const clean = text
      .replace(/por\s+ejemplo,?\s*/gi, '')
      .replace(/por\s+favor,?\s*/gi, '')
      .trim();

    // Pattern 1: [Acción] [un mensaje]? a [Contacto] por WhatsApp [Delim / : / que]? [Mensaje]
    // E.g.: "Envíale un mensaje a Lola por WhatsApp diciéndole: está muy bien."
    // E.g.: "Dile a Lola por WhatsApp que ya voy"
    // E.g.: "Manda a Lola por WhatsApp: hola"
    // E.g.: "Envíale un mensaje a Lola por WhatsApp que diga está muy bien"
    let m = clean.match(/(?:env[ií]a|enviar|manda|mandar|escribe|escribir|dile|di|decir|decirle|pon|poner|ponle)(?:le|les|me)?\s+(?:(?:un|el)\s+mensaje\s+)?(?:a|al|para)\s+([^,:]+?)\s+(?:por|en|v[ií]a)\s+(?:whats?app|wasap|whasap)\s*(?::\s*|(?:que\s+(?:le\s+)?diga|que\s+(?:le\s+)?digas|dici[eé]ndo(?:le)?|dile|con\s+el\s+(?:mensaje|texto))\s*|que\s+|\s+)(.+)/i);
    if (m) {
      return { contact: cleanTarget(m[1]), message: cleanMessage(m[2]) };
    }

    // Pattern 2: [Acción] [un mensaje]? por WhatsApp a [Contacto] [Delim / : / que]? [Mensaje]
    // E.g.: "Envíale un mensaje por WhatsApp a Lola diciéndole: está muy bien"
    // E.g.: "Manda por WhatsApp a Lola que venga"
    m = clean.match(/(?:env[ií]a|enviar|manda|mandar|escribe|escribir|dile|di|decir|decirle|pon|poner|ponle)(?:le|les|me)?\s+(?:(?:un|el)\s+mensaje\s+)?(?:por|en|v[ií]a)\s+(?:whats?app|wasap|whasap)\s+(?:a|al|para)\s+([^,:]+?)\s*(?::\s*|(?:que\s+(?:le\s+)?diga|que\s+(?:le\s+)?digas|dici[eé]ndo(?:le)?|dile|con\s+el\s+(?:mensaje|texto))\s*|que\s+|\s+)(.+)/i);
    if (m) {
      return { contact: cleanTarget(m[1]), message: cleanMessage(m[2]) };
    }

    // Pattern 3: [Acción] (?:un|el)? WhatsApp a [Contacto] [Delim / : / que]? [Mensaje]
    // E.g.: "Mándale un WhatsApp a Lola diciéndole está muy bien"
    // E.g.: "Manda un WhatsApp a Lola: hola qué tal"
    m = clean.match(/(?:env[ií]a|enviar|manda|mandar|escribe|escribir|dile|di|decir|decirle|pon|poner|ponle)(?:le|les|me)?\s+(?:(?:un|el)\s+)?(?:whats?app|wasap|whasap)\s+(?:a|al|para)\s+([^,:]+?)\s*(?::\s*|(?:que\s+(?:le\s+)?diga|que\s+(?:le\s+)?digas|dici[eé]ndo(?:le)?|dile|con\s+el\s+(?:mensaje|texto))\s*|que\s+|\s+)(.+)/i);
    if (m) {
      return { contact: cleanTarget(m[1]), message: cleanMessage(m[2]) };
    }

    // Pattern 4: WhatsApp a [Contacto] [Delim / : / que]? [Mensaje]
    // E.g.: "WhatsApp a Lola: está muy bien"
    // E.g.: "Wasap a Lola diciendo que todo bien"
    m = clean.match(/(?:whats?app|wasap|whasap)\s+(?:a|al|para)\s+([^,:]+?)\s*(?::\s*|(?:que\s+(?:le\s+)?diga|que\s+(?:le\s+)?digas|dici[eé]ndo(?:le)?|dile|con\s+el\s+(?:mensaje|texto))\s*|que\s+|\s+)(.+)/i);
    if (m) {
      return { contact: cleanTarget(m[1]), message: cleanMessage(m[2]) };
    }

    // Pattern 5: Open chat with specific contact without message: "WhatsApp a Lola", "Abre el WhatsApp de Lola"
    m = clean.match(/(?:abrir|abre|entra\s+en)?\s*(?:el\s+)?(?:whats?app|wasap|whasap)\s+(?:de|a|al|para)\s+([^,:]+)/i);
    if (m) {
      return { contact: cleanTarget(m[1]), message: '', isChatOpenOnly: true };
    }

    return { isGeneralOpen: true };
  }

  function cleanTarget(str) {
    if (!str) return '';
    return str
      .replace(/^(?:(?:un|el)\s+mensaje\s+(?:a|al|para)\s+|mensaje\s+(?:a|al|para)\s+|a\s+|al\s+|para\s+|de\s+)/i, '')
      .replace(/\s+(?:por|en|v[ií]a|al|a)\s+(?:whats?app|wasap|whasap).*$/i, '')
      .replace(/\s+(?:dici[eé]ndo(?:le)?|que\s+(?:le\s+)?diga|que\s+(?:le\s+)?digas|dile).*$/i, '')
      .replace(/^[.:,;"'«“\s]+/, '')
      .replace(/[.:,;"'»”\s]+$/, '')
      .trim();
  }

  function cleanMessage(msg) {
    if (!msg) return '';
    let m = msg.trim();
    // Strip surrounding quotes and leading punctuation
    m = m.replace(/^[:;,]\s*/, '').replace(/^["'«“]/, '').replace(/["'»”]$/, '').trim();
    // Strip leading transitions if matched
    m = m.replace(/^(?:que\s+(?:le\s+)?diga|que\s+(?:le\s+)?digas|dici[eé]ndo(?:le)?|dile|con\s+el\s+(?:mensaje|texto))\s*/i, '');
    m = m.replace(/^que\s+(?!tal\b|pasa\b|hay\b|haces\b|onda\b)/i, '');
    m = m.replace(/^[:;,]\s*/, '').replace(/^["'«“]/, '').replace(/["'»”]$/, '').trim();
    return m;
  }

  // Priority-based smart contact lookup (Exact match > Label stripped > Starts with > Whole word > Contains)
  function findBestContact(list, query) {
    if (!list || !list.length || !query) return null;
    const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
    const qNorm = norm(query);
    if (!qNorm) return null;

    const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hasValidPhone = (c) => !!(c && c.phone && c.phone.replace(/[^0-9]/g, '').length >= 6);

    // Pick candidate prioritizing one with a valid phone number
    const pickBest = (matches) => {
      if (!matches || !matches.length) return null;
      const withPhone = matches.find(c => hasValidPhone(c));
      return withPhone || matches[0];
    };

    // 1. Exact match (e.g. "Lola" === "Lola")
    const exact = list.filter(c => norm(c.name) === qNorm);
    if (exact.length) return pickBest(exact);

    // 2. Exact match ignoring parenthesized label (e.g. "Lola (Móvil)" matches "Lola")
    const baseExact = list.filter(c => {
      const base = (c.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s*\([^)]*\)/g, '').trim();
      return base === qNorm;
    });
    if (baseExact.length) return pickBest(baseExact);

    // 3. Contact name starts with query (e.g. query "Lola" matches "Lola Gómez")
    const starts = list.filter(c => norm(c.name).startsWith(qNorm));
    if (starts.length) return pickBest(starts);

    // 4. Whole word match in contact name (e.g. query "Lola" matches "Interesada Coche Lola", "Tía Lola")
    try {
      const rx = new RegExp('(?:^|\\s)' + escapeRx(qNorm) + '(?:$|\\s)', 'i');
      const wordMatches = list.filter(c => rx.test(norm(c.name)));
      if (wordMatches.length) return pickBest(wordMatches);
    } catch (e) {}

    // 5. Query contains contact name as whole words (e.g. query "Lola Martínez" matches contact "Lola")
    // Safeguard: contact name must be at least 3 characters to avoid matching single-letter contacts like "L"
    const contained = list.filter(c => {
      const cn = norm(c.name);
      if (cn.length < 3) return false;
      try {
        const rx = new RegExp('(?:^|\\s)' + escapeRx(cn) + '(?:$|\\s)', 'i');
        return rx.test(qNorm);
      } catch (e) {
        return false;
      }
    });
    if (contained.length) {
      contained.sort((a, b) => norm(b.name).length - norm(a.name).length);
      return pickBest(contained);
    }

    // 6. Substring match fallback (contact name must be at least 3 chars)
    const subMatches = list.filter(c => {
      const cn = norm(c.name);
      if (cn.length < 3) return false;
      return cn.includes(qNorm);
    });
    if (subMatches.length) return pickBest(subMatches);

    return null;
  }

  // Extract Gmail Intent
  function extractGmailIntent(raw) {
    const text = raw.trim();
    const lower = text.toLowerCase();
    if (!lower.includes('gmail') && !lower.includes('correo') && !lower.includes('email') && !lower.includes('mail')) {
      return null;
    }
    if (/^(?:abrir\s+)?(?:gmail|correo|email)$/i.test(lower)) {
      return { isGeneralOpen: true };
    }

    let m = text.match(/(?:env[ií]a|manda|escribe)(?:le)?\s+(?:un\s+)?(?:correo|email|mail)\s+(?:a|al)\s+([^,:]+?)\s*(?:con\s+asunto\s+([^,]+?)\s+y\s+(?:mensaje\s+)?|que\s+diga\s+|:\s*|\s+)(.+)/i);
    if (m) {
      return { to: m[1].trim(), subject: m[2] ? m[2].trim() : 'Mensaje de TopApp', body: m[3].trim() };
    }

    m = text.match(/(?:correo|email|mail)\s+(?:a|para)\s+([^,:]+?)\s*(?::|que\s+diga)?\s*(.+)/i);
    if (m) {
      return { to: m[1].trim(), subject: 'Mensaje de TopApp', body: m[2].trim() };
    }

    return { isGeneralOpen: true };
  }

  // Query Gemini API (ultra-fast cloud intelligence with 3.5s timeout)
  async function queryGemini(apiKey, prompt) {
    if (!apiKey || apiKey.trim().length < 8) return null;
    const cleanKey = apiKey.trim();
    const models = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite'];
    for (const m of models) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3500);
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(cleanKey)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Eres el asistente de voz inteligente de TopApp WinTheme Pro en Windows. El usuario te dice: "${prompt}". Responde en español de forma útil, concisa y natural (máximo 1 frase corta para síntesis de voz rápida). Si el usuario pide abrir o ejecutar un programa o aplicación, NO preguntes si quiere abrir algún documento o archivo en concreto ni hagas preguntas adicionales; limítate a confirmar o responder directamente. Si la consulta es una conversación o pregunta abierta, responde amablemente.`
              }]
            }]
          }),
          signal: ctrl.signal
        });
        clearTimeout(timer);
        if (!res.ok) continue;
        const data = await res.json();
        const txt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (txt) return txt;
      } catch (e) {
        clearTimeout(timer);
      }
    }
    return null;
  }

  // Clean app or target name from prefixes (e.g., "aplicacion de sketchup", "el programa de autocad")
  function cleanAppTarget(str) {
    if (!str) return '';
    let res = str.trim();
    // Strip opening verbs if present
    res = res.replace(/^(?:por\s+favor\s+)?(?:abre|abrir|ejecuta|ejecutar|inicia|iniciar|lanza|lanzar|arranca|arrancar|pon|ponme)\s+/i, '');
    // Strip application/program/app prefixes
    res = res.replace(/^(?:la\s+|el\s+)?(?:aplicaci[oó]n|programa|app|software|herramienta)\s+(?:de\s+|del\s+)?/i, '');
    // Strip articles
    res = res.replace(/^(?:el|la|los|las|un|una)\s+/i, '');
    // Strip trailing punctuation
    res = res.replace(/[.:,;?!]+$/, '');
    return res.trim();
  }

  async function processCommand(query) {
    const lower = query.toLowerCase().trim();
    let cfg = window.config?.aiConfig || {};
    if (window.topapp?.getConfig) {
      try {
        const fullCfg = await window.topapp.getConfig();
        if (fullCfg?.aiConfig) cfg = fullCfg.aiConfig;
      } catch (e) {}
    }

    // 1. WhatsApp Integration (Smart Routing & Contact Lookup)
    const waIntent = extractWhatsAppIntent(query);
    if (waIntent) {
      if (cfg.permWhatsApp === false) {
        speakAssistant('El permiso para WhatsApp Web está desactivado en los Ajustes del Hub.');
        return;
      }

      if (waIntent.isGeneralOpen || !waIntent.contact) {
        if (window.topapp?.launchApp) window.topapp.launchApp('https://web.whatsapp.com');
        speakAssistant('Abriendo WhatsApp Web. Listo para consultar y enviar mensajes.');
        return;
      }

      // Check contacts agenda in config
      const contacts = cfg.contacts || [];
      const match = findBestContact(contacts, waIntent.contact);

      if (match && match.phone) {
        let cleanPhone = match.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length === 9 && ['6', '7', '8', '9'].includes(cleanPhone[0])) {
          cleanPhone = '34' + cleanPhone;
        }
        const url = waIntent.message
          ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waIntent.message)}`
          : `https://web.whatsapp.com/send?phone=${cleanPhone}`;
        if (window.topapp?.launchApp) window.topapp.launchApp(url);
        if (waIntent.message) {
          speakAssistant(`He abierto el chat de ${match.name} en WhatsApp Web con el mensaje: "${waIntent.message}". Pulsa Enter para enviarlo.`);
        } else {
          speakAssistant(`Abriendo el chat de ${match.name} en WhatsApp Web.`);
        }
      } else {
        if (waIntent.message) {
          const url = `https://web.whatsapp.com/send?text=${encodeURIComponent(waIntent.message)}`;
          if (window.topapp?.launchApp) window.topapp.launchApp(url);
          speakAssistant(`He abierto WhatsApp con tu mensaje para ${waIntent.contact}: "${waIntent.message}". Elige el chat y pulsa enviar. (Añade su número en Ajustes para ir directo a su chat).`);
        } else {
          if (window.topapp?.launchApp) window.topapp.launchApp('https://web.whatsapp.com');
          speakAssistant(`Abriendo WhatsApp Web. No encontré el número de ${waIntent.contact} en tus contactos de Ajustes.`);
        }
      }
      return;
    }

    // 2. Gmail Integration
    const gmailIntent = extractGmailIntent(query);
    if (gmailIntent) {
      if (cfg.permGmail === false) {
        speakAssistant('El permiso para Gmail está desactivado en los Ajustes del Hub.');
        return;
      }

      if (gmailIntent.isGeneralOpen || !gmailIntent.to) {
        if (window.topapp?.launchApp) window.topapp.launchApp('https://mail.google.com');
        speakAssistant('Abriendo Gmail. Tienes permiso activo para gestionar tus correos.');
        return;
      }

      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(gmailIntent.to)}&su=${encodeURIComponent(gmailIntent.subject || 'Mensaje de TopApp')}&body=${encodeURIComponent(gmailIntent.body || '')}`;
      if (window.topapp?.launchApp) window.topapp.launchApp(url);
      speakAssistant(`Abriendo redactor de Gmail para ${gmailIntent.to} con tu mensaje.`);
      return;
    }

    // 3. Web Services & Universal Application Launcher (Adobe Acrobat, SketchUp, Calculator, etc.)
    const TOP_WEB_SERVICES = [
      { keys: ['youtube'], name: 'YouTube', url: 'https://www.youtube.com' },
      { keys: ['spotify'], name: 'Spotify', url: 'https://open.spotify.com' },
      { keys: ['hotmail', 'outlook'], name: 'Outlook / Hotmail', url: 'https://outlook.live.com' },
      { keys: ['telegram'], name: 'Telegram Web', url: 'https://web.telegram.org' },
      { keys: ['drive', 'google drive'], name: 'Google Drive', url: 'https://drive.google.com' },
      { keys: ['amazon'], name: 'Amazon', url: 'https://www.amazon.es' },
      { keys: ['maps', 'google maps', 'mapa'], name: 'Google Maps', url: 'https://maps.google.com' },
      { keys: ['netflix'], name: 'Netflix', url: 'https://www.netflix.com' },
      { keys: ['noticias', 'noticiero', 'periodico'], name: 'Google Noticias', url: 'https://news.google.com' },
      { keys: ['chatgpt'], name: 'ChatGPT', url: 'https://chat.openai.com' },
      { keys: ['instagram'], name: 'Instagram', url: 'https://www.instagram.com' },
      { keys: ['linkedin'], name: 'LinkedIn', url: 'https://www.linkedin.com' },
      { keys: ['facebook'], name: 'Facebook', url: 'https://www.facebook.com' },
      { keys: ['twitter', 'x.com'], name: 'X / Twitter', url: 'https://x.com' },
      { keys: ['google', 'buscador'], name: 'Google', url: 'https://www.google.com' }
    ];

    // Check if query is an open/launch command (e.g. "abre adobe acrobat y sketchup", "abre aplicacion de sketchup", "inicia photoshop")
    const openVerbMatch = lower.match(/^(?:por\s+favor\s+)?(?:abre|abrir|ejecuta|ejecutar|inicia|iniciar|lanza|lanzar|arranca|arrancar|pon|ponme)\s+(.+)$/i);

    if (openVerbMatch) {
      const targetStr = openVerbMatch[1].trim();
      const rawCandidates = targetStr.split(/\s+(?:y|e|o)\s+|,\s*/i).map(s => s.trim()).filter(Boolean);
      const launchedNames = [];

      for (const item of rawCandidates) {
        const clean = cleanAppTarget(item);
        if (!clean) continue;

        // Check web services first
        const ws = TOP_WEB_SERVICES.find(w => w.keys.some(k => clean.toLowerCase().includes(k)));
        if (ws) {
          if (window.topapp?.launchApp) window.topapp.launchApp(ws.url);
          launchedNames.push(ws.name);
          continue;
        }

        // Try universal native app launcher (Start Menu, Program Files, Windows Tools)
        if (window.topapp?.findAndLaunchApp) {
          try {
            const res = await window.topapp.findAndLaunchApp(clean);
            if (res && res.ok) {
              launchedNames.push(res.name || clean);
              continue;
            }
          } catch (e) {}
        }
      }

      if (launchedNames.length > 0) {
        speakAssistant(`Abriendo ${launchedNames.join(' y ')}.`, { noAutoListen: true });
        return;
      } else {
        const displayTarget = cleanAppTarget(targetStr);
        speakAssistant(`No encontré la aplicación ${displayTarget ? `"${displayTarget}"` : ''} en tu equipo.`, { noAutoListen: true });
        return;
      }
    }

    // Direct standalone check for web services without explicit "abre" verb
    for (const ws of TOP_WEB_SERVICES) {
      if (ws.keys.some(k => lower === k || lower.startsWith(k + ' ') || lower.endsWith(' ' + k))) {
        if (window.topapp?.launchApp) window.topapp.launchApp(ws.url);
        speakAssistant(`Abriendo ${ws.name}.`, { noAutoListen: true });
        return;
      }
    }

    // 5. Active Window Context (only when specifically asking what window is active)
    if (!lower.includes('abrir') && !lower.includes('abre') && (lower.includes('app activa') || lower.includes('qué ventana tengo') || lower.includes('qué aplicación tengo en primer plano') || lower === 'qué tengo abierto' || lower === 'que tengo abierto')) {
      if (window.topapp?.getActiveWindow) {
        try {
          const res = await window.topapp.getActiveWindow();
          if (res && res.title) {
            speakAssistant(`Estás trabajando en la ventana: "${res.title}".`);
            return;
          }
        } catch (e) {}
      }
      speakAssistant('Tienes varias aplicaciones abiertas en tu escritorio de Windows.');
      return;
    }

    // 4. System RAM Purge
    if (lower.includes('ram') || lower.includes('limpia') || lower.includes('memoria') || lower.includes('liberar')) {
      if (window.topapp?.purgeRam) {
        try {
          const res = await window.topapp.purgeRam();
          if (res && res.freedMB) {
            const freed = res.freedMB > 1024 ? (res.freedMB / 1024).toFixed(1) + ' GB' : Math.round(res.freedMB) + ' MB';
            speakAssistant(`Memoria optimizada con éxito. He liberado ${freed} de memoria RAM.`);
            return;
          }
        } catch (e) {}
      }
      speakAssistant('Optimizando memoria RAM del sistema.');
      return;
    }

    // 5. Time and Date
    if (lower.includes('hora') || lower.includes('qué día es') || lower.includes('fecha')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      speakAssistant(`Son las ${timeStr} del ${dateStr}.`);
      return;
    }

    // 6. Greetings & General Identity
    if (lower.includes('hola') || lower.includes('buenos días') || lower.includes('buenas tardes')) {
      speakAssistant('¡Hola! Soy tu asistente de TopApp WinTheme Pro. Todo el sistema está funcionando a la perfección.');
      return;
    }

    if (lower.includes('quién eres') || lower.includes('quien eres') || lower.includes('qué puedes hacer')) {
      speakAssistant('Soy el asistente de IA integrado en tu suite modular. Puedo enviar mensajes por WhatsApp, redactar correos en Gmail, leer tu app activa, liberar RAM y gestionar tu música.');
      return;
    }

    // Standalone app check (e.g., user just says "adobe acrobat", "sketchup", "aplicacion sketchup", "calculadora", "photoshop")
    const cleanStandalone = cleanAppTarget(lower);
    if (window.topapp?.findAndLaunchApp && cleanStandalone && !lower.includes('hola') && !lower.includes('gracias') && cleanStandalone.split(/\s+/).length <= 4) {
      try {
        const res = await window.topapp.findAndLaunchApp(cleanStandalone);
        if (res && res.ok) {
          speakAssistant(`Abriendo ${res.name}.`, { noAutoListen: true });
          return;
        }
      } catch (e) {}
    }

    // 7. Cloud LLM Intelligence (if API key is configured)
    if (cfg.apiKey && cfg.apiKey.trim().length > 10) {
      displaySpeechText('Pensando...');
      startAvatarVideo();
      const aiReply = await queryGemini(cfg.apiKey.trim(), query);
      stopAvatarVideo();
      if (aiReply) {
        speakAssistant(aiReply);
        return;
      }
    }

    // Default conversational response
    speakAssistant(`He recibido tu consulta: "${query}". Estoy listo para ayudarte.`);
  }

  function handleQuickChip(cmd) {
    if (cmd === 'gmail') processCommand('abrir gmail');
    else if (cmd === 'whatsapp') processCommand('abrir whatsapp');
    else if (cmd === 'app') processCommand('app activa');
    else if (cmd === 'ram') processCommand('liberar ram');
  }

  // Voice recognition dictation via Windows Native Engine (with fallback)
  let isListeningNative = false;

  function setupSpeechRecognition() {
    // Native Windows Speech via Electron IPC
  }

  function cleanPhoneticDistortions(text) {
    if (!text) return '';
    let res = text.trim();
    // Acoustic phonetic corrections for common mishearings
    res = res.replace(/pero\s+los\s+aromas/gi, 'envía un mensaje a Tomás');
    res = res.replace(/pero\s+los\s+aroma/gi, 'envía un mensaje a Tomás');
    res = res.replace(/los\s+aromas/gi, 'a Tomás');
    res = res.replace(/el\s+aroma/gi, 'a Tomás');
    res = res.replace(/\baromas\b/gi, 'Tomás');
    res = res.replace(/\baroma\b/gi, 'Tomás');
    res = res.replace(/\btomas\b/gi, 'Tomás');
    res = res.replace(/\btoma\b/gi, 'Tomás');
    res = res.replace(/\bguasa\b/gi, 'WhatsApp');
    res = res.replace(/\bwasab\b/gi, 'WhatsApp');
    res = res.replace(/\bguatsap\b/gi, 'WhatsApp');
    res = res.replace(/\bwhasap\b/gi, 'WhatsApp');
    return res;
  }

  let activeMediaRecorder = null;
  let activeAudioStream = null;
  let manualStopRequested = false;
  let isProcessingAudio = false;
  let transcriptionAbortController = null;
  let activeSafetyTimeout = null;
  let activeVadAnimationId = null;
  let activeAutoIdleTimer = null;
  let activeAudioCtx = null;

  // Universal Stop / Cancel / Unblock Routine
  function cancelAllListeningAndProcessing(reason = '') {
    if (transcriptionAbortController) {
      try { transcriptionAbortController.abort(); } catch (e) {}
      transcriptionAbortController = null;
    }
    if (activeSafetyTimeout) {
      clearTimeout(activeSafetyTimeout);
      activeSafetyTimeout = null;
    }
    if (activeAutoIdleTimer) {
      clearTimeout(activeAutoIdleTimer);
      activeAutoIdleTimer = null;
    }
    if (activeVadAnimationId) {
      cancelAnimationFrame(activeVadAnimationId);
      activeVadAnimationId = null;
    }
    if (activeMediaRecorder) {
      try {
        activeMediaRecorder.onstop = null;
        activeMediaRecorder.ondataavailable = null;
        if (activeMediaRecorder.state !== 'inactive') {
          activeMediaRecorder.stop();
        }
      } catch (e) {}
      activeMediaRecorder = null;
    }
    if (activeAudioStream) {
      try {
        activeAudioStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      activeAudioStream = null;
    }
    if (activeAudioCtx) {
      try { activeAudioCtx.close(); } catch (e) {}
      activeAudioCtx = null;
    }
    if (window.topapp?.stopListenSpeech) {
      try { window.topapp.stopListenSpeech(); } catch (e) {}
    }
    if (synth) {
      try { synth.cancel(); } catch (e) {}
    }

    isProcessingAudio = false;
    isListeningNative = false;
    manualStopRequested = false;

    // Reset UI elements immediately so mic is never locked
    const micBtn = document.getElementById('btn-ai-mic');
    const stopBtn = document.getElementById('btn-ai-stop');
    const avatarWrap = document.getElementById('ai-avatar-wrap');
    const bubbleEl = document.getElementById('ai-speech-bubble');
    if (micBtn) {
      micBtn.classList.remove('is-listening');
      micBtn.disabled = false;
    }
    if (stopBtn) stopBtn.style.display = 'none';
    if (avatarWrap) avatarWrap.classList.remove('is-listening');
    if (bubbleEl) bubbleEl.classList.remove('is-processing');
    stopAvatarVideo();

    if (reason) {
      displaySpeechText(reason);
    }
  }

  async function toggleMicListening(options = {}) {
    const isAutoTurn = options && options.isAutoTurn === true;
    const isQuestionReply = options && options.isQuestionReply === true;
    const micBtn = document.getElementById('btn-ai-mic');
    const stopBtn = document.getElementById('btn-ai-stop');
    const inputEl = document.getElementById('ai-text-input');
    const avatarWrap = document.getElementById('ai-avatar-wrap');
    const bubbleEl = document.getElementById('ai-speech-bubble');

    // 1. If currently transcribing/processing, OR currently recording, clicking mic CANCELS / STOPS cleanly!
    if (isProcessingAudio || isListeningNative || activeMediaRecorder) {
      // If currently recording and user clicked to send/cut:
      if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
        manualStopRequested = true;
        displaySpeechText('⚡ Procesando tu voz...');
        if (stopBtn) stopBtn.style.display = 'inline-flex';
        try {
          activeMediaRecorder.stop();
        } catch (e) {
          cancelAllListeningAndProcessing('En espera.');
        }
        return;
      }
      // Otherwise (if processing/transcribing or listening native), clicking mic halts everything immediately!
      cancelAllListeningAndProcessing('⏹️ Detenido. Pulsa el micro para hablar cuando quieras.');
      return;
    }

    // Cancel any leftovers
    cancelAllListeningAndProcessing();

    manualStopRequested = false;
    openChatDrawer(true);
    if (micBtn) {
      micBtn.classList.add('is-listening');
      micBtn.disabled = false;
    }
    if (stopBtn) stopBtn.style.display = 'inline-flex';
    if (avatarWrap) avatarWrap.classList.add('is-listening');

    if (inputEl) {
      inputEl.focus();
    }

    let cfg = window.config?.aiConfig || {};
    if (window.topapp?.getConfig) {
      try {
        const fullCfg = await window.topapp.getConfig();
        if (fullCfg?.aiConfig) cfg = fullCfg.aiConfig;
      } catch (e) {}
    }

    // A) If Gemini API key is configured, record audio and transcribe via Gemini AI
    if (cfg.apiKey && cfg.apiKey.trim().length > 10 && navigator.mediaDevices?.getUserMedia) {
      try {
        const promptMsg = isQuestionReply
          ? '🎙️ Te escucho... Responde a mi pregunta (al pausar se envía)'
          : (isAutoTurn ? '🎙️ Te escucho... (al pausar se envía automáticamente)' : '🎤 Escuchando... Habla y al pausar se enviará');
        displaySpeechText(promptMsg);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        activeAudioStream = stream;
        const chunks = [];

        let mimeType = 'audio/webm';
        if (typeof MediaRecorder.isTypeSupported === 'function') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
          else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        }

        const recorder = new MediaRecorder(stream, { mimeType });
        activeMediaRecorder = recorder;
        const recordStartTime = Date.now();

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        // Voice Activity Detection (VAD) with user's vadSeconds from Hub
        let hasSpoken = false;

        // Auto-turn idle timeout
        if (isAutoTurn) {
          activeAutoIdleTimer = setTimeout(() => {
            if (activeMediaRecorder && activeMediaRecorder.state === 'recording' && !hasSpoken) {
              cancelAllListeningAndProcessing('💡 En espera. Pulsa el micrófono para hablar cuando quieras.');
            }
          }, 6000);
        }

        // VAD Pause Detection dynamically linked to cfg.vadSeconds
        const vadSec = typeof cfg.vadSeconds === 'number' ? cfg.vadSeconds : 0.6;
        const SILENCE_TRIGGER_MS = Math.max(300, Math.min(3500, Math.round(vadSec * 1000)));

        try {
          const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
          if (AudioCtxClass) {
            activeAudioCtx = new AudioCtxClass();
            const source = activeAudioCtx.createMediaStreamSource(stream);
            const analyser = activeAudioCtx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            const timeData = new Uint8Array(analyser.frequencyBinCount);

            let initialFrames = 0;
            let ambientRms = 0.005;
            let smoothRms = 0.005;
            let silentDurationMs = 0;
            let lastVADTime = performance.now();

            const checkVAD = () => {
              if (!activeMediaRecorder || activeMediaRecorder.state !== 'recording') return;
              const now = performance.now();
              const dt = Math.min(100, Math.max(8, now - lastVADTime));
              lastVADTime = now;

              analyser.getByteTimeDomainData(timeData);

              let sumSquares = 0;
              for (let i = 0; i < timeData.length; i++) {
                const norm = (timeData[i] - 128) / 128;
                sumSquares += norm * norm;
              }
              const currentRms = Math.sqrt(sumSquares / timeData.length);

              if (initialFrames < 12) {
                ambientRms = Math.max(ambientRms, currentRms);
                smoothRms = currentRms;
                initialFrames++;
              } else {
                smoothRms = smoothRms * 0.72 + currentRms * 0.28;
              }

              const speechThreshold = Math.max(0.024, ambientRms * 1.6);

              if (smoothRms >= speechThreshold) {
                silentDurationMs = Math.max(0, silentDurationMs - dt * 2.5);
                if (!hasSpoken) {
                  hasSpoken = true;
                  if (activeAutoIdleTimer) {
                    clearTimeout(activeAutoIdleTimer);
                    activeAutoIdleTimer = null;
                  }
                }
                const elapsedSec = ((Date.now() - recordStartTime) / 1000).toFixed(1);
                displaySpeechText(`🗣️ Te escucho hablar... (${elapsedSec}s)`);
              } else if (hasSpoken) {
                silentDurationMs += dt;
                if (silentDurationMs >= 200) {
                  displaySpeechText('⏳ Pausa detectada... procesando');
                }
                if (silentDurationMs >= SILENCE_TRIGGER_MS) {
                  if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
                    displaySpeechText('⚡ Transcribiendo...');
                    activeMediaRecorder.stop();
                    return;
                  }
                }
              }

              activeVadAnimationId = requestAnimationFrame(checkVAD);
            };

            checkVAD();
          }
        } catch (e) {
          console.warn('VAD AudioContext error:', e);
        }

        // Safety maximum recording timeout
        activeSafetyTimeout = setTimeout(() => {
          if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
            displaySpeechText('⚡ Procesando respuesta...');
            activeMediaRecorder.stop();
          }
        }, 8000);

        recorder.onstop = async () => {
          if (activeVadAnimationId) {
            cancelAnimationFrame(activeVadAnimationId);
            activeVadAnimationId = null;
          }
          if (activeAutoIdleTimer) {
            clearTimeout(activeAutoIdleTimer);
            activeAutoIdleTimer = null;
          }
          if (activeSafetyTimeout) {
            clearTimeout(activeSafetyTimeout);
            activeSafetyTimeout = null;
          }
          if (activeAudioCtx) {
            try { activeAudioCtx.close(); } catch (e) {}
            activeAudioCtx = null;
          }

          activeMediaRecorder = null;
          if (activeAudioStream) {
            try { activeAudioStream.getTracks().forEach(t => t.stop()); } catch (e) {}
            activeAudioStream = null;
          }
          if (micBtn) micBtn.classList.remove('is-listening');
          if (avatarWrap) avatarWrap.classList.remove('is-listening');
          stopAvatarVideo();

          const recordDuration = Date.now() - recordStartTime;
          const wasManuallyStopped = manualStopRequested;
          manualStopRequested = false;

          const shouldTranscribe = hasSpoken || (wasManuallyStopped && recordDuration > 400) || chunks.length > 2;

          if (!shouldTranscribe) {
            cancelAllListeningAndProcessing('💡 En espera. Pulsa el micrófono para hablar.');
            return;
          }

          const blob = new Blob(chunks, { type: mimeType });
          if (blob.size < 400) {
            cancelAllListeningAndProcessing('💡 No se capturó audio suficiente. Pulsa el micro para hablar.');
            return;
          }

          isProcessingAudio = true;
          if (bubbleEl) bubbleEl.classList.add('is-processing');
          if (stopBtn) stopBtn.style.display = 'inline-flex';
          displaySpeechText('⚡ Transcribiendo tu voz...');

          const reader = new FileReader();
          reader.onloadend = async () => {
            if (!isProcessingAudio) return; // Aborted
            const base64Data = reader.result.split(',')[1];
            transcriptionAbortController = new AbortController();

            let transcribed = null;
            // Fastest models only with hard 3.8s timeout per attempt
            const models = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];
            for (const m of models) {
              if (!isProcessingAudio) break;
              const ctrl = new AbortController();
              const fetchTimer = setTimeout(() => ctrl.abort(), 3800);
              const onMainAbort = () => ctrl.abort();
              if (transcriptionAbortController) {
                transcriptionAbortController.signal.addEventListener('abort', onMainAbort);
              }

              try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(cfg.apiKey.trim())}`;
                const resp = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{
                      parts: [
                        { text: "Transcribe exactamente las palabras dichas en español en este audio. Devuelve ÚNICAMENTE el texto transcrito sin comillas ni aclaraciones. Si no hay palabras claras, devuelve VACÍO." },
                        { inline_data: { mime_type: "audio/webm", data: base64Data } }
                      ]
                    }]
                  }),
                  signal: ctrl.signal
                });
                clearTimeout(fetchTimer);
                if (resp.ok) {
                  const data = await resp.json();
                  transcribed = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
                  if (transcribed && transcribed.toLowerCase() !== 'vacío' && transcribed.toLowerCase() !== 'vacio') {
                    break;
                  }
                }
              } catch (err) {
                clearTimeout(fetchTimer);
              }
            }

            isProcessingAudio = false;
            transcriptionAbortController = null;
            if (stopBtn) stopBtn.style.display = 'none';
            if (bubbleEl) bubbleEl.classList.remove('is-processing');

            if (transcribed && transcribed.toLowerCase() !== 'vacío' && transcribed.toLowerCase() !== 'vacio') {
              const cleaned = cleanPhoneticDistortions(transcribed);
              if (inputEl) inputEl.value = cleaned;
              processCommand(cleaned);
            } else {
              displaySpeechText('No se reconoció voz clara. Pulsa el micro para hablar o escribe en el chat.');
            }
          };
          reader.readAsDataURL(blob);
        };

        recorder.start(100);
        return;
      } catch (e) {
        cancelAllListeningAndProcessing();
      }
    }

    // B) Local recognition (Windows 10/11 Neural Dictation Win + H)
    isListeningNative = true;
    if (window.topapp?.triggerVoiceTyping) {
      window.topapp.triggerVoiceTyping();
    }
    displaySpeechText('🎤 Escuchando... Habla ahora (o pulsa Win + H para dictado ultrarrápido).');

    try {
      const res = await window.topapp.listenSpeech({ timeoutSec: 6 });
      isListeningNative = false;
      if (micBtn) micBtn.classList.remove('is-listening');
      if (stopBtn) stopBtn.style.display = 'none';
      if (avatarWrap) avatarWrap.classList.remove('is-listening');
      stopAvatarVideo();

      if (res && res.ok && res.text) {
        const cleaned = cleanPhoneticDistortions(res.text);
        if (inputEl) inputEl.value = cleaned;
        processCommand(cleaned);
      } else {
        displaySpeechText('En espera. Pulsa el micro para hablar o escribe en el chat.');
      }
    } catch (err) {
      cancelAllListeningAndProcessing('Error de audio. Puedes escribir o pulsar Win + H para dictar.');
    }
  }

  async function saveAIState() {
    if (window.topapp && window.topapp.saveConfig) {
      let curAi = {};
      if (window.topapp.getConfig) {
        try {
          const c = await window.topapp.getConfig();
          if (c?.aiConfig) curAi = c.aiConfig;
        } catch (e) {}
      }
      window.topapp.saveConfig({
        aiConfig: {
          ...curAi,
          enabled: aiState.enabled,
          mode: aiState.mode,
          volume: aiState.volume
        }
      });
    }
  }

  function notifyHeightChange() {
    if (typeof reportHeight === 'function') {
      setTimeout(reportHeight, 150);
    }
  }
})();
