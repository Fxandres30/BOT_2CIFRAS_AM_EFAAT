import { supabase } from "./supabase.js";

export async function obtenerUsuarioGlobal(jidUsuario) {

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

    if (data?.length) {
      lidFinal = data[0].lid;
    }
  }

  // buscar telefono
  if (!telefonoFinal && lidFinal) {
    const { data } = await supabase
      .from("usuarios")
      .select("telefono")
      .eq("lid", lidFinal)
      .limit(1);

    if (data?.length) {
      telefonoFinal = data[0].telefono;
    } else {
      console.log("⚠️ LID no registrado:", lidFinal);
      return null;
    }
  }

  if (!telefonoFinal) return null;

  return {
    telefono: telefonoFinal,
    lid: lidFinal,
    jid: telefonoFinal + "@s.whatsapp.net"
  };
}