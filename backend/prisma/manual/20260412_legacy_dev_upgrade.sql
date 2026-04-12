DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MANAGER');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PostStatus') THEN
    CREATE TYPE "PostStatus" AS ENUM ('PUBLISHED', 'PENDING', 'ARCHIVED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CommentStatus') THEN
    CREATE TYPE "CommentStatus" AS ENUM ('PUBLISHED', 'HIDDEN');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "password" TO "password_hash";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'createdAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updatedAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nickname" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "client_key" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'USER';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

UPDATE "users" SET "nickname" = "username" WHERE "nickname" IS NULL;

ALTER TABLE "users" ALTER COLUMN "nickname" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'authorId'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'author_id'
  ) THEN
    ALTER TABLE "posts" RENAME COLUMN "authorId" TO "author_id";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'createdAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE "posts" RENAME COLUMN "createdAt" TO "created_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'updatedAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE "posts" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;

ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT '经验分享';
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "status" "PostStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "posts" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "posts" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'authorId'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'author_id'
  ) THEN
    ALTER TABLE "comments" RENAME COLUMN "authorId" TO "author_id";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'postId'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'post_id'
  ) THEN
    ALTER TABLE "comments" RENAME COLUMN "postId" TO "post_id";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'createdAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE "comments" RENAME COLUMN "createdAt" TO "created_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'updatedAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE "comments" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;

ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "status" "CommentStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

ALTER TABLE "comments" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "comments" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "users_client_key_key" ON "users"("client_key");
CREATE INDEX IF NOT EXISTS "posts_author_id_idx" ON "posts"("author_id");
CREATE INDEX IF NOT EXISTS "posts_status_created_at_idx" ON "posts"("status", "created_at");
CREATE INDEX IF NOT EXISTS "comments_post_id_created_at_idx" ON "comments"("post_id", "created_at");
CREATE INDEX IF NOT EXISTS "comments_author_id_idx" ON "comments"("author_id");
