import { useCallback, useEffect, useState } from "react";
import { api, ErrorApi } from "../Componentes/Api";
import { sesionDesdeApi } from "../Componentes/Mapeo";
import { useActualizacionPeriodica } from "./useActualizacionPeriodica";
import type { SesionPaciente, SesionPacienteApi } from "../types/dominio";

const FORMULARIO_VACIO = {
  fecha: new Date().toISOString().slice(0, 10),
  motivoTema: "",
  descripcionNotas: "",
  observaciones: "",
  intervencionesRealizadas: "",
  evolucionPaciente: "",
  tareasRecomendaciones: "",
  notasAdicionales: "",
};

type FormularioSesion = typeof FORMULARIO_VACIO;
type Orden = "desc" | "asc";

/** Historial de sesiones de un paciente: carga, filtro por fecha, orden y alta. */
export function useSesiones(pacienteId: number) {
  const [sesiones, setSesiones] = useState<SesionPaciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [orden, setOrden] = useState<Orden>("desc");

  const cargarSesiones = useCallback(async (opciones: { silencioso?: boolean } = {}) => {
    if (!opciones.silencioso) setCargando(true);
    setErrorCarga("");
    try {
      const parametros = new URLSearchParams({ orden });
      if (desde) parametros.set("desde", desde);
      if (hasta) parametros.set("hasta", hasta);
      const datos = await api.get<SesionPacienteApi[]>(`/pacientes/${pacienteId}/sesiones?${parametros.toString()}`);
      setSesiones((datos || []).map(sesionDesdeApi));
    } catch (err) {
      if (!opciones.silencioso) {
        setErrorCarga(err instanceof ErrorApi ? err.message : "No se pudieron cargar las sesiones.");
        setSesiones([]);
      }
    } finally {
      if (!opciones.silencioso) setCargando(false);
    }
  }, [pacienteId, desde, hasta, orden]);

  useEffect(() => { cargarSesiones(); }, [cargarSesiones]);

  function limpiarFiltro() {
    setDesde("");
    setHasta("");
  }

  // ---------- Nueva sesión ----------
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState<FormularioSesion>(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  // No sondear mientras el formulario de nueva sesión está abierto.
  useActualizacionPeriodica(() => { if (!mostrarFormulario) cargarSesiones({ silencioso: true }); }, 6000);

  function abrirFormulario() {
    setFormulario(FORMULARIO_VACIO);
    setErrorFormulario("");
    setMostrarFormulario(true);
  }
  function cerrarFormulario() {
    setMostrarFormulario(false);
    setErrorFormulario("");
  }
  function actualizarCampo(campo: keyof FormularioSesion, valor: string) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function crearSesion(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    if (!formulario.motivoTema.trim() || !formulario.descripcionNotas.trim()) {
      setErrorFormulario("Motivo y descripción de la sesión son obligatorios.");
      return;
    }
    setGuardando(true);
    setErrorFormulario("");
    try {
      await api.post(`/pacientes/${pacienteId}/sesiones`, {
        fecha: formulario.fecha,
        motivo_tema: formulario.motivoTema.trim(),
        descripcion_notas: formulario.descripcionNotas.trim(),
        observaciones: formulario.observaciones.trim() || null,
        intervenciones_realizadas: formulario.intervencionesRealizadas.trim() || null,
        evolucion_paciente: formulario.evolucionPaciente.trim() || null,
        tareas_recomendaciones: formulario.tareasRecomendaciones.trim() || null,
        notas_adicionales: formulario.notasAdicionales.trim() || null,
      });
      await cargarSesiones();
      setMostrarFormulario(false);
    } catch (err) {
      setErrorFormulario(err instanceof ErrorApi ? err.message : "No se pudo guardar la sesión.");
    } finally {
      setGuardando(false);
    }
  }

  return {
    sesiones, cargando, errorCarga, cargarSesiones,
    desde, setDesde, hasta, setHasta, orden, setOrden, limpiarFiltro,
    mostrarFormulario, formulario, guardando, errorFormulario,
    abrirFormulario, cerrarFormulario, actualizarCampo, crearSesion,
  };
}
