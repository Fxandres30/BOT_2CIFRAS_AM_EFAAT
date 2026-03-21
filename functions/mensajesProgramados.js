import { ahoraColombia } from "./tiempoColombia.js";

// 🎯 SOLO GRUPO DE PRUEBA
const GRUPO_PRUEBA = "120363424010559762@g.us";

// 🔥 Hora aleatoria entre 05:30 y 06:00
function generarHoraAleatoria() {
  const ahora = ahoraColombia();

  let hora = ahora.getHours();
  let minuto = ahora.getMinutes() + 1;

  // 🔥 manejar cambio de hora (ej: 5:59 → 6:00)
  if (minuto >= 60) {
    minuto = 0;
    hora += 1;
  }

  return { hora, minuto };
}

// 🔥 MENSAJE DIVIDIDO (IMPORTANTE POR LÍMITE DE WHATSAPP)
const MENSAJES = [
`📢 *REGLAS OFICIALES DEL GRUPO* 📢

familia, para evitar inconvenientes y mantener el orden en cada dinámica, por favor leer y cumplir las siguientes reglas:

*💰 1. pago inmediato* ✍️

*⏰ 2. tiempo de espera • importante 🚨*
desde que se publique la tabla, se indicará la *hora límite de pago.*
después de esa hora, los números no pagos *serán liberados automáticamente.*`,

`*🔓 3. liberación de números*
al cumplirse la hora de cierre:

✔️ se liberan *todos* los números no pagos 👀
✔️ se pueden reasignar a alguien más sin previo aviso`,

`*📸 4. soporte de pago*
todo pago debe enviar su respectivo comprobante, preferiblemente en el grupo para mayor transparencia.

*⚠️ sin soporte de pago, el número no será tomado como válido. 👀🚨*

*🏆 5. ganador válido*
el ganador será *únicamente quien tenga:*

*✅ pago realizado y confirmado antes del cierre*

🙏 gracias por su comprensión y por ayudar a que todo sea transparente y organizado.`
];

export function iniciarMensajesProgramados(sock) {

  async function programar() {
    const ahora = ahoraColombia();

    const { hora, minuto } = generarHoraAleatoria();

    const envio = new Date(ahora);
    envio.setHours(hora, minuto, 0, 0);

    if (envio <= ahora) {
      envio.setDate(envio.getDate() + 1);
    }

    const espera = envio - ahora;

    console.log(`📅 Reglas programadas para: ${envio}`);

    setTimeout(async () => {
      try {
        console.log("📢 Enviando reglas al grupo de prueba...");

        for (const texto of MENSAJES) {
          await sock.sendMessage(GRUPO_PRUEBA, { text: texto });

          // 🔥 pequeña pausa para evitar flood
          await new Promise(r => setTimeout(r, 1500));
        }

        console.log("✅ Reglas enviadas correctamente (PRUEBA)");

      } catch (err) {
        console.log("❌ Error enviando reglas:", err?.message);
      }

      // 🔁 Reprogramar siguiente día
      programar();

    }, espera);
  }

  programar();
}