import { useEffect } from "react";
import "../Style/ModalReporteIA.css";

type Props = {
  contenido: string;
  totalSesiones: number;
  onCerrar: () => void;
};

export default function ModalReporteIA({ contenido, totalSesiones, onCerrar }: Props) {
  useEffect(() => {
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [onCerrar]);

  return (
    <div className="modal-reporte-ia-fondo" onClick={onCerrar}>
      <div
        className="modal-reporte-ia"
        role="dialog"
        aria-modal="true"
        aria-label="Reporte integrado con IA"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="modal-reporte-ia-header">
          <h3>Reporte integrado (IA)</h3>
          <span className="modal-reporte-ia-contador">{totalSesiones} sesiones analizadas</span>
        </div>
        <div className="modal-reporte-ia-cuerpo">
          {contenido.split(/\n{2,}/).map((parrafo, indice) => (
            <p key={indice}>{parrafo}</p>
          ))}
        </div>
        <p className="modal-reporte-ia-aviso">
          Generado automáticamente por IA a partir de las notas registradas. Revísalo antes de usarlo como reporte final.
        </p>
        <div className="modal-reporte-ia-acciones">
          <button type="button" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
