import { Link, useParams } from "react-router-dom";
import { usePaciente } from "../Hooks/usePaciente";
import { useSesiones } from "../Hooks/useSesiones";
import PanelFiltrosSesiones from "../Componentes/PanelFiltrosSesiones";
import PanelHistorialSesiones from "../Componentes/PanelHistorialSesiones";
import ModalNuevaSesion from "../Componentes/ModalNuevaSesion";
import { formatearFecha } from "../Utils/fechas";
import "../Style/Paciente.css";

export default function PacientePage() {
  const { id } = useParams<{ id: string }>();
  const pacienteId = Number(id);

  const {
    paciente, cargando, errorCarga,
    editando, formulario, guardando, errorEdicion,
    abrirEdicion, cerrarEdicion, actualizarCampo, guardarEdicion,
  } = usePaciente(pacienteId);

  const {
    sesiones, cargando: cargandoSesiones,
    desde, setDesde, hasta, setHasta, orden, setOrden, limpiarFiltro,
    mostrarFormulario, formulario: formularioSesion, guardando: guardandoSesion, errorFormulario: errorSesion,
    abrirFormulario, cerrarFormulario, actualizarCampo: actualizarCampoSesion, crearSesion,
  } = useSesiones(pacienteId);

  if (cargando) return <p className="paciente-estado">Cargando paciente...</p>;
  if (errorCarga || !paciente) return <p className="paciente-estado paciente-error">{errorCarga || "Paciente no encontrado."}</p>;

  return (
    <div className="paciente-page">
      <Link to="/pacientes" className="paciente-volver">← Volver a pacientes</Link>

      <div className="paciente-header">
        <div>
          <h1>{paciente.nombreCompleto}</h1>
          <p className="paciente-subtitulo">
            Última sesión: {formatearFecha(paciente.ultimaSesionFecha)} · {paciente.totalSesiones} sesiones registradas
          </p>
        </div>
        <span className="paciente-estado-proceso" data-estado={paciente.estadoProceso}>
          {paciente.estadoProceso.replace("_", " ")}
        </span>
      </div>

      <section className="paciente-seccion">
        <div className="paciente-seccion-header">
          <h2>Información general</h2>
          {!editando && <button type="button" onClick={abrirEdicion}>Editar</button>}
        </div>

        {editando && formulario ? (
          <form className="paciente-form-edicion" onSubmit={guardarEdicion}>
            <label>Nombre completo
              <input type="text" value={formulario.nombreCompleto} onChange={(e) => actualizarCampo("nombreCompleto", e.target.value)} required />
            </label>
            <label>Documento de identidad
              <input type="text" value={formulario.documentoIdentidad} onChange={(e) => actualizarCampo("documentoIdentidad", e.target.value)} />
            </label>
            <label>Fecha de nacimiento
              <input type="date" value={formulario.fechaNacimiento} onChange={(e) => actualizarCampo("fechaNacimiento", e.target.value)} />
            </label>
            <label>Teléfono
              <input type="tel" value={formulario.telefono} onChange={(e) => actualizarCampo("telefono", e.target.value)} />
            </label>
            <label>Correo electrónico
              <input type="email" value={formulario.email} onChange={(e) => actualizarCampo("email", e.target.value)} />
            </label>
            <label>Estado del proceso
              <select value={formulario.estadoProceso} onChange={(e) => actualizarCampo("estadoProceso", e.target.value)}>
                <option value="activo">Activo</option>
                <option value="en_pausa">En pausa</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </label>
            <label>Motivo de consulta
              <textarea rows={2} value={formulario.motivoConsulta} onChange={(e) => actualizarCampo("motivoConsulta", e.target.value)} required />
            </label>
            <label>Observaciones generales
              <textarea rows={2} value={formulario.observacionesGenerales} onChange={(e) => actualizarCampo("observacionesGenerales", e.target.value)} />
            </label>

            {errorEdicion && <p className="paciente-error-form">{errorEdicion}</p>}

            <div className="paciente-form-acciones">
              <button type="button" onClick={cerrarEdicion}>Cancelar</button>
              <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </form>
        ) : (
          <dl className="paciente-info-general">
            <div><dt>Documento</dt><dd>{paciente.documentoIdentidad || "—"}</dd></div>
            <div><dt>Fecha de nacimiento</dt><dd>{formatearFecha(paciente.fechaNacimiento)}</dd></div>
            <div><dt>Teléfono</dt><dd>{paciente.telefono || "—"}</dd></div>
            <div><dt>Correo</dt><dd>{paciente.email || "—"}</dd></div>
            <div><dt>Fecha de ingreso</dt><dd>{formatearFecha(paciente.fechaIngreso)}</dd></div>
            <div className="paciente-info-general-ancho"><dt>Motivo de consulta</dt><dd>{paciente.motivoConsulta}</dd></div>
            <div className="paciente-info-general-ancho"><dt>Observaciones generales</dt><dd>{paciente.observacionesGenerales || "—"}</dd></div>
          </dl>
        )}
      </section>

      <section className="paciente-seccion">
        <div className="paciente-seccion-header">
          <h2>Historial de sesiones</h2>
          <button type="button" className="paciente-boton-nueva-sesion" onClick={abrirFormulario}>
            + Nueva sesión
          </button>
        </div>

        <PanelFiltrosSesiones
          desde={desde} hasta={hasta} orden={orden}
          onDesde={setDesde} onHasta={setHasta} onOrden={setOrden} onLimpiar={limpiarFiltro}
        />

        <PanelHistorialSesiones sesiones={sesiones} cargando={cargandoSesiones} />
      </section>

      {mostrarFormulario && (
        <ModalNuevaSesion
          formulario={formularioSesion}
          guardando={guardandoSesion}
          error={errorSesion}
          onCampo={actualizarCampoSesion}
          onGuardar={crearSesion}
          onCerrar={cerrarFormulario}
        />
      )}
    </div>
  );
}
