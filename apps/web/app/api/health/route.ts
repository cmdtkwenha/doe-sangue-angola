import {
  checkDatabaseHealth,
  getDataProviderStatus
} from "@doe-sangue-angola/shared-services";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getDataProviderStatus();
  const database = await checkDatabaseHealth();

  return Response.json({
    ok: true,
    service: "Doe Sangue Angola",
    dataMode: data.mode,
    dataReady: data.ready,
    database,
    message: data.message
  });
}
