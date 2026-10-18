@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 goto run
for /d %%D in ("%LOCALAPPDATA%\Programs\NodeJS\node-*-win-x64") do if exist "%%~D\node.exe" set "PATH=%%~D;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum tersedia. Pasang Node.js LTS dari https://nodejs.org lalu buka kembali file ini.
  pause
  exit /b 1
)
:run
node tools/server.mjs --open
pause
