/*
  # Add measurement fields for Press In operation

  ## Purpose
  This migration adds measurement fields for the "Press In" operation in the Press module.

  ## New Fields
  
  1. **Press (A,B,C,D)**
     - Type: text
     - Description: Press station identifier
     - Required: Yes
     - Order: 1
  
  2. **Pressure in (bar)**
     - Type: numeric
     - Unit: bar
     - Description: Incoming pressure measurement
     - Required: Yes
     - Order: 2
  
  3. **Camber press setup (mm)**
     - Type: numeric
     - Unit: mm
     - Description: Camber press setup measurement
     - Required: Yes
     - Order: 3
*/

-- Insert measurement fields for press_in operation
INSERT INTO measurement_fields (operation_id, name, display_name, field_type, unit, required, "order")
SELECT 
  o.id,
  'press_station',
  'Press (A,B,C,D)',
  'text',
  NULL,
  true,
  1
FROM operations o
WHERE o.name = 'press_in'
ON CONFLICT DO NOTHING;

INSERT INTO measurement_fields (operation_id, name, display_name, field_type, unit, required, "order")
SELECT 
  o.id,
  'pressure_in',
  'Pressure in (bar)',
  'numeric',
  'bar',
  true,
  2
FROM operations o
WHERE o.name = 'press_in'
ON CONFLICT DO NOTHING;

INSERT INTO measurement_fields (operation_id, name, display_name, field_type, unit, required, "order")
SELECT 
  o.id,
  'camber_press_setup',
  'Camber press setup (mm)',
  'numeric',
  'mm',
  true,
  3
FROM operations o
WHERE o.name = 'press_in'
ON CONFLICT DO NOTHING;