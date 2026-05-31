const { createClient } = require("@supabase/supabase-js");
const { readdirSync, readFileSync } = require("node:fs");
const { join } = require("node:path");
const { schemaContract } = require("./schema-contract.cjs");
const { checkSupabaseReferences } = require("./schema-reference-check.cjs");

const root = join(__dirname, "..");

async function main() {
  verifyAppReferences();
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    verifyMigrationCoverage();
    console.log("schema:verify passed locally. Set Supabase env vars to verify the remote database.");
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const missing = [];
  for (const [table, columns] of Object.entries(schemaContract)) {
    const { error } = await supabase.from(table).select(columns.join(",")).limit(0);
    if (error) missing.push(`${table}: ${error.message}`);
  }
  if (missing.length) {
    console.error("schema:verify failed:");
    missing.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }
  console.log("schema:verify passed against Supabase.");
}

function verifyAppReferences() {
  const problems = checkSupabaseReferences();
  if (problems.length) {
    console.error("schema:verify app reference check failed:");
    problems.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }
}

function verifyMigrationCoverage() {
  const migrationsDir = join(root, "supabase", "migrations");
  const latest = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => readFileSync(join(migrationsDir, file), "utf8"))
    .join("\n");
  const missing = [];
  for (const [table, columns] of Object.entries(schemaContract)) {
    if (!latest.includes(table)) missing.push(`${table}: table contract missing`);
    columns.forEach((column) => {
      if (!latest.includes(column)) missing.push(`${table}.${column}`);
    });
  }
  if (missing.length) {
    console.error("schema:verify local contract failed:");
    missing.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
