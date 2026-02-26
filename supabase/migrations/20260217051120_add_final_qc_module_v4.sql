/*
  # Add Final QC Module and Operation

  1. New Module
    - `Final QC` - Quality control module for final inspection
  
  2. New Operation
    - `Final QC` - Final quality control operation
  
  3. Measurement Fields
    - `Flatness base` (pass_fail: Pass, Fail)
    - `Finale Flatness twist` (pass_fail: Pass, Fail)
    - `Finale Camber height` (pass_fail: Pass, Fail)
    - `Finale Camber height mm` (numeric in mm)
    - `Temperature` (numeric in degrees)
    - `Base Gap Finition` (pass_fail: Pass, Fail)
  
  4. Security
    - All tables already have RLS policies in place
*/

-- Insert Final QC module if it doesn't exist
DO $$
DECLARE
  v_module_id uuid;
  v_operation_id uuid;
BEGIN
  -- Insert or get module
  INSERT INTO modules (name, display_name, color, icon, "order")
  VALUES ('final_qc', 'Final QC', 'green', 'check-circle', 5)
  RETURNING id INTO v_module_id;
  
  EXCEPTION WHEN unique_violation THEN
    SELECT id INTO v_module_id FROM modules WHERE name = 'final_qc';
END $$;

-- Insert Final QC operation if it doesn't exist
DO $$
DECLARE
  v_module_id uuid;
  v_operation_id uuid;
BEGIN
  SELECT id INTO v_module_id FROM modules WHERE name = 'final_qc';
  
  IF EXISTS (SELECT 1 FROM operations WHERE name = 'final_qc') THEN
    SELECT id INTO v_operation_id FROM operations WHERE name = 'final_qc';
  ELSE
    INSERT INTO operations (name, display_name, module_id, "order")
    VALUES ('final_qc', 'Final QC', v_module_id, 1)
    RETURNING id INTO v_operation_id;
  END IF;
END $$;

-- Insert measurement fields for Final QC if they don't exist
DO $$
DECLARE
  v_operation_id uuid;
BEGIN
  SELECT id INTO v_operation_id FROM operations WHERE name = 'final_qc';
  
  -- Flatness base
  IF NOT EXISTS (SELECT 1 FROM measurement_fields WHERE name = 'flatness_base' AND operation_id = v_operation_id) THEN
    INSERT INTO measurement_fields (name, display_name, field_type, operation_id, "order")
    VALUES ('flatness_base', 'Flatness base', 'pass_fail', v_operation_id, 1);
  END IF;
  
  -- Finale Flatness twist
  IF NOT EXISTS (SELECT 1 FROM measurement_fields WHERE name = 'finale_flatness_twist' AND operation_id = v_operation_id) THEN
    INSERT INTO measurement_fields (name, display_name, field_type, operation_id, "order")
    VALUES ('finale_flatness_twist', 'Finale Flatness twist', 'pass_fail', v_operation_id, 2);
  END IF;
  
  -- Finale Camber height check
  IF NOT EXISTS (SELECT 1 FROM measurement_fields WHERE name = 'finale_camber_height_check' AND operation_id = v_operation_id) THEN
    INSERT INTO measurement_fields (name, display_name, field_type, operation_id, "order")
    VALUES ('finale_camber_height_check', 'Finale Camber height', 'pass_fail', v_operation_id, 3);
  END IF;
  
  -- Finale Camber height mm
  IF NOT EXISTS (SELECT 1 FROM measurement_fields WHERE name = 'finale_camber_height_mm' AND operation_id = v_operation_id) THEN
    INSERT INTO measurement_fields (name, display_name, field_type, operation_id, "order", options)
    VALUES ('finale_camber_height_mm', 'Finale Camber height mm', 'numeric', v_operation_id, 4, '{"unit": "mm"}'::jsonb);
  END IF;
  
  -- Temperature
  IF NOT EXISTS (SELECT 1 FROM measurement_fields WHERE name = 'temperature' AND operation_id = v_operation_id) THEN
    INSERT INTO measurement_fields (name, display_name, field_type, operation_id, "order", options)
    VALUES ('temperature', 'Temperature', 'numeric', v_operation_id, 5, '{"unit": "degree"}'::jsonb);
  END IF;
  
  -- Base Gap Finition
  IF NOT EXISTS (SELECT 1 FROM measurement_fields WHERE name = 'base_gap_finition' AND operation_id = v_operation_id) THEN
    INSERT INTO measurement_fields (name, display_name, field_type, operation_id, "order")
    VALUES ('base_gap_finition', 'Base Gap Finition', 'pass_fail', v_operation_id, 6);
  END IF;
END $$;
