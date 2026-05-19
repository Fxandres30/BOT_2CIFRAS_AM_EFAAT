// functions/mensajesNumeros.js

// 🔹 RESERVADOS
export function frasesReservadosConSaludo(saludo, lista) {
  return [
    `*${saludo}*\n\nActualmente tienes reservados:\n🎟️ ${lista}\n\nPendientes de confirmación ⏳`,
    `*${saludo}*\n\nLlevas el número *${lista}* apartado 🔥`,
    `*${saludo}*\n\nPor ahora vas con:\n🎟️ *${lista}*\n\nEstán apartados para ti 😉`,
    `*${saludo}*\n\nVas participando con:\n🎟️ *${lista}*\n\nCompleta el pago para asegurarlos 💰`,
    `*${saludo}*\n\nYa tienes separados:\n🔥 *${lista}*\n\nNo los dejes ir, confírmalos antes de que se liberen ⚠️`,
    `*${saludo}*\n\n*TUS NÚMEROS APARTADOS SON:*\n\n🔹 *${lista}*\n\nRecuerda cancelarlos a tiempo para no perderlos 🔥`
  ];
}

export function frasesReservadosSinSaludo(lista) {
  return [
    `Tienes el *${lista}* reservado ✅`,
    `Vas con el número *${lista}* hasta el momento 🔥`,
    `Listo, por ahora llevas el *${lista}* reservado ✅`,
    `Tus números apartados son: *${lista}* 🎯`
  ];
}

// 🔹 PAGADOS
export function frasesPagadosConSaludo(saludo, lista) {
  return [
    `*${saludo}*\n\nYa tienes el *${lista}* pago ✅`,
    `*${saludo}*\n\nTus números *${lista}* están confirmados 💰`,
    `*${saludo}*\n\n*Tiene el *${lista}* pero ya estan cancelados* 🔥✅*`,
    `*${saludo}*\n\nTodo listo, *${lista}* confirmados 🎯`
  ];
}

export function frasesPagadosSinSaludo(lista) {
  return [
    `Ya tienes el *${lista}* pagos ✅`,
    `Tus números *${lista}* ya están confirmados 💰`,
    `Tiene el *${lista}* ya cancelados 🔥`,
    `Todo listo, *${lista}* ya estan confirmados 🎯`
  ];
}

// 🔹 SIN NÚMEROS
export function frasesSinNumerosConSaludo(saludo) {
  return [
    `${saludo}\n\n*Aún no tienes números reservados* 😅\n\n*¿Te aparto unos antes de que se agoten? 🔥*`,
    `${saludo}\n\n*Aún no tienes números registrados 😅*`,
    `${saludo}\n\nTodavía no has apartado números para esta dinámica ❌👀`,
    `${saludo}\n\n*Todavía no tienes números apartados 🚫👀*`,
    `${saludo}\n\n*No tienes números registrados ❌*\n\nAún estás a tiempo de entrar 💰`,
    `${saludo}\n\n*No tienes números activos 🚫*\n\nAprovecha antes de que se llenen 🔥`
  ];
}

export function frasesSinNumerosSinSaludo() {
  return [
    "*Sin números registrados por ahora 📭*",
    "*Todavía no has apartado números 👀❌*",
    "*Sin números por ahora 🚫*\n\n*Aprovecha antes de que se acaben* 🔥",
    "*Aún no tienes números 😅*\n\n*¿Quieres que te aparte algunos?* 🔥"
  ];
}

// 🔹 MIXTOS
export function frasesMixtasConSaludo(saludo, reservados, pagados) {
  return [
    `*${saludo}*\n\nAsí vas con tus números 👇\n\n💰 *${pagados}* ya estan cancelados ✅\n📌 *${reservados}* pendientes por cancelar 👀\n\nSolo falta confirmar los pendientes 🔥`,
    `*${saludo}*\n\nYa tienes confirmados el *${pagados}* ✅\nY el *${reservados}* aún pendiente de pago 🔥`,
    `*${saludo}*\n\nPor ahora vas con el\n\n💰 *${pagados}*\n📌 *${reservados}*\n\nConfirma los pendientes para participar 💯`
  ];
}

export function frasesMixtasSinSaludo(listaPagados, listaReservados) {
  return [
    `*Vas con estos números 👇*\n\n💰 *${listaPagados}* ya cancelados. \n📌 *${listaReservados}* aun sin cancelar.👀 \n\n*Solo falta confirmar los pendientes 🔥*`,
    `Ya tienes pagos y confirmados el *${listaPagados}* ✅\n\nY el *${listaReservados}* aún pendiente por cancelar 👀🔥`,
    `Por ahora va con el *${listaPagados}* ya cancelados ✅\n\n📌 y el *${listaReservados}* aun pendientes de pago.\n\n*Confirma los pendientes. 💯*`
  ];
}

// 🔥 ALIAS (CLAVE PARA QUE FUNCIONE TU OTRO ARCHIVO)

export const reservadosConSaludo = frasesReservadosConSaludo;
export const reservadosSinSaludo = frasesReservadosSinSaludo;

export const pagadosConSaludo = frasesPagadosConSaludo;
export const pagadosSinSaludo = frasesPagadosSinSaludo;

export const sinNumerosConSaludo = frasesSinNumerosConSaludo;
export const sinNumerosSinSaludo = frasesSinNumerosSinSaludo;

export const mixtosConSaludo = frasesMixtasConSaludo;
export const mixtosSinSaludo = frasesMixtasSinSaludo;