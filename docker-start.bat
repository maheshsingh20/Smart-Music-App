@echo off
echo ========================================
echo  Smart Music App - Docker Setup
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.docker .env
    echo.
    echo IMPORTANT: Please edit .env file and add your API credentials!
    echo Press any key to open .env file in notepad...
    pause >nul
    notepad .env
)

echo.
echo Building and starting Docker containers...
echo This may take a few minutes on first run...
echo.

docker-compose up -d --build

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Application is running
    echo ========================================
    echo.
    echo  Frontend: http://localhost:3000
    echo  Backend:  http://localhost:5000
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop:      docker-compose down
    echo.
) else (
    echo.
    echo ERROR: Failed to start containers
    echo Check the error messages above
    echo.
)

pause
