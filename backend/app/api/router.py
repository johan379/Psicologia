from fastapi import APIRouter

from app.api.routes import auth, pacientes, sesiones, usuarios

router_api = APIRouter()
router_api.include_router(auth.router)
router_api.include_router(usuarios.router)
router_api.include_router(pacientes.router)
router_api.include_router(sesiones.router)
