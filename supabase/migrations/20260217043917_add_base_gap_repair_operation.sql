/*
  # Add Base gap repair operation to Finishing module

  1. New Operation
    - `base_gap_repair` - Base gap repair operation
      - Display name: "Base gap repair"
      - Parent module: finishing
      - Order: 3

  2. Measurement Fields
    - Base Gap repair (Pass, Fail) - select field
      - Required field
      - Order: 1

  3. Notes
    - This adds the Base gap repair operation to the Finishing module
    - The Base Gap repair field is a simple Pass/Fail check
*/

DO $$
DECLARE
  v_module_id uuid;
  v_operation_id uuid := gen_random_uuid();
BEGIN
  -- Get Finishing module ID
  SELECT id INTO v_module_id FROM modules WHERE name = 'finishing';

  -- Create Base gap repair operation
  IF NOT EXISTS (
    SELECT 1 FROM operations WHERE name = 'base_gap_repair'
  ) THEN
    INSERT INTO operations (id, module_id, name, display_name, "order")
    VALUES (v_operation_id, v_module_id, 'base_gap_repair', 'Base gap repair', 3);
  ELSE
    SELECT id INTO v_operation_id FROM operations WHERE name = 'base_gap_repair';
  END IF;

  -- Add Base Gap repair field
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'base_gap_repair'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'base_gap_repair', 'Base gap repair', 'select', 1, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;
END $$;
