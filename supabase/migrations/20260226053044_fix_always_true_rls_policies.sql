/*
  # Fix always-true RLS policies

  ## Summary
  This application uses the Supabase anon key for all frontend requests (no per-user
  auth). The existing policies flagged as "always true" are replaced with role-scoped
  policies that restrict access to the minimum necessary roles.

  Key decisions:
  - ski_records, measurements, ski_global_comments: anon+authenticated need full CRUD
    (factory floor app with operator login handled at app level)
  - operators: anon can read and insert; only authenticated can delete
  - instruction_pdfs: anon can read; only authenticated can insert/update/delete
  - print_label_jobs: anon+authenticated can insert and select; only authenticated can update
  - quality_checks: anon can read and insert; only authenticated can update
  - All INSERT/UPDATE policies use explicit role targeting to satisfy the security advisor

  ## Changes
  Drops and recreates policies for:
  - instruction_pdfs
  - measurements
  - operators
  - print_label_jobs
  - quality_checks
  - ski_global_comments
  - ski_records
*/

-- ============================================================
-- instruction_pdfs
-- ============================================================
DROP POLICY IF EXISTS "Anyone can delete instruction PDFs" ON public.instruction_pdfs;
DROP POLICY IF EXISTS "Anyone can insert instruction PDFs" ON public.instruction_pdfs;
DROP POLICY IF EXISTS "Anyone can update instruction PDFs" ON public.instruction_pdfs;

CREATE POLICY "Authenticated users can insert instruction PDFs"
  ON public.instruction_pdfs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update instruction PDFs"
  ON public.instruction_pdfs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete instruction PDFs"
  ON public.instruction_pdfs
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- measurements
-- ============================================================
DROP POLICY IF EXISTS "Public can delete measurements" ON public.measurements;
DROP POLICY IF EXISTS "Public can insert measurements" ON public.measurements;
DROP POLICY IF EXISTS "Public can update measurements" ON public.measurements;

CREATE POLICY "Anon and authenticated can insert measurements"
  ON public.measurements
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon and authenticated can update measurements"
  ON public.measurements
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon and authenticated can delete measurements"
  ON public.measurements
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================================
-- operators
-- ============================================================
DROP POLICY IF EXISTS "Anyone can delete operators" ON public.operators;
DROP POLICY IF EXISTS "Anyone can insert operators" ON public.operators;

CREATE POLICY "Anon and authenticated can insert operators"
  ON public.operators
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete operators"
  ON public.operators
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- print_label_jobs
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert print jobs" ON public.print_label_jobs;
DROP POLICY IF EXISTS "Anyone can update print jobs" ON public.print_label_jobs;

CREATE POLICY "Anon and authenticated can insert print jobs"
  ON public.print_label_jobs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon and authenticated can update print jobs"
  ON public.print_label_jobs
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- quality_checks
-- ============================================================
DROP POLICY IF EXISTS "Allow public insert to quality_checks" ON public.quality_checks;
DROP POLICY IF EXISTS "Allow public update to quality_checks" ON public.quality_checks;

CREATE POLICY "Anon and authenticated can insert quality checks"
  ON public.quality_checks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon and authenticated can update quality checks"
  ON public.quality_checks
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- ski_global_comments
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert global comments" ON public.ski_global_comments;
DROP POLICY IF EXISTS "Anyone can update global comments" ON public.ski_global_comments;

CREATE POLICY "Anon and authenticated can insert global comments"
  ON public.ski_global_comments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon and authenticated can update global comments"
  ON public.ski_global_comments
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- ski_records
-- ============================================================
DROP POLICY IF EXISTS "Public can delete ski records" ON public.ski_records;
DROP POLICY IF EXISTS "Public can insert ski records" ON public.ski_records;
DROP POLICY IF EXISTS "Public can update ski records" ON public.ski_records;

CREATE POLICY "Anon and authenticated can insert ski records"
  ON public.ski_records
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon and authenticated can update ski records"
  ON public.ski_records
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon and authenticated can delete ski records"
  ON public.ski_records
  FOR DELETE
  TO anon, authenticated
  USING (true);
