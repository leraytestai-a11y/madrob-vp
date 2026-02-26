/*
  # Add missing foreign key indexes

  ## Summary
  Adds covering indexes for foreign keys that lack them, improving query performance
  for JOIN operations and cascading deletes/updates.

  ## New Indexes
  1. `idx_measurement_fields_depends_on` on `measurement_fields(depends_on)` - covers `measurement_fields_depends_on_fkey`
  2. `idx_measurements_field_id` on `measurements(field_id)` - covers `measurements_field_id_fkey`
  3. `idx_ski_records_operator_initials` on `ski_records(operator_initials)` - covers `fk_ski_records_operator`
  4. `idx_ski_records_created_by` on `ski_records(created_by)` - covers `ski_records_created_by_fkey`
*/

CREATE INDEX IF NOT EXISTS idx_measurement_fields_depends_on
  ON public.measurement_fields(depends_on);

CREATE INDEX IF NOT EXISTS idx_measurements_field_id
  ON public.measurements(field_id);

CREATE INDEX IF NOT EXISTS idx_ski_records_operator_initials
  ON public.ski_records(operator_initials);

CREATE INDEX IF NOT EXISTS idx_ski_records_created_by
  ON public.ski_records(created_by);
