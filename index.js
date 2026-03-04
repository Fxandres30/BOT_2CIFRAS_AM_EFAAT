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

import { encolarMensaje } from "./functions/colaGrupos.js";
import { procesarEntrada } from "./functions/entrada.js";
import { GRUPOS_PERMITIDOS } from "./functions/grupos.js";

console.log("🚀 BOT BÁSICO INICIADO");

let sock;
let starting = false;

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

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("📱 Escanea el QR");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        console.log("✅ CONECTADO A WHATSAPP");
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

    // 📩 ÚNICO LISTENER DE MENSAJES
    sock.ev.on("messages.upsert", ({ messages, type }) => {
  if (type !== "notify") return;

  for (const msg of messages) {
    if (!msg?.message) continue;
    if (msg.key.fromMe) continue;

    const grupoId = msg.key.remoteJid;
if (!grupoId?.endsWith("@g.us")) continue;

// 📌 MOSTRAR ID Y NOMBRE DEL GRUPO
const nombreGrupo = msg.pushName || "Sin nombre";
console.log("📌 MENSAJE EN GRUPO:");
console.log("➡️ ID:", grupoId);
console.log("➡️ Nombre:", msg.key.participant);
console.log("----------------------------");


    if (!GRUPOS_PERMITIDOS[grupoId]) {
      continue; // ⛔ grupo no autorizado
    }

    encolarMensaje(grupoId, async () => {
      await procesarEntrada(sock, msg, GRUPOS_PERMITIDOS[grupoId]);
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
