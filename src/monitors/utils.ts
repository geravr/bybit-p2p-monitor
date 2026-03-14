// Utility functions for formatting and validation

export const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

export const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};

export const formatPercentage = (value: number, decimals = 2): string => {
  return value.toFixed(decimals) + '%';
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const calculatePriceChange = (
  oldPrice: number,
  newPrice: number
): number => {
  return ((newPrice - oldPrice) / oldPrice) * 100;
};

export const validatePrice = (price: number): boolean => {
  return typeof price === 'number' && price > 0;
};

export const validateAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0;
};

export const sanitizeString = (str: string): string => {
  return str.trim().toLowerCase();
};

export const paginate = <T>(
  data: T[],
  page: number,
  limit: number
): {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
} => {
  const totalPages = Math.ceil(data.length / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);

  return {
    data: paginatedData,
    total: data.length,
    page,
    totalPages,
  };
};

export const filterAds = (
  ads: any[],
  filters: {
    asset?: string;
    fiat?: string;
    minPrice?: number;
    maxPrice?: number;
    adType?: string;
    active?: boolean;
  }
): any[] => {
  return ads.filter((ad) => {
    if (filters.asset && ad.asset !== filters.asset) return false;
    if (filters.fiat && ad.fiat !== filters.fiat) return false;
    if (filters.minPrice && ad.price < filters.minPrice) return false;
    if (filters.maxPrice && ad.price > filters.maxPrice) return false;
    if (filters.adType && ad.adType !== filters.adType) return false;
    if (filters.active !== undefined && ad.active !== filters.active)
      return false;
    return true;
  });
};

export const calculateStats = (priceLogs: any[]): {
  avgChange: number;
  maxChange: number;
  minChange: number;
  totalChanges: number;
} => {
  const changes = priceLogs.map((log, index, array) => {
    if (index === 0) return 0;
    return Math.abs(calculatePriceChange(array[index - 1].price, log.price));
  });

  const sum = changes.reduce((a, b) => a + b, 0);
  const avg = sum / changes.length;
  const max = Math.max(...changes);
  const min = Math.min(...changes);

  return {
    avgChange: avg,
    maxChange: max,
    minChange: min,
    totalChanges: priceLogs.length,
  };
};
