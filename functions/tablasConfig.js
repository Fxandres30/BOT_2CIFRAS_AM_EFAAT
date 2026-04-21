export const TABLAS_POR_VALOR = {
  1000: "reservas_dos_cifras",
  1500: "reservas_dos_cifras",
  2000: "reservas_dos_cifras",
  3000: "reservas_dos_cifras",
  5000: "5k_15k_reservas_2_cifras",
  10000: "5k_15k_reservas_2_cifras",
  15000: "5k_15k_reservas_2_cifras"
};

export function obtenerTablaPorValor(valor) {

  if (!valor) return null;

  // 🔥 LIMPIEZA FUERTE
  const limpio = parseInt(
    valor
      .toString()
      .replace(/\./g, "")   // quita puntos 1.500 → 1500
      .replace(/\D/g, "")   // deja solo números
  );

  console.log("🧠 Valor limpio final:", limpio);

  const tabla = TABLAS_POR_VALOR[limpio];

  if (!tabla) {
    console.log("❌ No hay tabla para valor:", limpio);
    return null;
  }

  return tabla;
}