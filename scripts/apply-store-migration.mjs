/**
 * Apply the Phase 2 store migration (products / orders / order_items + sample data).
 *
 * Reads DATABASE_URL from .env.local and runs the SQL file directly via `pg`.
 * Idempotent-ish: detects "already exists" errors on the type/table create and
 * either ignores them (re-running on a fresh demo DB), or — if the products
 * table is already there — just refreshes the sample products.
 *
 *   node scripts/apply-store-migration.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Client } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = join(__dirname, "..", ".env.local");
const env = {};
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let v = m[2];
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  env[m[1]] = v;
}

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL missing from .env.local");
  process.exit(1);
}

const sqlPath = join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20260508120000_store.sql",
);
const sql = readFileSync(sqlPath, "utf8");

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("→ Connected to Postgres");

const { rows: existing } = await client.query(
  "select to_regclass('public.products') as exists",
);
const productsExist = existing[0]?.exists !== null;

if (productsExist) {
  console.log(
    "→ products table already exists; refreshing sample data only (no schema changes).",
  );

  // Re-extract just the INSERT block from the migration so we can re-seed
  // demo products without touching the schema.
  const insertMatch = sql.match(/insert into public\.products[\s\S]*?;\s*$/m);
  if (!insertMatch) {
    console.error("Could not find INSERT block in migration file.");
    process.exit(1);
  }

  // Wipe demo products and re-insert. Order rows referencing them keep their
  // snapshot data since `name_snapshot` and `price_sar` are stored on the
  // order_items row (and `order_items.product_id` is `on delete set null`).
  await client.query("begin");
  try {
    await client.query("delete from public.products");
    await client.query(insertMatch[0]);
    await client.query("commit");
    const { rows } = await client.query(
      "select count(*)::int as n from public.products",
    );
    console.log(`✓ Refreshed sample products: ${rows[0].n} rows.`);
  } catch (e) {
    await client.query("rollback");
    throw e;
  }
} else {
  console.log("→ Applying full migration (schema + RLS + sample data)…");
  await client.query(sql);
  const { rows } = await client.query(
    "select count(*)::int as n from public.products",
  );
  console.log(`✓ Migration applied. Sample products inserted: ${rows[0].n}.`);
}

await client.end();
console.log("Done.");
