import { getContentType } from "@whiskeysockets/baileys";
import { procesarReserva } from "./reservas.js";
import { procesarPago } from "./pagos.js";

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
  // 🧩 SI ES STICKER → PROCESAR PAGO
  // 🧩 =============================
  if (tipo === "stickerMessage") {
    console.log("🧩 STICKER DETECTADO → enviando a pagos.js");

    await procesarPago(sock, msg, configGrupo);

    return; // ⛔ IMPORTANTE: NO sigue a reservas
  }

  // 📝 =============================
  // 📝 PROCESAR TEXTO NORMAL
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

  // 🧠 Mensaje citado
  if (!texto && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
    const quotedType = getContentType(quoted);

    if (quotedType === "conversation") {
      texto = quoted.conversation;
    } else if (quotedType === "extendedTextMessage") {
      texto = quoted.extendedTextMessage?.text;
    }
  }

  console.log("🗣️ TEXTO FINAL:", texto);

  if (!texto) return;

  // 👉 delegamos a reservas
  await procesarReserva(sock, msg, texto, configGrupo);
}
