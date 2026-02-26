/*
  # Update RLS Policies for Public Access

  ## Purpose
  This migration updates the RLS policies to allow public access to the application
  without authentication, which is suitable for a production floor environment where
  operators need quick access to data entry.

  ## Changes Made
  
  1. Schema Updates
    - Make `created_by` column nullable in `ski_records` table
  
  2. Security Updates
    - Drop existing restrictive policies
    - Create new policies that allow public access (anon role)
    - Allow operators to read, insert, update, and delete records without authentication
  
  ## Important Notes
  - This configuration is designed for internal production environments
  - Consider network-level security to restrict access to trusted networks
  - RLS is still enabled but configured for public (anon) access
*/

-- Make created_by nullable
ALTER TABLE ski_records ALTER COLUMN created_by DROP NOT NULL;

-- Drop existing policies for ski_records
DROP POLICY IF EXISTS "Users can view ski records" ON ski_records;
DROP POLICY IF EXISTS "Users can insert ski records" ON ski_records;
DROP POLICY IF EXISTS "Users can update their own ski records" ON ski_records;
DROP POLICY IF EXISTS "Users can delete their own ski records" ON ski_records;

-- Create new public access policies for ski_records
CREATE POLICY "Public can view ski records"
  ON ski_records FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert ski records"
  ON ski_records FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update ski records"
  ON ski_records FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete ski records"
  ON ski_records FOR DELETE
  TO anon, authenticated
  USING (true);

-- Update policies for measurements
DROP POLICY IF EXISTS "Users can view measurements" ON measurements;
DROP POLICY IF EXISTS "Users can insert measurements" ON measurements;
DROP POLICY IF EXISTS "Users can update measurements" ON measurements;
DROP POLICY IF EXISTS "Users can delete measurements" ON measurements;

CREATE POLICY "Public can view measurements"
  ON measurements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert measurements"
  ON measurements FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update measurements"
  ON measurements FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete measurements"
  ON measurements FOR DELETE
  TO anon, authenticated
  USING (true);
