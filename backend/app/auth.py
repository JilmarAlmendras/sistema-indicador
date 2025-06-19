"""
🔒 Módulo de Autenticación y Seguridad
Implementa JWT tokens, hash de passwords y validaciones de seguridad
"""

from datetime import datetime, timedelta
from typing import Optional, Union
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .database import get_db

# ===================================================
# 🔧 CONFIGURACIÓN DE SEGURIDAD
# ===================================================

# Configuración JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Context para hash de passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ===================================================
# 📋 MODELOS PYDANTIC
# ===================================================

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

# ===================================================
# 🛠️ FUNCIONES AUXILIARES
# ===================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que la contraseña coincida con el hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera hash de la contraseña"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un token JWT de acceso"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ===================================================
# 👤 GESTIÓN DE USUARIOS (Mock - Reemplazar con DB real)
# ===================================================

# Base de datos mock de usuarios (reemplazar con DB real)
fake_users_db = {
    "admin": {
        "username": "admin",
        "full_name": "Administrador del Sistema",
        "email": "admin@indicadores.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # secret
        "disabled": False,
    },
    "user": {
        "username": "user",
        "full_name": "Usuario del Sistema",
        "email": "user@indicadores.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # secret
        "disabled": False,
    }
}

def get_user(username: str):
    """Obtiene usuario de la base de datos"""
    if username in fake_users_db:
        user_dict = fake_users_db[username]
        return UserInDB(**user_dict)

def authenticate_user(username: str, password: str):
    """Autentica usuario verificando credenciales"""
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# ===================================================
# 🔐 DEPENDENCIAS DE AUTENTICACIÓN
# ===================================================

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Obtiene el usuario actual desde el token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Obtiene el usuario activo actual"""
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Usuario inactivo")
    return current_user

# ===================================================
# 🔒 VALIDACIONES DE SEGURIDAD ADICIONALES
# ===================================================

def validate_password_strength(password: str) -> bool:
    """Valida que la contraseña sea fuerte"""
    if len(password) < 8:
        return False
    if not any(c.isupper() for c in password):
        return False
    if not any(c.islower() for c in password):
        return False
    if not any(c.isdigit() for c in password):
        return False
    return True

def is_safe_url(url: str) -> bool:
    """Valida que la URL sea segura"""
    allowed_domains = [
        "sistema-indicadores-production.up.railway.app",
        "localhost",
        "127.0.0.1"
    ]
    return any(domain in url for domain in allowed_domains) 