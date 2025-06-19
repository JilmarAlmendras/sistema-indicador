@echo off
echo Instalando dependencias del sistema (Monorepo)...

echo.
echo 1. Instalando dependencias de Python (Backend)...
cd backend
python -m pip install --upgrade pip
python -m pip install virtualenv
python -m virtualenv venv
call venv\Scripts\activate
pip install fastapi==0.104.1
pip install uvicorn==0.24.0
pip install sqlalchemy==2.0.23
pip install pydantic==2.5.2
pip install python-jose==3.3.0
pip install passlib==1.7.4
pip install python-multipart==0.0.6
pip install python-dotenv==1.0.0
pip install psycopg2-binary==2.9.9
pip install alembic==1.12.1

echo.
echo 2. Instalando dependencias de Node.js (Frontend)...
cd ..\frontend
npm install
npm install axios
npm install @radix-ui/react-icons
npm install @radix-ui/react-slot
npm install class-variance-authority
npm install clsx
npm install tailwind-merge
npm install tailwindcss-animate
npm install lucide-react
npm install framer-motion

echo.
echo Instalación completada!
echo.
echo Estructura del proyecto:
echo   📁 frontend/  - React + Vite + Tailwind
echo   📁 backend/   - FastAPI + PostgreSQL
echo.
echo Ahora puedes ejecutar start.bat para iniciar la aplicación
echo.
pause 