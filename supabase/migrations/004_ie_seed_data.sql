-- IE Analytics Seed Data

-- VSM Process Steps
INSERT INTO vsm_process_steps (step_number, process_name, cycle_time_minutes, wait_time_minutes, va_percentage, operators, wip, notes) VALUES
(1, 'Mal Kabul & Bosaltma', 45, 30, 60, 3, 12, 'Rampa kapasitesi: 2 arac ayni anda'),
(2, 'Kalite Kontrol', 30, 120, 80, 2, 8, 'Numune alma orani: %10'),
(3, 'Yerlesim (Putaway)', 25, 45, 70, 2, 15, 'Forklift ve el arabasi'),
(4, 'Depolama', 0, 2880, 0, 0, 450, 'Ortalama depolama suresi: 2 gun'),
(5, 'Siparis Toplama', 35, 60, 75, 4, 20, 'Toplu toplama + ayristirma'),
(6, 'Paketleme & Etiketleme', 20, 15, 85, 3, 10, 'Otomatik etiket yazici'),
(7, 'Sevkiyat Yukleme', 30, 90, 55, 2, 25, 'Ramp bekleme suresi dahil');

-- 5S Audits
INSERT INTO five_s_audits (audit_date, area, sort_score, set_in_order_score, shine_score, standardize_score, sustain_score, auditor) VALUES
('2025-09-15', 'Hammadde Deposu', 3, 2, 3, 2, 2, 'Ahmet Yilmaz'),
('2025-10-15', 'Hammadde Deposu', 3, 3, 3, 3, 2, 'Ahmet Yilmaz'),
('2025-11-15', 'Hammadde Deposu', 4, 3, 4, 3, 3, 'Ahmet Yilmaz'),
('2025-12-15', 'Hammadde Deposu', 4, 4, 4, 3, 3, 'Ahmet Yilmaz'),
('2026-01-15', 'Hammadde Deposu', 4, 4, 4, 4, 3, 'Ahmet Yilmaz'),
('2026-02-15', 'Hammadde Deposu', 5, 4, 4, 4, 4, 'Ahmet Yilmaz'),
('2025-09-15', 'Mamul Deposu', 3, 3, 2, 2, 2, 'Mehmet Kaya'),
('2025-10-15', 'Mamul Deposu', 3, 3, 3, 3, 2, 'Mehmet Kaya'),
('2025-11-15', 'Mamul Deposu', 4, 4, 3, 3, 3, 'Mehmet Kaya'),
('2025-12-15', 'Mamul Deposu', 4, 4, 4, 3, 3, 'Mehmet Kaya'),
('2026-01-15', 'Mamul Deposu', 5, 4, 4, 4, 4, 'Mehmet Kaya'),
('2026-02-15', 'Mamul Deposu', 5, 5, 4, 4, 4, 'Mehmet Kaya');

-- Kanban Items
INSERT INTO kanban_items (title, description, column_status, priority, reference_type, assignee) VALUES
('IPL-PMK-30 Stok Yenileme', 'Pamuk iplik stok seviyesi kritik', 'done', 'urgent', 'purchase_order', 'Ahmet Y.'),
('SP001-SYH-M Toplama', 'SO-2026-089 icin 120 cift toplama', 'done', 'high', 'sales_order', 'Fatma O.'),
('Bolge A Raf Duzenleme', '5S denetimi oncesi raf duzenleme', 'testing', 'normal', NULL, 'Mehmet K.'),
('CR002-LCV-L Kalite Kontrol', 'Yeni parti uretim kontrolu', 'in_progress', 'high', 'quality_inspection', 'Fatma O.'),
('Forklift Bakim', 'Aylik forklift bakim kontrolu', 'in_progress', 'normal', NULL, 'Ali D.'),
('GR-2026-012 Kabul', 'Polyester iplik teslimat kontrolu', 'review', 'high', 'goods_receipt', 'Ahmet Y.'),
('Stok Sayim Hazirligi', 'Mart ayi dongusal stok sayimi planlama', 'todo', 'normal', NULL, 'Mehmet K.'),
('SO-2026-091 Paketleme', '96 cift medikal corap paketleme', 'todo', 'high', 'sales_order', 'Zeynep A.'),
('Boya Deposu Sicaklik Kontrolu', 'Sicaklik sensoru kalibrasyonu', 'backlog', 'low', NULL, NULL),
('Ambalaj Malzeme Siparisi', 'Polietilen ve karton stok yenileme', 'backlog', 'normal', 'purchase_order', NULL);

-- Comparison Metrics (before/after)
INSERT INTO comparison_metrics (metric_name, metric_name_tr, unit, category, period_type, value, month_index) VALUES
-- Picking Accuracy
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'before', 93.2, 1),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'before', 94.1, 2),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'before', 93.8, 3),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'before', 94.5, 4),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'before', 93.9, 5),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'before', 94.8, 6),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'after', 98.5, 1),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'after', 99.1, 2),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'after', 99.3, 3),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'after', 99.0, 4),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'after', 99.4, 5),
('Picking Accuracy', 'Toplama Dogrulugu', '%', 'accuracy', 'after', 99.2, 6),
-- Order Cycle Time
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'before', 4.8, 1),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'before', 4.2, 2),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'before', 4.6, 3),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'before', 4.4, 4),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'before', 4.5, 5),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'before', 4.7, 6),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'after', 1.9, 1),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'after', 1.7, 2),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'after', 1.8, 3),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'after', 1.6, 4),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'after', 1.9, 5),
('Order Cycle Time', 'Siparis Dongu Suresi', 'saat', 'speed', 'after', 1.8, 6);
