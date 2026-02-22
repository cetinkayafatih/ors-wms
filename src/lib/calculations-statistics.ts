/**
 * Statistical Calculations
 * Paired t-Test, Linear Regression, Descriptive Statistics
 */

import type { TTestResult, RegressionResult, DescriptiveStatsResult } from '@/types/analytics';

/**
 * Betimleyici istatistikler
 */
export function descriptiveStats(values: number[]): DescriptiveStatsResult {
  if (values.length === 0) {
    return { mean: 0, median: 0, stdDev: 0, variance: 0, min: 0, max: 0, count: 0 };
  }

  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const sorted = [...values].sort((a, b) => a - b);
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);

  return {
    mean: Math.round(mean * 1000) / 1000,
    median: Math.round(median * 1000) / 1000,
    stdDev: Math.round(stdDev * 1000) / 1000,
    variance: Math.round(variance * 1000) / 1000,
    min: Math.min(...values),
    max: Math.max(...values),
    count: n,
  };
}

/**
 * Eslestirilmis t-Testi (Paired t-Test)
 * H0: mu_d = 0 (ortalama fark sifirdir)
 * H1: mu_d != 0 (ortalama fark sifir degildir)
 */
export function pairedTTest(
  before: number[],
  after: number[],
  alpha = 0.05
): TTestResult {
  if (before.length !== after.length || before.length < 2) {
    return {
      tValue: 0,
      pValue: 1,
      degreesOfFreedom: 0,
      isSignificant: false,
      confidenceLevel: 1 - alpha,
      meanDifference: 0,
    };
  }

  const n = before.length;
  const differences = before.map((b, i) => after[i] - b);
  const meanDiff = differences.reduce((a, b) => a + b, 0) / n;
  const variance = differences.reduce((sum, d) => sum + Math.pow(d - meanDiff, 2), 0) / (n - 1);
  const stdError = Math.sqrt(variance / n);

  const tValue = stdError > 0 ? meanDiff / stdError : 0;
  const df = n - 1;
  const pValue = tDistributionPValue(Math.abs(tValue), df);

  return {
    tValue: Math.round(tValue * 1000) / 1000,
    pValue: Math.round(pValue * 10000) / 10000,
    degreesOfFreedom: df,
    isSignificant: pValue < alpha,
    confidenceLevel: 1 - alpha,
    meanDifference: Math.round(meanDiff * 1000) / 1000,
  };
}

/**
 * t-Dagilimi p-degeri yaklasimi
 * Hill (1970) yaklasim yontemi
 */
export function tDistributionPValue(t: number, df: number): number {
  if (df <= 0) return 1;

  // Yaklasim: t → z dönüsümü (buyuk df icin)
  const x = df / (df + t * t);
  let p: number;

  if (df >= 30) {
    // Normal yaklasim
    p = 2 * (1 - normalCDF(Math.abs(t)));
  } else {
    // Beta fonksiyonu yaklasimi
    p = incompleteBeta(x, df / 2, 0.5);
  }

  return Math.min(Math.max(p, 0), 1);
}

/**
 * Normal CDF yaklasimi (Abramowitz & Stegun)
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Incomplete Beta fonksiyonu yaklasimi
 */
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // Continued fraction yaklasimi (basitlestirilmis)
  const maxIter = 200;
  const epsilon = 1e-10;

  let result = 0;
  let term = 1;

  for (let k = 0; k < maxIter; k++) {
    term *= (x * (a + k)) / (a + k + 1);
    result += term / (a + k + 1);
    if (Math.abs(term) < epsilon) break;
  }

  return Math.min(Math.max(result * Math.pow(x, a) * Math.pow(1 - x, b) / a, 0), 1);
}

/**
 * Basit Dogrusal Regresyon (Least Squares)
 * y = mx + b
 */
export function linearRegression(
  xValues: number[],
  yValues: number[]
): RegressionResult {
  if (xValues.length !== yValues.length || xValues.length < 2) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      equation: 'y = 0',
      points: [],
      regressionLine: [],
    };
  }

  const n = xValues.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = yValues.reduce((sum, y) => sum + y * y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R² hesaplama
  const meanY = sumY / n;
  const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const ssResidual = yValues.reduce((sum, y, i) => {
    const predicted = slope * xValues[i] + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

  const points = xValues.map((x, i) => ({ x, y: yValues[i] }));

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const regressionLine = [
    { x: minX, y: Math.round((slope * minX + intercept) * 1000) / 1000 },
    { x: maxX, y: Math.round((slope * maxX + intercept) * 1000) / 1000 },
  ];

  const slopeStr = slope >= 0
    ? `${Math.round(slope * 1000) / 1000}`
    : `${Math.round(slope * 1000) / 1000}`;
  const interceptStr = intercept >= 0
    ? `+ ${Math.round(intercept * 100) / 100}`
    : `- ${Math.round(Math.abs(intercept) * 100) / 100}`;

  return {
    slope: Math.round(slope * 1000) / 1000,
    intercept: Math.round(intercept * 1000) / 1000,
    rSquared: Math.round(rSquared * 10000) / 10000,
    equation: `y = ${slopeStr}x ${interceptStr}`,
    points,
    regressionLine,
  };
}
