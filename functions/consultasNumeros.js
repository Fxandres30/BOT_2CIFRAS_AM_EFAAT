// functions/consultasNumeros.js

import { textoPermitidoParaReserva } from "./reglasReserva.js";

// 🔹 LIMPIAR TEXTO
function limpiarTexto(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s]/g, "")
    .trim();
}

// 🔥 DETECCIÓN INTELIGENTE (FULL PRO)
export function esConsultaNumeros(texto = "") {

  if (!texto) return false;

  // 🚫 FILTRO 1: LONGITUD (ANTI-SPAM)
  if (texto.length > 60) {
    console.log("🚫 Mensaje muy largo, ignorado");
    return false;
  }

  // 🚫 FILTRO 2: PALABRAS PROHIBIDAS
  if (!textoPermitidoParaReserva(texto)) {
    console.log("🚫 Bloqueado por palabras prohibidas");
    return false;
  }

  const t = limpiarTexto(texto);

  // 🧠 INTENCIÓN REAL
  const tieneIntencion =
    t.includes("debo") ||
    t.includes("tengo") ||
    t.includes("mis numeros") ||
    t.includes("mis números") ||
    t.includes("que tengo") ||
    t.includes("cuales son mis numeros");

  // ⚡ CASOS CORTOS
  const casosCortos =
    t.includes("q tengo") ||
    t.includes("k tengo") ||
    t.includes("q debo") ||
    t.includes("k debo");

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
  const hora = new Date().getHours();

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
    `*${saludo}*\n\nTienes el *${lista}* reservado ✅`,
    `*${saludo}*\n\nLlevas el *${lista}* apartado 🔥`,
    `*${saludo}*\n\nVas con el *${lista}* confirmado 🎯`,
    `*${saludo}*\n\nTienes el *${lista}* asegurado 👀`
  ];
}

function frasesSinSaludo(lista) {
  return [
    `Tiene el *${lista}* reservado ✅`,
    `Vas con *${lista}* hasta el momento 🔥`,
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

  const lista = `( ${numeros.join(" - ")} )`;

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
    `${saludoHora}\n\nAún no tienes números registrados 😅`,
    `${saludoHora}\n\nTodavía no has apartado números para esta dinamica ❌👀`,
    `${saludoHora}\n\nTodavía no has apartado números 👀`
  ];

  const sinSaludoRespuestas = [
    "Aún no tienes números registrados 😅",
    "No veo jugadas tuyas todavía ❌",
    "Todavía no has apartado números 👀"
  ];

  const respuestas = conSaludo
    ? conSaludoRespuestas
    : sinSaludoRespuestas;

  return respuestas[Math.floor(Math.random() * respuestas.length)];
}