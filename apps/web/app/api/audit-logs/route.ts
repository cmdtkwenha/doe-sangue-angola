import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../_utils/apiResponse";

export async function GET() {
  return apiResponse(() => dataProvider.listAuditLogs());
}

export async function POST(request: Request) {
  const body = await readJson<{ actor: string; action: string }>(request);

  return apiResponse(() =>
    dataProvider.createAuditLog(body.actor ?? "Sistema", body.action ?? "Ação registada")
  );
}
