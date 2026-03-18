import { getContentType } from "@whiskeysockets/baileys";
import { procesarReserva } from "./reservas.js";
import { procesarPago } from "./pagos.js";

import {
  esConsultaNumeros,
  respuestaAleatoriaNumeros,
  respuestaSinNumeros
} from "./consultasNumeros.js";

import { obtenerNumerosUsuario } from "./consultarNumerosDB.js";

export async function procesarEntrada(sock, msg, configGrupo) {

  console.log("📩 MENSAJE DETECTADO");
  console.log("👤 Usuario:", msg.pushName || "Sin nombre");
  console.log("📍 Grupo:", configGrupo.nombre);
  console.log("🗄️ Tabla:", configGrupo.tabla);

  const tipo = getContentType(msg.message);
  console.log("📦 Tipo de mensaje:", tipo);

  console.log("━━━━━━━━━━━━━━━━━━ DEBUG WHATSAPP ━━━━━━━━━━━━━━━━━━");

  console.log("🧩 msg.key:", msg.key);
  console.log("🔎 remoteJid:", msg?.key?.remoteJid);
  console.log("🔎 participant:", msg?.key?.participant);
  console.log("🔎 fromMe:", msg?.key?.fromMe);
  console.log("🔎 pushName:", msg?.pushName);
  console.log("🔎 messageId:", msg?.key?.id);

  if (msg?.key?.participant) {
    console.log("📌 PARTICIPANT LIMPIO:", msg.key.participant.split("@")[0]);
  }

  if (msg?.key?.remoteJid) {
    console.log("📌 REMOTE LIMPIO:", msg.key.remoteJid.split("@")[0]);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // 🧩 =============================
  // 🧩 STICKER → PAGO
  // 🧩 =============================
  if (tipo === "stickerMessage") {
    console.log("🧩 STICKER DETECTADO → pagos");

    await procesarPago(sock, msg, configGrupo);
    return;
  }

  // 📝 =============================
  // 📝 TEXTO
  // 📝 =============================
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

  console.log("🗣️ TEXTO FINAL:", texto);

  // 🔥 =============================
  // 🔥 CONSULTA DE NÚMEROS (NUEVO)
  // 🔥 =============================
  if (esConsultaNumeros(texto)) {

    const jidUsuario = msg.key.participant || msg.key.remoteJid;

    const numeros = await obtenerNumerosUsuario(
      jidUsuario,
      configGrupo.tabla
    );

    if (!numeros.length) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: respuestaSinNumeros()
      }, { quoted: msg });

      return;
    }

    const respuesta = respuestaAleatoriaNumeros(
      numeros,
      configGrupo.nombre
    );

    await sock.sendMessage(msg.key.remoteJid, {
      text: respuesta
    }, { quoted: msg });

    return;
  }

  // 👉 RESERVAS (flujo normal)
  await procesarReserva(sock, msg, texto, configGrupo);
}