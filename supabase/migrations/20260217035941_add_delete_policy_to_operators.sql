/*
  # Add delete policy to operators table

  1. Security Changes
    - Add policy to allow anyone to delete operators
    - This enables operators to be removed from the system when needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'operators' 
    AND policyname = 'Anyone can delete operators'
  ) THEN
    CREATE POLICY "Anyone can delete operators"
      ON operators
      FOR DELETE
      USING (true);
  END IF;
END $$;