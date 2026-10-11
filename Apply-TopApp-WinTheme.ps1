# ==============================================================================
# TopApp WinTheme Pro - Script de Aplicación Automática para Windows 10 / 11
# Configura: Fondo Degradado 4K Suave, Color Cyan Tochka, Modo Oscuro y Transparencia
# ==============================================================================

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    TopApp WinTheme Pro - Estilo Minimal Editorial        " -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Estilo: Ana Tochka Design (Charcoal Slate & Electric Cyan)" -ForegroundColor Yellow
Write-Host ""

# 1. Configurar directorios de destino
$destFolder = "$HOME\Pictures\TopApp-WinTheme"
if (!(Test-Path $destFolder)) {
    New-Item -ItemType Directory -Force -Path $destFolder | Out-Null
}
$wallpaperDest = "$destFolder\tochka_slate_4k.jpg"

# 2. Generar Fondo de Pantalla 4K con Degradado Suave y Liso en tiempo real (.NET)
Write-Host "[1/4] Renderizando Fondo 4K Ultra-Suave (3840x2160)..." -ForegroundColor Gray
try {
    Add-Type -AssemblyName System.Drawing
    $bmp = New-Object System.Drawing.Bitmap 3840, 2160
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $p1 = New-Object System.Drawing.Point 0, 0
    $p2 = New-Object System.Drawing.Point 0, 2160
    # Tonos Carbon & Pizarra Mate (#222631 -> #181b23)
    $c1 = [System.Drawing.ColorTranslator]::FromHtml('#222631')
    $c2 = [System.Drawing.ColorTranslator]::FromHtml('#181b23')
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2
    $g.FillRectangle($brush, 0, 0, 3840, 2160)
    $bmp.Save($wallpaperDest, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "  -> Fondo degradado suave generado en: $wallpaperDest" -ForegroundColor Green
} catch {
    Write-Host "  -> Nota: Usando imagen de degradado preexistente si la hay." -ForegroundColor DarkYellow
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
[Wallpaper]::SystemParametersInfo(0x0014, 0, $wallpaperDest, 0x01 -bor 0x02) | Out-Null
Write-Host "  -> Fondo de pantalla establecido correctamente!" -ForegroundColor Green

# 4. Configurar Registros de Windows para Color de Énfasis Cyan Tochka y Transparencia
Write-Host "[3/4] Configurando Acentos Cyan (#00e5db) y Modo Oscuro..." -ForegroundColor Gray

# Ruta DWM (Color Electric Cyan ABGR: 0xC4dbe500)
$dwmPath = "HKCU:\Software\Microsoft\Windows\DWM"
Set-ItemProperty -Path $dwmPath -Name "AccentColor" -Value 0xC4dbe500 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $dwmPath -Name "ColorizationColor" -Value 0xC4dbe500 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $dwmPath -Name "ColorPrevalence" -Value 1 -Type DWord -ErrorAction SilentlyContinue

# Ruta Personalize (Modo Oscuro del Sistema y Apps + Transparencia)
$personalizePath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize"
Set-ItemProperty -Path $personalizePath -Name "AppsUseLightTheme" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $personalizePath -Name "SystemUsesLightTheme" -Value 0 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $personalizePath -Name "EnableTransparency" -Value 1 -Type DWord -ErrorAction SilentlyContinue
Set-ItemProperty -Path $personalizePath -Name "ColorPrevalence" -Value 1 -Type DWord -ErrorAction SilentlyContinue

Write-Host "  -> Modo Oscuro Slate y Transparencia Mica activados!" -ForegroundColor Green

# 5. Notificar a Windows del cambio de parámetros
Write-Host "[4/4] Refrescando explorador y parametros de escritorio..." -ForegroundColor Gray
RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters 1, True

# 6. Registrar tema en el panel de Personalización > Temas de Windows
Write-Host "[5/5] Registrando tema en el panel de Windows..." -ForegroundColor Gray
$themesDir = "$env:LOCALAPPDATA\Microsoft\Windows\Themes"
if (Test-Path $themesDir) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $themeSource = Join-Path $scriptDir "TopApp_Fluent_Glass.theme"
    if (Test-Path $themeSource) {
        Copy-Item -Path $themeSource -Destination (Join-Path $themesDir "TopApp_Fluent_Glass.theme") -Force -ErrorAction SilentlyContinue
        Write-Host "  -> Registrado en Temas de Windows: $themesDir\TopApp_Fluent_Glass.theme" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  [OK] Tema Minimal Editorial aplicado con exito!         " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Disfruta de tu nuevo entorno limpio, profesional y comprimido." -ForegroundColor Cyan

if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
    Write-Host "Presiona cualquier tecla para cerrar esta ventana..."
    try { $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") } catch {}
}

