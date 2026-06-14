ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "supabase_auth_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "users_supabase_auth_id_key"
  ON "users"("supabase_auth_id");
