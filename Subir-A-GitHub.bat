@echo off
title Subir TopApp WinTheme Pro a GitHub
chcp 65001 >nul
echo ========================================================
echo   Subiendo TopApp WinTheme Pro a GitHub
echo   Repositorio: https://github.com/tomasfolgado/topapp-wintheme-pro
echo ========================================================
echo.
echo Si es la primera vez, se abrira una ventana de tu navegador
echo para que pulses "Sign in with your browser" / "Autorizar".
echo.
git push -u origin main
echo.
echo ========================================================
if %errorlevel% equ 0 (
    echo   ¡SUBIDA COMPLETADA CON EXITO!
    echo   Revisa tu repositorio en https://github.com/tomasfolgado/topapp-wintheme-pro
) else (
    echo   Ocurrio un error al subir. Revisa los permisos o tu conexion.
)
echo ========================================================
echo.
pause
