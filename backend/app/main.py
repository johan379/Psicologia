import logging
import time

from fastapi import FastAPI, Request
from fastapi import HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.router import router_api
from app.core.config import settings
from app.db.session import engine

logger = logging.getLogger("psicologia.api")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

app = FastAPI(
    title="API — Gestión de Pacientes",
    version="1.0.0",
    description="API del sistema de gestión de pacientes y sesiones.",
    # Sin esto, Swagger UI adivina la URL base para "Try it out" a partir del
    # origen del navegador -- declararla explícitamente evita que apunte a
    # localhost cuando /docs se abre contra el backend desplegado.
    servers=[{"url": settings.URL_BACKEND, "description": settings.ENTORNO}],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.lista_origenes_permitidos,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_api)


@app.middleware("http")
async def registrar_solicitud(request: Request, call_next):
    """Registro compacto para diagnosticar errores y latencias en producción."""
    inicio = time.perf_counter()
    try:
        respuesta = await call_next(request)
    except Exception:
        logger.exception("request_error method=%s path=%s", request.method, request.url.path)
        raise
    logger.info(
        "request method=%s path=%s status=%s duration_ms=%d",
        request.method, request.url.path, respuesta.status_code,
        (time.perf_counter() - inicio) * 1000,
    )
    return respuesta


@app.get("/", tags=["Salud"])
def estado() -> dict:
    return {"servicio": "psicologia-api", "entorno": settings.ENTORNO, "estado": "ok"}


@app.get("/health", tags=["Salud"])
def health_check() -> dict:
    """Sondeo de disponibilidad para el balanceador; incluye la base de datos."""
    try:
        with engine.connect() as conexion:
            conexion.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no disponible.") from exc
    return {"servicio": "psicologia-api", "estado": "ok", "base_de_datos": "ok"}
