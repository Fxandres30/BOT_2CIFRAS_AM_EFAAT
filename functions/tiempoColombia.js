// tiempoColombia.js

export function ahoraColombia() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Bogota",
    })
  );
}

export function fechaColombia() {
  return ahoraColombia().toLocaleDateString("es-CO");
}

export function horaColombia() {
  return ahoraColombia().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function timestampColombia() {
  return ahoraColombia().getTime();
}

export function yaPasoHora(horaLimite) {
  const ahora = ahoraColombia();

  const [h, m] = horaLimite.split(":").map(Number);

  const limite = new Date(ahora);
  limite.setHours(h, m, 0, 0);

  return ahora >= limite;
}