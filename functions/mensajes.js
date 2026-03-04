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

export function mensajeAleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}
