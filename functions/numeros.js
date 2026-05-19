/* EXTRAER NÚMEROS */
export function extraerNumeros(texto = "") {

  return texto
    .toLowerCase()

    .replace(/([a-z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-z])/g, "$1 $2")

    .replace(/(\d)(y)(\d)/g, "$1 $3")

    .replace(/[_\-.,;/|\\()]+/g, " ")

    .split(/\s+/)

    .map(token => {

      if (/^[0-9o]{2}$/.test(token)) {
        return token.replace(/o/g, "0");
      }

      return token;
    })

    .join(" ")

    .match(/\b\d{2}\b/g)

    ?.filter(n => Number(n) <= 99)

    || [];
}

/* FORMATEAR */
export function formatearNumeros(
  numeros = []
) {

  return numeros.join(" - ");
}

/* ELIMINAR DUPLICADOS */
export function eliminarDuplicados(
  numeros = []
) {

  return [...new Set(numeros)];
}
