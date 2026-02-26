/*
  # Reorder sanding camber fields

  Swap the order of "camber_height_before" and "camber_height" fields so that:
  1. camber_height_before (order 6) - operator enters measurement first
  2. camber_height select Pass/Corrected/Fail (order 7)
  3. camber_height_after (order 8, conditional) - only shown if camber_height = Corrected or Fail

  Also ensures depends_on_value includes both "Corrected" and "Fail" for camber_height_after.
*/

UPDATE measurement_fields
SET "order" = 6
WHERE id = '168b0d62-35ba-4d9e-8bb8-d03f885a73b7'; -- camber_height_before

UPDATE measurement_fields
SET "order" = 7
WHERE id = '832da9c0-d1b5-420f-b5f5-0d13f996f9bc'; -- camber_height (select)

UPDATE measurement_fields
SET depends_on_value = 'Corrected,Fail'
WHERE id = '4c344a40-38c0-4bf5-894f-e47f1aa39d6e'; -- camber_height_after
