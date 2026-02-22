-- =====================================================
-- SEED DATA FOR SOCK FACTORY WMS
-- =====================================================

DO $$
DECLARE
  -- Category IDs
  cat_spor UUID := gen_random_uuid();
  cat_klasik UUID := gen_random_uuid();
  cat_gunluk UUID := gen_random_uuid();
  cat_termal UUID := gen_random_uuid();
  cat_medikal UUID := gen_random_uuid();
  cat_cocuk UUID := gen_random_uuid();

  -- Color IDs
  clr_siyah UUID := gen_random_uuid();
  clr_beyaz UUID := gen_random_uuid();
  clr_lacivert UUID := gen_random_uuid();
  clr_gri UUID := gen_random_uuid();
  clr_kahve UUID := gen_random_uuid();
  clr_kirmizi UUID := gen_random_uuid();
  clr_mavi UUID := gen_random_uuid();
  clr_yesil UUID := gen_random_uuid();
  clr_pembe UUID := gen_random_uuid();
  clr_turuncu UUID := gen_random_uuid();

  -- Size IDs
  sz_xs UUID := gen_random_uuid();
  sz_s UUID := gen_random_uuid();
  sz_m UUID := gen_random_uuid();
  sz_l UUID := gen_random_uuid();
  sz_xl UUID := gen_random_uuid();

  -- Model IDs
  mdl_sp001 UUID := gen_random_uuid();
  mdl_sp002 UUID := gen_random_uuid();
  mdl_cr001 UUID := gen_random_uuid();
  mdl_cr002 UUID := gen_random_uuid();
  mdl_cd001 UUID := gen_random_uuid();
  mdl_cd002 UUID := gen_random_uuid();
  mdl_tr001 UUID := gen_random_uuid();
  mdl_tr002 UUID := gen_random_uuid();
  mdl_md001 UUID := gen_random_uuid();
  mdl_md002 UUID := gen_random_uuid();
  mdl_ck001 UUID := gen_random_uuid();
  mdl_ck002 UUID := gen_random_uuid();

  -- Supplier IDs
  sup_abc UUID := gen_random_uuid();
  sup_mega UUID := gen_random_uuid();
  sup_renkli UUID := gen_random_uuid();
  sup_etiket UUID := gen_random_uuid();
  sup_ambalaj UUID := gen_random_uuid();

  -- Raw Material IDs
  rm_pamuk30 UUID := gen_random_uuid();
  rm_pamuk20 UUID := gen_random_uuid();
  rm_polyester UUID := gen_random_uuid();
  rm_yun UUID := gen_random_uuid();
  rm_naylon UUID := gen_random_uuid();
  rm_spandex UUID := gen_random_uuid();
  rm_elastik UUID := gen_random_uuid();
  rm_dikis UUID := gen_random_uuid();
  rm_boya_siyah UUID := gen_random_uuid();
  rm_boya_laci UUID := gen_random_uuid();
  rm_apre UUID := gen_random_uuid();
  rm_yumusatici UUID := gen_random_uuid();
  rm_etiket UUID := gen_random_uuid();
  rm_poset UUID := gen_random_uuid();
  rm_kutu UUID := gen_random_uuid();

  -- Warehouse/Zone IDs
  wh_main UUID := gen_random_uuid();
  zone_a UUID := gen_random_uuid();
  zone_b UUID := gen_random_uuid();
  zone_c UUID := gen_random_uuid();
  zone_d UUID := gen_random_uuid();
  zone_e UUID := gen_random_uuid();
  zone_f UUID := gen_random_uuid();

  -- Location IDs (selected for referencing)
  loc_a01 UUID := gen_random_uuid();
  loc_a02 UUID := gen_random_uuid();
  loc_a03 UUID := gen_random_uuid();
  loc_a04 UUID := gen_random_uuid();
  loc_a05 UUID := gen_random_uuid();
  loc_a06 UUID := gen_random_uuid();
  loc_b01 UUID := gen_random_uuid();
  loc_b02 UUID := gen_random_uuid();
  loc_b03 UUID := gen_random_uuid();
  loc_b04 UUID := gen_random_uuid();
  loc_b05 UUID := gen_random_uuid();
  loc_b06 UUID := gen_random_uuid();
  loc_c01 UUID := gen_random_uuid();
  loc_d01 UUID := gen_random_uuid();
  loc_e01 UUID := gen_random_uuid();

  -- Product IDs (selected)
  prd_sp001_syh_m UUID := gen_random_uuid();
  prd_sp001_syh_l UUID := gen_random_uuid();
  prd_sp001_byz_m UUID := gen_random_uuid();
  prd_cr001_lcv_m UUID := gen_random_uuid();
  prd_cr001_lcv_l UUID := gen_random_uuid();
  prd_cd001_gri_s UUID := gen_random_uuid();
  prd_tr001_khv_l UUID := gen_random_uuid();
  prd_md001_byz_m UUID := gen_random_uuid();
  prd_ck001_mvi_s UUID := gen_random_uuid();

  -- Customer IDs
  cst_beymen UUID := gen_random_uuid();
  cst_koton UUID := gen_random_uuid();
  cst_lcw UUID := gen_random_uuid();
  cst_flo UUID := gen_random_uuid();
  cst_decathlon UUID := gen_random_uuid();

  -- PO IDs
  po1 UUID := gen_random_uuid();
  po2 UUID := gen_random_uuid();
  po3 UUID := gen_random_uuid();
  pol1 UUID := gen_random_uuid();
  pol2 UUID := gen_random_uuid();
  pol3 UUID := gen_random_uuid();
  pol4 UUID := gen_random_uuid();
  pol5 UUID := gen_random_uuid();
  pol6 UUID := gen_random_uuid();
  pol7 UUID := gen_random_uuid();

  -- SO IDs
  so1 UUID := gen_random_uuid();
  so2 UUID := gen_random_uuid();
  so3 UUID := gen_random_uuid();

  -- GR IDs
  gr1 UUID := gen_random_uuid();
  gr2 UUID := gen_random_uuid();

  -- SC IDs
  sc1 UUID := gen_random_uuid();

BEGIN
  -- =====================================================
  -- PRODUCT CATEGORIES
  -- =====================================================
  INSERT INTO product_categories (id, name, description) VALUES
    (cat_spor, 'Spor', 'Atletik ve spor coraplar'),
    (cat_klasik, 'Klasik', 'Klasik ve is coraplar'),
    (cat_gunluk, 'Gunluk', 'Gunluk kullanim coraplari'),
    (cat_termal, 'Termal', 'Termal ve kis coraplari'),
    (cat_medikal, 'Medikal', 'Medikal ve saglik coraplari'),
    (cat_cocuk, 'Cocuk', 'Cocuk coraplari');

  -- =====================================================
  -- PRODUCT COLORS
  -- =====================================================
  INSERT INTO product_colors (id, name, hex_code, pantone_code) VALUES
    (clr_siyah, 'Siyah', '#000000', '19-0303 TCX'),
    (clr_beyaz, 'Beyaz', '#FFFFFF', '11-0601 TCX'),
    (clr_lacivert, 'Lacivert', '#1B2A4A', '19-4052 TCX'),
    (clr_gri, 'Gri', '#808080', '17-4402 TCX'),
    (clr_kahve, 'Kahverengi', '#8B4513', '19-1230 TCX'),
    (clr_kirmizi, 'Kirmizi', '#DC2626', '18-1763 TCX'),
    (clr_mavi, 'Mavi', '#2563EB', '18-4252 TCX'),
    (clr_yesil, 'Yesil', '#16A34A', '17-6153 TCX'),
    (clr_pembe, 'Pembe', '#EC4899', '17-2127 TCX'),
    (clr_turuncu, 'Turuncu', '#EA580C', '16-1462 TCX');

  -- =====================================================
  -- PRODUCT SIZES
  -- =====================================================
  INSERT INTO product_sizes (id, name, eu_range, us_range, uk_range, sort_order) VALUES
    (sz_xs, 'XS', '35-37', '4-6', '3-5', 1),
    (sz_s, 'S', '38-40', '6.5-8.5', '5.5-7.5', 2),
    (sz_m, 'M', '41-43', '9-11', '8-10', 3),
    (sz_l, 'L', '44-46', '11.5-13', '10.5-12', 4),
    (sz_xl, 'XL', '47-49', '13.5-15', '12.5-14', 5);

  -- =====================================================
  -- PRODUCT MODELS
  -- =====================================================
  INSERT INTO product_models (id, category_id, code, name, description, material_composition, sock_type, weight_per_pair_grams) VALUES
    (mdl_sp001, cat_spor, 'SP-001', 'Sport Pro', 'Profesyonel spor corabi', '{"cotton":80,"polyester":15,"spandex":5}', 'ankle', 45),
    (mdl_sp002, cat_spor, 'SP-002', 'Sport Elite', 'Elit performans corabi', '{"cotton":70,"polyester":20,"spandex":10}', 'crew', 55),
    (mdl_cr001, cat_klasik, 'CR-001', 'Klasik Crew', 'Klasik is corabi', '{"cotton":85,"polyester":12,"spandex":3}', 'crew', 50),
    (mdl_cr002, cat_klasik, 'CR-002', 'Klasik Ince', 'Ince klasik corap', '{"cotton":75,"polyester":20,"spandex":5}', 'crew', 35),
    (mdl_cd001, cat_gunluk, 'CD-001', 'Comfort Daily', 'Gunluk konfor corabi', '{"cotton":80,"polyester":15,"spandex":5}', 'ankle', 40),
    (mdl_cd002, cat_gunluk, 'CD-002', 'Urban Style', 'Modern gorunmez corap', '{"cotton":75,"nylon":20,"spandex":5}', 'no_show', 25),
    (mdl_tr001, cat_termal, 'TR-001', 'Termal Plus', 'Termal kis corabi', '{"wool":60,"acrylic":30,"nylon":10}', 'crew', 80),
    (mdl_tr002, cat_termal, 'TR-002', 'Termal Extreme', 'Ekstra sicak diz alti', '{"wool":70,"acrylic":20,"nylon":10}', 'knee_high', 120),
    (mdl_md001, cat_medikal, 'MD-001', 'Medikal Destek', 'Kompresyon corabi', '{"nylon":60,"spandex":30,"cotton":10}', 'knee_high', 65),
    (mdl_md002, cat_medikal, 'MD-002', 'Medikal Diyabet', 'Diyabet corabi', '{"cotton":90,"spandex":5,"nylon":5}', 'crew', 55),
    (mdl_ck001, cat_cocuk, 'CK-001', 'Cocuk Fun', 'Eglenceli cocuk corabi', '{"cotton":80,"polyester":15,"spandex":5}', 'ankle', 25),
    (mdl_ck002, cat_cocuk, 'CK-002', 'Cocuk School', 'Okul corabi', '{"cotton":85,"polyester":12,"spandex":3}', 'crew', 30);

  -- =====================================================
  -- SUPPLIERS
  -- =====================================================
  INSERT INTO suppliers (id, code, name, contact_person, email, phone, address, city, country, tax_id, payment_terms, lead_time_days, quality_rating, notes) VALUES
    (sup_abc, 'SUP-001', 'ABC Iplik A.S.', 'Ahmet Yilmaz', 'ahmet@abciplik.com', '+90 212 555 0101', 'Organize Sanayi Bolgesi No:15', 'Istanbul', 'Turkiye', '1234567890', 'net_30', 14, 4.50, 'Ana pamuk ve polyester tedarikci'),
    (sup_mega, 'SUP-002', 'Mega Elastik Ltd.', 'Mehmet Demir', 'mehmet@megaelastik.com', '+90 224 555 0202', 'Sanayi Caddesi No:42', 'Bursa', 'Turkiye', '2345678901', 'net_30', 7, 4.20, 'Elastik ve lastik bant tedarikci'),
    (sup_renkli, 'SUP-003', 'Renkli Boya Sanayi', 'Ayse Kara', 'ayse@renkliboya.com', '+90 258 555 0303', 'Kimya OSB No:8', 'Denizli', 'Turkiye', '3456789012', 'net_60', 10, 4.00, 'Tekstil boyasi ve kimyasal tedarikci'),
    (sup_etiket, 'SUP-004', 'Etiket Plus', 'Fatma Ozturk', 'fatma@etiketplus.com', '+90 212 555 0404', 'Matbaacilar Sitesi No:23', 'Istanbul', 'Turkiye', '4567890123', 'net_15', 5, 4.80, 'Dokuma etiket ve hang tag tedarikci'),
    (sup_ambalaj, 'SUP-005', 'Ambalaj Dunyasi', 'Ali Can', 'ali@ambalajdunyasi.com', '+90 312 555 0505', 'Ambalaj Sanayi Bolgesi No:7', 'Ankara', 'Turkiye', '5678901234', 'prepaid', 3, 4.60, 'Poset, kutu ve ambalaj malzemesi');

  -- =====================================================
  -- RAW MATERIALS
  -- =====================================================
  INSERT INTO raw_materials (id, code, name, category, unit_of_measure, color, specification, min_stock_level, max_stock_level, reorder_quantity, lead_time_days, unit_cost, supplier_id) VALUES
    (rm_pamuk30, 'RM-COT-001', 'Pamuk Iplik 30/1', 'yarn', 'kg', NULL, 'Penye pamuk, 30/1 Ne, ring egirme', 500, 5000, 1000, 14, 85.00, sup_abc),
    (rm_pamuk20, 'RM-COT-002', 'Pamuk Iplik 20/1', 'yarn', 'kg', NULL, 'Penye pamuk, 20/1 Ne, kalin iplik', 300, 3000, 800, 14, 75.00, sup_abc),
    (rm_polyester, 'RM-PES-001', 'Polyester Iplik 150D', 'yarn', 'kg', NULL, '150 Denier polyester filament', 200, 2000, 500, 14, 45.00, sup_abc),
    (rm_yun, 'RM-WOL-001', 'Yun Iplik 28/2', 'yarn', 'kg', NULL, 'Merino yun, 28/2 Nm, superwash', 100, 1000, 300, 21, 250.00, sup_abc),
    (rm_naylon, 'RM-NYL-001', 'Naylon Iplik 70D', 'yarn', 'kg', NULL, '70 Denier naylon 6.6', 100, 1000, 200, 14, 120.00, sup_abc),
    (rm_spandex, 'RM-SPX-001', 'Spandex/Likra 20D', 'elastic', 'kg', NULL, '20 Denier spandex/lycra', 50, 500, 100, 7, 350.00, sup_mega),
    (rm_elastik, 'RM-ELS-001', 'Elastik Bant 8mm', 'elastic', 'meters', NULL, '8mm genislik, orta sertlik', 5000, 50000, 10000, 7, 0.25, sup_mega),
    (rm_dikis, 'RM-THR-001', 'Dikiş Ipligi', 'yarn', 'kg', NULL, 'Polyester dikiş ipligi, 40/2', 50, 500, 100, 7, 65.00, sup_mega),
    (rm_boya_siyah, 'RM-DYE-001', 'Pantone Boya - Siyah', 'dye', 'liters', 'Siyah', 'Reaktif boya, 19-0303 TCX', 100, 1000, 200, 10, 45.00, sup_renkli),
    (rm_boya_laci, 'RM-DYE-002', 'Pantone Boya - Lacivert', 'dye', 'liters', 'Lacivert', 'Reaktif boya, 19-4052 TCX', 100, 1000, 200, 10, 48.00, sup_renkli),
    (rm_apre, 'RM-CHM-001', 'Apre Maddesi', 'chemical', 'liters', NULL, 'Silikon bazli yumusatma apresi', 50, 500, 100, 10, 35.00, sup_renkli),
    (rm_yumusatici, 'RM-CHM-002', 'Yumusatici', 'chemical', 'liters', NULL, 'Katyonik yumusatici', 50, 500, 100, 10, 28.00, sup_renkli),
    (rm_etiket, 'RM-LBL-001', 'Dokuma Etiket', 'label', 'pieces', NULL, 'Polyester dokuma etiket, 2x4cm', 10000, 100000, 20000, 5, 0.15, sup_etiket),
    (rm_poset, 'RM-PKG-001', 'OPP Poset', 'packaging', 'pieces', NULL, 'Seffaf OPP poset, 12x18cm', 10000, 100000, 25000, 3, 0.08, sup_ambalaj),
    (rm_kutu, 'RM-PKG-002', 'Karton Kutu', 'packaging', 'pieces', NULL, 'E dalga oluklu kutu, 40x30x25cm', 1000, 10000, 2000, 3, 2.50, sup_ambalaj);

  -- =====================================================
  -- BILL OF MATERIALS (Sport Pro)
  -- =====================================================
  INSERT INTO bill_of_materials (product_model_id, raw_material_id, quantity_per_dozen, unit_of_measure, waste_percentage, notes) VALUES
    (mdl_sp001, rm_pamuk30, 1.2000, 'kg', 3.00, 'Ana iplik'),
    (mdl_sp001, rm_polyester, 0.3000, 'kg', 2.00, 'Takviye iplik'),
    (mdl_sp001, rm_spandex, 0.0800, 'kg', 1.00, 'Esneklik'),
    (mdl_sp001, rm_elastik, 3.6000, 'meters', 5.00, 'Bilek elastigi'),
    (mdl_sp001, rm_dikis, 0.0500, 'kg', 2.00, 'Burun kapama'),
    (mdl_sp001, rm_etiket, 12.0000, 'pieces', 0.00, 'Marka etiketi'),
    (mdl_sp001, rm_poset, 6.0000, 'pieces', 2.00, 'Cift paketleme'),
    (mdl_sp001, rm_kutu, 0.2500, 'pieces', 0.00, 'Dis ambalaj');

  -- =====================================================
  -- WAREHOUSE
  -- =====================================================
  INSERT INTO warehouses (id, code, name, address, total_area_sqm, warehouse_type) VALUES
    (wh_main, 'WH-01', 'Ana Depo', 'Fabrika Yolu No:42, Organize Sanayi Bolgesi, Denizli', 2500.00, 'mixed');

  -- =====================================================
  -- WAREHOUSE ZONES
  -- =====================================================
  INSERT INTO warehouse_zones (id, warehouse_id, code, name, zone_type, temperature_controlled, area_sqm) VALUES
    (zone_a, wh_main, 'A', 'Hammadde Deposu', 'storage', true, 600),
    (zone_b, wh_main, 'B', 'Mamul Deposu', 'storage', false, 900),
    (zone_c, wh_main, 'C', 'Kabul Alani', 'receiving', false, 200),
    (zone_d, wh_main, 'D', 'Sevkiyat Alani', 'shipping', false, 200),
    (zone_e, wh_main, 'E', 'Karantina Alani', 'quarantine', false, 100),
    (zone_f, wh_main, 'F', 'Iade Alani', 'returns', false, 100);

  -- =====================================================
  -- WAREHOUSE LOCATIONS
  -- =====================================================
  -- Zone A locations (raw materials)
  INSERT INTO warehouse_locations (id, zone_id, code, rack, shelf_level, bin, location_type, max_weight_kg, is_occupied, sort_order) VALUES
    (loc_a01, zone_a, 'A-01-01-01', '01', '01', '01', 'bulk', 500, true, 1),
    (loc_a02, zone_a, 'A-01-01-02', '01', '01', '02', 'bulk', 500, true, 2),
    (loc_a03, zone_a, 'A-01-02-01', '01', '02', '01', 'bulk', 400, true, 3),
    (loc_a04, zone_a, 'A-01-02-02', '01', '02', '02', 'bulk', 400, true, 4),
    (loc_a05, zone_a, 'A-01-03-01', '01', '03', '01', 'bulk', 300, true, 5),
    (loc_a06, zone_a, 'A-01-03-02', '01', '03', '02', 'bulk', 300, false, 6);
  INSERT INTO warehouse_locations (zone_id, code, rack, shelf_level, bin, location_type, max_weight_kg, is_occupied, sort_order) VALUES
    (zone_a, 'A-02-01-01', '02', '01', '01', 'bulk', 500, true, 7),
    (zone_a, 'A-02-01-02', '02', '01', '02', 'bulk', 500, true, 8),
    (zone_a, 'A-02-02-01', '02', '02', '01', 'bulk', 400, true, 9),
    (zone_a, 'A-02-02-02', '02', '02', '02', 'bulk', 400, false, 10),
    (zone_a, 'A-02-03-01', '02', '03', '01', 'bulk', 300, false, 11),
    (zone_a, 'A-02-03-02', '02', '03', '02', 'bulk', 300, false, 12),
    (zone_a, 'A-03-01-01', '03', '01', '01', 'pallet', 1000, true, 13),
    (zone_a, 'A-03-01-02', '03', '01', '02', 'pallet', 1000, false, 14),
    (zone_a, 'A-03-02-01', '03', '02', '01', 'pallet', 800, true, 15),
    (zone_a, 'A-03-02-02', '03', '02', '02', 'pallet', 800, false, 16);

  -- Zone B locations (finished goods)
  INSERT INTO warehouse_locations (id, zone_id, code, rack, shelf_level, bin, location_type, max_weight_kg, is_occupied, sort_order) VALUES
    (loc_b01, zone_b, 'B-01-01-01', '01', '01', '01', 'pick', 200, true, 17),
    (loc_b02, zone_b, 'B-01-01-02', '01', '01', '02', 'pick', 200, true, 18),
    (loc_b03, zone_b, 'B-01-02-01', '01', '02', '01', 'pick', 200, true, 19),
    (loc_b04, zone_b, 'B-01-02-02', '01', '02', '02', 'pick', 200, true, 20),
    (loc_b05, zone_b, 'B-02-01-01', '02', '01', '01', 'pick', 200, true, 21),
    (loc_b06, zone_b, 'B-02-01-02', '02', '01', '02', 'pick', 200, true, 22);
  INSERT INTO warehouse_locations (zone_id, code, rack, shelf_level, bin, location_type, max_weight_kg, is_occupied, sort_order) VALUES
    (zone_b, 'B-02-02-01', '02', '02', '01', 'pick', 200, true, 23),
    (zone_b, 'B-02-02-02', '02', '02', '02', 'pick', 200, false, 24),
    (zone_b, 'B-03-01-01', '03', '01', '01', 'bulk', 500, true, 25),
    (zone_b, 'B-03-01-02', '03', '01', '02', 'bulk', 500, true, 26),
    (zone_b, 'B-03-02-01', '03', '02', '01', 'bulk', 500, false, 27),
    (zone_b, 'B-03-02-02', '03', '02', '02', 'bulk', 500, false, 28),
    (zone_b, 'B-04-01-01', '04', '01', '01', 'pallet', 1000, true, 29),
    (zone_b, 'B-04-01-02', '04', '01', '02', 'pallet', 1000, false, 30);

  -- Zone C-F locations
  INSERT INTO warehouse_locations (id, zone_id, code, rack, shelf_level, bin, location_type, max_weight_kg, is_occupied, sort_order) VALUES
    (loc_c01, zone_c, 'C-01-01-01', '01', '01', '01', 'floor', 2000, false, 31);
  INSERT INTO warehouse_locations (zone_id, code, rack, shelf_level, bin, location_type, max_weight_kg, is_occupied, sort_order) VALUES
    (zone_c, 'C-01-01-02', '01', '01', '02', 'floor', 2000, false, 32),
    (zone_c, 'C-01-02-01', '01', '02', '01', 'floor', 1000, false, 33),
    (zone_c, 'C-01-02-02', '01', '02', '02', 'floor', 1000, false, 34);
  INSERT INTO warehouse_locations (id, zone_id, code, rack, shelf_level, bin, location_type, max_weight_kg, is_occupied, sort_order) VALUES
    (loc_d01, zone_d, 'D-01-01-01', '01', '01', '01', 'floor', 2000, false, 35);
  INSERT INTO warehouse_locations (zone_id, code, rack, shelf_level, bin, location_type, max_weight_kg, is_occupied, sort_order) VALUES
    (zone_d, 'D-01-01-02', '01', '01', '02', 'floor', 2000, false, 36);
  INSERT INTO warehouse_locations (id, zone_id, code, rack, shelf_level, bin, location_type, max_weight_kg, is_occupied, sort_order) VALUES
    (loc_e01, zone_e, 'E-01-01-01', '01', '01', '01', 'floor', 500, true, 37);
  INSERT INTO warehouse_locations (zone_id, code, rack, shelf_level, bin, location_type, max_weight_kg, is_occupied, sort_order) VALUES
    (zone_f, 'F-01-01-01', '01', '01', '01', 'floor', 500, false, 38);

  -- =====================================================
  -- PRODUCTS (60 SKUs - select models x colors x sizes)
  -- =====================================================
  INSERT INTO products (id, model_id, color_id, size_id, sku, barcode, unit_cost, unit_price, min_stock_level, max_stock_level, reorder_quantity, lead_time_days) VALUES
    -- SP-001 x Siyah x all sizes
    (prd_sp001_syh_m, mdl_sp001, clr_siyah, sz_m, 'SP001-SYH-M', '8690001000013', 12.50, 29.90, 100, 1000, 200, 7),
    (prd_sp001_syh_l, mdl_sp001, clr_siyah, sz_l, 'SP001-SYH-L', '8690001000020', 12.50, 29.90, 100, 1000, 200, 7),
    (gen_random_uuid(), mdl_sp001, clr_siyah, sz_s, 'SP001-SYH-S', '8690001000037', 12.50, 29.90, 80, 800, 150, 7),
    (gen_random_uuid(), mdl_sp001, clr_siyah, sz_xs, 'SP001-SYH-XS', '8690001000044', 12.50, 29.90, 50, 500, 100, 7),
    (gen_random_uuid(), mdl_sp001, clr_siyah, sz_xl, 'SP001-SYH-XL', '8690001000051', 12.50, 29.90, 50, 500, 100, 7),
    -- SP-001 x Beyaz x all sizes
    (prd_sp001_byz_m, mdl_sp001, clr_beyaz, sz_m, 'SP001-BYZ-M', '8690001000068', 12.50, 29.90, 100, 1000, 200, 7),
    (gen_random_uuid(), mdl_sp001, clr_beyaz, sz_l, 'SP001-BYZ-L', '8690001000075', 12.50, 29.90, 80, 800, 150, 7),
    (gen_random_uuid(), mdl_sp001, clr_beyaz, sz_s, 'SP001-BYZ-S', '8690001000082', 12.50, 29.90, 80, 800, 150, 7),
    -- SP-002 x Lacivert
    (gen_random_uuid(), mdl_sp002, clr_lacivert, sz_m, 'SP002-LCV-M', '8690001000099', 14.00, 34.90, 80, 800, 150, 7),
    (gen_random_uuid(), mdl_sp002, clr_lacivert, sz_l, 'SP002-LCV-L', '8690001000105', 14.00, 34.90, 80, 800, 150, 7),
    (gen_random_uuid(), mdl_sp002, clr_lacivert, sz_s, 'SP002-LCV-S', '8690001000112', 14.00, 34.90, 60, 600, 120, 7),
    -- CR-001 x Lacivert x all sizes
    (prd_cr001_lcv_m, mdl_cr001, clr_lacivert, sz_m, 'CR001-LCV-M', '8690001000129', 15.00, 39.90, 100, 1000, 200, 7),
    (prd_cr001_lcv_l, mdl_cr001, clr_lacivert, sz_l, 'CR001-LCV-L', '8690001000136', 15.00, 39.90, 80, 800, 150, 7),
    (gen_random_uuid(), mdl_cr001, clr_lacivert, sz_s, 'CR001-LCV-S', '8690001000143', 15.00, 39.90, 80, 800, 150, 7),
    (gen_random_uuid(), mdl_cr001, clr_lacivert, sz_xs, 'CR001-LCV-XS', '8690001000150', 15.00, 39.90, 50, 500, 100, 7),
    (gen_random_uuid(), mdl_cr001, clr_lacivert, sz_xl, 'CR001-LCV-XL', '8690001000167', 15.00, 39.90, 50, 500, 100, 7),
    -- CR-001 x Siyah
    (gen_random_uuid(), mdl_cr001, clr_siyah, sz_m, 'CR001-SYH-M', '8690001000174', 15.00, 39.90, 100, 1000, 200, 7),
    (gen_random_uuid(), mdl_cr001, clr_siyah, sz_l, 'CR001-SYH-L', '8690001000181', 15.00, 39.90, 80, 800, 150, 7),
    -- CR-002 x Gri
    (gen_random_uuid(), mdl_cr002, clr_gri, sz_m, 'CR002-GRI-M', '8690001000198', 11.00, 24.90, 80, 800, 150, 7),
    (gen_random_uuid(), mdl_cr002, clr_gri, sz_l, 'CR002-GRI-L', '8690001000204', 11.00, 24.90, 80, 800, 150, 7),
    (gen_random_uuid(), mdl_cr002, clr_gri, sz_s, 'CR002-GRI-S', '8690001000211', 11.00, 24.90, 60, 600, 120, 7),
    -- CD-001 x Gri
    (prd_cd001_gri_s, mdl_cd001, clr_gri, sz_s, 'CD001-GRI-S', '8690001000228', 10.00, 19.90, 100, 1200, 250, 5),
    (gen_random_uuid(), mdl_cd001, clr_gri, sz_m, 'CD001-GRI-M', '8690001000235', 10.00, 19.90, 100, 1200, 250, 5),
    (gen_random_uuid(), mdl_cd001, clr_gri, sz_l, 'CD001-GRI-L', '8690001000242', 10.00, 19.90, 80, 1000, 200, 5),
    -- CD-001 x Beyaz
    (gen_random_uuid(), mdl_cd001, clr_beyaz, sz_m, 'CD001-BYZ-M', '8690001000259', 10.00, 19.90, 100, 1200, 250, 5),
    (gen_random_uuid(), mdl_cd001, clr_beyaz, sz_s, 'CD001-BYZ-S', '8690001000266', 10.00, 19.90, 100, 1200, 250, 5),
    -- CD-002 x Siyah
    (gen_random_uuid(), mdl_cd002, clr_siyah, sz_m, 'CD002-SYH-M', '8690001000273', 8.00, 15.90, 150, 2000, 500, 5),
    (gen_random_uuid(), mdl_cd002, clr_siyah, sz_l, 'CD002-SYH-L', '8690001000280', 8.00, 15.90, 120, 1500, 400, 5),
    (gen_random_uuid(), mdl_cd002, clr_siyah, sz_s, 'CD002-SYH-S', '8690001000297', 8.00, 15.90, 120, 1500, 400, 5),
    -- TR-001 x Kahverengi
    (prd_tr001_khv_l, mdl_tr001, clr_kahve, sz_l, 'TR001-KHV-L', '8690001000303', 22.00, 54.90, 50, 500, 100, 10),
    (gen_random_uuid(), mdl_tr001, clr_kahve, sz_m, 'TR001-KHV-M', '8690001000310', 22.00, 54.90, 60, 600, 120, 10),
    (gen_random_uuid(), mdl_tr001, clr_kahve, sz_xl, 'TR001-KHV-XL', '8690001000327', 22.00, 54.90, 30, 300, 80, 10),
    -- TR-001 x Siyah
    (gen_random_uuid(), mdl_tr001, clr_siyah, sz_m, 'TR001-SYH-M', '8690001000334', 22.00, 54.90, 60, 600, 120, 10),
    (gen_random_uuid(), mdl_tr001, clr_siyah, sz_l, 'TR001-SYH-L', '8690001000341', 22.00, 54.90, 50, 500, 100, 10),
    -- TR-002 x Lacivert
    (gen_random_uuid(), mdl_tr002, clr_lacivert, sz_m, 'TR002-LCV-M', '8690001000358', 25.00, 64.90, 40, 400, 80, 10),
    (gen_random_uuid(), mdl_tr002, clr_lacivert, sz_l, 'TR002-LCV-L', '8690001000365', 25.00, 64.90, 40, 400, 80, 10),
    -- MD-001 x Beyaz
    (prd_md001_byz_m, mdl_md001, clr_beyaz, sz_m, 'MD001-BYZ-M', '8690001000372', 20.00, 49.90, 40, 400, 80, 14),
    (gen_random_uuid(), mdl_md001, clr_beyaz, sz_l, 'MD001-BYZ-L', '8690001000389', 20.00, 49.90, 40, 400, 80, 14),
    (gen_random_uuid(), mdl_md001, clr_beyaz, sz_s, 'MD001-BYZ-S', '8690001000396', 20.00, 49.90, 30, 300, 60, 14),
    -- MD-002 x Beyaz
    (gen_random_uuid(), mdl_md002, clr_beyaz, sz_m, 'MD002-BYZ-M', '8690001000402', 18.00, 44.90, 40, 400, 80, 14),
    (gen_random_uuid(), mdl_md002, clr_beyaz, sz_l, 'MD002-BYZ-L', '8690001000419', 18.00, 44.90, 30, 300, 60, 14),
    -- CK-001 x Mavi
    (prd_ck001_mvi_s, mdl_ck001, clr_mavi, sz_s, 'CK001-MVI-S', '8690001000426', 8.50, 17.90, 100, 1500, 300, 5),
    (gen_random_uuid(), mdl_ck001, clr_mavi, sz_xs, 'CK001-MVI-XS', '8690001000433', 8.50, 17.90, 100, 1500, 300, 5),
    -- CK-001 x Pembe
    (gen_random_uuid(), mdl_ck001, clr_pembe, sz_s, 'CK001-PMB-S', '8690001000440', 8.50, 17.90, 80, 1200, 250, 5),
    (gen_random_uuid(), mdl_ck001, clr_pembe, sz_xs, 'CK001-PMB-XS', '8690001000457', 8.50, 17.90, 80, 1200, 250, 5),
    -- CK-002 x Lacivert
    (gen_random_uuid(), mdl_ck002, clr_lacivert, sz_s, 'CK002-LCV-S', '8690001000464', 9.00, 19.90, 80, 1200, 250, 5),
    (gen_random_uuid(), mdl_ck002, clr_lacivert, sz_xs, 'CK002-LCV-XS', '8690001000471', 9.00, 19.90, 80, 1200, 250, 5),
    (gen_random_uuid(), mdl_ck002, clr_lacivert, sz_m, 'CK002-LCV-M', '8690001000488', 9.00, 19.90, 60, 1000, 200, 5);

  -- =====================================================
  -- CUSTOMERS
  -- =====================================================
  INSERT INTO customers (id, code, name, contact_person, email, phone, address, city, country, tax_id, credit_limit) VALUES
    (cst_beymen, 'CST-001', 'Beymen Magazalari', 'Zeynep Aksoy', 'zeynep@beymen.com', '+90 212 555 1001', 'Nisantasi, Abdi Ipekci Cad.', 'Istanbul', 'Turkiye', '9876543210', 500000),
    (cst_koton, 'CST-002', 'Koton Tekstil', 'Burak Sahin', 'burak@koton.com', '+90 212 555 1002', 'Maslak, Buyukdere Cad.', 'Istanbul', 'Turkiye', '8765432109', 300000),
    (cst_lcw, 'CST-003', 'LC Waikiki', 'Elif Yildiz', 'elif@lcwaikiki.com', '+90 212 555 1003', 'Ikitelli OSB', 'Istanbul', 'Turkiye', '7654321098', 750000),
    (cst_flo, 'CST-004', 'FLO Magazacilik', 'Can Arslan', 'can@flo.com.tr', '+90 322 555 1004', 'Sanayi Mahallesi', 'Adana', 'Turkiye', '6543210987', 200000),
    (cst_decathlon, 'CST-005', 'Decathlon Turkiye', 'Marie Dupont', 'marie@decathlon.com.tr', '+90 216 555 1005', 'Atasehir, Finans Merkezi', 'Istanbul', 'Turkiye', '5432109876', 600000);

  -- =====================================================
  -- INVENTORY (Finished Goods + Raw Materials)
  -- =====================================================
  -- Finished goods in Zone B
  INSERT INTO inventory (product_id, location_id, lot_number, quantity, reserved_quantity, quality_status, received_date, unit_cost) VALUES
    (prd_sp001_syh_m, loc_b01, 'FG-SP001-2602-001', 240, 48, 'available', '2026-02-01', 12.50),
    (prd_sp001_syh_l, loc_b01, 'FG-SP001-2602-001', 180, 0, 'available', '2026-02-01', 12.50),
    (prd_sp001_byz_m, loc_b02, 'FG-SP001-2602-002', 120, 24, 'available', '2026-02-05', 12.50),
    (prd_cr001_lcv_m, loc_b03, 'FG-CR001-2602-001', 360, 120, 'available', '2026-01-28', 15.00),
    (prd_cr001_lcv_l, loc_b03, 'FG-CR001-2602-001', 280, 0, 'available', '2026-01-28', 15.00),
    (prd_cd001_gri_s, loc_b04, 'FG-CD001-2602-001', 480, 0, 'available', '2026-02-10', 10.00),
    (prd_tr001_khv_l, loc_b05, 'FG-TR001-2601-001', 96, 24, 'available', '2026-01-15', 22.00),
    (prd_md001_byz_m, loc_b06, 'FG-MD001-2602-001', 48, 0, 'available', '2026-02-12', 20.00),
    (prd_ck001_mvi_s, loc_b04, 'FG-CK001-2602-001', 360, 0, 'available', '2026-02-08', 8.50),
    -- Low stock items (below min_stock_level)
    (prd_sp001_syh_m, loc_b02, 'FG-SP001-2601-003', 35, 0, 'available', '2026-01-10', 12.50),
    -- Quarantine items
    (prd_cr001_lcv_m, loc_e01, 'FG-CR001-2602-003', 24, 0, 'quarantine', '2026-02-18', 15.00);

  -- Raw materials in Zone A
  INSERT INTO inventory (raw_material_id, location_id, lot_number, quantity, quality_status, received_date, unit_cost) VALUES
    (rm_pamuk30, loc_a01, 'RM-COT-2601-001', 1200, 'available', '2026-01-20', 85.00),
    (rm_pamuk30, loc_a02, 'RM-COT-2602-001', 800, 'available', '2026-02-05', 85.00),
    (rm_pamuk20, loc_a03, 'RM-COT-2601-002', 450, 'available', '2026-01-25', 75.00),
    (rm_polyester, loc_a04, 'RM-PES-2602-001', 350, 'available', '2026-02-10', 45.00),
    (rm_yun, loc_a05, 'RM-WOL-2601-001', 180, 'available', '2026-01-15', 250.00),
    (rm_spandex, loc_a01, 'RM-SPX-2602-001', 80, 'available', '2026-02-01', 350.00),
    (rm_elastik, loc_a02, 'RM-ELS-2602-001', 15000, 'available', '2026-02-08', 0.25),
    (rm_dikis, loc_a03, 'RM-THR-2602-001', 120, 'available', '2026-02-03', 65.00),
    (rm_boya_siyah, loc_a04, 'RM-DYE-2601-001', 250, 'available', '2026-01-18', 45.00),
    (rm_boya_laci, loc_a05, 'RM-DYE-2602-001', 180, 'available', '2026-02-05', 48.00),
    (rm_apre, loc_a06, 'RM-CHM-2602-001', 120, 'available', '2026-02-10', 35.00),
    (rm_etiket, loc_a01, 'RM-LBL-2602-001', 45000, 'available', '2026-02-12', 0.15),
    (rm_poset, loc_a02, 'RM-PKG-2602-001', 60000, 'available', '2026-02-15', 0.08),
    (rm_kutu, loc_a03, 'RM-PKG-2602-002', 3500, 'available', '2026-02-15', 2.50),
    -- Low stock raw material
    (rm_naylon, loc_a04, 'RM-NYL-2601-001', 35, 'available', '2026-01-05', 120.00),
    (rm_yumusatici, loc_a05, 'RM-CHM-2601-002', 15, 'available', '2025-12-20', 28.00);

  -- =====================================================
  -- PURCHASE ORDERS
  -- =====================================================
  INSERT INTO purchase_orders (id, po_number, supplier_id, status, order_date, expected_delivery_date, total_amount, currency, notes) VALUES
    (po1, 'PO-2026-0001', sup_abc, 'approved', '2026-02-01', '2026-02-15', 127500.00, 'TRY', 'Subat ayi iplik siparisi'),
    (po2, 'PO-2026-0002', sup_mega, 'received', '2026-01-20', '2026-01-27', 6325.00, 'TRY', 'Elastik ve dikiş ipligi'),
    (po3, 'PO-2026-0003', sup_renkli, 'draft', '2026-02-18', NULL, 15200.00, 'TRY', 'Boya siparisi');

  INSERT INTO purchase_order_lines (id, purchase_order_id, raw_material_id, ordered_quantity, received_quantity, unit_cost, notes) VALUES
    (pol1, po1, rm_pamuk30, 1000, 0, 85.00, 'Penye pamuk'),
    (pol2, po1, rm_polyester, 500, 0, 45.00, 'Polyester filament'),
    (pol3, po1, rm_yun, 100, 0, 250.00, 'Merino yun'),
    (pol4, po2, rm_spandex, 50, 50, 350.00, 'Likra'),
    (pol5, po2, rm_elastik, 20000, 20000, 0.25, '8mm elastik bant'),
    (pol6, po3, rm_boya_siyah, 200, 0, 45.00, 'Siyah reaktif boya'),
    (pol7, po3, rm_boya_laci, 100, 0, 48.00, 'Lacivert reaktif boya');

  -- =====================================================
  -- GOODS RECEIPTS
  -- =====================================================
  INSERT INTO goods_receipts (id, receipt_number, purchase_order_id, supplier_id, received_date, dock_door, status, notes) VALUES
    (gr1, 'GR-2026-0001', po2, sup_mega, '2026-01-27', 'R1', 'completed', 'Tam teslim alindi'),
    (gr2, 'GR-2026-0002', po1, sup_abc, '2026-02-15', 'R1', 'pending', 'Kismi teslim bekleniyor');

  INSERT INTO goods_receipt_lines (goods_receipt_id, po_line_id, raw_material_id, received_quantity, accepted_quantity, rejected_quantity, lot_number, location_id, quality_status) VALUES
    (gr1, pol4, rm_spandex, 50, 50, 0, 'RM-SPX-2602-001', loc_a01, 'available'),
    (gr1, pol5, rm_elastik, 20000, 19800, 200, 'RM-ELS-2602-001', loc_a02, 'available'),
    (gr2, pol1, rm_pamuk30, 500, NULL, 0, 'RM-COT-2602-002', NULL, 'pending_inspection');

  -- =====================================================
  -- SALES ORDERS
  -- =====================================================
  INSERT INTO sales_orders (id, so_number, customer_id, status, order_date, required_date, shipped_date, total_amount, shipping_address, priority, notes) VALUES
    (so1, 'SO-2026-0001', cst_beymen, 'shipped', '2026-02-01', '2026-02-10', '2026-02-08', 14370.00, 'Beymen Nisantasi Magaza, Istanbul', 'high', 'Sezon basi siparisi'),
    (so2, 'SO-2026-0002', cst_koton, 'picking', '2026-02-12', '2026-02-20', NULL, 8970.00, 'Koton Depo, Esenyurt, Istanbul', 'normal', 'Haftalik ikmal'),
    (so3, 'SO-2026-0003', cst_lcw, 'draft', '2026-02-18', '2026-03-01', NULL, 23940.00, 'LC Waikiki Merkez Depo, Ikitelli', 'normal', 'Mart kampanya stoku');

  INSERT INTO sales_order_lines (sales_order_id, product_id, ordered_quantity, picked_quantity, shipped_quantity, unit_price, notes) VALUES
    (so1, prd_sp001_syh_m, 120, 120, 120, 29.90, NULL),
    (so1, prd_cr001_lcv_m, 180, 180, 180, 39.90, NULL),
    (so1, prd_cd001_gri_s, 180, 180, 180, 19.90, NULL),
    (so2, prd_sp001_byz_m, 120, 48, 0, 29.90, NULL),
    (so2, prd_cr001_lcv_l, 180, 0, 0, 39.90, NULL),
    (so3, prd_sp001_syh_m, 240, 0, 0, 29.90, NULL),
    (so3, prd_sp001_syh_l, 240, 0, 0, 29.90, NULL),
    (so3, prd_cr001_lcv_m, 120, 0, 0, 39.90, NULL),
    (so3, prd_cd001_gri_s, 360, 0, 0, 19.90, NULL);

  -- =====================================================
  -- INVENTORY MOVEMENTS (Last 30 days)
  -- =====================================================
  INSERT INTO inventory_movements (movement_type, product_id, raw_material_id, from_location_id, to_location_id, quantity, lot_number, reference_type, reference_id, reason, performed_at) VALUES
    ('receive', NULL, rm_pamuk30, NULL, loc_a01, 1200, 'RM-COT-2601-001', 'goods_receipt', gr1, 'PO-2026-0002 teslim', now() - interval '25 days'),
    ('receive', NULL, rm_spandex, NULL, loc_a01, 50, 'RM-SPX-2602-001', 'goods_receipt', gr1, 'PO-2026-0002 teslim', now() - interval '25 days'),
    ('putaway', NULL, rm_pamuk30, loc_c01, loc_a01, 1200, 'RM-COT-2601-001', 'goods_receipt', gr1, 'Kabul -> Depo', now() - interval '24 days'),
    ('production_in', prd_sp001_syh_m, NULL, NULL, loc_b01, 240, 'FG-SP001-2602-001', 'production', NULL, 'Uretim partisi', now() - interval '20 days'),
    ('production_in', prd_sp001_syh_l, NULL, NULL, loc_b01, 180, 'FG-SP001-2602-001', 'production', NULL, 'Uretim partisi', now() - interval '20 days'),
    ('production_in', prd_cr001_lcv_m, NULL, NULL, loc_b03, 360, 'FG-CR001-2602-001', 'production', NULL, 'Uretim partisi', now() - interval '18 days'),
    ('production_out', NULL, rm_pamuk30, loc_a01, NULL, 150, 'RM-COT-2601-001', 'production', NULL, 'SP001 uretimi icin', now() - interval '20 days'),
    ('pick', prd_sp001_syh_m, NULL, loc_b01, NULL, 120, 'FG-SP001-2602-001', 'sales_order', so1, 'SO-2026-0001 toplama', now() - interval '14 days'),
    ('pick', prd_cr001_lcv_m, NULL, loc_b03, NULL, 180, 'FG-CR001-2602-001', 'sales_order', so1, 'SO-2026-0001 toplama', now() - interval '14 days'),
    ('ship', prd_sp001_syh_m, NULL, loc_d01, NULL, 120, 'FG-SP001-2602-001', 'sales_order', so1, 'SO-2026-0001 sevkiyat', now() - interval '12 days'),
    ('ship', prd_cr001_lcv_m, NULL, loc_d01, NULL, 180, 'FG-CR001-2602-001', 'sales_order', so1, 'SO-2026-0001 sevkiyat', now() - interval '12 days'),
    ('transfer', prd_cr001_lcv_m, NULL, loc_b03, loc_e01, 24, 'FG-CR001-2602-003', NULL, NULL, 'KK red - karantinaya', now() - interval '4 days'),
    ('adjust_in', NULL, rm_etiket, NULL, loc_a01, 5000, 'RM-LBL-2602-001', 'adjustment', NULL, 'Sayim fazlasi', now() - interval '10 days'),
    ('adjust_out', NULL, rm_dikis, loc_a03, NULL, 5, 'RM-THR-2602-001', 'adjustment', NULL, 'Hasarli malzeme', now() - interval '8 days'),
    ('receive', NULL, rm_polyester, NULL, loc_a04, 350, 'RM-PES-2602-001', 'goods_receipt', NULL, 'Spot alis', now() - interval '10 days'),
    ('production_in', prd_cd001_gri_s, NULL, NULL, loc_b04, 480, 'FG-CD001-2602-001', 'production', NULL, 'Uretim partisi', now() - interval '10 days'),
    ('production_in', prd_ck001_mvi_s, NULL, NULL, loc_b04, 360, 'FG-CK001-2602-001', 'production', NULL, 'Uretim partisi', now() - interval '8 days'),
    ('pick', prd_sp001_byz_m, NULL, loc_b02, NULL, 48, 'FG-SP001-2602-002', 'sales_order', so2, 'SO-2026-0002 toplama', now() - interval '2 days'),
    ('receive', NULL, rm_boya_laci, NULL, loc_a05, 180, 'RM-DYE-2602-001', 'purchase_order', po3, 'Boya teslim', now() - interval '15 days'),
    ('transfer', NULL, rm_pamuk30, loc_a01, loc_a02, 800, 'RM-COT-2602-001', NULL, NULL, 'Yer degisim', now() - interval '5 days');

  -- =====================================================
  -- DEFECT TYPES
  -- =====================================================
  INSERT INTO defect_types (code, name, severity, category, description) VALUES
    ('ORE-001', 'Orme Hatasi', 'major', 'knitting', 'Orgu makinesinde desen veya yapı hatasi'),
    ('ORE-002', 'Desenleme Hatasi', 'minor', 'knitting', 'Desen kayması veya renk gecisi hatasi'),
    ('BRL-001', 'Birlestirme Hatasi', 'major', 'linking', 'Burun kapama dikisi duzensiz'),
    ('BRL-002', 'Dikis Acilmasi', 'critical', 'linking', 'Dikis kopma veya acilma'),
    ('BOY-001', 'Renk Uyumsuzlugu', 'major', 'dyeing', 'Pantone eslesmesi disinda renk farki'),
    ('BOY-002', 'Leke', 'minor', 'dyeing', 'Boya lekesi veya iz'),
    ('APR-001', 'Beden Sapmasi', 'major', 'finishing', 'Beden olcusu tolerans disinda'),
    ('APR-002', 'Kalip Bozulmasi', 'minor', 'finishing', 'Presleme sonrasi sekil bozukluğu');

  -- =====================================================
  -- QUALITY INSPECTIONS
  -- =====================================================
  INSERT INTO quality_inspections (inspection_number, reference_type, reference_id, raw_material_id, lot_number, sample_size, inspected_quantity, passed_quantity, failed_quantity, defect_types, overall_result, notes) VALUES
    ('QI-2026-0001', 'goods_receipt', gr1, rm_spandex, 'RM-SPX-2602-001', 10, 50, 50, 0, '{}', 'passed', 'Kalite uygun'),
    ('QI-2026-0003', 'goods_receipt', gr2, rm_pamuk30, 'RM-COT-2602-002', 5, 20, 18, 2, '{"nem_fazlasi": 2}', 'conditional', 'Kurutma sonrasi kabul');

  INSERT INTO quality_inspections (inspection_number, reference_type, reference_id, product_id, lot_number, sample_size, inspected_quantity, passed_quantity, failed_quantity, defect_types, overall_result, notes) VALUES
    ('QI-2026-0002', 'production', NULL, prd_cr001_lcv_m, 'FG-CR001-2602-003', 24, 24, 18, 6, '{"renk_uyumsuzlugu": 4, "orme_hatasi": 2}', 'failed', 'Parti karantinaya alinmistir');

  -- =====================================================
  -- ALERT RULES
  -- =====================================================
  INSERT INTO alert_rules (name, alert_type, entity_type, threshold_value, comparison, notify_roles) VALUES
    ('Dusuk Stok Uyarisi', 'low_stock', 'product', NULL, 'lt', ARRAY['admin', 'warehouse_manager']),
    ('Kapasite Uyarisi', 'capacity', 'zone', 90, 'gt', ARRAY['admin', 'warehouse_manager']),
    ('Vade Dolum Uyarisi', 'expiring', 'raw_material', 30, 'lt', ARRAY['admin', 'warehouse_manager', 'quality_control']);

  -- =====================================================
  -- ALERTS
  -- =====================================================
  INSERT INTO alerts (alert_type, severity, title, message, entity_type, current_value, threshold_value) VALUES
    ('low_stock', 'critical', 'Stok Tukeniyor: Naylon Iplik 70D', 'Mevcut: 35 kg, Minimum: 100 kg. Acil siparis gerekli.', 'raw_material', 35, 100),
    ('low_stock', 'warning', 'Dusuk Stok: SP001-SYH-M (Ek Parti)', 'Mevcut: 35 cift, Minimum: 100. Uretim planlanmali.', 'product', 35, 100),
    ('low_stock', 'warning', 'Dusuk Stok: Yumusatici', 'Mevcut: 15 lt, Minimum: 50 lt.', 'raw_material', 15, 50),
    ('capacity', 'warning', 'Kapasite Uyarisi: Bolge A', 'Hammadde deposu doluluk orani %88.', 'zone', 88, 90),
    ('expiring', 'info', 'Vade Dolum: Pantone Boya Siyah', 'RM-DYE-2601-001 partisi 45 gun icinde son kullanma tarihine ulasacak.', 'raw_material', 45, 30);

  -- =====================================================
  -- STOCK COUNT TASK
  -- =====================================================
  INSERT INTO stock_count_tasks (id, task_number, count_type, status, zone_id, planned_date, started_at, completed_at, notes) VALUES
    (sc1, 'SC-2026-0001', 'cycle', 'completed', zone_b, '2026-02-15', '2026-02-15 09:00:00+03', '2026-02-15 14:30:00+03', 'Subat dongusel sayim - Mamul deposu');

  INSERT INTO stock_count_lines (count_task_id, location_id, product_id, lot_number, system_quantity, counted_quantity, variance_reason, counted_at, is_reconciled) VALUES
    (sc1, loc_b01, prd_sp001_syh_m, 'FG-SP001-2602-001', 240, 238, 'Sayim farki - 2 cift eksik', '2026-02-15 10:00:00+03', true),
    (sc1, loc_b01, prd_sp001_syh_l, 'FG-SP001-2602-001', 180, 180, NULL, '2026-02-15 10:15:00+03', true),
    (sc1, loc_b02, prd_sp001_byz_m, 'FG-SP001-2602-002', 120, 120, NULL, '2026-02-15 10:45:00+03', true),
    (sc1, loc_b03, prd_cr001_lcv_m, 'FG-CR001-2602-001', 360, 358, 'Sayim farki - 2 cift eksik', '2026-02-15 11:30:00+03', true),
    (sc1, loc_b04, prd_cd001_gri_s, 'FG-CD001-2602-001', 480, 480, NULL, '2026-02-15 12:00:00+03', true);

END $$;
