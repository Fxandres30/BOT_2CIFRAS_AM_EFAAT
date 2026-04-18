// functions/eventoUtils.js

import { NUMERO_NOTIFICACION } from "./config.js";
import { supabase } from "./supabase.js";
import { ahoraColombia } from "./tiempoColombia.js";
import { normalizarTexto } from "./normalizarTexto.js";


// 🔥 CALCULAR CIERRE (5 min antes)
export function calcularCierre(horaFin) {
  const [h, m] = horaFin.split(":").map(Number);

  const fecha = ahoraColombia();
  fecha.setHours(h, m, 0, 0);

  const cierre = new Date(fecha.getTime() - (5 * 60 * 1000));

  return `${String(cierre.getHours()).padStart(2, "0")}:${String(cierre.getMinutes()).padStart(2, "0")}`;
}


// 🔓 ABRIR
export async function abrirGrupo(sock, grupoId) {
  try {
    await sock.groupSettingUpdate(grupoId, "not_announcement");
    console.log("🟢 Grupo abierto");
  } catch (err) {
    console.log("❌ No admin (no abre):", err?.message);
  }
}


// 🔒 CERRAR + BD (ANTI ERROR)
export async function cerrarGrupo(sock, grupoId) {
  try {
    await sock.groupSettingUpdate(grupoId, "announcement");

    await supabase
      .from("eventos_bot")
      .update({ estado: "cerrado" })
      .eq("grupo_id", grupoId)
      .eq("estado", "abierto");

    console.log("🔴 Grupo cerrado + BD actualizada");

  } catch (err) {
    console.log("❌ No admin o error cerrando:", err?.message);
  }
}


// ⏳ PROGRAMAR CIERRE (ROBUSTO 🔥)
export function programarCierre(sock, grupoId, horaFin) {

  const ahora = ahoraColombia();

  const [h, m] = horaFin.split(":").map(Number);

  const evento = ahoraColombia();
  evento.setHours(h, m, 0, 0);

  const cierre = new Date(evento.getTime() - (5 * 60 * 1000));

  const delay = cierre.getTime() - ahora.getTime();

  console.log("🕐 Ahora CO:", ahora.toLocaleTimeString());
  console.log("🕐 Cierre CO:", cierre.toLocaleTimeString());

  if (delay <= 0) {
    console.log("⚠️ Ya debía cerrar → cerrando ahora");
    cerrarGrupo(sock, grupoId);
    return;
  }

  console.log("⏳ Cierre programado en ms:", delay);

  setTimeout(async () => {
    try {
      console.log("🔔 Ejecutando cierre programado:", grupoId);
      await cerrarGrupo(sock, grupoId);
    } catch (err) {
      console.log("❌ Error en cierre programado:", err.message);
    }
  }, delay);
}


// 🔁 VERIFICAR CIERRES (ANTI FALLAS 🔥)
export async function verificarCierres(sock) {
  try {

    const ahora = ahoraColombia();

    const { data: eventos, error } = await supabase
      .from("eventos_bot")
      .select("*")
      .eq("estado", "abierto");

    if (error) {
      console.log("❌ Error consultando eventos:", error.message);
      return;
    }

    for (const ev of eventos) {

      if (!ev.hora_cierre) continue;

      const [h, m] = ev.hora_cierre.split(":").map(Number);

      const cierre = ahoraColombia();
      cierre.setHours(h, m, 0, 0);

      if (ahora >= cierre) {
        console.log(`⏰ Cerrando automático grupo: ${ev.grupo_id}`);
        await cerrarGrupo(sock, ev.grupo_id);
      }
    }

  } catch (err) {
    console.log("❌ Error en verificación:", err.message);
  }
}


// 🔍 EXTRAER EVENTO
export function extraerEventos(texto) {

  if (!texto) return null;

  const limpio = normalizarTexto(texto);

  // 🧠 validar que sea evento real
  const palabrasClave = [
    "loter",
    "antioque",
    "sinuano",
    "chance",
    "astro",
    "paisita",
    "cafetero",
    "caribe",
    "dorado",
    "superastro",
    "chontico"
  ];

  if (!palabrasClave.some(p => limpio.includes(p))) return null;

  // 🕐 HORA
  const match = limpio.match(/(\d{1,2})\s?(\d{2})\s?(am|pm)/i);
  if (!match) return null;

  let [_, h, m, periodo] = match;
  h = parseInt(h);

  if (periodo === "pm" && h !== 12) h += 12;
  if (periodo === "am" && h === 12) h = 0;

  const hora = `${String(h).padStart(2, "0")}:${m}`;
  const horaCierre = calcularCierre(hora);

  // 🔹 limpio general (TODO el texto)
const limpioTexto = normalizarTexto(texto);

// 🧾 NOMBRE
const lineaHora = texto.split("\n").find(l => /am|pm/i.test(l)) || "";

const limpioNombre = normalizarTexto(lineaHora)
  .replace(/\d{1,2}\s?\d{2}\s?(am|pm)/i, "")
  .trim();

const nombre = limpioNombre
  .split(" ")
  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
  .join(" ") || "Evento";


// 💰 VALOR (usar limpioTexto 🔥)
const valorMatch = limpioTexto.match(/valor\s*(numero)?\s*([\d\s]+)/i);

let valor = "No definido";

if (valorMatch) {
  const numeroLimpio = valorMatch[2].replace(/\s+/g, "");
  valor = `$${numeroLimpio}`;
}


// 🏆 PREMIOS (también con texto completo)
const premios = texto
  .split("\n")
  .map(l => l.trim())
  .filter(l => {
    const n = normalizarTexto(l);
    return /\d{3,}/.test(n) && !n.includes("valor");
  });

  return {
    nombre,
    hora,
    horaCierre,
    valor,
    premios
  };
  return null;
}


// 🔢 VALIDAR NÚMEROS
export function obtenerNumerosValidos() {
  if (!Array.isArray(NUMERO_NOTIFICACION)) return [];
  return NUMERO_NOTIFICACION.filter(n => n.includes("@s.whatsapp.net"));
}