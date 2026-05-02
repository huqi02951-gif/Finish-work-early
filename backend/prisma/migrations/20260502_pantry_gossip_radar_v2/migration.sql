ALTER TABLE "posts"
  ADD COLUMN IF NOT EXISTS "bookmark_count" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "community_identities"
  ADD COLUMN IF NOT EXISTS "coffee_qr_url" TEXT,
  ADD COLUMN IF NOT EXISTS "coffee_note" TEXT,
  ADD COLUMN IF NOT EXISTS "coffee_public" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "reputation" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "post_bookmarks" (
  "id" SERIAL PRIMARY KEY,
  "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "post_bookmarks_post_id_user_id_key" UNIQUE ("post_id", "user_id")
);

CREATE INDEX IF NOT EXISTS "post_bookmarks_user_id_created_at_idx"
  ON "post_bookmarks"("user_id", "created_at");

CREATE INDEX IF NOT EXISTS "post_bookmarks_post_id_created_at_idx"
  ON "post_bookmarks"("post_id", "created_at");
