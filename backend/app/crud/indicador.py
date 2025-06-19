from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.indicador import Indicador, Hito
from ..schemas.indicador import IndicadorCreate, IndicadorUpdate, HitoCreate

def get_indicador(db: Session, indicador_id: int):
    return db.query(Indicador).filter(Indicador.id == indicador_id).first()

def get_indicadores(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Indicador).offset(skip).limit(limit).all()

def get_indicadores_by_area(db: Session, area: str):
    return db.query(Indicador).filter(Indicador.area == area).all()

def create_indicador(db: Session, indicador: IndicadorCreate):
    db_indicador = Indicador(
        vp=indicador.vp,
        area=indicador.area,
        nombreIndicador=indicador.nombreIndicador,
        tipoIndicador=indicador.tipoIndicador,
        fechaInicioGeneral=indicador.fechaInicioGeneral,
        fechaFinalizacionGeneral=indicador.fechaFinalizacionGeneral,
        responsableGeneral=indicador.responsableGeneral,
        responsableCargaGeneral=indicador.responsableCargaGeneral
    )
    db.add(db_indicador)
    db.flush()

    for hito in indicador.hitos:
        db_hito = Hito(
            indicador_id=db_indicador.id,
            nombreHito=hito.nombreHito,
            fechaInicioHito=hito.fechaInicioHito,
            fechaFinalizacionHito=hito.fechaFinalizacionHito,
            avanceHito=hito.avanceHito,
            estadoHito=hito.estadoHito,
            responsableHito=hito.responsableHito
        )
        db.add(db_hito)

    db.commit()
    db.refresh(db_indicador)
    return db_indicador

def update_indicador(db: Session, indicador_id: int, indicador: IndicadorUpdate):
    db_indicador = get_indicador(db, indicador_id)
    if not db_indicador:
        return None

    update_data = indicador.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_indicador, field, value)

    db.commit()
    db.refresh(db_indicador)
    return db_indicador

def delete_indicador(db: Session, indicador_id: int):
    db_indicador = get_indicador(db, indicador_id)
    if not db_indicador:
        return None

    db.delete(db_indicador)
    db.commit()
    return db_indicador

def get_estadisticas(db: Session):
    total_indicadores = db.query(func.count(Indicador.id)).scalar()
    total_hitos = db.query(func.count(Hito.id)).scalar()
    hitos_completados = db.query(func.count(Hito.id)).filter(Hito.estadoHito == "Completado").scalar()
    hitos_en_progreso = db.query(func.count(Hito.id)).filter(Hito.estadoHito == "En Progreso").scalar()
    hitos_por_comenzar = db.query(func.count(Hito.id)).filter(Hito.estadoHito == "Por Comenzar").scalar()
    promedio_avance = db.query(func.avg(Hito.avanceHito)).scalar() or 0

    return {
        "totalIndicadores": total_indicadores,
        "totalHitos": total_hitos,
        "hitosCompletados": hitos_completados,
        "hitosEnProgreso": hitos_en_progreso,
        "hitosPorComenzar": hitos_por_comenzar,
        "promedioAvance": round(promedio_avance, 2)
    } 