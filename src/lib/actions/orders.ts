'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Purchase Orders
export async function getPurchaseOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      supplier:suppliers(id, code, name),
      lines:purchase_order_lines(
        *,
        raw_material:raw_materials(id, code, name, unit_of_measure)
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createPurchaseOrder(data: {
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  notes?: string;
  lines: {
    raw_material_id: string;
    ordered_quantity: number;
    unit_cost: number;
  }[];
}) {
  const supabase = await createClient();

  // Generate PO number
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
    .like('po_number', `PO-${year}-%`);

  const poNumber = `PO-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`;
  const totalAmount = data.lines.reduce(
    (sum, line) => sum + line.ordered_quantity * line.unit_cost,
    0
  );

  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert({
      po_number: poNumber,
      supplier_id: data.supplier_id,
      order_date: data.order_date,
      expected_delivery_date: data.expected_delivery_date,
      total_amount: totalAmount,
      notes: data.notes,
    })
    .select()
    .single();

  if (poError || !po) throw new Error(poError?.message ?? 'PO olusturulamadi');

  const lines = data.lines.map((line) => ({
    purchase_order_id: po.id,
    ...line,
  }));

  const { error: linesError } = await supabase
    .from('purchase_order_lines')
    .insert(lines);

  if (linesError) throw new Error(linesError.message);

  revalidatePath('/receiving');
  return { success: true, po_number: poNumber };
}

export async function updatePOStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('purchase_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/receiving');
  return { success: true };
}

// Goods Receipts
export async function getGoodsReceipts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('goods_receipts')
    .select(`
      *,
      supplier:suppliers(id, code, name),
      purchase_order:purchase_orders(id, po_number),
      lines:goods_receipt_lines(
        *,
        raw_material:raw_materials(id, code, name, unit_of_measure),
        location:warehouse_locations(id, code)
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// Sales Orders
export async function getSalesOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sales_orders')
    .select(`
      *,
      customer:customers(id, code, name),
      lines:sales_order_lines(
        *,
        product:products(
          id, sku,
          model:product_models(name),
          color:product_colors(name),
          size:product_sizes(name)
        )
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createSalesOrder(data: {
  customer_id: string;
  order_date: string;
  required_date?: string;
  shipping_address?: string;
  priority?: string;
  notes?: string;
  lines: {
    product_id: string;
    ordered_quantity: number;
    unit_price: number;
  }[];
}) {
  const supabase = await createClient();

  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('sales_orders')
    .select('*', { count: 'exact', head: true })
    .like('so_number', `SO-${year}-%`);

  const soNumber = `SO-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`;
  const totalAmount = data.lines.reduce(
    (sum, line) => sum + line.ordered_quantity * line.unit_price,
    0
  );

  const { data: so, error: soError } = await supabase
    .from('sales_orders')
    .insert({
      so_number: soNumber,
      customer_id: data.customer_id,
      order_date: data.order_date,
      required_date: data.required_date,
      shipping_address: data.shipping_address,
      priority: data.priority ?? 'normal',
      total_amount: totalAmount,
      notes: data.notes,
    })
    .select()
    .single();

  if (soError || !so) throw new Error(soError?.message ?? 'SO olusturulamadi');

  const lines = data.lines.map((line) => ({
    sales_order_id: so.id,
    ...line,
  }));

  const { error: linesError } = await supabase
    .from('sales_order_lines')
    .insert(lines);

  if (linesError) throw new Error(linesError.message);

  revalidatePath('/shipping');
  return { success: true, so_number: soNumber };
}

export async function updateSOStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('sales_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/shipping');
  return { success: true };
}

// Customers
export async function getCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return data;
}

// Suppliers
export async function getSuppliers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return data;
}
