@echo off
title TopApp WinTheme Pro - Suite Modular
cd /d "%~dp0"

echo ========================================================
echo   Iniciando TopApp WinTheme Pro - Suite Modular
echo ========================================================

taskkill /F /IM electron.exe >nul 2>&1

call .\node_modules\.bin\electron.cmd "por modulos/main.cjs"

if %errorlevel% neq 0 (
  echo.
  echo [AVISO] La aplicacion se ha cerrado con codigo: %errorlevel%
  pause
)
