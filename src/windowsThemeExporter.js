// TopApp WinTheme Pro - Windows Native Theme Exporter & PowerShell Automator
// Generates official Windows .theme files and 1-Click PowerShell installer scripts

export class WindowsThemeExporter {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
  }

  // Generates genuine Windows .theme file format
  generateThemeFileContent() {
    const s = this.themeEngine.getState();
    const primaryHex = s.primaryColor.replace('#', '');
    const rgb = s.primaryRgb.split(',').map(x => parseInt(x.trim(), 10));
    const r = rgb[0] || 0;
    const g = rgb[1] || 210;
    const b = rgb[2] || 255;

    // Windows ColorizationColor format: 0xAA(Alpha)BB(Blue)GG(Green)RR(Red)
    const abgrHex = '0xC4' + 
      b.toString(16).padStart(2, '0') + 
      g.toString(16).padStart(2, '0') + 
      r.toString(16).padStart(2, '0');

    return `; TopApp WinTheme Pro - Tema Oficial para Windows 10 / 11
; Generado el ${new Date().toLocaleDateString('es-ES')}
; Estilo: ${s.presetName} (Glassmorphism & Fluent Modern)

[Theme]
DisplayName=TopApp - ${s.presetName}
ThemeId={9B3C${Date.now().toString(16).toUpperCase().slice(-8)}-4A12-4C10-9E11-F091A80E65D7}

[Control Panel\\Desktop]
Wallpaper=%USERPROFILE%\\Pictures\\TopApp-WinTheme\\wallpaper.jpg
TileWallpaper=0
WallpaperStyle=10
Pattern=

[VisualStyles]
Path=%SystemRoot%\\resources\\themes\\Aero\\Aero.msstyles
ColorStyle=NormalColor
Size=NormalSize
AutoColorization=0
ColorizationColor=${abgrHex}

[Control Panel\\Colors]
ActiveTitle=${r} ${g} ${b}
InactiveTitle=45 45 48
Hilight=${r} ${g} ${b}
HilightText=255 255 255
HotTrackingColor=${r} ${g} ${b}
MenuHilight=${r} ${g} ${b}
MenuText=240 240 240
Window=${s.mode === 'light' ? '255 255 255' : '28 28 32'}
WindowText=${s.mode === 'light' ? '10 10 10' : '240 240 240'}
Background=0 0 0

[MasterThemeSelector]
MTSM=DABABCDD
`;
  }

  // Generates 1-Click Apply-WinTheme.ps1 PowerShell automation script
  generatePowerShellScript() {
    const s = this.themeEngine.getState();
    const rgb = s.primaryRgb.split(',').map(x => parseInt(x.trim(), 10));
    const r = rgb[0] || 0;
    const g = rgb[1] || 210;
    const b = rgb[2] || 255;
    
    // Windows DWM Accent Color is ABGR integer
    const abgrInt = (0xC4 << 24) | (b << 16) | (g << 8) | r;
    const isDark = s.mode !== 'light';

    return `# ==============================================================================
# TopApp WinTheme Pro - Script de Aplicación Automática para Windows 10 / 11
# Configura: Fondo de pantalla, Color de Énfasis, Modo Oscuro/Transparencia Mica
# ==============================================================================

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      TopApp WinTheme Pro - Aplicador de Tema Fluent      " -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Tema Seleccionado: ${s.presetName}" -ForegroundColor Yellow
Write-Host "Color de Enfasis: RGB(${r}, ${g}, ${b})" -ForegroundColor Green
Write-Host ""

# 1. Configurar directorios de destino
$destFolder = "$HOME\\Pictures\\TopApp-WinTheme"
if (!(Test-Path $destFolder)) {
    New-Item -ItemType Directory -Force -Path $destFolder | Out-Null
}
$wallpaperFile = "$destFolder\\wallpaper.jpg"

# 2. Descargar o copiar el wallpaper actual
$wallpaperUrl = "${window.location.origin}${s.wallpaperSrc}"
Write-Host "[1/4] Descargando y preparando Wallpaper HD..." -ForegroundColor Gray
try {
    Invoke-WebRequest -Uri $wallpaperUrl -OutFile $wallpaperFile -UseBasicParsing
    Write-Host "  -> Wallpaper guardado en: $wallpaperFile" -ForegroundColor Green
} catch {
    Write-Host "  -> No se pudo descargar directamente por red. Usando wallpaper existente si lo hay." -ForegroundColor DarkYellow
}

# 3. Aplicar Wallpaper mediante SystemParametersInfo (User32 API)
Write-Host "[2/4] Aplicando Fondo de Pantalla a Windows..." -ForegroundColor Gray
$code = @"
using System;
using System.Runtime.InteropServices;
public class Wallpaper {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
[Wallpaper]::SystemParametersInfo(0x0014, 0, $wallpaperFile, 0x01 -bor 0x02) | Out-Null
Write-Host "  -> Fondo de pantalla establecido correctamente!" -ForegroundColor Green

# 4. Configurar Registros de Windows para Color de Énfasis y Efecto Transparencia (DWM)
Write-Host "[3/4] Configurando Colores de Enfasis y Transparencia Acrilica..." -ForegroundColor Gray

# Ruta DWM
$dwmPath = "HKCU:\\Software\\Microsoft\\Windows\\DWM"
Set-ItemProperty -Path $dwmPath -Name "AccentColor" -Value ${abgrInt} -Type DWord
Set-ItemProperty -Path $dwmPath -Name "ColorizationColor" -Value ${abgrInt} -Type DWord
Set-ItemProperty -Path $dwmPath -Name "ColorPrevalence" -Value 1 -Type DWord

# Ruta Personalize (Modo Oscuro/Claro y Efecto Mica/Acrylic)
$personalizePath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize"
Set-ItemProperty -Path $personalizePath -Name "AppsUseLightTheme" -Value ${isDark ? 0 : 1} -Type DWord
Set-ItemProperty -Path $personalizePath -Name "SystemUsesLightTheme" -Value ${isDark ? 0 : 1} -Type DWord
Set-ItemProperty -Path $personalizePath -Name "EnableTransparency" -Value 1 -Type DWord
Set-ItemProperty -Path $personalizePath -Name "ColorPrevalence" -Value 1 -Type DWord

Write-Host "  -> Modo ${isDark ? 'Oscuro' : 'Claro'} y Transparencia Mica activados!" -ForegroundColor Green

# 5. Notificar a Windows del cambio de configuración
Write-Host "[4/4] Actualizando explorador y tema de Windows..." -ForegroundColor Gray
RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters 1, True

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  [OK] El tema ${s.presetName} se ha aplicado con exito!  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Disfruta de tu nuevo entorno moderno y estilizado." -ForegroundColor Cyan
Write-Host "Presiona cualquier tecla para cerrar esta ventana..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
`;
  }

  // Trigger download of .theme file
  downloadThemeFile() {
    const content = this.generateThemeFileContent();
    const s = this.themeEngine.getState();
    const filename = `TopApp_${s.presetName.replace(/\s+/g, '_')}.theme`;
    this.saveFile(content, filename, 'text/plain;charset=utf-8');
  }

  // Trigger download of Apply-WinTheme.ps1
  downloadPowerShellScript() {
    const content = this.generatePowerShellScript();
    const filename = `Apply-TopApp-WinTheme.ps1`;
    this.saveFile(content, filename, 'text/plain;charset=utf-8');
  }

  saveFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
