/**
 * Step 7 verification — confirm RLS does what we expect:
 *   - anon CAN insert into rfqs / job_applications / contractor_applications / contact_messages
 *   - anon CANNOT read those submission tables
 *   - anon CAN read services / projects / careers WHERE published/open
 *   - service_role can do anything
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(join(__dirname, "..", ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) {
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    env[m[1]] = v;
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const svc = createClient(url, serviceKey, { auth: { persistSession: false } });

const checks = [];
const expect = (label, ok, detail) => {
  checks.push({ label, ok, detail });
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? "  — " + detail : ""}`);
};

console.log("\n[anon] inserts into submission tables (should succeed)");
{
  const { error } = await anon
    .from("rfqs")
    .insert({
      full_name: "RLS Test User",
      email: "rls-test@example.com",
      phone: "+966500000000",
      description: "rls smoke test — safe to delete",
    });
  expect("rfqs.insert", !error, error?.message);
}
{
  const { error } = await anon.from("contact_messages").insert({
    full_name: "RLS Test",
    email: "rls-test@example.com",
    message: "rls smoke test — safe to delete",
  });
  expect("contact_messages.insert", !error, error?.message);
}

console.log("\n[anon] reads from submission tables (should be blocked)");
{
  const { data, error } = await anon.from("rfqs").select("id").limit(1);
  expect("rfqs.select blocked", !error && (!data || data.length === 0), error?.message ?? `rows=${data?.length}`);
}
{
  const { data, error } = await anon.from("job_applications").select("id").limit(1);
  expect("job_applications.select blocked", !error && (!data || data.length === 0), error?.message ?? `rows=${data?.length}`);
}

console.log("\n[anon] reads from public catalogs (should succeed; may be empty)");
{
  const { error } = await anon.from("services").select("id").limit(1);
  expect("services.select", !error, error?.message);
}
{
  const { error } = await anon.from("projects").select("id").limit(1);
  expect("projects.select", !error, error?.message);
}
{
  const { error } = await anon.from("careers").select("id").limit(1);
  expect("careers.select", !error, error?.message);
}

console.log("\n[anon] writes to admin-only tables (should be blocked)");
{
  const { error } = await anon.from("services").insert({
    slug: "rls-test",
    title_en: "x",
    title_ar: "x",
  });
  expect("services.insert blocked", !!error, error?.message);
}

console.log("\n[service_role] cleanup test rows");
{
  const r1 = await svc.from("rfqs").delete().eq("email", "rls-test@example.com");
  const r2 = await svc.from("contact_messages").delete().eq("email", "rls-test@example.com");
  expect("cleanup ok", !r1.error && !r2.error, [r1.error?.message, r2.error?.message].filter(Boolean).join(", "));
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n${failed.length === 0 ? "✓ all checks passed" : `✗ ${failed.length} failed`}`);
process.exit(failed.length === 0 ? 0 : 1);
