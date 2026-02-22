import type { VSMStep, FiveSAudit, KanbanItem, MudaCategory } from '@/types/analytics';

// VSM: 7 adim (Mal Kabul → Sevkiyat Yukleme)
export const MOCK_VSM_STEPS: VSMStep[] = [
  {
    id: 'vsm-1',
    stepNumber: 1,
    processName: 'Mal Kabul & Bosaltma',
    cycleTimeMinutes: 45,
    waitTimeMinutes: 30,
    valueAddedPercentage: 60,
    operators: 3,
    wip: 12,
    notes: 'Rampa kapasitesi: 2 arac ayni anda',
  },
  {
    id: 'vsm-2',
    stepNumber: 2,
    processName: 'Kalite Kontrol',
    cycleTimeMinutes: 30,
    waitTimeMinutes: 120,
    valueAddedPercentage: 80,
    operators: 2,
    wip: 8,
    notes: 'Numune alma orani: %10',
  },
  {
    id: 'vsm-3',
    stepNumber: 3,
    processName: 'Yerlesim (Putaway)',
    cycleTimeMinutes: 25,
    waitTimeMinutes: 45,
    valueAddedPercentage: 70,
    operators: 2,
    wip: 15,
    notes: 'Forklift ve el arabasi',
  },
  {
    id: 'vsm-4',
    stepNumber: 4,
    processName: 'Depolama',
    cycleTimeMinutes: 0,
    waitTimeMinutes: 2880,
    valueAddedPercentage: 0,
    operators: 0,
    wip: 450,
    notes: 'Ortalama depolama suresi: 2 gun',
  },
  {
    id: 'vsm-5',
    stepNumber: 5,
    processName: 'Siparis Toplama',
    cycleTimeMinutes: 35,
    waitTimeMinutes: 60,
    valueAddedPercentage: 75,
    operators: 4,
    wip: 20,
    notes: 'Toplu toplama + ayristirma',
  },
  {
    id: 'vsm-6',
    stepNumber: 6,
    processName: 'Paketleme & Etiketleme',
    cycleTimeMinutes: 20,
    waitTimeMinutes: 15,
    valueAddedPercentage: 85,
    operators: 3,
    wip: 10,
    notes: 'Otomatik etiket yazici',
  },
  {
    id: 'vsm-7',
    stepNumber: 7,
    processName: 'Sevkiyat Yukleme',
    cycleTimeMinutes: 30,
    waitTimeMinutes: 90,
    valueAddedPercentage: 55,
    operators: 2,
    wip: 25,
    notes: 'Ramp bekleme suresi dahil',
  },
];

// 5S: 6 ay aylik denetim (her bolge icin)
export const MOCK_FIVE_S_AUDITS: FiveSAudit[] = [
  { id: '5s-1', auditDate: '2025-09-15', area: 'Hammadde Deposu', sort: 3, setInOrder: 2, shine: 3, standardize: 2, sustain: 2, total: 12, auditor: 'Ahmet Yilmaz' },
  { id: '5s-2', auditDate: '2025-10-15', area: 'Hammadde Deposu', sort: 3, setInOrder: 3, shine: 3, standardize: 3, sustain: 2, total: 14, auditor: 'Ahmet Yilmaz' },
  { id: '5s-3', auditDate: '2025-11-15', area: 'Hammadde Deposu', sort: 4, setInOrder: 3, shine: 4, standardize: 3, sustain: 3, total: 17, auditor: 'Ahmet Yilmaz' },
  { id: '5s-4', auditDate: '2025-12-15', area: 'Hammadde Deposu', sort: 4, setInOrder: 4, shine: 4, standardize: 3, sustain: 3, total: 18, auditor: 'Ahmet Yilmaz' },
  { id: '5s-5', auditDate: '2026-01-15', area: 'Hammadde Deposu', sort: 4, setInOrder: 4, shine: 4, standardize: 4, sustain: 3, total: 19, auditor: 'Ahmet Yilmaz' },
  { id: '5s-6', auditDate: '2026-02-15', area: 'Hammadde Deposu', sort: 5, setInOrder: 4, shine: 4, standardize: 4, sustain: 4, total: 21, auditor: 'Ahmet Yilmaz' },

  { id: '5s-7', auditDate: '2025-09-15', area: 'Mamul Deposu', sort: 3, setInOrder: 3, shine: 2, standardize: 2, sustain: 2, total: 12, auditor: 'Mehmet Kaya' },
  { id: '5s-8', auditDate: '2025-10-15', area: 'Mamul Deposu', sort: 3, setInOrder: 3, shine: 3, standardize: 3, sustain: 2, total: 14, auditor: 'Mehmet Kaya' },
  { id: '5s-9', auditDate: '2025-11-15', area: 'Mamul Deposu', sort: 4, setInOrder: 4, shine: 3, standardize: 3, sustain: 3, total: 17, auditor: 'Mehmet Kaya' },
  { id: '5s-10', auditDate: '2025-12-15', area: 'Mamul Deposu', sort: 4, setInOrder: 4, shine: 4, standardize: 3, sustain: 3, total: 18, auditor: 'Mehmet Kaya' },
  { id: '5s-11', auditDate: '2026-01-15', area: 'Mamul Deposu', sort: 5, setInOrder: 4, shine: 4, standardize: 4, sustain: 4, total: 21, auditor: 'Mehmet Kaya' },
  { id: '5s-12', auditDate: '2026-02-15', area: 'Mamul Deposu', sort: 5, setInOrder: 5, shine: 4, standardize: 4, sustain: 4, total: 22, auditor: 'Mehmet Kaya' },
];

// Kanban: 12 ornek kart
export const MOCK_KANBAN_ITEMS: KanbanItem[] = [
  { id: 'k-1', title: 'IPL-PMK-30 Stok Yenileme', description: 'Pamuk iplik stok seviyesi kritik - yeni siparis ver', columnStatus: 'done', priority: 'urgent', referenceType: 'purchase_order', assignee: 'Ahmet Y.', createdAt: '2026-02-15T08:00:00', updatedAt: '2026-02-20T16:00:00' },
  { id: 'k-2', title: 'SP001-SYH-M Toplama', description: 'SO-2026-089 icin 120 cift toplama', columnStatus: 'done', priority: 'high', referenceType: 'sales_order', referenceId: 'SO-2026-089', assignee: 'Fatma O.', createdAt: '2026-02-20T09:00:00', updatedAt: '2026-02-21T11:00:00' },
  { id: 'k-3', title: 'Bolge A Raf Duzenleme', description: '5S denetimi oncesi raf duzenleme', columnStatus: 'testing', priority: 'normal', assignee: 'Mehmet K.', createdAt: '2026-02-19T10:00:00', updatedAt: '2026-02-21T14:00:00' },
  { id: 'k-4', title: 'CR002-LCV-L Kalite Kontrol', description: 'Yeni parti uretim kontrolu', columnStatus: 'in_progress', priority: 'high', referenceType: 'quality_inspection', assignee: 'Fatma O.', createdAt: '2026-02-21T08:30:00', updatedAt: '2026-02-22T09:00:00' },
  { id: 'k-5', title: 'Forklift Bakim', description: 'Aylik forklift bakim kontrolu', columnStatus: 'in_progress', priority: 'normal', assignee: 'Ali D.', createdAt: '2026-02-22T07:00:00', updatedAt: '2026-02-22T10:00:00' },
  { id: 'k-6', title: 'GR-2026-012 Kabul', description: 'Polyester iplik teslimat kontrolu ve yerlesim', columnStatus: 'review', priority: 'high', referenceType: 'goods_receipt', referenceId: 'GR-2026-012', assignee: 'Ahmet Y.', createdAt: '2026-02-22T08:00:00', updatedAt: '2026-02-22T11:00:00' },
  { id: 'k-7', title: 'Stok Sayim Hazirligi', description: 'Mart ayi dongusal stok sayimi planlama', columnStatus: 'todo', priority: 'normal', assignee: 'Mehmet K.', createdAt: '2026-02-22T09:00:00', updatedAt: '2026-02-22T09:00:00' },
  { id: 'k-8', title: 'SO-2026-091 Paketleme', description: '96 cift medikal corap paketleme', columnStatus: 'todo', priority: 'high', referenceType: 'sales_order', referenceId: 'SO-2026-091', assignee: 'Zeynep A.', createdAt: '2026-02-22T10:00:00', updatedAt: '2026-02-22T10:00:00' },
  { id: 'k-9', title: 'Boya Deposu Sicaklik Kontrolu', description: 'Sicaklik sensoru kalibrasyonu', columnStatus: 'backlog', priority: 'low', createdAt: '2026-02-20T14:00:00', updatedAt: '2026-02-20T14:00:00' },
  { id: 'k-10', title: 'Ambalaj Malzeme Siparisi', description: 'Polietilen ve karton stok yenileme', columnStatus: 'backlog', priority: 'normal', referenceType: 'purchase_order', createdAt: '2026-02-21T11:00:00', updatedAt: '2026-02-21T11:00:00' },
  { id: 'k-11', title: 'Etiket Yazici Arizasi', description: 'Paketleme hattinda etiket yazici bakim', columnStatus: 'todo', priority: 'urgent', assignee: 'Ali D.', createdAt: '2026-02-22T11:00:00', updatedAt: '2026-02-22T11:00:00' },
  { id: 'k-12', title: 'Yeni Raf Sistemi Kurulum', description: 'C bolgesi icin yeni raf sistemi montaj', columnStatus: 'backlog', priority: 'low', createdAt: '2026-02-18T09:00:00', updatedAt: '2026-02-18T09:00:00' },
];

// 7 israf (Muda) kategorisi
export const MOCK_MUDA_CATEGORIES: MudaCategory[] = [
  { id: 'muda-1', wasteType: 'Transport', wasteTypeTr: 'Tasima', currentScore: 7, targetScore: 3, description: 'Gereksiz malzeme tasima mesafeleri', improvementSuggestion: 'Depo yerlesim optimizasyonu, zone-bazli yerlestirme' },
  { id: 'muda-2', wasteType: 'Inventory', wasteTypeTr: 'Fazla Stok', currentScore: 6, targetScore: 3, description: 'Asiri guvenlik stogu ve yavas hareket eden kalemler', improvementSuggestion: 'ABC analizi ile stok politikasi, EOQ uygulamasi' },
  { id: 'muda-3', wasteType: 'Motion', wasteTypeTr: 'Gereksiz Hareket', currentScore: 5, targetScore: 2, description: 'Operator yurume mesafesi ve ergonomi', improvementSuggestion: 'Toplama rotasi optimizasyonu, ergonomik is istasyonu' },
  { id: 'muda-4', wasteType: 'Waiting', wasteTypeTr: 'Bekleme', currentScore: 8, targetScore: 3, description: 'Rampa bekleme, kalite kontrol kuyrugu', improvementSuggestion: 'Randevulu teslimat, paralel kalite kontrol hatlari' },
  { id: 'muda-5', wasteType: 'Overproduction', wasteTypeTr: 'Fazla Uretim', currentScore: 4, targetScore: 2, description: 'Tahmin hatalarindan kaynaklanan fazla uretim', improvementSuggestion: 'Talep tahmini iyilestirme, kanban sistemi' },
  { id: 'muda-6', wasteType: 'Overprocessing', wasteTypeTr: 'Gereksiz Islem', currentScore: 3, targetScore: 1, description: 'Tekrarlanan kontrol ve veri girisi', improvementSuggestion: 'Barkod otomasyonu, WMS sistemi entegrasyonu' },
  { id: 'muda-7', wasteType: 'Defects', wasteTypeTr: 'Kusurlar', currentScore: 5, targetScore: 2, description: 'Kalite hatalari, iade ve yeniden isleme', improvementSuggestion: 'SPC uygulamasi, kök neden analizi' },
];
