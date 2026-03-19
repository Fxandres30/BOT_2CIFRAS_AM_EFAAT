import { supabase } from "./supabase.js";
import { NUMERO_ADMIN } from "./config.js";
import { textoPermitidoParaReserva } from "./reglasReserva.js";

import {
  mensajesTodosLibres,
  mensajesTodosOcupados,
  mensajeAleatorio,
  encabezadosReservados,
  encabezadosOcupados
} from "./mensajes.js";

import { delayEscritura } from "./typing.js";

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

/* 🔥 OBTENER USUARIO DESDE JID */
async function obtenerUsuario(jidUsuario) {

  let telefono = null;
  let lid = null;

  if (jidUsuario.includes("@s.whatsapp.net")) {
    telefono = jidUsuario.replace("@s.whatsapp.net", "").replace(/^57/, "");
  }

  if (jidUsuario.includes("@lid")) {
    lid = jidUsuario;
  }

  let telefonoFinal = telefono;
  let lidFinal = lid;

  // buscar lid
  if (telefonoFinal) {
    const { data } = await supabase
      .from("usuarios")
      .select("lid")
      .eq("telefono", telefonoFinal)
      .limit(1);

    if (data?.length) lidFinal = data[0].lid;
  }

  // buscar telefono
  if (!telefonoFinal && lidFinal) {
    const { data } = await supabase
      .from("usuarios")
      .select("telefono")
      .eq("lid", lidFinal)
      .limit(1);

    if (data?.length) telefonoFinal = data[0].telefono;
  }

  return { telefonoFinal, lidFinal };
}

/* PROCESAR RESERVA */
export async function procesarReserva(sock, msg, texto, configGrupo, jidUsuario) {

  if (!textoPermitidoParaReserva(texto)) return;

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

  // 🔥 USUARIO DESDE JID
  const { telefonoFinal, lidFinal } = await obtenerUsuario(jidUsuario);

  if (!telefonoFinal) {
    console.log("⚠️ Usuario sin teléfono:", jidUsuario);
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
  const plantilla = mensajeAleatorio(encabezadosReservados);
  const texto = plantilla.replace("{numeros}", reservados.join(" - "));
  respuesta += `${texto}\n\n`;
}

if (ocupadosPorOtros.length > 0) {
  const plantilla = mensajeAleatorio(encabezadosOcupados);
  const texto = plantilla.replace("{numeros}", ocupadosPorOtros.join(" - "));
  respuesta += texto;
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