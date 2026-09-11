import { lazy, Suspense, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { borrarToken } from "./Utils/auth";
import RutaProtegida from "./Componentes/RutaProtegida";
import BarraLateral from "./Componentes/BarraLateral";
import type { RolUsuario, Sesion } from "./types/dominio";

// Cada módulo se descarga solo al abrir su ruta.
const InicioPage = lazy(() => import("./Paginas/InicioPage"));
const PacientesPage = lazy(() => import("./Paginas/PacientesPage"));
const PacientePage = lazy(() => import("./Paginas/PacientePage"));
const UsuariosPage = lazy(() => import("./Paginas/UsuariosPage"));

const CLAVE_SESION = "psicologia_sesion";

function leerSesionGuardada(): Sesion | null {
  try {
    const guardada = sessionStorage.getItem(CLAVE_SESION);
    if (!guardada) return null;
    const sesion = JSON.parse(guardada) as Sesion;
    // Sesión de una versión anterior sin `rol`: se descarta en vez de dejar
    // que RutaProtegida entre en un bucle de redirección.
    if (!sesion.rol) return null;
    return sesion;
  } catch {
    return null;
  }
}

function rutaInicioPara(sesion: Sesion | null): string {
  if (!sesion) return "/";
  return sesion.rol === "superadmin" ? "/usuarios" : "/pacientes";
}

export default function App() {
  const [sesion, setSesionState] = useState<Sesion | null>(leerSesionGuardada);

  function setSesion(nuevaSesion: Sesion | null) {
    setSesionState(nuevaSesion);
    if (nuevaSesion) {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(nuevaSesion));
    } else {
      sessionStorage.removeItem(CLAVE_SESION);
    }
  }

  function cerrarSesion() {
    borrarToken();
    setSesion(null);
  }

  function paginaProtegida(roles: RolUsuario[], Pagina: React.ElementType) {
    return (
      <RutaProtegida sesion={sesion} roles={roles} rutaInicio={rutaInicioPara(sesion)}>
        <div className="app-layout">
          <BarraLateral sesion={sesion} onCerrarSesion={cerrarSesion} />
          <main className="app-contenido">
            <Pagina sesion={sesion} />
          </main>
        </div>
      </RutaProtegida>
    );
  }

  return (
    <Suspense fallback={<main aria-live="polite">Cargando módulo...</main>}>
      <Routes>
        <Route
          path="/"
          element={sesion ? <Navigate to={rutaInicioPara(sesion)} replace /> : <InicioPage onLogin={setSesion} />}
        />
        <Route path="/pacientes" element={paginaProtegida(["psicologo"], PacientesPage)} />
        <Route path="/pacientes/:id" element={paginaProtegida(["psicologo"], PacientePage)} />
        <Route path="/usuarios" element={paginaProtegida(["superadmin"], UsuariosPage)} />
        <Route path="*" element={<Navigate to={rutaInicioPara(sesion)} replace />} />
      </Routes>
    </Suspense>
  );
}
