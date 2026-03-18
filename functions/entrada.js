import { getContentType } from "@whiskeysockets/baileys";
import { procesarReserva } from "./reservas.js";
import { procesarPago } from "./pagos.js";

import {
  esConsultaNumeros,
  respuestaAleatoriaNumeros,
  respuestaSinNumeros
} from "./consultasNumeros.js";

import { obtenerNumerosUsuario } from "./consultarNumerosBD.js";

// 🔥 FUNCIÓN NUEVA (NO BORRA NADA)
async function enviarConEscribiendo(sock, jid, texto, quoted) {

  try {
    // 👀 marcar como leído (opcional pero PRO)
    await sock.readMessages([quoted.key]);

    // 🟢 escribiendo...
    await sock.sendPresenceUpdate("composing", jid);

    // ⏳ delay humano (4 a 7 segundos)
    const tiempo = Math.floor(Math.random() * 3000) + 4000;

    await new Promise(resolve => setTimeout(resolve, tiempo));

    // 💬 enviar mensaje
    await sock.sendMessage(jid, { text: texto }, { quoted });

    // 🔵 dejar de escribir
    await sock.sendPresenceUpdate("paused", jid);

  } catch (err) {
    console.log("❌ Error en enviarConEscribiendo:", err);
  }
}

export async function procesarEntrada(sock, msg, configGrupo) {

  console.log("📩 MENSAJE DETECTADO");
  console.log("👤 Usuario:", msg.pushName || "Sin nombre");
  console.log("📍 Grupo:", configGrupo.nombre);
  console.log("🗄️ Tabla:", configGrupo.tabla);

  const tipo = getContentType(msg.message);
  console.log("📦 Tipo de mensaje:", tipo);

  // 🧩 STICKER → PAGO
  if (tipo === "stickerMessage") {
    console.log("🧩 STICKER → pagos");
    await procesarPago(sock, msg, configGrupo);
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

  // 🔥 CONSULTA DE NÚMEROS
  if (esConsultaNumeros(texto)) {

    const jidUsuario = msg.key.participant || msg.key.remoteJid;

    try {

      const numeros = await obtenerNumerosUsuario(
        jidUsuario,
        configGrupo.tabla
      );

      if (!numeros.length) {

        const respuesta = respuestaSinNumeros(texto);

        await enviarConEscribiendo(
          sock,
          msg.key.remoteJid,
          respuesta,
          msg
        );

        return;
      }

      const respuesta = respuestaAleatoriaNumeros(
        numeros,
        texto
      );

      await enviarConEscribiendo(
        sock,
        msg.key.remoteJid,
        respuesta,
        msg
      );

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

  // 👉 RESERVAS (flujo normal)
  await procesarReserva(sock, msg, texto, configGrupo);
}