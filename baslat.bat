@echo off
title WordMem - Expo Sunucusu
echo ===================================================
echo   WordMem Mobil Uygulama Gelistirici Sunucusu
echo ===================================================
echo.
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"
echo Expo onbellegi temizlenerek baslatiliyor...
echo.
"C:\Program Files\nodejs\npx.cmd" expo start -c
pause
