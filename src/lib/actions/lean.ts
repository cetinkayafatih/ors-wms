'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getVSMSteps() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vsm_process_steps')
    .select('*')
    .order('step_number', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getFiveSAudits() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('five_s_audits')
    .select('*')
    .order('audit_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createFiveSAudit(auditData: {
  area: string;
  sort_score: number;
  set_in_order_score: number;
  shine_score: number;
  standardize_score: number;
  sustain_score: number;
  notes?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('five_s_audits')
    .insert({
      ...auditData,
      audit_date: new Date().toISOString().split('T')[0],
    });

  if (error) throw new Error(error.message);
  revalidatePath('/analytics/lean');
  return { success: true };
}

export async function getKanbanItems() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('kanban_items')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function moveKanbanItem(id: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('kanban_items')
    .update({ column_status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/analytics/lean');
  return { success: true };
}
