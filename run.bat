@echo off
cd /d "%~dp0"
start "DisplayService" cmd /k node display_service.js
start "LogService" cmd /k node log_service.js
timeout /t 3 /nobreak >nul
start "Publisher" cmd /k node publisher.js
