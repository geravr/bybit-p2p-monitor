import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { z } from "zod";
import apiRoutes from "./api";
import { BybitP2PClient } from "./bybit/client";
import { P2PWorker, Scheduler } from "./monitors";
import { db, pool } from "./db";
import Config from "./config";

// Create Hono app
const app = new Hono();

// Middleware
app.use("/*", logger());
app.use("/*", cors());

// Register API routes
app.route("/", apiRoutes);

// Log de inicio
console.log("🚀 Iniciando Bybit P2P Monitor Server...");
console.log("📡 Mode:", Config.isTestnet ? "Testnet" : "Mainnet");
console.log("⏰ Monitor Interval:", Config.monitorInterval / 1000, "segundos");

async function startServer() {
  try {
    // Verificar conexión DB
    console.log("🔌 Conectando a PostgreSQL...");
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL conectado");
  } catch (error) {
    console.error("❌ Error conectando a DB:", error);
    process.exit(1);
  }

  try {
    // Crear cliente Bybit
    console.log("🔑 Iniciando cliente Bybit P2P...");
    const bybitClient = new BybitP2PClient({
      apiKey: Config.apiKey,
      apiSecret: Config.apiSecret,
      testnet: Config.isTestnet,
    });

    // Crear worker
    console.log("🤖 Creando worker...");
    const worker = new P2PWorker({
      client: bybitClient,
      interval: Config.monitorInterval,
      logger: (msg) => console.log(`[DATA] ${msg}`),
    });

    // Crear scheduler
    console.log("🕘 Scheduler configurado...");
    const scheduler = new Scheduler({
      callback: () => worker.syncAds(),
      interval: Config.monitorInterval,
      logger: console.log,
    });

    // Iniciar worker
    console.log("✅ Worker iniciado");

    // Iniciar server Hono
    const port = 3000;
    console.log(`📡 Server HTTP iniciado en puerto ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`📚 API docs: http://localhost:${port}/api/health`);

    // Servidor HTTP
    Deno.serve(
      {
        port,
        hostname: "0.0.0.0",
      },
      app.fetch
    );

    // Start scheduler
    await scheduler.start();

    // Manejar shutdown
    const shutdown = async () => {
      console.log("\n📴 Deteniendo servidor...");
      scheduler.stop();
      pool.end();
      Deno.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("❌ Error inicializando server:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);
