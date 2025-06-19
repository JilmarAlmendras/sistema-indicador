from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración simplificada para Railway
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Railway o producción con DATABASE_URL
    print(f"✅ Usando DATABASE_URL: {DATABASE_URL[:50]}...")
    
    # Convertir postgres:// a postgresql:// si es necesario
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        print("🔄 Convertido postgres:// a postgresql://")
    
    # Configuración para Railway PostgreSQL
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300
    )
    
else:
    # Desarrollo local - usar SQLite como fallback
    print("⚠️ DATABASE_URL no encontrada, usando SQLite para desarrollo")
    DATABASE_URL = "sqlite:///./indicadores.db"
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 