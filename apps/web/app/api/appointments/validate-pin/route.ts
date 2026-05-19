import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../../_utils/apiResponse";

export async function POST(request: Request) {
  const body = await readJson<{ pin: string; requestId?: string }>(request);

  return apiResponse(() => dataProvider.validatePin(body.pin ?? "", body.requestId));
}
