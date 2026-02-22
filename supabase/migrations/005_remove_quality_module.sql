-- =====================================================
-- REMOVE QUALITY CONTROL MODULE
-- Kalite kontrol modulu projeden cikarildi
-- =====================================================

-- Drop quality-related policies
DROP POLICY IF EXISTS "Authenticated users can read quality_inspections" ON quality_inspections;
DROP POLICY IF EXISTS "Authenticated users can modify quality_inspections" ON quality_inspections;
DROP POLICY IF EXISTS "Authenticated users can read defect_types" ON defect_types;
DROP POLICY IF EXISTS "Authenticated users can modify defect_types" ON defect_types;

-- Drop SPC-related policies
DROP POLICY IF EXISTS "Authenticated users can read spc_measurements" ON spc_measurements;
DROP POLICY IF EXISTS "Authenticated users can insert spc_measurements" ON spc_measurements;

-- Drop quality tables
DROP TABLE IF EXISTS quality_inspections CASCADE;
DROP TABLE IF EXISTS defect_types CASCADE;

-- Drop SPC table
DROP TABLE IF EXISTS spc_measurements CASCADE;

-- Update alert_rules: remove quality_control from notify_roles
UPDATE alert_rules
SET notify_roles = array_remove(notify_roles, 'quality_control')
WHERE 'quality_control' = ANY(notify_roles);

-- Update user_profiles: change quality_control role to viewer
UPDATE user_profiles
SET role = 'viewer'
WHERE role = 'quality_control';
