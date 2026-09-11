export type RolUsuario = "superadmin" | "psicologo";

export type Sesion = { correo: string; rol: RolUsuario };

export type UsuarioApi = { id: number; correo: string; rol: RolUsuario; activo: boolean };
export type Usuario = { id: number; correo: string; rol: RolUsuario; activo: boolean };

export type EstadoProceso = "activo" | "en_pausa" | "finalizado";

export type PacienteApi = {
  id: number;
  nombre_completo: string;
  documento_identidad: string | null;
  fecha_nacimiento: string | null;
  telefono: string | null;
  email: string | null;
  fecha_ingreso: string;
  motivo_consulta: string;
  estado_proceso: EstadoProceso;
  observaciones_generales: string | null;
  total_sesiones: number;
  ultima_sesion_fecha: string | null;
  created_at: string;
  updated_at: string;
};

export type Paciente = {
  id: number;
  nombreCompleto: string;
  documentoIdentidad: string | null;
  fechaNacimiento: string | null;
  telefono: string | null;
  email: string | null;
  fechaIngreso: string;
  motivoConsulta: string;
  estadoProceso: EstadoProceso;
  observacionesGenerales: string | null;
  totalSesiones: number;
  ultimaSesionFecha: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SesionPacienteApi = {
  id: number;
  paciente_id: number;
  numero_sesion: number;
  fecha: string;
  motivo_tema: string;
  descripcion_notas: string;
  observaciones: string | null;
  intervenciones_realizadas: string | null;
  evolucion_paciente: string | null;
  tareas_recomendaciones: string | null;
  notas_adicionales: string | null;
  created_at: string;
};

export type SesionPaciente = {
  id: number;
  pacienteId: number;
  numeroSesion: number;
  fecha: string;
  motivoTema: string;
  descripcionNotas: string;
  observaciones: string | null;
  intervencionesRealizadas: string | null;
  evolucionPaciente: string | null;
  tareasRecomendaciones: string | null;
  notasAdicionales: string | null;
  createdAt: string;
};
