import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type CsvRow = Record<string, string>;
type HospitalRow = {
  address: string;
  contact: string;
  email: string;
  facility_type: string;
  license_number: string;
  municipality: string;
  name: string;
  province: string;
  verified: boolean;
};

const required = [
  "name",
  "type",
  "province",
  "municipality",
  "address",
  "phone",
  "email",
  "license_number",
  "verified"
] as const;
const expected = [...required];

async function main() {
  const csvPath = resolve(process.argv[2] ?? "data/imports/angola_hospitals.csv");
  const rows = parseCsv(readFileSync(csvPath, "utf8"));
  const hospitals = normalizeRows(rows);
  const client = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));

  console.info(`[import-hospitals] CSV: ${csvPath}`);
  console.info(`[import-hospitals] Linhas válidas: ${hospitals.length}`);
  const { data, error } = await client
    .from("hospitals")
    .upsert(hospitals, { onConflict: "name,province,municipality" })
    .select("id,name,province,municipality,verified");

  if (error) throw new Error(`Falha Supabase: ${error.message}`);
  console.info(`[import-hospitals] Importados/atualizados: ${data?.length ?? 0}`);
}

function normalizeRows(rows: CsvRow[]) {
  const seen = new Set<string>();
  return rows.map(validateRow).filter((row) => {
    const key = dedupeKey(row);
    if (seen.has(key)) {
      console.warn(`[import-hospitals] Duplicado ignorado: ${row.name} / ${row.province} / ${row.municipality}`);
      return false;
    }
    seen.add(key);
    return true;
  });
}

function validateRow(row: CsvRow): HospitalRow {
  for (const field of required) {
    if (!row[field]?.trim()) throw new Error(`Campo obrigatório em falta: ${field}`);
  }

  return {
    address: clean(row.address),
    contact: clean(row.phone),
    email: clean(row.email),
    facility_type: clean(row.type),
    license_number: clean(row.license_number),
    municipality: clean(row.municipality),
    name: clean(row.name),
    province: clean(row.province),
    verified: parseBoolean(row.verified)
  };
}

function dedupeKey(row: Pick<HospitalRow, "municipality" | "name" | "province">) {
  return [row.name, row.province, row.municipality]
    .map((item) => item.trim().toLowerCase())
    .join("::");
}

function parseCsv(input: string): CsvRow[] {
  const lines = input.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines.shift() ?? "");
  const missing = expected.filter((field) => !headers.includes(field));
  if (missing.length) throw new Error(`Colunas em falta: ${missing.join(", ")}`);

  return lines.filter(Boolean).map((line, index) => {
    const values = splitCsvLine(line);
    if (values.length !== headers.length) {
      throw new Error(`Linha ${index + 2} tem ${values.length} colunas, esperado ${headers.length}`);
    }
    return Object.fromEntries(headers.map((header, item) => [header, values[item] ?? ""]));
  });
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map(clean);
}

function parseBoolean(value = "") {
  return ["true", "1", "sim", "yes"].includes(value.trim().toLowerCase());
}

function clean(value = "") {
  return value.trim();
}

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável em falta: ${name}`);
  return value;
}

main().catch((error) => {
  console.error(`[import-hospitals] ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  process.exit(1);
});
