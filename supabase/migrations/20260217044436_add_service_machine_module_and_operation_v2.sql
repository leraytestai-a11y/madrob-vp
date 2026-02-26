/*
  # Add Service Machine module and operation

  1. New Module
    - `service_machine` - Service Machine module
      - Display name: "Service Machine"
      - Color: cyan
      - Icon: tool
      - Order: 7

  2. New Operation
    - `service_machine` - Service Machine operation
      - Display name: "Service Machine"
      - Parent module: service_machine
      - Order: 1

  3. Measurement Fields
    - Edges (Pass, Fail) - select field
      - Required field
      - Order: 1
    - Structure (Pass, Fail) - select field
      - Required field
      - Order: 2

  4. Notes
    - Creates a new Service Machine module with cyan color and tool icon
    - Adds the Service Machine operation with two Pass/Fail fields
*/

DO $$
DECLARE
  v_module_id uuid := gen_random_uuid();
  v_operation_id uuid := gen_random_uuid();
BEGIN
  -- Create Service Machine module
  IF NOT EXISTS (
    SELECT 1 FROM modules WHERE name = 'service_machine'
  ) THEN
    INSERT INTO modules (id, name, display_name, color, icon, "order")
    VALUES (v_module_id, 'service_machine', 'Service Machine', 'cyan', 'tool', 7);
  ELSE
    SELECT id INTO v_module_id FROM modules WHERE name = 'service_machine';
  END IF;

  -- Create Service Machine operation
  IF NOT EXISTS (
    SELECT 1 FROM operations WHERE name = 'service_machine'
  ) THEN
    INSERT INTO operations (id, module_id, name, display_name, "order")
    VALUES (v_operation_id, v_module_id, 'service_machine', 'Service Machine', 1);
  ELSE
    SELECT id INTO v_operation_id FROM operations WHERE name = 'service_machine';
  END IF;

  -- Add Edges field
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'edges'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'edges', 'Edges', 'select', 1, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;

  -- Add Structure field
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'structure'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'structure', 'Structure', 'select', 2, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;
END $$;
