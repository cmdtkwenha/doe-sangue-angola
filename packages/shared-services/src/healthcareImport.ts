export type HealthcareDataset =
  | "hospitals"
  | "clinics"
  | "provinces"
  | "municipalities"
  | "blood_banks";

export type ImportIssue = {
  field?: string;
  message: string;
  row: number;
};

export type ImportRow = Record<string, string | boolean>;

export type ImportPreview = {
  duplicates: number;
  issues: ImportIssue[];
  rows: ImportRow[];
  totalRows: number;
  validRows: number;
};

const healthcareColumns = [
  "name",
  "type",
  "province",
  "municipality",
  "address",
  "phone",
  "email",
  "license_number",
  "verified"
];

const requiredByDataset: Record<HealthcareDataset, string[]> = {
  blood_banks: ["name", "province", "municipality"],
  clinics: healthcareColumns,
  hospitals: healthcareColumns,
  municipalities: ["name", "province"],
  provinces: ["name"]
};

export function parseHealthcareCsv(dataset: HealthcareDataset, csv: string): ImportPreview {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  const headers = splitCsvLine(lines.shift() ?? "");
  const required = requiredByDataset[dataset];
  const missing = required.filter((field) => !headers.includes(field));
  if (missing.length) {
    return issueOnly(`Colunas em falta: ${missing.join(", ")}`);
  }

  const issues: ImportIssue[] = [];
  const keys = new Set<string>();
  const rows = lines.map((line, index) => {
    const rowNumber = index + 2;
    const values = splitCsvLine(line);
    const raw = Object.fromEntries(headers.map((header, item) => [header, values[item] ?? ""]));
    const normalized = normalizeRow(dataset, raw, rowNumber, issues);
    const key = duplicateKey(dataset, normalized);
    if (keys.has(key)) issues.push({ row: rowNumber, message: "Duplicado no ficheiro CSV." });
    keys.add(key);
    return normalized;
  });

  const invalidRows = new Set(issues.map((issue) => issue.row));
  return {
    duplicates: issues.filter((issue) => issue.message.includes("Duplicado")).length,
    issues,
    rows,
    totalRows: rows.length,
    validRows: rows.length - invalidRows.size
  };
}

export function datasetLabel(dataset: HealthcareDataset) {
  return {
    blood_banks: "Bancos de sangue",
    clinics: "Clínicas",
    hospitals: "Hospitais",
    municipalities: "Municípios",
    provinces: "Províncias"
  }[dataset];
}

export function duplicateKey(dataset: HealthcareDataset, row: ImportRow) {
  if (dataset === "provinces") return clean(row.name);
  if (dataset === "municipalities") return [row.province, row.name].map(clean).join("::");
  return [row.name, row.province, row.municipality].map(clean).join("::");
}

function normalizeRow(
  dataset: HealthcareDataset,
  row: Record<string, string>,
  rowNumber: number,
  issues: ImportIssue[]
) {
  const required = requiredByDataset[dataset];
  required.forEach((field) => {
    if (!row[field]?.trim()) issues.push({ field, row: rowNumber, message: "Campo obrigatório em falta." });
  });
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      key === "verified" ? parseBoolean(value) : value.trim()
    ])
  ) as ImportRow;
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
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else current += char;
  }
  values.push(current.trim());
  return values;
}

function parseBoolean(value = "") {
  return ["true", "1", "sim", "yes", "verificado"].includes(value.trim().toLowerCase());
}

function clean(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function issueOnly(message: string): ImportPreview {
  return { duplicates: 0, issues: [{ row: 1, message }], rows: [], totalRows: 0, validRows: 0 };
}
