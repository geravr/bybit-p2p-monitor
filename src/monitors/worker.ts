import { BybitP2PClient } from "../bybit/client";
import { db } from "../db/connections";
import { merchants, ads, priceLogs } from "../db/schema";
import { eq, asc, and } from "drizzle-orm";

export class P2PWorker {
  private client: BybitP2PClient;
  private interval: number;
  private logger: (message: string) => void;

  constructor({
    client,
    interval = 300000, // 5 minutos default
    logger = console.log,
  }: {
    client: BybitP2PClient;
    interval?: number;
    logger?: (message: string) => void;
  }) {
    this.client = client;
    this.interval = interval;
    this.logger = logger;
  }

  async start() {
    this.logger("🚀 Worker iniciado - Monitoreando Bybit P2P...");
    await this.syncAds();
    setInterval(() => this.syncAds(), this.interval);
  }

  async syncAds() {
    try {
      this.logger("📡 Fetching ads online...");
      
      // Obtener ads de USDT/MXN (puedes agregar más pares)
      const response = await this.client.getOnlineAds({
        asset: "USDT",
        fiat: "MXN",
        page: 1,
        limit: 100,
      });

      const adsList = response.result.list || [];
      this.logger(`✅ ${adsList.length} ads encontrados`);

      // Procesar cada ad
      for (const bybitAd of adsList) {
        await this.processAd(bybitAd);
      }

      this.logger("🔄 Sincronización completada");
    } catch (error) {
      this.logger(`❌ Error en syncAds: ${error}`);
    }
  }

  private async processAd(bybitAd: any) {
    try {
      // 1. Extraer información del merchant
      const merchantData = {
        userId: bybitAd.memberNo,
        nickname: bybitAd.publisherMemberName,
        completedTrades: 0, // A actualizar cuando implementemos orders endpoint
        completionRate: 0,
      };

      // 2. Upsert merchant
      const merchant = await db
        .insert(merchants)
        .values(merchantData)
        .onConflictDoUpdate({
          target: merchants.userId,
          set: { updatedAt: new Date() },
        })
        .returning();

      // 3. Normalizar ad data
      const adData = {
        merchantId: merchant.id,
        adRequestId: bybitAd.adRequestId,
        asset: bybitAd.asset,
        fiat: bybitAd.asset,
        price: parseFloat(bybitAd.price),
        minAmount: parseFloat(bybitAd.minSingleOrderAmt),
        maxAmount: parseFloat(bybitAd.maxSingleOrderAmt),
        availableAmount: parseFloat(bybitAd.tradableAmount),
        paymentMethods: [], // A actualizar según tipo de pago
        adType: bybitAd.adType,
        active: true,
      };

      // 4. Upsert ad
      const ad = await db
        .insert(ads)
        .values(adData)
        .onConflictDoUpdate({
          target: ads.adRequestId,
          set: { ...adData, updatedAt: new Date() },
        })
        .returning();

      // 5. Detectar cambios de precio y guardar en price_logs
      const latestLog = await db
        .select()
        .from(priceLogs)
        .where(eq(priceLogs.adId, ad.id))
        .orderBy(asc(priceLogs.timestamp))
        .limit(1);

      if (latestLog.length > 0) {
        const lastPrice = latestLog[0].price;
        const currentPrice = adData.price;
        const priceChange = ((currentPrice - lastPrice) / lastPrice) * 100;

        if (Math.abs(priceChange) > 0.1) {
          // Guardar en price_logs si hay cambio significativo (>0.1%)
          await db.insert(priceLogs).values({
            adId: ad.id,
            price: currentPrice,
            amount: adData.availableAmount!,
            timestamp: new Date(),
          });

          this.logger(`📊 Precio cambiado: ${priceChange.toFixed(2)}%`);
        }
      } else {
        // Primer registro
        await db.insert(priceLogs).values({
          adId: ad.id,
          price: adData.price,
          amount: adData.availableAmount!,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger(`❌ Error processAd: ${error}`);
      throw error;
    }
  }
}
