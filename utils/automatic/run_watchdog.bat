@echo off
echo Starting Watchdog...
cd /d "%~dp0..\.."
node utils/watchdog.js
pause
