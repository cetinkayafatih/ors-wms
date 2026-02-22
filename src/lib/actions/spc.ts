'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSPCMeasurements(metricName?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('spc_measurements')
    .select('*')
    .order('created_at', { ascending: true });

  if (metricName) {
    query = query.eq('metric_name', metricName);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function addSPCMeasurement(data: {
  metric_name: string;
  sample_values: number[];
  subgroup_mean: number;
  subgroup_range: number;
  notes?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('spc_measurements')
    .insert(data);

  if (error) throw new Error(error.message);
  return { success: true };
}
