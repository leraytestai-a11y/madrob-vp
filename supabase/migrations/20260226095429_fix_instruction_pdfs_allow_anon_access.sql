/*
  # Fix instruction_pdfs RLS policies to allow anon access

  ## Summary
  The instruction_pdfs INSERT, UPDATE, and DELETE policies were restricted to
  the `authenticated` role only. Since this app uses a custom operator login
  (not Supabase Auth), all requests come through the anon key. This migration
  updates the policies to also allow the `anon` role, consistent with how other
  tables in the app are configured.

  ## Changes
  - DROP existing authenticated-only INSERT/UPDATE/DELETE policies on instruction_pdfs
  - RECREATE them to include both anon and authenticated roles
*/

DROP POLICY IF EXISTS "Authenticated users can insert instruction PDFs" ON public.instruction_pdfs;
DROP POLICY IF EXISTS "Authenticated users can update instruction PDFs" ON public.instruction_pdfs;
DROP POLICY IF EXISTS "Authenticated users can delete instruction PDFs" ON public.instruction_pdfs;

CREATE POLICY "Anon and authenticated can insert instruction PDFs"
  ON public.instruction_pdfs FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Anon and authenticated can update instruction PDFs"
  ON public.instruction_pdfs FOR UPDATE
  TO anon, authenticated
  USING (auth.role() IN ('anon', 'authenticated'))
  WITH CHECK (auth.role() IN ('anon', 'authenticated'));

CREATE POLICY "Anon and authenticated can delete instruction PDFs"
  ON public.instruction_pdfs FOR DELETE
  TO anon, authenticated
  USING (auth.role() IN ('anon', 'authenticated'));
