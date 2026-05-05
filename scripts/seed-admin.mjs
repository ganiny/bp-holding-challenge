/**
 * Seed the initial admin user.
 *
 * Uses the service-role key. Reads INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD
 * from .env.local. Marks profile.role='admin' and sets must_change_password=true.
 *
 *   node scripts/seed-admin.mjs
 *
 * Idempotent: running twice will detect the existing user and skip the create
 * step but still ensure the profile is set to admin.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Tiny .env.local parser (avoids adding dotenv as a dep).
const envPath = join(__dirname, "..", ".env.local");
const env = {};
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let value = m[2];
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  env[m[1]] = value;
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = env.INITIAL_ADMIN_EMAIL;
const adminPassword = env.INITIAL_ADMIN_PASSWORD;

if (!url || !serviceRoleKey || !adminEmail || !adminPassword) {
  console.error("Missing required env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`→ Seeding admin: ${adminEmail}`);

let userId;

// 1) Try to create the user.
const createRes = await supabase.auth.admin.createUser({
  email: adminEmail,
  password: adminPassword,
  email_confirm: true,
  user_metadata: { role: "admin", full_name: "BP Holding Admin" },
});

if (createRes.error) {
  if (createRes.error.message?.toLowerCase().includes("already")) {
    console.log("  user already exists, looking up id...");
    const list = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (list.error) throw list.error;
    const existing = list.data.users.find((u) => u.email === adminEmail);
    if (!existing) {
      console.error("  could not locate existing user, aborting.");
      process.exit(1);
    }
    userId = existing.id;
  } else {
    console.error("  createUser failed:", createRes.error);
    process.exit(1);
  }
} else {
  userId = createRes.data.user.id;
  console.log(`  created user id=${userId}`);
}

// 2) Ensure profile row exists and is admin (trigger may have set role=employee).
const upsertRes = await supabase
  .from("profiles")
  .upsert(
    {
      id: userId,
      email: adminEmail,
      role: "admin",
      full_name: "BP Holding Admin",
      must_change_password: true,
    },
    { onConflict: "id" },
  )
  .select()
  .single();

if (upsertRes.error) {
  console.error("  profile upsert failed:", upsertRes.error);
  process.exit(1);
}

console.log(`✓ admin profile ready: ${upsertRes.data.email} (role=${upsertRes.data.role})`);
console.log("  must_change_password is true — first login should force a password change.");
