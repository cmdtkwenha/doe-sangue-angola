import { dataProvider } from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../../_utils/apiResponse";

type CompleteBody = {
  donorId: string;
  requestId: string;
};

export async function POST(request: Request) {
  const body = await readJson<CompleteBody>(request);

  return apiResponse(() =>
    dataProvider.completeRequest(body.donorId ?? "", body.requestId ?? "")
  );
}
