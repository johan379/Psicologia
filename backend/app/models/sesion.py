from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Sesion(Base):
    """Una sesión terapéutica registrada para un paciente. `numero_sesion` se
    calcula una sola vez al crearla (services/sesiones.py) y queda fijo:
    es la numeración histórica del proceso, no se recalcula después."""

    __tablename__ = "sesiones"

    id: Mapped[int] = mapped_column(primary_key=True)
    paciente_id: Mapped[int] = mapped_column(ForeignKey("pacientes.id"), nullable=False, index=True)
    numero_sesion: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    motivo_tema: Mapped[str] = mapped_column(String(255), nullable=False)
    descripcion_notas: Mapped[str] = mapped_column(Text, nullable=False)
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    intervenciones_realizadas: Mapped[str | None] = mapped_column(Text, nullable=True)
    evolucion_paciente: Mapped[str | None] = mapped_column(Text, nullable=True)
    tareas_recomendaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    notas_adicionales: Mapped[str | None] = mapped_column(Text, nullable=True)

    creado_por_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    paciente = relationship("Paciente", back_populates="sesiones")
