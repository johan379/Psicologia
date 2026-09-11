"""Serialización consistente de fechas para clientes web."""

from datetime import datetime, timezone

from pydantic import BaseModel, field_serializer


class ModeloConFechasUtc(BaseModel):
    """MySQL puede devolver DATETIME sin zona; en esta app se guarda en UTC."""

    @field_serializer("fecha", "created_at", "updated_at", "ultima_sesion_fecha", check_fields=False, when_used="json")
    def serializar_fecha_utc(self, valor: datetime | None) -> str | None:
        if valor is None:
            return None
        if valor.tzinfo is None:
            valor = valor.replace(tzinfo=timezone.utc)
        return valor.isoformat().replace("+00:00", "Z")
