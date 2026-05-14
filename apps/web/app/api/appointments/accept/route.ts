import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../../_utils/apiResponse";

export async function POST(request: Request) {
  const body = await readJson<{ donorId: string; requestId: string }>(request);

  return apiResponse(() =>
    dataProvider.acceptRequest(body.donorId ?? "", body.requestId ?? "")
  );
}
