/*
  # Create operators table

  1. New Tables
    - `operators`
      - `id` (uuid, primary key) - Unique identifier for the operator
      - `initials` (text, unique) - Operator initials (e.g., ALR, ZHL, LWR)
      - `created_at` (timestamptz) - Timestamp when operator was added
  
  2. Security
    - Enable RLS on `operators` table
    - Add policy for public read access (operators need to be visible to all users)
    - Add policy for authenticated insert (to allow adding new operators)
  
  3. Initial Data
    - Insert default operators: ALR, ZHL, LWR, SAI, YCL, EBR
*/

CREATE TABLE IF NOT EXISTS operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initials text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view operators"
  ON operators
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert operators"
  ON operators
  FOR INSERT
  WITH CHECK (true);

INSERT INTO operators (initials) VALUES
  ('ALR'),
  ('ZHL'),
  ('LWR'),
  ('SAI'),
  ('YCL'),
  ('EBR')
ON CONFLICT (initials) DO NOTHING;
