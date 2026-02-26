/*
  # Add operator tracking to ski records

  1. Schema Changes
    - Add `operator_initials` column to `ski_records` table
    - This tracks which operator performed the measurements
    - Links to the operators table through initials
  
  2. Notes
    - Column is nullable to support existing records
    - Should be set for all new records going forward
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ski_records' AND column_name = 'operator_initials'
  ) THEN
    ALTER TABLE ski_records ADD COLUMN operator_initials text;
    
    ALTER TABLE ski_records 
      ADD CONSTRAINT fk_ski_records_operator 
      FOREIGN KEY (operator_initials) 
      REFERENCES operators(initials) 
      ON DELETE SET NULL;
  END IF;
END $$;