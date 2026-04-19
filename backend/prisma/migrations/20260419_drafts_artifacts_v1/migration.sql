CREATE TABLE IF NOT EXISTS "drafts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "tool_id" VARCHAR(100) NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "data" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "drafts_user_id_tool_id_updated_at_idx"
  ON "drafts"("user_id", "tool_id", "updated_at");

CREATE INDEX IF NOT EXISTS "drafts_user_id_deleted_at_updated_at_idx"
  ON "drafts"("user_id", "deleted_at", "updated_at");

CREATE TABLE IF NOT EXISTS "artifacts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "tool_id" VARCHAR(100) NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "artifacts_user_id_tool_id_created_at_idx"
  ON "artifacts"("user_id", "tool_id", "created_at");

CREATE INDEX IF NOT EXISTS "artifacts_user_id_deleted_at_created_at_idx"
  ON "artifacts"("user_id", "deleted_at", "created_at");
