import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { usePacientes } from "../Hooks/usePacientes";
import Paginacion from "../Componentes/Paginacion";
import { formatearFecha } from "../Utils/fechas";
import { colorAvatar, inicialesDe } from "../Utils/avatar";
import "../Style/Pacientes.css";

export default function PacientesPage() {
  const navegar = useNavigate();
  const {
    pacientes, paginacion, cargando, errorCarga, setPagina, busqueda, buscar,
    mostrarFormulario, formulario, guardando, errorFormulario,
    abrirFormulario, cerrarFormulario, actualizarCampo, crearPaciente,
  } = usePacientes();

  return (
    <div className="pacientes-page">
      <div className="pacientes-header">
        <div>
          <h1>Pacientes</h1>
          <p className="pacientes-subtitulo">Busca, consulta y gestiona los perfiles de tus pacientes.</p>
        </div>
        <button type="button" className="pacientes-boton-nuevo" onClick={abrirFormulario}>
          + Nuevo paciente
        </button>
      </div>

      <input
        type="search"
        className="pacientes-buscador"
        placeholder="Buscar por nombre o documento..."
        value={busqueda}
        onChange={(e) => buscar(e.target.value)}
      />

      {errorCarga && <p className="pacientes-error">{errorCarga}</p>}
      {cargando ? (
        <p className="pacientes-estado">Cargando pacientes...</p>
      ) : pacientes.length === 0 ? (
        <p className="pacientes-estado">No se encontraron pacientes.</p>
      ) : (
        <ul className="pacientes-lista">
          {pacientes.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="pacientes-fila"
                style={{ "--acento": colorAvatar(p.id) } as CSSProperties}
                onClick={() => navegar(`/pacientes/${p.id}`)}
              >
                <span className="pacientes-fila-identidad">
                  <span className="pacientes-fila-avatar" style={{ background: colorAvatar(p.id) }}>
                    {inicialesDe(p.nombreCompleto)}
                  </span>
                  <span className="pacientes-fila-nombre">{p.nombreCompleto}</span>
                </span>
                <span className="pacientes-fila-estado" data-estado={p.estadoProceso}>{p.estadoProceso.replace("_", " ")}</span>
                <span className="pacientes-fila-sesiones">{p.totalSesiones} sesiones</span>
                <span className="pacientes-fila-ultima">Última sesión: {formatearFecha(p.ultimaSesionFecha)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Paginacion paginacion={paginacion} alCambiarPagina={setPagina} etiqueta="pacientes" />

      {mostrarFormulario && (
        <div className="pacientes-modal-fondo" onClick={cerrarFormulario}>
          <form className="pacientes-modal" onClick={(e) => e.stopPropagation()} onSubmit={crearPaciente}>
            <h3>+ Nuevo paciente</h3>

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
            <label>Fecha de ingreso
              <input type="date" value={formulario.fechaIngreso} onChange={(e) => actualizarCampo("fechaIngreso", e.target.value)} required />
            </label>
            <label>Motivo de consulta
              <textarea rows={2} value={formulario.motivoConsulta} onChange={(e) => actualizarCampo("motivoConsulta", e.target.value)} required />
            </label>
            <label>Observaciones generales
              <textarea rows={2} value={formulario.observacionesGenerales} onChange={(e) => actualizarCampo("observacionesGenerales", e.target.value)} />
            </label>

            {errorFormulario && <p className="pacientes-modal-error">{errorFormulario}</p>}

            <div className="pacientes-modal-acciones">
              <button type="button" onClick={cerrarFormulario}>Cancelar</button>
              <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Crear paciente"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
