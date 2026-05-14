import { rewardAgent } from "@doe-sangue-angola/agents";
import { matchingAgent } from "@doe-sangue-angola/agents";
import { acceptRequest, listAppointmentsForDonor } from "./appointmentService";
import { recordAudit } from "./auditService";
import { donors, requests } from "./mockStore";
import { updateRequestStatus } from "./requestService";
import { publishRealtimeEvent } from "./realtimeService";

// TODO(production): replace direct donor array reads with DonorRepositoryInterface.
export function getDonorById(donorId: string) {
  return donors.find((item) => item.id === donorId);
}

export function listDonors() {
  return donors;
}

export function listAvailableRequestsForDonor(donorId: string) {
  const donor = getDonorById(donorId);
  if (!donor) return [];

  return requests.filter((request) =>
    matchingAgent(request, donors).some((match) => match.donor.id === donor.id)
  );
}

export function acceptBloodRequest(donorId: string, requestId: string) {
  const result = acceptRequest(donorId, requestId);
  if (result.ok) recordAudit("Dador Mobile", `Aceitou pedido ${requestId}`);

  return result;
}

export function completeDonation(donorId: string, requestId: string) {
  const donor = getDonorById(donorId);
  if (!donor) return { ok: false, message: "Dador nao encontrado." };

  const reward = rewardAgent(donor, true);
  donor.points = reward.currentPoints;
  updateRequestStatus(requestId, "Concluído");
  recordAudit("rewardAgent", `Adicionou ${reward.earned} pontos a ${donor.name}`);
  publishRealtimeEvent("REQUEST_COMPLETED", {
    donorId,
    requestId,
    rewardPoints: reward.earned
  });

  // Mock flow step 9: completion updates mobile rewards and admin status together.
  return { ok: true, message: "Doacao concluida.", donor, reward };
}

export function getDonorDashboard(donorId: string) {
  return {
    donor: getDonorById(donorId),
    requests: listAvailableRequestsForDonor(donorId),
    appointments: listAppointmentsForDonor(donorId)
  };
}
