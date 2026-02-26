/*
  # Add Service Machine operation to Tuning module

  1. New Operations
    - `service_machine` in Tuning module
      - Edges (pass/fail)
      - Structure (pass/fail)

  2. Changes
    - Adds service_machine operation to tuning module
    - Creates two measurement fields for quality checks
*/

DO $$
DECLARE
  v_tuning_module_id uuid;
  v_service_machine_operation_id uuid;
BEGIN
  -- Get tuning module ID
  SELECT id INTO v_tuning_module_id
  FROM modules
  WHERE name = 'tuning';

  -- Insert service machine operation
  INSERT INTO operations (module_id, name, display_name, "order")
  VALUES (
    v_tuning_module_id,
    'service_machine',
    'Service Machine',
    3
  )
  RETURNING id INTO v_service_machine_operation_id;

  -- Insert measurement fields
  INSERT INTO measurement_fields (operation_id, name, display_name, field_type, "order", required)
  VALUES
    (v_service_machine_operation_id, 'edges', 'Edges', 'pass_fail', 1, true),
    (v_service_machine_operation_id, 'structure', 'Structure', 'pass_fail', 2, true);

END $$;
