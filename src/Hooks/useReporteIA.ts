import { useState } from "react";
import { api, ErrorApi } from "../Componentes/Api";
import { reporteIaDesdeApi } from "../Componentes/Mapeo";
import type { ReporteIa, ReporteIaApi } from "../types/dominio";

/** Reporte integrado (IA) de todas las sesiones de un paciente. Se genera
 * bajo demanda: no se guarda en la base de datos. */
export function useReporteIA(pacienteId: number) {
  const [reporte, setReporte] = useState<ReporteIa | null>(null);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  async function generar() {
    setGenerando(true);
    setError("");
    try {
      const datos = await api.get<ReporteIaApi>(`/pacientes/${pacienteId}/reporte`);
      if (datos) {
        setReporte(reporteIaDesdeApi(datos));
        setVisible(true);
      }
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : "No se pudo generar el reporte.");
    } finally {
      setGenerando(false);
    }
  }

  function cerrar() {
    setVisible(false);
  }

  return { reporte, generando, error, visible, generar, cerrar };
}
