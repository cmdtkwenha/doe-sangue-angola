import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse } from "../_utils/apiResponse";

export async function GET(request: Request) {
  const donorId = new URL(request.url).searchParams.get("donorId");

  if (donorId) {
    return apiResponse(() => dataProvider.listRewardsForDonor(donorId));
  }

  return apiResponse(() => dataProvider.listRewards());
}
