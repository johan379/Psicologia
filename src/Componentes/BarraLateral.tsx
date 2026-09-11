import { NavLink } from "react-router-dom";
import type { Sesion } from "../types/dominio";
import "../Style/Barralateral.css";

type Props = {
  sesion: Sesion | null;
  onCerrarSesion: () => void;
};

export default function BarraLateral({ sesion, onCerrarSesion }: Props) {
  return (
    <header className="barra-lateral">
      <div className="barra-lateral-marca">Gestión de Pacientes</div>
      <nav className="barra-lateral-nav">
        {sesion?.rol === "psicologo" && (
          <NavLink to="/pacientes" className={({ isActive }) => isActive ? "activo" : ""}>
            Pacientes
          </NavLink>
        )}
        {sesion?.rol === "superadmin" && (
          <NavLink to="/usuarios" className={({ isActive }) => isActive ? "activo" : ""}>
            Usuarios
          </NavLink>
        )}
      </nav>
      <div className="barra-lateral-usuario">
        <span>{sesion?.correo}</span>
        <button type="button" onClick={onCerrarSesion}>Cerrar sesión</button>
      </div>
    </header>
  );
}
