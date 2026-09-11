import { useCallback, useEffect, useState } from "react";
import { api, ErrorApi } from "../Componentes/Api";
import { pacienteDesdeApi } from "../Componentes/Mapeo";
import type { EstadoProceso, Paciente, PacienteApi } from "../types/dominio";

type FormularioEdicion = {
  nombreCompleto: string;
  documentoIdentidad: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  motivoConsulta: string;
  estadoProceso: EstadoProceso;
  observacionesGenerales: string;
};

function formularioDesdePaciente(p: Paciente): FormularioEdicion {
  return {
    nombreCompleto: p.nombreCompleto,
    documentoIdentidad: p.documentoIdentidad || "",
    fechaNacimiento: p.fechaNacimiento || "",
    telefono: p.telefono || "",
    email: p.email || "",
    motivoConsulta: p.motivoConsulta,
    estadoProceso: p.estadoProceso,
    observacionesGenerales: p.observacionesGenerales || "",
  };
}

/** Perfil individual del paciente: datos generales y su edición. */
export function usePaciente(pacienteId: number) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const cargarPaciente = useCallback(async () => {
    setCargando(true);
    setErrorCarga("");
    try {
      const datos = await api.get<PacienteApi>(`/pacientes/${pacienteId}`);
      setPaciente(datos ? pacienteDesdeApi(datos) : null);
    } catch (err) {
      setErrorCarga(err instanceof ErrorApi ? err.message : "No se pudo cargar el paciente.");
      setPaciente(null);
    } finally {
      setCargando(false);
    }
  }, [pacienteId]);

  useEffect(() => { cargarPaciente(); }, [cargarPaciente]);

  // ---------- Edición ----------
  const [editando, setEditando] = useState(false);
  const [formulario, setFormulario] = useState<FormularioEdicion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState("");

  function abrirEdicion() {
    if (!paciente) return;
    setFormulario(formularioDesdePaciente(paciente));
    setErrorEdicion("");
    setEditando(true);
  }
  function cerrarEdicion() {
    setEditando(false);
    setErrorEdicion("");
  }
  function actualizarCampo(campo: keyof FormularioEdicion, valor: string) {
    setFormulario((actual) => actual ? { ...actual, [campo]: valor } : actual);
  }

  async function guardarEdicion(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    if (!formulario) return;
    if (!formulario.nombreCompleto.trim() || !formulario.motivoConsulta.trim()) {
      setErrorEdicion("Nombre y motivo de consulta son obligatorios.");
      return;
    }
    setGuardando(true);
    setErrorEdicion("");
    try {
      await api.put(`/pacientes/${pacienteId}`, {
        nombre_completo: formulario.nombreCompleto.trim(),
        documento_identidad: formulario.documentoIdentidad.trim() || null,
        fecha_nacimiento: formulario.fechaNacimiento || null,
        telefono: formulario.telefono.trim() || null,
        email: formulario.email.trim() || null,
        motivo_consulta: formulario.motivoConsulta.trim(),
        estado_proceso: formulario.estadoProceso,
        observaciones_generales: formulario.observacionesGenerales.trim() || null,
      });
      await cargarPaciente();
      setEditando(false);
    } catch (err) {
      setErrorEdicion(err instanceof ErrorApi ? err.message : "No se pudo guardar el cambio.");
    } finally {
      setGuardando(false);
    }
  }

  return {
    paciente, cargando, errorCarga, cargarPaciente,
    editando, formulario, guardando, errorEdicion,
    abrirEdicion, cerrarEdicion, actualizarCampo, guardarEdicion,
  };
}
