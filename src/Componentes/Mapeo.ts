import type { Paciente, PacienteApi, SesionPaciente, SesionPacienteApi, Usuario, UsuarioApi } from "../types/dominio";

export function usuarioDesdeApi(u: UsuarioApi): Usuario {
  return { id: u.id, correo: u.correo, rol: u.rol, activo: u.activo };
}

export function pacienteDesdeApi(p: PacienteApi): Paciente {
  return {
    id: p.id,
    nombreCompleto: p.nombre_completo,
    documentoIdentidad: p.documento_identidad,
    fechaNacimiento: p.fecha_nacimiento,
    telefono: p.telefono,
    email: p.email,
    fechaIngreso: p.fecha_ingreso,
    motivoConsulta: p.motivo_consulta,
    estadoProceso: p.estado_proceso,
    observacionesGenerales: p.observaciones_generales,
    totalSesiones: p.total_sesiones,
    ultimaSesionFecha: p.ultima_sesion_fecha,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export function sesionDesdeApi(s: SesionPacienteApi): SesionPaciente {
  return {
    id: s.id,
    pacienteId: s.paciente_id,
    numeroSesion: s.numero_sesion,
    fecha: s.fecha,
    motivoTema: s.motivo_tema,
    descripcionNotas: s.descripcion_notas,
    observaciones: s.observaciones,
    intervencionesRealizadas: s.intervenciones_realizadas,
    evolucionPaciente: s.evolucion_paciente,
    tareasRecomendaciones: s.tareas_recomendaciones,
    notasAdicionales: s.notas_adicionales,
    createdAt: s.created_at,
  };
}
