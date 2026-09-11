import { useCallback, useEffect, useState } from "react";
import { api, ErrorApi } from "../Componentes/Api";
import { usuarioDesdeApi } from "../Componentes/Mapeo";
import type { RolUsuario, Usuario, UsuarioApi } from "../types/dominio";

const FORMULARIO_VACIO = { correo: "", contrasena: "", rol: "psicologo" as RolUsuario };

type FormularioUsuario = typeof FORMULARIO_VACIO;

/** Administración de cuentas (crear, listar, activar/desactivar) — exclusivo de SUPERADMIN. */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setErrorCarga("");
    try {
      const datos = await api.get<UsuarioApi[]>("/usuarios");
      setUsuarios((datos || []).map(usuarioDesdeApi));
    } catch (err) {
      setErrorCarga(err instanceof ErrorApi ? err.message : "No se pudieron cargar los usuarios.");
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  // ---------- Crear usuario ----------
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState<FormularioUsuario>(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  function abrirFormulario() {
    setFormulario(FORMULARIO_VACIO);
    setErrorFormulario("");
    setMostrarFormulario(true);
  }
  function cerrarFormulario() {
    setMostrarFormulario(false);
    setErrorFormulario("");
  }
  function actualizarCampo(campo: keyof FormularioUsuario, valor: string) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function crearUsuario(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    if (!formulario.correo.trim() || !formulario.contrasena.trim()) {
      setErrorFormulario("Correo y contraseña son obligatorios.");
      return;
    }
    setGuardando(true);
    setErrorFormulario("");
    try {
      await api.post("/usuarios", {
        correo: formulario.correo.trim(),
        contrasena: formulario.contrasena,
        rol: formulario.rol,
      });
      await cargarUsuarios();
      setMostrarFormulario(false);
    } catch (err) {
      setErrorFormulario(err instanceof ErrorApi ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setGuardando(false);
    }
  }

  // ---------- Activar / desactivar ----------
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [errorAccion, setErrorAccion] = useState("");

  async function activarUsuario(id: number) {
    setProcesandoId(id);
    setErrorAccion("");
    try {
      await api.patch(`/usuarios/${id}/activar`);
      await cargarUsuarios();
    } catch (err) {
      setErrorAccion(err instanceof ErrorApi ? err.message : "No se pudo activar la cuenta.");
    } finally {
      setProcesandoId(null);
    }
  }

  async function desactivarUsuario(id: number) {
    setProcesandoId(id);
    setErrorAccion("");
    try {
      await api.patch(`/usuarios/${id}/desactivar`);
      await cargarUsuarios();
    } catch (err) {
      setErrorAccion(err instanceof ErrorApi ? err.message : "No se pudo desactivar la cuenta.");
    } finally {
      setProcesandoId(null);
    }
  }

  // ---------- Restablecer contraseña ----------
  const [usuarioRestableciendo, setUsuarioRestableciendo] = useState<Usuario | null>(null);
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [guardandoRestablecer, setGuardandoRestablecer] = useState(false);
  const [errorRestablecer, setErrorRestablecer] = useState("");
  const [exitoRestablecer, setExitoRestablecer] = useState("");

  function abrirRestablecer(usuario: Usuario) {
    setUsuarioRestableciendo(usuario);
    setNuevaContrasena("");
    setErrorRestablecer("");
    setExitoRestablecer("");
  }
  function cerrarRestablecer() {
    setUsuarioRestableciendo(null);
  }

  async function confirmarRestablecer(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    if (!usuarioRestableciendo || !nuevaContrasena.trim()) {
      setErrorRestablecer("Escribe la nueva contraseña.");
      return;
    }
    setGuardandoRestablecer(true);
    setErrorRestablecer("");
    try {
      await api.patch(`/usuarios/${usuarioRestableciendo.id}/restablecer-contrasena`, {
        contrasena_nueva: nuevaContrasena,
      });
      setExitoRestablecer("Contraseña actualizada.");
    } catch (err) {
      setErrorRestablecer(err instanceof ErrorApi ? err.message : "No se pudo restablecer la contraseña.");
    } finally {
      setGuardandoRestablecer(false);
    }
  }

  // ---------- Eliminar ----------
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);

  function pedirEliminar(usuario: Usuario) {
    setUsuarioAEliminar(usuario);
    setErrorAccion("");
  }
  function cancelarEliminar() {
    setUsuarioAEliminar(null);
  }

  async function confirmarEliminar() {
    if (!usuarioAEliminar) return;
    setProcesandoId(usuarioAEliminar.id);
    setErrorAccion("");
    try {
      await api.delete(`/usuarios/${usuarioAEliminar.id}`);
      setUsuarioAEliminar(null);
      await cargarUsuarios();
    } catch (err) {
      setErrorAccion(err instanceof ErrorApi ? err.message : "No se pudo eliminar la cuenta.");
      setUsuarioAEliminar(null);
    } finally {
      setProcesandoId(null);
    }
  }

  return {
    usuarios, cargando, errorCarga,
    mostrarFormulario, formulario, guardando, errorFormulario,
    abrirFormulario, cerrarFormulario, actualizarCampo, crearUsuario,
    procesandoId, errorAccion, activarUsuario, desactivarUsuario,

    usuarioRestableciendo, nuevaContrasena, setNuevaContrasena, guardandoRestablecer, errorRestablecer, exitoRestablecer,
    abrirRestablecer, cerrarRestablecer, confirmarRestablecer,

    usuarioAEliminar, pedirEliminar, cancelarEliminar, confirmarEliminar,
  };
}
