// mensajes.js

export const mensajesTodosLibres = [
 `✅ 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒 📱\n\n                   ⋆ ᴱᶠᵃᵃᵗ ⋆\n\n`,
  `✅ 𝐓𝐔𝐒 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐇𝐀𝐍 𝐒𝐈𝐃𝐎 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒 𝐂𝐎𝐍 É𝐗𝐈𝐓𝐎 📱\n\n                   ⋆ ᴱᶠᵃᵃᵗ ⋆\n\n`,
  `✅ 𝐋𝐈𝐒𝐓𝐎, 𝐓𝐔𝐒 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐄𝐒𝐓Á𝐍 𝐀𝐏𝐀𝐑𝐓𝐀𝐃𝐎𝐒 📱\n\n                   ⋆ ᴱᶠᵃᵃᵗ ⋆\n\n`,
  `➤ 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒 📱\n\n                   ⋆ ᴱᶠᵃᵃᵗ ⋆\n\n`,
  `✅ 𝐑𝐄𝐒𝐄𝐑𝐕𝐀 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐃𝐀 📌\n\n                   ⋆ ᴱᶠᵃᵃᵗ ⋆\n\n`,
  `📲 𝐋𝐈𝐒𝐓𝐎! 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐀𝐏𝐀𝐑𝐓𝐀𝐃𝐎𝐒 📝\n\n                   ⋆ ᴱᶠᵃᵃᵗ ⋆\n\n`,
  `🛡️ 𝐒𝐄 𝐇𝐀𝐍 𝐀𝐏𝐀𝐑𝐓𝐀𝐃𝐎 𝐓𝐔𝐒 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 ✔️\n\n                   ⋆ ᴱᶠᵃᵃᵗ ⋆\n\n`,
  `📌 𝐓𝐔𝐒 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐐𝐔𝐄𝐃𝐀𝐍 𝐀𝐏𝐀𝐑𝐓𝐀𝐃𝐎𝐒 📲\n\n                   ⋆ ᴱᶠᵃᵃᵗ ⋆\n\n`
];

export const mensajesTodosOcupados = [
`❌ 𝐍𝐎 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐋𝐄𝐒:\n\n                   ⋆ ᴱᶠᵃᵃᵗ ⋆\n\n`,
];

// 🔥 NUEVO SOLO PARA ESOS 2 RENGLONES

// 🔥 NUEVO SOLO PARA ESOS 2 RENGLONES (MISMA TIPOGRAFÍA)

export const encabezadosReservados = [
  "𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒: *( {numeros} ).* ✅",
  "𝐄𝐒𝐓𝐎𝐒 𝐘𝐀 𝐒𝐎𝐍 𝐓𝐔𝐘𝐎𝐒 *( {numeros} ). ✅*",
  "𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒 𝐂𝐎𝐑𝐑𝐄𝐂𝐓𝐀𝐌𝐄𝐍𝐓𝐄 *( {numeros} )*. ✅",
  "𝐐𝐔𝐄𝐃𝐀𝐒 𝐂𝐎𝐍 𝐄𝐋 *( {numeros} )* 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒. ✅"
];

export const encabezadosOcupados = [
  "𝐍𝐎 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐋𝐄𝐒: *( {numeros} ).* ❌",
  "𝐘𝐀 𝐅𝐔𝐄𝐑𝐎𝐍 𝐓𝐎𝐌𝐀𝐃𝐎𝐒 *( {numeros} ). 🚫*"
];

export function mensajeAleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}
