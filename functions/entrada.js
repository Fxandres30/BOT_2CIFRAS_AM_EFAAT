import { getContentType } from "@whiskeysockets/baileys";
import { procesarReserva } from "./reservas.js";
import { procesarPago } from "./pagos.js";

import {
  esConsultaNumeros,
  respuestaAleatoriaNumeros,
  respuestaSinNumeros
} from "./consultasNumeros.js";

import { obtenerNumerosUsuario } from "./consultarNumerosBD.js";

// 🔥 LIMPIAR NÚMERO (NUEVO)
const limpiarNumero = (jid = "") => {
  if (!jid) return "";
  return jid.split("@")[0].replace(/\D/g, "");
};

// 🔥 SACAR JID REAL (ANTI BUG WHATSAPP)
const obtenerJidUsuario = (msg) => {
  return (
    msg.key.participant ||
    msg.participant ||
    msg.key.remoteJid ||
    ""
  );
};

// 🔥 FUNCIÓN NUEVA (NO BORRA NADA)
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

export async function procesarEntrada(sock, msg, configGrupo) {

  console.log("📩 MENSAJE DETECTADO");
  console.log("👤 Usuario:", msg.pushName || "Sin nombre");
  console.log("📍 Grupo:", configGrupo.nombre);
  console.log("🗄️ Tabla:", configGrupo.tabla);

  const tipo = getContentType(msg.message);
  console.log("📦 Tipo de mensaje:", tipo);

  // 🔥 USUARIO LIMPIO (NUEVO)
  const jidUsuarioRaw = obtenerJidUsuario(msg);
  const numeroUsuario = limpiarNumero(jidUsuarioRaw);

  console.log("📌 JID RAW:", jidUsuarioRaw);
  console.log("📌 NÚMERO LIMPIO:", numeroUsuario);

  // 🧩 STICKER → PAGO
  if (tipo === "stickerMessage") {
    console.log("🧩 STICKER → pagos");

    await procesarPago(sock, msg, configGrupo, numeroUsuario); // 👈 LE PASAMOS EL LIMPIO
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

    try {

      const numeros = await obtenerNumerosUsuario(
        numeroUsuario, // 👈 SIEMPRE LIMPIO
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

  // 👉 RESERVAS
  await procesarReserva(sock, msg, texto, configGrupo, numeroUsuario); // 👈 TAMBIÉN LIMPIO
}