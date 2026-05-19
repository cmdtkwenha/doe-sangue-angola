import {
  dataProvider,
  hospitalRepository
} from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../_utils/apiResponse";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (userId) return apiResponse(() => hospitalRepository.findHospitalByUserId(userId));
  return apiResponse(() => dataProvider.listHospitals());
}

export async function PUT(request: Request) {
  const body = await readJson<{ hospitalId: string; userId: string }>(request);
  return apiResponse(() =>
    hospitalRepository.assignHospitalUser(body.hospitalId ?? "", body.userId ?? "")
  );
}
