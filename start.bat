@echo off
chcp 65001 >nul
title 🚀 Horizons - Sistema de Indicadores

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🚀 INICIANDO SISTEMA HORIZONS                      ║
echo ║                                                                  ║
echo ║  📊 Dashboard de Indicadores Empresariales                      ║
echo ║  📈 Gestión de Hitos y Cronogramas                             ║
echo ║  📋 Sistema de Seguimiento de Progreso                         ║
echo ║  🏗️  Estructura Monorepo (frontend/ + backend/)                ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Verificando dependencias...

REM Verificar que existe el entorno virtual
if not exist "backend\venv\Scripts\activate.bat" (
    echo ❌ Error: Entorno virtual no encontrado
    echo 💡 Ejecuta install_dependencies.bat primero
    pause
    exit /b 1
)

REM Verificar que existe node_modules en frontend
if not exist "frontend\node_modules" (
    echo ❌ Error: Dependencias de frontend no encontradas
    echo 💡 Ejecuta install_dependencies.bat primero
    pause
    exit /b 1
)

echo ✅ Dependencias verificadas

echo.
echo 🚀 Iniciando servicios...
echo.

REM Iniciar Backend (FastAPI)
echo 📡 Iniciando Backend - FastAPI en puerto 8000...
start "Backend - FastAPI" powershell -noexit -command "cd backend; .\venv\Scripts\activate; uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

REM Esperar un momento para que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar Frontend (React)
echo 🌐 Iniciando Frontend - React en puerto 5173...
start "Frontend - React" powershell -noexit -command "cd frontend; npm run dev"

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                      ✅ SISTEMA INICIADO                        ║
echo ║                                                                  ║
echo ║  🌐 Frontend: http://localhost:5173                            ║
echo ║  📡 Backend:  http://localhost:8000                            ║
echo ║  📚 API Docs: http://localhost:8000/docs                       ║
echo ║                                                                  ║
echo ║  💡 Presiona cualquier tecla para cerrar este mensaje          ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

pause 