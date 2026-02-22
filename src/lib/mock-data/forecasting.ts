import type { DemandHistoryItem, ABCItemData, EOQDefaults } from '@/types/analytics';

// 3 urun icin 12 ay talep gecmisi
export const MOCK_DEMAND_HISTORY: Record<string, DemandHistoryItem[]> = {
  'SP001-SYH-M': [
    { month: 'Mar 2025', actual: 4200 },
    { month: 'Nis 2025', actual: 4500 },
    { month: 'May 2025', actual: 4800 },
    { month: 'Haz 2025', actual: 5100 },
    { month: 'Tem 2025', actual: 5500 },
    { month: 'Agu 2025', actual: 5200 },
    { month: 'Eyl 2025', actual: 4900 },
    { month: 'Eki 2025', actual: 4700 },
    { month: 'Kas 2025', actual: 5300 },
    { month: 'Ara 2025', actual: 6000 },
    { month: 'Oca 2026', actual: 4400 },
    { month: 'Sub 2026', actual: 4800 },
  ],
  'CR002-LCV-L': [
    { month: 'Mar 2025', actual: 2800 },
    { month: 'Nis 2025', actual: 3000 },
    { month: 'May 2025', actual: 3200 },
    { month: 'Haz 2025', actual: 3500 },
    { month: 'Tem 2025', actual: 3800 },
    { month: 'Agu 2025', actual: 3400 },
    { month: 'Eyl 2025', actual: 3100 },
    { month: 'Eki 2025', actual: 2900 },
    { month: 'Kas 2025', actual: 3300 },
    { month: 'Ara 2025', actual: 3700 },
    { month: 'Oca 2026', actual: 2700 },
    { month: 'Sub 2026', actual: 3000 },
  ],
  'NS003-BYZ-S': [
    { month: 'Mar 2025', actual: 1500 },
    { month: 'Nis 2025', actual: 1800 },
    { month: 'May 2025', actual: 2200 },
    { month: 'Haz 2025', actual: 2800 },
    { month: 'Tem 2025', actual: 3200 },
    { month: 'Agu 2025', actual: 2900 },
    { month: 'Eyl 2025', actual: 2100 },
    { month: 'Eki 2025', actual: 1700 },
    { month: 'Kas 2025', actual: 1600 },
    { month: 'Ara 2025', actual: 1400 },
    { month: 'Oca 2026', actual: 1300 },
    { month: 'Sub 2026', actual: 1600 },
  ],
};

export const MOCK_PRODUCT_NAMES: Record<string, string> = {
  'SP001-SYH-M': 'Spor Corap Siyah M',
  'CR002-LCV-L': 'Crew Corap Lacivert L',
  'NS003-BYZ-S': 'No Show Beyaz S',
};

// 20 kalem ABC verisi
export const MOCK_ABC_ITEMS: ABCItemData[] = [
  { id: '1', name: 'Pamuk Iplik Ne 30', sku: 'IPL-PMK-30', annualUsageValue: 850000, quantity: 42500, unitCost: 20 },
  { id: '2', name: 'Polyester Iplik 150D', sku: 'IPL-PLY-150', annualUsageValue: 620000, quantity: 31000, unitCost: 20 },
  { id: '3', name: 'Elastan Iplik 40D', sku: 'IPL-ELS-40', annualUsageValue: 480000, quantity: 12000, unitCost: 40 },
  { id: '4', name: 'Spor Corap Siyah M', sku: 'SP001-SYH-M', annualUsageValue: 420000, quantity: 60000, unitCost: 7 },
  { id: '5', name: 'Crew Corap Lacivert L', sku: 'CR002-LCV-L', annualUsageValue: 350000, quantity: 38889, unitCost: 9 },
  { id: '6', name: 'Naylon Iplik 70D', sku: 'IPL-NYL-70', annualUsageValue: 280000, quantity: 14000, unitCost: 20 },
  { id: '7', name: 'Termal Corap Gri XL', sku: 'TR003-GRI-XL', annualUsageValue: 210000, quantity: 15000, unitCost: 14 },
  { id: '8', name: 'No Show Beyaz S', sku: 'NS003-BYZ-S', annualUsageValue: 180000, quantity: 36000, unitCost: 5 },
  { id: '9', name: 'Boya Indigo Mavi', sku: 'BYA-IND-MAV', annualUsageValue: 150000, quantity: 3000, unitCost: 50 },
  { id: '10', name: 'Medikal Corap Bej S', sku: 'MD001-BEJ-S', annualUsageValue: 130000, quantity: 8125, unitCost: 16 },
  { id: '11', name: 'Bambu Iplik 30/1', sku: 'IPL-BMB-30', annualUsageValue: 95000, quantity: 3167, unitCost: 30 },
  { id: '12', name: 'Polietilen Ambalaj', sku: 'AMB-PLT-001', annualUsageValue: 65000, quantity: 65000, unitCost: 1 },
  { id: '13', name: 'Etiket Logo Dokuma', sku: 'ETK-LGO-001', annualUsageValue: 45000, quantity: 90000, unitCost: 0.5 },
  { id: '14', name: 'Boya Siyah Reaktif', sku: 'BYA-SYH-001', annualUsageValue: 38000, quantity: 950, unitCost: 40 },
  { id: '15', name: 'Karton Kutu 40x30', sku: 'AMB-KRT-40', annualUsageValue: 28000, quantity: 14000, unitCost: 2 },
  { id: '16', name: 'Lastik Band 5mm', sku: 'LST-BND-5', annualUsageValue: 22000, quantity: 22000, unitCost: 1 },
  { id: '17', name: 'Bant Ambalaj Seffaf', sku: 'AMB-BNT-001', annualUsageValue: 15000, quantity: 5000, unitCost: 3 },
  { id: '18', name: 'Klips Plastik', sku: 'AMB-KLP-001', annualUsageValue: 8000, quantity: 80000, unitCost: 0.1 },
  { id: '19', name: 'Etiket Beden', sku: 'ETK-BDN-001', annualUsageValue: 5000, quantity: 100000, unitCost: 0.05 },
  { id: '20', name: 'Poset LDPE Kucuk', sku: 'AMB-PST-001', annualUsageValue: 3000, quantity: 60000, unitCost: 0.05 },
];

// EOQ varsayilan parametreleri (corap fabrikasi)
export const MOCK_EOQ_DEFAULTS: EOQDefaults[] = [
  { productName: 'Pamuk Iplik Ne 30', annualDemand: 42500, orderingCost: 500, holdingCost: 5 },
  { productName: 'Spor Corap Siyah M', annualDemand: 60000, orderingCost: 350, holdingCost: 1.75 },
  { productName: 'Crew Corap Lacivert L', annualDemand: 38889, orderingCost: 350, holdingCost: 2.25 },
  { productName: 'Polyester Iplik 150D', annualDemand: 31000, orderingCost: 450, holdingCost: 5 },
];
