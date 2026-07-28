@echo off
title Dominican Watch Men — Lanzador (Razor Pages)
color 0A
cls

echo.
echo  =======================================================
echo    ^^  ^^  ^^  DOMINICAN WATCH MEN  ^^  ^^  ^^
echo    Alta Relojeria - Razor Pages + API
echo  =======================================================
echo.
echo  Iniciando servicios, espera un momento...
echo.

:: ── RelojAPI (ventana azul) ─────────────────────────────
echo  [1/2] Iniciando RelojAPI en http://localhost:5157 ...
start "DWM — RelojAPI" /D "C:\Users\rrsg_\OneDrive\Escritorio\UNPHU\Electiva 2 - Programacion Web\RelojAPI\RelojAPI" cmd /k "color 0B && echo. && echo  [ RelojAPI ] Corriendo en http://localhost:5157 && echo. && dotnet run"

:: Pausa para que la API arranque primero
timeout /t 3 /nobreak > nul

:: ── RelojRazor (ventana verde-azulada) ──────────────────
echo  [2/2] Iniciando RelojRazor en http://localhost:5173 ...
start "DWM — Razor" /D "C:\Users\rrsg_\OneDrive\Escritorio\UNPHU\Electiva 2 - Programacion Web\RelojRazor" cmd /k "color 0D && echo. && echo  [ RelojRazor ] Corriendo en http://localhost:5173 && echo. && dotnet run"

:: Esperar a que Razor arranque (suele tardar 5-7 seg)
echo.
echo  Esperando que Razor arranque (8 segundos)...
timeout /t 8 /nobreak > nul

:: Abrir el navegador
echo  Abriendo navegador en http://localhost:5173 ...
start "" "http://localhost:5173"

echo.
echo  =======================================================
echo    Todo listo! Dos ventanas estan corriendo:
echo      - Ventana AZUL     = RelojAPI   (puerto 5157)
echo      - Ventana MORADA   = RelojRazor (puerto 5173)
echo    Cierra esas ventanas para detener los servidores.
echo  =======================================================
echo.
pause
