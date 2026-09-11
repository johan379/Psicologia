import enum

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RolUsuario(str, enum.Enum):
    # No participa de los flujos clínicos (pacientes/sesiones) — solo
    # administra qué cuentas existen. Separado a propósito: quien gestiona
    # accesos no necesita ver información clínica privada.
    SUPERADMIN = "superadmin"
    PSICOLOGO = "psicologo"


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    correo: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    contrasena_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[RolUsuario] = mapped_column(Enum(RolUsuario), nullable=False, default=RolUsuario.PSICOLOGO)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
