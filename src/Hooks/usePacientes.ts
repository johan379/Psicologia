import { useCallback, useEffect, useState } from "react";
import { api, ErrorApi } from "../Componentes/Api";
import { pacienteDesdeApi } from "../Componentes/Mapeo";
import type { Paciente, PacienteApi } from "../types/dominio";

const LIMITE_POR_PAGINA = 20;

const FORMULARIO_VACIO = {
  nombreCompleto: "",
  documentoIdentidad: "",
  fechaNacimiento: "",
  telefono: "",
  email: "",
  fechaIngreso: new Date().toISOString().slice(0, 10),
  motivoConsulta: "",
  observacionesGenerales: "",
};

type FormularioPaciente = typeof FORMULARIO_VACIO;
type ListaPacientesApi = { items: PacienteApi[]; total: number; pagina: number; total_paginas: number };

/** Listado, búsqueda paginada y alta de pacientes. */
export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [paginacion, setPaginacion] = useState<{ total: number; pagina: number; total_paginas: number }>();
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const cargarPacientes = useCallback(async () => {
    setCargando(true);
    setErrorCarga("");
    try {
      const skip = (pagina - 1) * LIMITE_POR_PAGINA;
      const parametros = new URLSearchParams({ skip: String(skip), limit: String(LIMITE_POR_PAGINA) });
      if (busqueda.trim()) parametros.set("busqueda", busqueda.trim());
      const datos = await api.get<ListaPacientesApi>(`/pacientes?${parametros.toString()}`);
      setPacientes((datos?.items || []).map(pacienteDesdeApi));
      setPaginacion(datos ? { total: datos.total, pagina: datos.pagina, total_paginas: datos.total_paginas } : undefined);
    } catch (err) {
      setErrorCarga(err instanceof ErrorApi ? err.message : "No se pudieron cargar los pacientes.");
      setPacientes([]);
    } finally {
      setCargando(false);
    }
  }, [busqueda, pagina]);

  useEffect(() => { cargarPacientes(); }, [cargarPacientes]);

  function buscar(texto: string) {
    setBusqueda(texto);
    setPagina(1);
  }

  // ---------- Crear paciente ----------
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState<FormularioPaciente>(FORMULARIO_VACIO);
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
  function actualizarCampo(campo: keyof FormularioPaciente, valor: string) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function crearPaciente(evento: { preventDefault: () => void }) {
    evento.preventDefault();
    if (!formulario.nombreCompleto.trim() || !formulario.motivoConsulta.trim()) {
      setErrorFormulario("Nombre y motivo de consulta son obligatorios.");
      return;
    }
    setGuardando(true);
    setErrorFormulario("");
    try {
      await api.post("/pacientes", {
        nombre_completo: formulario.nombreCompleto.trim(),
        documento_identidad: formulario.documentoIdentidad.trim() || null,
        fecha_nacimiento: formulario.fechaNacimiento || null,
        telefono: formulario.telefono.trim() || null,
        email: formulario.email.trim() || null,
        fecha_ingreso: formulario.fechaIngreso,
        motivo_consulta: formulario.motivoConsulta.trim(),
        observaciones_generales: formulario.observacionesGenerales.trim() || null,
      });
      await cargarPacientes();
      setMostrarFormulario(false);
    } catch (err) {
      setErrorFormulario(err instanceof ErrorApi ? err.message : "No se pudo crear el paciente.");
    } finally {
      setGuardando(false);
    }
  }

  return {
    pacientes, paginacion, cargando, errorCarga, pagina, setPagina, busqueda, buscar, cargarPacientes,
    mostrarFormulario, formulario, guardando, errorFormulario,
    abrirFormulario, cerrarFormulario, actualizarCampo, crearPaciente,
  };
}
