@echo off
setlocal
cd /d "%~dp0"
echo Installing dependencies...
call npm install
if errorlevel 1 goto failed
echo Building Windows installer...
call npm run dist:win
if errorlevel 1 goto failed
echo.
echo Build complete. Check the dist folder for the installer.
pause
exit /b 0
:failed
echo.
echo Build failed. Check the error messages above.
pause
exit /b 1
