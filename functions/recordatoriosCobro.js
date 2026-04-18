import { ahoraColombia } from "./tiempoColombia.js";

// 🧠 tiempos por valor (en minutos)
const mapaTiempos = {
  10000: 360,  // 6h
  5000: 300,   // 5h
  2000: 150,   // 2.5h
  1500: 150,
  1000: 120    // 2h
};

// 🎲 MENSAJES ALEATORIOS (ESTILO HUMANO 🔥)
function mensajeCobroAleatorio(evento) {

  const mensajes = [

`👀 *Familia recuerden*

Que estamos jugando con *${evento.nombre}* ✍️👀

Vayan cancelando sus numeritos para que no sean liberados ☘️🎯

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

No dejen sus números sin pagar 👀

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

  const random = Math.floor(Math.random() * mensajes.length);
  return mensajes[random];
}


// 🚀 FUNCIÓN PRINCIPAL
export function programarCobros(sock, grupoId, evento) {

  if (!evento.valor || !evento.hora) return;

  const valorNum = parseInt(evento.valor.replace(/\D/g, ""));

  const minutosAntes = mapaTiempos[valorNum];

  if (!minutosAntes) {
    console.log("⚠️ Valor sin configuración de cobro:", valorNum);
    return;
  }

  const ahora = ahoraColombia();

  const [h, m] = evento.hora.split(":").map(Number);

  const eventoDate = ahoraColombia();
  eventoDate.setHours(h, m, 0, 0);

  const tiempoEnvio = new Date(eventoDate.getTime() - minutosAntes * 60000);

  const delay = tiempoEnvio - ahora;

  console.log(`⏰ Cobro programado (${valorNum}) →`, tiempoEnvio.toLocaleTimeString());

  if (delay <= 0) {
    console.log("⚠️ Ya pasó el tiempo de cobro");
    return;
  }

  setTimeout(async () => {
    try {

      const mensaje = mensajeCobroAleatorio(evento);

      await sock.sendMessage(grupoId, { text: mensaje });

      console.log("💰 Recordatorio de cobro enviado");

    } catch (err) {
      console.log("❌ Error enviando cobro:", err.message);
    }
  }, delay);
}