/**
 * Forecasting Calculations
 * Monte Carlo Simulation, Holt's Double Exponential Smoothing
 */

import type { MonteCarloResult, HoltSmoothingResult } from '@/types/analytics';

/**
 * Monte Carlo guvenlik stogu simulasyonu
 * @param avgDemand Ortalama gunluk talep
 * @param demandStdDev Talep standart sapmasi
 * @param avgLeadTime Ortalama tedarik suresi (gun)
 * @param leadTimeStdDev Tedarik suresi standart sapmasi
 * @param iterations Simulasyon sayisi
 */
export function monteCarloSafetyStock(
  avgDemand: number,
  demandStdDev: number,
  avgLeadTime: number,
  leadTimeStdDev: number,
  iterations = 10000
): MonteCarloResult {
  const demands: number[] = [];

  for (let i = 0; i < iterations; i++) {
    // Box-Muller transformasyonu ile normal dagilim
    const u1 = Math.random();
    const u2 = Math.random();
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    const simulatedDemand = Math.max(0, avgDemand + z1 * demandStdDev);
    const simulatedLeadTime = Math.max(0.5, avgLeadTime + z2 * leadTimeStdDev);

    demands.push(simulatedDemand * simulatedLeadTime);
  }

  demands.sort((a, b) => a - b);

  const mean = demands.reduce((a, b) => a + b, 0) / demands.length;
  const variance = demands.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / demands.length;
  const stdDev = Math.sqrt(variance);

  const percentile95 = demands[Math.floor(iterations * 0.95)];
  const percentile99 = demands[Math.floor(iterations * 0.99)];

  // Histogram icin binleme
  const binCount = 30;
  const min = demands[0];
  const max = demands[demands.length - 1];
  const binSize = (max - min) / binCount;

  const histogram: { bin: number; count: number }[] = [];
  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binSize;
    const binEnd = binStart + binSize;
    const count = demands.filter((d) => d >= binStart && d < binEnd).length;
    histogram.push({
      bin: Math.round((binStart + binEnd) / 2),
      count,
    });
  }

  return {
    iterations,
    histogram,
    mean: Math.round(mean),
    stdDev: Math.round(stdDev),
    percentile95: Math.round(percentile95),
    percentile99: Math.round(percentile99),
    safetyStock95: Math.round(percentile95 - mean),
    safetyStock99: Math.round(percentile99 - mean),
  };
}

/**
 * Holt's Double Exponential Smoothing (trend destekli)
 * Level: L(t) = alpha * Y(t) + (1-alpha) * (L(t-1) + T(t-1))
 * Trend: T(t) = beta * (L(t) - L(t-1)) + (1-beta) * T(t-1)
 * Forecast: F(t+m) = L(t) + m * T(t)
 */
export function holtSmoothing(
  data: number[],
  alpha = 0.3,
  beta = 0.1,
  periodsAhead = 3
): HoltSmoothingResult {
  if (data.length < 2) {
    return { forecast: [], nextPeriods: [], mae: 0, mape: 0 };
  }

  // Baslangic degerleri
  let level = data[0];
  let trend = data[1] - data[0];

  const forecast: number[] = [Math.round(data[0])];
  let totalAbsError = 0;
  let totalAbsPercentError = 0;

  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    const f = Math.round(prevLevel + trend);
    forecast.push(f);

    const error = Math.abs(data[i] - f);
    totalAbsError += error;
    if (data[i] !== 0) {
      totalAbsPercentError += error / data[i];
    }
  }

  const nextPeriods: number[] = [];
  for (let m = 1; m <= periodsAhead; m++) {
    nextPeriods.push(Math.round(level + m * trend));
  }

  const n = data.length - 1;

  return {
    forecast,
    nextPeriods,
    mae: n > 0 ? Math.round(totalAbsError / n) : 0,
    mape: n > 0 ? Math.round((totalAbsPercentError / n) * 10000) / 100 : 0,
  };
}
