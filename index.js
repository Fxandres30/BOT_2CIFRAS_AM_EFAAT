// @ts-nocheck
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";

import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";

import { horaColombia } from "./functions/tiempoColombia.js";
import { encolarMensaje } from "./functions/colaGrupos.js";
import { procesarEntrada } from "./functions/entrada.js";
import { GRUPOS_PERMITIDOS } from "./functions/grupos.js";
import { escanearGrupos } from "./functions/scannerGrupos.js";

// 🔥 IMPORTANTE
import { verificarEventosPendientes } from "./functions/detectarEvento.js";

console.log("🚀 BOT - 1.0.2 - EFAAT - INICIANDO...");

let sock;
let starting = false;

// 🔥 FUNCIÓN CLAVE: OBTENER USUARIO REAL
function obtenerJidUsuario(msg) {
  return (
    msg.key.participant || 
    msg.participant || 
    msg.key.participantPn || 
    null
  );
}

async function startBot() {
  if (starting) return;
  starting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info_baileys");
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      auth: state,
      version,
      browser: ["Windows", "Chrome", "10"],
      markOnlineOnConnect: false,
      syncFullHistory: false,
    });

    sock.ev.on("creds.update", saveCreds);

    // 🔥 IMPORTANTE: async
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("📱 Escanea el QR");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        console.log("✅ CONECTADO A WHATSAPP");

        try {
          // 🔥 VERIFICAR EVENTOS PENDIENTES (CLAVE)
          await verificarEventosPendientes(sock);
        } catch (err) {
          console.log("❌ Error verificando eventos:", err?.message);
        }

        // 🔥 ejecutar escáner al iniciar
        escanearGrupos(sock);

        // 🔥 ejecutar cada 6 horas
        setInterval(() => {
          escanearGrupos(sock);
        }, 1000 * 60 * 60 * 6);

        starting = false;
      }

      if (connection === "close") {
        const statusCode =
          new Boom(lastDisconnect?.error)?.output?.statusCode;

        if (statusCode === DisconnectReason.loggedOut) {
          console.log("🚫 Sesión cerrada. Borra auth_info_baileys");
          process.exit(1);
        }

        starting = false;
        setTimeout(startBot, 5000);
      }
    });

    // 📩 ÚNICO LISTENER
    sock.ev.on("messages.upsert", ({ messages, type }) => {
      if (type !== "notify") return;

      for (const msg of messages) {
        if (!msg?.message) continue;
        if (msg.key.fromMe) continue;

        const grupoId = msg.key.remoteJid;
        if (!grupoId?.endsWith("@g.us")) continue;

        if (!GRUPOS_PERMITIDOS[grupoId]) continue;

        const jidUsuario = obtenerJidUsuario(msg);

        if (!jidUsuario) {
          console.log("⚠️ No se pudo obtener usuario");
          continue;
        }

        console.log("📌 MENSAJE EN GRUPO:");
        console.log("➡️ ID:", grupoId);
        console.log("➡️ Usuario:", jidUsuario);
        console.log("----------------------------");

        encolarMensaje(grupoId, async () => {
          await procesarEntrada(
            sock,
            msg,
            GRUPOS_PERMITIDOS[grupoId],
            jidUsuario
          );
        });
      }
    });

  } catch (err) {
    console.error("❌ Error crítico:", err);
    starting = false;
    setTimeout(startBot, 5000);
  }
}

startBot();