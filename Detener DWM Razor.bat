@echo off
title Dominican Watch Men — Detener (Razor Pages)
color 0C
cls

echo.
echo  =======================================================
echo    DOMINICAN WATCH MEN — Detener servidores (Razor)
echo  =======================================================
echo.
echo  Deteniendo RelojAPI y RelojRazor...
echo.

taskkill /FI "WINDOWTITLE eq DWM — RelojAPI*" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq DWM — Razor*" /T /F > nul 2>&1
taskkill /F /IM "RelojAPI.exe" > nul 2>&1
taskkill /F /IM "RelojRazor.exe" > nul 2>&1

echo  Servidores detenidos correctamente.
echo.
timeout /t 2 /nobreak > nul
