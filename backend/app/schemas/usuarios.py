from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.usuario import RolUsuario


class UsuarioCrear(BaseModel):
    correo: EmailStr
    contrasena: str
    rol: RolUsuario = RolUsuario.PSICOLOGO


class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    correo: str
    rol: RolUsuario
    activo: bool


class RestablecerContrasena(BaseModel):
    contrasena_nueva: str
