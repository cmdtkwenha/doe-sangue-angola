export const dynamic = "force-static";

export function GET() {
  return Response.json({
    ok: true,
    service: "Doe Sangue Angola",
    mode: process.env.NEXT_PUBLIC_DATA_MODE || "mock"
  });
}
