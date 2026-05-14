import {
  registerPushToken,
  type PushTokenRecord
} from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../../_utils/apiResponse";

export async function POST(request: Request) {
  const body = await readJson<{
    donorId: string;
    platform?: PushTokenRecord["platform"];
    token: string;
  }>(request);

  return apiResponse(() =>
    registerPushToken({
      donorId: body.donorId ?? "",
      token: body.token ?? "",
      platform: body.platform ?? "unknown"
    })
  );
}
