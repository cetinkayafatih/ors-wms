/**
 * SPC (Statistical Process Control) Calculations
 * X-bar/R, I-MR, Cp/Cpk, Out-of-Control Detection
 */

import type { SPCSubgroup, SPCLimits, XbarRResult, IMRResult, CapabilityResult } from '@/types/analytics';

// SPC sabitleri (alt grup boyutuna gore)
// n: A2, D3, D4, d2
const SPC_CONSTANTS: Record<number, { A2: number; D3: number; D4: number; d2: number }> = {
  2: { A2: 1.880, D3: 0, D4: 3.267, d2: 1.128 },
  3: { A2: 1.023, D3: 0, D4: 2.574, d2: 1.693 },
  4: { A2: 0.729, D3: 0, D4: 2.282, d2: 2.059 },
  5: { A2: 0.577, D3: 0, D4: 2.114, d2: 2.326 },
  6: { A2: 0.483, D3: 0, D4: 2.004, d2: 2.534 },
  7: { A2: 0.419, D3: 0.076, D4: 1.924, d2: 2.704 },
  8: { A2: 0.373, D3: 0.136, D4: 1.864, d2: 2.847 },
  9: { A2: 0.337, D3: 0.184, D4: 1.816, d2: 2.970 },
  10: { A2: 0.308, D3: 0.223, D4: 1.777, d2: 3.078 },
};

/**
 * X-bar/R kontrol limitleri hesaplama
 */
export function calculateXbarRLimits(subgroups: SPCSubgroup[]): XbarRResult {
  if (subgroups.length === 0) {
    return {
      xbarLimits: { UCL: 0, CL: 0, LCL: 0 },
      rLimits: { UCL: 0, CL: 0, LCL: 0 },
      subgroups: [],
      outOfControl: [],
    };
  }

  const n = subgroups[0].sampleValues.length;
  const constants = SPC_CONSTANTS[n] ?? SPC_CONSTANTS[5];

  // X-double-bar (ortalamalar ortalamasi)
  const xBar = subgroups.reduce((sum, sg) => sum + sg.mean, 0) / subgroups.length;
  // R-bar (aralik ortalamasi)
  const rBar = subgroups.reduce((sum, sg) => sum + sg.range, 0) / subgroups.length;

  const xbarLimits: SPCLimits = {
    UCL: Math.round((xBar + constants.A2 * rBar) * 1000) / 1000,
    CL: Math.round(xBar * 1000) / 1000,
    LCL: Math.round((xBar - constants.A2 * rBar) * 1000) / 1000,
  };

  const rLimits: SPCLimits = {
    UCL: Math.round(constants.D4 * rBar * 1000) / 1000,
    CL: Math.round(rBar * 1000) / 1000,
    LCL: Math.round(constants.D3 * rBar * 1000) / 1000,
  };

  const outOfControl = detectOutOfControl(
    subgroups.map((sg) => sg.mean),
    xbarLimits
  );

  return { xbarLimits, rLimits, subgroups, outOfControl };
}

/**
 * I-MR (Individual - Moving Range) kontrol limitleri hesaplama
 */
export function calculateIMRLimits(individuals: number[]): IMRResult {
  if (individuals.length < 2) {
    return {
      iLimits: { UCL: 0, CL: 0, LCL: 0 },
      mrLimits: { UCL: 0, CL: 0, LCL: 0 },
      individuals: [],
      movingRanges: [],
      outOfControl: [],
    };
  }

  // Hareketli araliklar
  const movingRanges: number[] = [0]; // ilk nokta icin 0
  for (let i = 1; i < individuals.length; i++) {
    movingRanges.push(Math.abs(individuals[i] - individuals[i - 1]));
  }

  const xBar = individuals.reduce((a, b) => a + b, 0) / individuals.length;
  const mrBar = movingRanges.slice(1).reduce((a, b) => a + b, 0) / (movingRanges.length - 1);

  // d2 for n=2 is 1.128
  const d2 = 1.128;

  const iLimits: SPCLimits = {
    UCL: Math.round((xBar + 3 * (mrBar / d2)) * 100) / 100,
    CL: Math.round(xBar * 100) / 100,
    LCL: Math.round((xBar - 3 * (mrBar / d2)) * 100) / 100,
  };

  const mrLimits: SPCLimits = {
    UCL: Math.round(3.267 * mrBar * 100) / 100,
    CL: Math.round(mrBar * 100) / 100,
    LCL: 0,
  };

  const outOfControl = detectOutOfControl(individuals, iLimits);

  return { iLimits, mrLimits, individuals, movingRanges, outOfControl };
}

/**
 * Surec Yeterliligi (Cp ve Cpk)
 */
export function calculateCp(usl: number, lsl: number, stdDev: number): number {
  if (stdDev <= 0) return 0;
  return Math.round(((usl - lsl) / (6 * stdDev)) * 1000) / 1000;
}

export function calculateCpk(mean: number, usl: number, lsl: number, stdDev: number): number {
  if (stdDev <= 0) return 0;
  const cpkUpper = (usl - mean) / (3 * stdDev);
  const cpkLower = (mean - lsl) / (3 * stdDev);
  return Math.round(Math.min(cpkUpper, cpkLower) * 1000) / 1000;
}

export function calculateCapability(
  values: number[],
  usl: number,
  lsl: number
): CapabilityResult {
  if (values.length === 0) {
    return { cp: 0, cpk: 0, mean: 0, stdDev: 0, usl, lsl };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  const stdDev = Math.sqrt(variance);

  return {
    cp: calculateCp(usl, lsl, stdDev),
    cpk: calculateCpk(mean, usl, lsl, stdDev),
    mean: Math.round(mean * 1000) / 1000,
    stdDev: Math.round(stdDev * 1000) / 1000,
    usl,
    lsl,
  };
}

/**
 * Kontrol disi noktalarini tespit et (Nelson Rule 1: limit disi)
 */
export function detectOutOfControl(values: number[], limits: SPCLimits): number[] {
  const outOfControl: number[] = [];

  for (let i = 0; i < values.length; i++) {
    if (values[i] > limits.UCL || values[i] < limits.LCL) {
      outOfControl.push(i);
    }
  }

  return outOfControl;
}

/**
 * Normal dagilim yogunluk fonksiyonu (grafik icin)
 */
export function normalPDF(x: number, mean: number, stdDev: number): number {
  if (stdDev <= 0) return 0;
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

/**
 * Grafik icin normal dagilim veri noktalari olustur
 */
export function generateNormalCurve(
  mean: number,
  stdDev: number,
  points = 100
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const range = 4 * stdDev;
  const step = (2 * range) / points;

  for (let x = mean - range; x <= mean + range; x += step) {
    result.push({
      x: Math.round(x * 1000) / 1000,
      y: Math.round(normalPDF(x, mean, stdDev) * 10000) / 10000,
    });
  }

  return result;
}
