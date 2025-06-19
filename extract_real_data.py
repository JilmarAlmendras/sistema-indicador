#!/usr/bin/env python3
"""
Script para extraer datos reales del Excel y convertirlos a código Python
"""

import pandas as pd
import json
from datetime import datetime

def extract_real_data():
    # Leer Excel
    df = pd.read_excel('backend/Base de datos.xlsx')
    print(f"📊 Total filas leídas: {len(df)}")
    
    # Convertir fechas a string para JSON
    def convert_dates(df):
        for col in ['Fecha de Inicio', 'Fecha Finalizacion', 'Fecha de Carga']:
            if col in df.columns:
                df[col] = df[col].apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) and hasattr(x, 'strftime') else str(x) if pd.notnull(x) else None)
        return df

    df = convert_dates(df)

    # Agrupar por indicador
    indicadores_data = []
    for indicador_name, group in df.groupby('Indicador'):
        primera_fila = group.iloc[0]
        
        indicador = {
            'vp': primera_fila['VP'],
            'area': primera_fila['Area'], 
            'nombreIndicador': indicador_name,
            'tipoIndicador': primera_fila['Tipo Indicador'],
            'responsableGeneral': primera_fila['Responsable'],
            'responsableCargaGeneral': primera_fila['Responsable de Carga'],
            'hitos': []
        }
        
        # Agregar hitos
        for _, row in group.iterrows():
            hito = {
                'nombreHito': row['Hito'],
                'fechaInicioHito': row['Fecha de Inicio'],
                'fechaFinalizacionHito': row['Fecha Finalizacion'],
                'avanceHito': int(row['Avance (%)']) if pd.notnull(row['Avance (%)']) else 0,
                'estadoHito': row['Estado'],
                'responsableHito': row['Responsable']
            }
            indicador['hitos'].append(hito)
        
        indicadores_data.append(indicador)

    # Mostrar resumen
    print(f"\n✅ DATOS REALES EXTRAÍDOS:")
    print(f"📊 Total indicadores: {len(indicadores_data)}")
    
    for i, ind in enumerate(indicadores_data[:5]):  # Primeros 5
        print(f"{i+1}. {ind['nombreIndicador']} ({len(ind['hitos'])} hitos)")
        print(f"   Área: {ind['area']} | Responsable: {ind['responsableGeneral']}")
    
    if len(indicadores_data) > 5:
        print(f"... y {len(indicadores_data) - 5} indicadores más")
    
    return indicadores_data

if __name__ == "__main__":
    data = extract_real_data()
    
    # Guardar en archivo JSON para revisión
    with open('datos_reales_extraidos.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Datos guardados en: datos_reales_extraidos.json") 