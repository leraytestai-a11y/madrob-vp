/*
  # Add Operation and Module Instructions Support

  1. Changes to `instruction_pdfs` table
    - Add `operation_id` (uuid, optional foreign key to operations)
    - Add `module_id` (uuid, optional foreign key to modules)
    - Add constraint to ensure only one of field_id, operation_id, or module_id is set
    - Make field_id nullable since now we have multiple types
  
  2. Security
    - RLS policies remain the same (public access)
  
  3. Notes
    - Each instruction PDF must be linked to exactly one of: field, operation, or module
    - This allows instructions at different levels of granularity
*/

-- Make field_id nullable
ALTER TABLE instruction_pdfs 
  ALTER COLUMN field_id DROP NOT NULL;

-- Add new columns
ALTER TABLE instruction_pdfs 
  ADD COLUMN IF NOT EXISTS operation_id uuid REFERENCES operations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES modules(id) ON DELETE CASCADE;

-- Add constraint to ensure exactly one reference is set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'instruction_pdfs_single_reference'
  ) THEN
    ALTER TABLE instruction_pdfs
      ADD CONSTRAINT instruction_pdfs_single_reference
      CHECK (
        (field_id IS NOT NULL AND operation_id IS NULL AND module_id IS NULL) OR
        (field_id IS NULL AND operation_id IS NOT NULL AND module_id IS NULL) OR
        (field_id IS NULL AND operation_id IS NULL AND module_id IS NOT NULL)
      );
  END IF;
END $$;

-- Create unique indexes to prevent duplicate PDFs for the same entity
CREATE UNIQUE INDEX IF NOT EXISTS instruction_pdfs_field_id_unique 
  ON instruction_pdfs(field_id) WHERE field_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS instruction_pdfs_operation_id_unique 
  ON instruction_pdfs(operation_id) WHERE operation_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS instruction_pdfs_module_id_unique 
  ON instruction_pdfs(module_id) WHERE module_id IS NOT NULL;
