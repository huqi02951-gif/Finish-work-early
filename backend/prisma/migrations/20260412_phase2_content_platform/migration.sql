CREATE TYPE "CatalogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'OFFLINE');

CREATE TABLE "page_configs" (
    "id" SERIAL NOT NULL,
    "page_key" TEXT NOT NULL,
    "config_data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "updated_by_id" INTEGER,

    CONSTRAINT "page_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "summary" TEXT NOT NULL,
    "cover_url" TEXT,
    "target_url" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'DRAFT',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "detail_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "summary" TEXT NOT NULL,
    "tool_route" TEXT,
    "form_label" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'DRAFT',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "detail_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_skill_rel" (
    "product_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_skill_rel_pkey" PRIMARY KEY ("product_id","skill_id")
);

CREATE UNIQUE INDEX "page_configs_page_key_key" ON "page_configs"("page_key");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

CREATE INDEX "page_configs_deleted_at_idx" ON "page_configs"("deleted_at");
CREATE INDEX "products_status_sort_order_idx" ON "products"("status", "sort_order");
CREATE INDEX "products_deleted_at_idx" ON "products"("deleted_at");
CREATE INDEX "skills_status_sort_order_idx" ON "skills"("status", "sort_order");
CREATE INDEX "skills_deleted_at_idx" ON "skills"("deleted_at");
CREATE INDEX "product_skill_rel_product_id_sort_order_idx" ON "product_skill_rel"("product_id", "sort_order");
CREATE INDEX "product_skill_rel_skill_id_sort_order_idx" ON "product_skill_rel"("skill_id", "sort_order");

ALTER TABLE "page_configs"
ADD CONSTRAINT "page_configs_updated_by_id_fkey"
FOREIGN KEY ("updated_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_skill_rel"
ADD CONSTRAINT "product_skill_rel_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_skill_rel"
ADD CONSTRAINT "product_skill_rel_skill_id_fkey"
FOREIGN KEY ("skill_id") REFERENCES "skills"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
