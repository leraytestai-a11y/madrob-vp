
/*
  # Replace core_pocket_deepness with FRONT and BACK fields

  ## Changes
  - Rename existing `core_pocket_deepness` field to `core_pocket_deepness_front`
  - Add new `core_pocket_deepness_back` field (order 4)
  - Shift `core_damage` from order 4 to order 5
*/

-- Shift core_damage to order 5 to make room
UPDATE measurement_fields
SET "order" = 5
WHERE name = 'core_damage'
  AND operation_id = '3513865e-30b8-4b95-8580-c718a60893bc';

-- Rename existing core_pocket_deepness to core_pocket_deepness_front
UPDATE measurement_fields
SET name = 'core_pocket_deepness_front',
    display_name = 'Core pocket deepness FRONT (mm)'
WHERE id = 'da054051-6d40-453a-b4fe-86af3621c81a';

-- Insert core_pocket_deepness_back at order 4
INSERT INTO measurement_fields (operation_id, name, display_name, field_type, unit, required, "order")
VALUES (
  '3513865e-30b8-4b95-8580-c718a60893bc',
  'core_pocket_deepness_back',
  'Core pocket deepness BACK (mm)',
  'numeric',
  'mm',
  false,
  4
);
