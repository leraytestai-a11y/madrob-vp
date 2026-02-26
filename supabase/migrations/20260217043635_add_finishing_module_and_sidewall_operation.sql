/*
  # Add Finishing module and Sidewall milling operation

  1. New Module
    - `finishing` - Finishing operations module
      - Display name: "Finishing"
      - Color: #10b981 (green)
      - Icon: package
      - Order: 4

  2. New Operation
    - `sidewall_milling` - Sidewall milling operation
      - Display name: "Sidewall milling"
      - Parent module: finishing
      - Order: 1

  3. Measurement Fields
    - Sidewall (Pass, Fail) - select field
      - Required field
      - Order: 1

  4. Notes
    - This adds the Finishing module with its first operation
    - The Sidewall field is a simple Pass/Fail check
*/

DO $$
DECLARE
  v_module_id uuid := gen_random_uuid();
  v_operation_id uuid := gen_random_uuid();
BEGIN
  -- Create Finishing module
  IF NOT EXISTS (
    SELECT 1 FROM modules WHERE name = 'finishing'
  ) THEN
    INSERT INTO modules (id, name, display_name, color, icon, "order")
    VALUES (v_module_id, 'finishing', 'Finishing', '#10b981', 'package', 4);
  ELSE
    SELECT id INTO v_module_id FROM modules WHERE name = 'finishing';
  END IF;

  -- Create Sidewall milling operation
  IF NOT EXISTS (
    SELECT 1 FROM operations WHERE name = 'sidewall_milling'
  ) THEN
    INSERT INTO operations (id, module_id, name, display_name, "order")
    VALUES (v_operation_id, v_module_id, 'sidewall_milling', 'Sidewall milling', 1);
  ELSE
    SELECT id INTO v_operation_id FROM operations WHERE name = 'sidewall_milling';
  END IF;

  -- Add Sidewall field
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'sidewall'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'sidewall', 'Sidewall', 'select', 1, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;
END $$;
