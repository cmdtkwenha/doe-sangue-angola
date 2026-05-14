import {
  dataProvider,
  type CreateRequestInput
} from "@doe-sangue-angola/shared-services";
import { apiResponse, readJson } from "../_utils/apiResponse";

export async function GET() {
  return apiResponse(() => dataProvider.listRequests());
}

export async function POST(request: Request) {
  const body = await readJson<CreateRequestInput>(request);
  return apiResponse(() => dataProvider.createRequest(body as CreateRequestInput));
}
