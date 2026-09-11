from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.fechas import ModeloConFechasUtc


class SesionCrear(BaseModel):
    fecha: datetime
    motivo_tema: str
    descripcion_notas: str
    observaciones: str | None = None
    intervenciones_realizadas: str | None = None
    evolucion_paciente: str | None = None
    tareas_recomendaciones: str | None = None
    notas_adicionales: str | None = None


class SesionResponse(ModeloConFechasUtc):
    model_config = ConfigDict(from_attributes=True)

    id: int
    paciente_id: int
    numero_sesion: int
    fecha: datetime
    motivo_tema: str
    descripcion_notas: str
    observaciones: str | None
    intervenciones_realizadas: str | None
    evolucion_paciente: str | None
    tareas_recomendaciones: str | None
    notas_adicionales: str | None
    created_at: datetime
