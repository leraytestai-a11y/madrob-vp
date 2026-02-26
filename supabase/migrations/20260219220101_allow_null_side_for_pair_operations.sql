/*
  # Allow null side for pair operations (press_in, press_out)

  The side column in ski_records currently has a NOT NULL constraint.
  Press In and Press Out operations process both skis as a pair,
  so side selection is not applicable.

  Changes:
  - Remove NOT NULL constraint from ski_records.side column
*/

ALTER TABLE ski_records ALTER COLUMN side DROP NOT NULL;
