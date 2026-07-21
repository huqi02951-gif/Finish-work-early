const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ quiet: true });

const MIGRATION_LOCK_ID = 76422021;

async function loadMigrations() {
  const migrationRoot = path.resolve(__dirname, '..', 'prisma', 'migrations');
  const entries = await fs.readdir(migrationRoot, { withFileTypes: true });

  return Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
      .map(async (name) => {
        const sql = await fs.readFile(path.join(migrationRoot, name, 'migration.sql'), 'utf8');
        return {
          name,
          sql,
          checksum: crypto.createHash('sha256').update(sql).digest('hex'),
        };
      }),
  );
}

function getConnectionString() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.delete('schema');
  return url.toString();
}

async function applyMigrations() {
  if (process.env.ALLOW_PRODUCTION_MIGRATION !== '1') {
    throw new Error('Set ALLOW_PRODUCTION_MIGRATION=1 to run database migrations');
  }

  const client = new Client({ connectionString: getConnectionString() });
  const migrations = await loadMigrations();
  await client.connect();

  try {
    const database = await client.query('SELECT current_database() AS name');
    console.log(`Migration target: ${database.rows[0].name}`);
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID]);

    const appliedResult = await client.query(
      'SELECT migration_name, checksum, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY migration_name',
    );
    const applied = new Map(appliedResult.rows.map((row) => [row.migration_name, row]));

    for (const migration of migrations) {
      const existing = applied.get(migration.name);
      if (existing) {
        if (!existing.finished_at || existing.rolled_back_at) {
          throw new Error(`Migration ${migration.name} has an unfinished or rolled-back record`);
        }
        if (existing.checksum !== migration.checksum) {
          throw new Error(`Migration ${migration.name} checksum differs from the applied record`);
        }
        console.log(`Already applied: ${migration.name}`);
        continue;
      }

      console.log(`Applying: ${migration.name}`);
      await client.query('BEGIN');
      try {
        await client.query(migration.sql);
        await client.query(
          `INSERT INTO "_prisma_migrations"
            (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
           VALUES ($1, $2, NOW(), $3, NULL, NULL, NOW(), 1)`,
          [crypto.randomUUID(), migration.checksum, migration.name],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log(`Migration check complete: ${migrations.length} migrations accounted for`);
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]).catch(() => undefined);
    await client.end();
  }
}

applyMigrations().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
