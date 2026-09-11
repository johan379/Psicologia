from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, requiere_rol, usuario_actual
from app.models.sesion import Sesion
from app.models.usuario import RolUsuario, Usuario
from app.schemas.sesiones import SesionCrear, SesionResponse
from app.services import auditoria as srv_auditoria
from app.services import sesiones as srv_sesiones

router = APIRouter(
    prefix="/pacientes/{paciente_id}/sesiones", tags=["Sesiones"],
    dependencies=[Depends(requiere_rol(RolUsuario.PSICOLOGO))],
)


@router.post("", response_model=SesionResponse, status_code=status.HTTP_201_CREATED)
def crear_sesion(
    paciente_id: int, datos: SesionCrear, db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual)
) -> Sesion:
    sesion = srv_sesiones.crear_sesion(db, paciente_id, datos, usuario_id=usuario.id)
    srv_auditoria.registrar(db, usuario_id=usuario.id, accion="crear_sesion", entidad="sesion", entidad_id=sesion.id,
                             detalle=f"paciente_id={paciente_id}")
    db.commit()
    db.refresh(sesion)
    return sesion


@router.get("", response_model=list[SesionResponse])
def listar_sesiones(
    paciente_id: int,
    desde: date | None = Query(None),
    hasta: date | None = Query(None),
    orden: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(usuario_actual),
) -> list[Sesion]:
    return srv_sesiones.listar_sesiones(db, paciente_id, usuario_id=usuario.id, desde=desde, hasta=hasta, orden=orden)
