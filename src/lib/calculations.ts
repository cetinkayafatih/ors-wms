/**
 * Industrial Engineering Calculations for WMS
 * EOQ, Safety Stock, Reorder Point, ABC Classification, Demand Forecasting
 */

/**
 * Economic Order Quantity (EOQ)
 * EOQ = sqrt(2 * D * S / H)
 */
export function calculateEOQ(
  annualDemand: number,
  orderingCost: number,
  holdingCost: number
): { eoq: number; ordersPerYear: number; daysBetweenOrders: number; totalCost: number } {
  if (annualDemand <= 0 || orderingCost <= 0 || holdingCost <= 0) {
    return { eoq: 0, ordersPerYear: 0, daysBetweenOrders: 0, totalCost: 0 };
  }

  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  const ordersPerYear = annualDemand / eoq;
  const daysBetweenOrders = 365 / ordersPerYear;
  const totalCost =
    (annualDemand / eoq) * orderingCost + (eoq / 2) * holdingCost;

  return {
    eoq: Math.round(eoq),
    ordersPerYear: Math.round(ordersPerYear * 10) / 10,
    daysBetweenOrders: Math.round(daysBetweenOrders * 10) / 10,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}

/**
 * Safety Stock Calculation
 * SS = Z * sqrt((LT * sigma_d^2) + (d_avg^2 * sigma_LT^2))
 */
export function calculateSafetyStock(
  serviceLevelZ: number,
  avgLeadTimeDays: number,
  demandStdDev: number,
  avgDailyDemand: number,
  leadTimeStdDev: number
): number {
  if (serviceLevelZ <= 0 || avgLeadTimeDays <= 0) return 0;

  const ss =
    serviceLevelZ *
    Math.sqrt(
      avgLeadTimeDays * Math.pow(demandStdDev, 2) +
        Math.pow(avgDailyDemand, 2) * Math.pow(leadTimeStdDev, 2)
    );

  return Math.ceil(ss);
}

/**
 * Reorder Point (ROP)
 * ROP = (Average Daily Demand * Lead Time) + Safety Stock
 */
export function calculateReorderPoint(
  avgDailyDemand: number,
  leadTimeDays: number,
  safetyStock: number
): number {
  return Math.ceil(avgDailyDemand * leadTimeDays + safetyStock);
}

/**
 * Service level Z-scores
 */
export const SERVICE_LEVELS: Record<string, number> = {
  '90%': 1.28,
  '95%': 1.65,
  '97.5%': 1.96,
  '99%': 2.33,
  '99.5%': 2.58,
  '99.9%': 3.09,
};

/**
 * ABC Classification (Pareto Analysis)
 */
export interface ABCItem {
  id: string;
  name: string;
  sku?: string;
  annualUsageValue: number;
  quantity: number;
  unitCost: number;
}

export interface ABCResult {
  item: ABCItem;
  class: 'A' | 'B' | 'C';
  cumulativePercentage: number;
  valuePercentage: number;
  rank: number;
}

export function calculateABCClassification(
  items: ABCItem[],
  aThreshold = 80,
  bThreshold = 95
): ABCResult[] {
  const totalValue = items.reduce((sum, item) => sum + item.annualUsageValue, 0);

  if (totalValue === 0) return [];

  const sorted = [...items].sort(
    (a, b) => b.annualUsageValue - a.annualUsageValue
  );

  let cumulativeValue = 0;
  return sorted.map((item, index) => {
    cumulativeValue += item.annualUsageValue;
    const cumulativePercentage = (cumulativeValue / totalValue) * 100;
    const valuePercentage = (item.annualUsageValue / totalValue) * 100;

    let abcClass: 'A' | 'B' | 'C';
    if (cumulativePercentage <= aThreshold) {
      abcClass = 'A';
    } else if (cumulativePercentage <= bThreshold) {
      abcClass = 'B';
    } else {
      abcClass = 'C';
    }

    return {
      item,
      class: abcClass,
      cumulativePercentage: Math.round(cumulativePercentage * 100) / 100,
      valuePercentage: Math.round(valuePercentage * 100) / 100,
      rank: index + 1,
    };
  });
}

export function getABCSummary(results: ABCResult[]) {
  const summary = { A: { count: 0, value: 0 }, B: { count: 0, value: 0 }, C: { count: 0, value: 0 } };
  const total = results.length;
  const totalValue = results.reduce((s, r) => s + r.item.annualUsageValue, 0);

  for (const result of results) {
    summary[result.class].count++;
    summary[result.class].value += result.item.annualUsageValue;
  }

  return {
    A: {
      ...summary.A,
      skuPercentage: total ? Math.round((summary.A.count / total) * 100) : 0,
      valuePercentage: totalValue ? Math.round((summary.A.value / totalValue) * 100) : 0,
    },
    B: {
      ...summary.B,
      skuPercentage: total ? Math.round((summary.B.count / total) * 100) : 0,
      valuePercentage: totalValue ? Math.round((summary.B.value / totalValue) * 100) : 0,
    },
    C: {
      ...summary.C,
      skuPercentage: total ? Math.round((summary.C.count / total) * 100) : 0,
      valuePercentage: totalValue ? Math.round((summary.C.value / totalValue) * 100) : 0,
    },
  };
}

/**
 * Inventory Turnover
 */
export function calculateInventoryTurnover(
  cogs: number,
  averageInventoryValue: number
): { turnover: number; daysOnHand: number } {
  if (averageInventoryValue <= 0) return { turnover: 0, daysOnHand: 0 };

  const turnover = cogs / averageInventoryValue;
  const daysOnHand = 365 / turnover;

  return {
    turnover: Math.round(turnover * 10) / 10,
    daysOnHand: Math.round(daysOnHand),
  };
}

/**
 * Simple Exponential Smoothing for demand forecasting
 * F(t+1) = alpha * D(t) + (1 - alpha) * F(t)
 */
export function exponentialSmoothing(
  historicalDemand: number[],
  alpha = 0.2
): { forecast: number[]; nextPeriod: number; mae: number; mape: number } {
  if (historicalDemand.length === 0) {
    return { forecast: [], nextPeriod: 0, mae: 0, mape: 0 };
  }

  const forecast: number[] = [historicalDemand[0]];
  let totalAbsError = 0;
  let totalAbsPercentError = 0;

  for (let i = 1; i < historicalDemand.length; i++) {
    const f = alpha * historicalDemand[i - 1] + (1 - alpha) * forecast[i - 1];
    forecast.push(Math.round(f));
    const error = Math.abs(historicalDemand[i] - f);
    totalAbsError += error;
    if (historicalDemand[i] !== 0) {
      totalAbsPercentError += error / historicalDemand[i];
    }
  }

  const nextPeriod =
    alpha * historicalDemand[historicalDemand.length - 1] +
    (1 - alpha) * forecast[forecast.length - 1];

  const n = historicalDemand.length - 1;

  return {
    forecast,
    nextPeriod: Math.round(nextPeriod),
    mae: n > 0 ? Math.round(totalAbsError / n) : 0,
    mape: n > 0 ? Math.round((totalAbsPercentError / n) * 10000) / 100 : 0,
  };
}

/**
 * Warehouse utilization calculations
 */
export function calculateFloorUtilization(
  storageArea: number,
  totalArea: number
): number {
  if (totalArea <= 0) return 0;
  return Math.round((storageArea / totalArea) * 10000) / 100;
}

export function calculateVolumeUtilization(
  inventoryVolume: number,
  totalStorageVolume: number
): number {
  if (totalStorageVolume <= 0) return 0;
  return Math.round((inventoryVolume / totalStorageVolume) * 10000) / 100;
}

/**
 * Pick accuracy (DPMO - Defects Per Million Opportunities)
 */
export function calculateDPMO(
  defects: number,
  opportunities: number
): { dpmo: number; sigmaLevel: number; accuracy: number } {
  if (opportunities <= 0) return { dpmo: 0, sigmaLevel: 6, accuracy: 100 };

  const dpmo = Math.round((defects / opportunities) * 1000000);
  const accuracy = Math.round((1 - defects / opportunities) * 10000) / 100;

  // Approximate sigma level
  let sigmaLevel: number;
  if (dpmo <= 3.4) sigmaLevel = 6;
  else if (dpmo <= 233) sigmaLevel = 5;
  else if (dpmo <= 6210) sigmaLevel = 4;
  else if (dpmo <= 66807) sigmaLevel = 3;
  else if (dpmo <= 308538) sigmaLevel = 2;
  else sigmaLevel = 1;

  return { dpmo, sigmaLevel, accuracy };
}

/**
 * Carrying cost calculation
 */
export function calculateCarryingCost(
  inventoryValue: number,
  carryingCostPercentage = 25
): { annual: number; monthly: number; daily: number } {
  const annual = inventoryValue * (carryingCostPercentage / 100);
  return {
    annual: Math.round(annual),
    monthly: Math.round(annual / 12),
    daily: Math.round(annual / 365),
  };
}
