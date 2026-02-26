/*
  # Update Camber height after field conditions

  1. Changes
    - Update "Camber height after" field to also appear when "Camber height" = "Fail"
    - The field now appears for both "Corrected" and "Fail" values
  
  2. Notes
    - Uses comma-separated values in depends_on_value to support multiple conditions
*/

UPDATE measurement_fields 
SET depends_on_value = 'Corrected,Fail'
WHERE name = 'camber_height_after' 
AND operation_id = '9903164d-52e5-4677-ba6d-2cbd59ea8a45';