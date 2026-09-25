from pydantic import BaseModel


class ReporteResponse(BaseModel):
    contenido: str
    total_sesiones: int
