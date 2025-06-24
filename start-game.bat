@echo off
REM LLM Sci-Fi Game Service Manager
REM Simple batch file for Windows users

setlocal enabledelayedexpansion

REM Configuration
set FRONTEND_PORT=3000
set BACKEND_PORT=5000
set OLLAMA_PORT=11434

REM Colors (Windows 10+)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set CYAN=[96m
set NC=[0m

REM Function to print colored status
:print_status
echo [%time%] %~1
goto :eof

REM Function to check if port is in use
:check_port
netstat -an | find ":%~1 " >nul 2>&1
if %errorlevel% equ 0 (
    exit /b 1
) else (
    exit /b 0
)

REM Function to get process by port
:get_process_by_port
for /f "tokens=5" %%a in ('netstat -ano ^| find ":%~1 "') do (
    echo %%a
    goto :eof
)
echo 0
goto :eof

REM Function to start frontend
:start_frontend
call :print_status "Starting frontend service..."
call :check_port %FRONTEND_PORT%
if %errorlevel% equ 1 (
    call :print_status "Frontend port %FRONTEND_PORT% is already in use!"
    exit /b 1
)

cd /d "%~dp0"
start /b npm run dev
timeout /t 3 /nobreak >nul

call :check_port %FRONTEND_PORT%
if %errorlevel% equ 1 (
    call :print_status "Frontend started successfully on port %FRONTEND_PORT%"
    call :print_status "Frontend URL: http://localhost:%FRONTEND_PORT%"
    exit /b 0
) else (
    call :print_status "Failed to start frontend service"
    exit /b 1
)

REM Function to start backend
:start_backend
call :print_status "Starting backend service..."
call :check_port %BACKEND_PORT%
if %errorlevel% equ 1 (
    call :print_status "Backend port %BACKEND_PORT% is already in use!"
    exit /b 1
)

cd /d "%~dp0"
start /b python backend/app.py
timeout /t 3 /nobreak >nul

call :check_port %BACKEND_PORT%
if %errorlevel% equ 1 (
    call :print_status "Backend started successfully on port %BACKEND_PORT%"
    call :print_status "Backend API: http://localhost:%BACKEND_PORT%"
    exit /b 0
) else (
    call :print_status "Failed to start backend service"
    exit /b 1
)

REM Function to stop frontend
:stop_frontend
call :print_status "Stopping frontend service..."
for /f "tokens=5" %%a in ('netstat -ano ^| find ":%FRONTEND_PORT% "') do (
    taskkill /f /pid %%a >nul 2>&1
    call :print_status "Frontend service stopped"
    goto :eof
)
call :print_status "Frontend service not running"
goto :eof

REM Function to stop backend
:stop_backend
call :print_status "Stopping backend service..."
for /f "tokens=5" %%a in ('netstat -ano ^| find ":%BACKEND_PORT% "') do (
    taskkill /f /pid %%a >nul 2>&1
    call :print_status "Backend service stopped"
    goto :eof
)
call :print_status "Backend service not running"
goto :eof

REM Function to show status
:show_status
call :print_status "=== LLM Sci-Fi Game Service Status ==="

REM Check Ollama
call :check_port %OLLAMA_PORT%
if %errorlevel% equ 1 (
    call :print_status "✓ Ollama is running on port %OLLAMA_PORT%"
) else (
    call :print_status "✗ Ollama is not running on port %OLLAMA_PORT%"
    call :print_status "  Please start Ollama: ollama serve"
)

REM Check Backend
call :check_port %BACKEND_PORT%
if %errorlevel% equ 1 (
    call :print_status "✓ Backend is running on port %BACKEND_PORT%"
) else (
    call :print_status "✗ Backend is not running on port %BACKEND_PORT%"
)

REM Check Frontend
call :check_port %FRONTEND_PORT%
if %errorlevel% equ 1 (
    call :print_status "✓ Frontend is running on port %FRONTEND_PORT%"
) else (
    call :print_status "✗ Frontend is not running on port %FRONTEND_PORT%"
)

call :print_status "====================================="
goto :eof

REM Function to show usage
:show_usage
echo Usage: %~nx0 [start^|stop^|restart^|status]
echo.
echo Commands:
echo   start   - Start both frontend and backend services
echo   stop    - Stop both frontend and backend services
echo   restart - Restart both frontend and backend services
echo   status  - Show status of all services
echo.
echo Examples:
echo   %~nx0 start
echo   %~nx0 stop
echo   %~nx0 status
goto :eof

REM Main execution
set ACTION=%1
if "%ACTION%"=="" set ACTION=start

call :print_status "LLM Sci-Fi Game Service Manager"
call :print_status "Action: %ACTION%"

if /i "%ACTION%"=="start" (
    call :print_status "Starting LLM Sci-Fi Game services..."
    call :start_backend
    if %errorlevel% equ 0 (
        call :start_frontend
        if %errorlevel% equ 0 (
            call :print_status "All services started successfully!"
            call :print_status "Game URL: http://localhost:%FRONTEND_PORT%"
            call :print_status "API URL: http://localhost:%BACKEND_PORT%"
        ) else (
            call :print_status "Frontend failed to start"
            exit /b 1
        )
    ) else (
        call :print_status "Backend failed to start"
        exit /b 1
    )
) else if /i "%ACTION%"=="stop" (
    call :print_status "Stopping LLM Sci-Fi Game services..."
    call :stop_frontend
    call :stop_backend
    call :print_status "All services stopped successfully!"
) else if /i "%ACTION%"=="restart" (
    call :print_status "Restarting LLM Sci-Fi Game services..."
    call :stop_frontend
    call :stop_backend
    timeout /t 2 /nobreak >nul
    call :start_backend
    if %errorlevel% equ 0 (
        call :start_frontend
        if %errorlevel% equ 0 (
            call :print_status "All services restarted successfully!"
            call :print_status "Game URL: http://localhost:%FRONTEND_PORT%"
            call :print_status "API URL: http://localhost:%BACKEND_PORT%"
        ) else (
            call :print_status "Frontend failed to restart"
            exit /b 1
        )
    ) else (
        call :print_status "Backend failed to restart"
        exit /b 1
    )
) else if /i "%ACTION%"=="status" (
    call :show_status
) else if /i "%ACTION%"=="help" (
    call :show_usage
) else (
    call :print_status "Unknown action: %ACTION%"
    call :show_usage
    exit /b 1
)

call :print_status "Service manager completed." 