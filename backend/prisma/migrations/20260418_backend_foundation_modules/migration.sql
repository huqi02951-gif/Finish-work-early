CREATE TABLE IF NOT EXISTS "customer_contexts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "customer_name" VARCHAR(150) NOT NULL,
  "contact_person" VARCHAR(100),
  "phone" VARCHAR(50),
  "industry" VARCHAR(100),
  "channel" VARCHAR(100),
  "remark" TEXT,
  "extra_data" JSONB,
  "last_used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "customer_contexts_user_id_deleted_at_updated_at_idx"
  ON "customer_contexts"("user_id", "deleted_at", "updated_at");

CREATE INDEX IF NOT EXISTS "customer_contexts_customer_name_idx"
  ON "customer_contexts"("customer_name");

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" SERIAL PRIMARY KEY,
  "module" VARCHAR(100) NOT NULL,
  "action" VARCHAR(100) NOT NULL,
  "target_type" VARCHAR(100),
  "target_id" VARCHAR(100),
  "operator_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "detail" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "audit_logs_module_created_at_idx"
  ON "audit_logs"("module", "created_at");

CREATE INDEX IF NOT EXISTS "audit_logs_operator_id_created_at_idx"
  ON "audit_logs"("operator_id", "created_at");

CREATE INDEX IF NOT EXISTS "audit_logs_target_type_target_id_created_at_idx"
  ON "audit_logs"("target_type", "target_id", "created_at");
