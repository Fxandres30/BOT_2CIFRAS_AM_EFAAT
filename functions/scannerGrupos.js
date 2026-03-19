import { supabase } from "./supabase.js";
import { NUMERO_NOTIFICACION } from "./config.js"; // 🔥 IMPORTANTE
import { horaColombia, fechaColombia } from "./tiempoColombia.js";

const obtenerNumero = (jid = "") => jid.split("@")[0];

async function guardarUsuario(jidUsuario, grupoId, grupoNombre) {

  const lid = jidUsuario.includes("@lid") ? jidUsuario : null;

  const telefono = jidUsuario.includes("@s.whatsapp.net")
    ? jidUsuario.replace("@s.whatsapp.net", "").replace(/^57/, "")
    : null;

  const numero = obtenerNumero(jidUsuario);

  try {

    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .or(`telefono.eq.${telefono},lid.eq.${lid}`)
      .limit(1);

    if (data?.length) {

      const user = data[0];
      const updates = {};

      if (!user.telefono && telefono) updates.telefono = telefono;
      if (!user.lid && lid) updates.lid = lid;

      if (Object.keys(updates).length > 0) {

        await supabase
          .from("usuarios")
          .update(updates)
          .eq("id", user.id);

        console.log("🔄 Actualizado:", numero);
        return "actualizado";
      }

      return "existente";

    } else {

      await supabase.from("usuarios").insert({
        telefono,
        lid,
        grupo_id: grupoId,
        grupo_nombre: grupoNombre,
        created_at: new Date(),
        ultima_actividad: new Date()
      });

      console.log("✅ Nuevo usuario:", numero);
      return "nuevo";
    }

  } catch (err) {
    console.log("❌ Error usuario:", err);
    return "error";
  }
}

export async function escanearGrupos(sock) {

  try {
    console.log("\n🔍 ESCANEANDO GRUPOS...\n");

    const grupos = await sock.groupFetchAllParticipating();

    let totalGrupos = 0;
    let totalUsuarios = 0;
    let nuevos = 0;
    let actualizados = 0;

    for (const id in grupos) {

      totalGrupos++;

      const grupo = grupos[id];
      const participantes = grupo.participants || [];

      console.log(`📌 ${grupo.subject} (${participantes.length} usuarios)`);

      for (const p of participantes) {

        const jid = p.id;
        if (!jid) continue;

        totalUsuarios++;

        const resultado = await guardarUsuario(jid, id, grupo.subject);

        if (resultado === "nuevo") nuevos++;
        if (resultado === "actualizado") actualizados++;
      }
    }

    console.log("\n📊 RESUMEN ESCÁNER:");
    console.log("📁 Grupos:", totalGrupos);
    console.log("👥 Usuarios:", totalUsuarios);
    console.log("🆕 Nuevos:", nuevos);
    console.log("🔄 Actualizados:", actualizados);
    console.log("✅ ESCANEO COMPLETADO\n");

    // 🔥 CONTAR TOTAL EN BD
    const { count } = await supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true });

    // 🔥 MENSAJE FINAL
    const mensaje = `
📊 *ESCÁNER COMPLETADO*

*📁 Grupos:* ${totalGrupos}
*👥 Escaneados:* ${totalUsuarios}
*🆕 Nuevos:* ${nuevos}
*🔄 Actualizados:* ${actualizados}

📦 *TOTAL EN BD:* ${count}

⏰ ${fechaColombia()} ${horaColombia()}
`;

    // 🔥 ENVIAR A TODOS
    for (const numero of NUMERO_NOTIFICACION) {
      await sock.sendMessage(numero, { text: mensaje });
    }

    console.log("📤 Reporte enviado a notificaciones");

  } catch (err) {
    console.log("❌ Error escaneando grupos:", err);
  }
}