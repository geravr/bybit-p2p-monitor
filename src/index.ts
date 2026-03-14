import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

// Importar clientes y workers
import { BybitP2PClient } from "./bybit/client";
import { P2PWorker } from "./monitors/worker";
import { db } from "./db/connections";
import Config from "./config";

// Crear cliente Bybit
const bybitClient = new BybitP2PClient({
  apiKey: Config.apiKey,
  apiSecret: Config.apiSecret,
  testnet: Config.isTestnet,
});

// Crear worker
const worker = new P2PClient({
  client: bybitClient,
  interval: Config.monitorInterval,
});

// Crear Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    worker: worker.isRunning ? "running" : "stopped",
  });
});

// Iniciar worker
console.log("🚀 Inicializando worker...");
worker.start().catch(console.error);

// Lista de tipos de moneda soportados
const SUPPORTED_ASSETS = ["USDT", "BTC", "ETH"];
const SUPPORTED_FIAT = ["MXN", "USD", "EUR"];

console.log("✅ Servidor iniciado en puerto 3000");
console.log("📡 Health check: http://localhost:3000/health");
console.log("📊 Monitoring: Worker activo cada", Config.monitorInterval / 1000, "segundos");

export default app;
