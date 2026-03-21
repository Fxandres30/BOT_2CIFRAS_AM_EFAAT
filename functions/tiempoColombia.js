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

// 🔥 HORA LIMPIA (CLAVE)
export function horaColombia() {
  return ahoraColombia().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }); // 👉 "20:24"
}

export function timestampColombia() {
  return ahoraColombia().getTime();
}

// 🔥 VALIDACIÓN CORRECTA
export function yaPasoHora(horaLimite) {
  const ahora = ahoraColombia();

  const [h, m] = horaLimite.split(":").map(Number);

  const limite = new Date(ahora);
  limite.setHours(h, m, 0, 0);

  return ahora >= limite;
}