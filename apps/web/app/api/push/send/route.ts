import {
  sendExpoPushNotification,
  type NotificationType,
  type PushCategory
} from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../../_utils/apiResponse";

export async function POST(request: Request) {
  const body = await readJson<{
    body: string;
    category?: PushCategory;
    title: string;
    to: string;
    type?: NotificationType;
  }>(request);

  return apiResponse(() =>
    sendExpoPushNotification({
      to: body.to ?? "",
      title: body.title ?? "",
      body: body.body ?? "",
      category: body.category ?? "emergency_request",
      type: body.type ?? "urgent"
    })
  );
}
