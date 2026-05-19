import { dataProvider, type MockNotification } from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../_utils/apiResponse";
import { auditApiAction } from "../_utils/audit";
import { requireApiSession, requireEntityAccess, requireSameOrigin } from "../_utils/security";
import { assertString } from "../_utils/validation";

export async function GET(request: Request) {
  return apiResponse(async () => {
    const principal = await requireApiSession();
    const donorId = new URL(request.url).searchParams.get("donorId") ?? "";
    requireEntityAccess(principal, "donor", donorId);
    return dataProvider.listNotifications(donorId);
  });
}

export async function POST(request: Request) {
  requireSameOrigin(request);
  const body = await readJson<{
    donorId: string;
    title: string;
    body: string;
  }>(request);

  return apiResponse(async () => {
    const principal = await requireApiSession(["admin", "hospital"]);
    const notification = await dataProvider.createNotification(
      assertString(body.donorId, "Dador"),
      assertString(body.title, "Título", 120),
      assertString(body.body, "Mensagem", 400)
    ) as MockNotification;
    await auditApiAction(principal, `Criou notificação ${notification.id}.`);
    return notification;
  });
}
