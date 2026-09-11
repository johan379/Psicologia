from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, requiere_rol, usuario_actual
from app.models.usuario import RolUsuario, Usuario
from app.schemas.usuarios import RestablecerContrasena, UsuarioCrear, UsuarioResponse
from app.services import auditoria as srv_auditoria
from app.services import usuarios as srv_usuarios

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.post("", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(requiere_rol(RolUsuario.SUPERADMIN))])
def crear_usuario(
    datos: UsuarioCrear, db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual)
) -> Usuario:
    nuevo = srv_usuarios.crear_usuario(db, datos)
    srv_auditoria.registrar(db, usuario_id=usuario.id, accion="crear_usuario", entidad="usuario", entidad_id=nuevo.id)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("", response_model=list[UsuarioResponse],
            dependencies=[Depends(requiere_rol(RolUsuario.SUPERADMIN))])
def listar_usuarios(db: Session = Depends(get_db)) -> list[Usuario]:
    return srv_usuarios.listar_usuarios(db)


@router.patch("/{usuario_id}/activar", response_model=UsuarioResponse,
              dependencies=[Depends(requiere_rol(RolUsuario.SUPERADMIN))])
def activar_usuario(
    usuario_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual)
) -> Usuario:
    actualizado = srv_usuarios.cambiar_estado_usuario(db, usuario_id, activo=True, solicitante_id=usuario.id)
    srv_auditoria.registrar(db, usuario_id=usuario.id, accion="activar_usuario", entidad="usuario", entidad_id=usuario_id)
    db.commit()
    db.refresh(actualizado)
    return actualizado


@router.patch("/{usuario_id}/desactivar", response_model=UsuarioResponse,
              dependencies=[Depends(requiere_rol(RolUsuario.SUPERADMIN))])
def desactivar_usuario(
    usuario_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual)
) -> Usuario:
    actualizado = srv_usuarios.cambiar_estado_usuario(db, usuario_id, activo=False, solicitante_id=usuario.id)
    srv_auditoria.registrar(db, usuario_id=usuario.id, accion="desactivar_usuario", entidad="usuario", entidad_id=usuario_id)
    db.commit()
    db.refresh(actualizado)
    return actualizado


@router.patch("/{usuario_id}/restablecer-contrasena", response_model=UsuarioResponse,
              dependencies=[Depends(requiere_rol(RolUsuario.SUPERADMIN))])
def restablecer_contrasena(
    usuario_id: int, datos: RestablecerContrasena, db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual)
) -> Usuario:
    actualizado = srv_usuarios.restablecer_contrasena(db, usuario_id, datos.contrasena_nueva)
    srv_auditoria.registrar(db, usuario_id=usuario.id, accion="restablecer_contrasena", entidad="usuario", entidad_id=usuario_id)
    db.commit()
    db.refresh(actualizado)
    return actualizado


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(requiere_rol(RolUsuario.SUPERADMIN))])
def eliminar_usuario(
    usuario_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(usuario_actual)
) -> None:
    srv_usuarios.eliminar_usuario(db, usuario_id, solicitante_id=usuario.id)
    srv_auditoria.registrar(db, usuario_id=usuario.id, accion="eliminar_usuario", entidad="usuario", entidad_id=usuario_id)
    db.commit()
