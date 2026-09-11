import { useControladorInicio } from "../Componentes/Inicio";
import EscenaMariposas from "../Componentes/EscenaMariposas";
import type { Sesion } from "../types/dominio";
import "../Style/Inicio.css";

function InicioPage({ onLogin }: { onLogin: (sesion: Sesion) => void }) {
  const { correo, setCorreo, contrasena, setContrasena, error, cargando, iniciarSesion } = useControladorInicio(onLogin);

  return (
    <div className="inicio-page">
      <EscenaMariposas />
      <div className="inicio-panel">
        <img src="/logo-inspirar.jpg" alt="Inspirar — Bienestar que transforma" className="inicio-logo" />
        <p className="inicio-subtitulo">Ingresa tus datos para continuar</p>

        <form className="inicio-form" onSubmit={iniciarSesion} noValidate>
          <label className="inicio-label" htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            className="inicio-input"
            placeholder="tu@correo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="username"
          />

          <label className="inicio-label" htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            className="inicio-input"
            placeholder="••••••••"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            autoComplete="current-password"
          />

          {error && <p className="inicio-error">{error}</p>}

          <button type="submit" className="inicio-boton" disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InicioPage;
