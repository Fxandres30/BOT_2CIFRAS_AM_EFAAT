// functions/consultasNumeros.js

import { textoPermitidoParaConsulta } from "./filtroConsultas.js";
import { ahoraColombia } from "./tiempoColombia.js";

// 👇 IMPORTAR MENSAJES
import {
  reservadosConSaludo,
  reservadosSinSaludo,
  pagadosConSaludo,
  pagadosSinSaludo,
  sinNumerosConSaludo,
  sinNumerosSinSaludo,
  mixtosConSaludo,
  mixtosSinSaludo
} from "./mensajesNumeros.js";

// 🔹 LIMPIAR TEXTO
function limpiarTexto(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s]/g, "")
    .trim();
}

// 🔥 DETECCIÓN INTELIGENTE
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
      ? pagadosConSaludo(saludoHora, lista)
      : pagadosSinSaludo(lista);
  } else {
    respuestas = conSaludo
      ? reservadosConSaludo(saludoHora, lista)
      : reservadosSinSaludo(lista);
  }

  return respuestas[Math.floor(Math.random() * respuestas.length)];
}

// 🔥 SIN NÚMEROS
export function respuestaSinNumeros(textoUsuario = "") {

  const conSaludo = tieneSaludo(textoUsuario);
  const saludoHora = obtenerSaludoPorHora();

  const respuestas = conSaludo
    ? sinNumerosConSaludo(saludoHora)
    : sinNumerosSinSaludo();

  return respuestas[Math.floor(Math.random() * respuestas.length)];
}

// 🔥 MIXTO
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
    respuestas = mixtosConSaludo(saludoHora, listaReservados, listaPagados);
  } else {
    respuestas = mixtosSinSaludo(listaPagados, listaReservados);
  }

  return respuestas[Math.floor(Math.random() * respuestas.length)];
}