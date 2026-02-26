/*
  # Add post-wax measurement fields to Final QC operation

  ## Summary
  Adds 4 new measurement fields to the Final QC operation, collected after the
  operator waxes the skis and oils the talonettes. These fields appear after
  the existing "Base Gap Finition" field (order 6).

  ## New Fields
  - `base_rating` (select: 1, 2, 3, 4) — Base quality score, order 7
  - `topsheet_rating` (select: 1, 2, 3, 4) — Topsheet quality score, order 8
  - `weight_gr` (numeric, unit: gr) — Weight in grams, order 9
  - `qc_grade` (select: A, A-, B, C) — Final QC grade, order 10

  ## Notes
  - The wax/oil validation interstitial is rendered in the frontend between
    the field at order 6 (base_gap_finition) and the field at order 7 (base_rating)
*/

DO $$
DECLARE
  v_operation_id uuid;
BEGIN
  SELECT id INTO v_operation_id FROM operations WHERE name = 'final_qc';

  IF v_operation_id IS NULL THEN
    RAISE EXCEPTION 'Operation final_qc not found';
  END IF;

  -- Base (1-4)
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields WHERE name = 'base_rating' AND operation_id = v_operation_id
  ) THEN
    INSERT INTO measurement_fields (name, display_name, field_type, operation_id, "order", options)
    VALUES ('base_rating', 'Base (1-4)', 'select', v_operation_id, 7, '["1","2","3","4"]'::jsonb);
  END IF;

  -- Topsheet (1-4)
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields WHERE name = 'topsheet_rating' AND operation_id = v_operation_id
  ) THEN
    INSERT INTO measurement_fields (name, display_name, field_type, operation_id, "order", options)
    VALUES ('topsheet_rating', 'Topsheet (1-4)', 'select', v_operation_id, 8, '["1","2","3","4"]'::jsonb);
  END IF;

  -- Weight (Gr.)
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields WHERE name = 'weight_gr' AND operation_id = v_operation_id
  ) THEN
    INSERT INTO measurement_fields (name, display_name, field_type, operation_id, "order", options)
    VALUES ('weight_gr', 'Weight (Gr.)', 'numeric', v_operation_id, 9, '{"unit": "gr"}'::jsonb);
  END IF;

  -- QC Grade (A, A-, B, C)
  IF NOT EXISTS (
    SELECT 1 FROM measurement_fields WHERE name = 'qc_grade' AND operation_id = v_operation_id
  ) THEN
    INSERT INTO measurement_fields (name, display_name, field_type, operation_id, "order", options)
    VALUES ('qc_grade', 'QC Grade', 'select', v_operation_id, 10, '["A","A-","B","C"]'::jsonb);
  END IF;
END $$;
