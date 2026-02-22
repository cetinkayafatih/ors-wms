-- Industrial Engineering Analytics Tables
-- SPC, 5S, Kanban, VSM, Comparison

-- SPC Measurements
CREATE TABLE IF NOT EXISTS spc_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    sample_values NUMERIC[] NOT NULL,
    subgroup_mean NUMERIC NOT NULL,
    subgroup_range NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_spc_metric ON spc_measurements(metric_name);
CREATE INDEX idx_spc_created ON spc_measurements(created_at);

-- 5S Audits
CREATE TABLE IF NOT EXISTS five_s_audits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    area TEXT NOT NULL,
    sort_score INTEGER NOT NULL CHECK (sort_score BETWEEN 1 AND 5),
    set_in_order_score INTEGER NOT NULL CHECK (set_in_order_score BETWEEN 1 AND 5),
    shine_score INTEGER NOT NULL CHECK (shine_score BETWEEN 1 AND 5),
    standardize_score INTEGER NOT NULL CHECK (standardize_score BETWEEN 1 AND 5),
    sustain_score INTEGER NOT NULL CHECK (sustain_score BETWEEN 1 AND 5),
    total_score INTEGER GENERATED ALWAYS AS (sort_score + set_in_order_score + shine_score + standardize_score + sustain_score) STORED,
    auditor TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_five_s_area ON five_s_audits(area);
CREATE INDEX idx_five_s_date ON five_s_audits(audit_date);

-- Kanban Items
CREATE TABLE IF NOT EXISTS kanban_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    column_status TEXT NOT NULL DEFAULT 'backlog' CHECK (column_status IN ('backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'archived')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    reference_type TEXT,
    reference_id TEXT,
    assignee TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kanban_status ON kanban_items(column_status);
CREATE INDEX idx_kanban_priority ON kanban_items(priority);

-- VSM Process Steps
CREATE TABLE IF NOT EXISTS vsm_process_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    step_number INTEGER NOT NULL,
    process_name TEXT NOT NULL,
    cycle_time_minutes NUMERIC NOT NULL DEFAULT 0,
    wait_time_minutes NUMERIC NOT NULL DEFAULT 0,
    va_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (va_percentage BETWEEN 0 AND 100),
    operators INTEGER NOT NULL DEFAULT 0,
    wip INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vsm_step ON vsm_process_steps(step_number);

-- Comparison Metrics
CREATE TABLE IF NOT EXISTS comparison_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_name_tr TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT '%',
    category TEXT NOT NULL CHECK (category IN ('accuracy', 'speed', 'efficiency', 'quality')),
    period_type TEXT NOT NULL CHECK (period_type IN ('before', 'after')),
    value NUMERIC NOT NULL,
    month_index INTEGER NOT NULL CHECK (month_index BETWEEN 1 AND 12),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comparison_metric ON comparison_metrics(metric_name);
CREATE INDEX idx_comparison_period ON comparison_metrics(period_type);

-- Enable RLS
ALTER TABLE spc_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE five_s_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsm_process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read access for authenticated users)
CREATE POLICY "Authenticated users can read spc_measurements" ON spc_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert spc_measurements" ON spc_measurements FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read five_s_audits" ON five_s_audits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert five_s_audits" ON five_s_audits FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read kanban_items" ON kanban_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert kanban_items" ON kanban_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update kanban_items" ON kanban_items FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read vsm_process_steps" ON vsm_process_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert vsm_process_steps" ON vsm_process_steps FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read comparison_metrics" ON comparison_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert comparison_metrics" ON comparison_metrics FOR INSERT TO authenticated WITH CHECK (true);
