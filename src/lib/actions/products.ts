'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      model:product_models(
        id, code, name, sock_type, material_composition, weight_per_pair_grams,
        category:product_categories(id, name)
      ),
      color:product_colors(id, name, hex_code, pantone_code),
      size:product_sizes(id, name, eu_range, us_range, uk_range, sort_order)
    `)
    .eq('is_active', true)
    .order('sku');

  if (error) throw new Error(error.message);
  return data;
}

export async function getProductCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductModels() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_models')
    .select('*, category:product_categories(id, name)')
    .eq('is_active', true)
    .order('code');
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductColors() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_colors')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return data;
}

export async function getProductSizes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_sizes')
    .select('*')
    .order('sort_order');
  if (error) throw new Error(error.message);
  return data;
}

export async function createProduct(data: {
  model_id: string;
  color_id: string;
  size_id: string;
  sku: string;
  barcode?: string;
  unit_cost?: number;
  unit_price?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  reorder_quantity?: number;
  lead_time_days?: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').insert(data);
  if (error) throw new Error(error.message);
  revalidatePath('/products');
  return { success: true };
}

export async function updateProduct(
  id: string,
  data: Partial<{
    unit_cost: number;
    unit_price: number;
    min_stock_level: number;
    max_stock_level: number;
    reorder_quantity: number;
    lead_time_days: number;
    is_active: boolean;
  }>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/products');
  return { success: true };
}

export async function getBOM(modelId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bill_of_materials')
    .select(`
      *,
      raw_material:raw_materials(id, code, name, category, unit_of_measure, unit_cost)
    `)
    .eq('product_model_id', modelId)
    .eq('is_active', true);
  if (error) throw new Error(error.message);
  return data;
}

export async function getStockSummary() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('v_stock_summary')
    .select('*');
  if (error) throw new Error(error.message);
  return data;
}
