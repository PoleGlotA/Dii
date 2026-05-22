@echo off
chcp 65001 >nul
title Dii.Volunteer
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js не встановлено.
  echo Завантажте та встановіть з https://nodejs.org
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Першочергове встановлення залежностей. Це займе 1-2 хвилини...
  call npm install
  if errorlevel 1 (
    echo Помилка встановлення залежностей.
    pause
    exit /b 1
  )
)

echo.
echo Запускаю Dii.Volunteer на http://localhost:3000
echo Для зупинки натисніть Ctrl+C
echo.

start "" http://localhost:3000
call npm run dev
pause
