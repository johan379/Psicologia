type Mariposa = { color: string; top: string; left: string; tamano: number; duracion: number; retraso: number };

const MARIPOSAS: Mariposa[] = [
  { color: "#ff4d94", top: "12%", left: "8%", tamano: 34, duracion: 21, retraso: 0 },
  { color: "#ffb238", top: "68%", left: "12%", tamano: 24, duracion: 26, retraso: 3 },
  { color: "#7c5cff", top: "18%", left: "82%", tamano: 30, duracion: 19, retraso: 1.4 },
  { color: "#22d3c5", top: "62%", left: "86%", tamano: 22, duracion: 24, retraso: 4.2 },
  { color: "#ff6b6b", top: "42%", left: "48%", tamano: 20, duracion: 27, retraso: 2.1 },
  { color: "#ffd23f", top: "82%", left: "55%", tamano: 26, duracion: 23, retraso: 5 },
];

/** Fondo decorativo del login: mariposas de colores revoloteando. Puro
 * SVG + CSS (mismo enfoque que EscenaTecho de Inventario), sin dependencias. */
function EscenaMariposas() {
  return (
    <div className="inicio-mariposas" aria-hidden="true">
      {MARIPOSAS.map((m, i) => (
        <span
          key={i}
          className="mariposa"
          style={{
            top: m.top,
            left: m.left,
            width: m.tamano,
            height: m.tamano,
            color: m.color,
            animationDuration: `${m.duracion}s`,
            animationDelay: `${m.retraso}s`,
          }}
        >
          <svg viewBox="0 0 60 60" className="mariposa-svg">
            <path className="mariposa-ala-izq" d="M30 30 C10 6, -8 12, 3 32 C9 47, 25 41, 30 30 Z" fill="currentColor" />
            <path className="mariposa-ala-der" d="M30 30 C50 6, 68 12, 57 32 C51 47, 35 41, 30 30 Z" fill="currentColor" />
            <ellipse cx="30" cy="30" rx="1.6" ry="11" fill="#2b2b2b" />
          </svg>
        </span>
      ))}
    </div>
  );
}

export default EscenaMariposas;
