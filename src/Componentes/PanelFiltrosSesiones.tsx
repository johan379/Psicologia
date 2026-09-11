type Orden = "desc" | "asc";

type Props = {
  desde: string;
  hasta: string;
  orden: Orden;
  onDesde: (valor: string) => void;
  onHasta: (valor: string) => void;
  onOrden: (valor: Orden) => void;
  onLimpiar: () => void;
};

export default function PanelFiltrosSesiones({ desde, hasta, orden, onDesde, onHasta, onOrden, onLimpiar }: Props) {
  const hayFiltro = Boolean(desde || hasta);

  return (
    <div className="panel-filtros-sesiones">
      <label>
        Desde
        <input type="date" value={desde} onChange={(e) => onDesde(e.target.value)} />
      </label>
      <label>
        Hasta
        <input type="date" value={hasta} onChange={(e) => onHasta(e.target.value)} />
      </label>
      <label>
        Orden
        <select value={orden} onChange={(e) => onOrden(e.target.value as Orden)}>
          <option value="desc">Más reciente primero</option>
          <option value="asc">Más antigua primero</option>
        </select>
      </label>
      {hayFiltro && (
        <button type="button" className="panel-filtros-sesiones-limpiar" onClick={onLimpiar}>
          Limpiar filtro
        </button>
      )}
    </div>
  );
}
