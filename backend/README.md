# 🚀 Backend - Sistema de Indicadores Horizons

## 📋 Estructura del Proyecto

```
backend/
├── app/                    # Aplicación FastAPI principal
│   ├── main.py            # Punto de entrada de la API
│   ├── database.py        # Configuración de base de datos
│   ├── models/            # Modelos SQLAlchemy
│   └── routes/            # Rutas de la API
├── cargar_datos.py        # 📊 Script para cargar datos del Excel
├── analizar_datos.py      # 🔍 Script para análisis de datos
├── init_db.py             # 🗄️  Inicialización de base de datos
└── requirements.txt       # 📦 Dependencias Python
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Cargar datos
```bash
python cargar_datos.py
```

### 3. Iniciar servidor
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 📊 Scripts Disponibles

### `cargar_datos.py`
Carga los datos desde el archivo "Base de datos.xlsx" a la base de datos:
- ✅ Detecta y corrige fechas problemáticas automáticamente
- ✅ Crea indicadores únicos basados en VP/Área
- ✅ Procesa todos los hitos con fechas específicas
- ✅ Mantiene integridad de datos

### `analizar_datos.py`  
Analiza la estructura de datos para debugging:
- 📈 Estadísticas de indicadores
- 📊 Distribución por VP/Área
- 🎯 Estados de hitos
- 📅 Rangos de fechas

### `init_db.py`
Inicializa las tablas de la base de datos:
- 🗄️ Crea esquema de base de datos
- ⚡ Configura conexiones

## 🔗 API Endpoints

- `GET /api/indicadores/` - Lista todos los indicadores
- `GET /api/indicadores/{id}` - Obtiene indicador específico
- `PUT /api/indicadores/{id}` - Actualiza indicador
- `PUT /api/hitos/{id}` - Actualiza hito específico

## 🌐 URLs de Acceso

- **API:** http://localhost:8000
- **Documentación:** http://localhost:8000/docs
- **Frontend:** http://localhost:5173 