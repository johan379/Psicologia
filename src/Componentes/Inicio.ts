import { useState } from "react";
import { api, ErrorApi } from "./Api";
import { guardarToken } from "../Utils/auth";
import type { Sesion } from "../types/dominio";

type TokenResponse = { access_token: string; sesion: Sesion };

/** Controlador del formulario de login: credenciales, estado de carga y error. */
export function useControladorInicio(onLogin: (sesion: Sesion) => void) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    if (!correo.trim() || !contrasena.trim()) {
      setError("Escribe tu correo y contraseña.");
      return;
    }
    setCargando(true);
    setError("");
    try {
      const respuesta = await api.post<TokenResponse>("/auth/login", { correo: correo.trim(), contrasena });
      if (!respuesta) throw new ErrorApi("Respuesta vacía del servidor.", 500);
      guardarToken(respuesta.access_token);
      onLogin(respuesta.sesion);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return { correo, setCorreo, contrasena, setContrasena, error, cargando, iniciarSesion };
}
