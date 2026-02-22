/**
 * Lean Manufacturing Calculations
 * Takt Time, Lead Time, Process Efficiency, 5S Trend
 */

import type { VSMStep, FiveSAudit } from '@/types/analytics';

/**
 * Takt Suresi (musteri talebine gore uretim hizi)
 * Takt = Kullanilabilir Sure / Musteri Talebi
 * @param availableMinutesPerDay Gunluk kullanilabilir sure (dakika)
 * @param dailyDemand Gunluk talep (adet)
 */
export function calculateTaktTime(
  availableMinutesPerDay: number,
  dailyDemand: number
): { taktTimeMinutes: number; taktTimeSeconds: number } {
  if (dailyDemand <= 0) return { taktTimeMinutes: 0, taktTimeSeconds: 0 };

  const taktMinutes = availableMinutesPerDay / dailyDemand;
  return {
    taktTimeMinutes: Math.round(taktMinutes * 100) / 100,
    taktTimeSeconds: Math.round(taktMinutes * 60 * 100) / 100,
  };
}

/**
 * Toplam Tedarik Suresi hesaplama (VSM adimlari toplami)
 */
export function calculateLeadTime(steps: VSMStep[]): {
  totalCycleTime: number;
  totalWaitTime: number;
  totalLeadTime: number;
  valueAddedTime: number;
  nonValueAddedTime: number;
  processEfficiency: number;
} {
  let totalCycleTime = 0;
  let totalWaitTime = 0;
  let valueAddedTime = 0;

  for (const step of steps) {
    totalCycleTime += step.cycleTimeMinutes;
    totalWaitTime += step.waitTimeMinutes;
    valueAddedTime += step.cycleTimeMinutes * (step.valueAddedPercentage / 100);
  }

  const totalLeadTime = totalCycleTime + totalWaitTime;
  const nonValueAddedTime = totalLeadTime - valueAddedTime;
  const processEfficiency = totalLeadTime > 0
    ? Math.round((valueAddedTime / totalLeadTime) * 10000) / 100
    : 0;

  return {
    totalCycleTime,
    totalWaitTime,
    totalLeadTime,
    valueAddedTime: Math.round(valueAddedTime * 100) / 100,
    nonValueAddedTime: Math.round(nonValueAddedTime * 100) / 100,
    processEfficiency,
  };
}

/**
 * Surec Verimliligi (PCE - Process Cycle Efficiency)
 */
export function calculateProcessEfficiency(
  valueAddedTime: number,
  totalLeadTime: number
): number {
  if (totalLeadTime <= 0) return 0;
  return Math.round((valueAddedTime / totalLeadTime) * 10000) / 100;
}

/**
 * 5S Trend hesaplama (bolge bazinda ay bazinda)
 */
export function calculate5STrend(
  audits: FiveSAudit[],
  area: string
): { date: string; total: number; sort: number; setInOrder: number; shine: number; standardize: number; sustain: number }[] {
  return audits
    .filter((a) => a.area === area)
    .sort((a, b) => a.auditDate.localeCompare(b.auditDate))
    .map((a) => ({
      date: a.auditDate,
      total: a.total,
      sort: a.sort,
      setInOrder: a.setInOrder,
      shine: a.shine,
      standardize: a.standardize,
      sustain: a.sustain,
    }));
}

/**
 * VSM ozet istatistikleri
 */
export function calculateVSMSummary(steps: VSMStep[]) {
  const lead = calculateLeadTime(steps);
  const totalOperators = steps.reduce((sum, s) => sum + s.operators, 0);
  const totalWIP = steps.reduce((sum, s) => sum + s.wip, 0);
  const bottleneck = steps.reduce((max, s) =>
    s.cycleTimeMinutes > max.cycleTimeMinutes ? s : max, steps[0]);

  return {
    ...lead,
    totalOperators,
    totalWIP,
    bottleneckProcess: bottleneck?.processName ?? '',
    bottleneckTime: bottleneck?.cycleTimeMinutes ?? 0,
  };
}
