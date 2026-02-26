/*
  # Create app_config table

  1. New Tables
    - `app_config`
      - `key` (text, primary key) - config key name
      - `value` (text) - config value
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `app_config` table
    - No direct read access from client (only via edge function)

  3. Notes
    - Stores hashed app credentials
    - The password hash is inserted directly here
*/

CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

INSERT INTO app_config (key, value)
VALUES (
  'app_password_hash',
  encode(digest('I<3Verbier', 'sha256'), 'hex')
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app_config (key, value)
VALUES (
  'app_username',
  'Team FTSA'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
