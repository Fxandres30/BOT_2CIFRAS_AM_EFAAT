// functions/detectarEvento.js

import { supabase } from "./supabase.js";
import { horaColombia, ahoraColombia, yaPasoHora } from "./tiempoColombia.js";

import {
  extraerEventos,
  abrirGrupo,
  cerrarGrupo,
  programarCierre,
  obtenerNumerosValidos
} from "./eventoUtils.js";

// 🚀 FUNCIÓN PRINCIPAL
export async function detectarEvento(sock, grupoId, texto) {

  if (!texto) return;

  const ev = extraerEventos(texto);
  if (!ev) return;

  const hoy = new Date().toISOString().split("T")[0];

  const numeros = obtenerNumerosValidos();

  const { data } = await supabase
    .from("eventos_bot")
    .select("*")
    .eq("grupo_id", grupoId)
    .limit(1);

  if (data.length > 0) {

    const evDB = data[0];

    // 🔴 SI YA VENCIÓ → cerrar
    if (yaPasoHora(evDB.hora_cierre) && evDB.estado !== "cerrado") {
      console.log("⚠️ Evento anterior vencido → cerrando");
      await cerrarGrupo(sock, grupoId);
    }

    // 🧠 SI ES EL MISMO EVENTO → NO HACER NADA
    if (
      evDB.hora_fin === ev.hora &&
      evDB.hora_cierre === ev.horaCierre &&
      evDB.estado === "abierto"
    ) {
      console.log("⚖️ Evento repetido → ignorado");
      return;
    }

    // 🧹 SOLO SI ES DIFERENTE
    await supabase
      .from("eventos_bot")
      .delete()
      .eq("grupo_id", grupoId);

    console.log("♻️ Evento anterior eliminado (nuevo detectado)");
  }

  const { error } = await supabase
    .from("eventos_bot")
    .insert({
      grupo_id: grupoId,
      hora_fin: ev.hora,
      hora_cierre: ev.horaCierre,
      fecha_evento: hoy,
      estado: "abierto"
    });

  if (error) {
    console.log("❌ Error guardando:", error.message);
    return;
  }

  console.log("✅ Evento nuevo insertado");

  await abrirGrupo(sock, grupoId);

  programarCierre(sock, grupoId, ev.hora);

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

    // 🔴 SI YA PASÓ → cerrar directo
    if (yaPasoHora(ev.hora_cierre)) {

      console.log("⚠️ Evento vencido → cerrando:", ev.grupo_id);
      await cerrarGrupo(sock, ev.grupo_id);

    } else {

      const [h, m] = ev.hora_cierre.split(":").map(Number);

      const ahoraDate = ahoraColombia(); // ✅ Colombia
      const cierreDate = ahoraColombia(); // base Colombia

      cierreDate.setHours(h, m, 0, 0);

      const delay = cierreDate - ahoraDate;

      console.log("⏳ Reprogramando cierre:", ev.grupo_id);

      if (delay <= 0) {
        console.log("⚠️ Delay negativo → cerrando inmediato");
        await cerrarGrupo(sock, ev.grupo_id);
      } else {
        setTimeout(async () => {
          await cerrarGrupo(sock, ev.grupo_id);
        }, delay);
      }
    }
  }
}