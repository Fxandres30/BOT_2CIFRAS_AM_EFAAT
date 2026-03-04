import { ADMINS, STICKER_PAGO_ID, NUMERO_NOTIFICACION } from "./config.js";
import { jidDecode } from "@whiskeysockets/baileys";
import { supabase } from "./supabase.js";

// 🧠 Normalizar JID
function decodeJid(jid = "") {
  const r = jidDecode(jid);
  return r?.user ? r.user + "@s.whatsapp.net" : jid;
}

export async function procesarPago(sock, msg, configGrupo) {
  console.log("\n💰 procesarPago ACTIVADO");

  const sticker = msg.message?.stickerMessage;
  if (!sticker) return;

  const stickerID = sticker.fileSha256
    ? Buffer.from(sticker.fileSha256).toString("base64")
    : null;

  console.log("🧩 Sticker ID:", stickerID);

  // 👤 QUIÉN ENVÍA EL STICKER
  const remitente = decodeJid(
    msg.key.participant || msg.key.remoteJid
  );

  console.log("👤 Remitente:", remitente);

  // 🔒 SOLO ADMINS
  if (!ADMINS.includes(remitente)) {
    console.log("⛔ No es admin, ignorado");
    return;
  }

  // 🎯 VALIDAR STICKER
  if (stickerID !== STICKER_PAGO_ID) {
    console.log("⛔ Sticker no válido");
    return;
  }

  // 🧠 CLIENTE DESDE EL STICKER RESPONDIDO
  const clienteRaw =
    sticker.contextInfo?.participant ||
    sticker.contextInfo?.remoteJid ||
    "";

  const cliente = decodeJid(clienteRaw);
  const contacto = cliente
    .replace("@s.whatsapp.net", "")
    .replace(/^57/, "");

  console.log("📞 Cliente detectado:", contacto);

  if (!contacto) {
    console.log("⚠️ No se pudo detectar cliente");
    return;
  }

  // 🔍 BUSCAR RESERVAS
  const { data: reservas, error } = await supabase
    .from(configGrupo.tabla)
    .select("numero, comprador")
    .eq("contacto", contacto);

  if (error) {
    console.error("❌ Error buscando reservas:", error.message);
    return;
  }

  if (!reservas || !reservas.length) {
    console.log("⚠️ Cliente sin reservas");
    return;
  }

  const numeros = reservas.map(r => r.numero);
  const comprador = reservas[0].comprador || "Sin nombre";

  console.log("🔢 Números encontrados:", numeros);

  // ✅ MARCAR COMO PAGADO
  const { error: errorUpdate } = await supabase
    .from(configGrupo.tabla)
    .update({ estado: "pagado" })
    .eq("contacto", contacto);

  if (errorUpdate) {
    console.error("❌ Error marcando pagado:", errorUpdate.message);
    return;
  }

  console.log("✅ Pago marcado correctamente");

  // 📩 MENSAJE PRIVADO (SOLO A TI)
  const mensaje = `
✅ *PAGO CONFIRMADO*

👤 Cliente: *${comprador}*
📍 Grupo: ${configGrupo.nombre}
🔢 Números: *( ${numeros.join(" - ")} )*
  `;

  await sock.sendMessage(NUMERO_NOTIFICACION, { text: mensaje });

  console.log("📤 Confirmación enviada a tu privado");
}
