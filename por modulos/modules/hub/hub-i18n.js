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
    "Pulsa el botón superior o entra en": "Click the button above or visit",
    "con tu cuenta de Google (Gmail).": "with your Google account (Gmail).",
    "Haz clic en el botón azul": "Click the blue button",
    "en la esquina superior de Google AI Studio.": "in the top corner of Google AI Studio.",
    "Elige cualquier proyecto de Google Cloud existente o selecciona crear uno nuevo automáticamente.": "Choose any existing Google Cloud project or create a new one automatically.",
    "Copia el código generado (empieza por": "Copy the generated code (starts with",
    "o": "or",
    ") y pégalo en la casilla superior de Clave API.": ") and paste it into the API Key field above.",
    "• Sin Clave API:": "• Without API Key:",
    "El asistente abre WhatsApp, redacta emails en Gmail, lanza la calculadora, el bloc de notas, comprueba la RAM y abre los 15 servicios de internet": "The assistant opens WhatsApp, drafts Gmail emails, opens calculator, notepad, checks RAM and launches 15 popular web services",
    "100% GRATIS y en local": "100% FREE and locally",
    "• Con Clave API de Google:": "• With Google API Key:",
    "Obtienes": "You get",
    "inteligencia artificial conversacional avanzada (Gemini 3.5 Flash)": "advanced conversational AI (Gemini 3.5 Flash)",
    "y dictado por voz ultrarrápido con 99.9% de precisión. Es totalmente gratuita para uso personal:": "and ultra-fast voice dictation with 99.9% accuracy. It is completely free for personal use:",

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
    "Arrastrar y Soltar sin duplicar:": "Drag & Drop Without Duplicating:",
    "Arrastra cualquier archivo o carpeta desde el cajón al escritorio (o del escritorio al cajón) y Windows los moverá de forma limpia y transparente, igual que una carpeta normal sin dejar copias duplicadas.": "Drag any file or folder from fence to desktop (or vice versa) and Windows moves them cleanly and transparently, just like a standard folder without leaving duplicate copies.",
    "Plegar con Doble Clic:": "Double-Click to Roll Up:",
    "Haz doble clic sobre la barra de título de cualquier cajón para enrollarlo (modo persiana) y dejar sólo el título visible. Otro doble clic lo desplegará.": "Double-click any fence's title bar to roll it up (shade mode), keeping only the title visible. Another double-click expands it.",
    "Rueda de Ratón Fluida:": "Smooth Mouse Scroll:",
    "Si tienes muchos archivos en un cajón, sitúa el puntero sobre él y usa la rueda del ratón para desplazarte con fluidez sin desbordar el escritorio.": "If you have many files in a fence, place your cursor over it and use your mouse wheel to scroll smoothly without cluttering your desktop.",
    "Menú contextual inteligente:": "Smart Context Menu:",
    "Haz clic derecho en cualquier elemento de un cajón para abrirlo, mostrarlo en el Explorador o renombrarlo.": "Right-click any item inside a fence to open it, reveal it in Windows Explorer, or rename it.",
    "Crea cajones temáticos:": "Create Themed Fences:",
    "En la pestaña": "In the",
    "de este panel puedes añadir nuevos cajones para clasificar trabajo, proyectos, juegos o descargas.": "tab of this panel you can create new fences to categorize work, projects, gaming or downloads.",
    "Dock Flotante con Iconos Jumbo HD": "Floating Dock with Jumbo HD Icons",
    "Acceso Rápido": "Quick Access",
    "Iconos en Máxima Resolución:": "Maximum Resolution Icons:",
    "El dock utiliza extracción de iconos Jumbo nativos de Windows (hasta 256px), garantizando máxima nitidez sin pixelarse cuando aumentas el tamaño.": "The dock uses native Windows Jumbo icon extraction (up to 256px), ensuring maximum sharpness without pixelation when scaling up.",
    "Auto-Hide Inteligente:": "Smart Auto-Hide:",
    "Activa el modo": "Enable",
    "Ocultar Automáticamente": "Auto-Hide",
    "en la pestaña de apariencias para que el dock se esconda solo y se deslice suavemente al acercar el puntero al borde inferior.": "mode in the appearance tab so the dock hides itself and slides out smoothly when moving your mouse to the bottom edge.",
    "Escaneo y Detección (+):": "Scan & Detect (+):",
    "Usa la pestaña": "Use the",
    "para que la suite detecte automáticamente programas como AnyDesk, XnView, suites ofimáticas o navegadores y los añada con 1 clic.": "tab so the suite automatically discovers programs like AnyDesk, XnView, office suites or browsers and pins them in 1 click.",
    "Fijar por Arrastre:": "Pin by Dragging:",
    "Puedes arrastrar cualquier acceso directo o ejecutable": "You can drag any shortcut or executable",
    "directamente sobre el dock para anclarlo.": "directly onto the dock to pin it.",
    "Historial Visual de Portapapeles (Clipboard Hub)": "Visual Clipboard History (Clipboard Hub)",
    "Productividad": "Productivity",
    "Miniaturas de Capturas en Tiempo Real:": "Real-Time Screenshot Thumbnails:",
    "Al pulsar": "When pressing",
    "o copiar cualquier imagen, el portapapeles guarda una vista previa en miniatura para identificarla al instante.": "or copying any image, the clipboard saves a visual thumbnail preview to identify it instantly.",
    "Pegado con 1 Clic:": "1-Click Pasting:",
    "Haz clic sobre cualquier fragmento de texto o miniatura en el historial para volver a ponerlo en el portapapeles y pegarlo en cualquier aplicación.": "Click any text snippet or image thumbnail in the history to copy it back to the clipboard and paste it in any application.",
    "Vaciado Seguro:": "Secure Clear:",
    "Si copiaste datos sensibles o contraseñas, usa el botón de vaciado para borrar todo el historial en segundos.": "If you copied sensitive credentials or passwords, use the clear button to wipe the entire history in seconds.",
    "Telemetría Cyber Turquesa & Liberador de Memoria RAM": "Cyber Turquoise Telemetry & RAM Purger",
    "Rendimiento": "Performance",
    "Botón \"Liberar RAM\":": "\"Free RAM\" Button:",
    "Si una aplicación pesada (juegos, edición, navegadores con muchas pestañas) deja tu ordenador lento, pulsa el botón de optimización en el widget para vaciar la caché y el working set residual al instante.": "If a heavy app (games, editing, browsers with many tabs) slows down your PC, click the optimization button on the widget to immediately flush cache and residual working sets.",
    "Monitor de Unidades y Dispositivos:": "Drives & Devices Monitor:",
    "Visualiza en vivo el espacio total y porcentaje disponible de tus discos C:, discos secundarios D: y unidades USB conectadas con barras de estado dinámicas.": "View live total capacity and percentage available on C: drive, secondary D: drives, and connected USB devices with dynamic progress bars.",
    "Tráfico de Red Cyber:": "Cyber Network Traffic:",
    "Supervisa la subida y bajada de tu conexión a internet sin necesidad de abrir el Administrador de Tareas.": "Monitor upload and download speed of your internet connection without needing to open Task Manager.",
    "Calendario Dinámico, Cortina de Enfoque y Asistente IA": "Dynamic Calendar, Focus Curtain & AI Assistant",
    "Comodidad": "Convenience",
    "Navegación de Meses:": "Month Navigation:",
    "Haz clic en el widget de reloj para desplegar el calendario mensual. Usa las flechas": "Click the clock widget to reveal the monthly calendar. Use the arrows",
    "junto al día para examinar otros meses y planificar tu agenda con total comodidad.": "next to the date to browse other months and plan your schedule comfortably.",
    "Acceso Rápido a Configuración:": "Quick Access to Settings:",
    "En la parte superior central de tu pantalla, justo entre los dos botones de cortina, tienes el botón de engranaje (⚙️) para abrir este Panel de Control al instante desde cualquier lugar.": "At the top center of your screen, between the two curtain buttons, click the gear button (⚙️) to open this Control Panel instantly from anywhere.",
    "Cortina de Atenuación (Screen Dimmer):": "Screen Dimmer Curtain:",
    "Activa los conmutadores laterales para atenuar la pantalla en entornos con poca luz o eliminar distracciones mientras lees o programas.": "Toggle side switches to dim the screen in low-light environments or eliminate distractions while reading or coding.",
    "Asistente IA Integrado:": "Built-in AI Assistant:",
    "Dicta por voz, redacta correos, lanza los 15 servicios webs más populares de internet o conecta tu clave de Google Gemini 3.5 Flash para asistencia ilimitada.": "Dictate with voice, draft emails, launch the 15 most popular web services, or connect your Google Gemini 3.5 Flash key for unlimited assistance.",

    // Legal & Credits details
    "Suite modular de personalización estética, telemetría en tiempo real y máxima productividad para Windows 10 y 11. Diseñada para un rendimiento sin concesiones, ultra ligera y con interfaz Glassmorphism nativa.": "Modular customization, real-time telemetry and peak productivity suite for Windows 10 and 11. Designed for uncompromising performance, ultra-lightweight with native Glassmorphism.",
    "TopApp WinTheme Pro es una suite de personalización y productividad libre y abierta creada para que cualquier persona en Windows pueda utilizarla, personalizarla y disfrutarla libremente sin coste alguno, sin suscripciones, sin publicidad y sin recopilación de datos privados (arquitectura 100% local en tu propio equipo).": "TopApp WinTheme Pro is a free and open customization and productivity suite built for anyone on Windows to use, customize and enjoy freely at no cost, without subscriptions, ads, or private data collection (100% local architecture on your own machine).",
    "Desarrollado y compartido libremente por Tomás Folgado para la comunidad. Incluye colecciones de fondos de alta resolución procedentes de la comunidad abierta de": "Developed and shared freely by Tomás Folgado for the community. Includes high-resolution wallpaper collections from the open community of",
    "bajo su licencia abierta para distribución y personalización libre.": "under its open license for free customization and distribution.",
    "EXENCIÓN TOTAL DE RESPONSABILIDAD (DISCLAIMER LEGAL):": "FULL DISCLAIMER OF LIABILITY (LEGAL DISCLAIMER):",
    "El software se proporciona \"TAL CUAL\" (\"AS IS\"), sin garantía de ningún tipo, expresa o implícita. El desarrollador principal Tomás Folgado y los colaboradores quedan expresa y plenamente eximidos de cualquier tipo de responsabilidad civil, legal, penal o económica frente al usuario o terceros por cualquier daño directo, indirecto, incidental, pérdida de datos, lucro cesante o mal funcionamiento derivado de la instalación o uso de esta aplicación. El usuario utiliza este software bajo su propia y exclusiva responsabilidad y riesgo.": "The software is provided \"AS IS\", without warranty of any kind, express or implied. Lead developer Tomás Folgado and contributors are expressly and fully exempt from any civil, legal, criminal, or financial liability toward the user or third parties for any direct, indirect, incidental damages, data loss, lost profits, or malfunction arising from the installation or use of this application. The user uses this software under their own sole responsibility and risk.",
    "📜 Ver Documento Legal Completo (Términos & Licencia)": "📜 View Complete Legal Document (Terms & License)",
    "🔼 Ocultar Documento Legal": "🔼 Hide Legal Document",
    "ACUERDO DE LICENCIA DE SOFTWARE LIBRE, TÉRMINOS DE USO Y LIMITACIÓN DE RESPONSABILIDAD": "FREE SOFTWARE LICENSE AGREEMENT, TERMS OF USE AND LIMITATION OF LIABILITY",
    "1. Naturaleza del Software:": "1. Nature of the Software:",
    "TopApp WinTheme Pro es una suite comunitaria creada por Tomás Folgado para el uso libre, disfrute y personalización estética del sistema operativo Windows 10 y 11. Se distribuye de forma totalmente gratuita y desinteresada.": "TopApp WinTheme Pro is a community suite created by Tomás Folgado for the free use, enjoyment and visual customization of Windows 10 and 11. Distributed completely free of charge.",
    "2. Exclusión Total de Garantías:": "2. Complete Exclusion of Warranties:",
    "El software se entrega \"TAL CUAL\" (\"AS IS\"), sin garantías de comerciabilidad, idoneidad para un fin específico ni ausencia de errores. El desarrollador no garantiza que el software sea compatible con todas las configuraciones de hardware o futuras actualizaciones de Windows.": "The software is provided \"AS IS\", without warranties of merchantability, fitness for a particular purpose or freedom from errors. The developer does not guarantee compatibility with all hardware configurations or future Windows updates.",
    "3. Limitación Estricta de Responsabilidad:": "3. Strict Limitation of Liability:",
    "En la medida máxima permitida por la legislación aplicable, Tomás Folgado no será en ningún caso responsable de ninguna reclamación, pérdida o daño directo, indirecto, incidental, consecuente o punitivo (incluyendo, sin limitación, pérdida de archivos, corrupción de datos, parada laboral, fallos del sistema o reclamaciones de terceros) que surja del uso o de la imposibilidad de uso del software.": "To the maximum extent permitted by applicable law, Tomás Folgado shall in no event be liable for any claim, direct, indirect, incidental, consequential or punitive damages (including, without limitation, file loss, data corruption, work stoppage, system failures or third-party claims) arising out of the use or inability to use the software.",
    "4. Privacidad y Seguridad 100% Local:": "4. Privacy & 100% Local Security:",
    "Este software respeta absolutamente la privacidad del usuario. No contiene mecanismos de telemetría remota, ni rastreo, ni venta de datos, ni módulos espía. Toda la configuración se guarda exclusivamente en el almacenamiento local del equipo del usuario.": "This software fully respects user privacy. It contains no remote telemetry, tracking, data selling, or spyware modules. All settings are stored exclusively in the local storage of the user's computer.",
    "5. Propiedad Intelectual y Terceros:": "5. Intellectual Property & Third Parties:",
    "Las fotografías incluidas proceden del catálogo abierto de Unsplash (https://unsplash.com/) y están sujetas a los términos de la Licencia Unsplash. Las APIs y librerías del sistema operativo Windows utilizadas (User32, Shell32, DwmApi) son propiedad de Microsoft Corporation.": "Included photos originate from the open Unsplash catalog (https://unsplash.com/) and are subject to Unsplash License terms. Windows OS APIs and libraries used (User32, Shell32, DwmApi) are property of Microsoft Corporation.",
    "6. Aceptación:": "6. Acceptance:",
    "La descarga, instalación, ejecución o uso de cualquier módulo de TopApp WinTheme Pro presupone la lectura, comprensión y aceptación íntegra de estas cláusulas legales de exención de responsabilidad.": "Downloading, installing, running or using any module of TopApp WinTheme Pro implies full reading, understanding and acceptance of these legal disclaimer clauses.",
    "Concepción original, dirección del proyecto, arquitectura de la suite modular, diseño de experiencia de usuario (UX) e ingeniería de widgets interactivos y cajones de escritorio.": "Original conception, project leadership, modular suite architecture, UX design, and interactive widget and desktop fence engineering.",
    "Asistencia Técnica & Desarrollo IA": "Technical Assistance & AI Engineering",
    "Ingeniería de software en pareja, bindings nativos de Windows API (Koffi/User32/Shell32), optimización de telemetría a 60 FPS y orquestación modular con inteligencia artificial.": "Pair software engineering, native Windows API bindings (Koffi/User32/Shell32), 60 FPS telemetry optimization and modular AI orchestration.",
    "Cerrar TopApp WinTheme Pro": "Close TopApp WinTheme Pro",
    "Finaliza limpiamente todos los módulos, ventanas, widgets y subprocesos. Sus ajustes y personalización quedan guardados automáticamente.": "Cleanly terminates all modules, windows, widgets and background processes. Your settings and customizations are automatically saved.",

    // Requirements
    "Requerimientos Mínimos del Sistema (Windows PC)": "Minimum System Requirements (Windows PC)",
    "TopApp WinTheme Pro está construido con arquitectura ultra eficiente y no consume recursos mientras trabajas, juegas o editas vídeo:": "TopApp WinTheme Pro is built with ultra-efficient architecture and consumes zero resources while you work, game, or edit video:",
    "Requisitos Mínimos & Compatibilidad de Windows": "Minimum Requirements & Windows Compatibility",
    "Sistema Operativo": "Operating System",
    "Windows 10 / Windows 11": "Windows 10 / Windows 11",
    "64 bits (v1903 o posterior)": "64-bit (v1903 or later)",
    "Procesador (CPU)": "Processor (CPU)",
    "Dual-Core 1.8 GHz o sup.": "Dual-Core 1.8 GHz or higher",
    "~0.0% uso en reposo": "~0.0% idle usage",
    "Memoria RAM": "RAM Memory",
    "2 GB Mínimo": "2 GB Minimum",
    "4 GB recomendados para multitarea": "4 GB recommended for multitasking",
    "Almacenamiento": "Storage",
    "250 MB libres en disco": "250 MB free disk space",
    "SSD recomendado para carga instantánea": "SSD recommended for instant loading",
    "Tarjeta Gráfica (GPU)": "Graphics Card (GPU)",
    "Tarjeta Gráfica": "Graphics Card",
    "DirectX 11 compatible": "DirectX 11 compatible",
    "Aceleración HW para Glassmorphism": "HW acceleration for Glassmorphism",
    "Pantalla": "Display",
    "1280 × 720 px mínimo": "1280 × 720 px minimum",
    "Soporte 1080p, 2K, 4K y Multimonitor": "1080p, 2K, 4K and Multi-monitor support",
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
