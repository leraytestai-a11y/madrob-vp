/*
  # Add Nose & Tail Structure operation to Tuning module

  1. New Operation
    - `nose_tail_structure` - Nose & Tail Structure operation
      - Display name: "Nose & Tail Structure"
      - Parent module: tuning
      - Order: 2

  2. Measurement Fields
    - Tail Structure (Pass, Fail) - select field
      - Required field
      - Order: 1
    - Nose structure (Pass, Fail) - select field
      - Required field
      - Order: 2

  3. Notes
    - Adds the Nose & Tail Structure operation to the Tuning module
    - Both fields are Pass/Fail select fields
*/

DO $$
DECLARE
  v_module_id uuid;
  v_operation_id uuid := gen_random_uuid();
BEGIN
  -- Get Tuning module ID
  SELECT id INTO v_module_id FROM modules WHERE name = 'tuning';

  -- Create Nose & Tail Structure operation
  IF NOT EXISTS (
    SELECT 1 FROM operations WHERE name = 'nose_tail_structure'
  ) THEN
    INSERT INTO operations (id, module_id, name, display_name, "order")
    VALUES (v_operation_id, v_module_id, 'nose_tail_structure', 'Nose & Tail Structure', 2);
  ELSE
    SELECT id INTO v_operation_id FROM operations WHERE name = 'nose_tail_structure';
  END IF;

  -- Add Tail Structure field
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'tail_structure'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'tail_structure', 'Tail Structure', 'select', 1, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;

  -- Add Nose structure field
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'nose_structure'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'nose_structure', 'Nose structure', 'select', 2, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;
END $$;
