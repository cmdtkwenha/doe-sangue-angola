import {
  hospitalRepository
} from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../_utils/apiResponse";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (userId) return apiResponse(() => hospitalRepository.findHospitalByUserId(userId));
  try {
    const hospitals = await hospitalRepository.listHospitals();
    console.info("[admin-hospitals] query result", {
      count: hospitals.length,
      table: "public.hospitals"
    });
    return Response.json({ ok: true, data: hospitals });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro Supabase";
    console.error("[admin-hospitals] query error", { message });
    return Response.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const body = await readJson<{ hospitalId: string; userId: string }>(request);
  return apiResponse(() =>
    hospitalRepository.assignHospitalUser(body.hospitalId ?? "", body.userId ?? "")
  );
}
