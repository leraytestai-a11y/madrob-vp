/*
  # Add SKU to ski_records

  1. Changes
    - Adds `sku` column to `ski_records` table (nullable text)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ski_records' AND column_name = 'sku'
  ) THEN
    ALTER TABLE ski_records ADD COLUMN sku text;
  END IF;
END $$;
