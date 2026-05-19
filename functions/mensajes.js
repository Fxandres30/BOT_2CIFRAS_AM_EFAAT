/* 🔥 TODOS LIBRES */
export const mensajesTodosLibres = [

`✅ 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒 📱

                   ⋆ ᴱᶠᵃᵃᵗ ⋆`,

`✅ 𝐓𝐔𝐒 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐇𝐀𝐍 𝐒𝐈𝐃𝐎 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒 𝐂𝐎𝐍 É𝐗𝐈𝐓𝐎 📱

                   ⋆ ᴱᶠᵃᵃᵗ ⋆`,

`✅ 𝐋𝐈𝐒𝐓𝐎, 𝐓𝐔𝐒 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐄𝐒𝐓Á𝐍 𝐀𝐏𝐀𝐑𝐓𝐀𝐃𝐎𝐒 📱

                   ⋆ ᴱᶠᵃᵃᵗ ⋆`,

`➤ 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒 📱

                   ⋆ ᴱᶠᵃᵃᵗ ⋆`,

`✅ 𝐑𝐄𝐒𝐄𝐑𝐕𝐀 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐃𝐀 📌

                   ⋆ ᴱᶠᵃᵃᵗ ⋆`,

`📲 𝐋𝐈𝐒𝐓𝐎! 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐀𝐏𝐀𝐑𝐓𝐀𝐃𝐎𝐒 📝

                   ⋆ ᴱᶠᵃᵃᵗ ⋆`,

`🛡️ 𝐒𝐄 𝐇𝐀𝐍 𝐀𝐏𝐀𝐑𝐓𝐀𝐃𝐎 𝐓𝐔𝐒 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 ✔️

                   ⋆ ᴱᶠᵃᵃᵗ ⋆`,

`📌 𝐓𝐔𝐒 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐐𝐔𝐄𝐃𝐀𝐍 𝐀𝐏𝐀𝐑𝐓𝐀𝐃𝐎𝐒 📲

                   ⋆ ᴱᶠᵃᵃᵗ ⋆`

];

/* 🔥 TODOS OCUPADOS */
export const mensajesTodosOcupados = [

`❌ 𝐍𝐎 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐋𝐄𝐒

                   ⋆ ᴱᶠᵃᵃᵗ ⋆`,

`🚫 𝐄𝐒𝐎𝐒 𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐘𝐀 𝐅𝐔𝐄𝐑𝐎𝐍 𝐓𝐎𝐌𝐀𝐃𝐎𝐒

                   ⋆ ᴱᶠᵃᵃᵗ ⋆`

];

/* 🔥 RESERVADOS PARCIALES */
export const encabezadosReservados = [

"𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒 *( {numeros} )* ✅",

"𝐄𝐒𝐓𝐎𝐒 𝐘𝐀 𝐒𝐎𝐍 𝐓𝐔𝐘𝐎𝐒 *( {numeros} )* ✅",

"𝐍𝐔𝐌𝐄𝐑𝐎𝐒 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒 𝐂𝐎𝐑𝐑𝐄𝐂𝐓𝐀𝐌𝐄𝐍𝐓𝐄 *( {numeros} )* ✅",

"𝐐𝐔𝐄𝐃𝐀𝐒 𝐂𝐎𝐍 𝐋𝐎𝐒 *( {numeros} )* 𝐑𝐄𝐒𝐄𝐑𝐕𝐀𝐃𝐎𝐒 ✅"

];

/* 🔥 OCUPADOS PARCIALES */
export const encabezadosOcupados = [

"𝐍𝐎 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐋𝐄𝐒 *( {numeros} )* ❌",

"𝐘𝐀 𝐅𝐔𝐄𝐑𝐎𝐍 𝐓𝐎𝐌𝐀𝐃𝐎𝐒 *( {numeros} )* 🚫"

];

/* 🔥 MENSAJE ALEATORIO */
export function mensajeAleatorio(
  lista = []
) {

  return lista[
    Math.floor(
      Math.random() *
      lista.length
    )
  ];
}
