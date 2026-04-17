// functions/consultasNumeros.js

import { textoPermitidoParaConsulta } from "./filtroConsultas.js";
import { ahoraColombia } from "./tiempoColombia.js";

// 🔹 LIMPIAR TEXTO
function limpiarTexto(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s]/g, "")
    .trim();
}

// 🔥 DETECCIÓN INTELIGENTE (PRO)
export function esConsultaNumeros(texto = "") {

  if (!texto) return false;

  if (texto.length > 60) {
    console.log("🚫 Mensaje muy largo, ignorado");
    return false;
  }

  const t = limpiarTexto(texto);

  const esDisponibilidad =
    /\b(quedan|queda|hay|disponible|disponibles)\b/.test(t);

  if (esDisponibilidad) {
    console.log("🚫 Consulta de disponibilidad, ignorada");
    return false;
  }

  if (!textoPermitidoParaConsulta(texto)) {
    console.log("🚫 Bloqueado en filtro de consulta");
    return false;
  }

  const tieneIntencion =
    t.includes("debo") ||
    t.includes("tengo") ||
    t.includes("mis numeros") ||
    t.includes("mis numero") ||
    t.includes("que tengo") ||
    t.includes("cuales son mis numeros") ||
    t.includes("numeros mios") ||
    t.includes("mis num") ||
    t.includes("mis nums") ||
    t.includes("numeros tengo");

  const casosCortos =
    t.includes("q tengo") ||
    t.includes("k tengo") ||
    t.includes("q debo") ||
    t.includes("k debo") ||
    t === "tengo" ||
    t === "debo" ||
    t === "mis numeros";

  return tieneIntencion || casosCortos;
}

// 🔹 DETECTAR SALUDO
function tieneSaludo(texto = "") {
  const t = limpiarTexto(texto);
  const palabras = t.split(/\s+/);

  return palabras.some(p =>
    p.startsWith("hol") ||
    p.startsWith("ola") ||
    p.startsWith("buen") ||
    p === "hey" ||
    p === "ey"
  );
}

// 🔹 SALUDO POR HORA
function obtenerSaludoPorHora() {
  const hora = ahoraColombia().getHours();

  const maniana = [
    "Buen día ☀️",
    "Muy buenos días 🌅",
    "Hola, buen día 👋"
  ];

  const tarde = [
    "Buenas tardes 🌆",
    "Hola, buenas tardes 👋"
  ];

  const noche = [
    "Buenas noches 🌙",
    "Hola, buenas noches 👋"
  ];

  let lista = [];

  if (hora >= 5 && hora < 12) lista = maniana;
  else if (hora >= 12 && hora < 19) lista = tarde;
  else lista = noche;

  return lista[Math.floor(Math.random() * lista.length)];
}

// 🔹 RESERVADOS
function frasesConSaludo(saludo, lista) {
  return [
    `*${saludo}*\n\nActualmente tienes reservados:\n🎟️ ${lista}\n\nPendientes de confirmación ⏳`,
    `*${saludo}*\n\nLlevas el numero *${lista}* apartado 🔥`,
    `*${saludo}*\n\nPor ahora vas con:\n🎟️ ${lista}\n\nEstán apartados para ti 😉`,
    `*${saludo}*\n\nVas participando con:\n🎟️ ${lista}\n\nCompleta el pago para asegurarlos 💰`,
    `*${saludo}*\n\nYa tienes separados:\n🔥 ${lista}\n\nNo los dejes ir, confírmalos antes de que se liberen ⚠️`,
    `*${saludo}*\n\nTus números apartados son:\n📌 ${lista}\n\nRecuerda cancelarlos a tiempo para no perderlos 🔥`,
  ];
}

function frasesSinSaludo(lista) {
  return [
    `Tiene el *${lista}* reservado ✅`,
    `Va con el numero *${lista}* hasta el momento 🔥`,
    `Listo, Por ahora llevas el *${lista}* reservados  ✅`,
    `Tus números apartados son : *${lista}* 🎯`
  ];
}

// 🔹 PAGADOS
function frasesPagadasConSaludo(saludo, lista) {
  return [
    `*${saludo}*\n\nYa tiene el *${lista}* pagos ✅`,
    `*${saludo}*\n\nTus números *${lista}* están confirmados 💰`,
    `*${saludo}*\n\nEl *${lista}* ya está pago 🔥`,
    `*${saludo}*\n\nTodo listo, *${lista}* confirmados 🎯`
  ];
}

function frasesPagadasSinSaludo(lista) {
  return [
    `Ya tienes el *${lista}* pagos ✅`,
    `Tus números *${lista}* están confirmados 💰`,
    `El *${lista}* ya están candelados 🔥`,
    `Todo listo, *${lista}* confirmado 🎯`
  ];
}

// 🔥 FUNCIÓN PRINCIPAL
export function respuestaAleatoriaNumeros(
  numeros = [],
  textoUsuario = "",
  estado = "reservado"
) {

  if (!textoUsuario) return null;

  const lista = numeros.length
    ? `( ${numeros.join(" - ")} )`
    : "ninguno";

  const conSaludo = tieneSaludo(textoUsuario);
  const saludoHora = obtenerSaludoPorHora();

  let respuestas = [];

  if (estado === "pagado") {
    respuestas = conSaludo
      ? frasesPagadasConSaludo(saludoHora, lista)
      : frasesPagadasSinSaludo(lista);
  } else {
    respuestas = conSaludo
      ? frasesConSaludo(saludoHora, lista)
      : frasesSinSaludo(lista);
  }

  return respuestas[Math.floor(Math.random() * respuestas.length)];
}

// 🔥 SIN NÚMEROS
export function respuestaSinNumeros(textoUsuario = "") {

  const conSaludo = tieneSaludo(textoUsuario);
  const saludoHora = obtenerSaludoPorHora();

  const conSaludoRespuestas = [
    `${saludoHora}\n\nAún no tienes números 😅\n\n¿Te aparto unos antes de que se agoten? 🔥`,
    `${saludoHora}\n\nAún no tienes números registrados 😅`,
    `${saludoHora}\n\nTodavía no has apartado números para esta dinamica ❌👀`,
    `${saludoHora}\n\nTodavía no tiene numeros apartados 🚫👀`,
    `${saludoHora}\n\nTodavía no tienes números 😅\n\nEstamos a tiempo 🔥`,
    `${saludoHora}\n\nNo tienes números registrados ❌\n\nAún estás a tiempo de entrar 💰`,
    `${saludoHora}\n\nNo tienes números en esta dinámica por ahora 🚫`,
    `${saludoHora}\n\nNo tienes números activos 🚫\n\nAprovecha antes de que se llenen 🔥`,
    `${saludoHora}\n\nAún no tienes números reservados 😅\n\nPero tranquilo, todavía hay disponibles 😉`
  ];

  const sinSaludoRespuestas = [
    "*Sin números registrados por ahora 📭*",
    "*Todavía no has apartado números 👀❌*",
    "*Sin números por ahora 🚫*\n\nAprovecha antes de que se acaben 🔥",
    "*Aún no tienes números 😅*\n\n¿Quieres que te aparte algunos? 🔥"
  ];

  const respuestas = conSaludo
    ? conSaludoRespuestas
    : sinSaludoRespuestas;

  return respuestas[Math.floor(Math.random() * respuestas.length)];
}

// 🔥 MIXTO
function frasesMixtas(saludo, reservados, pagados) {
  return [
    `*${saludo}*\n\nAsí vas con tus números 👇\n\n💰 ${pagados}\n📌 ${reservados}\n\nSolo falta confirmar los pendientes 🔥`,
    `*${saludo}*\n\nYa tienes confirmados: *${pagados}* ✅\nY el *${reservados}* aun pendiente de pago. 🔥`,
    `*${saludo}*\n\nPor ahora vas con:\n\n💰 ${pagados}\n📌 ${reservados}\n\nConfirma los pendientes para poder participar 💯`
    
  ];
}

export function respuestaMixta(reservados = [], pagados = [], textoUsuario = "") {

  const conSaludo = tieneSaludo(textoUsuario);
  const saludoHora = obtenerSaludoPorHora();

  const listaReservados = reservados.length
    ? `( ${reservados.join(" - ")} )`
    : "ninguno";

  const listaPagados = pagados.length
    ? `( ${pagados.join(" - ")} )`
    : "ninguno";

  let respuestas = [];

  if (conSaludo) {
    respuestas = frasesMixtas(saludoHora, listaReservados, listaPagados);
  } else {
    respuestas = [
      `Vas con estos números 👇\n\n💰 ${listaPagados}\n📌 ${listaReservados}\n\nSolo falta confirmar los pendientes 🔥`,
      `Ya tienes pagosy cofiramods el: *${listaPagados}* ✅\nY el *${listaReservados}* aun pendiente de pago. 👀🔥`,
      `Por ahora vas con:\n\n💰 ${listaPagados} ya cancelados ✅\n 📌 ${listaReservados}\n\nConfirma los pendientes para poder participar 💯`
    ];
  }

  return respuestas[Math.floor(Math.random() * respuestas.length)];
}