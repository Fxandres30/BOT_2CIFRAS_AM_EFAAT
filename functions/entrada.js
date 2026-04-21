import { getContentType } from "@whiskeysockets/baileys";
import { procesarReserva } from "./reservas.js";
import { procesarPago } from "./pagos.js";
import { supabase } from "./supabase.js";

import {
  esConsultaNumeros,
  respuestaAleatoriaNumeros,
  respuestaSinNumeros,
  respuestaMixta
} from "./consultasNumeros.js";

import { obtenerNumerosUsuario } from "./consultarNumerosBD.js";

// 🔥 IMPORTAR DETECTOR DE EVENTOS
import { detectarEvento } from "./detectarEvento.js";

// 🔥 escribir con delay
async function enviarConEscribiendo(sock, jid, texto, quoted) {
  try {
    await sock.readMessages([quoted.key]);
    await sock.sendPresenceUpdate("composing", jid);

    const tiempo = Math.floor(Math.random() * 3000) + 4000;
    await new Promise(resolve => setTimeout(resolve, tiempo));

    await sock.sendMessage(jid, { text: texto }, { quoted });

    await sock.sendPresenceUpdate("paused", jid);

  } catch (err) {
    console.log("❌ Error en enviarConEscribiendo:", err);
  }
}

export async function procesarEntrada(sock, msg, configGrupo, jidUsuario) {

  console.log("📩 MENSAJE DETECTADO");
  console.log("👤 Usuario:", msg.pushName || "Sin nombre");
  console.log("📍 Grupo:", configGrupo.nombre);
  console.log("🗄️ Tabla: dinámica por evento");

  const tipo = getContentType(msg.message);
  console.log("📦 Tipo de mensaje:", tipo);

  console.log("📌 JID USUARIO:", jidUsuario);

  // 🧩 STICKER → PAGO
  if (tipo === "stickerMessage") {
    console.log("🧩 STICKER → pagos");
    await procesarPago(sock, msg, configGrupo, jidUsuario);
    return;
  }

  // 📝 TEXTO
  let texto = "";

  if (tipo === "conversation") {
    texto = msg.message.conversation;

  } else if (tipo === "extendedTextMessage") {
    texto = msg.message.extendedTextMessage?.text;

  } else if (tipo === "imageMessage") {
    texto = msg.message.imageMessage?.caption || "";

  } else if (tipo === "buttonsResponseMessage") {
    texto = msg.message.buttonsResponseMessage?.selectedDisplayText;

  } else if (tipo === "listResponseMessage") {
    texto = msg.message.listResponseMessage?.title;
  }

  // 🧠 mensaje citado
  if (!texto && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
    const quotedType = getContentType(quoted);

    if (quotedType === "conversation") {
      texto = quoted.conversation;
    } else if (quotedType === "extendedTextMessage") {
      texto = quoted.extendedTextMessage?.text;
    }
  }

  if (!texto) return;

  texto = texto.toLowerCase().trim();
  console.log("🗣️ TEXTO FINAL:", texto);

  // 🔥 EVENTOS
  await detectarEvento(sock, msg.key.remoteJid, texto);

  // 🔥 CONSULTA DE NÚMEROS
  if (esConsultaNumeros(texto)) {

    try {

      // 🔥 TRAER EVENTO ACTIVO
const { data: evento } = await supabase
  .from("eventos_bot")
  .select("tabla, estado")
  .eq("grupo_id", msg.key.remoteJid)
  .eq("estado", "abierto")
  .single();

if (!evento || !evento.tabla) {
  console.log("⛔ No hay evento activo para consulta");
  return;
}

const tabla = evento.tabla;

const { reservados, pagados } = await obtenerNumerosUsuario(
  jidUsuario,
  tabla
);

      // 🔥 LOGS PRO
      console.log("📊 RESULTADO DB:");
      console.log("📌 Reservados:", reservados);
      console.log("💰 Pagados:", pagados);

      // 🔥 MIXTO
      if (reservados.length && pagados.length) {

        console.log("🧠 Caso: MIXTO");

        const respuesta = respuestaMixta(reservados, pagados, texto);

        await enviarConEscribiendo(
          sock,
          msg.key.remoteJid,
          respuesta,
          msg
        );

        return;
      }

      // 💰 SOLO PAGADOS
      if (pagados.length) {

        console.log("🧠 Caso: SOLO PAGADOS");

        const respuesta = respuestaAleatoriaNumeros(
          pagados,
          texto,
          "pagado"
        );

        await enviarConEscribiendo(
          sock,
          msg.key.remoteJid,
          respuesta,
          msg
        );

        return;
      }

      // 📌 SOLO RESERVADOS
      if (reservados.length) {

        console.log("🧠 Caso: SOLO RESERVADOS");

        const respuesta = respuestaAleatoriaNumeros(
          reservados,
          texto,
          "reservado"
        );

        await enviarConEscribiendo(
          sock,
          msg.key.remoteJid,
          respuesta,
          msg
        );

        return;
      }

      // ❌ NINGUNO
      console.log("🧠 Caso: SIN NÚMEROS");

      const respuesta = respuestaSinNumeros(texto);

      await enviarConEscribiendo(
        sock,
        msg.key.remoteJid,
        respuesta,
        msg
      );

      return;

    } catch (err) {
      console.log("❌ Error consultando números:", err);

      await enviarConEscribiendo(
        sock,
        msg.key.remoteJid,
        "❌ Error consultando tus números, intenta de nuevo.",
        msg
      );
    }

    return;
  }

  // 👉 RESERVAS
  await procesarReserva(
    sock,
    msg,
    texto,
    configGrupo,
    jidUsuario
  );
}