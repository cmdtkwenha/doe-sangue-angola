import {
  sendExpoPushNotification,
  type NotificationType,
  type PushCategory
} from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../../_utils/apiResponse";
import { auditApiAction } from "../../_utils/audit";
import { requireApiSession, requireSameOrigin } from "../../_utils/security";
import { assertString, optionalString } from "../../_utils/validation";

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{
    body: string;
    category?: PushCategory;
    title: string;
    to: string;
    type?: NotificationType;
  }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["admin", "hospital"]);
    const category = optionalString(body.category, 60) as PushCategory | undefined;
    const type = optionalString(body.type, 60) as NotificationType | undefined;
    const result = await sendExpoPushNotification({
      to: assertString(body.to, "Destino push", 300),
      title: assertString(body.title, "Título", 120),
      body: assertString(body.body, "Mensagem", 400),
      category: category ?? "emergency_request",
      type: type ?? "urgent"
    });
    await auditApiAction(principal, "Enviou notificação push.");
    return result;
  });
}
