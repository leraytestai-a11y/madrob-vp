/*
  # Add Cut Out field to Cut Out operation

  1. Changes
    - Adds "Cut out" field to the Cut Out operation in Finishing module
    - Field type: select with options Pass/Fail
    - Display order: 1
  
  2. Notes
    - Uses select field type for Pass/Fail options
    - Enables operators to quickly record cut out inspection results
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields
    WHERE operation_id = '089453d3-4dea-4d50-bb65-0f9befd0bad1'
    AND name = 'cut_out'
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
      '089453d3-4dea-4d50-bb65-0f9befd0bad1',
      'cut_out',
      'Cut Out',
      'select',
      1,
      true,
      '["Pass", "Fail"]'::jsonb
    );
  END IF;
END $$;