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
import { verificarCierres } from "./functions/eventoUtils.js";

console.log("🚀 BOT - 1.0.3 - EFAAT - INICIANDO...");

let sock;
let starting = false;

// 🔥 CONTROL GLOBAL DE INTERVALOS
let intervaloCierres = null;
let intervaloScanner = null;

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

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("📱 Escanea el QR");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        console.log("✅ CONECTADO A WHATSAPP");
        console.log("🕐 Hora Colombia:", horaColombia());

        try {
          // 🔥 VERIFICAR CIERRES AL INICIAR
          console.log("🔎 Verificando eventos pendientes...");
          await verificarCierres(sock);
        } catch (err) {
          console.log("❌ Error verificando cierres:", err?.message);
        }

        // 🔥 INTERVALO CIERRES (ANTI DUPLICADO)
        if (!intervaloCierres) {
          intervaloCierres = setInterval(async () => {
            try {
              console.log("⏱️ Verificación automática de cierres...");
              await verificarCierres(sock);
            } catch (err) {
              console.log("❌ Error verificador:", err?.message);
            }
          }, 60000);
        }

        // 🔥 ESCÁNER INICIAL
        console.log("📡 Ejecutando escáner inicial...");
        escanearGrupos(sock);

        // 🔥 INTERVALO ESCÁNER (ANTI DUPLICADO)
        if (!intervaloScanner) {
          intervaloScanner = setInterval(() => {
            console.log("🔄 Escaneo automático de grupos...");
            escanearGrupos(sock);
          }, 1000 * 60 * 60 * 6);
        }

        starting = false;
      }

      if (connection === "close") {
        const statusCode =
          new Boom(lastDisconnect?.error)?.output?.statusCode;

        console.log("⚠️ Conexión cerrada. Código:", statusCode);

        if (statusCode === DisconnectReason.loggedOut) {
          console.log("🚫 Sesión cerrada. Borra auth_info_baileys");
          process.exit(1);
        }

        starting = false;
        setTimeout(startBot, 5000);
      }
    });

    // 📩 MENSAJES
    sock.ev.on("messages.upsert", ({ messages, type }) => {
      if (type !== "notify") return;

      for (const msg of messages) {
        if (!msg?.message) continue;
        if (msg.key.fromMe) continue;

        const grupoId = msg.key.remoteJid;
        if (!grupoId?.endsWith("@g.us")) continue;

        if (!GRUPOS_PERMITIDOS[grupoId]) return;

        const jidUsuario = obtenerJidUsuario(msg);

        if (!jidUsuario) {
          console.log("⚠️ No se pudo obtener usuario");
          continue;
        }

        const nombreGrupo = GRUPOS_PERMITIDOS[grupoId]?.nombre || "Grupo";

        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`📍 GRUPO: ${nombreGrupo}`);
        console.log(`🆔 ID: ${grupoId}`);
        console.log(`👤 Usuario: ${jidUsuario}`);
        console.log(`🕐 Hora: ${horaColombia()}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━");

        encolarMensaje(grupoId, async () => {
          try {
            await procesarEntrada(
              sock,
              msg,
              GRUPOS_PERMITIDOS[grupoId],
              jidUsuario
            );
          } catch (err) {
            console.log(`❌ Error procesando mensaje en ${nombreGrupo}:`, err.message);
          }
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