export const BYBIT_P2P_CONFIG = {
  mainnet: {
    baseUrl: "https://api.bybit.com",
    testnet: "https://api-testnet.bybit.com",
  },
  endpoints: {
    onlineAds: "/v5/p2p/item/online",
    myAds: "/v5/p2p/item/personal/list",
    myOrders: "/v5/p2p/order/simplifyList",
    orderInfo: "/v5/p2p/order/info",
    pendingOrders: "/v5/p2p/order/pending/simplifyList",
    chatMessages: "/v5/p2p/order/message/listpage",
    uploadFile: "/v5/p2p/oss/upload_file",
    balance: "/v5/asset/transfer/query-account-coins-balance",
  },
  defaultParams: {
    category: "spot",
    recvWindow: 5000,
    signatureVersion: "2",
    signatureMethod: "HMAC-SHA256",
  },
  pageParams: {
    pageSize: 100,
    sortType: "ASC",
    sortOrder: "ASC",
  },
};
