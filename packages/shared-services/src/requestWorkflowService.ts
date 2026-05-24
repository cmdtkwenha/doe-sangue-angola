import { matchingAgent, rewardAgent } from "@doe-sangue-angola/agents";
import type { BloodRequest, BloodType } from "@doe-sangue-angola/shared-types";
import { acceptRequest, validatePin } from "./appointmentService";
import { recordAudit } from "./auditService";
import { appointments, donors, hospitals, requests } from "./mockStore";
import { createInAppNotification, markAllNotificationsRead } from "./notificationService";
import { publishRealtimeEvent } from "./realtimeService";
import { createBloodRequest, updateRequestStatus } from "./requestService";
import { formatTimePt } from "./utils";

type DonorDecision = "Aceite" | "Recusado";

export type DonorResponse = {
  id: string;
  requestId: string;
  donorId: string;
  donorName: string;
  decision: DonorDecision;
  time: string;
};

export const workflowStatuses = [
  "Aberto",
  "Em Correspondência",
  "Agendado",
  "Doador a Caminho",
  "PIN Validado",
  "Concluído",
  "Cancelado"
] as const;

const donorResponses: DonorResponse[] = [];

const nowTime = () => formatTimePt();

export function createWorkflowRequest(input?: Partial<BloodRequest>) {
  const hospital = hospitals.find((item) => item.id === (input?.hospitalId ?? "h1"));
  if (!hospital) return { ok: false, message: "Hospital não encontrado." };

  const result = createBloodRequest({
    hospitalId: hospital.id,
    patientCode: input?.patientCode ?? `PAC-${Date.now().toString().slice(-4)}`,
    bloodType: input?.bloodType ?? "O-",
    units: input?.units ?? 4,
    urgency: input?.urgency ?? "Critica"
  });

  updateRequestStatus(result.request.id, "Em Correspondência");
  recordAudit("matchingAgent", `Procurou dadores compatíveis para ${result.request.id}`);

  return { ...result, hospital };
}

export function getWorkflowSnapshot(requestId = requests[0]?.id) {
  const request = requests.find((item) => item.id === requestId) ?? requests[0];
  const hospital = hospitals.find((item) => item.id === request?.hospitalId);
  const matches = request ? matchingAgent(request, donors).slice(0, 4) : [];

  return {
    request,
    hospital,
    appointment: appointments.find((item) =>
      item.id.includes(request?.id ?? "sem-pedido")
    ),
    matches,
    responses: donorResponses.filter((item) => item.requestId === request?.id)
  };
}

export function acceptWorkflowRequest(donorId: string, requestId: string) {
  const donor = donors.find((item) => item.id === donorId);
  if (!donor) return { ok: false, message: "Dador não encontrado." };

  const result = acceptRequest(donorId, requestId);
  if (!result.ok) return result;

  const existing = donorResponses.find((item) =>
    item.donorId === donorId && item.requestId === requestId
  );
  if (existing) {
    existing.decision = "Aceite";
    existing.time = nowTime();
  } else donorResponses.unshift({
    id: `resp-${donorId}-${requestId}-${donorResponses.length}`,
    requestId,
    donorId,
    donorName: donor.name,
    decision: "Aceite",
    time: nowTime()
  });
  updateRequestStatus(requestId, "Agendado");
  recordAudit("Dador Mobile", `${donor.name} aceitou o pedido ${requestId}`);

  return result;
}

export function rejectWorkflowRequest(donorId: string, requestId: string) {
  const donor = donors.find((item) => item.id === donorId);
  if (!donor) return { ok: false, message: "Dador não encontrado." };

  const existing = donorResponses.find((item) =>
    item.donorId === donorId && item.requestId === requestId
  );
  if (existing) {
    existing.decision = "Recusado";
    existing.time = nowTime();
  } else donorResponses.unshift({
    id: `resp-${donorId}-${requestId}-${donorResponses.length}`,
    requestId,
    donorId,
    donorName: donor.name,
    decision: "Recusado",
    time: nowTime()
  });
  recordAudit("Dador Mobile", `${donor.name} recusou o pedido ${requestId}`);

  return { ok: true, message: "Resposta registada." };
}

export function markDonorOnWay(requestId: string) {
  const request = updateRequestStatus(requestId, "Doador a Caminho");
  recordAudit("Hospital", `Confirmou dador a caminho para ${requestId}`);

  return { ok: Boolean(request), request };
}

export function validateWorkflowPin(pin: string, requestId: string) {
  const result = validatePin(pin);
  if (result.ok) updateRequestStatus(requestId, "PIN Validado");

  return result;
}

export function completeWorkflowDonation(donorId: string, requestId: string) {
  const donor = donors.find((item) => item.id === donorId);
  const request = requests.find((item) => item.id === requestId);
  if (!donor || !request) {
    return { ok: false as const, message: "Fluxo não encontrado." };
  }

  request.status = "Concluído";
  const reward = rewardAgent(donor, true);
  donor.points = reward.currentPoints;
  markAllNotificationsRead(donorId);
  recordAudit("Hospital", `Marcou doação concluída para ${requestId}`);
  recordAudit("rewardAgent", `Atualizou pontos de ${donor.name}`);
  createInAppNotification(
    donorId,
    "Recompensa atualizada",
    `Doação concluída. Ganhou ${reward.earned} pontos.`,
    "appointment"
  );
  publishRealtimeEvent("REQUEST_COMPLETED", {
    donorId,
    requestId,
    rewardPoints: reward.earned
  });

  return { ok: true as const, donor, reward, request };
}

export function getWorkflowRequestByBloodType(bloodType: BloodType) {
  return requests.find((request) => request.bloodType === bloodType);
}

export const RequestWorkflowService = {
  acceptWorkflowRequest,
  completeWorkflowDonation,
  createWorkflowRequest,
  getWorkflowRequestByBloodType,
  getWorkflowSnapshot,
  markDonorOnWay,
  rejectWorkflowRequest,
  validateWorkflowPin
};
