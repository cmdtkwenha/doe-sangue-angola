import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse } from "../_utils/apiResponse";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const donorId = params.get("donorId");
  const hospitalId = params.get("hospitalId");

  if (donorId) {
    return apiResponse(() => dataProvider.listAppointmentsForDonor(donorId));
  }

  if (hospitalId) {
    return apiResponse(() => dataProvider.listAppointmentsForHospital(hospitalId));
  }

  return apiResponse(() => dataProvider.listAppointments());
}
