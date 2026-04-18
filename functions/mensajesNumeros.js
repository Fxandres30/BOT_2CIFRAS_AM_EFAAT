// functions/mensajesNumeros.js

// 🔹 RESERVADOS
export function frasesReservadosConSaludo(saludo, lista) {
  return [
    `*${saludo}*\n\nActualmente tienes reservados:\n🎟️ ${lista}\n\nPendientes de confirmación ⏳`,
    `*${saludo}*\n\nLlevas el número *${lista}* apartado 🔥`,
    `*${saludo}*\n\nPor ahora vas con:\n🎟️ ${lista}\n\nEstán apartados para ti 😉`,
    `*${saludo}*\n\nVas participando con:\n🎟️ ${lista}\n\nCompleta el pago para asegurarlos 💰`,
    `*${saludo}*\n\nYa tienes separados:\n🔥 ${lista}\n\nNo los dejes ir, confírmalos antes de que se liberen ⚠️`,
    `*${saludo}*\n\n*TUS NÚMEROS APARTADOS SON:*\n\n🔹 ${lista}\n\nRecuerda cancelarlos a tiempo para no perderlos 🔥`
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
    `*${saludo}*\n\nEl *${lista}* ya está pago 🔥`,
    `*${saludo}*\n\nTodo listo, *${lista}* confirmados 🎯`
  ];
}

export function frasesPagadosSinSaludo(lista) {
  return [
    `Ya tienes el *${lista}* pago ✅`,
    `Tus números *${lista}* están confirmados 💰`,
    `El *${lista}* ya está cancelado 🔥`,
    `Todo listo, *${lista}* confirmado 🎯`
  ];
}

// 🔹 SIN NÚMEROS
export function frasesSinNumerosConSaludo(saludo) {
  return [
    `${saludo}\n\nAún no tienes números 😅\n\n¿Te aparto unos antes de que se agoten? 🔥`,
    `${saludo}\n\nAún no tienes números registrados 😅`,
    `${saludo}\n\nTodavía no has apartado números para esta dinámica ❌👀`,
    `${saludo}\n\nTodavía no tienes números apartados 🚫👀`,
    `${saludo}\n\nNo tienes números registrados ❌\n\nAún estás a tiempo de entrar 💰`,
    `${saludo}\n\nNo tienes números activos 🚫\n\nAprovecha antes de que se llenen 🔥`
  ];
}

export function frasesSinNumerosSinSaludo() {
  return [
    "*Sin números registrados por ahora 📭*",
    "*Todavía no has apartado números 👀❌*",
    "*Sin números por ahora 🚫*\n\nAprovecha antes de que se acaben 🔥",
    "*Aún no tienes números 😅*\n\n¿Quieres que te aparte algunos? 🔥"
  ];
}

// 🔹 MIXTOS
export function frasesMixtasConSaludo(saludo, reservados, pagados) {
  return [
    `*${saludo}*\n\nAsí vas con tus números 👇\n\n💰 ${pagados}\n📌 ${reservados}\n\nSolo falta confirmar los pendientes 🔥`,
    `*${saludo}*\n\nYa tienes confirmados: *${pagados}* ✅\nY el *${reservados}* aún pendiente de pago 🔥`,
    `*${saludo}*\n\nPor ahora vas con:\n\n💰 ${pagados}\n📌 ${reservados}\n\nConfirma los pendientes para participar 💯`
  ];
}

export function frasesMixtasSinSaludo(listaPagados, listaReservados) {
  return [
    `Vas con estos números 👇\n\n💰 ${listaPagados}\n📌 ${listaReservados}\n\nSolo falta confirmar los pendientes 🔥`,
    `Ya tienes pagos confirmados: *${listaPagados}* ✅\nY el *${listaReservados}* aún pendiente 👀🔥`,
    `Por ahora vas con:\n\n💰 ${listaPagados} cancelados ✅\n📌 ${listaReservados}\n\nConfirma los pendientes 💯`
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