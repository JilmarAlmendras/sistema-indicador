from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List

class HitoBase(BaseModel):
    nombreHito: str
    fechaInicioHito: date
    fechaFinalizacionHito: date
    avanceHito: float = 0
    estadoHito: str
    responsableHito: str

class HitoCreate(HitoBase):
    pass

class Hito(HitoBase):
    id: int
    indicador_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IndicadorBase(BaseModel):
    vp: str
    area: str
    nombreIndicador: str
    tipoIndicador: str
    fechaInicioGeneral: date
    fechaFinalizacionGeneral: date
    responsableGeneral: str
    responsableCargaGeneral: Optional[str] = None

class IndicadorCreate(IndicadorBase):
    hitos: List[HitoCreate]

class Indicador(IndicadorBase):
    id: int
    created_at: datetime
    updated_at: datetime
    hitos: List[Hito] = []

    class Config:
        from_attributes = True

class IndicadorUpdate(BaseModel):
    vp: Optional[str] = None
    area: Optional[str] = None
    nombreIndicador: Optional[str] = None
    tipoIndicador: Optional[str] = None
    fechaInicioGeneral: Optional[date] = None
    fechaFinalizacionGeneral: Optional[date] = None
    responsableGeneral: Optional[str] = None
    responsableCargaGeneral: Optional[str] = None 