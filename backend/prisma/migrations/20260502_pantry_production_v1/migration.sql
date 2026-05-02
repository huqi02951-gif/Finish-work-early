DO $$ BEGIN
  CREATE TYPE "PantryIdentityStatus" AS ENUM ('ACTIVE', 'MUTED', 'BANNED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PantryVisibilityMode" AS ENUM ('PERMANENT', 'EPHEMERAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PantryReactionType" AS ENUM ('FIRE', 'BRICK', 'EYES', 'TEA', 'SUPPORT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PantryReportTargetType" AS ENUM ('POST', 'COMMENT', 'LISTING', 'MESSAGE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PantryReportStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MarketListingType" AS ENUM ('SELL', 'WANTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MarketListingStatus" AS ENUM ('ACTIVE', 'RESERVED', 'SOLD', 'CANCELLED', 'HIDDEN', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TradeOrderStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'PAID_OFF_PLATFORM', 'COMPLETED', 'CANCELLED', 'DISPUTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DirectMessageStatus" AS ENUM ('SENT', 'HIDDEN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "posts"
  ADD COLUMN IF NOT EXISTS "visibility_mode" "PantryVisibilityMode" NOT NULL DEFAULT 'PERMANENT',
  ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "anonymous_alias" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "heat_score" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "reaction_count" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "posts_board_id_status_visibility_mode_expires_at_idx"
  ON "posts"("board_id", "status", "visibility_mode", "expires_at");

CREATE INDEX IF NOT EXISTS "posts_heat_score_reaction_count_created_at_idx"
  ON "posts"("heat_score", "reaction_count", "created_at");

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

CREATE TABLE IF NOT EXISTS "post_reactions" (
  "id" SERIAL PRIMARY KEY,
  "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" "PantryReactionType" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "post_reactions_post_id_user_id_type_key" UNIQUE ("post_id", "user_id", "type")
);

CREATE INDEX IF NOT EXISTS "post_reactions_user_id_created_at_idx"
  ON "post_reactions"("user_id", "created_at");

CREATE INDEX IF NOT EXISTS "post_reactions_post_id_type_idx"
  ON "post_reactions"("post_id", "type");

CREATE TABLE IF NOT EXISTS "reports" (
  "id" SERIAL PRIMARY KEY,
  "reporter_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "target_type" "PantryReportTargetType" NOT NULL,
  "target_id" INTEGER NOT NULL,
  "reason" VARCHAR(100) NOT NULL,
  "detail" TEXT,
  "status" "PantryReportStatus" NOT NULL DEFAULT 'OPEN',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "reports_target_type_target_id_status_idx"
  ON "reports"("target_type", "target_id", "status");

CREATE INDEX IF NOT EXISTS "reports_reporter_id_created_at_idx"
  ON "reports"("reporter_id", "created_at");

CREATE INDEX IF NOT EXISTS "reports_status_created_at_idx"
  ON "reports"("status", "created_at");

CREATE TABLE IF NOT EXISTS "market_listings" (
  "id" SERIAL PRIMARY KEY,
  "seller_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" "MarketListingType" NOT NULL DEFAULT 'SELL',
  "title" VARCHAR(160) NOT NULL,
  "description" TEXT NOT NULL,
  "category" VARCHAR(80) NOT NULL,
  "condition" VARCHAR(80),
  "price_cents" INTEGER,
  "price_text" VARCHAR(80),
  "status" "MarketListingStatus" NOT NULL DEFAULT 'ACTIVE',
  "anonymous_alias" VARCHAR(80) NOT NULL,
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "market_listings_status_type_created_at_idx"
  ON "market_listings"("status", "type", "created_at");

CREATE INDEX IF NOT EXISTS "market_listings_seller_id_status_created_at_idx"
  ON "market_listings"("seller_id", "status", "created_at");

CREATE INDEX IF NOT EXISTS "market_listings_category_status_created_at_idx"
  ON "market_listings"("category", "status", "created_at");

CREATE TABLE IF NOT EXISTS "trade_orders" (
  "id" SERIAL PRIMARY KEY,
  "listing_id" INTEGER NOT NULL REFERENCES "market_listings"("id") ON DELETE CASCADE,
  "buyer_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "seller_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" "TradeOrderStatus" NOT NULL DEFAULT 'REQUESTED',
  "note" TEXT,
  "off_platform_note" TEXT,
  "dispute_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "trade_orders_buyer_id_status_created_at_idx"
  ON "trade_orders"("buyer_id", "status", "created_at");

CREATE INDEX IF NOT EXISTS "trade_orders_seller_id_status_created_at_idx"
  ON "trade_orders"("seller_id", "status", "created_at");

CREATE INDEX IF NOT EXISTS "trade_orders_listing_id_created_at_idx"
  ON "trade_orders"("listing_id", "created_at");

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" SERIAL PRIMARY KEY,
  "user_a_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "user_b_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "listing_id" INTEGER,
  "order_id" INTEGER,
  "last_message" TEXT,
  "last_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "conversations_user_a_id_user_b_id_listing_id_key" UNIQUE ("user_a_id", "user_b_id", "listing_id")
);

CREATE INDEX IF NOT EXISTS "conversations_user_a_id_last_at_idx"
  ON "conversations"("user_a_id", "last_at");

CREATE INDEX IF NOT EXISTS "conversations_user_b_id_last_at_idx"
  ON "conversations"("user_b_id", "last_at");

CREATE TABLE IF NOT EXISTS "direct_messages" (
  "id" SERIAL PRIMARY KEY,
  "conversation_id" INTEGER NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "sender_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "status" "DirectMessageStatus" NOT NULL DEFAULT 'SENT',
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "direct_messages_conversation_id_created_at_idx"
  ON "direct_messages"("conversation_id", "created_at");

CREATE INDEX IF NOT EXISTS "direct_messages_sender_id_created_at_idx"
  ON "direct_messages"("sender_id", "created_at");
