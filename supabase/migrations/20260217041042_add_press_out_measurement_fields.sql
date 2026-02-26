/*
  # Add measurement fields for Press Out operation

  ## Purpose
  This migration adds three measurement fields for the Press Out operation.

  ## Changes
  
  1. **Add measurement fields**
     - Pressure out (bar) - numeric field
     - Temp. out of press up (degree) - numeric field
     - Temp. out of press down (degree) - numeric field
  
  ## Notes
  - All fields are required
  - Fields are ordered sequentially (1, 2, 3)
*/

INSERT INTO measurement_fields (operation_id, name, display_name, field_type, unit, required, "order")
VALUES
  ('ab5a4de4-3202-407b-a84e-f5a86ee4726c', 'pressure_out', 'Pressure out', 'numeric', 'bar', true, 1),
  ('ab5a4de4-3202-407b-a84e-f5a86ee4726c', 'temp_out_press_up', 'Temp. out of press up', 'numeric', 'degree', true, 2),
  ('ab5a4de4-3202-407b-a84e-f5a86ee4726c', 'temp_out_press_down', 'Temp. out of press down', 'numeric', 'degree', true, 3);