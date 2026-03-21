// functions/detectarEvento.js

import { NUMERO_NOTIFICACION } from "./config.js";
import { supabase } from "./supabase.js";
import { horaColombia } from "./tiempoColombia.js";

// 🔥 CALCULAR CIERRE
function calcularCierre(horaFin) {
  const [h, m] = horaFin.split(":").map(Number);

  const fecha = new Date();
  fecha.setHours(h, m, 0);

  const cierre = new Date(fecha.getTime() - (5 * 60 * 1000));

  return `${String(cierre.getHours()).padStart(2, "0")}:${String(cierre.getMinutes()).padStart(2, "0")}`;
}

// 🔓 ABRIR
async function abrirGrupo(sock, grupoId) {
  try {
    await sock.groupSettingUpdate(grupoId, "not_announcement");
    console.log("🟢 Grupo abierto");
  } catch {
    console.log("❌ No admin (no abre)");
  }
}

// 🔒 CERRAR + BD
async function cerrarGrupo(sock, grupoId) {
  try {
    await sock.groupSettingUpdate(grupoId, "announcement");

    await supabase
      .from("eventos_bot")
      .update({ estado: "cerrado" })
      .eq("grupo_id", grupoId);

    console.log("🔴 Grupo cerrado + BD actualizada");
  } catch {
    console.log("❌ No admin (no cierra)");
  }
}

// ⏳ PROGRAMAR CIERRE
function programarCierre(sock, grupoId, horaFin) {

  const ahoraStr = horaColombia();
  const [ah, am] = ahoraStr.split(":").map(Number);

  const ahora = new Date();
  ahora.setHours(ah, am, 0);

  const [h, m] = horaFin.split(":").map(Number);

  const evento = new Date();
  evento.setHours(h, m, 0);

  const cierre = new Date(evento.getTime() - (5 * 60 * 1000));

  const delay = cierre - ahora;

  if (delay <= 0) {
    console.log("⚠️ Ya debía cerrar → cerrando ahora");
    cerrarGrupo(sock, grupoId);
    return;
  }

  console.log("⏳ Cierre programado:", calcularCierre(horaFin));

  setTimeout(() => cerrarGrupo(sock, grupoId), delay);
}

// 🔍 EXTRAER EVENTO
function extraerEventos(texto) {

  const bloques = texto.split("\n\n");

  for (const bloque of bloques) {

    const limpio = bloque.replace(/\*/g, "").toLowerCase();

    if (
      limpio.includes("liberados") ||
      limpio.includes("recuerde") ||
      limpio.includes("nequi") ||
      limpio.includes("daviplata")
    ) continue;

    if (!limpio.includes("loter") && !limpio.includes("antioque")) continue;

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

    return {
      nombre: bloque.match(/loter[ií]a.*|antioqueñita.*/i)?.[0] || "Evento",
      hora,
      horaCierre,
      valor,
      premios
    };
  }

  return null;
}

// 🔢 VALIDAR NÚMEROS
function obtenerNumerosValidos() {
  if (!Array.isArray(NUMERO_NOTIFICACION)) return [];
  return NUMERO_NOTIFICACION.filter(n => n.includes("@s.whatsapp.net"));
}

// 🚀 FUNCIÓN PRINCIPAL (MODO GOD)
export async function detectarEvento(sock, grupoId, texto) {

  if (!texto) return;

  const ev = extraerEventos(texto);
  if (!ev) return;

  const hoy = new Date().toISOString().split("T")[0];
  const ahora = horaColombia();

  const numeros = obtenerNumerosValidos();

  // 🔥 BUSCAR EVENTO EXISTENTE (SIN FECHA PARA LIMPIEZA TOTAL)
  const { data } = await supabase
    .from("eventos_bot")
    .select("*")
    .eq("grupo_id", grupoId)
    .limit(1);

  if (data.length > 0) {

    const evDB = data[0];

    // 🔴 SI YA VENCIÓ → CERRAR
    if (ahora >= evDB.hora_cierre && evDB.estado !== "cerrado") {
      console.log("⚠️ Evento anterior vencido → cerrando");
      await cerrarGrupo(sock, grupoId);
    }

    // 🧹 BORRAR SIEMPRE
    const { error: deleteError } = await supabase
      .from("eventos_bot")
      .delete()
      .eq("grupo_id", grupoId);

    if (deleteError) {
      console.log("❌ Error eliminando:", deleteError.message);
      return;
    }

    console.log("♻️ Evento anterior eliminado");
  }

  // 🆕 INSERT NUEVO
  const { error: insertError } = await supabase
    .from("eventos_bot")
    .insert({
      grupo_id: grupoId,
      hora_fin: ev.hora,
      hora_cierre: ev.horaCierre,
      fecha_evento: hoy,
      estado: "abierto"
    });

  if (insertError) {
    console.log("❌ Error guardando:", insertError.message);
    return;
  }

  console.log("✅ Evento nuevo insertado");

  // 🔓 ABRIR
  await abrirGrupo(sock, grupoId);

  // ⏳ PROGRAMAR CIERRE
  programarCierre(sock, grupoId, ev.hora);

  // 📲 MENSAJE
  if (numeros.length) {

    const mensaje = `🎯 *EVENTO DETECTADO*

📍 Grupo: ${grupoId}

🎯 *${ev.nombre}*
🕐 Hora: ${ev.hora}
⏳ Cierra: ${ev.horaCierre}
💰 Valor: ${ev.valor}

🏆 Premios:
${ev.premios.map(p => "• " + p).join("\n")}

───────────────`;

    for (const numero of numeros) {
      await sock.sendMessage(numero, { text: mensaje });
    }

    console.log("📲 Evento enviado");
  }
}

// 🔥 VERIFICAR AL INICIAR
export async function verificarEventosPendientes(sock) {

  const hoy = new Date().toISOString().split("T")[0];
  const ahora = horaColombia();

  const { data } = await supabase
    .from("eventos_bot")
    .select("*")
    .eq("fecha_evento", hoy);

  if (!data.length) {
    console.log("📭 No hay eventos pendientes");
    return;
  }

  console.log("🔍 Verificando eventos al iniciar...");

  for (const ev of data) {

    if (ev.estado === "cerrado") continue;

    if (ahora >= ev.hora_cierre) {

      console.log("⚠️ Evento vencido → cerrando:", ev.grupo_id);
      await cerrarGrupo(sock, ev.grupo_id);

    } else {

      const [h, m] = ev.hora_cierre.split(":").map(Number);

      const ahoraDate = new Date();
      const cierreDate = new Date();
      cierreDate.setHours(h, m, 0);

      const delay = cierreDate - ahoraDate;

      console.log("⏳ Reprogramando cierre:", ev.grupo_id);

      setTimeout(() => cerrarGrupo(sock, ev.grupo_id), delay);
    }
  }
}