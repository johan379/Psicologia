import { useEffect, useRef } from "react";

/** Repite `callback` cada `intervaloMs` mientras la pestaña esté visible, y
 * de inmediato al volver a ella — así un cambio hecho desde otro
 * dispositivo se refleja solo, sin recargar la página. */
export function useActualizacionPeriodica(callback: () => void, intervaloMs: number) {
  const callbackRef = useRef(callback);
  useEffect(() => { callbackRef.current = callback; });

  useEffect(() => {
    function tick() {
      if (document.visibilityState === "visible") callbackRef.current();
    }
    const id = setInterval(tick, intervaloMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervaloMs]);
}
