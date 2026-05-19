import {
  healthcareImportRepository,
  type HealthcareDataset
} from "@doe-sangue-angola/shared-services";
import { auditApiAction } from "../../_utils/audit";
import { ApiError, apiResponse, readJson } from "../../_utils/apiResponse";
import { requireApiSession, requireSameOrigin } from "../../_utils/security";

const datasets: HealthcareDataset[] = [
  "hospitals",
  "clinics",
  "provinces",
  "municipalities",
  "blood_banks"
];

export async function GET(request: Request) {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    const dataset = parseDataset(new URL(request.url).searchParams.get("dataset"));
    const csv = await healthcareImportRepository.exportCsv(dataset);
    return { csv, filename: `${dataset}.csv` };
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{
    csv: string;
    dataset: HealthcareDataset;
    mode: "preview" | "import";
  }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["admin"]);
    const dataset = parseDataset(body.dataset);
    const csv = typeof body.csv === "string" ? body.csv : "";
    if (!csv.trim()) throw new ApiError(400, "Carregue um ficheiro CSV válido.");
    if (body.mode === "preview") {
      return healthcareImportRepository.preview(dataset, csv);
    }
    const result = await healthcareImportRepository.importCsv(dataset, csv);
    await auditApiAction(
      principal,
      `Importou ${result.imported} registos em ${dataset}; ${result.skippedDuplicates} duplicados.`
    );
    return result;
  });
}

function parseDataset(value: unknown) {
  if (!datasets.includes(value as HealthcareDataset)) {
    throw new ApiError(400, "Tipo de importação inválido.");
  }
  return value as HealthcareDataset;
}
