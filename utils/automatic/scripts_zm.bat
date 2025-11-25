@echo off
echo Copying ZM scripts...
set "SOURCE=%~dp0..\..\zm"
set "DEST=%localappdata%\Plutonium\storage\t6\raw\scripts\zm"

if not exist "%DEST%" mkdir "%DEST%"
xcopy "%SOURCE%\*.gsc" "%DEST%" /Y /I

echo Done!
pause
