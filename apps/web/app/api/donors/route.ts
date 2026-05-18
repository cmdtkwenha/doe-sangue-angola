import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse } from "../_utils/apiResponse";

export async function GET() {
  return apiResponse(() => dataProvider.listDonors());
}
