import { supabase } from "./supabase.js";
import { ahoraColombia } from "./tiempoColombia.js";

// 🧠 tiempos por valor (NO SE TOCA)
const mapaTiempos = {
  10000: [360, 180, 60],
  5000: [300, 120, 45],
  2000: [150, 60],
  1500: [120, 90, 60, 30],
  1000: [120, 5]
};

// 🎲 MENSAJES ALEATORIOS (SE MANTIENE 🔥)
function mensajeCobroAleatorio(evento) {

  const mensajes = [

`👀 *Familia recuerden*

Que estamos jugando *${evento.nombre_evento}* ✍️👀

*Vayan cancelando sus numeritos para que no sean liberados ☘️🎯*

💰 Valor: ${evento.valor}

🏦 *Nequi - Daviplata - Bre-B*
➡️ *3014123951*`,

`🔥 *Atención grupo*

Sorteo activo *${evento.nombre_evento}* 🎯

*Recuerden ir cancelando para evitar liberaciones ⚠️*

💰 Valor: *${evento.valor}*

🏦 *Nequi - Daviplata - Bre-B*
➡️ *3014123951*`,

`⏰ *Recordatorio familia*

Estamos jugando *${evento.nombre_evento}* ✍️

*No dejen sus números sin pagar 👀*

💰 Valor: ${evento.valor}

🏦 *Nequi - Daviplata - Bre-B*
➡️ *3014123951*`,

`🚨 *Ojo grupo*

*Aseguren sus jugadas ☘️*

*Números sin cancelar con ${evento.nombre_evento} serán liberados media hora anten que juegue ⚠️*

💰 Valor: *${evento.valor}*

🏦 *Nequi - Daviplata - Bre-B*
➡️ *3014123951*`,

`🎯 *Vamos con todo*

Recuerden pagar sus números de *${evento.nombre_evento}* ✍️

No se queden por fuera ☘️🎯

💰 Valor: ${evento.valor}

🏦 *Nequi - Daviplata - Bre-B*
➡️ *3014123951*`
  ];

  return mensajes[Math.floor(Math.random() * mensajes.length)];
}

//////////////////////////////////////////////////////
// 🚀 1. CREAR COBROS EN BASE DE DATOS
//////////////////////////////////////////////////////

export async function crearCobrosEvento(evento) {

  

  console.log("📦 EVENTO RECIBIDO:", evento);

await supabase
  .from("cobros")
  .delete()
  .eq("evento_id", evento.id);

  if (!evento.valor || !evento.hora_cierre) {
    console.log("❌ Falta valor u hora_cierre");
    return;
  }

  const valorLimpio = evento.valor.replace(/\D/g, "");
  const valorNum = parseInt(valorLimpio);

  console.log("💰 Valor original:", evento.valor);
  console.log("💰 Valor limpio:", valorLimpio);
  console.log("💰 Valor numérico:", valorNum);

  const tiempos = mapaTiempos[valorNum];

  console.log("⏱️ Tiempos encontrados:", tiempos);

  if (!tiempos) {
    console.log("⚠️ Sin tiempos para valor:", valorNum);
    return;
  }

  if (!evento.fecha_evento) {
    console.log("❌ evento.fecha_evento no existe");
    return;
  }

  console.log("📅 Fecha evento:", evento.fecha_evento);
  console.log("🕐 Hora cierre:", evento.hora_cierre);

  const [year, month, day] = evento.fecha_evento.split("-").map(Number);
  const [h, m] = evento.hora_cierre.split(":").map(Number);

  const cierreDate = new Date(year, month - 1, day, h, m, 0);

  console.log("🧠 Fecha cierre construida:", cierreDate);

  if (isNaN(cierreDate.getTime())) {
    console.log("❌ Fecha inválida");
    return;
  }

  const cobros = [];

  for (let i = 0; i < tiempos.length; i++) {

    const minutosAntes = tiempos[i];
    const envio = new Date(cierreDate.getTime() - minutosAntes * 60000);

    console.log(`⏰ Cobro ${i + 1}:`, {
      minutosAntes,
      envio: envio.toISOString()
    });

    cobros.push({
      evento_id: evento.id,
      grupo_id: evento.grupo_id,
      numero_cobro: i + 1,
      minutos_antes: minutosAntes,
      hora_envio: envio.toISOString(),
      enviado: false
    });
  }

  console.log("📦 COBROS A INSERTAR:", cobros);

  const { error } = await supabase.from("cobros").insert(cobros);

  if (error) {
    console.log("❌ Error creando cobros:", error);
  } else {
    console.log(`✅ ${cobros.length} cobros creados`);
  }
}

//////////////////////////////////////////////////////
// 🔁 2. PROCESAR COBROS (ANTI DUPLICADOS)
//////////////////////////////////////////////////////

export async function procesarCobros(sock) {

  const ahora = ahoraColombia().toISOString();

  const { data: cobros, error } = await supabase
    .from("cobros")
    .select("*")
    .lte("hora_envio", ahora)
    .eq("enviado", false);

  if (error) {
    console.log("❌ Error buscando cobros:", error.message);
    return;
  }

  if (!cobros || cobros.length === 0) return;

  for (const cobro of cobros) {

    try {

      // 🔥 TRAER EVENTO
      const { data: evento, error: errorEvento } = await supabase
        .from("eventos_bot")
        .select("*")
        .eq("id", cobro.evento_id)
        .single();

      if (errorEvento || !evento) {
        console.log("⚠️ Evento no encontrado:", cobro.evento_id);
        continue;
      }

      // 🔴 NO ENVIAR SI ESTÁ CERRADO
      if (evento.estado === "cerrado") {
        console.log("⛔ Evento cerrado:", cobro.evento_id);
        continue;
      }

      // 🔒 BLOQUEO ANTI DUPLICADOS (CLAVE)
      const { data: actualizado, error: errorUpdate } = await supabase
        .from("cobros")
        .update({
          enviado: true,
          enviado_en: ahoraColombia().toISOString()
        })
        .eq("id", cobro.id)
        .eq("enviado", false)
        .select()
        .single();

      // ❌ si falló update o ya lo tomó otro proceso
      if (errorUpdate || !actualizado) {
        console.log("⛔ Cobro ya procesado:", cobro.id);
        continue;
      }

      // ✉️ GENERAR MENSAJE
      const mensaje = mensajeCobroAleatorio(evento);

      // 📲 ENVIAR
      await sock.sendMessage(cobro.grupo_id, { text: mensaje });

      console.log(`💰 Cobro ${cobro.numero_cobro} enviado correctamente`);

    } catch (err) {
      console.log("❌ Error enviando cobro:", err.message);
    }
  }
}