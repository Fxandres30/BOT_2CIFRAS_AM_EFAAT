const colas = {};

export function encolarMensaje(grupoId, tarea) {
  if (!colas[grupoId]) {
    colas[grupoId] = {
      ejecutando: false,
      cola: []
    };
  }

  colas[grupoId].cola.push(tarea);

  if (!colas[grupoId].ejecutando) {
    procesarCola(grupoId);
  }
}

async function procesarCola(grupoId) {
  const grupo = colas[grupoId];
  grupo.ejecutando = true;

  while (grupo.cola.length > 0) {
    const tarea = grupo.cola.shift();
    try {
      await tarea();
      await esperar(400); // anti spam WhatsApp
    } catch (e) {
      console.error("❌ Error en cola", grupoId, e);
    }
  }

  grupo.ejecutando = false;
}

function esperar(ms) {
  return new Promise(r => setTimeout(r, ms));
}
