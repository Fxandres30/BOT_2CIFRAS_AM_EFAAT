import { ADMINS, STICKER_PAGO_ID, NUMERO_NOTIFICACION } from "./config.js";
import { jidDecode } from "@whiskeysockets/baileys";
import { supabase } from "./supabase.js";

// 🧠 Normalizar JID
function decodeJid(jid = "") {
  const r = jidDecode(jid);
  return r?.user ? r.user + "@s.whatsapp.net" : jid;
}

// 🔎 detectar telefono o LID correctamente
function parsearJid(jid = "") {

  if (jid.includes("@lid")) {
    return {
      telefono: null,
      lid: jid
    };
  }

  if (jid.includes("@s.whatsapp.net")) {

    const numero = jid
      .replace("@s.whatsapp.net", "")
      .replace(/^57/, "");

    // teléfono real
    if (numero.length <= 12) {
      return {
        telefono: numero,
        lid: null
      };
    }

    // ID largo → convertir a LID
    return {
      telefono: null,
      lid: numero + "@lid"
    };
  }

  return { telefono: null, lid: null };
}

export async function procesarPago(sock, msg, configGrupo) {

  console.log("\n💰 procesarPago ACTIVADO");

  const sticker = msg.message?.stickerMessage;
  if (!sticker) return;

  const stickerID = sticker.fileSha256
    ? Buffer.from(sticker.fileSha256).toString("base64")
    : null;

  console.log("🧩 Sticker ID:", stickerID);

  const remitente = decodeJid(
    msg.key.participant || msg.key.remoteJid
  );

  console.log("👤 Remitente:", remitente);

  if (!ADMINS.includes(remitente)) {
    console.log("⛔ No es admin");
    return;
  }

  if (stickerID !== STICKER_PAGO_ID) {
    console.log("⛔ Sticker no válido");
    return;
  }

  // cliente citado
  const clienteRaw =
    sticker.contextInfo?.participant ||
    sticker.contextInfo?.remoteJid ||
    "";

  const clienteJid = decodeJid(clienteRaw);

  console.log("👤 Cliente JID:", clienteJid);

  const { telefono, lid } = parsearJid(clienteJid);

  let telefonoFinal = telefono;
  let lidFinal = lid;

  // si llega telefono buscar lid
  if (telefonoFinal) {

    const { data } = await supabase
      .from("usuarios")
      .select("lid")
      .eq("telefono", telefonoFinal)
      .limit(1);

    if (data?.length) {
      lidFinal = data[0].lid;
    }

  }

  // si llega lid buscar telefono
  if (!telefonoFinal && lidFinal) {

    const { data } = await supabase
      .from("usuarios")
      .select("telefono")
      .eq("lid", lidFinal)
      .limit(1);

    if (data?.length) {
      telefonoFinal = data[0].telefono;
    }

  }

  if (!telefonoFinal) {
    console.log("⚠️ No se pudo identificar teléfono");
    return;
  }

  console.log("📞 Teléfono final:", telefonoFinal);
  console.log("🆔 LID final:", lidFinal);

  // buscar reservas
  const { data: reservas, error } = await supabase
    .from(configGrupo.tabla)
    .select("numero, comprador")
    .eq("contacto", telefonoFinal);

  if (error) {
    console.error("❌ Error buscando reservas:", error.message);
    return;
  }

  if (!reservas?.length) {
    console.log("⚠️ Cliente sin reservas");
    return;
  }

  const numeros = reservas.map(r => r.numero);
  const comprador = reservas[0].comprador || "Sin nombre";

  console.log("🔢 Números encontrados:", numeros);

  // marcar pagado
  const { error: errorUpdate } = await supabase
    .from(configGrupo.tabla)
    .update({ estado: "pagado" })
    .eq("contacto", telefonoFinal);

  if (errorUpdate) {
    console.error("❌ Error marcando pagado:", errorUpdate.message);
    return;
  }

  console.log("✅ Pago marcado correctamente");

  const mensaje = `

✅ *PAGO CONFIRMADO*

👤 Cliente: *${comprador}*
📍 Grupo: ${configGrupo.nombre}
🔢 Números: *( ${numeros.join(" - ")} )*

`;

  await sock.sendMessage(NUMERO_NOTIFICACION, { text: mensaje });

  console.log("📤 Confirmación enviada a tu privado");
}
