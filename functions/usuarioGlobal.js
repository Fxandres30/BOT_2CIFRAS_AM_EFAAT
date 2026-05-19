import { supabase } from "./supabase.js";

export async function obtenerUsuarioGlobal(jidUsuario) {

  let telefono = null;
  let lid = null;

  // TELEFONO
  if (jidUsuario.includes("@s.whatsapp.net")) {

    telefono = jidUsuario
      .replace("@s.whatsapp.net", "")
      .replace(/^57/, "");
  }

  // LID
  if (jidUsuario.includes("@lid")) {
    lid = jidUsuario;
  }

  let telefonoFinal = telefono;
  let lidFinal = lid;

  // SI VIENE TELEFONO → BUSCAR LID
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

  // SI VIENE LID → BUSCAR TELEFONO
  if (!telefonoFinal && lidFinal) {

    const { data } = await supabase
      .from("usuarios")
      .select("telefono")
      .eq("lid", lidFinal)
      .limit(1);

    if (data?.length) {

      telefonoFinal = data[0].telefono;

    } else {

      console.log("⚠️ LID sin teléfono registrado:", lidFinal);

      // NO RETORNAR NULL
      // SOLO CONTINUAR
    }
  }

  // SI NO EXISTE NADA
  if (!telefonoFinal && !lidFinal) {
    return null;
  }

  return {

    telefono: telefonoFinal,
    lid: lidFinal,

    // SI HAY TELEFONO USAR JID REAL
    // SI NO, USAR LID
    jid: telefonoFinal
      ? telefonoFinal + "@s.whatsapp.net"
      : lidFinal
  };
}