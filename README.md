# 🌌 TopApp WinTheme Pro v2.4.0

> **Suite modular y vanguardista de personalización y productividad para Windows 10 y 11.**  
> Creada por **Tomás Folgado**.

[![Licencia](https://img.shields.io/badge/licencia-MIT-00e5db.svg)](LICENSE)
[![Plataforma](https://img.shields.io/badge/plataforma-Windows%2010%20%7C%2011-blue.svg)]()
[![Electron](https://img.shields.io/badge/Electron-44.5.1-47848F.svg)](https://www.electronjs.org/)
[![Versión](https://img.shields.io/badge/versi%C3%B3n-2.4.0-ff7043.svg)]()

---

## ✨ Características Principales

### 1. 🎛️ Panel de Control Modular Unificado
- Interfaz flotante con efecto **Glassmorphism translúcido**, desenfoque ajustable (*Blur*) y opacidad en tiempo real.
- Selector de color de texto de iconos y widgets (**Blanco / Negro**) adaptativo a cualquier fondo de escritorio.
- Selector de color de énfasis y ajuste global de transparencia.

### 2. 🎵 Reproductor de Música Vanguardista
- **Motor Web Audio API** con decodificación de metadatos ID3v2 APIC y carátulas de carpeta.
- **Disco de Vinilo Giratorio** interactivo: al posar el cursor sobre el disco, se expande una **carátula en alta resolución de 150×150 px** con efecto zoom flotante y sin obstrucciones.
- **Ecualizador Paramétrico de 5 Bandas** con presets táctiles (*Plano, Bass Boost, Vocal, Rock, Electrónica*).
- **Espectro Visualizador de Audio Dual-Tone** animado en tiempo real (60 FPS).
- Selector de lista de reproducción desplegable con búsqueda rápida en tiempo real.

### 3. 🖼️ Fondos de Pantalla de Windows (Fotografía & Degradados)
- **Colección de Fotografías HD**: Selección curada de imágenes de alta resolución procedentes de la comunidad [Unsplash](https://unsplash.com/) bajo licencia abierta.
- **Selector de Imagen Personalizada**: Permite elegir cualquier archivo JPG, PNG o WEBP de tu equipo y aplicarlo como fondo nativo en Windows mediante la API del sistema (*User32 SPI*).
- **Generador de Degradados Suaves & Lisos**: Algoritmo matemático para crear fondos en degradado sin bandas (*banding*), con presets minimalistas de grafito, pizarra y nórdico.

### 4. 🚀 Dock Flotante con Física de Onda
- Efecto de ampliación fluido al pasar el cursor (*Wave Zoom*) con radio y escala configurables.
- Modo de autocompensación y auto-ocultación (*Auto-hide*) configurable.
- Totalmente personalizable: añade tus propias aplicaciones, carpetas o accesos directos.

### 5. 🗄️ Cajones de Escritorio (*Fences*)
- Agrupación inteligente de accesos directos y documentos en cajas flotantes translúcidas.
- Soporte para anclaje (*Pin to Desktop*), redimensionado en tiempo real, opacidad individual y gestión de iconos arrastrables.

### 6. 📊 Barra Lateral de Widgets y Telemetría
- **Monitor de RAM**: Gráfica sparkline de consumo continuo y botón de purga/liberación de memoria.
- **Telemetría Térmica**: Registro en vivo de CPU, GPU, ventiladores RPM y margen térmico.
- **Matriz de 16 Núcleos de CPU**: Visualizador gráfico de carga por núcleo en tiempo real.
- **Impresora & Escáner**: Monitor de cola de impresión con gráfico animado de avance de hojas.
- **Historial de Portapapeles Inteligente**: Acceso rápido a los últimos elementos copiados.
- **Buscador Rápido de Archivos**: Filtros directos por tipo de archivo (*Imágenes, Vídeos, Documentos, Audio, Código*).

---

## 🛠️ Instalación y Desarrollo Local

### Requisitos Previos
- **Windows 10 o Windows 11** (64 bits).
- **Node.js** (v18 o superior recomendado) y **npm**.

### Clonar el Repositorio
```bash
git clone https://github.com/TU_USUARIO/topapp-wintheme-pro.git
cd topapp-wintheme-pro
```

### Instalar Dependencias
```bash
npm install
```

### Ejecutar la Suite en Modo Desarrollo
```bash
npm start
```
*(o ejecuta el script por lotes `Iniciar-Suite-Modular.bat`)*

### Compilar el Instalador para Windows (`.exe`)
```bash
npm run dist
```
El instalador ejecutable se generará automáticamente en la carpeta `release/TopApp WinTheme Pro Setup 2.4.0.exe`.

---

## ⚖️ Licencia y Exención Legal de Responsabilidad

Este proyecto se distribuye como **Software Libre** bajo la [Licencia MIT](LICENSE).

> **Aviso Legal:**  
> Este software se entrega **"TAL CUAL" ("AS IS")**, sin garantías de ningún tipo, explícitas o implícitas.  
> Su autor, **Tomás Folgado**, y los colaboradores del proyecto se **eximen de cualquier responsabilidad civil, penal, económica o administrativa** derivada del uso, instalación, ejecución o modificaciones del presente software, incluyendo pero no limitándose a pérdida de datos, incompatibilidades de hardware/sistema operativo o cualquier daño directo o indirecto.  
> El usuario asume de forma plenamente libre y voluntaria todos los riesgos inherentes al uso de la aplicación.

---

## 🤝 Créditos & Agradecimientos
- Fotografías HD de muestra cortesía de los creadores de [Unsplash](https://unsplash.com/).
- Construido con [Electron](https://www.electronjs.org/), JavaScript vanilla, HTML5 y CSS Glassmorphism moderno.
