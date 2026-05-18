import { dataProvider } from "@doe-sangue-angola/shared-services";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { apiResponse, readJson } from "../../_utils/apiResponse";

type StatusBody = {
  requestId: string;
  status: BloodRequest["status"];
};

export async function POST(request: Request) {
  const body = await readJson<StatusBody>(request);

  return apiResponse(() =>
    dataProvider.updateRequestStatus(
      body.requestId ?? "",
      body.status ?? "Aberto"
    )
  );
}
