"""Administración de cuentas de acceso — exclusivo de SUPERADMIN. No existe
un endpoint de registro público a propósito: solo una cuenta SUPERADMIN ya
autenticada puede crear otras cuentas (ver scripts/crear_superadmin.py para
la primera cuenta, creada por línea de comandos)."""

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hashear_contrasena
from app.models.auditoria import RegistroAuditoria
from app.models.paciente import Paciente
from app.models.sesion import Sesion
from app.models.usuario import Usuario
from app.schemas.usuarios import UsuarioCrear


def crear_usuario(db: Session, datos: UsuarioCrear) -> Usuario:
    existente = db.query(Usuario).filter(Usuario.correo == datos.correo).first()
    if existente is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe una cuenta con ese correo.")

    usuario = Usuario(
        correo=datos.correo,
        contrasena_hash=hashear_contrasena(datos.contrasena),
        rol=datos.rol,
        activo=True,
    )
    db.add(usuario)
    db.flush()
    return usuario


def listar_usuarios(db: Session) -> list[Usuario]:
    return db.query(Usuario).order_by(Usuario.correo.asc()).all()


def cambiar_estado_usuario(db: Session, usuario_id: int, *, activo: bool, solicitante_id: int) -> Usuario:
    if usuario_id == solicitante_id and not activo:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes desactivar tu propia cuenta.")

    usuario = db.get(Usuario, usuario_id)
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

    usuario.activo = activo
    db.flush()
    return usuario


def restablecer_contrasena(db: Session, usuario_id: int, contrasena_nueva: str) -> Usuario:
    usuario = db.get(Usuario, usuario_id)
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    if not contrasena_nueva.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La contraseña no puede estar vacía.")

    usuario.contrasena_hash = hashear_contrasena(contrasena_nueva)
    db.flush()
    return usuario


def eliminar_usuario(db: Session, usuario_id: int, *, solicitante_id: int) -> None:
    if usuario_id == solicitante_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes eliminar tu propia cuenta.")

    usuario = db.get(Usuario, usuario_id)
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

    # SUPERADMIN puede eliminar cualquier cuenta, siempre. Lo que nunca se
    # borra es la información clínica que esa cuenta haya generado: los
    # pacientes, sesiones y filas de auditoría a su nombre se conservan
    # intactos, solo quedan sin autor (creado_por_id / usuario_id a NULL)
    # en vez de desaparecer con la cuenta.
    db.query(Paciente).filter(Paciente.creado_por_id == usuario_id).update({"creado_por_id": None})
    db.query(Sesion).filter(Sesion.creado_por_id == usuario_id).update({"creado_por_id": None})
    db.query(RegistroAuditoria).filter(RegistroAuditoria.usuario_id == usuario_id).update({"usuario_id": None})

    db.delete(usuario)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo eliminar la cuenta por una referencia inesperada. Intenta desactivarla en su lugar.",
        ) from None
