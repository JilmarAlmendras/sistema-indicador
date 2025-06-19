# 🚀 **GUÍA COMPLETA: RAILWAY DEPLOYMENT SIN MIXED CONTENT**

## 🚨 **PROBLEMA SOLUCIONADO: Mixed Content Error**

**El error que estabas viendo:**
```
❌ Mixed Content – el recurso vino por HTTP: http://backend-url/api/...
❌ Failed to fetch
❌ CORS Error
```

**✅ CAUSA:** Mezclando HTTP (backend) con HTTPS (frontend)  
**✅ SOLUCIÓN:** Configuración robusta implementada en `frontend/src/lib/api.js`

---

## 📋 **PASOS RAILWAY: CONFIGURACIÓN PERFECTA**

### **🔧 PASO 1: PREPARAR BACKEND EN RAILWAY**

#### **1.1 Crear Proyecto Railway**
```bash
# Opción A: CLI Railway
npm install -g @railway/cli
railway login
railway init

# Opción B: Web Dashboard
# https://railway.app/ → New Project → Deploy from GitHub
```

#### **1.2 Configurar Root Directory**
```
🔧 Service Settings → Settings → Source
✅ Root Directory: /backend
✅ Build Command: (automático con nixpacks)
✅ Start Command: (automático desde Procfile)
```

#### **1.3 Añadir Base de Datos PostgreSQL**
```bash
# En Railway Dashboard:
New Service → Database → PostgreSQL

# ✅ Railway automáticamente crea:
DATABASE_URL=postgresql://username:password@host:port/dbname
```

### **🌐 PASO 2: CONFIGURAR VARIABLES DE ENTORNO BACKEND**

#### **2.1 Variables Obligatorias en Railway:**
```bash
# 🔑 Seguridad (Railway Dashboard → Service → Variables)
SECRET_KEY=railway-auto-generated-or-custom
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 🗄️ Database (Auto-generada por Railway)
DATABASE_URL=postgresql://...

# 🌐 CORS - URLs EXACTAS de tu frontend
ALLOWED_ORIGINS=https://tu-frontend-railway.up.railway.app,https://tu-frontend-vercel.vercel.app

# 🚦 Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# 🏗️ Aplicación
ENVIRONMENT=production
LOG_LEVEL=INFO
APP_NAME=Sistema de Indicadores API
```

#### **2.2 Cómo Configurar Variables:**
1. **Railway Dashboard** → Tu proyecto → Backend service
2. **Variables** tab
3. **Add Variable** por cada una:
   ```
   Variable Name: SECRET_KEY
   Variable Value: tu-secret-key-super-seguro
   ```

### **🎨 PASO 3: CONFIGURAR FRONTEND EN RAILWAY**

#### **3.1 Crear Frontend Service**
```bash
# En mismo proyecto Railway:
New Service → GitHub Repo (mismo repo)
✅ Service Name: frontend
✅ Root Directory: /frontend
```

#### **3.2 Variables Frontend Railway:**
```bash
# Variable CRÍTICA en Railway Dashboard:
VITE_API_URL=https://tu-backend-railway.up.railway.app

# ⚠️ IMPORTANTE: 
# - URL debe ser EXACTA de tu backend Railway
# - DEBE usar HTTPS (no HTTP)
# - NO incluir /api al final
```

### **🔗 PASO 4: OBTENER URLs RAILWAY**

#### **4.1 URL Backend:**
```bash
# Railway Dashboard → Backend Service → Settings → Domains
✅ Generate Domain

# Ejemplo resultado:
https://backend-indicadores-production-abc123.up.railway.app

# ✅ Esta URL va en:
# - VITE_API_URL del frontend
# - ALLOWED_ORIGINS del backend
```

#### **4.2 URL Frontend:**
```bash
# Railway Dashboard → Frontend Service → Settings → Domains  
✅ Generate Domain

# Ejemplo resultado:
https://sistema-indicadores-production-xyz789.up.railway.app

# ✅ Esta URL va en:
# - ALLOWED_ORIGINS del backend
```

---

## 🔧 **CONFIGURACIÓN EXACTA POR PASOS**

### **💾 PASO 5: BACKEND - Variables Específicas**

```bash
# 🚀 Copia y pega estas variables en Railway Backend:

# === SEGURIDAD ===
SECRET_KEY=horizons-super-secret-key-2024-railway
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# === CORS (REEMPLAZA CON TUS URLs REALES) ===
ALLOWED_ORIGINS=https://sistema-indicadores-production-xyz789.up.railway.app

# === RATE LIMITING ===  
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# === APLICACIÓN ===
ENVIRONMENT=production
LOG_LEVEL=INFO
APP_NAME=Sistema de Indicadores API

# === DATABASE (Railway auto-genera) ===
# DATABASE_URL se crea automáticamente
```

### **🌐 PASO 6: FRONTEND - Variable Específica**

```bash
# 🚀 En Railway Frontend Service → Variables:

# Variable ÚNICA pero CRÍTICA:
VITE_API_URL=https://backend-indicadores-production-abc123.up.railway.app

# ⚠️ REEMPLAZAR "abc123" con tu URL real de backend
```

---

## 🧪 **PASO 7: TESTING Y VERIFICACIÓN**

### **7.1 Test Backend Railway:**
```bash
# 1. Health Check
curl https://tu-backend-railway.up.railway.app/health

# 2. CORS Test  
curl https://tu-backend-railway.up.railway.app/test-cors

# 3. API Test
curl https://tu-backend-railway.up.railway.app/api/indicadores

# ✅ Respuesta esperada: JSON con datos
```

### **7.2 Test Frontend:**
```bash
# 1. Abrir tu frontend Railway
https://tu-frontend-railway.up.railway.app

# 2. Abrir DevTools Console (F12)
# 3. Buscar estos logs:
✅ [API] Entorno: PRODUCCIÓN
✅ [API] Configuración: https://tu-backend-railway.up.railway.app
✅ [API] Success: GET /api/indicadores

# ❌ Si ves errores:
❌ Mixed Content → Revisar VITE_API_URL
❌ CORS Error → Revisar ALLOWED_ORIGINS
❌ 404 Error → Verificar URLs
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS COMUNES**

### **❌ Error: "Mixed Content"**
```bash
Problema: Frontend HTTPS + Backend HTTP
Solución: VITE_API_URL debe ser HTTPS

# ✅ Correcto:
VITE_API_URL=https://backend-railway.up.railway.app

# ❌ Incorrecto:  
VITE_API_URL=http://backend-railway.up.railway.app
```

### **❌ Error: "CORS Error"**
```bash
Problema: Backend no permite el origen del frontend
Solución: Añadir URL frontend a ALLOWED_ORIGINS

# ✅ Backend ALLOWED_ORIGINS debe incluir:
https://tu-frontend-railway.up.railway.app
```

### **❌ Error: "Failed to fetch"**
```bash
Problema: URL backend incorrecta
Solución: Verificar VITE_API_URL exacta

# ✅ Verificar que backend responda:
curl https://tu-backend-railway.up.railway.app/health
```

### **❌ Error: "404 Not Found"**
```bash
Problema: Endpoints no encontrados
Solución: Verificar que backend esté desplegado

# ✅ Verificar API endpoints:
curl https://tu-backend-railway.up.railway.app/api/indicadores
```

---

## 📊 **RESUMEN: CONFIGURACIÓN FINAL**

### **🏗️ Estructura Railway:**
```
📁 Proyecto Railway: sistema-indicadores
├── 🔧 Backend Service (/backend)
│   ├── 🔗 URL: https://backend-indicadores-production-abc123.up.railway.app
│   ├── 🗄️ PostgreSQL: (auto-conectada)
│   └── 📋 Variables: SECRET_KEY, ALLOWED_ORIGINS, etc.
│
├── 🎨 Frontend Service (/frontend)  
│   ├── 🔗 URL: https://sistema-indicadores-production-xyz789.up.railway.app
│   └── 📋 Variable: VITE_API_URL
│
└── 🗄️ PostgreSQL Database
    └── 🔗 DATABASE_URL: (auto-generada)
```

### **🔑 Variables Críticas:**
| Service | Variable | Valor |
|---------|----------|-------|
| Backend | `ALLOWED_ORIGINS` | URL del frontend |
| Frontend | `VITE_API_URL` | URL del backend |
| Backend | `SECRET_KEY` | Clave segura |
| Backend | `DATABASE_URL` | Auto-generada |

---

## ✅ **VERIFICACIÓN FINAL**

### **Checklist Pre-Deploy:**
- [ ] Backend service creado en Railway
- [ ] PostgreSQL añadida al proyecto
- [ ] Variables backend configuradas
- [ ] Frontend service creado
- [ ] VITE_API_URL configurada
- [ ] Domains generados para ambos services

### **Checklist Post-Deploy:**
- [ ] Backend responde en `/health`
- [ ] Frontend carga sin errores console
- [ ] Datos se muestran en dashboard
- [ ] No hay errores Mixed Content
- [ ] CORS funcionando correctamente

---

## 🎉 **¡DEPLOYMENT EXITOSO!**

Con esta configuración, tu aplicación estará:
- ✅ **Sin Mixed Content errors**
- ✅ **CORS configurado correctamente**  
- ✅ **URLs Railway funcionando**
- ✅ **API keys y secrets seguros**
- ✅ **Ready para producción**

**🚀 ¡Tu Sistema de Indicadores está listo para usuarios reales!** 