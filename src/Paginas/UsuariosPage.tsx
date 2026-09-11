import { useUsuarios } from "../Hooks/useUsuarios";
import ModalConfirmacion from "../Componentes/ModalConfirmacion";
import "../Style/Usuarios.css";

export default function UsuariosPage() {
  const {
    usuarios, cargando, errorCarga,
    mostrarFormulario, formulario, guardando, errorFormulario,
    abrirFormulario, cerrarFormulario, actualizarCampo, crearUsuario,
    procesandoId, errorAccion, activarUsuario, desactivarUsuario,

    usuarioRestableciendo, nuevaContrasena, setNuevaContrasena, guardandoRestablecer, errorRestablecer, exitoRestablecer,
    abrirRestablecer, cerrarRestablecer, confirmarRestablecer,

    usuarioAEliminar, pedirEliminar, cancelarEliminar, confirmarEliminar,
  } = useUsuarios();

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <div>
          <h1>Usuarios</h1>
          <p className="usuarios-subtitulo">Crea y administra las cuentas que pueden acceder al sistema.</p>
        </div>
        <button type="button" className="usuarios-boton-nuevo" onClick={abrirFormulario}>
          + Nueva cuenta
        </button>
      </div>

      {errorCarga && <p className="usuarios-error">{errorCarga}</p>}
      {errorAccion && <p className="usuarios-error">{errorAccion}</p>}

      {cargando ? (
        <p className="usuarios-estado">Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <p className="usuarios-estado">Todavía no hay cuentas registradas.</p>
      ) : (
        <ul className="usuarios-lista">
          {usuarios.map((u) => (
            <li key={u.id} className="usuarios-fila">
              <span className="usuarios-fila-correo">{u.correo}</span>
              <span className="usuarios-fila-rol" data-rol={u.rol}>{u.rol}</span>
              <span className="usuarios-fila-estado" data-activo={u.activo}>{u.activo ? "Activo" : "Desactivado"}</span>
              <div className="usuarios-fila-acciones">
                {u.activo ? (
                  <button type="button" disabled={procesandoId === u.id} onClick={() => desactivarUsuario(u.id)}>
                    Desactivar
                  </button>
                ) : (
                  <button type="button" disabled={procesandoId === u.id} onClick={() => activarUsuario(u.id)}>
                    Activar
                  </button>
                )}
                <button type="button" disabled={procesandoId === u.id} onClick={() => abrirRestablecer(u)}>
                  Restablecer contraseña
                </button>
                <button
                  type="button"
                  className="usuarios-fila-accion-peligro"
                  disabled={procesandoId === u.id}
                  onClick={() => pedirEliminar(u)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {mostrarFormulario && (
        <div className="usuarios-modal-fondo" onClick={cerrarFormulario}>
          <form className="usuarios-modal" onClick={(e) => e.stopPropagation()} onSubmit={crearUsuario}>
            <h3>+ Nueva cuenta</h3>

            <label>Correo electrónico
              <input
                type="email"
                value={formulario.correo}
                onChange={(e) => actualizarCampo("correo", e.target.value)}
                autoComplete="off"
                required
              />
            </label>
            <label>Contraseña
              <input
                type="password"
                value={formulario.contrasena}
                onChange={(e) => actualizarCampo("contrasena", e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <label>Rol
              <select value={formulario.rol} onChange={(e) => actualizarCampo("rol", e.target.value)}>
                <option value="psicologo">Psicólogo</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </label>

            {errorFormulario && <p className="usuarios-modal-error">{errorFormulario}</p>}

            <div className="usuarios-modal-acciones">
              <button type="button" onClick={cerrarFormulario}>Cancelar</button>
              <button type="submit" disabled={guardando}>{guardando ? "Creando..." : "Crear cuenta"}</button>
            </div>
          </form>
        </div>
      )}

      {usuarioRestableciendo && (
        <div className="usuarios-modal-fondo" onClick={cerrarRestablecer}>
          <form className="usuarios-modal" onClick={(e) => e.stopPropagation()} onSubmit={confirmarRestablecer}>
            <h3>Restablecer contraseña</h3>
            <p className="usuarios-modal-descripcion">Cuenta: {usuarioRestableciendo.correo}</p>

            <label>Nueva contraseña
              <input
                type="password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>

            {errorRestablecer && <p className="usuarios-modal-error">{errorRestablecer}</p>}
            {exitoRestablecer && <p className="usuarios-modal-exito">{exitoRestablecer}</p>}

            <div className="usuarios-modal-acciones">
              <button type="button" onClick={cerrarRestablecer}>Cerrar</button>
              <button type="submit" disabled={guardandoRestablecer}>
                {guardandoRestablecer ? "Guardando..." : "Restablecer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {usuarioAEliminar && (
        <ModalConfirmacion
          titulo="Eliminar cuenta"
          mensaje={`¿Eliminar la cuenta ${usuarioAEliminar.correo}? Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          textoCancelar="Cancelar"
          variante="peligro"
          onConfirmar={confirmarEliminar}
          onCancelar={cancelarEliminar}
        />
      )}
    </div>
  );
}
