import { delayEscritura } from "./typing.js";
import { NUMERO_ADMIN } from "./config.js";

const STICKER_PAGO_ID = "T9gVHBVeWDiTlhsDL0tr3Xjbu0bUzAlP1VjSHjf5rKg=";

export async function procesarConfirmacion(sock, msg, configGrupo) {
  const sticker = msg.message?.stickerMessage;
  if (!sticker) return;

  const stickerId = sticker.fileSha256?.toString("base64");
  if (stickerId !== STICKER_PAGO_ID) return;

  // 🔥 USUARIO REAL (FIX)
  const jidUsuario =
    msg.key.participantPn ||
    msg.key.participant ||
    msg.key.remoteJid ||
    "";

  const numero = jidUsuario.split("@")[0];

  await delayEscritura(sock, msg.key.remoteJid);

  // 📩 MENSAJE AL GRUPO
  await sock.sendMessage(msg.key.remoteJid, {
    text: `✅ *Pago confirmado* 🧾🙌

👤 Usuario: @${numero}
📍 Grupo: *${configGrupo.nombre}*

⋆ ᴱᶠᵃᵃ𝐭 ⋆`,
    mentions: [jidUsuario]
  });

  // 📲 MENSAJE AL ADMIN
  await sock.sendMessage(NUMERO_ADMIN, {
    text: `💰 *Pago confirmado*

👤 Usuario: ${numero}
📍 Grupo: ${configGrupo.nombre}`
  });

  // 👉 aquí cierras la reserva en BD
}