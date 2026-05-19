function esperar(ms) {

  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );
}

// 🔥 RANDOM
function numeroRandom(min, max) {

  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

// 🔥 DELAY HUMANO
function calcularDelay(texto = "") {

  const caracteres =
    texto.length;

  let delay =
    caracteres * 45;

  // 🔥 mínimo
  if (delay < 3000) {
    delay = 3000;
  }

  // 🔥 mensajes largos
  if (caracteres > 150) {
    delay += 2000;
  }

  if (caracteres > 300) {
    delay += 3000;
  }

  // 🔥 párrafos
  if (texto.includes("\n")) {
    delay += 1500;
  }

  // 🔥 emojis
  const emojis = (

    texto.match(
      /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu
    )

    ||

    []

  ).length;

  delay += emojis * 300;

  // 🔥 mensajes cortos
  if (caracteres <= 8) {
    delay += 1000;
  }

  // 🔥 variación humana
  delay += numeroRandom(
    1000,
    4000
  );

  // 🔥 máximo
  if (delay > 15000) {
    delay = 15000;
  }

  return delay;
}

// 🔥 SIMULAR ESCRITURA
async function simularEscritura(

  sock,
  jid,
  tiempo

) {

  const intervalo = 4000;

  const repeticiones =

    Math.ceil(
      tiempo / intervalo
    );

  for (let i = 0; i < repeticiones; i++) {

    try {

      await sock.sendPresenceUpdate(
        "composing",
        jid
      );

    } catch {}

    await esperar(intervalo);
  }
}

// 🔥 ENVIAR MENSAJE
export async function enviarMensaje(

  sock,
  jid,
  texto,
  opciones = {}

) {

  try {

    const delay =
      calcularDelay(texto);

    console.log(
      "\n━━━━━━━━━━━━━━━━━━"
    );

    console.log(
      "🤖 ENVIANDO MENSAJE"
    );

    console.log(
      `📍 ${jid}`
    );

    console.log(
      `⌛ ${delay}ms`
    );

    console.log(
      "━━━━━━━━━━━━━━━━━━"
    );

    // 🔥 typing
    await simularEscritura(
      sock,
      jid,
      delay
    );

    // 🔥 detener typing
    try {

      await sock.sendPresenceUpdate(
        "paused",
        jid
      );

    } catch {}

    // 🔥 enviar
    return await sock.sendMessage(

      jid,

      {
        text: texto
      },

      opciones

    );

  } catch (err) {

    console.log(
      "❌ Error enviando:",
      err?.message
    );
  }
}
