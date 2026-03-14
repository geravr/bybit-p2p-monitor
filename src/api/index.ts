import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";
import { db } from "../db";
import { merchants, ads, priceLogs } from "../db/schema";
import type { EqSelector, SqlNode } from "drizzle-orm";
import { eq, and, gte, lte, desc, asc, count, sql, between } from "drizzle-orm";
import {
  formatPrice,
  formatAmount,
  formatPercentage,
  formatDate,
  paginate,
  filterAds,
  calculateStats,
} from "../monitors/utils";

// Create Hono app for routes
const app = new Hono();

// Middleware
app.use("*", cors());
app.use("/*", logger());

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "bybit-p2p-monitor",
  });
});

// GET /api/merchants - Listar todos
app.get("/api/merchants", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");
    const country = c.req.query("country");
    const minTrades = c.req.query("minTrades");

    // Build query
    let query = db.select().from(merchants);
    
    if (country) {
      query = query.where(eq(merchants.country, country));
    }
    
    if (minTrades) {
      query = query.where(gte(merchants.completedTrades, parseInt(minTrades)));
    }
    
    query = query.orderBy(desc(merchants.completedTrades)).limit(limit).offset((page - 1) * limit);
    
    const merchantsList = await query;
    
    // Get total count
    const countQuery = await db.select({ count: count() }).from(merchants);
    const total = countQuery[0]?.count || 0;
    
    return c.json({
      success: true,
      data: merchantsList.map((m) => ({
        id: m.id,
        userId: m.userId,
        nickname: m.nickname,
        country: m.country,
        completedTrades: m.completedTrades,
        completionRate: m.completionRate,
        avgReleaseTime: m.avgReleaseTime,
        createdAt: formatDate(m.createdAt),
        updatedAt: formatDate(m.updatedAt),
      })),
      pagination: paginate(merchantsList, page, limit),
    });
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch merchants",
      },
      500
    );
  }
});

// GET /api/merchants/:id - Detalles de un merchant
app.get("/api/merchants/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Fetch merchant
    const merchant = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, id))
      .limit(1);
    
    if (!merchant[0]) {
      return c.json({ success: false, error: "Merchant not found" }, 404);
    }
    
    const m = merchant[0];
    
    // Get active ads for this merchant
    const merchantAds = await db
      .select()
      .from(ads)
      .where(eq(ads.merchantId, id))
      .orderBy(desc(ads.updatedAt))
      .limit(100);
    
    return c.json({
      success: true,
      data: {
        ...m,
        activeAdsCount: merchantAds.filter((ad) => ad.active).length,
        ads: merchantAds.map((ad) => ({
          id: ad.id,
          asset: ad.asset,
          fiat: ad.fiat,
          price: formatPrice(ad.price),
          minAmount: formatAmount(ad.minAmount),
          maxAmount: formatAmount(ad.maxAmount),
          adType: ad.adType,
          active: ad.active,
          createdAt: formatDate(ad.createdAt),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching merchant:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch merchant",
      },
      500
    );
  }
});

// GET /api/ads - Listar ads
app.get("/api/ads", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");
    
    const asset = c.req.query("asset");
    const fiat = c.req.query("fiat");
    const minPrice = c.req.query("minPrice");
    const maxPrice = c.req.query("maxPrice");
    const adType = c.req.query("adType");
    const active = c.req.query("active");
    
    // Fetch all ads
    let query = db.select().from(ads);
    let queryFilters: SqlNode[] = [];
    
    if (active !== undefined) {
      queryFilters.push(eq(ads.active, active === "true"));
    }
    
    if (asset) {
      queryFilters.push(eq(ads.asset, asset));
    }
    
    if (fiat) {
      queryFilters.push(eq(ads.fiat, fiat));
    }
    
    if (minPrice) {
      queryFilters.push(gte(ads.price, parseFloat(minPrice)));
    }
    
    if (maxPrice) {
      queryFilters.push(lte(ads.price, parseFloat(maxPrice)));
    }
    
    if (adType) {
      queryFilters.push(eq(ads.adType, adType));
    }
    
    if (queryFilters.length > 0) {
      query = query.where(and(...queryFilters));
    }
    
    query = query.orderBy(desc(ads.price)).limit(limit).offset((page - 1) * limit);
    
    const adsList = await query;
    
    // Get total count
    const countQuery = await db.select({ count: count() }).from(ads);
    const total = countQuery[0]?.count || 0;
    
    return c.json({
      success: true,
      data: adsList.map((ad) => ({
        id: ad.id,
        merchantId: ad.merchantId,
        asset: ad.asset,
        fiat: ad.fiat,
        price: formatPrice(ad.price),
        minAmount: formatAmount(ad.minAmount),
        maxAmount: formatAmount(ad.maxAmount),
        availableAmount: ad.availableAmount ? formatAmount(ad.availableAmount) : "N/A",
        paymentMethods: ad.paymentMethods,
        adType: ad.adType,
        active: ad.active,
        createdAt: formatDate(ad.createdAt),
        updatedAt: formatDate(ad.updatedAt),
      })),
      pagination: paginate(adsList, page, limit),
      filters: {
        asset,
        fiat,
        minPrice,
        maxPrice,
        adType,
        active,
      },
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch ads",
      },
      500
    );
  }
});

// GET /api/ads/:id - Detalles de un ad
app.get("/api/ads/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Fetch ad details
    const adData = await db
      .select()
      .from(ads)
      .where(eq(ads.id, id))
      .limit(1);
    
    if (!adData[0]) {
      return c.json({ success: false, error: "Ad not found" }, 404);
    }
    
    const ad = adData[0];
    
    // Get price history for this ad
    const priceHistory = await db
      .select()
      .from(priceLogs)
      .where(eq(priceLogs.adId, id))
      .orderBy(desc(priceLogs.timestamp))
      .limit(50);
    
    // Calculate stats
    const stats = calculateStats(priceHistory);
    
    // Get merchant info
    const merchant = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, ad.merchantId))
      .limit(1);
    
    return c.json({
      success: true,
      data: {
        ad: {
          id: ad.id,
          merchantId: ad.merchantId,
          asset: ad.asset,
          fiat: ad.fiat,
          price: formatPrice(ad.price),
          minAmount: formatAmount(ad.minAmount),
          maxAmount: formatAmount(ad.maxAmount),
          availableAmount: ad.availableAmount ? formatAmount(ad.availableAmount) : "N/A",
          paymentMethods: ad.paymentMethods,
          adType: ad.adType,
          active: ad.active,
          createdAt: formatDate(ad.createdAt),
          updatedAt: formatDate(ad.updatedAt),
        },
        merchant: merchant[0]
          ? {
              id: merchant[0].id,
              nickname: merchant[0].nickname,
              completedTrades: merchant[0].completedTrades,
              completionRate: merchant[0].completionRate,
            }
          : null,
        priceHistory: priceHistory.map((log) => ({
          price: formatPrice(log.price),
          amount: formatAmount(log.amount),
          timestamp: formatDate(log.timestamp),
        })),
        stats: {
          totalChanges: stats.totalChanges,
          avgChange: formatPercentage(stats.avgChange),
          maxChange: formatPercentage(stats.maxChange),
          minChange: formatPercentage(stats.minChange),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching ad:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch ad details",
      },
      500
    );
  }
});

// GET /api/analytics/price-change - Mejor precios hoy
app.get("/api/analytics/price-change", async (c) => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const changesQuery = await db
      .select({
        adId: priceLogs.adId,
        price: priceLogs.price,
        timestamp: priceLogs.timestamp,
      })
      .from(priceLogs)
      .where(between(priceLogs.timestamp, today, new Date()))
      .orderBy(desc(priceLogs.timestamp));
    
    // Calculate changes
    const changes: any[] = [];
    const adPrices = new Map<string, number[]>();
    
    for (const log of changesQuery) {
      if (!adPrices.has(log.adId)) {
        adPrices.set(log.adId, []);
      }
      adPrices.get(log.adId)!.push(log.price);
      
      if (adPrices.get(log.adId)!.length > 1) {
        const prevPrice = adPrices.get(log.adId)![adPrices.get(log.adId)!.length - 2];
        const change = ((log.price - prevPrice) / prevPrice) * 100;
        
        changes.push({
          price: log.price,
          change,
          timestamp: log.timestamp,
        });
      }
    }
    
    // Sort by change percentage
    changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    
    return c.json({
      success: true,
      data: {
        topChanges: changes.slice(0, 20),
        totalChangesToday: changesQuery.length,
        timeRange: {
          start: formatDate(today),
          end: formatDate(new Date()),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch analytics",
      },
      500
    );
  }
});

// GET /api/analytics/top-merchants - Top merchants
app.get("/api/analytics/top-merchants", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "10");
    const page = parseInt(c.req.query("page") || "1");
    
    const merchantsQuery = await db
      .select()
      .from(merchants)
      .where(eq(merchants.completedTrades, ">=", 0))
      .orderBy(desc(merchants.completionRate))
      .limit(limit)
      .offset((page - 1) * limit);
    
    return c.json({
      success: true,
      data: merchantsQuery.map((m, index) => ({
        rank: index + 1,
        id: m.id,
        userId: m.userId,
        nickname: m.nickname,
        completedTrades: m.completedTrades,
        completionRate: `${(m.completionRate * 100).toFixed(2)}%`,
        avgReleaseTime: m.avgReleaseTime ? `${m.avgReleaseTime} min` : "N/A",
        totalAds: 0, // This could be queried separately
      })),
      pagination: {
        page,
        limit,
        total: merchantsQuery.length,
      },
    });
  } catch (error) {
    console.error("Error fetching top merchants:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch top merchants",
      },
      500
    );
  }
});

// GET /api/stats/summary - Resumen de estadísticas
app.get("/api/stats/summary", async (c) => {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Total merchants
    const merchantsCount = await db.select({ count: count() }).from(merchants);
    
    // Total active ads
    const adsCount = await db
      .select({ count: count() })
      .from(ads)
      .where(eq(ads.active, true));
    
    // Price changes today
    const priceChangesToday = await db
      .select({ count: count() })
      .from(priceLogs)
      .where(between(priceLogs.timestamp, today, new Date()));
    
    // Average price (USDT/MXN)
    const avgPrice = await db
      .select({ avgPrice: sql`AVG(${ads.price})` })
      .from(ads)
      .where(and(eq(ads.asset, "USDT"), eq(ads.fiat, "MXN")));
    
    return c.json({
      success: true,
      data: {
        totalMerchants: merchantsCount[0]?.count || 0,
        totalActiveAds: adsCount[0]?.count || 0,
        priceChangesToday: priceChangesToday[0]?.count || 0,
        averagePrice: avgPrice[0]?.avgPrice?.toFixed(2) || "N/A",
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch stats",
      },
      500
    );
  }
});

export default app;
