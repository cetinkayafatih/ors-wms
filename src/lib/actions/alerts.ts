'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAlerts(options?: { resolved?: boolean; limit?: number }) {
  const supabase = await createClient();
  let query = supabase.from('alerts').select('*').order('created_at', { ascending: false });

  if (options?.resolved !== undefined) {
    query = query.eq('is_resolved', options.resolved);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function markAlertRead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/alerts');
  return { success: true };
}

export async function resolveAlert(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('alerts')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/alerts');
  return { success: true };
}

export async function getAlertRules() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('alert_rules')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function checkLowStockAlerts() {
  const supabase = await createClient();

  const { data: lowStockItems, error } = await supabase
    .from('v_stock_summary')
    .select('*')
    .in('stock_status', ['low_stock', 'out_of_stock']);

  if (error) throw new Error(error.message);

  for (const item of lowStockItems ?? []) {
    const severity = item.stock_status === 'out_of_stock' ? 'critical' : 'warning';

    await supabase.from('alerts').insert({
      alert_type: 'low_stock',
      severity,
      title: `${severity === 'critical' ? 'Stok Tukendi' : 'Dusuk Stok'}: ${item.sku}`,
      message: `${item.model_name} ${item.color_name} ${item.size_name} - Mevcut: ${item.total_available}, Minimum: ${item.min_stock_level}`,
      entity_type: 'product',
      current_value: item.total_available,
      threshold_value: item.min_stock_level,
    });
  }

  revalidatePath('/alerts');
  return { generated: lowStockItems?.length ?? 0 };
}
