#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const strict = process.argv.includes("--lint");
const skip = new Set(["node_modules", ".next", ".expo", ".git", "dist", "build"]);
const exts = [".ts", ".tsx", ".js", ".jsx", ".css", ".md", ".json", ".sql"];
const importExts = [".ts", ".tsx", ".js", ".jsx", ".json", ".css"];
const generated = new Set(["package-lock.json"]);
const failures = [];
const warnings = [];

function walk(dir) {
  const items = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    if (generated.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) items.push(...walk(full));
    if (entry.isFile() && exts.includes(path.extname(entry.name))) items.push(full);
  }
  return items;
}

function relative(file) {
  return path.relative(root, file);
}

function existsImport(base) {
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return true;
  if (importExts.some((ext) => fs.existsSync(`${base}${ext}`))) return true;
  return importExts.some((ext) => fs.existsSync(path.join(base, `index${ext}`)));
}

function checkLines(files) {
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).length;
    if (lines > 250) failures.push(`Ficheiro grande: ${relative(file)} tem ${lines} linhas`);
  }
}

function checkRelativeImports(files) {
  const codeFiles = files.filter((file) => [".ts", ".tsx", ".js", ".jsx"].includes(path.extname(file)));
  const pattern = /from\s+["'](\.{1,2}\/[^"']+)["']|import\(["'](\.{1,2}\/[^"']+)["']\)/g;
  for (const file of codeFiles) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(pattern)) {
      const target = match[1] || match[2];
      if (!existsImport(path.resolve(path.dirname(file), target))) {
        failures.push(`Import relativo quebrado: ${relative(file)} -> ${target}`);
      }
    }
  }
}

function checkTranslations() {
  const file = path.join(root, "packages/shared-services/src/i18n.ts");
  if (!fs.existsSync(file)) {
    failures.push("Traduções ausentes: packages/shared-services/src/i18n.ts");
    return;
  }
  const source = fs.readFileSync(file, "utf8");
  for (const locale of ["pt", "en", "fr"]) {
    if (!source.includes(`${locale}:`)) failures.push(`Locale em falta: ${locale}`);
  }
}

function checkDuplicateComponents(files) {
  const seen = new Map();
  const components = files.filter((file) => file.includes(`${path.sep}components${path.sep}`));
  for (const file of components.filter((item) => item.endsWith(".tsx"))) {
    const name = path.basename(file);
    const list = seen.get(name) || [];
    list.push(relative(file));
    seen.set(name, list);
  }
  for (const [name, list] of seen) {
    if (list.length > 1) warnings.push(`Componente duplicado (${name}): ${list.join(", ")}`);
  }
}

function checkPossiblyUnused(files) {
  const source = files
    .filter((file) => [".ts", ".tsx"].includes(path.extname(file)))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  for (const file of files.filter((item) => item.endsWith(".tsx"))) {
    const name = path.basename(file, ".tsx");
    if (["page", "layout", "error", "loading", "global-error"].includes(name)) continue;
    const matches = source.match(new RegExp(`\\b${name}\\b`, "g")) || [];
    if (matches.length <= 1) warnings.push(`Possível ficheiro sem uso: ${relative(file)}`);
  }
}

const files = walk(root);
checkLines(files);
checkRelativeImports(files);
checkTranslations();
checkDuplicateComponents(files);
checkPossiblyUnused(files);

console.log("Auditoria RC Doe Sangue Angola");
console.log(`Ficheiros verificados: ${files.length}`);
console.log(`Falhas: ${failures.length}`);
console.log(`Avisos: ${warnings.length}`);

for (const item of failures) console.error(`✕ ${item}`);
for (const item of warnings.slice(0, strict ? 80 : 30)) console.warn(`! ${item}`);
if (warnings.length > 30 && !strict) console.warn(`! Mais ${warnings.length - 30} avisos ocultos`);

process.exit(failures.length ? 1 : 0);
