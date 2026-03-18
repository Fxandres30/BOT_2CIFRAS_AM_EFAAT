// functions/consultasNumeros.js

export const consultasNumeros = [
  "que debo",
  "debo",
  "tengo numeros",
  "tengo números",
  "mis numeros",
  "mis números",
  "cuales son mis numeros",
  "cuáles son mis números",
  "que tengo",
  "qué tengo"
];

export function esConsultaNumeros(texto = "") {
  const t = texto.toLowerCase().trim();
  return consultasNumeros.some(p => t.includes(p));
}

/* 🔥 RESPUESTA CUANDO SÍ TIENE NÚMEROS */
export function respuestaAleatoriaNumeros(numeros, nombreGrupo = "") {

  const lista = numeros.map(n => `• ${n}`).join("\n");

  const respuestas = [
`📊 Tus números${nombreGrupo ? ` en ${nombreGrupo}` : ""}:

${lista}`,

`🎯 Estas son tus jugadas${nombreGrupo ? ` (${nombreGrupo})` : ""}:

${lista}`,

`🔥 Números activos:

${lista}`,

`👀 Tienes apartados:

${lista}`,

`💰 Vas con:

${lista}`
  ];

  return respuestas[Math.floor(Math.random() * respuestas.length)];
}

/* ❌ CUANDO NO TIENE */
export function respuestaSinNumeros() {
  const respuestas = [
    "😅 Aún no tienes números registrados.",
    "❌ No veo jugadas tuyas todavía.",
    "👀 Todavía no has apartado números.",
    "🚫 No tienes números en este momento.",
    "📭 No tienes reservas aún."
  ];

  return respuestas[Math.floor(Math.random() * respuestas.length)];
}