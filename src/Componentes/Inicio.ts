import { useRef, useState } from "react";
import { api, ErrorApi } from "./Api";
import { guardarToken } from "../Utils/auth";
import type { Sesion } from "../types/dominio";

type TokenResponse = { access_token: string; sesion: Sesion };

// El backend gratuito se "duerme" tras un rato sin uso y tarda en despertar
// en la primera petición. Si el login sigue cargando pasado este tiempo,
// avisamos para que no parezca que la app está rota.
const MS_ANTES_DE_AVISAR_ESPERA = 4000;

/** Controlador del formulario de login: credenciales, estado de carga y error. */
export function useControladorInicio(onLogin: (sesion: Sesion) => void) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [esperandoServidor, setEsperandoServidor] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function iniciarSesion(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    if (!correo.trim() || !contrasena.trim()) {
      setError("Escribe tu correo y contraseña.");
      return;
    }
    setCargando(true);
    setError("");
    setEsperandoServidor(false);
    temporizador.current = setTimeout(() => setEsperandoServidor(true), MS_ANTES_DE_AVISAR_ESPERA);
    try {
      const respuesta = await api.post<TokenResponse>("/auth/login", { correo: correo.trim(), contrasena });
      if (!respuesta) throw new ErrorApi("Respuesta vacía del servidor.", 500);
      guardarToken(respuesta.access_token);
      onLogin(respuesta.sesion);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : "No se pudo iniciar sesión.");
    } finally {
      if (temporizador.current) clearTimeout(temporizador.current);
      setEsperandoServidor(false);
      setCargando(false);
    }
  }

  return { correo, setCorreo, contrasena, setContrasena, error, cargando, esperandoServidor, iniciarSesion };
}
