'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getInventory(type: 'product' | 'raw_material' | 'all' = 'all') {
  const supabase = await createClient();

  let query = supabase
    .from('inventory')
    .select(`
      *,
      product:products(
        id, sku, unit_cost, unit_price,
        model:product_models(id, name, code, category:product_categories(name)),
        color:product_colors(id, name, hex_code),
        size:product_sizes(id, name, eu_range)
      ),
      raw_material:raw_materials(id, code, name, category, unit_of_measure),
      location:warehouse_locations(
        id, code, rack, shelf_level, bin,
        zone:warehouse_zones(id, code, name, zone_type)
      )
    `)
    .order('updated_at', { ascending: false });

  if (type === 'product') {
    query = query.not('product_id', 'is', null);
  } else if (type === 'raw_material') {
    query = query.not('raw_material_id', 'is', null);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function adjustInventory(params: {
  inventoryId: string;
  adjustmentType: 'adjust_in' | 'adjust_out';
  quantity: number;
  reason: string;
}) {
  const supabase = await createClient();

  const { data: inventory, error: fetchError } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', params.inventoryId)
    .single();

  if (fetchError || !inventory) throw new Error('Envanter kaydi bulunamadi');

  const newQuantity =
    params.adjustmentType === 'adjust_in'
      ? inventory.quantity + params.quantity
      : inventory.quantity - params.quantity;

  if (newQuantity < 0) throw new Error('Stok miktari negatif olamaz');

  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq('id', params.inventoryId);

  if (updateError) throw new Error(updateError.message);

  const { error: movementError } = await supabase
    .from('inventory_movements')
    .insert({
      movement_type: params.adjustmentType,
      product_id: inventory.product_id,
      raw_material_id: inventory.raw_material_id,
      from_location_id:
        params.adjustmentType === 'adjust_out' ? inventory.location_id : null,
      to_location_id:
        params.adjustmentType === 'adjust_in' ? inventory.location_id : null,
      quantity: params.quantity,
      lot_number: inventory.lot_number,
      reason: params.reason,
      reference_type: 'adjustment',
    });

  if (movementError) throw new Error(movementError.message);

  revalidatePath('/inventory');
  return { success: true };
}

export async function transferInventory(params: {
  inventoryId: string;
  toLocationId: string;
  quantity: number;
  reason?: string;
}) {
  const supabase = await createClient();

  const { data: source, error: fetchError } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', params.inventoryId)
    .single();

  if (fetchError || !source) throw new Error('Kaynak envanter bulunamadi');
  if (source.available_quantity < params.quantity) {
    throw new Error('Yetersiz musait miktar');
  }

  // Decrease source
  const { error: updateError } = await supabase
    .from('inventory')
    .update({
      quantity: source.quantity - params.quantity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.inventoryId);

  if (updateError) throw new Error(updateError.message);

  // Check if destination inventory exists
  const { data: existing } = await supabase
    .from('inventory')
    .select('*')
    .eq('location_id', params.toLocationId)
    .eq(source.product_id ? 'product_id' : 'raw_material_id',
        source.product_id ?? source.raw_material_id)
    .eq('lot_number', source.lot_number ?? '')
    .maybeSingle();

  if (existing) {
    await supabase
      .from('inventory')
      .update({
        quantity: existing.quantity + params.quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('inventory').insert({
      product_id: source.product_id,
      raw_material_id: source.raw_material_id,
      location_id: params.toLocationId,
      lot_number: source.lot_number,
      batch_number: source.batch_number,
      quantity: params.quantity,
      quality_status: source.quality_status,
      unit_cost: source.unit_cost,
      received_date: source.received_date,
    });
  }

  // Log movement
  await supabase.from('inventory_movements').insert({
    movement_type: 'transfer',
    product_id: source.product_id,
    raw_material_id: source.raw_material_id,
    from_location_id: source.location_id,
    to_location_id: params.toLocationId,
    quantity: params.quantity,
    lot_number: source.lot_number,
    reason: params.reason ?? 'Depo ici transfer',
    reference_type: 'transfer',
  });

  // Update location occupancy
  await supabase
    .from('warehouse_locations')
    .update({ is_occupied: true })
    .eq('id', params.toLocationId);

  revalidatePath('/inventory');
  return { success: true };
}

export async function getMovements(limit = 50) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('inventory_movements')
    .select(`
      *,
      product:products(sku, model:product_models(name)),
      raw_material:raw_materials(code, name),
      from_location:warehouse_locations!inventory_movements_from_location_id_fkey(code),
      to_location:warehouse_locations!inventory_movements_to_location_id_fkey(code)
    `)
    .order('performed_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}
