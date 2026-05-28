import { getStartupHealth } from "@doe-sangue-angola/shared-services";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getStartupHealth();
  const ok = Object.values(health).every((item) => item === "operational");

  return Response.json({
    ok,
    service: "Doe Sangue Angola",
    checks: health
  }, { status: ok ? 200 : 503 });
}
