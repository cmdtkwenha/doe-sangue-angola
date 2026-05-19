import { dataProvider } from "@doe-sangue-angola/shared-services";
import { ApiError, apiResponse } from "../_utils/apiResponse";
import { requireApiSession, requireEntityAccess } from "../_utils/security";

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const params = new URL(request.url).searchParams;
    const donorId = params.get("donorId");
    const hospitalId = params.get("hospitalId");

    if (donorId) {
      requireEntityAccess(principal, "donor", donorId);
      return dataProvider.listAppointmentsForDonor(donorId);
    }

    if (hospitalId) {
      requireEntityAccess(principal, "hospital", hospitalId);
      return dataProvider.listAppointmentsForHospital(hospitalId);
    }

    if (principal.role !== "admin") throw new ApiError(403, "Lista restrita ao admin.");
    return dataProvider.listAppointments();
  });
}
