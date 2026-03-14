export class Config {
  static get apiKey(): string {
    if (!process.env.BYBIT_API_KEY) {
      throw new Error("BYBIT_API_KEY no configurado en .env");
    }
    return process.env.BYBIT_API_KEY;
  }

  static get apiSecret(): string {
    if (!process.env.BYBIT_API_SECRET) {
      throw new Error("BYBIT_API_SECRET no configurado en .env");
    }
    return process.env.BYBIT_API_SECRET;
  }

  static get databaseUrl(): string {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL no configurado en .env");
    }
    return process.env.DATABASE_URL;
  }

  static get monitorInterval(): number {
    return parseInt(process.env.MONITOR_INTERVAL || "300000", 10); // 5min default
  }

  static get isTestnet(): boolean {
    return process.env.BYBIT_TESTNET === "true";
  }
}

export default Config;
