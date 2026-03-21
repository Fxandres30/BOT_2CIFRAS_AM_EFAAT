// config/recordatoriosConfig.js

export const RECORDATORIOS_EVENTO = [

  {
    antes: 120,
    mensaje: (ev) => `💰 *${ev.nombre}*\n\nYa pueden empezar a pagar\n💵 Valor: ${ev.valor}`
  },

  {
    antes: 90,
    mensaje: "⏳ 1 hora y media restante"
  },

  {
    antes: 60,
    mensaje: (ev) => `🔥 1 hora restante\n⏳ Cierra: ${ev.horaCierre}`
  },

  {
    antes: 40,
    mensaje: "⚠️ 40 minutos, revisa tus números"
  },

  {
    antes: 30,
    mensaje: "📢 30 minutos para cerrar"
  },

  {
    antes: 15,
    mensaje: "💰 Últimos 15 minutos para pagar"
  },

  {
    antes: 5,
    mensaje: "⏳ 5 minutos finales"
  },

  {
    antes: 2,
    mensaje: "🚨 ÚLTIMO AVISO\nSe liberan números no pagos"
  }

];