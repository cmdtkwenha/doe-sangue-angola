import { getDeploymentReadiness } from "@doe-sangue-angola/shared-services";
import { apiResponse } from "../../_utils/apiResponse";
import { requireApiSession } from "../../_utils/security";

export const dynamic = "force-dynamic";

export async function GET() {
  return apiResponse(async () => {
    await requireApiSession(["admin"]);
    return getDeploymentReadiness();
  });
}
