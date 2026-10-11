# TopApp WinTheme Pro

> Modular customization and productivity suite for Windows 10 and 11.  
> Author: Tomás Folgado.  
> 🌐 *Language / Idioma:* **English** | [Español](README.es.md)

[![Download for Windows](https://img.shields.io/badge/Download%20for%20Windows-Setup%20v2.4.0%20(.exe)-00e5db?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/tomasfolgado/topapp-wintheme-pro/releases/latest)

[![Version](https://img.shields.io/github/v/release/tomasfolgado/topapp-wintheme-pro?color=00e5db&label=version)](https://github.com/tomasfolgado/topapp-wintheme-pro/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/tomasfolgado/topapp-wintheme-pro/total?color=ff7043&label=downloads)](https://github.com/tomasfolgado/topapp-wintheme-pro/releases)
[![License](https://img.shields.io/badge/license-MIT-00e5db.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-blue.svg)]()
[![Electron](https://img.shields.io/badge/Electron-44.5.1-47848F.svg)](https://www.electronjs.org/)

---

## Quick Download & Installation

1. Download the executable setup package:  
   👉 **[TopApp WinTheme Pro Setup 2.4.0.exe (Direct Download)](https://github.com/tomasfolgado/topapp-wintheme-pro/releases/latest)**
2. Run the downloaded installer and follow the quick setup wizard.
3. The application will launch with native glassmorphism widgets, floating dock, and desktop fences ready to use.

---

## Key Features

### 🎛️ Modular Control Panel (Hub)
- Floating glassmorphism UI with real-time blur and opacity calibration.
- Icon and text theme selector (White / Black) adapted for light or dark desktop wallpapers.
- Full bilingual localization support (**English** & **Español**) with instant runtime switching.
- Cyan accent color customization and margin reservation to keep desktop icons unobstructed.

### 🚀 Floating Application Dock
- Smooth macOS/iPadOS-style floating shortcut dock with dynamic hover zoom (**Wave Effect**).
- Customizable trigger zones, auto-hide sensitivity, spacing, and icon sizes (up to 256px native jumbo extraction).
- Native drag-and-drop: drop any `.exe`, `.lnk` shortcut, or folder directly onto the dock to pin it instantly.

### 📁 Desktop Fences & Icon Groups
- Translucent desktop containers to organize and group desktop shortcuts and files.
- Pin-to-desktop (📌) integration with Windows shell, double-click to roll-up/collapse headers, and smooth scroll wheel support.
- Zero-copy native file operations with right-click "Show in Explorer" context options.

### 📊 Real-Time Telemetry & Productivity Widgets
- **RAM Memory & Process Monitor:** Live GB and percentage display with instant working-set cache purge button and Task Manager shortcut.
- **Hardware Thermal Telemetry:** Live CPU and GPU temperature sensors with interactive sparkline activity graphs.
- **CPU Multi-Core Load:** Real-time load breakdown across processor cores and clock speeds.
- **Network I/O:** Live upload and download speed telemetry (Wi-Fi and Ethernet).
- **Visual Clipboard History:** Image thumbnail previews, code snippet formatting, hex color swatches, and 1-click re-copying.
- **Printers & Scanners:** Print job status and quick access to Windows printer queue.
- **Instant File Search:** Rapid folder indexing with filters for PDFs, images, documents, and code.

### 🎵 Pro Audio Player
- Web Audio API real-time processing with ID3v2 album art extraction.
- Interactive vinyl turntable with 150×150 px hover expansion.
- 5-band parametric equalizer with tonal presets and dual 60 FPS animated audio visualizer.

### 🖼️ Windows Wallpaper Hub
- High-resolution photography collection powered by Unsplash under open license.
- Smooth matte gradient generator for distraction-free focus and maximum icon legibility.
- Custom local image picker using native Windows desktop background APIs (`SystemParametersInfo`).

### 🤖 AI Voice Assistant & Automation
- Interactive desktop assistant with voice synthesis and speech recognition.
- Seamless WhatsApp Web messaging contacts book, Gmail compose integration, and top 15 web service launchers.
- Optional Google Gemini 3.5 Flash API connection for high-precision conversational AI.

---

## Running from Source (Developers)

Requirements: Windows 10/11 x64 and Node.js 18 or newer.

```bash
git clone https://github.com/tomasfolgado/topapp-wintheme-pro.git
cd topapp-wintheme-pro
npm install
npm start
```

### Build Installer Executable (.exe)
```bash
npm run build:exe
```
The compiled installer will be created in the `release/` folder.

---

## License & Disclaimer

This project is licensed under the [MIT License](LICENSE).

**Disclaimer:** This software is provided "AS IS", without warranties of any kind. Tomás Folgado and contributors are fully exempt from any civil or legal liability arising from the installation, use, or modification of this application.

---

## Credits
- Sample photography courtesy of the open community at [Unsplash](https://unsplash.com/).
- Built on top of the Electron framework.
