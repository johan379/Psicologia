from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, requiere_rol, usuario_actual
from app.models.usuario import RolUsuario, Usuario
from app.schemas.pacientes import PacienteActualizar, PacienteCrear, PacienteResponse, PacientesPaginados
from app.services import auditoria as srv_auditoria
from app.services import pacientes as srv_pacientes

# Datos clínicos: exclusivo de PSICOLOGO. SUPERADMIN administra cuentas pero
# no participa de los flujos operativos (ver app/models/usuario.py).
router = APIRouter(prefix="/pacientes", tags=["Pacientes"], dependencies=[Depends(requiere_rol(RolUsuario.PSICOLOGO))])


@router.post("", response_model=PacienteResponse, status_code=status.HTTP_201_CREATED)
def crear_paciente(
    datos: PacienteCrear, db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual)
) -> PacienteResponse:
    paciente = srv_pacientes.crear_paciente(db, datos, usuario_id=usuario.id)
    srv_auditoria.registrar(db, usuario_id=usuario.id, accion="crear_paciente", entidad="paciente", entidad_id=paciente.id)
    db.commit()
    return srv_pacientes.obtener_paciente(db, paciente.id, usuario_id=usuario.id)


@router.get("", response_model=PacientesPaginados)
def listar_pacientes(
    busqueda: str = "", skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual),
) -> PacientesPaginados:
    return srv_pacientes.listar_pacientes(db, usuario_id=usuario.id, busqueda=busqueda, skip=skip, limit=limit)


@router.get("/{paciente_id}", response_model=PacienteResponse)
def obtener_paciente(
    paciente_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual)
) -> PacienteResponse:
    return srv_pacientes.obtener_paciente(db, paciente_id, usuario_id=usuario.id)


@router.put("/{paciente_id}", response_model=PacienteResponse)
def actualizar_paciente(
    paciente_id: int, datos: PacienteActualizar, db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual)
) -> PacienteResponse:
    respuesta = srv_pacientes.actualizar_paciente(db, paciente_id, datos, usuario_id=usuario.id)
    srv_auditoria.registrar(db, usuario_id=usuario.id, accion="editar_paciente", entidad="paciente", entidad_id=paciente_id)
    db.commit()
    return respuesta
