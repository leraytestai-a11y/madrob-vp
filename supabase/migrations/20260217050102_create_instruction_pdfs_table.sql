/*
  # Create Instruction PDFs Table

  1. New Tables
    - `instruction_pdfs`
      - `id` (uuid, primary key)
      - `field_id` (uuid, foreign key to measurement_fields)
      - `file_name` (text)
      - `file_url` (text) - URL to the PDF in storage
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `instruction_pdfs` table
    - Add policy for public read access to instruction PDFs
    - Add policy for public insert/update/delete (since no auth system is used)
  
  3. Storage
    - Create a storage bucket for instruction PDFs
    - Set bucket to public access for reading
*/

-- Create instruction_pdfs table
CREATE TABLE IF NOT EXISTS instruction_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES measurement_fields(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE instruction_pdfs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view instruction PDFs"
  ON instruction_pdfs
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert instruction PDFs"
  ON instruction_pdfs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update instruction PDFs"
  ON instruction_pdfs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete instruction PDFs"
  ON instruction_pdfs
  FOR DELETE
  USING (true);

-- Create storage bucket for instruction PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('instruction-pdfs', 'instruction-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public can view instruction PDFs"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'instruction-pdfs');

CREATE POLICY "Anyone can upload instruction PDFs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'instruction-pdfs');

CREATE POLICY "Anyone can update instruction PDFs"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'instruction-pdfs')
  WITH CHECK (bucket_id = 'instruction-pdfs');

CREATE POLICY "Anyone can delete instruction PDFs"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'instruction-pdfs');
