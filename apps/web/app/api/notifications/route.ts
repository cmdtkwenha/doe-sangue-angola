import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../_utils/apiResponse";

export async function GET(request: Request) {
  const donorId = new URL(request.url).searchParams.get("donorId") ?? "";
  return apiResponse(() => dataProvider.listNotifications(donorId));
}

export async function POST(request: Request) {
  const body = await readJson<{
    donorId: string;
    title: string;
    body: string;
  }>(request);

  return apiResponse(() =>
    dataProvider.createNotification(body.donorId ?? "", body.title ?? "", body.body ?? "")
  );
}
