/*
  # Remove unused indexes

  ## Summary
  Drops indexes that have never been used, reducing storage overhead and
  write overhead on INSERT/UPDATE/DELETE operations.

  ## Removed Indexes
  1. `idx_operations_module_id` on `operations` - unused
  2. `idx_quality_checks_ski_id` on `quality_checks` - unused
  3. `idx_ski_records_serial` on `ski_records` - unused
  4. `idx_measurement_fields_operation` on `measurement_fields` - unused
*/

DROP INDEX IF EXISTS public.idx_operations_module_id;
DROP INDEX IF EXISTS public.idx_quality_checks_ski_id;
DROP INDEX IF EXISTS public.idx_ski_records_serial;
DROP INDEX IF EXISTS public.idx_measurement_fields_operation;
