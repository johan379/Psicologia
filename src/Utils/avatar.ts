const PALETA_AVATAR = ["#ff4d94", "#7c5cff", "#22d3c5", "#ff9a56", "#ff6b6b", "#ffb238"];

/** Iniciales (máx. 2) a partir del nombre completo, para el avatar del paciente. */
export function inicialesDe(nombreCompleto: string): string {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primera = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primera + ultima).toUpperCase();
}

/** Color de avatar estable por id, ciclando una paleta viva. */
export function colorAvatar(id: number): string {
  return PALETA_AVATAR[id % PALETA_AVATAR.length];
}
