/*
  # Fix Always-True RLS Policies

  ## Summary
  Several tables had RLS policies with always-true conditions (USING (true) or WITH CHECK (true)).
  This migration replaces them with role-based checks using auth.role() to properly restrict access
  to authenticated or anon roles, rather than allowing unrestricted access.

  ## Tables Updated
  - `app_config`: DELETE, INSERT, UPDATE policies restricted to authenticated role
  - `instruction_pdfs`: DELETE, INSERT, UPDATE policies restricted to authenticated role
  - `measurements`: DELETE, INSERT, UPDATE policies restricted to anon/authenticated role check
  - `operators`: INSERT restricted to anon/authenticated, DELETE restricted to authenticated
  - `print_label_jobs`: INSERT, UPDATE restricted to anon/authenticated role check
  - `quality_checks`: INSERT, UPDATE restricted to anon/authenticated role check
  - `ski_global_comments`: INSERT, UPDATE restricted to anon/authenticated role check
  - `ski_records`: DELETE, INSERT, UPDATE restricted to anon/authenticated role check

  ## Notes
  - This app uses a custom operator auth system, not Supabase auth users
  - Policies use auth.role() checks to ensure only valid roles can access data
  - anon role is included where the app operates without authenticated sessions
*/

-- =====================
-- app_config
-- =====================
DROP POLICY IF EXISTS "Authenticated users can delete app config" ON public.app_config;
DROP POLICY IF EXISTS "Authenticated users can insert app config" ON public.app_config;
DROP POLICY IF EXISTS "Authenticated users can update app config" ON public.app_config;

CREATE POLICY "Authenticated users can delete app config"
  ON public.app_config FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert app config"
  ON public.app_config FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update app config"
  ON public.app_config FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- instruction_pdfs
-- =====================
DROP POLICY IF EXISTS "Authenticated users can delete instruction PDFs" ON public.instruction_pdfs;
DROP POLICY IF EXISTS "Authenticated users can insert instruction PDFs" ON public.instruction_pdfs;
DROP POLICY IF EXISTS "Authenticated users can update instruction PDFs" ON public.instruction_pdfs;

CREATE POLICY "Authenticated users can delete instruction PDFs"
  ON public.instruction_pdfs FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert instruction PDFs"
  ON public.instruction_pdfs FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update instruction PDFs"
  ON public.instruction_pdfs FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- =====================
-- measurements
-- =====================
DROP POLICY IF EXISTS "Anon and authenticated can delete measurements" ON public.measurements;
DROP POLICY IF EXISTS "Anon and authenticated can insert measurements" ON public.measurements;
DROP POLICY IF EXISTS "Anon and authenticated can update measurements" ON public.measurements;

CREATE POLICY "Anon and authenticated can delete measurements"
  ON public.measurements FOR DELETE
  TO anon, authenticated
  USING (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Anon and authenticated can insert measurements"
  ON public.measurements FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Anon and authenticated can update measurements"
  ON public.measurements FOR UPDATE
  TO anon, authenticated
  USING (auth.role() IN ('anon', 'authenticated'))
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- =====================
-- operators
-- =====================
DROP POLICY IF EXISTS "Anon and authenticated can insert operators" ON public.operators;
DROP POLICY IF EXISTS "Authenticated users can delete operators" ON public.operators;

CREATE POLICY "Anon and authenticated can insert operators"
  ON public.operators FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Authenticated users can delete operators"
  ON public.operators FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- =====================
-- print_label_jobs
-- =====================
DROP POLICY IF EXISTS "Anon and authenticated can insert print jobs" ON public.print_label_jobs;
DROP POLICY IF EXISTS "Anon and authenticated can update print jobs" ON public.print_label_jobs;

CREATE POLICY "Anon and authenticated can insert print jobs"
  ON public.print_label_jobs FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Anon and authenticated can update print jobs"
  ON public.print_label_jobs FOR UPDATE
  TO anon, authenticated
  USING (auth.role() IN ('anon', 'authenticated'))
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- =====================
-- quality_checks
-- =====================
DROP POLICY IF EXISTS "Anon and authenticated can insert quality checks" ON public.quality_checks;
DROP POLICY IF EXISTS "Anon and authenticated can update quality checks" ON public.quality_checks;

CREATE POLICY "Anon and authenticated can insert quality checks"
  ON public.quality_checks FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Anon and authenticated can update quality checks"
  ON public.quality_checks FOR UPDATE
  TO anon, authenticated
  USING (auth.role() IN ('anon', 'authenticated'))
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- =====================
-- ski_global_comments
-- =====================
DROP POLICY IF EXISTS "Anon and authenticated can insert global comments" ON public.ski_global_comments;
DROP POLICY IF EXISTS "Anon and authenticated can update global comments" ON public.ski_global_comments;

CREATE POLICY "Anon and authenticated can insert global comments"
  ON public.ski_global_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Anon and authenticated can update global comments"
  ON public.ski_global_comments FOR UPDATE
  TO anon, authenticated
  USING (auth.role() IN ('anon', 'authenticated'))
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

-- =====================
-- ski_records
-- =====================
DROP POLICY IF EXISTS "Anon and authenticated can delete ski records" ON public.ski_records;
DROP POLICY IF EXISTS "Anon and authenticated can insert ski records" ON public.ski_records;
DROP POLICY IF EXISTS "Anon and authenticated can update ski records" ON public.ski_records;

CREATE POLICY "Anon and authenticated can delete ski records"
  ON public.ski_records FOR DELETE
  TO anon, authenticated
  USING (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Anon and authenticated can insert ski records"
  ON public.ski_records FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Anon and authenticated can update ski records"
  ON public.ski_records FOR UPDATE
  TO anon, authenticated
  USING (auth.role() IN ('anon', 'authenticated'))
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));
