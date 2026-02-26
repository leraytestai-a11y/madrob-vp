/*
  # Add Soft touch operation to Finishing module

  1. New Operation
    - `soft_touch` - Soft touch operation
      - Display name: "Soft touch"
      - Parent module: finishing
      - Order: 2

  2. Measurement Fields
    - Tail bumper (Pass, Fail) - select field
      - Required field
      - Order: 1

  3. Notes
    - This adds the Soft touch operation to the Finishing module
    - The Tail bumper field is a simple Pass/Fail check
*/

DO $$
DECLARE
  v_module_id uuid;
  v_operation_id uuid := gen_random_uuid();
BEGIN
  -- Get Finishing module ID
  SELECT id INTO v_module_id FROM modules WHERE name = 'finishing';

  -- Create Soft touch operation
  IF NOT EXISTS (
    SELECT 1 FROM operations WHERE name = 'soft_touch'
  ) THEN
    INSERT INTO operations (id, module_id, name, display_name, "order")
    VALUES (v_operation_id, v_module_id, 'soft_touch', 'Soft touch', 2);
  ELSE
    SELECT id INTO v_operation_id FROM operations WHERE name = 'soft_touch';
  END IF;

  -- Add Tail bumper field
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'tail_bumper'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'tail_bumper', 'Tail bumper', 'select', 1, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;
END $$;
