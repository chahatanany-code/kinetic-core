@echo off
title KINETIC CORE - Combat Training & Strength OS
color 0A
cls
echo ================================================================
echo           KINETIC CORE -- COMBAT & STRENGTH OS
echo ================================================================
echo.
echo Launching Kinetic Core development server on http://localhost:3001 ...
echo.

set PATH=C:\Program Files\nodejs;%PATH%
start "" http://localhost:3001
call npm run dev -- -p 3001

pause
