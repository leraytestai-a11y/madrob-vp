/*
  # Add Surface State operation and measurement field

  ## Purpose
  This migration adds the Surface State operation and its associated measurement field.

  ## Changes
  
  1. **Add operation**
     - Surface State operation (associated with Finishing module)
  
  2. **Add measurement field**
     - Surface state (Pass, fail) - select field with Pass/Fail options
  
  ## Notes
  - Field is required
  - Uses select field type with two options: Pass and Fail
  - Associated with the Finishing module
*/

-- Add the surface_state operation
INSERT INTO operations (module_id, name, display_name, "order")
SELECT 
  id,
  'surface_state',
  'Surface State',
  4
FROM modules
WHERE name = 'finishing';

-- Add the measurement field
INSERT INTO measurement_fields (operation_id, name, display_name, field_type, unit, required, "order", options)
SELECT 
  id,
  'surface_state',
  'Surface state',
  'select',
  NULL,
  true,
  1,
  '["Pass", "Fail"]'::jsonb
FROM operations
WHERE name = 'surface_state';