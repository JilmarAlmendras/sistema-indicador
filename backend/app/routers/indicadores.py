from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.crud.indicador import get_indicadores, get_indicador, create_indicador, update_indicador, delete_indicador, get_indicadores_by_area, get_estadisticas
from app.schemas.indicador import Indicador, IndicadorCreate, IndicadorUpdate
import json

router = APIRouter(
    prefix="/indicadores",
    tags=["indicadores"]
)

@router.post("/", response_model=Indicador)
def create_indicador_endpoint(indicador: IndicadorCreate, db: Session = Depends(get_db)):
    return create_indicador(db, indicador)

@router.get("/", response_model=List[Indicador])
def read_indicadores_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    indicadores = get_indicadores(db, skip=skip, limit=limit)
    
    # Convertir a dict para serialización manual
    data = []
    for indicador in indicadores:
        indicador_dict = {
            "id": indicador.id,
            "vp": indicador.vp,
            "area": indicador.area,
            "nombreIndicador": indicador.nombreIndicador,
            "tipoIndicador": indicador.tipoIndicador,
            "fechaInicioGeneral": indicador.fechaInicioGeneral.isoformat() if indicador.fechaInicioGeneral else None,
            "fechaFinalizacionGeneral": indicador.fechaFinalizacionGeneral.isoformat() if indicador.fechaFinalizacionGeneral else None,
            "responsableGeneral": indicador.responsableGeneral,
            "responsableCargaGeneral": indicador.responsableCargaGeneral,
            "created_at": indicador.created_at.isoformat() if indicador.created_at else None,
            "updated_at": indicador.updated_at.isoformat() if indicador.updated_at else None,
            "hitos": []
        }
        
        # Agregar hitos
        for hito in indicador.hitos:
            hito_dict = {
                "id": hito.id,
                "idHito": hito.id,  # Compatibilidad con frontend
                "indicador_id": hito.indicador_id,
                "nombreHito": hito.nombreHito,
                "fechaInicioHito": hito.fechaInicioHito.isoformat() if hito.fechaInicioHito else None,
                "fechaFinalizacionHito": hito.fechaFinalizacionHito.isoformat() if hito.fechaFinalizacionHito else None,
                "avanceHito": hito.avanceHito,
                "estadoHito": hito.estadoHito,
                "responsableHito": hito.responsableHito,
                "created_at": hito.created_at.isoformat() if hito.created_at else None,
                "updated_at": hito.updated_at.isoformat() if hito.updated_at else None,
            }
            indicador_dict["hitos"].append(hito_dict)
        
        data.append(indicador_dict)
    
    # Devolver respuesta JSON con UTF-8 explícito
    return JSONResponse(
        content=data,
        headers={"Content-Type": "application/json; charset=utf-8"}
    )

@router.get("/area/{area}", response_model=List[Indicador])
def read_indicadores_by_area(area: str, db: Session = Depends(get_db)):
    return get_indicadores_by_area(db, area=area)

@router.get("/{indicador_id}", response_model=Indicador)
def read_indicador_endpoint(indicador_id: int, db: Session = Depends(get_db)):
    db_indicador = get_indicador(db, indicador_id=indicador_id)
    if db_indicador is None:
        raise HTTPException(status_code=404, detail="Indicador not found")
    return db_indicador

@router.put("/{indicador_id}", response_model=Indicador)
def update_indicador_endpoint(indicador_id: int, indicador: IndicadorUpdate, db: Session = Depends(get_db)):
    db_indicador = update_indicador(db, indicador_id=indicador_id, indicador=indicador)
    if db_indicador is None:
        raise HTTPException(status_code=404, detail="Indicador not found")
    return db_indicador

@router.delete("/{indicador_id}")
def delete_indicador_endpoint(indicador_id: int, db: Session = Depends(get_db)):
    db_indicador = delete_indicador(db, indicador_id=indicador_id)
    if db_indicador is None:
        raise HTTPException(status_code=404, detail="Indicador not found")
    return {"ok": True}

@router.get("/estadisticas/dashboard")
def get_estadisticas_endpoint(db: Session = Depends(get_db)):
    return get_estadisticas(db)

@router.post("/cargar-datos")
def cargar_datos_endpoint(db: Session = Depends(get_db)):
    """Endpoint para cargar DATOS REALES de la organización (del Excel original)"""
    try:
        # Importar y ejecutar la función de carga de datos reales
        import sys
        import os
        
        # Agregar directorio padre al path
        parent_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        sys.path.append(parent_dir)
        
        from cargar_datos import verificar_y_cargar_datos_automatico
        
        # Ejecutar carga automática
        result = verificar_y_cargar_datos_automatico()
        
        if result:
            return {
                "success": True,
                "message": "Datos reales de la organización cargados correctamente",
                "data_loaded": True
            }
        else:
            return {
                "success": True,
                "message": "Los datos ya estaban cargados en la base de datos",
                "data_loaded": False
            }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Error cargando datos reales: {str(e)}"
        }

@router.get("/test-utf8")
def test_utf8_endpoint():
    """Endpoint de prueba para verificar UTF-8"""
    test_data = {
        "message": "Prueba de caracteres especiales: áéíóú ñ ü Ñ",
        "area": "Alianza Estratégica",
        "indicador": "Acreditación gestión de recursos",
        "encoding": "UTF-8",
        "status": "ok"
    }
    
    # Crear respuesta JSON con UTF-8 explícito
    return JSONResponse(
        content=test_data,
        headers={"Content-Type": "application/json; charset=utf-8"}
    ) 