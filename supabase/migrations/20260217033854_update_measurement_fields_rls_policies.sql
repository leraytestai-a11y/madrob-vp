/*
  # Update RLS Policies for measurement_fields

  ## Purpose
  Allow public access to measurement_fields table so that the application
  can load field definitions without authentication.

  ## Changes Made
  - Drop existing restrictive policy for measurement_fields
  - Create new policy that allows public (anon) access to read measurement fields
*/

-- Update policies for measurement_fields
DROP POLICY IF EXISTS "Users can view measurement fields" ON measurement_fields;

CREATE POLICY "Public can view measurement fields"
  ON measurement_fields FOR SELECT
  TO anon, authenticated
  USING (true);
