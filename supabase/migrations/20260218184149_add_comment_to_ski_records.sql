/*
  # Add comment field to ski_records

  ## Changes
  - Adds a `comment` column (nullable text) to `ski_records`
  - This field will hold a persistent operator comment for the entire record
  - The comment can be updated at any time during data entry
  - It will be included in the n8n webhook payload for spreadsheet sync
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ski_records' AND column_name = 'comment'
  ) THEN
    ALTER TABLE ski_records ADD COLUMN comment text DEFAULT NULL;
  END IF;
END $$;
