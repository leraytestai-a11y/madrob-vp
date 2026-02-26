/*
  # Create Ski Measurements Schema

  ## Purpose
  This migration creates tables to store ski measurement data collected by operators
  during various manufacturing operations.

  ## New Tables
  
  ### `ski_records`
  Stores individual ski entries with serial number and side information
  - `id` (uuid, primary key) - Unique identifier for each ski record
  - `serial_number` (text) - Scanned serial number of the ski
  - `side` (text) - Side of the ski: 'left' or 'right'
  - `operation_id` (uuid) - Reference to the operation being performed
  - `status` (text) - Status: 'in_progress', 'completed', 'skipped'
  - `created_at` (timestamptz) - When the record was created
  - `updated_at` (timestamptz) - When the record was last updated
  - `created_by` (uuid) - User who created the record

  ### `measurement_fields`
  Defines the measurement fields for each operation
  - `id` (uuid, primary key) - Unique identifier
  - `operation_id` (uuid) - Reference to the operation
  - `name` (text) - Internal field name (e.g., 'core_thickness')
  - `display_name` (text) - Display name (e.g., 'Core thickness (mm)')
  - `field_type` (text) - Type: 'numeric', 'pass_fail', 'pass_repair', 'text'
  - `unit` (text) - Unit of measurement (optional)
  - `required` (boolean) - Whether the field is required
  - `order` (integer) - Display order

  ### `measurements`
  Stores actual measurement values
  - `id` (uuid, primary key) - Unique identifier
  - `ski_record_id` (uuid) - Reference to ski_records
  - `field_id` (uuid) - Reference to measurement_fields
  - `value` (text) - The measured value
  - `skipped` (boolean) - Whether the measurement was skipped
  - `created_at` (timestamptz) - When the measurement was taken

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
*/

-- Create ski_records table
CREATE TABLE IF NOT EXISTS ski_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number text NOT NULL,
  side text NOT NULL CHECK (side IN ('left', 'right')),
  operation_id uuid NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'skipped')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE ski_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ski records"
  ON ski_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert ski records"
  ON ski_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own ski records"
  ON ski_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own ski records"
  ON ski_records FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create measurement_fields table
CREATE TABLE IF NOT EXISTS measurement_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_name text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('numeric', 'pass_fail', 'pass_repair', 'text')),
  unit text,
  required boolean DEFAULT true,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE measurement_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view measurement fields"
  ON measurement_fields FOR SELECT
  TO authenticated
  USING (true);

-- Create measurements table
CREATE TABLE IF NOT EXISTS measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ski_record_id uuid NOT NULL REFERENCES ski_records(id) ON DELETE CASCADE,
  field_id uuid NOT NULL REFERENCES measurement_fields(id) ON DELETE CASCADE,
  value text,
  skipped boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(ski_record_id, field_id)
);

ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view measurements"
  ON measurements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert measurements"
  ON measurements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ski_records
      WHERE ski_records.id = measurements.ski_record_id
      AND ski_records.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update measurements"
  ON measurements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ski_records
      WHERE ski_records.id = measurements.ski_record_id
      AND ski_records.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ski_records
      WHERE ski_records.id = measurements.ski_record_id
      AND ski_records.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete measurements"
  ON measurements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ski_records
      WHERE ski_records.id = measurements.ski_record_id
      AND ski_records.created_by = auth.uid()
    )
  );

-- Insert measurement fields for core_thickness operation
INSERT INTO measurement_fields (operation_id, name, display_name, field_type, unit, required, "order")
SELECT 
  o.id,
  'core_thickness',
  'Core thickness (mm)',
  'numeric',
  'mm',
  true,
  1
FROM operations o
WHERE o.name = 'core_thickness'
ON CONFLICT DO NOTHING;

INSERT INTO measurement_fields (operation_id, name, display_name, field_type, required, "order")
SELECT 
  o.id,
  'core_centred',
  'Core centred',
  'pass_fail',
  true,
  2
FROM operations o
WHERE o.name = 'core_thickness'
ON CONFLICT DO NOTHING;

INSERT INTO measurement_fields (operation_id, name, display_name, field_type, unit, required, "order")
SELECT 
  o.id,
  'core_pocket_deepness',
  'Core pocket deepness (mm)',
  'numeric',
  'mm',
  true,
  3
FROM operations o
WHERE o.name = 'core_thickness'
ON CONFLICT DO NOTHING;

INSERT INTO measurement_fields (operation_id, name, display_name, field_type, required, "order")
SELECT 
  o.id,
  'core_damage',
  'Core damage',
  'pass_repair',
  true,
  4
FROM operations o
WHERE o.name = 'core_thickness'
ON CONFLICT DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_ski_records_serial ON ski_records(serial_number);
CREATE INDEX IF NOT EXISTS idx_ski_records_operation ON ski_records(operation_id);
CREATE INDEX IF NOT EXISTS idx_measurements_ski_record ON measurements(ski_record_id);
CREATE INDEX IF NOT EXISTS idx_measurement_fields_operation ON measurement_fields(operation_id);
