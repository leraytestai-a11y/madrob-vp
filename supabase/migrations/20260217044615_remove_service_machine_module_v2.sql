/*
  # Remove Service Machine module

  1. Cleanup
    - Delete measurements for service_machine operation fields
    - Delete ski_records for service_machine operation
    - Delete measurement fields for service_machine operation
    - Delete service_machine operation
    - Delete service_machine module

  2. Notes
    - Removes all data associated with the Service Machine module
    - Deletes in correct order to respect foreign key constraints
*/

DO $$
DECLARE
  v_operation_id uuid;
BEGIN
  -- Get operation ID
  SELECT id INTO v_operation_id
  FROM operations
  WHERE name = 'service_machine';

  IF v_operation_id IS NOT NULL THEN
    -- Delete measurements for this operation's fields
    DELETE FROM measurements
    WHERE field_id IN (
      SELECT id FROM measurement_fields WHERE operation_id = v_operation_id
    );

    -- Delete ski_records for this operation
    DELETE FROM ski_records
    WHERE operation_id = v_operation_id;

    -- Delete measurement fields
    DELETE FROM measurement_fields
    WHERE operation_id = v_operation_id;

    -- Delete operation
    DELETE FROM operations
    WHERE id = v_operation_id;
  END IF;

  -- Delete module
  DELETE FROM modules
  WHERE name = 'service_machine';
END $$;
