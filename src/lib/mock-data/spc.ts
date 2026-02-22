import type { SPCSubgroup } from '@/types/analytics';

function generateSubgroups(
  metricName: string,
  count: number,
  sampleSize: number,
  baseMean: number,
  baseStd: number,
  outOfControlIndices: number[] = []
): SPCSubgroup[] {
  const subgroups: SPCSubgroup[] = [];

  for (let i = 0; i < count; i++) {
    const isOutOfControl = outOfControlIndices.includes(i);
    const sampleValues: number[] = [];

    for (let j = 0; j < sampleSize; j++) {
      const shift = isOutOfControl ? baseStd * 2.5 : 0;
      const value = baseMean + shift + (Math.random() - 0.5) * baseStd * 2;
      sampleValues.push(Math.round(value * 100) / 100);
    }

    const mean = sampleValues.reduce((a, b) => a + b, 0) / sampleValues.length;
    const range = Math.max(...sampleValues) - Math.min(...sampleValues);

    subgroups.push({
      id: `spc-${metricName}-${i + 1}`,
      subgroupNumber: i + 1,
      metricName,
      sampleValues,
      mean: Math.round(mean * 100) / 100,
      range: Math.round(range * 100) / 100,
      timestamp: new Date(2026, 1, 1 + i, 8 + Math.floor(i / 4), (i % 4) * 15).toISOString(),
    });
  }

  return subgroups;
}

// Toplama dogrulugu: %99.2 ortalama, alt grup boyutu 5
export const MOCK_PICKING_ACCURACY_SUBGROUPS: SPCSubgroup[] = generateSubgroups(
  'picking_accuracy',
  30,
  5,
  99.2,
  0.4,
  [7, 22] // Kontrol disi noktalar
);

// Envanter dogrulugu: %97.5 ortalama
export const MOCK_INVENTORY_ACCURACY_SUBGROUPS: SPCSubgroup[] = generateSubgroups(
  'inventory_accuracy',
  30,
  5,
  97.5,
  0.8,
  [12, 25]
);

// Siparis dongu suresi (dakika): 108 dakika ortalama
export const MOCK_ORDER_CYCLE_TIME: number[] = [
  105, 112, 98, 115, 108, 102, 120, 95, 110, 107,
  118, 103, 99, 113, 106, 111, 104, 116, 100, 109,
  145, 97, 114, 101, 108, 119, 96, 112, 105, 110,
];

// DPMO demo verileri
export const MOCK_DPMO_DATA = {
  defects: 48,
  opportunities: 10000,
  period: 'Subat 2026',
};
