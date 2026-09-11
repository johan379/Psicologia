from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.paciente import EstadoProceso
from app.schemas.fechas import ModeloConFechasUtc


class PacienteCrear(BaseModel):
    nombre_completo: str
    documento_identidad: str | None = None
    fecha_nacimiento: date | None = None
    telefono: str | None = None
    email: str | None = None
    fecha_ingreso: date
    motivo_consulta: str
    observaciones_generales: str | None = None


class PacienteActualizar(BaseModel):
    nombre_completo: str
    documento_identidad: str | None = None
    fecha_nacimiento: date | None = None
    telefono: str | None = None
    email: str | None = None
    motivo_consulta: str
    estado_proceso: EstadoProceso
    observaciones_generales: str | None = None


class PacienteResponse(ModeloConFechasUtc):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre_completo: str
    documento_identidad: str | None
    fecha_nacimiento: date | None
    telefono: str | None
    email: str | None
    fecha_ingreso: date
    motivo_consulta: str
    estado_proceso: EstadoProceso
    observaciones_generales: str | None
    total_sesiones: int
    ultima_sesion_fecha: datetime | None
    created_at: datetime
    updated_at: datetime


class PacientesPaginados(BaseModel):
    items: list[PacienteResponse]
    total: int
    pagina: int
    total_paginas: int
