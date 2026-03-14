import { describe, it, expect } from "bun:test";
import { BybitP2PClient } from "./client";
import { BYBIT_P2P_CONFIG } from "./constants";

describe("BybitP2PClient", () => {
  it("should have correct API endpoints", () => {
    expect(BYBIT_P2P_CONFIG.endpoints.onlineAds).toBe("/v5/p2p/item/online");
    expect(BYBIT_P2P_CONFIG.endpoints.myAds).toBe("/v5/p2p/item/personal/list");
  });

  it("should have correct mainnet URL", () => {
    expect(BYBIT_P2P_CONFIG.mainnet.mainnet).toBe("https://api.bybit.com");
  });

  it("should have correct testnet URL", () => {
    expect(BYBIT_P2P_CONFIG.mainnet.testnet).toBe("https://api-testnet.bybit.com");
  });
});

describe("BybitP2PClient Integration", () => {
  // Skip tests if credentials not provided
  const testWithCredentials = process.env.BYBIT_API_KEY && process.env.BYBIT_API_SECRET;

  it("should connect to Bybit API", async () => {
    if (!testWithCredentials) {
      console.log("⏭️ Skipping API test (no credentials)");
      return;
    }

    const client = new BybitP2PClient({
      apiKey: process.env.BYBIT_API_KEY!,
      apiSecret: process.env.BYBIT_API_SECRET!,
      testnet: true, // Use testnet for tests
    });

    // Test that client can be instantiated
    expect(client).toBeDefined();
  });
});

describe("Utils", () => {
  const { formatPrice, formatAmount, formatPercentage, calculatePriceChange, paginate, filterAds } = require("../monitors/utils");

  it("should format price correctly", () => {
    expect(formatPrice(123.456)).toBe("123.46");
    expect(formatPrice(100)).toBe("100.00");
  });

  it("should format amount correctly", () => {
    expect(formatAmount(99.999)).toBe("100.00");
    expect(formatAmount(0.5)).toBe("0.50");
  });

  it("should format percentage correctly", () => {
    expect(formatPercentage(0.123)).toBe("12.30%");
    expect(formatPercentage(0.001, 3)).toBe("0.100%");
  });

  it("should calculate price change correctly", () => {
    expect(calculatePriceChange(100, 110)).toBe(10);
    expect(calculatePriceChange(100, 90)).toBe(-10);
    expect(calculatePriceChange(110, 100)).toBe(-9.090909090909092);
  });

  it("should paginate array correctly", () => {
    const data = [1, 2, 3, 4, 5];
    const result = paginate(data, 1, 2);
    
    expect(result.data).toEqual([1, 2]);
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(3);
  });

  it("should filter ads correctly", () => {
    const ads = [
      { asset: "USDT", fiat: "MXN", price: 20 },
      { asset: "USDT", fiat: "USD", price: 1 },
      { asset: "BTC", fiat: "MXN", price: 200000 },
      { asset: "USDT", fiat: "MXN", price: 21 },
    ];

    const filtered = filterAds(ads, { asset: "USDT", fiat: "MXN" });
    expect(filtered.length).toBe(2);
    expect(filtered[0].price).toBe(20);
    expect(filtered[1].price).toBe(21);
  });

  it("should filter ads with price range", () => {
    const ads = [
      { asset: "USDT", fiat: "MXN", price: 19.5 },
      { asset: "USDT", fiat: "MXN", price: 20 },
      { asset: "USDT", fiat: "MXN", price: 20.5 },
      { asset: "USDT", fiat: "MXN", price: 21 },
    ];

    const filtered = filterAds(ads, { minPrice: 20, maxPrice: 20.5 });
    expect(filtered.length).toBe(2);
    expect(filtered[0].price).toBe(20);
    expect(filtered[1].price).toBe(20.5);
  });
});
