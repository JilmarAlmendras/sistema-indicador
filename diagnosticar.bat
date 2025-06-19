@echo off
echo 🔍 DIAGNÓSTICO DEL SISTEMA DE INDICADORES
echo ==========================================
echo.

echo 📋 1. Verificando estructura de archivos...
echo.
if exist "package.json" (
    echo ✅ package.json - OK
) else (
    echo ❌ package.json - NO ENCONTRADO
)

if exist "backend" (
    echo ✅ Directorio backend - OK
) else (
    echo ❌ Directorio backend - NO ENCONTRADO
)

if exist "backend\start_server.py" (
    echo ✅ backend\start_server.py - OK
) else (
    echo ❌ backend\start_server.py - NO ENCONTRADO
)

if exist "backend\app\main.py" (
    echo ✅ backend\app\main.py - OK
) else (
    echo ❌ backend\app\main.py - NO ENCONTRADO
)

if exist "node_modules" (
    echo ✅ node_modules - OK
) else (
    echo ⚠️  node_modules - NO ENCONTRADO (ejecutar: npm install)
)

echo.
echo 📋 2. Verificando versiones...
echo.
echo 🐍 Python:
python --version 2>nul || echo ❌ Python no está instalado o no está en PATH

echo.
echo 📦 Node.js:
node --version 2>nul || echo ❌ Node.js no está instalado o no está en PATH

echo.
echo 📦 NPM:
npm --version 2>nul || echo ❌ NPM no está instalado o no está en PATH

echo.
echo 📋 3. Verificando dependencias de Python...
echo.
cd backend 2>nul && (
    echo 🔍 Verificando FastAPI:
    python -c "import fastapi; print('✅ FastAPI:', fastapi.__version__)" 2>nul || echo ❌ FastAPI no instalado
    
    echo 🔍 Verificando Uvicorn:
    python -c "import uvicorn; print('✅ Uvicorn:', uvicorn.__version__)" 2>nul || echo ❌ Uvicorn no instalado
    
    echo 🔍 Verificando SQLAlchemy:
    python -c "import sqlalchemy; print('✅ SQLAlchemy:', sqlalchemy.__version__)" 2>nul || echo ❌ SQLAlchemy no instalado
    
    cd ..
) || (
    echo ❌ No se pudo acceder al directorio backend
)

echo.
echo 📋 4. Verificando dependencias de Node.js...
echo.
if exist "node_modules" (
    echo 🔍 Verificando React:
    npm list react --depth=0 2>nul | findstr react >nul && echo ✅ React instalado || echo ❌ React no encontrado
    
    echo 🔍 Verificando Vite:
    npm list vite --depth=0 2>nul | findstr vite >nul && echo ✅ Vite instalado || echo ❌ Vite no encontrado
) else (
    echo ⚠️  No se puede verificar dependencias de Node.js sin node_modules
)

echo.
echo 📋 5. Verificando puertos...
echo.
netstat -an | findstr ":8000" >nul && echo ⚠️  Puerto 8000 está en uso || echo ✅ Puerto 8000 disponible
netstat -an | findstr ":5173" >nul && echo ⚠️  Puerto 5173 está en uso || echo ✅ Puerto 5173 disponible

echo.
echo ==========================================
echo 📋 DIAGNÓSTICO COMPLETADO
echo.
echo 💡 Si hay errores:
echo    1. Instalar dependencias: install_dependencies.bat
echo    2. Si faltan herramientas básicas, instalar Python y Node.js
echo    3. Usar los scripts corregidos: start_*_fixed.bat
echo.
pause 