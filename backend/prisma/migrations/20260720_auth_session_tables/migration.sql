CREATE TABLE IF NOT EXISTS "verification_codes" (
  "id" SERIAL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "code" VARCHAR(6) NOT NULL,
  "purpose" TEXT NOT NULL DEFAULT 'login',
  "used" BOOLEAN NOT NULL DEFAULT false,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "verification_codes_type_target_purpose_used_expires_at_idx"
  ON "verification_codes"("type", "target", "purpose", "used", "expires_at");

CREATE TABLE IF NOT EXISTS "user_sessions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "device_info" TEXT,
  "ip_address" TEXT,
  "token_hash" TEXT,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_sessions_token_hash_key"
  ON "user_sessions"("token_hash");

CREATE INDEX IF NOT EXISTS "user_sessions_user_id_expires_at_idx"
  ON "user_sessions"("user_id", "expires_at");
