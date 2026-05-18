import { getDataProviderStatus } from "@doe-sangue-angola/shared-services";

export const dynamic = "force-static";

export function GET() {
  const data = getDataProviderStatus();

  return Response.json({
    ok: true,
    service: "Doe Sangue Angola",
    dataMode: data.mode,
    dataReady: data.ready,
    message: data.message
  });
}
