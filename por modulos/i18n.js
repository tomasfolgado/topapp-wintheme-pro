// i18n.js - Simple internationalization support for TopApp WinTheme Pro
// Supports English (en) and Spanish (es). Language preference stored in config.json.
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');

let currentLang = 'es'; // default language
// Load language from config if present
try {
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (cfg.language) currentLang = cfg.language;
} catch (_) {}

const translations = {
  en: {
    // UI strings (English)
    "Descargas": "Downloads",
    "Documentos": "Documents",
    "Escritorio": "Desktop",
    "Imágenes": "Pictures",
    "Música": "Music",
    "Vídeos": "Videos",
    "Acceso Rápido": "Quick Access",
    "Carpetas": "Folders",
    "Portapapeles": "Clipboard",
    "Dispositivos y Unidades": "Devices & Drives",
    "Control & Batería": "Controls & Battery",
    "Telemetría Térmica": "Thermal Telemetry",
    "Procesadores Activos": "Active Processors",
    "Tráfico de Red I/O": "Network I/O Traffic",
    "Impresoras & Escáneres": "Printers & Scanners",
    "Conectividad & Red": "Connectivity & Network",
    "Buscador Rápido": "Quick Search",
    "Hora & Fecha": "Time & Date",
    "Buscar": "Search",
    "Núcleos": "Cores",
    "Click para volver al mes actual": "Click to return to current month",
    "Calendario mensual": "Monthly calendar",
    // Add more translations as needed
  },
  es: {
    // Spanish (original) – keys map to themselves
    "Descargas": "Descargas",
    "Documentos": "Documentos",
    "Escritorio": "Escritorio",
    "Imágenes": "Imágenes",
    "Música": "Música",
    "Vídeos": "Vídeos",
    "Acceso Rápido": "Acceso Rápido",
    "Carpetas": "Carpetas",
    "Portapapeles": "Portapapeles",
    "Dispositivos y Unidades": "Dispositivos y Unidades",
    "Control & Batería": "Control & Batería",
    "Telemetría Térmica": "Telemetría Térmica",
    "Procesadores Activos": "Procesadores Activos",
    "Tráfico de Red I/O": "Tráfico de Red I/O",
    "Impresoras & Escáneres": "Impresoras & Escáneres",
    "Conectividad & Red": "Conectividad & Red",
    "Buscador Rápido": "Buscador Rápido",
    "Hora & Fecha": "Hora & Fecha",
    "Buscar": "Buscar",
    "Núcleos": "Núcleos",
    "Click para volver al mes actual": "Click para volver al mes actual",
    "Calendario mensual": "Calendario mensual"
  }
};

function t(key) {
  const dict = translations[currentLang] || {};
  return dict[key] || key; // fallback to original key
}

function setLanguage(lang) {
  if (!translations[lang]) return false;
  currentLang = lang;
  // Persist to config.json
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    cfg.language = lang;
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (_) {}
  return true;
}

module.exports = { t, setLanguage, getCurrent: () => currentLang };
