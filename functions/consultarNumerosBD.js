// functions/consultarNumerosBD.js

import { supabase } from "./supabase.js";

function parsearJid(jid = "") {

  if (jid.includes("@s.whatsapp.net")) {
    return {
      telefono: jid.replace("@s.whatsapp.net", "").replace(/^57/, ""),
      lid: null
    };
  }

  if (jid.includes("@lid")) {
    return {
      telefono: null,
      lid: jid
    };
  }

  return { telefono: null, lid: null };
}

export async function obtenerNumerosUsuario(jidUsuario, tabla) {

  let { telefono, lid } = parsearJid(jidUsuario);

  let telefonoFinal = telefono;
  let lidFinal = lid;

  // 📞 buscar LID
  if (telefonoFinal) {
    const { data } = await supabase
      .from("usuarios")
      .select("lid")
      .eq("telefono", telefonoFinal)
      .limit(1);

    if (data?.length > 0) {
      lidFinal = data[0].lid;
    }
  }

  // 🆔 buscar teléfono
  if (!telefonoFinal && lidFinal) {
    const { data } = await supabase
      .from("usuarios")
      .select("telefono")
      .eq("lid", lidFinal)
      .limit(1);

    if (data?.length > 0) {
      telefonoFinal = data[0].telefono;
    } else {
      console.log("❌ Usuario no encontrado");
      return { reservados: [], pagados: [] };
    }
  }

  if (!telefonoFinal) {
    console.log("⚠️ No se pudo identificar usuario");
    return { reservados: [], pagados: [] };
  }

  // 🔥 CONSULTA
  const { data, error } = await supabase
    .from(tabla)
    .select("numero, estado, contacto")
    .eq("contacto", telefonoFinal);

  if (error) {
    console.log("❌ Error DB:", error);
    return { reservados: [], pagados: [] };
  }

  if (!data.length) {
    return { reservados: [], pagados: [] };
  }

  // 🔥 DEBUG PRO
  console.log("📊 DATA CRUDA:", data);

  const reservados = data
    .filter(n => n.estado === "reservado")
    .map(n => n.numero);

  const pagados = data
    .filter(n => n.estado === "pagado")
    .map(n => n.numero);

  return {
    reservados,
    pagados
  };
}