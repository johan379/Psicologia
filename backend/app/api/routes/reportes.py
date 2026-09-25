"""Reporte integrado de un paciente generado con IA a partir de todas sus
sesiones registradas (ver app/services/ia.py)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, requiere_rol, usuario_actual
from app.models.paciente import Paciente
from app.models.usuario import RolUsuario, Usuario
from app.schemas.reportes import ReporteResponse
from app.services import ia as srv_ia
from app.services import sesiones as srv_sesiones

router = APIRouter(
    prefix="/pacientes/{paciente_id}/reporte", tags=["Reportes"],
    dependencies=[Depends(requiere_rol(RolUsuario.PSICOLOGO))],
)


@router.get("", response_model=ReporteResponse)
def generar_reporte(
    paciente_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual)
) -> ReporteResponse:
    # listar_sesiones ya valida que el paciente exista y sea del usuario actual.
    sesiones = srv_sesiones.listar_sesiones(db, paciente_id, usuario_id=usuario.id, desde=None, hasta=None, orden="asc")
    if not sesiones:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "El paciente no tiene sesiones registradas todavía.")

    paciente = db.get(Paciente, paciente_id)

    try:
        contenido = srv_ia.generar_reporte_integrado(paciente, sesiones)
    except ValueError as err:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(err)) from err

    return ReporteResponse(contenido=contenido, total_sesiones=len(sesiones))
