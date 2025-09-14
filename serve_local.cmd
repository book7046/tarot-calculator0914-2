@echo off
set PORT=%PORT%
if "%PORT%"=="" set PORT=8080
echo Starting local server at http://localhost:%PORT%/ (Ctrl+C to stop)
py -3 "%~dp0serve_local.py"