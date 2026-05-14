import { matchingAgent } from "@doe-sangue-angola/agents";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import { donors, hospitals, requests } from "./mockStore";
import { recordAudit } from "./auditService";
import { notifyCompatibleDonors } from "./notificationService";
import { publishRealtimeEvent } from "./realtimeService";
import { fraudAgent } from "@doe-sangue-angola/agents";
import { trackRequestCreation } from "./activityTracker";

// TODO(production): route all request reads/writes through repositoryRegistry.
export function listRequests() {
  return requests;
}

export function getRequestById(id: string) {
  return requests.find((request) => request.id === id);
}

export function listRequestsForHospital(hospitalId: string) {
  return requests.filter((request) => request.hospitalId === hospitalId);
}

export function createBloodRequest(
  input: Omit<BloodRequest, "id" | "createdAt" | "status">
) {
  const request: BloodRequest = {
    ...input,
    id: `r${requests.length + 1}`,
    status: "Aberto",
    createdAt: new Date().toISOString()
  };

  requests.unshift(request);
  recordAudit("Hospital", `Criou pedido ${request.bloodType} com ${request.units} bolsas`);
  trackRequestCreation(request.id, request.hospitalId);
  notifyCompatibleDonors(request);
  publishRealtimeEvent("REQUEST_CREATED", { request });
  const fraud = fraudAgent(request);
  if (fraud.risk !== "baixo") {
    publishRealtimeEvent("FRAUD_FLAGGED", {
      flags: fraud.flags,
      requestId: request.id,
      risk: fraud.risk
    });
  }

  // Mock flow steps 1-4: the same request now feeds Admin, matching, and Mobile.
  return {
    ok: true,
    message: "Pedido de sangue criado.",
    request,
    matches: matchingAgent(request, donors)
  };
}

export function listLiveRequests() {
  return requests.map((request) => ({
    ...request,
    hospital: hospitals.find((item) => item.id === request.hospitalId)
  }));
}

export function findCompatibleDonors(requestId: string) {
  const request = getRequestById(requestId);
  const matches = request ? matchingAgent(request, donors) : [];
  if (request) {
    publishRealtimeEvent("DONOR_MATCHED", {
      donors: matches.map((match) => match.donor),
      requestId
    });
  }

  return matches;
}

export function updateRequestStatus(id: string, status: BloodRequest["status"]) {
  const request = getRequestById(id);
  if (request) request.status = status;
  if (request) recordAudit("Admin Nacional", `Atualizou ${id} para ${status}`);
  if (request) publishRealtimeEvent("REQUEST_UPDATED", { request });

  return request;
}
