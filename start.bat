@echo off
echo Starting EMS Backend on port 3005...
cd /d e:\erp_1tr\backend
start "EMS Backend" /min cmd /c "node src/index.js"
timeout /t 2 /nobreak >nul

echo Starting EMS Frontend on port 5175...
cd /d e:\erp_1tr\frontend
start "EMS Frontend" cmd /c "npx vite --port 5175"

echo.
echo ========================================
echo   EMS System is starting...
echo   Backend:  http://localhost:3005
echo   Frontend: http://localhost:5175
echo ========================================
echo.
pause
