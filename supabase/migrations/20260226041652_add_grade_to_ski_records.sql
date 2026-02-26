/*
  # Add grade column to ski_records

  ## Summary
  Adds a `grade` text column to the `ski_records` table to store the quality grade
  assigned to each ski (e.g., "A", "A-", "B", "C").

  ## Changes
  - `ski_records`: New column `grade` (text, nullable) — stores the final quality grade
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ski_records' AND column_name = 'grade'
  ) THEN
    ALTER TABLE ski_records ADD COLUMN grade text;
  END IF;
END $$;
