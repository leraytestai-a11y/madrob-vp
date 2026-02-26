/*
  # Add Tuning module and Flattening operation

  1. New Module
    - `tuning` - Tuning module
      - Display name: "Tuning"
      - Order: 3

  2. New Operation
    - `flattening` - Flattening operation
      - Display name: "Flattening"
      - Parent module: tuning
      - Order: 1

  3. Measurement Fields
    - Flatness base (Pass, Fail) - select field
      - Required field
      - Order: 1
    - Spatule (Pass, Fail) - select field
      - Required field
      - Order: 2
    - Tail (Pass, Fail) - select field
      - Required field
      - Order: 3

  4. Notes
    - This creates the Tuning module
    - Adds the Flattening operation with three Pass/Fail fields
*/

DO $$
DECLARE
  v_module_id uuid := gen_random_uuid();
  v_operation_id uuid := gen_random_uuid();
BEGIN
  -- Create Tuning module
  IF NOT EXISTS (
    SELECT 1 FROM modules WHERE name = 'tuning'
  ) THEN
    INSERT INTO modules (id, name, display_name, "order")
    VALUES (v_module_id, 'tuning', 'Tuning', 3);
  ELSE
    SELECT id INTO v_module_id FROM modules WHERE name = 'tuning';
  END IF;

  -- Create Flattening operation
  IF NOT EXISTS (
    SELECT 1 FROM operations WHERE name = 'flattening'
  ) THEN
    INSERT INTO operations (id, module_id, name, display_name, "order")
    VALUES (v_operation_id, v_module_id, 'flattening', 'Flattening', 1);
  ELSE
    SELECT id INTO v_operation_id FROM operations WHERE name = 'flattening';
  END IF;

  -- Add Flatness base field
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'flatness_base'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'flatness_base', 'Flatness base', 'select', 1, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;

  -- Add Spatule field
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'spatule'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'spatule', 'Spatule', 'select', 2, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;

  -- Add Tail field
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'tail'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'tail', 'Tail', 'select', 3, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;
END $$;
