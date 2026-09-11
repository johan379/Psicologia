import { useEffect } from "react";
import "../Style/ModalNuevaSesion.css";

type Formulario = {
  fecha: string;
  motivoTema: string;
  descripcionNotas: string;
  observaciones: string;
  intervencionesRealizadas: string;
  evolucionPaciente: string;
  tareasRecomendaciones: string;
  notasAdicionales: string;
};

type Props = {
  formulario: Formulario;
  guardando: boolean;
  error: string;
  onCampo: (campo: keyof Formulario, valor: string) => void;
  onGuardar: (evento: { preventDefault: () => void }) => void;
  onCerrar: () => void;
};

export default function ModalNuevaSesion({ formulario, guardando, error, onCampo, onGuardar, onCerrar }: Props) {
  useEffect(() => {
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPresionarTecla);
    return () => document.removeEventListener("keydown", alPresionarTecla);
  }, [onCerrar]);

  return (
    <div className="modal-nueva-sesion-fondo" onClick={onCerrar}>
      <form
        className="modal-nueva-sesion"
        role="dialog"
        aria-modal="true"
        aria-label="Nueva sesión"
        onClick={(e) => e.stopPropagation()}
        onSubmit={onGuardar}
      >
        <h3>+ Nueva sesión</h3>

        <label>Fecha de la sesión
          <input type="date" value={formulario.fecha} onChange={(e) => onCampo("fecha", e.target.value)} required />
        </label>

        <label>Motivo o tema tratado
          <input type="text" value={formulario.motivoTema} onChange={(e) => onCampo("motivoTema", e.target.value)} required />
        </label>

        <label>Descripción / notas de la sesión
          <textarea rows={3} value={formulario.descripcionNotas} onChange={(e) => onCampo("descripcionNotas", e.target.value)} required />
        </label>

        <label>Observaciones
          <textarea rows={2} value={formulario.observaciones} onChange={(e) => onCampo("observaciones", e.target.value)} />
        </label>

        <label>Intervenciones realizadas
          <textarea rows={2} value={formulario.intervencionesRealizadas} onChange={(e) => onCampo("intervencionesRealizadas", e.target.value)} />
        </label>

        <label>Evolución del paciente
          <textarea rows={2} value={formulario.evolucionPaciente} onChange={(e) => onCampo("evolucionPaciente", e.target.value)} />
        </label>

        <label>Tareas, recomendaciones o compromisos
          <textarea rows={2} value={formulario.tareasRecomendaciones} onChange={(e) => onCampo("tareasRecomendaciones", e.target.value)} />
        </label>

        <label>Notas adicionales
          <textarea rows={2} value={formulario.notasAdicionales} onChange={(e) => onCampo("notasAdicionales", e.target.value)} />
        </label>

        {error && <p className="modal-nueva-sesion-error">{error}</p>}

        <div className="modal-nueva-sesion-acciones">
          <button type="button" className="modal-nueva-sesion-boton-secundario" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="modal-nueva-sesion-boton-primario" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar sesión"}
          </button>
        </div>
      </form>
    </div>
  );
}
