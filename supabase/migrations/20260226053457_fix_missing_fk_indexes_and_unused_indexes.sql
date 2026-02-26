/*
  # Fix Missing FK Indexes and Remove Unused Indexes

  ## Changes

  ### New Indexes
  - `idx_measurement_fields_operation_id` on `measurement_fields(operation_id)` - covers FK `measurement_fields_operation_id_fkey`
  - `idx_operations_module_id` on `operations(module_id)` - covers FK `operations_module_id_fkey`

  ### Removed Indexes (unused)
  - `idx_ski_records_operator_initials` on `ski_records`
  - `idx_ski_records_created_by` on `ski_records`
  - `idx_measurement_fields_depends_on` on `measurement_fields`
  - `idx_measurements_field_id` on `measurements`
*/

CREATE INDEX IF NOT EXISTS idx_measurement_fields_operation_id
  ON public.measurement_fields (operation_id);

CREATE INDEX IF NOT EXISTS idx_operations_module_id
  ON public.operations (module_id);

DROP INDEX IF EXISTS public.idx_ski_records_operator_initials;
DROP INDEX IF EXISTS public.idx_ski_records_created_by;
DROP INDEX IF EXISTS public.idx_measurement_fields_depends_on;
DROP INDEX IF EXISTS public.idx_measurements_field_id;
