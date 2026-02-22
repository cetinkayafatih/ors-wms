-- WMS (Warehouse Management System) for Sock Factory
-- Initial Schema Migration
-- Generated: 2026-02-22

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE movement_type AS ENUM (
    'receive',
    'putaway',
    'pick',
    'ship',
    'transfer',
    'adjust_in',
    'adjust_out',
    'production_in',
    'production_out',
    'return_in',
    'return_out',
    'count_adjust'
);

CREATE TYPE po_status AS ENUM (
    'draft',
    'submitted',
    'approved',
    'partially_received',
    'received',
    'cancelled',
    'closed'
);

CREATE TYPE so_status AS ENUM (
    'draft',
    'confirmed',
    'picking',
    'picked',
    'packing',
    'packed',
    'shipped',
    'delivered',
    'cancelled',
    'returned'
);

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequential number generator function
CREATE OR REPLACE FUNCTION generate_next_number(
    prefix text,
    table_name text,
    column_name text
)
RETURNS text AS $$
DECLARE
    current_year text;
    next_number int;
    query_text text;
    full_number text;
BEGIN
    current_year := to_char(now(), 'YYYY');

    -- Build dynamic query to get the max number for current year
    query_text := format(
        'SELECT COALESCE(MAX(CAST(substring(%I from ''[0-9]+$'') AS int)), 0) + 1
         FROM %I
         WHERE %I LIKE %L',
        column_name,
        table_name,
        column_name,
        prefix || '-' || current_year || '-%'
    );

    EXECUTE query_text INTO next_number;

    -- Format: PREFIX-YYYY-NNNN (e.g., PO-2026-0001)
    full_number := prefix || '-' || current_year || '-' || lpad(next_number::text, 4, '0');

    RETURN full_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Product Categories
CREATE TABLE product_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_product_categories_is_active ON product_categories(is_active);

-- Product Models
CREATE TABLE product_models (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES product_categories(id),
    code varchar(50) UNIQUE NOT NULL,
    name varchar(200) NOT NULL,
    description text,
    material_composition jsonb,
    sock_type varchar(50),
    weight_per_pair_grams decimal(8,2),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_product_models_category_id ON product_models(category_id);
CREATE INDEX idx_product_models_code ON product_models(code);
CREATE INDEX idx_product_models_is_active ON product_models(is_active);

-- Product Colors
CREATE TABLE product_colors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    hex_code varchar(7),
    pantone_code varchar(20),
    is_active boolean DEFAULT true
);

CREATE INDEX idx_product_colors_is_active ON product_colors(is_active);

-- Product Sizes
CREATE TABLE product_sizes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(20) NOT NULL,
    eu_range varchar(20),
    us_range varchar(20),
    uk_range varchar(20),
    sort_order int
);

CREATE INDEX idx_product_sizes_sort_order ON product_sizes(sort_order);

-- Products (Finished Goods)
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id uuid NOT NULL REFERENCES product_models(id),
    color_id uuid NOT NULL REFERENCES product_colors(id),
    size_id uuid NOT NULL REFERENCES product_sizes(id),
    sku varchar(50) UNIQUE NOT NULL,
    barcode varchar(50) UNIQUE,
    unit_cost decimal(10,2),
    unit_price decimal(10,2),
    min_stock_level int DEFAULT 0,
    max_stock_level int,
    reorder_quantity int,
    lead_time_days int,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(model_id, color_id, size_id)
);

CREATE INDEX idx_products_model_id ON products(model_id);
CREATE INDEX idx_products_color_id ON products(color_id);
CREATE INDEX idx_products_size_id ON products(size_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Suppliers
CREATE TABLE suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(20) UNIQUE NOT NULL,
    name varchar(200) NOT NULL,
    contact_person varchar(200),
    email varchar(200),
    phone varchar(50),
    address text,
    city varchar(100),
    country varchar(100),
    tax_id varchar(50),
    payment_terms varchar(100),
    lead_time_days int,
    quality_rating decimal(3,2),
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

-- Raw Materials
CREATE TABLE raw_materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(50) UNIQUE NOT NULL,
    name varchar(200) NOT NULL,
    category varchar(50),
    unit_of_measure varchar(20),
    color varchar(50),
    specification text,
    min_stock_level decimal(12,2),
    max_stock_level decimal(12,2),
    reorder_quantity decimal(12,2),
    lead_time_days int,
    unit_cost decimal(10,4),
    supplier_id uuid REFERENCES suppliers(id),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_raw_materials_code ON raw_materials(code);
CREATE INDEX idx_raw_materials_supplier_id ON raw_materials(supplier_id);
CREATE INDEX idx_raw_materials_category ON raw_materials(category);
CREATE INDEX idx_raw_materials_is_active ON raw_materials(is_active);

-- Bill of Materials
CREATE TABLE bill_of_materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_model_id uuid NOT NULL REFERENCES product_models(id),
    raw_material_id uuid NOT NULL REFERENCES raw_materials(id),
    quantity_per_dozen decimal(10,4) NOT NULL,
    unit_of_measure varchar(20),
    waste_percentage decimal(5,2) DEFAULT 0,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(product_model_id, raw_material_id)
);

CREATE INDEX idx_bom_product_model_id ON bill_of_materials(product_model_id);
CREATE INDEX idx_bom_raw_material_id ON bill_of_materials(raw_material_id);
CREATE INDEX idx_bom_is_active ON bill_of_materials(is_active);

-- =====================================================
-- WAREHOUSE STRUCTURE
-- =====================================================

-- Warehouses
CREATE TABLE warehouses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(20) UNIQUE NOT NULL,
    name varchar(200) NOT NULL,
    address text,
    total_area_sqm decimal(10,2),
    warehouse_type varchar(50),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_is_active ON warehouses(is_active);

-- Warehouse Zones
CREATE TABLE warehouse_zones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id uuid NOT NULL REFERENCES warehouses(id),
    code varchar(20) NOT NULL,
    name varchar(200) NOT NULL,
    zone_type varchar(50),
    temperature_controlled boolean DEFAULT false,
    area_sqm decimal(10,2),
    is_active boolean DEFAULT true,
    UNIQUE(warehouse_id, code)
);

CREATE INDEX idx_warehouse_zones_warehouse_id ON warehouse_zones(warehouse_id);
CREATE INDEX idx_warehouse_zones_zone_type ON warehouse_zones(zone_type);
CREATE INDEX idx_warehouse_zones_is_active ON warehouse_zones(is_active);

-- Warehouse Locations
CREATE TABLE warehouse_locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id uuid NOT NULL REFERENCES warehouse_zones(id),
    code varchar(50) UNIQUE NOT NULL,
    rack varchar(10),
    shelf_level varchar(10),
    bin varchar(10),
    location_type varchar(50),
    max_weight_kg decimal(10,2),
    max_volume_m3 decimal(10,2),
    is_occupied boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order int,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_warehouse_locations_zone_id ON warehouse_locations(zone_id);
CREATE INDEX idx_warehouse_locations_code ON warehouse_locations(code);
CREATE INDEX idx_warehouse_locations_is_occupied ON warehouse_locations(is_occupied);
CREATE INDEX idx_warehouse_locations_is_active ON warehouse_locations(is_active);
CREATE INDEX idx_warehouse_locations_sort_order ON warehouse_locations(sort_order);

-- =====================================================
-- INVENTORY MANAGEMENT
-- =====================================================

-- Inventory
CREATE TABLE inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id),
    raw_material_id uuid REFERENCES raw_materials(id),
    location_id uuid NOT NULL REFERENCES warehouse_locations(id),
    lot_number varchar(50),
    batch_number varchar(50),
    quantity decimal(12,2) DEFAULT 0,
    reserved_quantity decimal(12,2) DEFAULT 0,
    available_quantity decimal(12,2) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    quality_status varchar(20) DEFAULT 'available',
    expiry_date date,
    received_date date,
    unit_cost decimal(10,4),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CHECK(product_id IS NOT NULL OR raw_material_id IS NOT NULL)
);

CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_raw_material_id ON inventory(raw_material_id);
CREATE INDEX idx_inventory_location_id ON inventory(location_id);
CREATE INDEX idx_inventory_lot_number ON inventory(lot_number);
CREATE INDEX idx_inventory_batch_number ON inventory(batch_number);
CREATE INDEX idx_inventory_quality_status ON inventory(quality_status);
CREATE INDEX idx_inventory_expiry_date ON inventory(expiry_date);

-- Inventory Movements
CREATE TABLE inventory_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_type movement_type NOT NULL,
    product_id uuid REFERENCES products(id),
    raw_material_id uuid REFERENCES raw_materials(id),
    from_location_id uuid REFERENCES warehouse_locations(id),
    to_location_id uuid REFERENCES warehouse_locations(id),
    quantity decimal(12,2) NOT NULL,
    lot_number varchar(50),
    batch_number varchar(50),
    reference_type varchar(50),
    reference_id uuid,
    reason text,
    performed_by uuid,
    performed_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_inventory_movements_movement_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_raw_material_id ON inventory_movements(raw_material_id);
CREATE INDEX idx_inventory_movements_from_location_id ON inventory_movements(from_location_id);
CREATE INDEX idx_inventory_movements_to_location_id ON inventory_movements(to_location_id);
CREATE INDEX idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);
CREATE INDEX idx_inventory_movements_performed_by ON inventory_movements(performed_by);
CREATE INDEX idx_inventory_movements_performed_at ON inventory_movements(performed_at);

-- =====================================================
-- CUSTOMER MANAGEMENT
-- =====================================================

-- Customers
CREATE TABLE customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(20) UNIQUE NOT NULL,
    name varchar(200) NOT NULL,
    contact_person varchar(200),
    email varchar(200),
    phone varchar(50),
    address text,
    city varchar(100),
    country varchar(100),
    tax_id varchar(50),
    credit_limit decimal(12,2),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_customers_code ON customers(code);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- =====================================================
-- PURCHASE ORDERS
-- =====================================================

-- Purchase Orders
CREATE TABLE purchase_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number varchar(50) UNIQUE NOT NULL,
    supplier_id uuid NOT NULL REFERENCES suppliers(id),
    status po_status DEFAULT 'draft',
    order_date date NOT NULL,
    expected_delivery_date date,
    actual_delivery_date date,
    total_amount decimal(12,2),
    currency varchar(3) DEFAULT 'TRY',
    notes text,
    created_by uuid,
    approved_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_order_date ON purchase_orders(order_date);
CREATE INDEX idx_purchase_orders_expected_delivery_date ON purchase_orders(expected_delivery_date);
CREATE INDEX idx_purchase_orders_created_by ON purchase_orders(created_by);

-- Purchase Order Lines
CREATE TABLE purchase_order_lines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    raw_material_id uuid NOT NULL REFERENCES raw_materials(id),
    ordered_quantity decimal(12,2) NOT NULL,
    received_quantity decimal(12,2) DEFAULT 0,
    unit_cost decimal(10,4) NOT NULL,
    total_cost decimal(12,2) GENERATED ALWAYS AS (ordered_quantity * unit_cost) STORED,
    lot_number varchar(50),
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_purchase_order_lines_po_id ON purchase_order_lines(purchase_order_id);
CREATE INDEX idx_purchase_order_lines_raw_material_id ON purchase_order_lines(raw_material_id);

-- =====================================================
-- GOODS RECEIPTS
-- =====================================================

-- Goods Receipts
CREATE TABLE goods_receipts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number varchar(50) UNIQUE NOT NULL,
    purchase_order_id uuid REFERENCES purchase_orders(id),
    supplier_id uuid NOT NULL REFERENCES suppliers(id),
    received_by uuid,
    received_date timestamptz DEFAULT now(),
    dock_door varchar(20),
    status varchar(20) DEFAULT 'pending',
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_goods_receipts_receipt_number ON goods_receipts(receipt_number);
CREATE INDEX idx_goods_receipts_po_id ON goods_receipts(purchase_order_id);
CREATE INDEX idx_goods_receipts_supplier_id ON goods_receipts(supplier_id);
CREATE INDEX idx_goods_receipts_received_by ON goods_receipts(received_by);
CREATE INDEX idx_goods_receipts_received_date ON goods_receipts(received_date);
CREATE INDEX idx_goods_receipts_status ON goods_receipts(status);

-- Goods Receipt Lines
CREATE TABLE goods_receipt_lines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    goods_receipt_id uuid NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    po_line_id uuid REFERENCES purchase_order_lines(id),
    raw_material_id uuid NOT NULL REFERENCES raw_materials(id),
    received_quantity decimal(12,2) NOT NULL,
    accepted_quantity decimal(12,2) NOT NULL,
    rejected_quantity decimal(12,2) DEFAULT 0,
    lot_number varchar(50),
    location_id uuid REFERENCES warehouse_locations(id),
    quality_status varchar(20) DEFAULT 'pending_inspection',
    inspection_notes text,
    inspected_by uuid,
    inspected_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_goods_receipt_lines_receipt_id ON goods_receipt_lines(goods_receipt_id);
CREATE INDEX idx_goods_receipt_lines_po_line_id ON goods_receipt_lines(po_line_id);
CREATE INDEX idx_goods_receipt_lines_raw_material_id ON goods_receipt_lines(raw_material_id);
CREATE INDEX idx_goods_receipt_lines_location_id ON goods_receipt_lines(location_id);
CREATE INDEX idx_goods_receipt_lines_lot_number ON goods_receipt_lines(lot_number);

-- =====================================================
-- SALES ORDERS
-- =====================================================

-- Sales Orders
CREATE TABLE sales_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    so_number varchar(50) UNIQUE NOT NULL,
    customer_id uuid NOT NULL REFERENCES customers(id),
    status so_status DEFAULT 'draft',
    order_date date NOT NULL,
    required_date date,
    shipped_date date,
    delivered_date date,
    total_amount decimal(12,2),
    shipping_address text,
    priority varchar(10) DEFAULT 'normal',
    notes text,
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_sales_orders_so_number ON sales_orders(so_number);
CREATE INDEX idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_sales_orders_order_date ON sales_orders(order_date);
CREATE INDEX idx_sales_orders_required_date ON sales_orders(required_date);
CREATE INDEX idx_sales_orders_priority ON sales_orders(priority);
CREATE INDEX idx_sales_orders_created_by ON sales_orders(created_by);

-- Sales Order Lines
CREATE TABLE sales_order_lines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id uuid NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id),
    ordered_quantity int NOT NULL,
    picked_quantity int DEFAULT 0,
    shipped_quantity int DEFAULT 0,
    unit_price decimal(10,2) NOT NULL,
    total_price decimal(12,2) GENERATED ALWAYS AS (ordered_quantity * unit_price) STORED,
    lot_number varchar(50),
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_sales_order_lines_so_id ON sales_order_lines(sales_order_id);
CREATE INDEX idx_sales_order_lines_product_id ON sales_order_lines(product_id);

-- =====================================================
-- STOCK COUNT
-- =====================================================

-- Stock Count Tasks
CREATE TABLE stock_count_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_number varchar(50) UNIQUE NOT NULL,
    count_type varchar(20) NOT NULL,
    status varchar(20) DEFAULT 'planned',
    zone_id uuid REFERENCES warehouse_zones(id),
    planned_date date,
    started_at timestamptz,
    completed_at timestamptz,
    assigned_to uuid,
    approved_by uuid,
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stock_count_tasks_task_number ON stock_count_tasks(task_number);
CREATE INDEX idx_stock_count_tasks_status ON stock_count_tasks(status);
CREATE INDEX idx_stock_count_tasks_zone_id ON stock_count_tasks(zone_id);
CREATE INDEX idx_stock_count_tasks_planned_date ON stock_count_tasks(planned_date);
CREATE INDEX idx_stock_count_tasks_assigned_to ON stock_count_tasks(assigned_to);

-- Stock Count Lines
CREATE TABLE stock_count_lines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    count_task_id uuid NOT NULL REFERENCES stock_count_tasks(id) ON DELETE CASCADE,
    location_id uuid NOT NULL REFERENCES warehouse_locations(id),
    product_id uuid REFERENCES products(id),
    raw_material_id uuid REFERENCES raw_materials(id),
    lot_number varchar(50),
    system_quantity decimal(12,2) NOT NULL,
    counted_quantity decimal(12,2),
    variance decimal(12,2) GENERATED ALWAYS AS (counted_quantity - system_quantity) STORED,
    variance_reason text,
    counted_by uuid,
    counted_at timestamptz,
    is_reconciled boolean DEFAULT false
);

CREATE INDEX idx_stock_count_lines_count_task_id ON stock_count_lines(count_task_id);
CREATE INDEX idx_stock_count_lines_location_id ON stock_count_lines(location_id);
CREATE INDEX idx_stock_count_lines_product_id ON stock_count_lines(product_id);
CREATE INDEX idx_stock_count_lines_raw_material_id ON stock_count_lines(raw_material_id);
CREATE INDEX idx_stock_count_lines_is_reconciled ON stock_count_lines(is_reconciled);

-- =====================================================
-- QUALITY MANAGEMENT
-- =====================================================

-- Defect Types
CREATE TABLE defect_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(20) UNIQUE NOT NULL,
    name varchar(100) NOT NULL,
    severity varchar(20),
    category varchar(50),
    description text,
    is_active boolean DEFAULT true
);

CREATE INDEX idx_defect_types_code ON defect_types(code);
CREATE INDEX idx_defect_types_severity ON defect_types(severity);
CREATE INDEX idx_defect_types_category ON defect_types(category);
CREATE INDEX idx_defect_types_is_active ON defect_types(is_active);

-- Quality Inspections
CREATE TABLE quality_inspections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_number varchar(50) UNIQUE NOT NULL,
    reference_type varchar(50),
    reference_id uuid,
    product_id uuid REFERENCES products(id),
    raw_material_id uuid REFERENCES raw_materials(id),
    lot_number varchar(50),
    sample_size int,
    inspected_quantity int,
    passed_quantity int,
    failed_quantity int,
    defect_types jsonb,
    overall_result varchar(20),
    inspector_id uuid,
    inspected_at timestamptz DEFAULT now(),
    notes text,
    images text[],
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_quality_inspections_inspection_number ON quality_inspections(inspection_number);
CREATE INDEX idx_quality_inspections_reference ON quality_inspections(reference_type, reference_id);
CREATE INDEX idx_quality_inspections_product_id ON quality_inspections(product_id);
CREATE INDEX idx_quality_inspections_raw_material_id ON quality_inspections(raw_material_id);
CREATE INDEX idx_quality_inspections_lot_number ON quality_inspections(lot_number);
CREATE INDEX idx_quality_inspections_inspector_id ON quality_inspections(inspector_id);
CREATE INDEX idx_quality_inspections_inspected_at ON quality_inspections(inspected_at);

-- =====================================================
-- ALERTS & NOTIFICATIONS
-- =====================================================

-- Alert Rules
CREATE TABLE alert_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(200) NOT NULL,
    alert_type varchar(50) NOT NULL,
    entity_type varchar(50),
    entity_id uuid,
    threshold_value decimal(12,2),
    comparison varchar(10),
    is_active boolean DEFAULT true,
    notify_roles text[],
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_alert_rules_alert_type ON alert_rules(alert_type);
CREATE INDEX idx_alert_rules_entity ON alert_rules(entity_type, entity_id);
CREATE INDEX idx_alert_rules_is_active ON alert_rules(is_active);

-- Alerts
CREATE TABLE alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id uuid REFERENCES alert_rules(id),
    alert_type varchar(50) NOT NULL,
    severity varchar(20) NOT NULL,
    title varchar(200) NOT NULL,
    message text,
    entity_type varchar(50),
    entity_id uuid,
    current_value decimal(12,2),
    threshold_value decimal(12,2),
    is_read boolean DEFAULT false,
    is_resolved boolean DEFAULT false,
    resolved_at timestamptz,
    resolved_by uuid,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_alerts_rule_id ON alerts(rule_id);
CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_entity ON alerts(entity_type, entity_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- =====================================================
-- USER MANAGEMENT
-- =====================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name varchar(200),
    email varchar(200),
    role varchar(50),
    department varchar(100),
    phone varchar(50),
    is_active boolean DEFAULT true,
    last_login timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_department ON user_profiles(department);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

-- =====================================================
-- AUDIT LOG
-- =====================================================

-- Audit Log
CREATE TABLE audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name varchar(100) NOT NULL,
    record_id uuid,
    action varchar(20) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    changed_by uuid,
    changed_at timestamptz DEFAULT now(),
    ip_address inet
);

CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

-- =====================================================
-- VIEWS
-- =====================================================

-- Stock Summary View
CREATE OR REPLACE VIEW v_stock_summary AS
SELECT
    p.id AS product_id,
    p.sku,
    pm.code AS model_code,
    pm.name AS model_name,
    pc.name AS color_name,
    ps.name AS size_name,
    pcat.name AS category_name,
    COALESCE(SUM(i.quantity), 0) AS total_quantity,
    COALESCE(SUM(i.reserved_quantity), 0) AS total_reserved,
    COALESCE(SUM(i.available_quantity), 0) AS total_available,
    p.min_stock_level,
    p.max_stock_level,
    CASE
        WHEN COALESCE(SUM(i.quantity), 0) = 0 THEN 'out_of_stock'
        WHEN COALESCE(SUM(i.quantity), 0) < p.min_stock_level THEN 'low_stock'
        WHEN COALESCE(SUM(i.quantity), 0) > p.max_stock_level THEN 'overstock'
        ELSE 'normal'
    END AS stock_status
FROM products p
INNER JOIN product_models pm ON p.model_id = pm.id
INNER JOIN product_colors pc ON p.color_id = pc.id
INNER JOIN product_sizes ps ON p.size_id = ps.id
INNER JOIN product_categories pcat ON pm.category_id = pcat.id
LEFT JOIN inventory i ON p.id = i.product_id
WHERE p.is_active = true
GROUP BY
    p.id, p.sku, pm.code, pm.name, pc.name, ps.name, pcat.name,
    p.min_stock_level, p.max_stock_level
ORDER BY pm.code, pc.name, ps.sort_order;

-- Raw Material Stock View
CREATE OR REPLACE VIEW v_raw_material_stock AS
SELECT
    rm.id AS raw_material_id,
    rm.code,
    rm.name,
    rm.category,
    COALESCE(SUM(i.quantity), 0) AS total_quantity,
    COALESCE(SUM(i.available_quantity), 0) AS total_available,
    rm.unit_of_measure,
    rm.min_stock_level,
    rm.max_stock_level,
    CASE
        WHEN COALESCE(SUM(i.quantity), 0) = 0 THEN 'out_of_stock'
        WHEN COALESCE(SUM(i.quantity), 0) < rm.min_stock_level THEN 'low_stock'
        WHEN COALESCE(SUM(i.quantity), 0) > rm.max_stock_level THEN 'overstock'
        ELSE 'normal'
    END AS stock_status,
    s.name AS supplier_name,
    rm.unit_cost,
    rm.lead_time_days
FROM raw_materials rm
LEFT JOIN inventory i ON rm.id = i.raw_material_id
LEFT JOIN suppliers s ON rm.supplier_id = s.id
WHERE rm.is_active = true
GROUP BY
    rm.id, rm.code, rm.name, rm.category, rm.unit_of_measure,
    rm.min_stock_level, rm.max_stock_level, s.name, rm.unit_cost, rm.lead_time_days
ORDER BY rm.code;

-- Location Utilization View
CREATE OR REPLACE VIEW v_location_utilization AS
SELECT
    w.code AS warehouse_code,
    w.name AS warehouse_name,
    wz.code AS zone_code,
    wz.name AS zone_name,
    wz.zone_type,
    COUNT(wl.id) AS total_locations,
    COUNT(wl.id) FILTER (WHERE wl.is_occupied = true) AS occupied_locations,
    ROUND(
        (COUNT(wl.id) FILTER (WHERE wl.is_occupied = true)::decimal /
         NULLIF(COUNT(wl.id), 0) * 100),
        2
    ) AS utilization_percentage
FROM warehouses w
INNER JOIN warehouse_zones wz ON w.id = wz.warehouse_id
LEFT JOIN warehouse_locations wl ON wz.id = wl.zone_id AND wl.is_active = true
WHERE w.is_active = true AND wz.is_active = true
GROUP BY w.code, w.name, wz.code, wz.name, wz.zone_type
ORDER BY w.code, wz.code;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers for all applicable tables
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_models_updated_at BEFORE UPDATE ON product_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_raw_materials_updated_at BEFORE UPDATE ON raw_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_orders_updated_at BEFORE UPDATE ON sales_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_of_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_count_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_count_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE defect_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Generic authenticated user policies for all other tables
-- (Suitable for graduation project - in production, implement role-based access)

CREATE POLICY "Authenticated users can read product_categories" ON product_categories
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify product_categories" ON product_categories
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read product_models" ON product_models
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify product_models" ON product_models
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read product_colors" ON product_colors
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify product_colors" ON product_colors
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read product_sizes" ON product_sizes
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify product_sizes" ON product_sizes
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read products" ON products
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify products" ON products
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read suppliers" ON suppliers
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify suppliers" ON suppliers
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read raw_materials" ON raw_materials
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify raw_materials" ON raw_materials
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read bill_of_materials" ON bill_of_materials
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify bill_of_materials" ON bill_of_materials
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read warehouses" ON warehouses
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify warehouses" ON warehouses
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read warehouse_zones" ON warehouse_zones
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify warehouse_zones" ON warehouse_zones
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read warehouse_locations" ON warehouse_locations
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify warehouse_locations" ON warehouse_locations
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read inventory" ON inventory
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify inventory" ON inventory
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read inventory_movements" ON inventory_movements
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify inventory_movements" ON inventory_movements
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read customers" ON customers
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify customers" ON customers
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read purchase_orders" ON purchase_orders
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify purchase_orders" ON purchase_orders
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read purchase_order_lines" ON purchase_order_lines
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify purchase_order_lines" ON purchase_order_lines
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read goods_receipts" ON goods_receipts
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify goods_receipts" ON goods_receipts
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read goods_receipt_lines" ON goods_receipt_lines
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify goods_receipt_lines" ON goods_receipt_lines
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read sales_orders" ON sales_orders
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify sales_orders" ON sales_orders
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read sales_order_lines" ON sales_order_lines
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify sales_order_lines" ON sales_order_lines
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read stock_count_tasks" ON stock_count_tasks
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify stock_count_tasks" ON stock_count_tasks
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read stock_count_lines" ON stock_count_lines
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify stock_count_lines" ON stock_count_lines
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read defect_types" ON defect_types
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify defect_types" ON defect_types
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read quality_inspections" ON quality_inspections
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify quality_inspections" ON quality_inspections
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read alert_rules" ON alert_rules
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify alert_rules" ON alert_rules
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read alerts" ON alerts
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can modify alerts" ON alerts
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read audit_log" ON audit_log
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert audit_log" ON audit_log
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE product_categories IS 'Product category master data';
COMMENT ON TABLE product_models IS 'Sock model definitions with material composition';
COMMENT ON TABLE product_colors IS 'Color master data with hex and pantone codes';
COMMENT ON TABLE product_sizes IS 'Size master data with international size ranges';
COMMENT ON TABLE products IS 'Finished goods SKUs (model + color + size combinations)';
COMMENT ON TABLE suppliers IS 'Supplier master data';
COMMENT ON TABLE raw_materials IS 'Raw material master data (yarn, elastic, packaging, etc.)';
COMMENT ON TABLE bill_of_materials IS 'BOM defining raw materials needed per product model';
COMMENT ON TABLE warehouses IS 'Physical warehouse facilities';
COMMENT ON TABLE warehouse_zones IS 'Zones within warehouses (receiving, storage, shipping, etc.)';
COMMENT ON TABLE warehouse_locations IS 'Specific storage locations (rack-shelf-bin)';
COMMENT ON TABLE inventory IS 'Current inventory balances by location and lot';
COMMENT ON TABLE inventory_movements IS 'All inventory transactions';
COMMENT ON TABLE customers IS 'Customer master data';
COMMENT ON TABLE purchase_orders IS 'Purchase orders for raw materials';
COMMENT ON TABLE purchase_order_lines IS 'Line items in purchase orders';
COMMENT ON TABLE goods_receipts IS 'Receipts of incoming materials';
COMMENT ON TABLE goods_receipt_lines IS 'Line items in goods receipts with quality inspection';
COMMENT ON TABLE sales_orders IS 'Customer sales orders';
COMMENT ON TABLE sales_order_lines IS 'Line items in sales orders';
COMMENT ON TABLE stock_count_tasks IS 'Physical inventory count tasks';
COMMENT ON TABLE stock_count_lines IS 'Count results per location with variance tracking';
COMMENT ON TABLE defect_types IS 'Quality defect classification';
COMMENT ON TABLE quality_inspections IS 'Quality inspection records with defect tracking';
COMMENT ON TABLE alert_rules IS 'Configurable alert thresholds';
COMMENT ON TABLE alerts IS 'System alerts and notifications';
COMMENT ON TABLE user_profiles IS 'Extended user profile information';
COMMENT ON TABLE audit_log IS 'Audit trail for all data changes';

COMMENT ON VIEW v_stock_summary IS 'Aggregated stock levels by product with status indicators';
COMMENT ON VIEW v_raw_material_stock IS 'Aggregated raw material stock levels with status';
COMMENT ON VIEW v_location_utilization IS 'Warehouse location utilization metrics';

-- =====================================================
-- INITIAL DATA (Optional - for testing)
-- =====================================================

-- Insert default defect types
INSERT INTO defect_types (code, name, severity, category, description) VALUES
('DEF-001', 'Hole/Tear', 'critical', 'fabric', 'Holes or tears in fabric'),
('DEF-002', 'Color Mismatch', 'high', 'appearance', 'Color does not match specification'),
('DEF-003', 'Size Variance', 'high', 'dimensions', 'Size outside tolerance'),
('DEF-004', 'Stain/Dirt', 'medium', 'appearance', 'Stains or dirt marks'),
('DEF-005', 'Packaging Damage', 'low', 'packaging', 'Damaged packaging'),
('DEF-006', 'Missing Label', 'medium', 'packaging', 'Missing or incorrect label'),
('DEF-007', 'Loose Thread', 'low', 'fabric', 'Loose threads'),
('DEF-008', 'Elastic Issue', 'high', 'fabric', 'Elastic too tight or loose');

-- =====================================================
-- END OF MIGRATION
-- =====================================================
