import {
  registerPushToken,
  type PushTokenRecord
} from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../../_utils/apiResponse";
import { requireApiSession, requireEntityAccess, requireSameOrigin } from "../../_utils/security";
import { assertString, optionalString } from "../../_utils/validation";

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{
    donorId: string;
    platform?: PushTokenRecord["platform"];
    token: string;
  }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["donor", "admin"]);
    const donorId = assertString(body.donorId, "Dador");
    requireEntityAccess(principal, "donor", donorId);
    const platform = optionalString(body.platform, 30) as PushTokenRecord["platform"] | undefined;
    return registerPushToken({
      donorId,
      token: assertString(body.token, "Token push", 300),
      platform: platform ?? "unknown"
    });
  });
}
