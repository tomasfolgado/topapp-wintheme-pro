/**
 * TopApp WinTheme Pro — Control Panel (Hub) Internationalization (i18n)
 * Provides seamless runtime bilingual support (Spanish & English)
 * Preserves original DOM text nodes and attributes for lossless toggling.
 */

(function (root, factory) {
  const mod = factory();
  if (typeof module === 'object' && module && module.exports) {
    module.exports = mod;
  }
  if (root) {
    root.hubI18n = mod;
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  const origTextMap = new WeakMap();

  const WIDGET_METADATA_EN = {
    ai: { name: 'TopApp Pro AI Assistant', desc: 'Interactive voice control, Gemini and system automation' },
    quickaccess: { name: 'Quick Access (Folders)', desc: 'System folders (Downloads, Documents, Pictures...)' },
    clipboard: { name: 'Clipboard History Pro', desc: 'Recent texts, links, colors and screenshots with visual thumbnails' },
    drives: { name: 'Devices & Drives', desc: 'Local hard drives, USBs and storage in gigabytes' },
    music: { name: 'Audio Player Pro', desc: 'Live music, 5-band equalizer and dynamic spectrum' },
    datetime: { name: 'Live Calendar & Time', desc: 'Local clock, interactive date and monthly calendar' },
    syscontrols: { name: 'Volume, Brightness & Battery', desc: 'Ultra-compact sliders for audio, screen brightness & battery level' },
    ram: { name: 'RAM Memory & Processes', desc: 'GB usage, memory %, purge button and Task Manager' },
    thermals: { name: 'Thermal Telemetry (CPU & GPU)', desc: 'Real-time temperature sensors and sparkline graphs' },
    cpu: { name: 'CPU Processors / Cores', desc: 'Model name, base speed and real load per core' },
    network: { name: 'Network I/O Traffic', desc: 'Live upload and download speed (Wi-Fi / Ethernet)' },
    printer: { name: 'Printers & Scanners', desc: 'Device status and Windows print queue access' },
    connectivity: { name: 'Connectivity & Network', desc: 'Status indicators for Wi-Fi and Bluetooth' },
    search: { name: 'Quick File Search', desc: 'Fast file browser and extension filters in folders' }
  };

  const DICT_EN = {
    // Header & Brand
    "Suite Modular de Personalización & Productividad para Windows 10/11": "Modular Customization & Productivity Suite for Windows 10/11",
    "Creado por": "Created by",
    "💡 Ayuda & Trucos": "💡 Help & Tips",
    "Cerrar Aplicación": "Close Application",
    "Ver guía de trucos, requerimientos y ayuda": "View guide, requirements and tips",
    "Cerrar completamente TopApp WinTheme Pro (sus ajustes están guardados)": "Completely close TopApp WinTheme Pro (your settings are saved)",

    // Navigation Tabs
    "Ajustes": "Settings",
    "General": "General",
    "Módulos Widgets": "Widget Modules",
    "Fondos Windows": "Windows Wallpapers",
    "Cajones de Escritorio": "Desktop Fences",
    "Añadir al Dock (+)": "Add to Dock (+)",
    "🤖 Asistente de IA": "🤖 AI Assistant",
    "💡 Ayuda, Trucos & Acerca de": "💡 Help, Tips & About",

    // Tab 1: Appearance & Dock
    "Ajustes del Dock Flotante": "Floating Dock Settings",
    "Activar Dock Flotante": "Enable Floating Dock",
    "Muestra u oculta la barra dock de accesos directos": "Show or hide shortcut dock bar",
    "Ocultar Automáticamente (Auto-Hide)": "Auto-Hide Dock",
    "Aparece al deslizar el ratón hacia abajo": "Appears when sliding mouse to screen edge",
    "Área de Activación Horizontal (Ancho)": "Horizontal Trigger Area (Width)",
    "Anchura de la zona sensible para desplegar el Dock oculto": "Width of trigger zone to reveal hidden Dock",
    "Área de Activación Vertical (Sensibilidad / Alto)": "Vertical Trigger Area (Sensitivity / Height)",
    "Grosor de la zona en el borde de pantalla para activar el Dock": "Thickness of screen edge trigger zone",
    "Posición del Dock en Pantalla": "Dock Screen Position",
    "Ubicación arriba o abajo": "Position at top or bottom",
    "Abajo (Inferior clásico)": "Bottom (Classic lower)",
    "Arriba (Superior moderno)": "Top (Modern upper)",
    "Transparencia de Fondo del Dock": "Dock Background Transparency",
    "Al 0% queda 100% transparente (solo iconos flotantes)": "At 0% it is 100% transparent (floating icons only)",
    "Desenfoque de Fondo (Glass Blur)": "Background Blur (Glass Blur)",
    "Efecto Mica / Acrílico": "Mica / Acrylic effect",
    "Tamaño de Iconos": "Icon Size",
    "Dimensiones del marco redondeado": "Dimensions of rounded squircle frame",
    "Separación entre Iconos": "Icon Spacing",
    "Espaciado horizontal": "Horizontal spacing between icons",
    "Fondo de los Iconos del Dock": "Dock Icons Background",
    "Estilo del marco / squircle de cada icono": "Style of frame / squircle for each icon",
    "Color Personalizado": "Custom Color",
    "Sin Fondo (100% Transparente)": "No Background (100% Transparent)",
    "Color Cian de Acento": "Cyan Accent Color",
    "Cristal Translúcido": "Translucent Glass",
    "Efecto Onda / Magnificación": "Wave / Magnification Effect",
    "Elevación dinámica al pasar el ratón": "Dynamic hover magnification",
    "Tamaño / Escala de la Onda": "Wave Scale / Size",
    "Aumento máximo de los iconos al enfocar": "Maximum enlargement when hovering",
    "Radio de Extensión de la Onda": "Wave Spread Radius",
    "Alcance de la curva hacia los iconos vecinos": "Curve reach towards neighboring icons",

    "Fondo y Transparencia de Widgets": "Widget Background & Transparency",
    "Color de Fondo de Tarjetas (Todos los Widgets)": "Card Background Color (All Widgets)",
    "Afecta tanto a los widgets derechos como al izquierdo simultáneamente": "Applies to both left and right widgets simultaneously",
    "Muestras rápidas:": "Quick presets:",
    "Opacidad del Fondo de Tarjetas (Solo Fondo)": "Card Background Opacity (Background Only)",
    "Ajusta solo el color de fondo (0% a 100%). Los textos, iconos y gráficos permanecen 100% nítidos": "Adjusts only background color (0% to 100%). Text, icons and graphics remain 100% crisp",
    "Desenfoque de Tarjetas (Blur)": "Card Blur",
    "Intensidad del desenfoque lateral": "Side panel blur intensity",
    "Color del Texto de Iconos (Cajones & Widgets)": "Icon Text Color (Fences & Widgets)",
    "Blanco para fondos oscuros o Negro para fondos claros/luminosos": "White for dark backgrounds or Black for light/bright backgrounds",
    "⚪ Blanco": "⚪ White",
    "⚫ Negro": "⚫ Black",
    "Añadir Aplicaciones Arrastrando y Soltando al Dock": "Add Applications by Drag & Drop to Dock",
    "Arrastra accesos directos (.lnk), ejecutables (.exe), carpetas o archivos de Windows y suéltalos en esta zona para añadirlos de inmediato a tu Dock (o haz clic en el recuadro para examinar):": "Drag shortcuts (.lnk), executables (.exe), folders or Windows files here to add them immediately to your Dock (or click box to browse):",
    "Arrastra y suelta aquí cualquier aplicación de Windows": "Drag and drop any Windows application here",
    "Detecta el icono nativo y nombre automáticamente • O haz clic para examinar archivos": "Automatically detects native icon & name • Or click to browse files",

    // Tab 2: General & System
    "Inicio y Sistema": "Startup & System",
    "Iniciar con Windows al encender": "Start with Windows on boot",
    "Arranque automático silencioso de TopApp Suite al encender el PC": "Silent automatic startup of TopApp Suite when PC turns on",
    "Idioma de la Suite / Language": "Suite Language / Idioma",
    "Selecciona entre Español e Inglés para los módulos y widgets": "Select between Spanish and English for modules and widgets",
    "Cerrar Suite Completa": "Close Complete Suite",
    "Guarda todos los ajustes y cierra completamente la aplicación": "Saves all settings and completely exits the application",
    "Búsqueda Rápida y Carpetas": "Quick Search & Folders",
    "Carpeta de Búsqueda Rápida": "Quick Search Folder",
    "Cambiar...": "Change...",
    "Ubicación raíz utilizada por el módulo de búsqueda instantánea para indexar y localizar carpetas y archivos rápidamente desde el escritorio.": "Root directory used by the instant search module to quickly index and find folders and files from the desktop.",

    // Tab 3: Widgets Layout
    "Panel Lateral Izquierdo de Pantalla": "Left Side Screen Panel",
    "Activa o desactiva la barra vertical de widgets situada en el borde izquierdo de la pantalla.": "Enable or disable the vertical widget bar on the left edge of the screen.",
    "Panel Lateral Derecho de Pantalla": "Right Side Screen Panel",
    "Activa o desactiva la barra vertical de widgets situada en el borde derecho de la pantalla.": "Enable or disable the vertical widget bar on the right edge of the screen.",
    "Botones Flotantes Superiores (Cortina de Widgets)": "Top Floating Buttons (Widget Curtain)",
    "Muestra los botones flotantes de flechas (← / →) en la parte superior para desplegar u ocultar los paneles con efecto cortina.": "Shows top floating arrow buttons (← / →) to expand or collapse side panels with curtain effect.",
    "Reservar Márgenes del Escritorio (WorkArea de Windows)": "Reserve Desktop Margins (Windows WorkArea)",
    "Impide que carpetas o archivos descargados al escritorio se posicionen debajo de las columnas laterales de widgets.": "Prevents desktop icons and downloaded files from being placed beneath the widget columns.",
    "Distribución y Orden de Widgets (Izquierda y Derecha)": "Widget Layout & Order (Left & Right)",
    "↺ Restablecer Columnas y Orden": "↺ Reset Columns & Order",
    "Columna Izquierda (Pantalla Izquierda)": "Left Column (Left Screen)",
    "Barra vertical en el extremo izquierdo": "Vertical bar on the far left edge",
    "Columna Derecha (Pantalla Derecha)": "Right Column (Right Screen)",
    "Barra vertical en el extremo derecho": "Vertical bar on the far right edge",

    // Tab 4: Wallpapers
    "Colección de Fondos de Pantalla HD (Fotografía)": "HD Wallpapers Collection (Photography)",
    "Selecciona cualquiera de las fotografías de alta resolución incluidas para tu escritorio o añade tu propia imagen favorita desde tu equipo:": "Select any included high-resolution photo for your desktop or add your own favorite image from your PC:",
    "Añadir Fondo Propio...": "Add Custom Wallpaper...",
    "Cargando fondos disponibles...": "Loading available wallpapers...",
    "Colección de Degradados Suaves & Lisos": "Smooth & Clean Gradient Collection",
    "Fondos mates, sobrios y continuos diseñados para máxima legibilidad, elegancia y estética profesional.": "Matte, sober and continuous backgrounds designed for maximum readability, elegance and productivity.",
    "↺ Degradado por Defecto": "↺ Default Gradient",
    "Aplicar": "Apply",
    "Generador Personalizado de Degradado Suave": "Custom Smooth Gradient Generator",
    "Ajusta los tonos exactos y la dirección angular para crear tu fondo a medida.": "Fine-tune exact color tones and angle to create your tailored background.",
    "Color Primario (Superior):": "Primary Color (Top):",
    "Color Secundario (Inferior):": "Secondary Color (Bottom):",
    "Ángulo del Degradado:": "Gradient Angle:",
    "Establecer Degradado Personalizado": "Set Custom Gradient",

    // Tab 5: Fences
    "Cajones y Grupos Fijados al Escritorio (Fences)": "Desktop Fences & Pinned Groups",
    "Crea cuadrados transparentes flotantes sobre tu escritorio de Windows para agrupar iconos. Puedes usar el botón del alfiler (📌) para fijarlos al fondo.": "Create transparent floating containers on your Windows desktop to group icons. Use the pin button (📌) to pin them to desktop.",
    "Separación de Iconos": "Icon Spacing",
    "Espacio entre los elementos del cajón": "Spacing between items inside the fence",
    "Color de Texto de los Iconos (Cajones)": "Icon Text Color (Fences)",
    "Ajusta todas las etiquetas a blanco o negro para máxima legibilidad": "Set all icon labels to white or black for optimal legibility",
    "+ Crear Nuevo Grupo / Cajón en el Escritorio": "+ Create New Group / Fence on Desktop",
    "Desfijar": "Unpin",
    "📌 Fijar con Alfiler": "📌 Pin to Desktop",
    "No hay cajones activos. Pulsa el botón de arriba para crear uno.": "No active fences. Click the button above to create one.",

    // Tab 6: Apps
    "Aplicaciones Ancladas Actualmente en el Dock": "Currently Pinned Apps in Dock",
    "Puedes quitar cualquier aplicación del Dock pulsando en la cruz roja o haciendo clic derecho directamente sobre el icono en el Dock.": "You can remove any app from the Dock by clicking the red cross or right-clicking directly on its Dock icon.",
    "No hay aplicaciones ancladas en el Dock.": "No apps pinned to Dock.",
    "Buscar y Añadir Aplicaciones al Dock": "Search & Add Applications to Dock",
    "⟳ Actualizar Aplicaciones de Windows": "⟳ Refresh Windows Applications",
    "Arrastra y suelta aquí cualquier aplicación o acceso directo": "Drag and drop any application or shortcut here",
    "O haz clic para examinar archivos desde tu ordenador": "Or click to browse files from your computer",
    "Cargando aplicaciones de Windows...": "Loading Windows applications...",
    "Añadir al Dock": "Add to Dock",
    "Ya en el Dock": "Already in Dock",

    // Tab 7: AI Assistant
    "🤖 Estado y Modo del Asistente": "🤖 Assistant Status & Mode",
    "Habilitar Asistente de IA": "Enable AI Assistant",
    "Muestra el avatar interactivo y controles en el widget izquierdo": "Shows interactive avatar and controls in left widget",
    "Modo de Respuesta Predeterminado": "Default Response Mode",
    "Voz, Solo Texto, o Ambos simultáneamente": "Voice, Text Only, or Both simultaneously",
    "🎙️💬 Ambos (Voz y Texto)": "🎙️💬 Both (Voice & Text)",
    "🎙️ Solo Voz": "🎙️ Voice Only",
    "💬 Solo Texto": "💬 Text Only",
    "Volumen de Voz del Asistente": "Assistant Voice Volume",
    "Nivel de salida de la síntesis de voz": "Voice synthesis output volume",
    "Detección de Silencio Manos Libres": "Hands-Free Silence Detection",
    "Envío ultrarrápido (configurable de 0.0 a 5.0 segundos tras dejar de hablar)": "Ultra-fast send (configurable from 0.0 to 5.0 seconds after you stop speaking)",
    "Nombre del Asistente": "Assistant Name",
    "Identificador con el que se presenta": "Name the assistant introduces itself with",
    "▶ Probar Voz Asistente": "▶ Test Assistant Voice",
    "🛡️ Permisos e Integraciones del Asistente": "🛡️ Assistant Permissions & Integrations",
    "Elige qué servicios y contextos locales permites que el asistente consulte o abra para ayudarte en tiempo real:": "Choose which services and local contexts the assistant is allowed to consult or open:",
    "Acceso a Gmail Web": "Gmail Web Access",
    "Permite consultar bandeja o redactar correos en Gmail": "Allows checking inbox or composing emails in Gmail",
    "Acceso a WhatsApp Web": "WhatsApp Web Access",
    "Permite abrir chats y enviar mensajes por WhatsApp": "Allows opening chats and sending messages via WhatsApp",
    "Lectura de Ventana / Aplicación Activa": "Active Window / Application Reading",
    "Permite al asistente saber qué aplicación tienes abierta en pantalla": "Allows assistant to detect which application is open on screen",
    "Clave API de Google Gemini (3.5 Flash)": "Google Gemini API Key (3.5 Flash)",
    "Para respuestas inteligentes y dictado por voz de precisión 99.9%": "For intelligent conversational replies and 99.9% accurate voice dictation",
    "Configurada ✓": "Configured ✓",
    "Sin clave (Modo local)": "No key (Local mode)",
    "📱 Agenda Rápida para Mensajes de WhatsApp y Contactos": "📱 Quick WhatsApp Contacts & Phone Book",
    "+ Añadir Contacto": "+ Add Contact",
    "📥 Importar Archivo de Contactos (.vcf / .csv)": "📥 Import Contacts File (.vcf / .csv)",
    "🌐 Exportar desde Google Contacts": "🌐 Export from Google Contacts",
    "📋 Pegar Lista de Texto": "📋 Paste Text List",
    "🗑️ Borrar Todos": "🗑️ Delete All",
    "➕ Añadir a la Agenda": "➕ Add to Contacts",
    "✕ Cerrar": "✕ Close",
    "🌐 15 Servicios de Internet más Populares (1-Clic y Comandos de Voz)": "🌐 15 Most Popular Web Services (1-Click & Voice Commands)",
    "🔑 Cómo Conseguir tu Clave API de Google Gemini (100% Gratuita de por vida)": "🔑 How to Get Your Google Gemini API Key (100% Free Forever)",
    "🚀 Abrir Google AI Studio": "🚀 Open Google AI Studio",
    "Inicia Sesión": "Sign In",
    "Crear Clave": "Create Key",
    "Seleccionar Proyecto": "Select Project",
    "Pegar y Guardar": "Paste & Save",

    // Tab 8: Help, Legal & Credits
    "0% CPU en Reposo": "0% Idle CPU",
    "Ventanas Transparentes Nativas": "Native Transparent Windows",
    "Glassmorphism 60 FPS": "Glassmorphism 60 FPS",
    "100% Sin Bloatware": "100% Bloatware Free",
    "Drag & Drop Nativo": "Native Drag & Drop",
    "Aceleración GPU DirectX 11": "DirectX 11 GPU Acceleration",
    "Licencia de Software Libre & Uso Abierto": "Free & Open Source Software License",
    "100% Gratuito y Libre": "100% Free & Open",
    "Autoría, Desarrollo & Créditos": "Authorship, Development & Credits",
    "Edición Oficial 2026": "Official 2026 Edition",
    "Creador y Desarrollador Principal": "Creator & Lead Developer",
    // Help, Tips & Requirements
    "Guía Rápida: Los Trucos y Funciones Más Importantes": "Quick Guide: Most Important Tips & Features",
    "Descubre cómo exprimir al máximo tu suite con estos atajos y hábitos de productividad:": "Discover how to make the most of your suite with these shortcuts and productivity habits:",
    "Cajones de Escritorio (Desktop Fences)": "Desktop Fences",
    "Organización Total": "Total Organization",
    "Dock Flotante con Iconos Jumbo HD": "Floating Dock with Jumbo HD Icons",
    "Acceso Rápido": "Quick Access",
    "Historial Visual de Portapapeles (Clipboard Hub)": "Visual Clipboard History (Clipboard Hub)",
    "Productividad": "Productivity",
    "Telemetría Cyber Turquesa & Liberador de Memoria RAM": "Cyber Turquoise Telemetry & RAM Purger",
    "Rendimiento": "Performance",
    "Calendario Dinámico, Cortina de Enfoque y Asistente IA": "Dynamic Calendar, Focus Curtain & AI Assistant",
    "Comodidad": "Convenience",
    "📜 Ver Documento Legal Completo (Términos & Licencia)": "📜 View Complete Legal Document (Terms & License)",
    "🔼 Ocultar Documento Legal": "🔼 Hide Legal Document",
    "Requisitos Mínimos & Compatibilidad de Windows": "Minimum Requirements & Windows Compatibility",
    "Sistema Operativo": "Operating System",
    "Procesador (CPU)": "Processor (CPU)",
    "Memoria RAM": "RAM Memory",
    "Tarjeta Gráfica": "Graphics Card",
    "Almacenamiento": "Storage",
    "Requisitos Recomendados del Sistema": "Recommended System Requirements",
    "Guía Rápida, Trucos & Productividad": "Quick Guide, Tips & Productivity",

    // Modals
    "Sus ajustes están guardados": "Your settings are saved",
    "Todos sus cambios, personalizaciones de colores, cajones de escritorio, dock y widgets están guardados de forma segura y se restaurarán intactos en su próximo inicio.": "All your changes, color customizations, desktop fences, dock and widgets are securely saved and will restore intact on next launch.",
    "Al cerrar la aplicación se ocultarán el Dock, los cajones y los widgets de la pantalla, liberando todos los recursos del sistema.": "Closing the application hides the Dock, fences, and screen widgets, freeing all system resources.",
    "Cancelar / Seguir Usando": "Cancel / Keep Using",
    "Nuevo Cajón Creado en el Escritorio": "New Desktop Fence Created",
    "Mostrado en el centro de la pantalla y listo para mover": "Displayed in the center of the screen and ready to move",
    "Libre para mover y posicionar": "Free to move and position",
    "El cajón se ha creado en el centro de su pantalla sin el alfiler marcado para que pueda arrastrarlo libremente desde su cabecera al lugar que desee de su escritorio. Una vez situado, pulse el icono del alfiler (📌) para fijarlo al fondo.": "The fence has been created in the center of your screen without being pinned so you can freely drag it from its header to anywhere on your desktop. Once placed, click the pin icon (📌) to lock it to the background.",
    "Ubicación física real de las carpetas y archivos:": "Physical location of folders and files:",
    "Todas las carpetas y archivos que arrastre o añada a este cajón tendrán como ubicación real esta carpeta segura en su disco.": "All folders and files dragged or added to this fence reside in this secure folder on your drive.",
    "¿Cómo localizarlos en Windows desde el cajón?": "How to locate them in Windows from the fence?",
    "Puede localizar y abrir la ubicación de cualquier archivo o carpeta en cualquier momento haciendo clic derecho sobre él dentro del cajón y seleccionando \"📍 Mostrar en Explorador\".": "You can locate and open the location of any file or folder at any time by right-clicking on it within the fence and selecting \"📍 Show in Explorer\".",
    "✓ ¡Entendido, Empezar a Usar!": "✓ Got it, Start Using!",
    "¡Bienvenido a TopApp WinTheme Pro!": "Welcome to TopApp WinTheme Pro!",
    "Primeros pasos en tu nuevo escritorio personalizado": "First steps on your newly customized desktop",
    "🚀 ¡Empezar a Usar TopApp!": "🚀 Start Using TopApp!",

    // Placeholders & Titles
    "Escribe el nombre del programa (ej. Photoshop, Chrome, Corel, Steam...)": "Type program name (e.g. Photoshop, Chrome, Steam...)",
    "Pega tu clave API aquí (AQ... o AIza...)": "Paste your API key here (AQ... or AIza...)",
    "Nombre (ej. Tomás)": "Name (e.g. Thomas)",
    "Teléfono con prefijo (ej. 34600000000)": "Phone with prefix (e.g. 15550000000)",
    "🔍 Buscar contacto por nombre o teléfono...": "🔍 Search contact by name or phone...",
    "Escanear todos los .exe instalados": "Scan all installed .exe files",
    "Ver / Ocultar clave": "Show / Hide key",
    "Subir posición": "Move up",
    "Bajar posición": "Move down",
    "Mover a la columna derecha": "Move to right column",
    "Mover a la columna izquierda": "Move to left column",
    "Arrastra para reordenar o mover entre columnas": "Drag to reorder or move between columns",
    "Mostrar u ocultar en pantalla": "Show or hide on screen"
  };

  function tr(key, lang = 'es') {
    if (lang === 'en' && DICT_EN[key]) {
      return DICT_EN[key];
    }
    return key;
  }

  function applyLanguage(lang = 'es', rootNode = document.body) {
    const isEn = lang === 'en';
    document.documentElement.lang = isEn ? 'en' : 'es';

    // 1. Text nodes traversal
    const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const parentTag = node.parentElement ? node.parentElement.tagName.toLowerCase() : '';
      if (parentTag === 'script' || parentTag === 'style') continue;

      const text = node.nodeValue;
      const trimmed = text.trim();
      if (!trimmed) continue;

      let orig = origTextMap.get(node);
      if (!orig) {
        orig = text;
        origTextMap.set(node, orig);
      }

      if (isEn) {
        const origTrim = orig.trim();
        const translated = DICT_EN[origTrim];
        if (translated) {
          node.nodeValue = orig.replace(origTrim, translated);
        }
      } else {
        node.nodeValue = orig;
      }
    }

    // 2. Titles and Placeholders
    const elementsWithAttr = rootNode.querySelectorAll('[title], [placeholder]');
    elementsWithAttr.forEach(el => {
      if (el.hasAttribute('title')) {
        let orig = el.getAttribute('data-orig-title');
        if (orig == null) {
          orig = el.getAttribute('title');
          el.setAttribute('data-orig-title', orig);
        }
        const trimmed = orig ? orig.trim() : '';
        if (isEn && DICT_EN[trimmed]) {
          el.setAttribute('title', DICT_EN[trimmed]);
        } else {
          el.setAttribute('title', orig);
        }
      }

      if (el.hasAttribute('placeholder')) {
        let orig = el.getAttribute('data-orig-ph');
        if (orig == null) {
          orig = el.getAttribute('placeholder');
          el.setAttribute('data-orig-ph', orig);
        }
        const trimmed = orig ? orig.trim() : '';
        if (isEn && DICT_EN[trimmed]) {
          el.setAttribute('placeholder', DICT_EN[trimmed]);
        } else {
          el.setAttribute('placeholder', orig);
        }
      }
    });

    // 3. Document Title
    document.title = isEn
      ? 'TopApp WinTheme Pro — Modular Control Panel v2.4.0'
      : 'TopApp WinTheme Pro — Panel de Control Modular v2.4.0';
  }

  return {
    tr,
    applyLanguage,
    widgetMetaEn: WIDGET_METADATA_EN
  };
});
