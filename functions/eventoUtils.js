// functions/eventoUtils.js

import { NUMERO_NOTIFICACION } from "./config.js";
import { supabase } from "./supabase.js";
import { ahoraColombia, horaColombia } from "./tiempoColombia.js";


// 🔥 CALCULAR CIERRE (5 min antes)
export function calcularCierre(horaFin) {
  const [h, m] = horaFin.split(":").map(Number);

  const fecha = ahoraColombia(); // 🔥 usamos Colombia
  fecha.setHours(h, m, 0, 0);

  const cierre = new Date(fecha.getTime() - (5 * 60 * 1000));

  return `${String(cierre.getHours()).padStart(2, "0")}:${String(cierre.getMinutes()).padStart(2, "0")}`;
}


// 🔓 ABRIR
export async function abrirGrupo(sock, grupoId) {
  try {
    await sock.groupSettingUpdate(grupoId, "not_announcement");
    console.log("🟢 Grupo abierto");
  } catch {
    console.log("❌ No admin (no abre)");
  }
}


// 🔒 CERRAR + BD
export async function cerrarGrupo(sock, grupoId) {
  try {
    await sock.groupSettingUpdate(grupoId, "announcement");

    await supabase
      .from("eventos_bot")
      .update({ estado: "cerrado" })
      .eq("grupo_id", grupoId)
      .eq("estado", "abierto");

    console.log("🔴 Grupo cerrado + BD actualizada");

  } catch {
    console.log("❌ No admin (no cierra)");
  }
}


// ⏳ PROGRAMAR CIERRE (AHORA CORRECTO 🔥)
export function programarCierre(sock, grupoId, horaFin) {

  const ahora = ahoraColombia(); // 🔥 CLAVE

  const [h, m] = horaFin.split(":").map(Number);

  const evento = ahoraColombia(); // mismo día Colombia
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

  setTimeout(() => cerrarGrupo(sock, grupoId), delay);
}


// 🔁 VERIFICAR CIERRES (YA ESTABA BIEN, SOLO AJUSTE 🔥)
export async function verificarCierres(sock) {
  try {

    const ahora = ahoraColombia(); // 🔥 directo, sin strings

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

  const bloques = texto.split("\n\n");

  for (const bloque of bloques) {

    const limpio = bloque.replace(/\*/g, "").toLowerCase();

    if (
      limpio.includes("liberados") ||
      limpio.includes("recuerde") ||
      limpio.includes("nequi") ||
      limpio.includes("daviplata")
    ) continue;

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

    if (!palabrasClave.some(p => limpio.includes(p))) continue;

    const match = limpio.match(/(\d{1,2}):(\d{2})\s?(am|pm)/i);
    if (!match) continue;

    let [_, h, m, periodo] = match;
    h = parseInt(h);

    if (periodo === "pm" && h !== 12) h += 12;
    if (periodo === "am" && h === 12) h = 0;

    const hora = `${String(h).padStart(2, "0")}:${m}`;
    const horaCierre = calcularCierre(hora);

    const valorMatch = limpio.match(/valor\s*numero\s*:\s*\$\s?[\d\.]+/i);
    const valor = valorMatch
      ? valorMatch[0].match(/\$\s?[\d\.]+/)[0]
      : "No definido";

    const premios = bloque
      .split("\n")
      .filter(l => l.match(/\$\s?[\d\.]+/))
      .map(l => l.replace(/\*/g, "").trim());

    const nombre = bloque
      .split("\n")[0]
      .replace(/\*/g, "")
      .replace(/^\d+[\.\)]\s*/, "")
      .trim();

    return {
      nombre: nombre || "Evento",
      hora,
      horaCierre,
      valor,
      premios
    };
  }

  return null;
}


// 🔢 VALIDAR NÚMEROS
export function obtenerNumerosValidos() {
  if (!Array.isArray(NUMERO_NOTIFICACION)) return [];
  return NUMERO_NOTIFICACION.filter(n => n.includes("@s.whatsapp.net"));
}