#!/usr/bin/env python3
"""
Script corregido para cargar datos reales con fechas específicas por hito
Lee fechas individuales del Excel para cada hito
"""

import sys
import os
import pandas as pd
from datetime import datetime, date

# Agregar el directorio padre al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.indicador import Indicador, Hito
from app.database import Base

def get_database_url():
    """Obtener URL de base de datos de variable de entorno o usar SQLite local"""
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        print(f"✅ Conectado a PostgreSQL Railway")
        return database_url
    else:
        print(f"✅ Conectado a PostgreSQL local")
        return "sqlite:///./indicadores.db"

def crear_session():
    """Crear sesión de base de datos"""
    database_url = get_database_url()
    print(f"🔗 Conectando a base de datos...")
    
    engine = create_engine(database_url)
    
    # Crear tablas si no existen
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal(), engine

def convertir_fecha(fecha_valor):
    """Convertir fecha de Excel a datetime"""
    if pd.isna(fecha_valor):
        return None
    
    if isinstance(fecha_valor, str):
        try:
            return datetime.strptime(fecha_valor, '%Y-%m-%d').date()
        except:
            return None
    
    if hasattr(fecha_valor, 'date'):
        return fecha_valor.date()
    
    return fecha_valor

def verificar_y_cargar_datos_automatico():
    """Verificar si hay datos y cargar automáticamente si está vacío"""
    try:
        session, engine = crear_session()
        
        # Verificar si ya hay datos
        count_indicadores = session.query(Indicador).count()
        print(f"📊 Indicadores existentes: {count_indicadores}")
        
        if count_indicadores > 0:
            print("✅ Ya hay datos en la base. No es necesario cargar.")
            return False
        
        print("🔄 Base de datos vacía. Cargando datos automáticamente...")
        
        # Buscar archivo Excel en múltiples ubicaciones
        excel_files_to_try = [
            'Base de datos.xlsx',
            './Base de datos.xlsx', 
            'backend/Base de datos.xlsx',
            os.path.join(os.path.dirname(__file__), 'Base de datos.xlsx'),
            '/app/backend/Base de datos.xlsx'  # Railway path
        ]
        
        excel_file = None
        for file_path in excel_files_to_try:
            if os.path.exists(file_path):
                excel_file = file_path
                print(f"✅ Archivo encontrado en: {file_path}")
                break
        
        if not excel_file:
            print(f"❌ No se encuentra el archivo 'Base de datos.xlsx' en ninguna ubicación:")
            for path in excel_files_to_try:
                print(f"   - {path}")
            return False
        
        # Cargar datos usando la función principal
        return cargar_datos_desde_excel(excel_file, session, limpiar_existentes=False)
        
    except Exception as e:
        print(f"❌ Error en verificación automática: {e}")
        return False
    finally:
        if 'session' in locals():
            session.close()

def cargar_datos_desde_excel(excel_file='Base de datos.xlsx', session=None, limpiar_existentes=True):
    """Función unificada para cargar datos desde Excel"""
    session_propia = session is None
    
    try:
        if session_propia:
            session, engine = crear_session()
            print("✅ Conectado a Railway!")
        
        # Leer Excel
        print(f"📊 Leyendo archivo Excel: {excel_file}")
        df = pd.read_excel(excel_file)
        print(f"📋 Datos leídos: {len(df)} filas")
        
        # Corrección específica para fecha problemática
        fecha_problema = df['Fecha Finalizacion'].astype(str).str.contains('1900', na=False)
        if fecha_problema.any():
            print("🔧 Detectada fecha problemática 1900-01-10, corrigiendo a 2025-12-31...")
            df.loc[fecha_problema, 'Fecha Finalizacion'] = '2025-12-31'
            print("✅ Fecha corregida automáticamente")
        
        if limpiar_existentes:
            print("🗑️  Limpiando datos existentes...")
            session.query(Hito).delete()
            session.query(Indicador).delete()
            session.commit()
            print("✅ Datos limpiados")
        
        # Agrupar por indicador
        indicadores_grupos = df.groupby('Indicador')
        
        total_indicadores = 0
        total_hitos = 0
        
        for nombre_indicador, grupo_indicador in indicadores_grupos:
            print(f"\n✅ Procesando indicador: {nombre_indicador}")
            
            # Tomar datos del primer registro para el indicador
            primera_fila = grupo_indicador.iloc[0]
            
            # Calcular fechas del indicador basadas en todos sus hitos
            fechas_inicio_hitos = grupo_indicador['Fecha de Inicio'].dropna()
            fechas_fin_hitos = grupo_indicador['Fecha Finalizacion'].dropna()
            
            fecha_inicio_general = fechas_inicio_hitos.min() if not fechas_inicio_hitos.empty else convertir_fecha(primera_fila['Fecha de Inicio'])
            fecha_fin_general = fechas_fin_hitos.max() if not fechas_fin_hitos.empty else convertir_fecha(primera_fila['Fecha Finalizacion'])
            
            # Crear indicador
            indicador = Indicador(
                vp=primera_fila['VP'],
                area=primera_fila['Area'],
                nombreIndicador=nombre_indicador,
                tipoIndicador=primera_fila['Tipo Indicador'],
                fechaInicioGeneral=fecha_inicio_general,
                fechaFinalizacionGeneral=fecha_fin_general,
                responsableGeneral=primera_fila['Responsable'],
                responsableCargaGeneral=primera_fila['Responsable de Carga']
            )
            
            session.add(indicador)
            session.flush()  # Para obtener el ID
            
            # Crear hitos con fechas específicas
            for _, fila_hito in grupo_indicador.iterrows():
                # Usar fechas específicas del hito o las del indicador como fallback
                fecha_inicio_hito = convertir_fecha(fila_hito['Fecha de Inicio']) or fecha_inicio_general
                fecha_fin_hito = convertir_fecha(fila_hito['Fecha Finalizacion']) or fecha_fin_general
                
                hito = Hito(
                    indicador_id=indicador.id,
                    nombreHito=fila_hito['Hito'],
                    fechaInicioHito=fecha_inicio_hito,
                    fechaFinalizacionHito=fecha_fin_hito,
                    avanceHito=fila_hito.get('Avance (%)', 0),
                    estadoHito=fila_hito['Estado'],
                    responsableHito=fila_hito['Responsable']
                )
                
                session.add(hito)
                total_hitos += 1
                
                print(f"  📌 Hito: {hito.nombreHito}")
                print(f"     📅 {fecha_inicio_hito} → {fecha_fin_hito}")
                print(f"     📊 {hito.avanceHito}% - {hito.estadoHito}")
            
            total_indicadores += 1
        
        session.commit()
        
        print(f"\n🎉 ¡DATOS CARGADOS EN RAILWAY!")
        print(f"📊 Total indicadores: {total_indicadores}")
        print(f"🎯 Total hitos: {total_hitos}")
        
        # Verificar algunas fechas específicas
        print(f"\n🔍 VERIFICACIÓN DE FECHAS ESPECÍFICAS:")
        nueva_estrategia = session.query(Indicador).filter(Indicador.nombreIndicador.like('%Nueva Estrategia%')).first()
        if nueva_estrategia:
            print(f"Nueva Estrategia: {nueva_estrategia.fechaInicioGeneral} → {nueva_estrategia.fechaFinalizacionGeneral}")
            hitos_muestra = session.query(Hito).filter(Hito.indicador_id == nueva_estrategia.id).limit(3).all()
            for hito in hitos_muestra:
                print(f"  {hito.nombreHito}: {hito.fechaInicioHito} → {hito.fechaFinalizacionHito}")
        
        print("🚀 ¡Ya puedes verificar los datos en Railway!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        if 'session' in locals():
            session.rollback()
        return False
    finally:
        if session_propia and 'session' in locals():
            session.close()

def main():
    """Función principal para carga manual de datos"""
    print("=" * 50)
    print("📖 Cargando datos reales a Railway...")
    
    resultado = cargar_datos_desde_excel(limpiar_existentes=True)
    
    if resultado:
        print("=" * 50)
    else:
        print("❌ Error en la carga de datos")

if __name__ == "__main__":
    main() 