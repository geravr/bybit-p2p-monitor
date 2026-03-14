import { BybitP2PClient } from "./bybit/client";
import { db, pool } from "./db/index";
import { P2PWorker } from "./monitors/worker";
import Config from "./config";

// Log de inicio
console.log("🚀 Iniciando Bybit P2P Monitor...");
console.log("📡 Mode:", Config.isTestnet ? "Testnet" : "Mainnet");
console.log("⏰ Interval:", Config.monitorInterval / 1000, "segundos");

async function main() {
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
      logger: (msg) => console.log(`[${new Date().toISOString()}] ${msg}`),
    });

    // Iniciar worker
    await worker.start();
    console.log("✅ Worker iniciado");
    console.log("📊 Presiona Ctrl+C para detener");

    // Manejar shutdown
    process.on("SIGINT", async () => {
      console.log("\n📴 Deteniendo worker...");
      pool.end();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error inicializando worker:", error);
    process.exit(1);
  }
}

main().catch(console.error);
