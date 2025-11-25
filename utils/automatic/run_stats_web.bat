@echo off
echo Starting Project...
cd /d "%~dp0..\.."
start "Web Server" npm run dev
start "Watchdog" node utils/watchdog.js
