/*
  # Add Surface State field to Surface Check operation

  1. Changes
    - Adds "Surface state" field to the Surface Check operation in Press module
    - Field type: select with options Pass/Fail
    - Display order: 1
  
  2. Notes
    - Uses select field type for Pass/Fail options
    - Enables operators to quickly record surface inspection results
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = '1adf8d20-2c56-4117-8919-a4008ea47c44'
    AND name = 'surface_state'
  ) THEN
    INSERT INTO measurement_fields (
      id,
      operation_id,
      name,
      display_name,
      field_type,
      "order",
      required,
      options
    ) VALUES (
      gen_random_uuid(),
      '1adf8d20-2c56-4117-8919-a4008ea47c44',
      'surface_state',
      'Surface State',
      'select',
      1,
      true,
      '["Pass", "Fail"]'::jsonb
    );
  END IF;
END $$;