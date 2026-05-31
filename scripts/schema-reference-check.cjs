const { readdirSync, readFileSync, statSync } = require("node:fs");
const { join, relative } = require("node:path");
const { schemaContract } = require("./schema-contract.cjs");

const root = join(__dirname, "..");
const scanDirs = ["apps", "packages"].map((dir) => join(root, dir));
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const ignoredColumns = new Set(["*", "count"]);

function checkSupabaseReferences() {
  const problems = [];
  for (const file of listFiles(scanDirs)) {
    const text = readFileSync(file, "utf8");
    for (const ref of findTableRefs(text)) {
      const table = ref.table;
      const columns = schemaContract[table];
      if (!columns) {
        problems.push(format(file, ref.index, `${table}: table is not in schema lock`));
        continue;
      }
      const segment = text.slice(ref.index, nextBoundary(text, ref.index));
      checkSelects(file, segment, table, problems);
      checkMutationKeys(file, segment, table, columns, problems);
    }
  }
  return problems;
}

function listFiles(paths) {
  const files = [];
  for (const path of paths) {
    if (!exists(path)) continue;
    walk(path, files);
  }
  return files;
}

function walk(path, files) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const item of readdirSync(path)) {
      if (item === "node_modules" || item === ".next") continue;
      walk(join(path, item), files);
    }
    return;
  }
  if (exts.has(path.slice(path.lastIndexOf(".")))) files.push(path);
}

function exists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function findTableRefs(text) {
  const refs = [];
  const re = /\.from\s*\(\s*["'`]([a-zA-Z0-9_]+)["'`]\s*\)/g;
  let match;
  while ((match = re.exec(text))) refs.push({ table: match[1], index: match.index });
  return refs;
}

function nextBoundary(text, start) {
  const candidates = [
    text.indexOf(".from", start + 5),
    text.indexOf(";\n", start + 5),
    text.indexOf("\n\n", start + 5)
  ].filter((index) => index !== -1);
  const next = candidates.length ? Math.min(...candidates) : text.length;
  return Math.min(next, start + 3000);
}

function checkSelects(file, segment, table, problems) {
  const re = /\.select\s*\(\s*([`"'])([\s\S]*?)\1/g;
  let match;
  while ((match = re.exec(segment))) validateSelectList(file, match[2], table, problems);
}

function validateSelectList(file, select, table, problems) {
  for (const token of splitTopLevel(select)) {
    const trimmed = token.trim();
    if (!trimmed || trimmed === "*") continue;
    const nested = trimmed.match(/^(?:(\w+):)?(\w+)\s*\(([\s\S]*)\)$/);
    if (nested) {
      const nestedTable = nested[2];
      if (schemaContract[nestedTable]) validateSelectList(file, nested[3], nestedTable, problems);
      continue;
    }
    const column = trimmed.split(":").pop().trim();
    const clean = column.replace(/[!().\s].*$/, "");
    if (!clean || ignoredColumns.has(clean)) continue;
    if (!schemaContract[table].includes(clean)) {
      problems.push(`${relative(root, file)}: ${table}.${clean} is not in schema lock`);
    }
  }
}

function splitTopLevel(value) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function checkMutationKeys(file, segment, table, columns, problems) {
  const re = /\.(?:insert|update|upsert)\s*\(\s*(?:\[)?\s*\{([\s\S]*?)\}\s*(?:\])?\s*\)/g;
  let match;
  while ((match = re.exec(segment))) {
    for (const key of objectKeys(match[1])) {
      if (!columns.includes(key)) {
        problems.push(`${relative(root, file)}: ${table}.${key} is not in schema lock`);
      }
    }
  }
}

function objectKeys(body) {
  const keys = [];
  const re = /(?:^|[\n,{])\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/g;
  let match;
  while ((match = re.exec(body))) {
    if (match[1] !== "onConflict") keys.push(match[1]);
  }
  return keys;
}

function format(file, index, message) {
  const line = readFileSync(file, "utf8").slice(0, index).split("\n").length;
  return `${relative(root, file)}:${line}: ${message}`;
}

module.exports = { checkSupabaseReferences };
