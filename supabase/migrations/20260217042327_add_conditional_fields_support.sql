/*
  # Add conditional field support to measurement_fields

  1. Changes
    - Adds depends_on column (uuid) to reference another field
    - Adds depends_on_value column (text) to specify the value that triggers visibility
  
  2. Notes
    - These columns enable conditional field display based on other field values
    - Used for cases like "show field X only when field Y = value Z"
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_fields' AND column_name = 'depends_on'
  ) THEN
    ALTER TABLE measurement_fields ADD COLUMN depends_on uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_fields' AND column_name = 'depends_on_value'
  ) THEN
    ALTER TABLE measurement_fields ADD COLUMN depends_on_value text;
  END IF;

  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'measurement_fields_depends_on_fkey'
  ) THEN
    ALTER TABLE measurement_fields
    ADD CONSTRAINT measurement_fields_depends_on_fkey
    FOREIGN KEY (depends_on) REFERENCES measurement_fields(id) ON DELETE SET NULL;
  END IF;
END $$;