'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardKPIs() {
  const supabase = await createClient();

  const [products, lowStock, pendingOrders, todayReceipts] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('v_stock_summary').select('*', { count: 'exact', head: true }).eq('stock_status', 'low_stock'),
    supabase
      .from('sales_orders')
      .select('*', { count: 'exact', head: true })
      .not('status', 'in', '("shipped","delivered","cancelled")'),
    supabase
      .from('goods_receipts')
      .select('*', { count: 'exact', head: true })
      .gte('received_date', new Date().toISOString().split('T')[0]),
  ]);

  return {
    totalSKUs: products.count ?? 0,
    lowStockAlerts: lowStock.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    todayReceipts: todayReceipts.count ?? 0,
  };
}

export async function getInventoryByCategory() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory')
    .select(`
      quantity,
      unit_cost,
      product:products(
        model:product_models(
          category:product_categories(name)
        )
      )
    `)
    .not('product_id', 'is', null);

  if (error) throw new Error(error.message);

  const categoryMap = new Map<string, { value: number; count: number }>();

  for (const item of data ?? []) {
    const product = item.product as unknown as { model?: { category?: { name?: string } } } | null;
    const categoryName = product?.model?.category?.name ?? 'Diger';
    const value = item.quantity * (item.unit_cost ?? 0);
    const existing = categoryMap.get(categoryName) ?? { value: 0, count: 0 };
    categoryMap.set(categoryName, {
      value: existing.value + value,
      count: existing.count + 1,
    });
  }

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    ...data,
  }));
}

export async function getMovementTrend(days = 30) {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('inventory_movements')
    .select('movement_type, quantity, performed_at')
    .gte('performed_at', since.toISOString())
    .order('performed_at');

  if (error) throw new Error(error.message);

  const dayMap = new Map<string, { inbound: number; outbound: number }>();

  for (const mov of data ?? []) {
    const dateKey = new Date(mov.performed_at).toISOString().split('T')[0];
    const existing = dayMap.get(dateKey) ?? { inbound: 0, outbound: 0 };

    if (['receive', 'production_in', 'return_in', 'adjust_in'].includes(mov.movement_type)) {
      existing.inbound += mov.quantity;
    } else if (['ship', 'pick', 'production_out', 'adjust_out'].includes(mov.movement_type)) {
      existing.outbound += mov.quantity;
    }

    dayMap.set(dateKey, existing);
  }

  return Array.from(dayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getRecentMovements(limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory_movements')
    .select(`
      id, movement_type, quantity, lot_number, performed_at,
      product:products(sku, model:product_models(name)),
      raw_material:raw_materials(code, name)
    `)
    .order('performed_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}

export async function getActiveAlerts(limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}

export async function getLocationUtilization() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('v_location_utilization')
    .select('*');

  if (error) throw new Error(error.message);
  return data;
}
