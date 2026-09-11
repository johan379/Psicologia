/** Formatea una fecha ISO a `dd/mm/aaaa` para mostrar en la interfaz. */
export function formatearFecha(iso: string | null): string {
  if (!iso) return "—";
  // Una fecha sin hora ("2026-09-10") no lleva zona horaria: `new Date(...)`
  // la interpreta como medianoche UTC, y convertirla a la hora local puede
  // mostrar el día anterior. Se formatea directo desde los componentes.
  const soloFecha = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (soloFecha) {
    const [, anio, mes, dia] = soloFecha;
    return `${dia}/${mes}/${anio}`;
  }
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Formatea una fecha ISO a `dd/mm/aaaa hh:mm`. */
export function formatearFechaHora(iso: string | null): string {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

/** true si `iso` cae dentro de [desde, hasta] (inclusive), ambos opcionales. */
export function dentroDeRango(iso: string, desde: string, hasta: string): boolean {
  const fecha = iso.slice(0, 10);
  if (desde && fecha < desde) return false;
  if (hasta && fecha > hasta) return false;
  return true;
}
