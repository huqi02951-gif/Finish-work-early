-- Pantry v2 adds profile fields to community_identities before the original
-- production migration creates that table. Keep this prerequisite additive
-- and idempotent so both fresh databases and existing deployments are safe.
DO $$ BEGIN
  CREATE TYPE "PantryIdentityStatus" AS ENUM ('ACTIVE', 'MUTED', 'BANNED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "community_identities" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "alias" VARCHAR(80) NOT NULL UNIQUE,
  "color" VARCHAR(24) NOT NULL,
  "status" "PantryIdentityStatus" NOT NULL DEFAULT 'ACTIVE',
  "muted_until" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "community_identities_status_updated_at_idx"
  ON "community_identities"("status", "updated_at");
