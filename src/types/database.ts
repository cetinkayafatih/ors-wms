export type UserRole =
  | 'admin'
  | 'warehouse_manager'
  | 'operator_receiving'
  | 'operator_shipping'
  | 'viewer';

export type MovementType =
  | 'receive'
  | 'putaway'
  | 'pick'
  | 'ship'
  | 'transfer'
  | 'adjust_in'
  | 'adjust_out'
  | 'production_in'
  | 'production_out'
  | 'return_in'
  | 'return_out'
  | 'count_adjust';

export type POStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'partially_received'
  | 'received'
  | 'cancelled'
  | 'closed';

export type SOStatus =
  | 'draft'
  | 'confirmed'
  | 'picking'
  | 'picked'
  | 'packing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type QualityStatus =
  | 'available'
  | 'quarantine'
  | 'rejected'
  | 'on_hold'
  | 'pending_inspection';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 'low_stock' | 'overstock' | 'expiring' | 'capacity';
export type CountType = 'full' | 'cycle' | 'spot';
export type CountStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type ZoneType = 'receiving' | 'storage' | 'picking' | 'shipping' | 'quarantine' | 'returns';
export type LocationType = 'bulk' | 'pick' | 'floor' | 'pallet';
export type SockType = 'ankle' | 'crew' | 'knee_high' | 'no_show' | 'quarter' | 'thigh_high';
export type WarehouseType = 'raw_material' | 'finished_goods' | 'mixed';
export type RawMaterialCategory = 'yarn' | 'elastic' | 'dye' | 'label' | 'packaging' | 'chemical';
export type OrderPriority = 'low' | 'normal' | 'high' | 'urgent';
export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductModel {
  id: string;
  category_id: string;
  code: string;
  name: string;
  description: string | null;
  material_composition: Record<string, number> | null;
  sock_type: SockType | null;
  weight_per_pair_grams: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: ProductCategory;
}

export interface ProductColor {
  id: string;
  name: string;
  hex_code: string | null;
  pantone_code: string | null;
  is_active: boolean;
}

export interface ProductSize {
  id: string;
  name: string;
  eu_range: string | null;
  us_range: string | null;
  uk_range: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  model_id: string;
  color_id: string;
  size_id: string;
  sku: string;
  barcode: string | null;
  unit_cost: number | null;
  unit_price: number | null;
  min_stock_level: number;
  max_stock_level: number | null;
  reorder_quantity: number | null;
  lead_time_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  model?: ProductModel;
  color?: ProductColor;
  size?: ProductSize;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: RawMaterialCategory;
  unit_of_measure: string;
  color: string | null;
  specification: string | null;
  min_stock_level: number | null;
  max_stock_level: number | null;
  reorder_quantity: number | null;
  lead_time_days: number | null;
  unit_cost: number | null;
  supplier_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export interface BillOfMaterials {
  id: string;
  product_model_id: string;
  raw_material_id: string;
  quantity_per_dozen: number;
  unit_of_measure: string;
  waste_percentage: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  product_model?: ProductModel;
  raw_material?: RawMaterial;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string | null;
  total_area_sqm: number | null;
  warehouse_type: WarehouseType | null;
  is_active: boolean;
  created_at: string;
}

export interface WarehouseZone {
  id: string;
  warehouse_id: string;
  code: string;
  name: string;
  zone_type: ZoneType;
  temperature_controlled: boolean;
  area_sqm: number | null;
  is_active: boolean;
  warehouse?: Warehouse;
}

export interface WarehouseLocation {
  id: string;
  zone_id: string;
  code: string;
  rack: string | null;
  shelf_level: string | null;
  bin: string | null;
  location_type: LocationType | null;
  max_weight_kg: number | null;
  max_volume_m3: number | null;
  is_occupied: boolean;
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  zone?: WarehouseZone;
}

export interface Inventory {
  id: string;
  product_id: string | null;
  raw_material_id: string | null;
  location_id: string;
  lot_number: string | null;
  batch_number: string | null;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  quality_status: QualityStatus;
  expiry_date: string | null;
  received_date: string | null;
  unit_cost: number | null;
  created_at: string;
  updated_at: string;
  product?: Product;
  raw_material?: RawMaterial;
  location?: WarehouseLocation;
}

export interface InventoryMovement {
  id: string;
  movement_type: MovementType;
  product_id: string | null;
  raw_material_id: string | null;
  from_location_id: string | null;
  to_location_id: string | null;
  quantity: number;
  lot_number: string | null;
  batch_number: string | null;
  reference_type: string | null;
  reference_id: string | null;
  reason: string | null;
  performed_by: string;
  performed_at: string;
  created_at: string;
  product?: Product;
  raw_material?: RawMaterial;
  from_location?: WarehouseLocation;
  to_location?: WarehouseLocation;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  lead_time_days: number | null;
  quality_rating: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  tax_id: string | null;
  credit_limit: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  status: POStatus;
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  total_amount: number | null;
  currency: string;
  notes: string | null;
  created_by: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  lines?: PurchaseOrderLine[];
}

export interface PurchaseOrderLine {
  id: string;
  purchase_order_id: string;
  raw_material_id: string;
  ordered_quantity: number;
  received_quantity: number;
  unit_cost: number;
  total_cost: number;
  lot_number: string | null;
  notes: string | null;
  created_at: string;
  raw_material?: RawMaterial;
}

export interface GoodsReceipt {
  id: string;
  receipt_number: string;
  purchase_order_id: string | null;
  supplier_id: string;
  received_by: string;
  received_date: string;
  dock_door: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  purchase_order?: PurchaseOrder;
  supplier?: Supplier;
  lines?: GoodsReceiptLine[];
}

export interface GoodsReceiptLine {
  id: string;
  goods_receipt_id: string;
  po_line_id: string | null;
  raw_material_id: string;
  received_quantity: number;
  accepted_quantity: number | null;
  rejected_quantity: number;
  lot_number: string | null;
  location_id: string | null;
  quality_status: QualityStatus;
  inspection_notes: string | null;
  inspected_by: string | null;
  inspected_at: string | null;
  created_at: string;
  raw_material?: RawMaterial;
  location?: WarehouseLocation;
}

export interface SalesOrder {
  id: string;
  so_number: string;
  customer_id: string;
  status: SOStatus;
  order_date: string;
  required_date: string | null;
  shipped_date: string | null;
  delivered_date: string | null;
  total_amount: number | null;
  shipping_address: string | null;
  priority: OrderPriority;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  lines?: SalesOrderLine[];
}

export interface SalesOrderLine {
  id: string;
  sales_order_id: string;
  product_id: string;
  ordered_quantity: number;
  picked_quantity: number;
  shipped_quantity: number;
  unit_price: number;
  total_price: number;
  lot_number: string | null;
  notes: string | null;
  created_at: string;
  product?: Product;
}

export interface StockCountTask {
  id: string;
  task_number: string;
  count_type: CountType;
  status: CountStatus;
  zone_id: string | null;
  planned_date: string;
  started_at: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
  zone?: WarehouseZone;
  lines?: StockCountLine[];
}

export interface StockCountLine {
  id: string;
  count_task_id: string;
  location_id: string;
  product_id: string | null;
  raw_material_id: string | null;
  lot_number: string | null;
  system_quantity: number | null;
  counted_quantity: number | null;
  variance: number | null;
  variance_reason: string | null;
  counted_by: string | null;
  counted_at: string | null;
  is_reconciled: boolean;
  location?: WarehouseLocation;
  product?: Product;
  raw_material?: RawMaterial;
}

export interface AlertRule {
  id: string;
  name: string;
  alert_type: AlertType;
  entity_type: string | null;
  entity_id: string | null;
  threshold_value: number | null;
  comparison: string | null;
  is_active: boolean;
  notify_roles: string[] | null;
  created_at: string;
}

export interface Alert {
  id: string;
  rule_id: string | null;
  alert_type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  current_value: number | null;
  threshold_value: number | null;
  is_read: boolean;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string | null;
  phone: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_by: string;
  changed_at: string;
  ip_address: string | null;
}

// View types
export interface StockSummary {
  sku: string;
  model_name: string;
  color_name: string;
  size_name: string;
  category_name: string;
  total_quantity: number;
  total_reserved: number;
  total_available: number;
  min_stock_level: number;
  max_stock_level: number | null;
  stock_status: 'out_of_stock' | 'low_stock' | 'overstock' | 'normal';
}

export interface RawMaterialStock {
  code: string;
  name: string;
  category: RawMaterialCategory;
  total_quantity: number;
  total_available: number;
  unit_of_measure: string;
  min_stock_level: number | null;
  stock_status: 'out_of_stock' | 'low_stock' | 'normal';
}

export interface LocationUtilization {
  zone_name: string;
  zone_type: ZoneType;
  total_locations: number;
  occupied_locations: number;
  utilization_percentage: number;
}

// Dashboard KPI types
export interface DashboardKPIs {
  totalSKUs: number;
  lowStockAlerts: number;
  pendingOrders: number;
  todayReceipts: number;
  totalInventoryValue: number;
  inventoryAccuracy: number;
  orderFillRate: number;
  warehouseUtilization: number;
}

export interface InventoryByCategory {
  category: string;
  value: number;
  count: number;
}

export interface MovementTrend {
  date: string;
  inbound: number;
  outbound: number;
}
