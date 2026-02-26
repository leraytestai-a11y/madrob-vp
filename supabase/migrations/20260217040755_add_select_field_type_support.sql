/*
  # Add select field type support to measurement fields

  ## Purpose
  This migration adds support for select-type fields with predefined options.

  ## Changes
  
  1. **Add options column**
     - Column: options
     - Type: jsonb
     - Description: Stores array of available options for select-type fields
     - Nullable: Yes (only needed for select fields)
  
  2. **Update field_type constraint**
     - Add 'select' as a valid field type
     - Existing types: numeric, pass_fail, pass_repair, text
     - New type: select
  
  3. **Update press_station field**
     - Change field_type from 'text' to 'select'
     - Add options: ["A", "B", "C", "D"]
*/

-- Add options column to measurement_fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'measurement_fields' AND column_name = 'options'
  ) THEN
    ALTER TABLE measurement_fields ADD COLUMN options jsonb;
  END IF;
END $$;

-- Drop existing constraint
ALTER TABLE measurement_fields DROP CONSTRAINT IF EXISTS measurement_fields_field_type_check;

-- Add new constraint with 'select' type
ALTER TABLE measurement_fields ADD CONSTRAINT measurement_fields_field_type_check 
CHECK (field_type = ANY (ARRAY['numeric'::text, 'pass_fail'::text, 'pass_repair'::text, 'text'::text, 'select'::text]));

-- Update press_station field to use select type with options
UPDATE measurement_fields
SET 
  field_type = 'select',
  options = '["A", "B", "C", "D"]'::jsonb
WHERE name = 'press_station';