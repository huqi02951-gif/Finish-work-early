DO $$ BEGIN
  CREATE TYPE "PantryNotificationType" AS ENUM ('ORDER', 'MESSAGE', 'REPORT', 'SYSTEM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "pantry_notifications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" "PantryNotificationType" NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "body" TEXT,
  "target_type" VARCHAR(80),
  "target_id" INTEGER,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "pantry_notifications_user_id_read_at_created_at_idx"
  ON "pantry_notifications"("user_id", "read_at", "created_at");

CREATE INDEX IF NOT EXISTS "pantry_notifications_type_created_at_idx"
  ON "pantry_notifications"("type", "created_at");

UPDATE "conversations"
SET "listing_id" = NULL
WHERE "listing_id" = 0;

ALTER TABLE "conversations"
  DROP CONSTRAINT IF EXISTS "conversations_user_a_id_user_b_id_listing_id_key";

CREATE UNIQUE INDEX IF NOT EXISTS "conversations_user_a_id_user_b_id_listing_id_order_id_key"
  ON "conversations"("user_a_id", "user_b_id", "listing_id", "order_id");
