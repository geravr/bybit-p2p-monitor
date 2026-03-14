export interface BybitAd {
  adRequestId?: string;
  asset: string;
  country?: string;
  paymentMethod?: string;
  paymentMethodType?: string;
  price: string;
  payStartTime: number;
  payTimeValidity: number;
  tradableAmount: string;
  dynamicMaxSingleOrderAmt: string;
  dynamicMaxSingleOrderCentAmount: string;
  fiatPayAmount: string;
  dynamicMaxSingleOrderPayAmount: string;
  dynamicMaxSingleOrderQuantity: string;
  adType: string;
  publisherMemberName: string;
  memberNo: string;
  advStatus?: number;
  makerOrderStatuses?: string;
  dynamicMinSingleOrderAmt: string;
  minSingleOrderAmt: string;
  dynamicMinSingleOrderPayAmount: string;
  makerPayAmountMinThreshold?: number;
  dynamicMinSingleOrderQuantity: string;
  tradeMethodTips?: string;
  paymentMethodTips?: string;
  assetIconUrl?: string;
  paymentTimeValidity: number;
  payTimeValidity: number;
  dynamicMaxOrderAmt: string;
  dynamicMinOrderAmt: string;
  dynamicMaxOrderQty: string;
  dynamicMinOrderQty: string;
  maxSingleOrderQty: string;
  minSingleOrderQty: string;
  maxSingleOrderAmt: string;
  minSingleOrderAmt: string;
  commissionRate?: string;
  dynamicMaxSingleOrderFeeAmt: string;
  dynamicMinSingleOrderFeeAmt: string;
  dynamicMaxOrderFeeAmt: string;
  dynamicMinOrderFeeAmt: string;
  advPayMethodTips?: string;
  tradeStatus?: string;
  publishTime?: string;
  fiatSymbol?: string;
}

export interface BybitResponse<T> {
  retCode: number;
  retMsg: string;
  result: T;
  retExtInfo?: any;
  time: number;
}

export interface OnlineAdsResponse {
  list: BybitAd[];
  nextPageCursor?: string;
}

export interface MyAdsResponse {
  list: MyAdItem[];
  nextPageCursor?: string;
}

export interface MyAdItem {
  advNo: string;
  adviseOrderNo?: string;
  fiatRange?: [number, number];
  tradeRange?: [number, number];
  singleOrderLimit?: [number, number];
  singleOrderLimitMin?: [number, number];
  singleOrderLimitMax?: [number, number];
  asset: string;
  price: string;
  amount: string;
  tradableAmount: string;
  dynamicMinOrderAmt: string;
  minSingleOrderAmt: string;
  dynamicMaxOrderAmt: string;
  maxSingleOrderAmt: string;
  fiatSym: string;
  payFiatSym: string;
  payMethod?: string;
  payMethodType?: string;
  advStatus?: number;
  tradeMethod?: string[];
  tradeMethodName?: string[];
  makerOrderStatuses?: string[];
  adType?: string;
  orderCount?: number;
  dynamicMaxSingleOrderQty?: string;
  dynamicMinSingleOrderQty?: string;
  maxSingleOrderQty?: string;
  minSingleOrderQty?: string;
  tradeStatus?: string;
  payTimeValidity?: number;
  paymentMethodTips?: string;
  tradeMethodTips?: string;
  advPayMethodTips?: string;
}
