/*
  # Add RLS policies for app_config table

  ## Summary
  The `app_config` table has RLS enabled but no policies, meaning no one can
  access it. This migration adds read-only access for authenticated and anonymous
  users (config is public read), and restricts writes to authenticated users only.

  ## Security Changes
  - SELECT: allowed for anon and authenticated (config values are read by the app)
  - INSERT: restricted to authenticated users only
  - UPDATE: restricted to authenticated users only
  - DELETE: restricted to authenticated users only
*/

CREATE POLICY "Public can read app config"
  ON public.app_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert app config"
  ON public.app_config
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update app config"
  ON public.app_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete app config"
  ON public.app_config
  FOR DELETE
  TO authenticated
  USING (true);
