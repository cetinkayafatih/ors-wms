'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getComparisonMetrics() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comparison_metrics')
    .select('*')
    .order('category', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function addComparisonMetric(metricData: {
  metric_name: string;
  metric_name_tr: string;
  unit: string;
  category: string;
  period_type: 'before' | 'after';
  value: number;
  month_index: number;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('comparison_metrics')
    .insert(metricData);

  if (error) throw new Error(error.message);
  revalidatePath('/analytics/comparison');
  return { success: true };
}
