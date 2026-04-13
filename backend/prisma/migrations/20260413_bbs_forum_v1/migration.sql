ALTER TYPE "PostStatus" ADD VALUE IF NOT EXISTS 'HIDDEN';
ALTER TYPE "PostStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

CREATE TYPE "BoardStatus" AS ENUM ('ACTIVE', 'HIDDEN');
CREATE TYPE "TagStatus" AS ENUM ('ACTIVE', 'HIDDEN');
CREATE TYPE "PostType" AS ENUM ('DISCUSSION', 'TOPIC', 'GUIDE', 'FAQ', 'UPDATE');
CREATE TYPE "PostSourceType" AS ENUM ('USER', 'ADMIN', 'SEED');
CREATE TYPE "ModerationAction" AS ENUM (
    'APPROVE',
    'REJECT',
    'HIDE',
    'RESTORE',
    'DELETE',
    'PIN',
    'UNPIN',
    'LOCK_COMMENTS',
    'UNLOCK_COMMENTS'
);

CREATE TABLE "boards" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "requires_review" BOOLEAN NOT NULL DEFAULT false,
    "status" "BoardStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "TagStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "post_tags" (
    "post_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("post_id","tag_id")
);

CREATE TABLE "moderation_logs" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER,
    "comment_id" INTEGER,
    "operator_id" INTEGER NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "reason" TEXT,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "posts"
ADD COLUMN "summary" TEXT,
ADD COLUMN "content_data" JSONB,
ADD COLUMN "external_key" TEXT,
ADD COLUMN "post_type" "PostType" NOT NULL DEFAULT 'DISCUSSION',
ADD COLUMN "source_type" "PostSourceType" NOT NULL DEFAULT 'USER',
ADD COLUMN "is_official" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pinned_at" TIMESTAMP(3),
ADD COLUMN "comments_locked_at" TIMESTAMP(3),
ADD COLUMN "reviewed_at" TIMESTAMP(3),
ADD COLUMN "review_reason" TEXT,
ADD COLUMN "related_product_slug" TEXT,
ADD COLUMN "related_skill_slug" TEXT,
ADD COLUMN "related_page_key" TEXT,
ADD COLUMN "board_id" INTEGER,
ADD COLUMN "reviewed_by_id" INTEGER;

CREATE UNIQUE INDEX "boards_slug_key" ON "boards"("slug");
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
CREATE UNIQUE INDEX "posts_external_key_key" ON "posts"("external_key");

CREATE INDEX "boards_status_sort_order_idx" ON "boards"("status", "sort_order");
CREATE INDEX "tags_status_sort_order_idx" ON "tags"("status", "sort_order");
CREATE INDEX "post_tags_tag_id_post_id_idx" ON "post_tags"("tag_id", "post_id");
CREATE INDEX "moderation_logs_post_id_created_at_idx" ON "moderation_logs"("post_id", "created_at");
CREATE INDEX "moderation_logs_comment_id_created_at_idx" ON "moderation_logs"("comment_id", "created_at");
CREATE INDEX "moderation_logs_operator_id_created_at_idx" ON "moderation_logs"("operator_id", "created_at");
CREATE INDEX "posts_board_id_status_is_pinned_created_at_idx" ON "posts"("board_id", "status", "is_pinned", "created_at");
CREATE INDEX "posts_is_official_status_is_pinned_created_at_idx" ON "posts"("is_official", "status", "is_pinned", "created_at");
CREATE INDEX "posts_post_type_status_created_at_idx" ON "posts"("post_type", "status", "created_at");
CREATE INDEX "posts_related_product_slug_idx" ON "posts"("related_product_slug");
CREATE INDEX "posts_related_skill_slug_idx" ON "posts"("related_skill_slug");
DROP INDEX IF EXISTS "comments_post_id_created_at_idx";
DROP INDEX IF EXISTS "comments_author_id_idx";
CREATE INDEX "comments_post_id_status_created_at_idx" ON "comments"("post_id", "status", "created_at");
CREATE INDEX "comments_author_id_created_at_idx" ON "comments"("author_id", "created_at");

ALTER TABLE "posts"
ADD CONSTRAINT "posts_board_id_fkey"
FOREIGN KEY ("board_id") REFERENCES "boards"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "posts"
ADD CONSTRAINT "posts_reviewed_by_id_fkey"
FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "post_tags"
ADD CONSTRAINT "post_tags_post_id_fkey"
FOREIGN KEY ("post_id") REFERENCES "posts"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "post_tags"
ADD CONSTRAINT "post_tags_tag_id_fkey"
FOREIGN KEY ("tag_id") REFERENCES "tags"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "moderation_logs"
ADD CONSTRAINT "moderation_logs_post_id_fkey"
FOREIGN KEY ("post_id") REFERENCES "posts"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "moderation_logs"
ADD CONSTRAINT "moderation_logs_comment_id_fkey"
FOREIGN KEY ("comment_id") REFERENCES "comments"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "moderation_logs"
ADD CONSTRAINT "moderation_logs_operator_id_fkey"
FOREIGN KEY ("operator_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
