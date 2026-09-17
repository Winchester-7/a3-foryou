@echo off
chcp 65001 >nul
title A3 FOR YOU - локальный сервер
cd /d "%~dp0"

set "NODEDIR=%LOCALAPPDATA%\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64"
if exist "%NODEDIR%\node.exe" set "PATH=%NODEDIR%;%PATH%"

where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js не найден. Перезагрузите компьютер и попробуйте снова,
  echo     либо установите Node.js с https://nodejs.org
  pause
  exit /b 1
)

echo Собираю сайт (первый запуск ~1-2 минуты)...
call npx next build
echo.
echo ===============================================
echo   Сайт открыт: http://localhost:3000
echo   Откройте этот адрес в Chrome.
echo   Чтобы остановить сервер - закройте это окно.
echo ===============================================
echo.
start "" http://localhost:3000
call npx next start -p 3000
pause
