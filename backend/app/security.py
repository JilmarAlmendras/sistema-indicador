"""
🛡️ Módulo de Seguridad Avanzada
Implementa rate limiting, validaciones y protecciones adicionales
"""

import os
import time
from typing import Dict, Optional
from fastapi import Request, HTTPException, status
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

# ===================================================
# 🚦 CONFIGURACIÓN RATE LIMITING
# ===================================================

# Configuración desde variables de entorno
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

# Inicializar rate limiter
limiter = Limiter(key_func=get_remote_address)

# ===================================================
# 📊 LOGGING DE SEGURIDAD
# ===================================================

# Configurar logging de seguridad
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

# Handler para logs de seguridad
if not security_logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - SECURITY - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    security_logger.addHandler(handler)

# ===================================================
# 🔍 DETECCIÓN DE ATAQUES
# ===================================================

class SecurityMonitor:
    """Monitor de seguridad para detectar patrones de ataque"""
    
    def __init__(self):
        self.failed_attempts: Dict[str, list] = {}
        self.suspicious_patterns = [
            "script",
            "javascript:",
            "onclick",
            "onerror",
            "onload",
            "<script",
            "</script>",
            "eval(",
            "document.cookie",
            "union select",
            "drop table",
            "insert into",
            "delete from",
            "../",
            "..\\",
            "cmd.exe",
            "/bin/bash",
            "nc -l",
            "wget",
            "curl",
        ]
    
    def log_failed_attempt(self, ip_address: str, endpoint: str, reason: str):
        """Registra intento fallido de acceso"""
        current_time = time.time()
        
        if ip_address not in self.failed_attempts:
            self.failed_attempts[ip_address] = []
        
        self.failed_attempts[ip_address].append({
            "timestamp": current_time,
            "endpoint": endpoint,
            "reason": reason
        })
        
        # Limpiar intentos antiguos (más de 1 hora)
        self.failed_attempts[ip_address] = [
            attempt for attempt in self.failed_attempts[ip_address]
            if current_time - attempt["timestamp"] < 3600
        ]
        
        security_logger.warning(
            f"Failed attempt from {ip_address} on {endpoint}: {reason}"
        )
        
        # Bloquear IP si hay muchos intentos fallidos
        if len(self.failed_attempts[ip_address]) > 10:
            security_logger.error(
                f"IP {ip_address} blocked due to excessive failed attempts"
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="IP temporarily blocked due to suspicious activity"
            )
    
    def check_malicious_input(self, input_data: str) -> bool:
        """Verifica si el input contiene patrones maliciosos"""
        input_lower = input_data.lower()
        
        for pattern in self.suspicious_patterns:
            if pattern in input_lower:
                security_logger.warning(
                    f"Malicious pattern detected: {pattern} in input: {input_data[:100]}"
                )
                return True
        
        return False
    
    def validate_request_size(self, request: Request, max_size_mb: int = 10):
        """Valida el tamaño de la request"""
        content_length = request.headers.get("content-length")
        
        if content_length:
            size_mb = int(content_length) / (1024 * 1024)
            if size_mb > max_size_mb:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Request too large. Max size: {max_size_mb}MB"
                )

# Instancia global del monitor
security_monitor = SecurityMonitor()

# ===================================================
# 🔒 MIDDLEWARE DE SEGURIDAD
# ===================================================

async def security_middleware(request: Request, call_next):
    """Middleware de seguridad para todas las requests"""
    
    # Obtener IP del cliente
    client_ip = get_remote_address(request)
    
    # Validar tamaño de request
    try:
        security_monitor.validate_request_size(request)
    except HTTPException as e:
        security_monitor.log_failed_attempt(
            client_ip, 
            str(request.url), 
            "Request too large"
        )
        raise e
    
    # Verificar headers sospechosos
    user_agent = request.headers.get("user-agent", "")
    if not user_agent or len(user_agent) < 10:
        security_monitor.log_failed_attempt(
            client_ip,
            str(request.url),
            "Suspicious or missing User-Agent"
        )
    
    # Procesar request
    response = await call_next(request)
    
    # Log de acceso exitoso
    security_logger.info(
        f"Access from {client_ip} to {request.url.path} - Status: {response.status_code}"
    )
    
    return response

# ===================================================
# 🛠️ DECORADORES DE SEGURIDAD
# ===================================================

def require_https(func):
    """Decorador que requiere HTTPS en producción"""
    def wrapper(request: Request, *args, **kwargs):
        if os.getenv("ENVIRONMENT") == "production":
            if request.url.scheme != "https":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="HTTPS required in production"
                )
        return func(request, *args, **kwargs)
    return wrapper

def validate_input_security(func):
    """Decorador que valida la seguridad del input"""
    async def wrapper(*args, **kwargs):
        # Buscar parámetros string en kwargs
        for key, value in kwargs.items():
            if isinstance(value, str):
                if security_monitor.check_malicious_input(value):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Malicious input detected"
                    )
        
        return await func(*args, **kwargs)
    return wrapper

# ===================================================
# 📋 FUNCIONES DE UTILIDAD
# ===================================================

def get_client_ip(request: Request) -> str:
    """Obtiene la IP real del cliente considerando proxies"""
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip
    
    return get_remote_address(request)

def is_internal_ip(ip: str) -> bool:
    """Verifica si la IP es interna/privada"""
    internal_ranges = [
        "10.",
        "192.168.",
        "172.16.", "172.17.", "172.18.", "172.19.",
        "172.20.", "172.21.", "172.22.", "172.23.",
        "172.24.", "172.25.", "172.26.", "172.27.",
        "172.28.", "172.29.", "172.30.", "172.31.",
        "127.",
        "localhost"
    ]
    
    return any(ip.startswith(range_ip) for range_ip in internal_ranges)

def sanitize_filename(filename: str) -> str:
    """Sanitiza nombres de archivo para prevenir path traversal"""
    # Remover caracteres peligrosos
    dangerous_chars = ["../", "..\\", "/", "\\", ":", "*", "?", '"', "<", ">", "|"]
    
    for char in dangerous_chars:
        filename = filename.replace(char, "_")
    
    return filename[:255]  # Limitar longitud 