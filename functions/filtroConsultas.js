// functions/filtroConsultas.js

import { normalizarTexto } from "./normalizarTexto.js";

// 🔥 SOLO BLOQUEAR COSAS REALMENTE PROBLEMÁTICAS
const PALABRAS_BLOQUEADAS_CONSULTA = [
  "cancelar",
  "cancelado",
  "libero",
  "consignar",
  "nequi",
  "transferencia"
];

// 🔥 EMOJIS (opcional, mucho más suave)
const EMOJIS_BLOQUEADOS = [
  "🚫", "📭"
];

export function textoPermitidoParaConsulta(texto = "") {

  if (!texto) return false;

  // 🔴 1. EMOJIS (SUAVE)
  for (const emoji of EMOJIS_BLOQUEADOS) {
    if (texto.includes(emoji)) {
      console.log(`🚫 Emoji bloqueado en consulta: ${emoji}`);
      return false;
    }
  }

  // 🧹 2. NORMALIZAR
  const limpio = normalizarTexto(texto);

  // 🔴 3. PALABRAS CRÍTICAS
  return !PALABRAS_BLOQUEADAS_CONSULTA
    .some(p => limpio.includes(p));
}