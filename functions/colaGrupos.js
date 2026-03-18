const colas = {};

// 🔥 AGREGAR MENSAJE A LA COLA
export function encolarMensaje(grupoId, tarea) {

  if (!colas[grupoId]) {
    colas[grupoId] = {
      ejecutando: false,
      cola: []
    };
  }

  colas[grupoId].cola.push(tarea);

  console.log(`📥 Cola [${grupoId}] → ${colas[grupoId].cola.length} pendientes`);

  if (!colas[grupoId].ejecutando) {
    procesarCola(grupoId);
  }
}

// 🔥 PROCESAR COLA
async function procesarCola(grupoId) {

  const grupo = colas[grupoId];

  if (!grupo) return;

  grupo.ejecutando = true;

  console.log(`🚀 Iniciando cola → ${grupoId}`);

  while (grupo.cola.length > 0) {

    const tarea = grupo.cola.shift();

    try {

      await tarea();

      // 🔥 anti spam
      await esperar(400);

    } catch (e) {
      console.error(`❌ Error en cola [${grupoId}]`, e);
    }
  }

  grupo.ejecutando = false;

  console.log(`✅ Cola finalizada → ${grupoId}`);
}

// 🔥 DELAY
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}