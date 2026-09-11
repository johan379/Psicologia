import assert from "node:assert/strict";
import test from "node:test";
import { dentroDeRango, formatearFecha } from "../src/Utils/fechas.ts";

test("unidad: formatea fecha ISO a dd/mm/aaaa", () => {
  assert.equal(formatearFecha("2026-09-10T14:00:00Z"), "10/09/2026");
});

test("unidad: formatea fecha sin hora sin desfase de zona horaria", () => {
  assert.equal(formatearFecha("2026-09-10"), "10/09/2026");
});

test("unidad: formatearFecha devuelve — para valores vacíos o inválidos", () => {
  assert.equal(formatearFecha(null), "—");
  assert.equal(formatearFecha("no-es-fecha"), "—");
});

test("unidad: dentroDeRango filtra correctamente por desde/hasta", () => {
  assert.equal(dentroDeRango("2026-09-05T10:00:00Z", "2026-09-01", "2026-09-10"), true);
  assert.equal(dentroDeRango("2026-09-15T10:00:00Z", "2026-09-01", "2026-09-10"), false);
  assert.equal(dentroDeRango("2026-08-01T10:00:00Z", "2026-09-01", ""), false);
  assert.equal(dentroDeRango("2026-09-05T10:00:00Z", "", ""), true);
});
