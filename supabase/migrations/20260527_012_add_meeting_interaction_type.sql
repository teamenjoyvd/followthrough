-- Add 'meeting' value to interaction_type enum
-- NOTE: ALTER TYPE ... ADD VALUE must NOT be wrapped in a transaction block.
-- Supabase migration runner executes each migration outside an explicit transaction by default.
ALTER TYPE interaction_type ADD VALUE IF NOT EXISTS 'meeting';
