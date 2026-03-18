import { ADMINS, STICKER_PAGO_ID, NUMERO_NOTIFICACION } from "./config.js";
import { supabase } from "./supabase.js";

console.log("🔥 PAGOS ALINEADO");

// 🔥 limpiar número
const limpiarNumero = (jid = "") => jid.split("@")[0];

// 🔥 obtener usuario desde JID (MISMA LÓGICA QUE RESERVAS)
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

export async function procesarPago(sock, msg, configGrupo, jidUsuario) {

  console.log("\n💰 procesarPago ACTIVADO");

  const sticker = msg.message?.stickerMessage;
  if (!sticker) return;

  const stickerID = sticker.fileSha256
    ? Buffer.from(sticker.fileSha256).toString("base64")
    : null;

  console.log("🧩 Sticker ID:", stickerID);

  // 🔥 VALIDAR ADMIN POR NÚMERO (FIX REAL)
  const numeroUsuario = limpiarNumero(jidUsuario);

  const esAdmin = ADMINS.includes(numeroUsuario);

  if (!esAdmin) {
    console.log("⛔ No es admin");
    return;
  }

  console.log("✅ ES ADMIN");

  // 🔒 validar sticker
  if (stickerID !== STICKER_PAGO_ID) {
    console.log("⛔ Sticker no válido");
    return;
  }

  // 🔥 CLIENTE
  const clienteJid =
    sticker.contextInfo?.participant ||
    sticker.contextInfo?.remoteJid ||
    null;

  if (!clienteJid) {
    console.log("⚠️ No se pudo obtener cliente");
    return;
  }

  console.log("👤 Cliente JID:", clienteJid);

  const { telefonoFinal, lidFinal } = await obtenerUsuario(clienteJid);

  if (!telefonoFinal) {
    console.log("⚠️ No se pudo identificar teléfono del cliente");
    return;
  }

  console.log("📞 Teléfono final:", telefonoFinal);
  console.log("🆔 LID final:", lidFinal);

  // 🔎 buscar reservas
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

  // ✅ marcar pagado
  const { error: errorUpdate } = await supabase
    .from(configGrupo.tabla)
    .update({ estado: "pagado" })
    .eq("contacto", telefonoFinal);

  if (errorUpdate) {
    console.error("❌ Error marcando pagado:", errorUpdate.message);
    return;
  }

  console.log("✅ Pago marcado correctamente");
// 📤 notificación
const mensaje = `
✅ *PAGO CONFIRMADO*

👤 Cliente: *${comprador}*
📍 Grupo: ${configGrupo.nombre}
🔢 Números: *( ${numeros.join(" - ")} )*
`;

if (Array.isArray(NUMERO_NOTIFICACION)) {
  for (const numero of NUMERO_NOTIFICACION) {
    await sock.sendMessage(numero, { text: mensaje });
  }
} else {
  await sock.sendMessage(NUMERO_NOTIFICACION, { text: mensaje });
}

console.log("📤 Confirmación enviada a notificaciones");
}