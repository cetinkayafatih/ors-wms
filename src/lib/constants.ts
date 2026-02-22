import type { UserRole } from '@/types/database';

export const APP_NAME = 'Corap WMS';
export const APP_DESCRIPTION = 'Corap Fabrikasi Depo Yonetim Sistemi';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Yonetici',
  warehouse_manager: 'Depo Muduru',
  operator_receiving: 'Kabul Operatoru',
  operator_shipping: 'Sevkiyat Operatoru',
  quality_control: 'Kalite Kontrol',
  viewer: 'Izleyici',
};

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  receive: 'Mal Kabul',
  putaway: 'Yerlesim',
  pick: 'Toplama',
  ship: 'Sevkiyat',
  transfer: 'Transfer',
  adjust_in: 'Duzeltme (+)',
  adjust_out: 'Duzeltme (-)',
  production_in: 'Uretimden Giris',
  production_out: 'Uretime Cikis',
  return_in: 'Musteri Iade',
  return_out: 'Tedarikci Iade',
  count_adjust: 'Sayim Duzeltme',
};

export const PO_STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  submitted: 'Gonderildi',
  approved: 'Onaylandi',
  partially_received: 'Kismi Teslim',
  received: 'Teslim Alindi',
  cancelled: 'Iptal',
  closed: 'Kapali',
};

export const SO_STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  confirmed: 'Onaylandi',
  picking: 'Toplaniyor',
  picked: 'Toplandi',
  packing: 'Paketleniyor',
  packed: 'Paketlendi',
  shipped: 'Sevk Edildi',
  delivered: 'Teslim Edildi',
  cancelled: 'Iptal',
  returned: 'Iade',
};

export const QUALITY_STATUS_LABELS: Record<string, string> = {
  available: 'Kullanilabilir',
  quarantine: 'Karantina',
  rejected: 'Reddedildi',
  on_hold: 'Beklemede',
  pending_inspection: 'Muayene Bekliyor',
};

export const SEVERITY_LABELS: Record<string, string> = {
  info: 'Bilgi',
  warning: 'Uyari',
  critical: 'Kritik',
};

export const ZONE_TYPE_LABELS: Record<string, string> = {
  receiving: 'Kabul Alani',
  storage: 'Depolama',
  picking: 'Toplama Alani',
  shipping: 'Sevkiyat Alani',
  quarantine: 'Karantina',
  returns: 'Iade Alani',
};

export const SOCK_TYPE_LABELS: Record<string, string> = {
  ankle: 'Bilek',
  crew: 'Crew (Klasik)',
  knee_high: 'Diz Alti',
  no_show: 'Gorunmez',
  quarter: 'Ceyrek Boy',
  thigh_high: 'Uzun',
};

export const RAW_MATERIAL_CATEGORY_LABELS: Record<string, string> = {
  yarn: 'Iplik',
  elastic: 'Elastik/Lastik',
  dye: 'Boya',
  label: 'Etiket',
  packaging: 'Ambalaj',
  chemical: 'Kimyasal',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Dusuk',
  normal: 'Normal',
  high: 'Yuksek',
  urgent: 'Acil',
};

// Permission matrix for role-based access
export const PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
  admin: {
    dashboard: ['view', 'edit'],
    products: ['view', 'create', 'edit', 'delete'],
    inventory: ['view', 'create', 'edit', 'delete'],
    locations: ['view', 'create', 'edit', 'delete'],
    receiving: ['view', 'create', 'edit', 'delete'],
    shipping: ['view', 'create', 'edit', 'delete'],
    quality: ['view', 'create', 'edit', 'delete'],
    stock_count: ['view', 'create', 'edit', 'delete'],
    reports: ['view', 'export'],
    users: ['view', 'create', 'edit', 'delete'],
    suppliers: ['view', 'create', 'edit', 'delete'],
    alerts: ['view', 'create', 'edit', 'delete'],
    settings: ['view', 'edit'],
  },
  warehouse_manager: {
    dashboard: ['view', 'edit'],
    products: ['view', 'create', 'edit'],
    inventory: ['view', 'create', 'edit'],
    locations: ['view', 'create', 'edit'],
    receiving: ['view', 'create', 'edit'],
    shipping: ['view', 'create', 'edit'],
    quality: ['view'],
    stock_count: ['view', 'create', 'edit'],
    reports: ['view', 'export'],
    users: ['view'],
    suppliers: ['view', 'create', 'edit'],
    alerts: ['view', 'edit'],
    settings: ['view'],
  },
  operator_receiving: {
    dashboard: ['view'],
    products: ['view'],
    inventory: ['view'],
    locations: ['view'],
    receiving: ['view', 'create', 'edit'],
    shipping: ['view'],
    quality: ['view', 'create'],
    stock_count: ['view'],
    reports: ['view'],
    users: [],
    suppliers: ['view'],
    alerts: ['view'],
    settings: [],
  },
  operator_shipping: {
    dashboard: ['view'],
    products: ['view'],
    inventory: ['view'],
    locations: ['view'],
    receiving: ['view'],
    shipping: ['view', 'create', 'edit'],
    quality: ['view', 'create'],
    stock_count: ['view'],
    reports: ['view'],
    users: [],
    suppliers: ['view'],
    alerts: ['view'],
    settings: [],
  },
  quality_control: {
    dashboard: ['view'],
    products: ['view'],
    inventory: ['view'],
    locations: ['view'],
    receiving: ['view'],
    shipping: ['view'],
    quality: ['view', 'create', 'edit'],
    stock_count: ['view'],
    reports: ['view'],
    users: [],
    suppliers: ['view'],
    alerts: ['view'],
    settings: [],
  },
  viewer: {
    dashboard: ['view'],
    products: ['view'],
    inventory: ['view'],
    locations: ['view'],
    receiving: ['view'],
    shipping: ['view'],
    quality: ['view'],
    stock_count: ['view'],
    reports: ['view', 'export'],
    users: [],
    suppliers: ['view'],
    alerts: ['view'],
    settings: [],
  },
};

// ─── Analytics Labels ────────────────────────────────────────

export const KANBAN_COLUMN_LABELS: Record<string, string> = {
  backlog: 'Bekleme Listesi',
  todo: 'Yapilacak',
  in_progress: 'Devam Eden',
  review: 'Inceleme',
  testing: 'Test',
  done: 'Tamamlandi',
  archived: 'Arsiv',
};

export const WASTE_TYPE_LABELS: Record<string, string> = {
  Transport: 'Tasima',
  Inventory: 'Fazla Stok',
  Motion: 'Gereksiz Hareket',
  Waiting: 'Bekleme',
  Overproduction: 'Fazla Uretim',
  Overprocessing: 'Gereksiz Islem',
  Defects: 'Kusurlar',
};

export const FIVE_S_LABELS: Record<string, string> = {
  sort: 'Ayiklama (Seiri)',
  setInOrder: 'Duzenleme (Seiton)',
  shine: 'Temizlik (Seiso)',
  standardize: 'Standartlastirma (Seiketsu)',
  sustain: 'Disiplin (Shitsuke)',
};

export const METRIC_CATEGORY_LABELS: Record<string, string> = {
  accuracy: 'Dogruluk',
  speed: 'Hiz',
  efficiency: 'Verimlilik',
  quality: 'Kalite',
};

export const SPC_METRIC_LABELS: Record<string, string> = {
  picking_accuracy: 'Toplama Dogrulugu',
  inventory_accuracy: 'Envanter Dogrulugu',
  order_cycle_time: 'Siparis Dongu Suresi',
};

export function hasPermission(
  role: UserRole,
  module: string,
  action: string
): boolean {
  return PERMISSIONS[role]?.[module]?.includes(action) ?? false;
}
