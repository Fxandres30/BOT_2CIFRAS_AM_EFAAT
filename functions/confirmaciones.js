import { delayEscritura } from "./typing.js";
import { NUMERO_ADMIN } from "./config.js";

const STICKER_PAGO_ID = "T9gVHBVeWDiTlhsDL0tr3Xjbu0bUzAlP1VjSHjf5rKg="; // TU STICKER REAL

export async function procesarConfirmacion(sock, msg, configGrupo) {
  const sticker = msg.message?.stickerMessage;
  if (!sticker) return;

  const stickerId = sticker.fileSha256?.toString("base64");
  if (stickerId !== STICKER_PAGO_ID) return;

  await delayEscritura(sock, msg.key.remoteJid);

  // 📩 MENSAJE AL GRUPO
  await sock.sendMessage(msg.key.remoteJid, {
    text: `✅ *Pago confirmado* 🧾🙌

👤 Usuario: @${msg.key.participant.split("@")[0]}
📍 Grupo: *${configGrupo.nombre}*

⋆ ᴱᶠᵃᵃ𝐭 ⋆`,
    mentions: [msg.key.participant]
  });

  // 📲 MENSAJE AL ADMIN
  await sock.sendMessage(NUMERO_ADMIN, {
    text: `💰 *Pago confirmado*

👤 Usuario: ${msg.key.participant}
📍 Grupo: ${configGrupo.nombre}`
  });

  // 👉 aquí cierras la reserva en BD
}
