// reservas.js

import { supabase } from "./supabase.js";
import { NUMERO_ADMIN } from "./config.js";
import { textoPermitidoParaReserva } from "./reglasReserva.js";
import {
  mensajesTodosLibres,
  mensajesTodosOcupados,
  mensajeAleatorio
} from "./mensajes.js";
import { delayEscritura } from "./typing.js";

function limpiarContacto(jid = "") {
  return jid
    .replace("@s.whatsapp.net", "")
    .replace("@lid", "")
    .replace(/^57/, "");
}

// 🔢 Extraer números de 2 cifras
function extraerNumeros(texto) {
  return texto
    .toLowerCase()
    .replace(/[o]/g, "0")
    .replace(/[_\-.,;/|\\()]+/g, " ")
    .replace(/\b([0-9])\b/g, "0$1")
    .match(/\b\d{2}\b/g) || [];
}

async function responder(sock, jid, texto, msg, delay = 1500) {
  await delayEscritura(sock, jid, delay);
  await sock.sendMessage(
    jid,
    { text: texto },
    { quoted: msg }
  );
}

export async function procesarReserva(sock, msg, texto, configGrupo) {

  // 🚫 BLOQUEAR MENSAJES CON MULTIMEDIA
if (
  msg.message?.imageMessage ||
  msg.message?.videoMessage ||
  msg.message?.stickerMessage ||
  msg.message?.documentMessage ||
  msg.message?.audioMessage
) {
  console.log("🚫 Mensaje con multimedia detectado. Proceso cancelado.");
  return;
}

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📥 NUEVA RESERVA DETECTADA");
  console.log("🧪 DEBUG COMPLETO DEL MSG:");
console.log(JSON.stringify(msg, null, 2));

console.log("🔎 key.remoteJid:", msg?.key?.remoteJid);
console.log("🔎 key.participant:", msg?.key?.participant);
console.log("🔎 key.id:", msg?.key?.id);
console.log("🔎 pushName:", msg?.pushName);
console.log("🔎 message?.sender:", msg?.message?.sender);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Texto recibido:", texto);

  if (!textoPermitidoParaReserva(texto)) {
    console.log("⛔ Texto NO permitido para reserva");
    return;
  }

  const numeros = extraerNumeros(texto);

  console.log("🔢 Números extraídos:", numeros);

  if (numeros.length === 0) {
    console.log("⚠️ No se detectaron números válidos");
    return;
  }

  const { tabla, nombre: nombreGrupo } = configGrupo;
  const grupoId = msg.key.remoteJid;
  const contactoRaw = msg.key.participant || msg.key.remoteJid;
const contacto = limpiarContacto(contactoRaw);
  const nombre = msg.pushName || "Sin nombre";

  console.log("👤 Usuario:", nombre);
  console.log("📞 Contacto:", contacto);
  console.log("📍 Grupo:", nombreGrupo);
  console.log("🗄️ Tabla:", tabla);

  // 📦 Consultar BD
  const { data, error } = await supabase
    .from(tabla)
    .select("numero, estado, contacto")
    .in("numero", numeros);

  if (error) {
    console.error("❌ Error Supabase:", error);
    return;
  }

  console.log("📦 Datos BD:", data);

  const ocupadosPorOtros = data
    .filter(n => n.estado !== "libre" && n.contacto !== contacto)
    .map(n => n.numero);

  const yaSonMios = data
    .filter(n => n.contacto === contacto)
    .map(n => n.numero);

  const disponibles = numeros.filter(
    n => !ocupadosPorOtros.includes(n) && !yaSonMios.includes(n)
  );

  console.log("📊 ESTADO DE NÚMEROS:");
  console.log("🟥 Ocupados por otros:", ocupadosPorOtros);
  console.log("🟨 Ya son míos:", yaSonMios);
  console.log("🟩 Disponibles:", disponibles);

  // 🚫 CASO: TODOS YA SON DEL MISMO USUARIO (NO RESPONDER)
if (
  disponibles.length === 0 &&
  ocupadosPorOtros.length === 0 &&
  yaSonMios.length === numeros.length
) {
  console.log("🔵 Todos los números ya pertenecen al usuario. No se responde.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  return;
}

  // 🔴 CASO 2: TODOS OCUPADOS
  if (ocupadosPorOtros.length === numeros.length) {
    console.log("🔴 CASO: TODOS OCUPADOS");

  await responder(
  sock,
  grupoId,
  mensajeAleatorio(mensajesTodosOcupados),
  msg
);
return;

  }

  // 💾 Reservar SOLO disponibles
  const reservados = [];

  for (const numero of disponibles) {
    console.log(`⏳ Intentando reservar número ${numero}...`);

    const { data: updateData, error: updateError } = await supabase
  .from(tabla)
  .update({
    estado: "reservado",
    comprador: nombre,
    contacto
  })
  .eq("numero", numero)
  .eq("estado", "libre")
  .select("numero"); // 🔥 CLAVE

if (updateError) {
  console.log(`❌ Error al reservar ${numero}`);
} else if (updateData.length === 1) {
  console.log(`✅ Número reservado correctamente: ${numero}`);
  reservados.push(numero);
} else {
  console.log(`⚠️ Número ${numero} ya no estaba libre`);
}
  }

  console.log("📌 Números finalmente reservados:", reservados);

  // 🟢 CASO 1: TODOS LIBRES
  if (ocupadosPorOtros.length === 0) {
    console.log("🟢 CASO: TODOS LIBRES");

    await responder(
  sock,
  grupoId,
  mensajeAleatorio(mensajesTodosLibres),
  msg
);
  }
  // 🟡 CASO 3: MEZCLADOS
  else {
    console.log("🟡 CASO: MEZCLADOS");
    
    let respuesta = "";

    if (reservados.length > 0) {
      respuesta += `✅ 𝐍ú𝐦𝐞𝐫𝐨𝐬 𝐫𝐞𝐬𝐞𝐫𝐯𝐚𝐝𝐨𝐬: *( ${reservados.join(" - ")} )*\n`;
    }

    if (ocupadosPorOtros.length > 0) {
      respuesta += `❌ 𝐍𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐥𝐞𝐬: *( ${ocupadosPorOtros.join(" - ")} )*`;
    }
    await responder(sock, grupoId, respuesta, msg);
  
  }

  // 📲 Mensaje privado al admin
  if (reservados.length > 0) {
    console.log("📨 Enviando aviso al ADMIN");

    await sock.sendMessage(NUMERO_ADMIN, {
      text: `📥 *Reserva confirmada*

👤 Usuario: ${nombre}
📞 Número: ${contacto.split("@")[0]}
📍 Grupo: ${nombreGrupo}
🗄️ Tabla: ${tabla}
🔢 Números: ${reservados.join(", ")}`
    });
  }

  console.log("✅ FIN DEL PROCESO");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}
