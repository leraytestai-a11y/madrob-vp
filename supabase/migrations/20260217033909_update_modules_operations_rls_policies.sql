/*
  # Update RLS Policies for modules and operations

  ## Purpose
  Update RLS policies for modules and operations tables to explicitly allow
  both anon and authenticated roles for consistency.

  ## Changes Made
  - Drop existing policies for modules and operations
  - Create new policies with explicit anon and authenticated roles
*/

-- Update policies for modules
DROP POLICY IF EXISTS "Allow public read access to modules" ON modules;

CREATE POLICY "Public can view modules"
  ON modules FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update policies for operations
DROP POLICY IF EXISTS "Allow public read access to operations" ON operations;

CREATE POLICY "Public can view operations"
  ON operations FOR SELECT
  TO anon, authenticated
  USING (true);
