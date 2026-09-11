"""Gestión de pacientes: alta, búsqueda paginada, perfil y edición.

`total_sesiones` y `ultima_sesion_fecha` no se guardan en la tabla — se
calculan aquí a partir de `sesiones` para que nunca queden desincronizados
del historial real."""

import math

from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.paciente import Paciente
from app.models.sesion import Sesion
from app.schemas.pacientes import PacienteActualizar, PacienteCrear, PacienteResponse, PacientesPaginados

LIMITE_POR_DEFECTO = 20


def _agregados_sesiones(db: Session, paciente_id: int) -> tuple[int, object | None]:
    total = db.query(func.count(Sesion.id)).filter(Sesion.paciente_id == paciente_id).scalar() or 0
    ultima = db.query(func.max(Sesion.fecha)).filter(Sesion.paciente_id == paciente_id).scalar()
    return total, ultima


def _construir_response(db: Session, paciente: Paciente) -> PacienteResponse:
    total_sesiones, ultima_sesion_fecha = _agregados_sesiones(db, paciente.id)
    return PacienteResponse(
        id=paciente.id,
        nombre_completo=paciente.nombre_completo,
        documento_identidad=paciente.documento_identidad,
        fecha_nacimiento=paciente.fecha_nacimiento,
        telefono=paciente.telefono,
        email=paciente.email,
        fecha_ingreso=paciente.fecha_ingreso,
        motivo_consulta=paciente.motivo_consulta,
        estado_proceso=paciente.estado_proceso,
        observaciones_generales=paciente.observaciones_generales,
        total_sesiones=total_sesiones,
        ultima_sesion_fecha=ultima_sesion_fecha,
        created_at=paciente.created_at,
        updated_at=paciente.updated_at,
    )


def crear_paciente(db: Session, datos: PacienteCrear, *, usuario_id: int) -> Paciente:
    paciente = Paciente(**datos.model_dump(), creado_por_id=usuario_id)
    db.add(paciente)
    db.flush()
    return paciente


def listar_pacientes(db: Session, *, usuario_id: int, busqueda: str, skip: int, limit: int = LIMITE_POR_DEFECTO) -> PacientesPaginados:
    # Cada psicólogo ve únicamente los pacientes que ella misma dio de alta.
    # Un paciente de una cuenta eliminada (creado_por_id NULL) no se le
    # muestra a nadie más: sigue guardado, pero no "pasa" a otra cuenta.
    consulta = db.query(Paciente).filter(Paciente.creado_por_id == usuario_id)
    if busqueda:
        termino = f"%{busqueda}%"
        consulta = consulta.filter(or_(
            Paciente.nombre_completo.ilike(termino),
            Paciente.documento_identidad.ilike(termino),
        ))
    total = consulta.count()
    pacientes = consulta.order_by(Paciente.nombre_completo.asc()).offset(skip).limit(limit).all()

    return PacientesPaginados(
        items=[_construir_response(db, p) for p in pacientes],
        total=total,
        pagina=(skip // limit) + 1 if limit else 1,
        total_paginas=max(1, math.ceil(total / limit)) if limit else 1,
    )


def _obtener_paciente_propio(db: Session, paciente_id: int, usuario_id: int) -> Paciente:
    # 404 (no 403) también cuando existe pero es de otro dueño: no delata
    # que el paciente existe en otra cuenta.
    paciente = db.get(Paciente, paciente_id)
    if paciente is None or paciente.creado_por_id != usuario_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente no encontrado.")
    return paciente


def obtener_paciente(db: Session, paciente_id: int, *, usuario_id: int) -> PacienteResponse:
    paciente = _obtener_paciente_propio(db, paciente_id, usuario_id)
    return _construir_response(db, paciente)


def actualizar_paciente(db: Session, paciente_id: int, datos: PacienteActualizar, *, usuario_id: int) -> PacienteResponse:
    paciente = _obtener_paciente_propio(db, paciente_id, usuario_id)
    for campo, valor in datos.model_dump().items():
        setattr(paciente, campo, valor)
    db.flush()
    return _construir_response(db, paciente)
