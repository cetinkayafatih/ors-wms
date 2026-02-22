'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getWarehouses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('is_active', true)
    .order('code');
  if (error) throw new Error(error.message);
  return data;
}

export async function getZones(warehouseId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('warehouse_zones')
    .select('*, warehouse:warehouses(id, code, name)')
    .eq('is_active', true)
    .order('code');

  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getLocations(zoneId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('warehouse_locations')
    .select(`
      *,
      zone:warehouse_zones(
        id, code, name, zone_type,
        warehouse:warehouses(id, code, name)
      )
    `)
    .eq('is_active', true)
    .order('code');

  if (zoneId) {
    query = query.eq('zone_id', zoneId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function createLocation(data: {
  zone_id: string;
  code: string;
  rack?: string;
  shelf_level?: string;
  bin?: string;
  location_type?: string;
  max_weight_kg?: number;
  max_volume_m3?: number;
  sort_order?: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('warehouse_locations').insert(data);
  if (error) throw new Error(error.message);
  revalidatePath('/locations');
  return { success: true };
}

export async function getLocationUtilization() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('v_location_utilization')
    .select('*');
  if (error) throw new Error(error.message);
  return data;
}
