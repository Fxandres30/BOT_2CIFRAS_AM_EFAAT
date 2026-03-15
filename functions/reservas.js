import { supabase } from "./supabase.js";
import { NUMERO_ADMIN } from "./config.js";
import { textoPermitidoParaReserva } from "./reglasReserva.js";
import {
  mensajesTodosLibres,
  mensajesTodosOcupados,
  mensajeAleatorio
} from "./mensajes.js";
import { delayEscritura } from "./typing.js";

/* detectar tipo de ID */
function parsearJid(jid = "") {

  if (jid.includes("@s.whatsapp.net")) {
    return {
      telefono: jid.replace("@s.whatsapp.net", "").replace(/^57/, ""),
      lid: null
    };
  }

  if (jid.includes("@lid")) {
    return {
      telefono: null,
      lid: jid
    };
  }

  return { telefono: null, lid: null };
}

/* extraer números */
function extraerNumeros(texto) {
  return texto
    .toLowerCase()
    .replace(/[o]/g, "0")
    .replace(/[_\-.,;/|\\()]+/g, " ")
    .replace(/\b([0-9])\b/g, "0$1")
    .match(/\b\d{2}\b/g) || [];
}

/* responder */
async function responder(sock, jid, texto, msg, delay = 1500) {
  await delayEscritura(sock, jid, delay);
  await sock.sendMessage(jid, { text: texto }, { quoted: msg });
}

/* PROCESAR RESERVA */
export async function procesarReserva(sock, msg, texto, configGrupo) {

  /* validar texto permitido */
  if (!textoPermitidoParaReserva(texto)) return;

  /* ignorar multimedia */
  if (
    msg.message?.imageMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.audioMessage
  ) return;

  const numeros = extraerNumeros(texto);
  if (numeros.length === 0) return;

  const { tabla, nombre: nombreGrupo } = configGrupo;

  const grupoId = msg.key.remoteJid;
  const jidUsuario = msg.key.participant || msg.key.remoteJid;

  const { telefono, lid } = parsearJid(jidUsuario);

  let telefonoFinal = telefono;
  let lidFinal = lid;

  /* si llega telefono buscar LID */
  if (telefonoFinal) {

    const { data, error } = await supabase
      .from("usuarios")
      .select("lid")
      .eq("telefono", telefonoFinal)
      .limit(1);

    if (!error && data && data.length > 0) {
      lidFinal = data[0].lid;
    }

  }

  /* si llega LID buscar telefono */
  if (!telefonoFinal && lidFinal) {

    const { data, error } = await supabase
      .from("usuarios")
      .select("telefono")
      .eq("lid", lidFinal)
      .limit(1);

    if (!error && data && data.length > 0) {
      telefonoFinal = data[0].telefono;
    } else {

      console.log("❌ Usuario no encontrado en tabla usuarios");
      console.log("LID recibido:", lidFinal);

      return;

    }

  }

  if (!telefonoFinal) {
    console.log("⚠️ No se pudo identificar teléfono");
    return;
  }

  const nombre = msg.pushName || "Sin nombre";

  console.log("👤 Usuario:", nombre);
  console.log("📞 Teléfono:", telefonoFinal);
  console.log("🆔 LID:", lidFinal);

  const { data, error } = await supabase
    .from(tabla)
    .select("numero, estado, contacto")
    .in("numero", numeros);

  if (error) return;

  const ocupadosPorOtros = data
    .filter(n => n.estado !== "libre" && n.contacto !== telefonoFinal)
    .map(n => n.numero);

  const yaSonMios = data
    .filter(n => n.contacto === telefonoFinal)
    .map(n => n.numero);

  const disponibles = numeros.filter(
    n => !ocupadosPorOtros.includes(n) && !yaSonMios.includes(n)
  );

  if (
    disponibles.length === 0 &&
    ocupadosPorOtros.length === 0 &&
    yaSonMios.length === numeros.length
  ) return;

  if (ocupadosPorOtros.length === numeros.length) {

    await responder(
      sock,
      grupoId,
      mensajeAleatorio(mensajesTodosOcupados),
      msg
    );

    return;
  }

  const reservados = [];

  for (const numero of disponibles) {

    const { data: updateData } = await supabase
      .from(tabla)
      .update({
        estado: "reservado",
        comprador: nombre,
        contacto: telefonoFinal,
        lib: lidFinal
      })
      .eq("numero", numero)
      .eq("estado", "libre")
      .select("numero");

    if (updateData?.length === 1) {
      reservados.push(numero);
    }

  }

  if (ocupadosPorOtros.length === 0) {

    await responder(
      sock,
      grupoId,
      mensajeAleatorio(mensajesTodosLibres),
      msg
    );

  } else {

    let respuesta = "";

    if (reservados.length > 0) {
      respuesta += `✅ Números reservados: *( ${reservados.join(" - ")} )*\n`;
    }

    if (ocupadosPorOtros.length > 0) {
      respuesta += `❌ No disponibles: *( ${ocupadosPorOtros.join(" - ")} )*`;
    }

    await responder(sock, grupoId, respuesta, msg);
  }

  if (reservados.length > 0) {

    await sock.sendMessage(NUMERO_ADMIN, {
      text: `📥 Reserva confirmada

👤 Usuario: ${nombre}
📞 Teléfono: ${telefonoFinal}
🆔 LID: ${lidFinal}
📍 Grupo: ${nombreGrupo}
🔢 Números: ${reservados.join(", ")}`
    });

  }

}
