import { supabase } from "./supabase.js";

import { NUMERO_ADMIN }
from "./config.js";

import {
  textoPermitidoParaReserva
} from "./reglasReserva.js";

import {
  enviarMensaje
} from "./enviar.js";

import {
  extraerNumeros
} from "./numeros.js";

import {
  obtenerUsuarioGlobal
}
from "./usuarioGlobal.js";

import {
  crearRespuestaReserva
}
from "./respuestasReserva.js";

/* 🔥 PROCESAR RESERVA */
export async function procesarReserva(

  sock,
  msg,
  texto,
  configGrupo,
  jidUsuario

) {

  // 🔥 validar texto
  if (!textoPermitidoParaReserva(texto)) {
    return;
  }

  // 🔥 ignorar multimedia
  if (

    msg.message?.imageMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.audioMessage

  ) {
    return;
  }

  // 🔥 extraer números
  const numeros =
    extraerNumeros(texto);

  if (numeros.length === 0) {
    return;
  }

  const grupoId =
    msg.key.remoteJid;

  const nombreGrupo =
    configGrupo.nombre;

  // 🔥 buscar evento activo
  const {
    data: evento,
    error: errorEvento
  } = await supabase

    .from("eventos_bot")

    .select("tabla, estado")

    .eq("grupo_id", grupoId)

    .eq("estado", "abierto")

    .single();

  if (errorEvento || !evento) {

    console.log(
      "⚠️ No hay evento activo:",
      grupoId
    );

    return;
  }

  const tabla = evento.tabla;

  if (!tabla) {

    console.log(
      "⚠️ Evento sin tabla:",
      grupoId
    );

    return;
  }

  // 🔥 usuario
  const usuario =

    await obtenerUsuarioGlobal(
      jidUsuario
    );

  if (!usuario) {

    console.log(
      "❌ Usuario inválido:",
      jidUsuario
    );

    return;
  }

  const telefonoFinal =
    usuario.telefono;

  const lidFinal =
    usuario.lid;

  // 🔥 ID GLOBAL
  const usuarioId =

    telefonoFinal ||
    lidFinal;

  // 🔥 consultar números
  const {
    data,
    error
  } = await supabase

    .from(tabla)

    .select(
      "numero, estado, contacto, lib"
    )

    .in("numero", numeros);

  if (error) {

    console.log(
      "❌ Error consultando:",
      error.message
    );

    return;
  }

  // 🔥 ocupados por otros
  const ocupadosPorOtros =

    data

      .filter(
        n =>
          n.estado !== "libre"
          &&
          n.contacto !== usuarioId
      )

      .map(n => n.numero);

  // 🔥 ya reservados por mí
  const yaSonMios =

    data

      .filter(
        n =>
          n.contacto === usuarioId
      )

      .map(n => n.numero);

  // 🔥 disponibles
  const disponibles =

    numeros.filter(n =>

      !ocupadosPorOtros.includes(n)
      &&
      !yaSonMios.includes(n)

    );

  // 🔥 todos ya son míos
  if (

    disponibles.length === 0 &&
    ocupadosPorOtros.length === 0 &&
    yaSonMios.length === numeros.length

  ) {
    return;
  }

  // 🔥 nombre
  const nombre =

    msg.pushName ||
    "Sin nombre";

  // 🔥 reservados finales
  const reservados = [];

  // 🔥 reservar números
  for (const numero of disponibles) {

    const {
      data: updateData
    } = await supabase

      .from(tabla)

      .update({

        estado: "reservado",

        comprador: nombre,

        contacto: usuarioId,

        lib: lidFinal

      })

      .eq("numero", numero)

      .eq("estado", "libre")

      .select("numero");

    if (updateData?.length === 1) {
      reservados.push(numero);
    }
  }

  // 🔥 crear respuesta
  const respuesta =

    crearRespuestaReserva({

      reservados,

      ocupados:
        ocupadosPorOtros

    });

  // 🔥 enviar respuesta
  if (respuesta) {

    enviarMensaje(

      sock,
      grupoId,

      respuesta,

      {
        quoted: msg
      }
    );
  }

  // 🔥 admin
  if (reservados.length > 0) {

    enviarMensaje(

      sock,
      NUMERO_ADMIN,

`*📥 Reserva confirmada*

👤 Usuario: *${nombre}*
🆔 ID: *${usuarioId}*
📞 Teléfono: *${telefonoFinal || "No disponible"}*
🆔 LID: *${lidFinal || "No disponible"}*
📍 Grupo: *${nombreGrupo}*
📊 Tabla: *${tabla}*
🔢 Números: *${reservados.join(", ")}*`

    );
  }
}
