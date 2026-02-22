'use server';

import { createClient } from '@/lib/supabase/server';

export async function getInventoryForABC() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory')
    .select(`
      quantity,
      unit_cost,
      product:products(
        id, sku,
        model:product_models(name)
      )
    `)
    .not('product_id', 'is', null);

  if (error) throw new Error(error.message);
  return data;
}

export async function getDemandHistory(productId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('inventory_movements')
    .select('movement_type, quantity, performed_at, product_id')
    .in('movement_type', ['ship', 'pick'])
    .order('performed_at', { ascending: true });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductCostData() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, sku, unit_cost, unit_price,
      model:product_models(name),
      lead_time_days
    `)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return data;
}
