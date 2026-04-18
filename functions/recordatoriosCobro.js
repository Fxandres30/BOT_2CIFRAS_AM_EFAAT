import { ahoraColombia } from "./tiempoColombia.js";

// 🧠 tiempos por valor (en minutos)
// 🧠 múltiples tiempos por valor (minutos antes del CIERRE)
// EJEMPLO base: si el cierre es a las 22:25 (10:25 PM)

const mapaTiempos = {

  // 💰 10.000
  // 360 min = 6h → 16:25 (4:25 PM) // 180 min = 3h → 19:25 (7:25 PM) 60 min = 1h → 21:25 (9:25 PM)
  10000: [360, 180, 60],

  // 💰 5.000
  // 300 min = 5h → 17:25 (5:25 PM) // 120 min = 2h → 20:25 (8:25 PM) // 45 min → 21:40 (9:40 PM)
  5000: [300, 120, 45],

  // 💰 2.000
  // 150 min = 2h30 → 19:55 (7:55 PM) // 60 min = 1h → 21:25 (9:25 PM)
  2000: [150, 60],

  // 💰 1.500
  // 150 min = 2h30 → 19:55 (7:55 PM) // 60 min = 1h → 21:25 (9:25 PM)
  1500: [150, 60, ],

  // 💰 1.000
  // 120 min = 2h → 20:25 (8:25 PM) // 45 min → 21:40 (9:40 PM)
  1000: [120, 45]
};

// 🎲 MENSAJES ALEATORIOS (ESTILO HUMANO 🔥)
function mensajeCobroAleatorio(evento) {

  const mensajes = [

`👀 *Familia recuerden*

Que estamos jugando con *${evento.nombre}* ✍️👀

*Vayan cancelando sus numeritos para que no sean liberados ☘️🎯*

💰 Valor: ${evento.valor}

🏦 *Nequi - Daviplata - Bre-B*
➡️ *3014123951*`,

`🔥 *Atención grupo*

Sorteo activo *${evento.nombre}* 🎯

Recuerden ir cancelando para evitar liberaciones ⚠️

💰 Valor: ${evento.valor}

🏦 *Nequi - Daviplata - Bre-B*
➡️ *3014123951*`,

`⏰ *Recordatorio familia*

Estamos jugando *${evento.nombre}* ✍️

*No dejen sus números sin pagar 👀*

💰 Valor: ${evento.valor}

🏦 *Nequi - Daviplata - Bre-B*
➡️ *3014123951*`,

`🚨 *Ojo grupo*

Números sin cancelar en *${evento.nombre}* serán liberados ⚠️

Aseguren sus jugadas ☘️

💰 Valor: ${evento.valor}

🏦 *Nequi - Daviplata - Bre-B*
➡️ *3014123951*`,

`🎯 *Vamos con todo*

Recuerden pagar sus números de *${evento.nombre}* ✍️

No se queden por fuera ☘️🎯

💰 Valor: ${evento.valor}

🏦 *Nequi - Daviplata - Bre-B*
➡️ *3014123951*`
    ];

  return mensajes[Math.floor(Math.random() * mensajes.length)];
}


// 🚀 FUNCIÓN PRINCIPAL
// 🚀 FUNCIÓN PRINCIPAL
export function programarCobros(sock, grupoId, evento) {

  if (!evento.valor || !evento.horaCierre) return;

  const valorNum = parseInt(evento.valor.replace(/\D/g, ""));

  const tiempos = mapaTiempos[valorNum];

  if (!tiempos) {
    console.log("⚠️ Sin tiempos para valor:", valorNum);
    return;
  }

  const ahora = ahoraColombia();

  const [h, m] = evento.horaCierre.split(":").map(Number);

  const cierreDate = ahoraColombia();
  cierreDate.setHours(h, m, 0, 0);

  for (const minutosAntes of tiempos) {

    const envio = new Date(cierreDate.getTime() - minutosAntes * 60000);

    const delay = envio - ahora;

    if (delay <= 0) continue;

    console.log(`⏰ Cobro (${valorNum}) en ${minutosAntes} min →`, envio.toLocaleTimeString());

    setTimeout(async () => {
      try {

        const mensaje = mensajeCobroAleatorio(evento);

        await sock.sendMessage(grupoId, { text: mensaje });

        console.log("💰 Cobro enviado");

      } catch (err) {
        console.log("❌ Error cobro:", err.message);
      }
    }, delay);
  }
}