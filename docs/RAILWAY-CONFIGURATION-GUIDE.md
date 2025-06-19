# 🚂 **GUÍA COMPLETA: CONFIGURACIÓN RAILWAY PASO A PASO**

## 🚨 **PROBLEMA ACTUAL**

**Error de CORS**: `Access to fetch at 'https://backend-indicadores-production.up.railway.app/api/indicadores' has been blocked by CORS policy`

**Causa**: URLs inconsistentes entre frontend y backend + configuración CORS incorrecta.

---

## 📋 **PASO 1: IDENTIFICAR URLs REALES DE RAILWAY**

### **🔍 Obtener URLs de tus servicios Railway:**

1. **Ve a railway.app** y accede a tu proyecto
2. **Para cada servicio**, anota la URL exacta:

```
🏗️ TUS SERVICIOS RAILWAY:
├── 📡 Backend Service URL: https://[TU-BACKEND-URL].up.railway.app
├── 🌐 Frontend Service URL: https://[TU-FRONTEND-URL].up.railway.app  
└── 🗄️ PostgreSQL Database: [AUTO-GENERADO]
```

**📝 EJEMPLO de URLs comunes:**
```
Backend:  https://sistema-indicadores-backend-production.up.railway.app
Frontend: https://sistema-indicadores-frontend-production.up.railway.app
```

---

## ⚙️ **PASO 2: CONFIGURACIÓN DE VARIABLES DE ENTORNO**

### **🗄️ SERVICIO POSTGRESQL** 
```bash
# ✅ AUTO-CONFIGURADO POR RAILWAY
DATABASE_URL=postgresql://user:password@host:port/database

# 🔧 NO REQUIERE CONFIGURACIÓN MANUAL
```

### **📡 SERVICIO BACKEND (FastAPI)**
```bash
# 🔑 SEGURIDAD
SECRET_KEY=tu-clave-super-secreta-256-bits-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 🌐 CORS - ¡CRÍTICO! URLs EXACTAS
ALLOWED_ORIGINS=https://[TU-FRONTEND-URL].up.railway.app,http://localhost:5173

# 🚦 RATE LIMITING
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=3600

# 🏗️ APLICACIÓN
APP_NAME=Sistema de Indicadores API
ENVIRONMENT=production
RAILWAY_ENVIRONMENT_NAME=production

# 📊 LOGGING
LOG_LEVEL=INFO
ENABLE_LOGGING=true

# 🔒 SECURITY
ENABLE_SECURITY_HEADERS=true
```

### **🌐 SERVICIO FRONTEND (React)**
```bash
# 🎯 CRÍTICO: URL DEL BACKEND
VITE_API_URL=https://[TU-BACKEND-URL].up.railway.app

# 🏗️ BUILD
NODE_ENV=production
```

---

## 🛠️ **PASO 3: CORRECCIÓN DE CÓDIGO**

### **📡 Backend: Actualizar CORS en main.py**

```python
# backend/app/main.py
import os

# 🌐 CORS Configuration
if os.getenv("RAILWAY_ENVIRONMENT_NAME") or os.getenv("ENVIRONMENT") == "production":
    # ✅ PRODUCCIÓN - URLs específicas
    allowed_origins = [
        "https://[TU-FRONTEND-URL].up.railway.app",  # ⚠️ CAMBIAR POR TU URL REAL
        "http://localhost:5173",  # Solo para testing
        "http://localhost:3000",  # Solo para testing
    ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,  # ✅ ESPECÍFICO
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "Accept"],
    )
    
    print(f"🔒 CORS configurado para PRODUCCIÓN: {allowed_origins}")
else:
    # 🔧 DESARROLLO - CORS abierto
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    print("🔧 CORS configurado para DESARROLLO")
```

### **🌐 Frontend: Actualizar API URL**

```javascript
// frontend/src/lib/api.js
const ENV_CONFIG = {
  development: {
    backendUrl: 'http://localhost:8000',
  },
  production: {
    // ⚠️ CAMBIAR POR TU URL REAL DE BACKEND
    backendUrl: 'https://[TU-BACKEND-URL].up.railway.app',
  }
};
```

---

## 🚀 **PASO 4: COMANDOS RAILWAY**

### **📡 Configurar Backend Service**

```bash
# 1️⃣ Crear servicio Backend
railway service create backend-indicadores

# 2️⃣ Configurar variables
railway variables set SECRET_KEY=tu-clave-secreta-256-bits
railway variables set ALLOWED_ORIGINS=https://[TU-FRONTEND-URL].up.railway.app
railway variables set ENVIRONMENT=production
railway variables set RAILWAY_ENVIRONMENT_NAME=production

# 3️⃣ Deploy
railway deploy
```

### **🌐 Configurar Frontend Service**

```bash
# 1️⃣ Crear servicio Frontend
railway service create frontend-indicadores

# 2️⃣ Configurar variables
railway variables set VITE_API_URL=https://[TU-BACKEND-URL].up.railway.app
railway variables set NODE_ENV=production

# 3️⃣ Deploy
railway deploy
```

### **🗄️ Configurar Database**

```bash
# 1️⃣ Agregar PostgreSQL
railway add postgresql

# 2️⃣ DATABASE_URL se configura automáticamente
# ✅ NO REQUIERE ACCIÓN MANUAL
```

---

## 🔍 **PASO 5: VERIFICACIÓN Y DEBUG**

### **✅ Checklist de Verificación**

```bash
# 1️⃣ Verificar que el backend responde
curl https://[TU-BACKEND-URL].up.railway.app/health

# 2️⃣ Verificar CORS desde frontend
# Abrir: https://[TU-FRONTEND-URL].up.railway.app
# Usar debug-mixed-content.html

# 3️⃣ Verificar variables de entorno
railway variables  # En cada servicio
```

### **🛠️ Debug Común**

**❌ Error: "CORS blocked"**
```bash
# Solución:
railway variables set ALLOWED_ORIGINS=https://[TU-FRONTEND-URL-EXACTA].up.railway.app
railway deploy
```

**❌ Error: "Failed to fetch"**
```bash
# Solución:
railway variables set VITE_API_URL=https://[TU-BACKEND-URL-EXACTA].up.railway.app
railway deploy
```

**❌ Error: "Mixed Content"**
```bash
# Solución: Asegurar que ambas URLs usen HTTPS
https://[TU-BACKEND-URL].up.railway.app  ✅
https://[TU-FRONTEND-URL].up.railway.app  ✅
```

---

## 📊 **PASO 6: ESTRUCTURA FINAL EN RAILWAY**

```
🚂 Railway Project: sistema-indicadores
├── 📡 backend-indicadores
│   ├── 🔗 URL: https://[TU-BACKEND].up.railway.app
│   ├── 📁 Root Directory: /backend
│   ├── 🔧 Build Command: pip install -r requirements.txt
│   ├── 🚀 Start Command: gunicorn app.main:app (from Procfile)
│   └── 🌐 Variables:
│       ├── SECRET_KEY=clave-256-bits
│       ├── ALLOWED_ORIGINS=https://[FRONTEND-URL]
│       ├── ENVIRONMENT=production
│       └── DATABASE_URL=[AUTO]
│
├── 🌐 frontend-indicadores  
│   ├── 🔗 URL: https://[TU-FRONTEND].up.railway.app
│   ├── 📁 Root Directory: /frontend
│   ├── 🔧 Build Command: npm run build
│   ├── 🚀 Start Command: npm run start
│   └── 🌐 Variables:
│       ├── VITE_API_URL=https://[BACKEND-URL]
│       └── NODE_ENV=production
│
└── 🗄️ postgresql
    ├── 🔗 DATABASE_URL=[AUTO-GENERADO]
    └── 🔄 Conectado automáticamente al backend
```

---

## 🎯 **EJEMPLO COMPLETO CON URLs REALES**

Supongamos que tus URLs son:
- **Backend**: `https://backend-sistema-prod.up.railway.app`
- **Frontend**: `https://frontend-sistema-prod.up.railway.app`

### **Backend Variables:**
```bash
SECRET_KEY=mi-clave-super-secreta-de-256-bits-para-jwt-tokens
ALLOWED_ORIGINS=https://frontend-sistema-prod.up.railway.app,http://localhost:5173
ENVIRONMENT=production
RAILWAY_ENVIRONMENT_NAME=production
```

### **Frontend Variables:**
```bash
VITE_API_URL=https://backend-sistema-prod.up.railway.app
NODE_ENV=production
```

### **CORS en main.py:**
```python
allowed_origins = [
    "https://frontend-sistema-prod.up.railway.app",
    "http://localhost:5173",  # Solo para testing
]
```

---

## ⚡ **COMANDOS RÁPIDOS PARA APLICAR FIX**

```bash
# 1️⃣ Ir al servicio backend
railway service select backend-indicadores

# 2️⃣ Configurar CORS con TU URL real
railway variables set ALLOWED_ORIGINS=https://[TU-FRONTEND-URL].up.railway.app

# 3️⃣ Ir al servicio frontend  
railway service select frontend-indicadores

# 4️⃣ Configurar API URL con TU URL real
railway variables set VITE_API_URL=https://[TU-BACKEND-URL].up.railway.app

# 5️⃣ Redeploy ambos servicios
railway deploy
```

---

## 🎉 **RESULTADO ESPERADO**

Después de aplicar esta configuración:

```bash
✅ Backend responde: https://[TU-BACKEND].up.railway.app/health
✅ Frontend carga: https://[TU-FRONTEND].up.railway.app  
✅ API calls funcionan sin CORS errors
✅ Datos se cargan correctamente en el dashboard
```

---

**🚨 NOTA IMPORTANTE**: Reemplaza `[TU-BACKEND-URL]` y `[TU-FRONTEND-URL]` con las URLs exactas que Railway te asignó. 