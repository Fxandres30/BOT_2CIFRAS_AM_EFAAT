import { normalizarTexto } from "./normalizarTexto.js";

export const PALABRAS_NO_PERMITIDAS = [
  "ok", "cancelo", "cancelar", "cancelado", "libero",
  "listo", "vale", "libero", "minutos","mande", "querido",
  "pm", "hora", "horas", "mañana", "quedan", "personas", 
  "dale", "de acuerdo", "perfecto", "familia", "consignar",
  "confirmado", "gana", "premio", "sorteo", "nequi",
  "❌", "✅", "✨", "🚨", "📊",   // 👈 emojis prohibidos
  "pago", "pague", "tengo", "estaba", "solo", "ultimos",
  "pagado", "reservado", "reservar", "reservados",
  "grupo", "persona", 
];

export function textoPermitidoParaReserva(texto) {

  // 🔴 1. BLOQUEAR EMOJIS PROHIBIDOS (TEXTO ORIGINAL)
  for (const palabra of PALABRAS_NO_PERMITIDAS) {
    if (palabra.includes("❌") || palabra.includes("✅")) {
      if (texto.includes(palabra)) {
        console.log(`🚫 Emoji no permitido detectado: ${palabra}`);
        return false;
      }
    }
  }

  // 🧹 2. NORMALIZAR TEXTO
  const limpio = normalizarTexto(texto);
  console.log("🧹 Texto normalizado:", limpio);

  // 🔴 3. VALIDAR PALABRAS PROHIBIDAS NORMALES
  return !PALABRAS_NO_PERMITIDAS
    .filter(p => !p.includes("❌") && !p.includes("✅"))
    .some(p => limpio.includes(p));
}
