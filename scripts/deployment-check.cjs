#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const required = [
  "NEXT_PUBLIC_AUTH_MODE",
  "NEXT_PUBLIC_DATA_MODE",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
];

async function main() {
  const checks = [
    envCheck(),
    migrationsCheck(),
    packageCheck(),
    await supabaseCheck()
  ];
  console.log("Checklist automática de deploy");
  for (const item of checks) {
    console.log(`${item.ok ? "OK" : "AÇÃO"} ${item.label}: ${item.detail}`);
  }
  if (checks.some((item) => !item.ok)) process.exitCode = 1;
}

function envCheck() {
  const missing = required.filter((name) => !process.env[name]);
  return {
    label: "Env validation",
    ok: missing.length === 0,
    detail: missing.length ? `Faltam: ${missing.join(", ")}` : "Variáveis principais presentes."
  };
}

function migrationsCheck() {
  const dir = path.join(root, "supabase", "migrations");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((file) => file.endsWith(".sql")) : [];
  return {
    label: "Migration validation",
    ok: files.length >= 30,
    detail: `${files.length} migrations encontradas.`
  };
}

function packageCheck() {
  return {
    label: "Build verification",
    ok: fs.existsSync(path.join(root, "package.json")),
    detail: "Execute npm run typecheck e npm run build antes do deploy."
  };
}

async function supabaseCheck() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { label: "Supabase connectivity", ok: false, detail: "Credenciais ausentes." };
  }
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, authorization: `Bearer ${key}` }
    });
    return {
      label: "Supabase connectivity",
      ok: response.status < 500,
      detail: `Resposta HTTP ${response.status}.`
    };
  } catch (error) {
    return {
      label: "Supabase connectivity",
      ok: false,
      detail: error instanceof Error ? error.message : "Falha de rede."
    };
  }
}

void main();
