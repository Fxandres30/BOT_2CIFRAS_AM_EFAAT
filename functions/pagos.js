
import {
  STICKER_PAGO_ID,
  NUMERO_NOTIFICACION
}
from "./config.js";

import {
  supabase
}
from "./supabase.js";

import {
  enviarMensaje
}
from "./enviar.js";

import {
  obtenerUsuarioGlobal
}
from "./usuarioGlobal.js";

import {
  obtenerAdminsGrupo
}
from "./cacheAdmins.js";

console.log(
  "🔥 PAGOS ALINEADO"
);

/* 🔥 PROCESAR PAGO */
export async function procesarPago(

  sock,
  msg,
  configGrupo,
  jidUsuario

) {

  console.log(
    "\n💰 procesarPago ACTIVADO"
  );

  // 🔥 sticker
  const sticker =
    msg.message?.stickerMessage;

  if (!sticker) {
    return;
  }

  // 🔥 sticker id
  const stickerID =

    sticker.fileSha256

      ? Buffer
          .from(
            sticker.fileSha256
          )
          .toString("base64")

      : null;

  console.log(
    "🧩 Sticker ID:",
    stickerID
  );

  const grupoId =
    msg.key.remoteJid;

  // 🔥 admins cacheados
  const admins =
    await obtenerAdminsGrupo(
      sock,
      grupoId
    );

  const esAdmin =

    admins.includes(
      jidUsuario
    )

    ||

    admins.includes(
      msg.key.participant
    );

  // 🔥 validar admin
  if (!esAdmin) {

    console.log(
      "⛔ No es admin"
    );

    return;
  }

  console.log(
    "✅ ES ADMIN"
  );

  // 🔥 validar sticker
  if (
    !STICKER_PAGO_ID.includes(
      stickerID
    )
  ) {

    console.log(
      "⛔ Sticker no válido"
    );

    return;
  }

  // 🔥 cliente
  const clienteJid =

    sticker.contextInfo
      ?.participant

    ||

    sticker.contextInfo
      ?.remoteJid

    ||

    null;

  if (!clienteJid) {

    console.log(
      "⚠️ No se pudo obtener cliente"
    );

    return;
  }

  console.log(
    "👤 Cliente JID:",
    clienteJid
  );

  // 🔥 usuario global
  const usuario =
    await obtenerUsuarioGlobal(
      clienteJid
    );

  if (!usuario) {

    console.log(
      "⚠️ Cliente inválido"
    );

    return;
  }

  const telefonoFinal =
    usuario.telefono;

  const lidFinal =
    usuario.lid;

  console.log(
    "📞 Teléfono:",
    telefonoFinal
  );

  console.log(
    "🆔 LID:",
    lidFinal
  );

  // 🔥 evento activo
  const {
    data: evento,
    error: errorEvento
  } = await supabase

    .from("eventos_bot")

    .select(
      "tabla, estado"
    )

    .eq(
      "grupo_id",
      grupoId
    )

    .eq(
      "estado",
      "abierto"
    )

    .single();

  if (
    errorEvento ||
    !evento
  ) {

    console.log(
      "⛔ No hay evento activo"
    );

    return;
  }

  const tabla =
    evento.tabla;

  if (!tabla) {

    console.log(
      "❌ Evento sin tabla"
    );

    return;
  }

  console.log(
    "🗄️ Tabla:",
    tabla
  );

// 🔥 ID GLOBAL
const usuarioId =

  telefonoFinal ||
  lidFinal;

if (!usuarioId) {

  console.log(
    "⚠️ Usuario sin ID global"
  );

  return;
}

// 🔥 buscar reservas
const {
  data: reservas,
  error
} = await supabase

  .from(tabla)

  .select(
    "numero, comprador"
  )

.in(
  "contacto",

  [
    telefonoFinal,
    lidFinal
  ].filter(Boolean)
);

  if (error) {

    console.error(
      "❌ Error buscando reservas:",
      error.message
    );

    return;
  }

  if (!reservas?.length) {

    console.log(
      "⚠️ Cliente sin reservas"
    );

    return;
  }

  const numeros =
    reservas.map(
      r => r.numero
    );

  const comprador =

    reservas[0]?.comprador

    ||

    "Sin nombre";

  console.log(
    "🔢 Números:",
    numeros
  );

  // 🔥 marcar pagado
  const {
    error: errorUpdate
  } = await supabase

    .from(tabla)

    .update({
      estado: "pagado"
    })

    .eq(
      "estado",
      "reservado"
    )
  
.in(

  "contacto",

  [
    telefonoFinal,
    lidFinal
  ].filter(Boolean)

);

  if (errorUpdate) {

    console.error(
      "❌ Error marcando pagado:",
      errorUpdate.message
    );

    return;
  }

  console.log(
    "✅ Pago marcado"
  );

  // 🔥 mensaje
  const mensaje =

`✅ *PAGO CONFIRMADO*

👤 Cliente: *${comprador}*
📍 Grupo: *${configGrupo.nombre}*
🔢 Números: *( ${numeros.join(" - ")} )*`;

  // 🔥 enviar notificaciones
  if (
    Array.isArray(
      NUMERO_NOTIFICACION
    )
  ) {

    for (const numero of NUMERO_NOTIFICACION) {

      await enviarMensaje(
        sock,
        numero,
        mensaje
      );
    }

  } else {

    await enviarMensaje(
      sock,
      NUMERO_NOTIFICACION,
      mensaje
    );
  }

  console.log(
    "📤 Confirmación enviada"
  );
}
