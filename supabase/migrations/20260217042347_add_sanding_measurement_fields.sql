/*
  # Add measurement fields to Sanding operation

  1. New Fields
    - Temperature (degree) - numeric field
    - Flex test (Pass, fail) - select field
    - Spacer Out (Pass, fail) - select field
    - Flatness base (Pass, fail) - select field
    - Flatness twist (Pass, corrected, Fail) - select field
    - Camber height (Pass, corrected, fail) - select field
    - Camber height before (mm) - numeric field
    - Camber height after (mm) - numeric field (conditional, appears only if camber height = corrected)
    - Spatule height (mm) - numeric field
    - Tail height (mm) - numeric field
    - Base Gap (Pass, repair, fail) - select field
  
  2. Conditional Logic
    - "Camber height after" field only appears when "Camber height" is set to "Corrected"
  
  3. Notes
    - All fields are required for the Sanding operation
    - Fields are ordered logically based on the workflow
*/

DO $$
DECLARE
  v_operation_id uuid := '9903164d-52e5-4677-ba6d-2cbd59ea8a45';
  v_camber_height_field_id uuid;
BEGIN
  -- Temperature
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'temperature'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, unit
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'temperature', 'Temperature', 'numeric', 1, true, 'degree'
    );
  END IF;

  -- Flex test
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'flex_test'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'flex_test', 'Flex test', 'select', 2, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;

  -- Spacer Out
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'spacer_out'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'spacer_out', 'Spacer Out', 'select', 3, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;

  -- Flatness base
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'flatness_base'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'flatness_base', 'Flatness base', 'select', 4, true, '["Pass", "Fail"]'::jsonb
    );
  END IF;

  -- Flatness twist
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'flatness_twist'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'flatness_twist', 'Flatness twist', 'select', 5, true, '["Pass", "Corrected", "Fail"]'::jsonb
    );
  END IF;

  -- Camber height (store the ID for the conditional field)
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'camber_height'
  ) THEN
    v_camber_height_field_id := gen_random_uuid();
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      v_camber_height_field_id, v_operation_id, 'camber_height', 'Camber height', 'select', 6, true, '["Pass", "Corrected", "Fail"]'::jsonb
    );
  ELSE
    SELECT id INTO v_camber_height_field_id FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'camber_height';
  END IF;

  -- Camber height before
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'camber_height_before'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, unit
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'camber_height_before', 'Camber height before', 'numeric', 7, true, 'mm'
    );
  END IF;

  -- Camber height after (conditional - only appears if camber_height = "Corrected")
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'camber_height_after'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, unit, depends_on, depends_on_value
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'camber_height_after', 'Camber height after', 'numeric', 8, true, 'mm', v_camber_height_field_id, 'Corrected'
    );
  END IF;

  -- Spatule height
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'spatule_height'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, unit
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'spatule_height', 'Spatule height', 'numeric', 9, true, 'mm'
    );
  END IF;

  -- Tail height
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'tail_height'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, unit
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'tail_height', 'Tail height', 'numeric', 10, true, 'mm'
    );
  END IF;

  -- Base Gap
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = v_operation_id AND name = 'base_gap'
  ) THEN
    INSERT INTO measurement_fields (
      id, operation_id, name, display_name, field_type, "order", required, options
    ) VALUES (
      gen_random_uuid(), v_operation_id, 'base_gap', 'Base Gap', 'select', 11, true, '["Pass", "Repair", "Fail"]'::jsonb
    );
  END IF;
END $$;