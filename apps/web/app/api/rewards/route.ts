import { dataProvider } from "@doe-sangue-angola/shared-services";
import { ApiError, apiResponse } from "../_utils/apiResponse";
import { requireApiSession, requireEntityAccess } from "../_utils/security";

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const donorId = new URL(request.url).searchParams.get("donorId");

    if (donorId) {
      requireEntityAccess(principal, "donor", donorId);
      return dataProvider.listRewardsForDonor(donorId);
    }

    if (principal.role !== "admin") throw new ApiError(403, "Recompensas globais restritas ao admin.");
    return dataProvider.listRewards();
  });
}
