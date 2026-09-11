"""Registro de acciones sensibles sobre datos clínicos (requisito de
privacidad). Se llama desde las rutas después de cada acción confirmada;
no hace commit — queda dentro de la misma transacción que la acción."""

from sqlalchemy.orm import Session

from app.models.auditoria import RegistroAuditoria


def registrar(db: Session, *, usuario_id: int | None, accion: str, entidad: str,
              entidad_id: int | None = None, detalle: str | None = None) -> None:
    db.add(RegistroAuditoria(
        usuario_id=usuario_id, accion=accion, entidad=entidad,
        entidad_id=entidad_id, detalle=detalle,
    ))
