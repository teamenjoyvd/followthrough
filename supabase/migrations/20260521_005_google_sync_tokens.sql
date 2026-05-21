-- Add OAuth token columns to google_sync_state
-- Tokens are stored encrypted (AES-GCM via crypto.subtle) — never plaintext
ALTER TABLE google_sync_state
  ADD COLUMN IF NOT EXISTS access_token  text,
  ADD COLUMN IF NOT EXISTS refresh_token text;
