import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EstadoProceso(str, enum.Enum):
    ACTIVO = "activo"
    EN_PAUSA = "en_pausa"
    FINALIZADO = "finalizado"


class Paciente(Base):
    __tablename__ = "pacientes"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre_completo: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    documento_identidad: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    fecha_nacimiento: Mapped[date | None] = mapped_column(Date, nullable=True)
    telefono: Mapped[str | None] = mapped_column(String(30), nullable=True)
    email: Mapped[str | None] = mapped_column(String(150), nullable=True)
    fecha_ingreso: Mapped[date] = mapped_column(Date, nullable=False)
    motivo_consulta: Mapped[str] = mapped_column(Text, nullable=False)
    estado_proceso: Mapped[EstadoProceso] = mapped_column(Enum(EstadoProceso), nullable=False, default=EstadoProceso.ACTIVO)
    observaciones_generales: Mapped[str | None] = mapped_column(Text, nullable=True)

    creado_por_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    sesiones = relationship("Sesion", back_populates="paciente", order_by="Sesion.fecha.desc()")
