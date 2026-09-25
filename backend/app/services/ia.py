"""Generación de reportes integrados de un paciente con IA (Groq, capa
gratuita, modelos Llama). Todas las sesiones registradas se combinan en un
solo prompt para que el modelo entregue una síntesis clínica coherente —
conectando temas entre sesiones distintas— en vez de un resumen sesión
por sesión."""

import time

from groq import Groq
from groq import APIStatusError

from app.core.config import settings
from app.models.paciente import Paciente
from app.models.sesion import Sesion

_cliente: Groq | None = None

# Los picos de demanda de la capa gratuita son ocasionales (error 503/429) —
# un par de reintentos con espera suelen bastar para que la misma petición
# sí se complete.
_INTENTOS = 3
_ESPERA_SEGUNDOS = 5


def _obtener_cliente() -> Groq:
    global _cliente
    if not settings.GROQ_API_KEY:
        raise ValueError(
            "GROQ_API_KEY no está configurada. Consigue una clave gratuita en "
            "https://console.groq.com/keys y agrégala al archivo .env del backend."
        )
    if _cliente is None:
        _cliente = Groq(api_key=settings.GROQ_API_KEY)
    return _cliente


def _bloque_sesion(sesion: Sesion) -> str:
    partes = [
        f"Sesión #{sesion.numero_sesion} — {sesion.fecha.strftime('%Y-%m-%d')}",
        f"Tema/motivo: {sesion.motivo_tema}",
        f"Notas: {sesion.descripcion_notas}",
    ]
    if sesion.observaciones:
        partes.append(f"Observaciones: {sesion.observaciones}")
    if sesion.intervenciones_realizadas:
        partes.append(f"Intervenciones realizadas: {sesion.intervenciones_realizadas}")
    if sesion.evolucion_paciente:
        partes.append(f"Evolución del paciente: {sesion.evolucion_paciente}")
    if sesion.tareas_recomendaciones:
        partes.append(f"Tareas/recomendaciones: {sesion.tareas_recomendaciones}")
    if sesion.notas_adicionales:
        partes.append(f"Notas adicionales: {sesion.notas_adicionales}")
    return "\n".join(partes)


def _construir_prompt(paciente: Paciente, sesiones: list[Sesion]) -> str:
    historial = "\n\n".join(_bloque_sesion(s) for s in sesiones)

    return f"""Eres un asistente clínico que ayuda a un psicólogo a redactar reportes de seguimiento.

Paciente: {paciente.nombre_completo}
Motivo de consulta inicial: {paciente.motivo_consulta}
Estado del proceso: {paciente.estado_proceso.value}

A continuación tienes las notas de TODAS las sesiones registradas de este paciente, en orden cronológico. Tu tarea es redactar UN SOLO reporte integrado (no un resumen sesión por sesión) que:

1. Sintetice los temas y problemáticas abordados a lo largo de todo el proceso, conectando entre sí los distintos temas cuando corresponda (por ejemplo, si en una sesión se habló de ansiedad y en otra de problemas familiares, señala si el reporte encuentra relación entre ambos en vez de listarlos por separado).
2. Describa la evolución del paciente a lo largo del tiempo.
3. Resuma las intervenciones realizadas y su efecto aparente.
4. Liste tareas o recomendaciones pendientes o relevantes.
5. Termine con una sección breve de impresión clínica general y sugerencias para las próximas sesiones.

Usa un tono profesional, clínico y objetivo, en español. Organiza el reporte con subtítulos claros. No inventes información que no esté en las notas.

Notas de las sesiones:

{historial}
"""


def generar_reporte_integrado(paciente: Paciente, sesiones: list[Sesion]) -> str:
    if not sesiones:
        raise ValueError("El paciente no tiene sesiones registradas todavía.")

    cliente = _obtener_cliente()
    prompt = _construir_prompt(paciente, sesiones)

    ultimo_error: APIStatusError | None = None
    for intento in range(1, _INTENTOS + 1):
        try:
            respuesta = cliente.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=4096,
            )
            contenido = (respuesta.choices[0].message.content or "").strip()
            if not contenido:
                raise ValueError("El modelo no devolvió contenido. Intenta de nuevo en unos segundos.")
            return contenido
        except APIStatusError as err:
            ultimo_error = err
            if err.status_code not in (429, 500, 502, 503) or intento == _INTENTOS:
                raise ValueError(f"No se pudo generar el reporte (Groq respondió {err.status_code}).") from err
            time.sleep(_ESPERA_SEGUNDOS)

    raise ValueError(
        "El servicio de IA está saturado en este momento. Intenta de nuevo en un minuto."
    ) from ultimo_error
