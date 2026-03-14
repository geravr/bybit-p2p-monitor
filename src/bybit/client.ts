import { createHmac, createHash } from "crypto";
import { BYBIT_P2P_CONFIG } from "./constants";
import type { BybitResponse, OnlineAdsResponse, MyAdsResponse } from "./types";

export class BybitP2PClient {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private testnet: boolean;

  constructor({
    apiKey,
    apiSecret,
    testnet = false,
  }: {
    apiKey: string;
    apiSecret: string;
    testnet?: boolean;
  }) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.testnet = testnet;
    this.baseUrl = testnet
      ? BYBIT_P2P_CONFIG.mainnet.testnet
      : BYBIT_P2P_CONFIG.mainnet.mainnet;
  }

  private generateSignature(
    queryString: string,
    secret: string
  ): string {
    return createHmac("sha256", secret)
      .update(queryString)
      .digest("hex");
  }

  private generateTimestamp(): number {
    return Date.now();
  }

  private async fetch<T>(
    path: string,
    params: Record<string, any> = {},
    method: "GET" | "POST" = "GET"
  ): Promise<T> {
    const timestamp = this.generateTimestamp();
    const queryString = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const signature = this.generateSignature(queryString, this.apiSecret);

    const url = `${this.baseUrl}${path}?${queryString}`;
    const headers: Record<string, string> = {
      "X-BAPI-API-KEY": this.apiKey,
      "X-BAPI-SIGN": signature,
      "X-BAPI-SIGN-TYPE": "2",
      "X-BAPI-TIMESTAMP": timestamp.toString(),
      "X-BAPI-RECV-WINDOW": BYBIT_P2P_CONFIG.defaultParams.recvWindow.toString(),
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bybit API Error: ${response.status} - ${error}`);
    }

    return (await response.json()) as T;
  }

  // GET /v5/p2p/item/online - Listar anuncios online públicos
  async getOnlineAds(params?: {
    asset?: string;
    fiat?: string;
    page?: number;
    limit?: number;
  }): Promise<OnlineAdsResponse> {
    const queryParams = {
      ...BYBIT_P2P_CONFIG.defaultParams,
      ...BYBIT_P2P_CONFIG.pageParams,
      ...params,
    };

    return this.fetch<BybitResponse<OnlineAdsResponse>>(
      BYBIT_P2P_CONFIG.endpoints.onlineAds,
      queryParams
    );
  }

  // GET /v5/p2p/item/personal/list - Listar mis anuncios
  async getMyAds(params?: {
    asset?: string;
    fiat?: string;
    page?: number;
    limit?: number;
  }): Promise<MyAdsResponse> {
    return this.fetch<BybitResponse<MyAdsResponse>>(
      BYBIT_P2P_CONFIG.endpoints.myAds,
      params || {}
    );
  }

  // GET /v5/p2p/order/simplifyList - Listar órdenes
  async getOrders(
    orderType?: string,
    status?: string,
    page = 1,
    limit = 50
  ): Promise<any> {
    return this.fetch(BYBIT_P2P_CONFIG.endpoints.myOrders, {
      asset: orderType,
      status,
      page,
      limit,
    });
  }
}
