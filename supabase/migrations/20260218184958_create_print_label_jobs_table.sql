/*
  # Create print_label_jobs table

  ## Purpose
  Tracks every label print request triggered from the app.
  Each job records which SKU was printed, which serial number was assigned,
  the operator who triggered it, and the current status.

  ## New Tables
  - `print_label_jobs`
    - `id` (uuid, primary key)
    - `sku` (text) - the SKU selected by the operator
    - `serial_number` (text) - the serial number assigned by n8n from the spreadsheet
    - `operator_initials` (text, nullable) - who triggered the print
    - `status` (text) - 'pending' | 'printing' | 'done' | 'error'
    - `error_message` (text, nullable) - error detail if status = 'error'
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public insert (tablet is not authenticated)
  - Public select (tablet needs to read status)
  - Public update (edge function/n8n callback updates status)
*/

CREATE TABLE IF NOT EXISTS print_label_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL,
  serial_number text,
  operator_initials text DEFAULT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'done', 'error')),
  error_message text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE print_label_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert print jobs"
  ON print_label_jobs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can select print jobs"
  ON print_label_jobs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update print jobs"
  ON print_label_jobs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
