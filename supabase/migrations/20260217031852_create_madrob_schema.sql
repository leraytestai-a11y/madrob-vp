/*
  # MADROB Quality Check Schema
  
  1. New Tables
    - `modules`
      - `id` (uuid, primary key)
      - `name` (text) - Module name (core, press, finishing, tuning, final_qc)
      - `display_name` (text) - Display name for UI
      - `color` (text) - Color for the module card
      - `icon` (text) - Icon identifier
      - `order` (integer) - Display order
      - `created_at` (timestamptz)
      
    - `operations`
      - `id` (uuid, primary key)
      - `module_id` (uuid, foreign key to modules)
      - `name` (text) - Operation name
      - `display_name` (text) - Display name for UI
      - `order` (integer) - Display order within module
      - `created_at` (timestamptz)
      
    - `quality_checks`
      - `id` (uuid, primary key)
      - `operation_id` (uuid, foreign key to operations)
      - `ski_id` (text) - Ski identifier
      - `status` (text) - Status: ok, nok, pending
      - `notes` (text) - Optional notes
      - `checked_by` (text) - Operator name/id
      - `checked_at` (timestamptz)
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for public access (can be restricted later based on auth requirements)
*/

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create operations table
CREATE TABLE IF NOT EXISTS operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_name text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create quality_checks table
CREATE TABLE IF NOT EXISTS quality_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  ski_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text DEFAULT '',
  checked_by text DEFAULT '',
  checked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (can be restricted later)
CREATE POLICY "Allow public read access to modules"
  ON modules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to operations"
  ON operations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to quality_checks"
  ON quality_checks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to quality_checks"
  ON quality_checks FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to quality_checks"
  ON quality_checks FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert initial modules data
INSERT INTO modules (name, display_name, color, icon, "order") VALUES
  ('core', 'Core', 'blue', 'box', 1),
  ('press', 'Press', 'pink', 'layers', 2),
  ('finishing', 'Finishing', 'green', 'wrench', 3),
  ('tuning', 'Tuning', 'orange', 'zap', 4),
  ('final_qc', 'Final QC', 'teal', 'check-circle', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert operations for Core module
INSERT INTO operations (module_id, name, display_name, "order")
SELECT m.id, 'print_labels', 'Print Labels', 1
FROM modules m WHERE m.name = 'core'
ON CONFLICT DO NOTHING;

INSERT INTO operations (module_id, name, display_name, "order")
SELECT m.id, 'core_thickness', 'Core Thickness', 2
FROM modules m WHERE m.name = 'core'
ON CONFLICT DO NOTHING;

-- Insert operations for Press module
INSERT INTO operations (module_id, name, display_name, "order")
SELECT m.id, 'press_in', 'Press In', 1
FROM modules m WHERE m.name = 'press'
ON CONFLICT DO NOTHING;

INSERT INTO operations (module_id, name, display_name, "order")
SELECT m.id, 'press_out', 'Press Out', 2
FROM modules m WHERE m.name = 'press'
ON CONFLICT DO NOTHING;

INSERT INTO operations (module_id, name, display_name, "order")
SELECT m.id, 'surface_check', 'Surface Check', 3
FROM modules m WHERE m.name = 'press'
ON CONFLICT DO NOTHING;

-- Insert operations for Finishing module
INSERT INTO operations (module_id, name, display_name, "order")
SELECT m.id, 'cut_out', 'Cut Out', 1
FROM modules m WHERE m.name = 'finishing'
ON CONFLICT DO NOTHING;

INSERT INTO operations (module_id, name, display_name, "order")
SELECT m.id, 'sanding', 'Sanding', 2
FROM modules m WHERE m.name = 'finishing'
ON CONFLICT DO NOTHING;

INSERT INTO operations (module_id, name, display_name, "order")
SELECT m.id, 'sidewall_milling', 'Sidewall Milling', 3
FROM modules m WHERE m.name = 'finishing'
ON CONFLICT DO NOTHING;

INSERT INTO operations (module_id, name, display_name, "order")
SELECT m.id, 'soft_touch', 'Soft Touch', 4
FROM modules m WHERE m.name = 'finishing'
ON CONFLICT DO NOTHING;

INSERT INTO operations (module_id, name, display_name, "order")
SELECT m.id, 'base_gap_repair', 'Base Gap Repair', 5
FROM modules m WHERE m.name = 'finishing'
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_operations_module_id ON operations(module_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_operation_id ON quality_checks(operation_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_ski_id ON quality_checks(ski_id);