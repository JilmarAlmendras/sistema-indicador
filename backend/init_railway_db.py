#!/usr/bin/env python3
"""
Script para inicializar las tablas en Railway PostgreSQL
"""

import os
import sys
from sqlalchemy import create_engine

# Agregar el directorio padre al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base
from app.models.indicador import Indicador, Hito

def init_database():
    """Inicializar las tablas en Railway PostgreSQL"""
    print("🚀 Inicializando base de datos en Railway...")
    
    # Obtener DATABASE_URL de Railway
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL no encontrada")
        print("Este script debe ejecutarse en Railway con: railway run python init_railway_db.py")
        return False
    
    print(f"✅ Conectando a PostgreSQL Railway...")
    print(f"🔗 URL: {database_url[:50]}...")
    
    try:
        # Convertir postgres:// a postgresql:// si es necesario
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        # Crear engine
        engine = create_engine(database_url)
        
        # Crear todas las tablas
        print("🏗️  Creando tablas...")
        Base.metadata.create_all(bind=engine)
        
        # Verificar que las tablas se crearon
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"✅ Tablas creadas exitosamente:")
        for table in tables:
            print(f"  📋 {table}")
        
        print(f"\n🎉 ¡Base de datos inicializada!")
        print("🔄 Ahora puedes ejecutar: railway run python cargar_datos.py")
        
        return True
        
    except Exception as e:
        print(f"❌ Error al crear tablas: {e}")
        return False

if __name__ == "__main__":
    success = init_database()
    if not success:
        sys.exit(1) 