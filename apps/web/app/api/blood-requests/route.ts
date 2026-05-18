import {
  dataProvider,
  type CreateRequestInput
} from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../_utils/apiResponse";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const donorId = params.get("donorId");
  const hospitalId = params.get("hospitalId");

  if (donorId) {
    return apiResponse(() => dataProvider.listRequestsForDonor(donorId));
  }

  if (hospitalId) {
    return apiResponse(() => dataProvider.listRequestsForHospital(hospitalId));
  }

  return apiResponse(() => dataProvider.listRequests());
}

export async function POST(request: Request) {
  const body = await readJson<CreateRequestInput>(request);
  return apiResponse(() => dataProvider.createRequest(body as CreateRequestInput));
}
