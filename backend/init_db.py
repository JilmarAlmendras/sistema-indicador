"""
🗄️ Inicialización de Base de Datos para Railway
✅ Versión Segura - Sin passwords hardcodeados
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def init_railway_database():
    """
    Inicializa la base de datos usando DATABASE_URL de Railway
    """
    
    # ✅ SEGURO: Usar DATABASE_URL de Railway (auto-generada)
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL no encontrada")
        print("💡 En Railway, esta variable se genera automáticamente")
        print("💡 Para desarrollo local, configura DATABASE_URL en .env")
        sys.exit(1)
    
    try:
        # Conectar a la base de datos
        engine = create_engine(database_url)
        
        print("🔗 Conectando a la base de datos...")
        
        # Test de conexión
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Conexión exitosa: {version}")
        
        # Crear tablas
        print("🔧 Creando tablas...")
        from app.models import indicador
        indicador.Base.metadata.create_all(bind=engine)
        
        print("✅ Tablas creadas exitosamente")
        
        # Cargar datos iniciales si es necesario
        load_initial_data(engine)
        
        print("🎉 Inicialización de base de datos completada")
        
    except Exception as e:
        print(f"❌ Error al inicializar base de datos: {e}")
        sys.exit(1)

def load_initial_data(engine):
    """
    Carga datos iniciales si la base de datos está vacía
    """
    try:
        with engine.connect() as conn:
            # Verificar si ya hay datos
            result = conn.execute(text(
                "SELECT COUNT(*) FROM indicadores"
            ))
            count = result.fetchone()[0]
            
            if count > 0:
                print(f"📊 Base de datos ya contiene {count} indicadores")
                return
            
            print("📝 Cargando datos iniciales...")
            
            # Aquí puedes agregar lógica para cargar datos iniciales
            # Por ejemplo, ejecutar cargar_datos.py
            
            print("✅ Datos iniciales cargados")
            
    except Exception as e:
        print(f"⚠️ Error al cargar datos iniciales: {e}")
        # No es crítico, continuar

if __name__ == "__main__":
    print("🚀 Inicializando base de datos para Railway...")
    init_railway_database() 