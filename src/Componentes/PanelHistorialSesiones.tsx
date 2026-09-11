import { useState } from "react";
import { formatearFecha, formatearFechaHora } from "../Utils/fechas";
import type { SesionPaciente } from "../types/dominio";

type Props = {
  sesiones: SesionPaciente[];
  cargando: boolean;
};

const CAMPOS_DETALLE: { campo: keyof SesionPaciente; etiqueta: string }[] = [
  { campo: "observaciones", etiqueta: "Observaciones" },
  { campo: "intervencionesRealizadas", etiqueta: "Intervenciones realizadas" },
  { campo: "evolucionPaciente", etiqueta: "Evolución del paciente" },
  { campo: "tareasRecomendaciones", etiqueta: "Tareas y compromisos" },
  { campo: "notasAdicionales", etiqueta: "Notas adicionales" },
];

export default function PanelHistorialSesiones({ sesiones, cargando }: Props) {
  const [abiertaId, setAbiertaId] = useState<number | null>(null);

  if (cargando) return <p className="historial-sesiones-estado">Cargando sesiones...</p>;
  if (sesiones.length === 0) return <p className="historial-sesiones-estado">Todavía no hay sesiones registradas.</p>;

  return (
    <ul className="historial-sesiones">
      {sesiones.map((sesion) => {
        const abierta = abiertaId === sesion.id;
        return (
          <li key={sesion.id} className="historial-sesiones-item">
            <button
              type="button"
              className="historial-sesiones-resumen"
              aria-expanded={abierta}
              onClick={() => setAbiertaId(abierta ? null : sesion.id)}
            >
              <span className="historial-sesiones-numero">Sesión #{sesion.numeroSesion}</span>
              <span className="historial-sesiones-fecha">{formatearFecha(sesion.fecha)}</span>
              <span className="historial-sesiones-tema">{sesion.motivoTema}</span>
            </button>
            {abierta && (
              <div className="historial-sesiones-detalle">
                <p><strong>Descripción / notas:</strong> {sesion.descripcionNotas}</p>
                {CAMPOS_DETALLE.map(({ campo, etiqueta }) => {
                  const valor = sesion[campo];
                  if (!valor) return null;
                  return <p key={campo}><strong>{etiqueta}:</strong> {String(valor)}</p>;
                })}
                <p className="historial-sesiones-registrada">Registrada el {formatearFechaHora(sesion.createdAt)}</p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
