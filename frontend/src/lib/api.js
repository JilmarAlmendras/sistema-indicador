// src/lib/api/indicadoresApi.js
/* ================================================================
   ✅ SOLUCIÓN DEFINITIVA PARA MIXED CONTENT Y URLS
   ================================================================ */

// 🔧 CONFIGURACIÓN FLEXIBLE DE ENTORNOS
const ENV_CONFIG = {
  development: {
    hostnames: ['localhost', '127.0.0.1'],
    backendUrl: 'http://localhost:8000',
    protocol: 'http'
  },
  production: {
    // 🎯 FORZAR URL HTTPS HARDCODED COMO ÚLTIMO RECURSO
    backendUrl: import.meta.env.VITE_API_URL || 
                process.env.VITE_API_URL ||
                'https://backend-indicadores-production.up.railway.app', // HARDCODED HTTPS
    protocol: 'https',
    enforceHttps: true
  }
};

// 🔍 DETECCIÓN AUTOMÁTICA DE BACKEND URL
function detectBackendUrl() {
  const currentDomain = window.location.hostname;
  
  // 🚨 SOLUCIÓN TEMPORAL: Forzar HTTPS siempre
  const baseBackendUrl = 'backend-indicadores-production.up.railway.app';
  const httpsUrl = `https://${baseBackendUrl}`;
  
  console.log('🔒 [API] Forzando URL HTTPS del backend:', httpsUrl);
  
  // Lista de posibles URLs de backend (todas HTTPS)
  const possibleBackendUrls = [
    httpsUrl, // URL principal forzada a HTTPS
    'https://sistema-indicadores-backend-production.up.railway.app',
    'https://backend-sistema-indicadores-production.up.railway.app',
    
    // Solo para desarrollo local
    currentDomain.includes('localhost') ? 'http://localhost:8000' : null
  ].filter(Boolean);
  
  console.log('🔍 [API] URLs de backend detectadas:', possibleBackendUrls);
  return possibleBackendUrls[0];
}

/* ================================================================
   🚀 DETECCIÓN INTELIGENTE DE ENTORNO
   ================================================================ */
function detectEnvironment() {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // ✅ Desarrollo local
  if (ENV_CONFIG.development.hostnames.includes(hostname)) {
    console.log('🔧 [API] Entorno: DESARROLLO LOCAL');
    return {
      env: 'development',
      baseUrl: ENV_CONFIG.development.backendUrl,
      protocol: ENV_CONFIG.development.protocol
    };
  }
  
  // ✅ Producción (Railway, Vercel, etc.)
  console.log('🚀 [API] Entorno: PRODUCCIÓN');
  console.log('🔍 [API] VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('🔍 [API] process.env.VITE_API_URL:', process.env.VITE_API_URL);
  console.log('🔍 [API] detectBackendUrl():', detectBackendUrl());
  
  let backendUrl = ENV_CONFIG.production.backendUrl.trim();
  console.log('🔍 [API] backendUrl inicial:', backendUrl);
  
  // 🚨 FORZAR HTTPS SIEMPRE EN PRODUCCIÓN
  if (!backendUrl.startsWith('https://')) {
    if (backendUrl.startsWith('http://')) {
      backendUrl = backendUrl.replace('http://', 'https://');
      console.log('🔒 [API] Convertido HTTP→HTTPS:', backendUrl);
    } else if (!/^https?:\/\//i.test(backendUrl)) {
      backendUrl = `https://${backendUrl}`;
      console.log('🔒 [API] Añadido protocolo HTTPS:', backendUrl);
    }
  }
  
  // 🛡️ VERIFICACIÓN FINAL: Solo permitir HTTPS en producción
  if (!backendUrl.startsWith('https://')) {
    console.error('❌ [API] Backend URL no es HTTPS:', backendUrl);
    backendUrl = 'https://backend-indicadores-production.up.railway.app';
    console.log('🔒 [API] Usando URL hardcoded segura:', backendUrl);
  }
  
  // Remover trailing slash y forzar HTTPS de nuevo
  backendUrl = backendUrl.replace(/\/+$/, '').replace('http://', 'https://');
  
  console.log('✅ [API] URL final del backend:', backendUrl);
  
  return {
    env: 'production',
    baseUrl: backendUrl,
    protocol: 'https'
  };
}

// 🌍 Configuración global
const API_CONFIG = detectEnvironment();
const BASE_URL = API_CONFIG.baseUrl;

console.log(`✅ [API] Configuración: ${BASE_URL}`);

/* ================================================================
   🛡️ WRAPPER FETCH CON PROTECCIÓN MIXED CONTENT
   ================================================================ */
async function secureApiCall(endpoint, options = {}) {
  let fullUrl = `${BASE_URL.replace('http://', 'https://')}${endpoint}`;
  
  // 🛡️ VERIFICACIÓN CRÍTICA: Forzar HTTPS en producción
  if (window.location.protocol === 'https:') {
    if (fullUrl.startsWith('http://')) {
      fullUrl = fullUrl.replace('http://', 'https://');
      console.log('🔒 [API] Mixed Content prevención - Convertido a HTTPS:', fullUrl);
    } else if (!fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
      console.log('🔒 [API] Mixed Content prevención - Añadido protocolo HTTPS:', fullUrl);
    }
  }
  
  // 🚨 VERIFICACIÓN EXTRA: Asegurar que NUNCA usemos HTTP en producción
  if (fullUrl.startsWith('http://') && !fullUrl.includes('localhost')) {
    fullUrl = fullUrl.replace('http://', 'https://');
    console.error('🚨 [API] CRÍTICO: Detectado HTTP en producción, forzando HTTPS:', fullUrl);
  }
  
  console.log(`📡 [API] Request: ${options.method || 'GET'} ${fullUrl}`);
  
  try {
    // ✅ Configuración de headers por defecto
    const defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // 🔒 Headers de seguridad
      'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache'
    };
    
    // 🔧 Merge headers
    const finalHeaders = {
      ...defaultHeaders,
      ...(options.headers || {})
    };
    
    // 🚀 Ejecutar fetch primera vez
    let response;
    
    try {
      response = await fetch(fullUrl, {
        ...options,
        headers: finalHeaders,
        // ✅ Configuraciones adicionales de seguridad
        mode: 'cors',
        credentials: 'omit', // No enviar cookies por defecto
        cache: 'no-cache'
      });
    } catch (fetchError) {
      // 🛡️ SI FALLA POR MIXED CONTENT, INTERCEPTAR Y REINTENTAR
      if (fetchError.message.includes('Mixed Content') || 
          fetchError.message.includes('insecure') ||
          fullUrl.includes('http://')) {
        
        console.log('🔒 [API] Error Mixed Content detectado, forzando HTTPS...');
        const httpsUrl = fullUrl.replace('http://', 'https://');
        console.log(`🔒 [API] Reintentando con: ${httpsUrl}`);
        
        response = await fetch(httpsUrl, {
          ...options,
          headers: finalHeaders,
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache'
        });
      } else {
        throw fetchError;
      }
    }
    
    // 🚨 VERIFICACIÓN CRÍTICA: Mixed Content
    if (window.location.protocol === 'https:' && response.url.startsWith('http://')) {
      const mixedContentError = `❌ MIXED CONTENT DETECTADO: 
      - Página: ${window.location.protocol}//${window.location.host}
      - API: ${response.url}
      - Solución: Configurar VITE_API_URL con HTTPS`;
      
      console.error(mixedContentError);
      throw new Error('Mixed Content: La API debe usar HTTPS cuando el frontend usa HTTPS');
    }
    
    // ✅ Verificar respuesta HTTP
    if (!response.ok) {
      let errorBody;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          errorBody = await response.json();
        } else {
          errorBody = await response.text();
        }
      } catch (parseError) {
        errorBody = `Error ${response.status}: ${response.statusText}`;
      }
      
      console.error(`❌ [API] Error ${response.status}:`, errorBody);
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorBody)}`);
    }
    
    // ✅ Procesar respuesta exitosa
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log(`✅ [API] Success: ${options.method || 'GET'} ${endpoint}`);
    return { data, response };
    
  } catch (error) {
    // 🚨 Manejo de errores robusto
    console.error(`❌ [API] Error en ${endpoint}:`, error);
    
    // Errores específicos para mejor debugging
    if (error.message.includes('Mixed Content')) {
      throw new Error(`🔒 Mixed Content: Verifica que VITE_API_URL use HTTPS en producción`);
    }
    
    if (error.message.includes('CORS')) {
      throw new Error(`🌐 CORS Error: El backend debe permitir el origen ${window.location.origin}`);
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`🌐 Network Error: No se puede conectar con ${BASE_URL}`);
    }
    
    throw error;
  }
}

/* ================================================================
   📋 API ENDPOINTS - SISTEMA DE INDICADORES
   ================================================================ */
export const indicadoresApi = {
  // 📊 GET /api/indicadores - Obtener todos los indicadores
  getIndicadores: async () => {
    const result = await secureApiCall('/api/indicadores');
    return result.data;
  },

  // 🏢 GET /api/indicadores/area/:area - Indicadores por área
  getIndicadoresByArea: async (area) => {
    const encodedArea = encodeURIComponent(area);
    const result = await secureApiCall(`/api/indicadores/area/${encodedArea}`);
    return result.data;
  },

  // 🔍 GET /api/indicadores/:id - Indicador específico
  getIndicador: async (id) => {
    const result = await secureApiCall(`/api/indicadores/${id}`);
    return result.data;
  },

  // ➕ POST /api/indicadores - Crear indicador
  createIndicador: async (data) => {
    const result = await secureApiCall('/api/indicadores', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return result.data;
  },

  // ✏️ PUT /api/indicadores/:id - Actualizar indicador
  updateIndicador: async (id, data) => {
    const result = await secureApiCall(`/api/indicadores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return result.data;
  },

  // 🗑️ DELETE /api/indicadores/:id - Eliminar indicador
  deleteIndicador: async (id) => {
    const result = await secureApiCall(`/api/indicadores/${id}`, {
      method: 'DELETE'
    });
    return result.data;
  },

  // 📈 GET /api/indicadores/estadisticas/dashboard - Estadísticas
  getEstadisticas: async () => {
    const result = await secureApiCall('/api/indicadores/estadisticas/dashboard');
    return result.data;
  },

  // 🔍 GET /health - Health check del backend
  healthCheck: async () => {
    const result = await secureApiCall('/health');
    return result.data;
  },

  // 🧪 GET /test-cors - Test de CORS
  testCors: async () => {
    const result = await secureApiCall('/test-cors');
    return result.data;
  }
};

/* ================================================================
   🛠️ UTILIDADES ADICIONALES
   ================================================================ */

// 🔧 Debug: Obtener configuración actual
export const getApiConfig = () => ({
  environment: API_CONFIG.env,
  baseUrl: BASE_URL,
  protocol: API_CONFIG.protocol,
  currentPage: `${window.location.protocol}//${window.location.host}`,
  timestamp: new Date().toISOString()
});

// 🧪 Test de conectividad
export const testConnection = async () => {
  try {
    console.log('🧪 [API] Probando conectividad...');
    const health = await indicadoresApi.healthCheck();
    console.log('✅ [API] Conectividad OK:', health);
    return { success: true, data: health };
  } catch (error) {
    console.error('❌ [API] Error de conectividad:', error);
    return { success: false, error: error.message };
  }
};

// Export por defecto
export default indicadoresApi;
