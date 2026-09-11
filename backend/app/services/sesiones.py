"""Historial de sesiones de un paciente: alta y consulta filtrada por fecha.

`numero_sesion` se calcula una única vez al crear la sesión (conteo de
sesiones previas + 1) y queda fijo — es la numeración histórica del
proceso terapéutico, no se recalcula si se borran sesiones anteriores."""

from datetime import date, datetime, time

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.paciente import Paciente
from app.models.sesion import Sesion
from app.schemas.sesiones import SesionCrear


def _verificar_paciente_propio(db: Session, paciente_id: int, usuario_id: int) -> None:
    # Misma regla que en services/pacientes.py: un paciente que no es tuyo
    # (incluido uno huérfano de una cuenta eliminada) es 404, no 403.
    paciente = db.get(Paciente, paciente_id)
    if paciente is None or paciente.creado_por_id != usuario_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente no encontrado.")


def crear_sesion(db: Session, paciente_id: int, datos: SesionCrear, *, usuario_id: int) -> Sesion:
    _verificar_paciente_propio(db, paciente_id, usuario_id)

    numero_sesion = (db.query(func.count(Sesion.id)).filter(Sesion.paciente_id == paciente_id).scalar() or 0) + 1
    sesion = Sesion(paciente_id=paciente_id, numero_sesion=numero_sesion, creado_por_id=usuario_id, **datos.model_dump())
    db.add(sesion)
    db.flush()
    return sesion


def listar_sesiones(
    db: Session, paciente_id: int, *, usuario_id: int, desde: date | None, hasta: date | None, orden: str
) -> list[Sesion]:
    _verificar_paciente_propio(db, paciente_id, usuario_id)

    consulta = db.query(Sesion).filter(Sesion.paciente_id == paciente_id)
    if desde:
        consulta = consulta.filter(Sesion.fecha >= datetime.combine(desde, time.min))
    if hasta:
        consulta = consulta.filter(Sesion.fecha <= datetime.combine(hasta, time.max))
    orden_columna = Sesion.fecha.asc() if orden == "asc" else Sesion.fecha.desc()
    return consulta.order_by(orden_columna).all()
