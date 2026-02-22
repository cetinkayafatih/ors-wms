'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getQualityInspections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quality_inspections')
    .select(`
      *,
      product:products(sku, model:product_models(name)),
      raw_material:raw_materials(code, name)
    `)
    .order('inspected_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createQualityInspection(data: {
  reference_type: string;
  reference_id: string;
  product_id?: string;
  raw_material_id?: string;
  lot_number?: string;
  sample_size?: number;
  inspected_quantity?: number;
  passed_quantity?: number;
  failed_quantity?: number;
  defect_types?: Record<string, number>;
  overall_result?: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('quality_inspections')
    .select('*', { count: 'exact', head: true })
    .like('inspection_number', `QI-${year}-%`);

  const inspectionNumber = `QI-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`;

  const { error } = await supabase
    .from('quality_inspections')
    .insert({
      inspection_number: inspectionNumber,
      ...data,
    });

  if (error) throw new Error(error.message);
  revalidatePath('/quality');
  return { success: true, inspection_number: inspectionNumber };
}

export async function getDefectTypes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('defect_types')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getStockCountTasks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('stock_count_tasks')
    .select(`
      *,
      zone:warehouse_zones(id, code, name),
      lines:stock_count_lines(
        *,
        location:warehouse_locations(id, code),
        product:products(sku, model:product_models(name)),
        raw_material:raw_materials(code, name)
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createStockCountTask(data: {
  count_type: string;
  zone_id?: string;
  planned_date: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('stock_count_tasks')
    .select('*', { count: 'exact', head: true })
    .like('task_number', `SC-${year}-%`);

  const taskNumber = `SC-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`;

  const { error } = await supabase
    .from('stock_count_tasks')
    .insert({
      task_number: taskNumber,
      ...data,
    });

  if (error) throw new Error(error.message);
  revalidatePath('/stock-count');
  return { success: true, task_number: taskNumber };
}
