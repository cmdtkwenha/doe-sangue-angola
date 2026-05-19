import { dataProvider } from "@doe-sangue-angola/shared-services";
import type { BloodType } from "@doe-sangue-angola/shared-types";
import { apiResponse, readJson } from "../_utils/apiResponse";

type DonorBody = {
  birthDate: string;
  bloodType: BloodType;
  municipality: string;
  phone: string;
  province: string;
  userId: string;
};

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (userId) return apiResponse(() => dataProvider.findDonorByUserId(userId));
  return apiResponse(() => dataProvider.listDonors());
}

export async function POST(request: Request) {
  const body = await readJson<DonorBody>(request);
  return apiResponse(() =>
    dataProvider.upsertDonorProfile({
      birthDate: body.birthDate ?? "",
      bloodType: body.bloodType ?? "O+",
      municipality: body.municipality ?? "",
      phone: body.phone ?? "",
      province: body.province ?? "",
      userId: body.userId ?? ""
    })
  );
}
