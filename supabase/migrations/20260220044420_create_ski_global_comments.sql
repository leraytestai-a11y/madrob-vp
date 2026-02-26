/*
  # Create ski_global_comments table

  ## Purpose
  Stores a persistent, cumulative comment per ski (identified by serial_number).
  This comment is shared across all operations for the same ski, so operators
  see notes left by previous operations without losing any history.

  ## New Tables
  - `ski_global_comments`
    - `id` (uuid, primary key)
    - `serial_number` (text, unique) - the ski identifier
    - `comment` (text) - the cumulative comment content
    - `updated_at` (timestamptz) - when this comment was last updated
    - `updated_by` (text, nullable) - operator initials who last updated

  ## Security
  - RLS enabled with public read/write (anon) access since the app uses anon key
*/

CREATE TABLE IF NOT EXISTS ski_global_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number text UNIQUE NOT NULL,
  comment text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

ALTER TABLE ski_global_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read global comments"
  ON ski_global_comments
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert global comments"
  ON ski_global_comments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update global comments"
  ON ski_global_comments
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
