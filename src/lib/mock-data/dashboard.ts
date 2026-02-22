import { subDays, subHours, format } from 'date-fns';

export const MOCK_KPIS = {
  totalSKUs: 1247,
  lowStockAlerts: 23,
  pendingOrders: 18,
  todayReceipts: 5,
};

export const MOCK_CATEGORIES = [
  { category: 'Spor', value: 425000, count: 312 },
  { category: 'Klasik', value: 380000, count: 285 },
  { category: 'Termal', value: 290000, count: 198 },
  { category: 'Medikal', value: 185000, count: 142 },
  { category: 'Gunluk', value: 320000, count: 310 },
];

export const MOCK_MONTHLY = [
  { month: 'Eyl', inbound: 45000, outbound: 38000 },
  { month: 'Eki', inbound: 52000, outbound: 42000 },
  { month: 'Kas', inbound: 48000, outbound: 51000 },
  { month: 'Ara', inbound: 61000, outbound: 55000 },
  { month: 'Oca', inbound: 43000, outbound: 39000 },
  { month: 'Sub', inbound: 50000, outbound: 44000 },
];

// Deterministik trend verisi (Math.random yerine)
export const MOCK_TREND = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'dd MMM'),
  quantity: 150000 + Math.round(Math.sin(i * 0.5) * 8000 + i * 200),
}));

export const MOCK_UTILIZATION = [
  { zone: 'A - Hammadde', occupied: 82, total: 100, percentage: 82 },
  { zone: 'B - Mamul', occupied: 156, total: 200, percentage: 78 },
  { zone: 'C - Kabul', occupied: 12, total: 20, percentage: 60 },
  { zone: 'D - Sevkiyat', occupied: 8, total: 15, percentage: 53 },
  { zone: 'E - Karantina', occupied: 5, total: 10, percentage: 50 },
];

export const MOCK_MOVEMENTS = [
  { id: '1', type: 'receive', item: 'Pamuk Iplik 30/1', quantity: 500, unit: 'kg', date: new Date() },
  { id: '2', type: 'ship', item: 'SP001-SYH-M', quantity: 120, unit: 'cift', date: subHours(new Date(), 2) },
  { id: '3', type: 'pick', item: 'CR002-LCV-L', quantity: 60, unit: 'cift', date: subHours(new Date(), 4) },
  { id: '4', type: 'putaway', item: 'Polyester Iplik 150D', quantity: 200, unit: 'kg', date: subHours(new Date(), 5) },
  { id: '5', type: 'transfer', item: 'SP001-BYZ-S', quantity: 48, unit: 'cift', date: subHours(new Date(), 6) },
  { id: '6', type: 'production_in', item: 'KL001-GRI-XL', quantity: 240, unit: 'cift', date: subHours(new Date(), 8) },
  { id: '7', type: 'adjust_in', item: 'TR003-KRM-M', quantity: 12, unit: 'cift', date: subHours(new Date(), 10) },
  { id: '8', type: 'return_in', item: 'SP002-MAV-L', quantity: 8, unit: 'cift', date: subHours(new Date(), 12) },
  { id: '9', type: 'receive', item: 'Elastan Iplik', quantity: 150, unit: 'kg', date: subHours(new Date(), 14) },
  { id: '10', type: 'ship', item: 'MD001-BEJ-S', quantity: 96, unit: 'cift', date: subHours(new Date(), 16) },
];

export const MOCK_ALERTS = [
  { id: '1', severity: 'critical' as const, title: 'Stok Tukendi: Pamuk Iplik 30/1', message: 'Hammadde deposunda stok sifir', created_at: new Date().toISOString() },
  { id: '2', severity: 'warning' as const, title: 'Dusuk Stok: SP001-SYH-M', message: 'Mevcut: 45, Minimum: 100', created_at: new Date().toISOString() },
  { id: '3', severity: 'warning' as const, title: 'Kapasite Uyarisi: Bolge A', message: 'Doluluk orani %92', created_at: new Date().toISOString() },
  { id: '4', severity: 'info' as const, title: 'Siparis Gecikmesi: PO-2026-0042', message: '3 gun gecikme', created_at: new Date().toISOString() },
];

// Ek KPI verileri
export const MOCK_INVENTORY_VALUE = 1_600_000;
export const MOCK_COGS = 4_800_000;
export const MOCK_CARRYING_COST_RATE = 25;
