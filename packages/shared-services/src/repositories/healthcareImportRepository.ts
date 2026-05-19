import { getDatabaseClient } from "../databaseService";
import {
  duplicateKey,
  parseHealthcareCsv,
  type HealthcareDataset,
  type ImportPreview,
  type ImportRow
} from "../healthcareImport";

type ImportResult = ImportPreview & {
  imported: number;
  skippedDuplicates: number;
};

export const healthcareImportRepository = {
  preview(dataset: HealthcareDataset, csv: string) {
    return parseHealthcareCsv(dataset, csv);
  },

  async importCsv(dataset: HealthcareDataset, csv: string): Promise<ImportResult> {
    const preview = parseHealthcareCsv(dataset, csv);
    if (preview.issues.some((issue) => !issue.message.includes("Duplicado"))) {
      return { ...preview, imported: 0, skippedDuplicates: preview.duplicates };
    }

    const existing = await listExistingKeys(dataset);
    const seen = new Set<string>();
    const rows = preview.rows.filter((row) => {
      const key = duplicateKey(dataset, row);
      if (existing.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (!rows.length) {
      return { ...preview, imported: 0, skippedDuplicates: preview.totalRows };
    }

    const { error } = await getDatabaseClient()
      .from(tableName(dataset))
      .insert(rows.map((row) => toDbRow(dataset, row)));

    if (error) throw error;
    return {
      ...preview,
      imported: rows.length,
      skippedDuplicates: preview.totalRows - rows.length
    };
  },

  async exportCsv(dataset: HealthcareDataset) {
    const { data, error } = await getDatabaseClient()
      .from(tableName(dataset))
      .select("*")
      .order(dataset === "provinces" ? "name" : "province");
    if (error) throw error;
    return toCsv((data ?? []) as Record<string, unknown>[]);
  }
};

async function listExistingKeys(dataset: HealthcareDataset) {
  const table = tableName(dataset);
  const { data, error } = await getDatabaseClient().from(table).select("*");
  if (error) throw error;
  return new Set(((data ?? []) as unknown as ImportRow[]).map((row) => duplicateKey(dataset, row)));
}

function tableName(dataset: HealthcareDataset) {
  return dataset;
}

function toDbRow(dataset: HealthcareDataset, row: ImportRow) {
  if (dataset === "provinces") return { name: row.name };
  if (dataset === "municipalities") {
    return { name: row.name, province: row.province };
  }
  return {
    address: row.address ?? "",
    contact: row.phone ?? "",
    email: row.email ?? "",
    facility_type: row.type ?? (dataset === "clinics" ? "Clínica" : "Banco de sangue"),
    license_number: row.license_number ?? "",
    municipality: row.municipality,
    name: row.name,
    province: row.province,
    verified: Boolean(row.verified)
  };
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) =>
    headers.map((header) => csvValue(row[header])).join(",")
  );
  return [headers.join(","), ...body].join("\n");
}

function csvValue(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}
