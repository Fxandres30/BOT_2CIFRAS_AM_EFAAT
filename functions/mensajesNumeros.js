// functions/mensajesNumeros.js

// 🔹 RESERVADOS
export function frasesReservadosConSaludo(saludo, lista) {
  return [
    `*${saludo}*\n\nActualmente tienes reservados:\n🎟️ ${lista}\n\nPendientes de confirmación ⏳`,
    `*${saludo}*\n\nLlevas el numero *${lista}* apartado 🔥`,
    `*${saludo}*\n\nPor ahora vas con:\n🎟️ ${lista}\n\nEstán apartados para ti 😉`,
    `*${saludo}*\n\nVas participando con:\n🎟️ ${lista}\n\nCompleta el pago para asegurarlos 💰`,
    `*${saludo}*\n\nYa tienes separados:\n🔥 ${lista}\n\nNo los dejes ir, confírmalos antes de que se liberen ⚠️`,
    `*${saludo}*\n\n\n*TUS NÚMEROS APARTADOS SON:*\n\n\n*🔹 ${lista}*\n\n\n*Recuerda cancelarlos a tiempo para no perderlos 🔥*`
  ];
}

export function frasesReservadosSinSaludo(lista) {
  return [
    `Tiene el *${lista}* reservado ✅`,
    `Va con el numero *${lista}* hasta el momento 🔥`,
    `Listo, Por ahora llevas el *${lista}* reservados  ✅`,
    `Tus números apartados son : *${lista}* 🎯`
  ];
}

// 🔹 PAGADOS
export function frasesPagadosConSaludo(saludo, lista) {
  return [
    `*${saludo}*\n\nYa tiene el *${lista}* pagos ✅`,
    `*${saludo}*\n\nTus números *${lista}* están confirmados 💰`,
    `*${saludo}*\n\nEl *${lista}* ya está pago 🔥`,
    `*${saludo}*\n\nTodo listo, *${lista}* confirmados 🎯`
  ];
}

export function frasesPagadosSinSaludo(lista) {
  return [
    `Ya tienes el *${lista}* pagos ✅`,
    `Tus números *${lista}* están confirmados 💰`,
    `El *${lista}* ya están candelados 🔥`,
    `Todo listo, *${lista}* confirmado 🎯`
  ];
}

// 🔹 SIN NÚMEROS
export function frasesSinNumerosConSaludo(saludo) {
  return [
    `${saludo}\n\nAún no tienes números 😅\n\n¿Te aparto unos antes de que se agoten? 🔥`,
    `${saludo}\n\nAún no tienes números registrados 😅`,
    `${saludo}\n\nTodavía no has apartado números para esta dinamica ❌👀`,
    `${saludo}\n\nTodavía no tiene numeros apartados 🚫👀`,
    `${saludo}\n\nTodavía no tienes números 😅\n\nEstamos a tiempo 🔥`,
    `${saludo}\n\nNo tienes números registrados ❌\n\nAún estás a tiempo de entrar 💰`,
    `${saludo}\n\nNo tienes números en esta dinámica por ahora 🚫`,
    `${saludo}\n\nNo tienes números activos 🚫\n\nAprovecha antes de que se llenen 🔥`,
    `${saludo}\n\nAún no tienes números reservados 😅\n\nPero tranquilo, todavía hay disponibles 😉`
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
    `*${saludo}*\n\nYa tienes confirmados: *${pagados}* ✅\nY el *${reservados}* aun pendiente de pago. 🔥`,
    `*${saludo}*\n\nPor ahora vas con:\n\n💰 ${pagados}\n📌 ${reservados}\n\nConfirma los pendientes para poder participar 💯`
  ];
}

export function frasesMixtasSinSaludo(listaPagados, listaReservados) {
  return [
    `Vas con estos números 👇\n\n💰 ${listaPagados}\n📌 ${listaReservados}\n\nSolo falta confirmar los pendientes 🔥`,
    `Ya tienes pagosy cofiramods el: *${listaPagados}* ✅\nY el *${listaReservados}* aun pendiente de pago. 👀🔥`,
    `Por ahora vas con:\n\n💰 ${listaPagados} ya cancelados ✅\n 📌 ${listaReservados}\n\nConfirma los pendientes para poder participar 💯`
  ];
}