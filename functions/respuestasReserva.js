import {

  mensajeAleatorio,

  mensajesTodosLibres,
  mensajesTodosOcupados,

  encabezadosReservados,
  encabezadosOcupados

} from "./mensajes.js";

/* 🔥 RESPUESTA RESERVA */
export function crearRespuestaReserva({

  reservados = [],
  ocupados = []

}) {

  // 🔥 TODOS LIBRES
  if (

    reservados.length > 0 &&
    ocupados.length === 0

  ) {

    return mensajeAleatorio(
      mensajesTodosLibres
    );
  }

  // 🔥 TODOS OCUPADOS
  if (

    reservados.length === 0 &&
    ocupados.length > 0

  ) {

    return mensajeAleatorio(
      mensajesTodosOcupados
    );
  }

  // 🔥 MIXTO
  const partes = [];

  // 🔥 RESERVADOS
  if (reservados.length > 0) {

    const plantilla =

      mensajeAleatorio(
        encabezadosReservados
      );

    partes.push(

      plantilla.replace(
        "{numeros}",
        reservados.join(" - ")
      )

    );
  }

  // 🔥 OCUPADOS
  if (ocupados.length > 0) {

    const plantilla =

      mensajeAleatorio(
        encabezadosOcupados
      );

    partes.push(

      plantilla.replace(
        "{numeros}",
        ocupados.join(" - ")
      )

    );
  }

  // 🔥 RESPUESTA FINAL
  return partes.join("\n\n");
}
