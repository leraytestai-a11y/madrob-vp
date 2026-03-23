/*
  # Add pass_corrected_fail field type and reorder camber height fields

  ## Changes
  1. Extend field_type check constraint to include 'pass_corrected_fail'
  2. Swap order of finale_camber_height_mm (order 3) and finale_camber_height_check (order 4)
  3. Change finale_camber_height_check type to 'pass_corrected_fail' (3 buttons: PASS / CORRECTED / FAIL)

  Operators now measure first (with target displayed), then evaluate.
*/

ALTER TABLE measurement_fields DROP CONSTRAINT measurement_fields_field_type_check;

ALTER TABLE measurement_fields ADD CONSTRAINT measurement_fields_field_type_check
  CHECK (field_type = ANY (ARRAY[
    'numeric'::text,
    'pass_fail'::text,
    'pass_repair'::text,
    'pass_corrected_fail'::text,
    'text'::text,
    'select'::text
  ]));

UPDATE measurement_fields SET "order" = 3 WHERE name = 'finale_camber_height_mm';
UPDATE measurement_fields SET "order" = 4, field_type = 'pass_corrected_fail' WHERE name = 'finale_camber_height_check';
