import { matchingAgent } from "@doe-sangue-angola/agents";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import type { DataProvider } from "./mockProvider";
import { appointmentRepository } from "./repositories/appointmentRepository";
import { auditRepository } from "./repositories/auditRepository";
import { donorRepository } from "./repositories/donorRepository";
import { hospitalRepository } from "./repositories/hospitalRepository";
import { notificationRepository } from "./repositories/notificationRepository";
import { rewardRepository } from "./repositories/rewardRepository";
import { sendRequestPushes } from "./pushService";
import { requestRepository } from "./repositories/requestRepository";
import { publishRealtimeEvent } from "./realtimeService";
import { userRepository } from "./repositories/userRepository";

type CreateRequestInput = Omit<BloodRequest, "createdAt" | "id" | "status">;

export const supabaseProvider: DataProvider = {
  listDonors() {
    return donorRepository.listDonors();
  },
  findDonorByUserId(userId: string) {
    return donorRepository.findDonorByUserId(userId);
  },
  upsertDonorProfile(input) {
    return donorRepository.upsertDonorProfile(input);
  },
  listHospitals() {
    return hospitalRepository.listHospitals();
  },
  listRequests() {
    return requestRepository.listRequests();
  },
  async listRequestsForDonor(donorId: string) {
    const realDonorId = await resolveDonorId(donorId);
    const donor = await donorRepository.findDonor(realDonorId);
    const requests = await requestRepository.listRequests();
    return requests.filter((request) =>
      !["Cancelado", "Concluído"].includes(request.status) &&
      matchingAgent(request, [donor]).some((match) => match.donor.id === donor.id)
    );
  },
  async listRequestsForHospital(hospitalId: string) {
    return requestRepository.listRequestsForHospital(await resolveHospitalId(hospitalId));
  },
  listAppointments() {
    return appointmentRepository.listAppointments();
  },
  listAppointmentsForDonor(donorId: string) {
    return resolveDonorId(donorId).then((id) =>
      appointmentRepository.listAppointmentsForDonor(id)
    );
  },
  listAppointmentsForHospital(hospitalId: string) {
    return resolveHospitalId(hospitalId).then((id) =>
      appointmentRepository.listAppointmentsForHospital(id)
    );
  },
  listAuditLogs() {
    return auditRepository.listAuditLogs();
  },
  listRewards() {
    return rewardRepository.listRewards();
  },
  listRewardsForDonor(donorId: string) {
    return resolveDonorId(donorId).then((id) => rewardRepository.listRewardsForDonor(id));
  },
  createUser(input) {
    return userRepository.createUser(input);
  },
  findUserByEmail(email: string) {
    return userRepository.findUserByEmail(email);
  },
  listUsers() {
    return userRepository.listUsers();
  },
  async createRequest(input: CreateRequestInput) {
    const hospitalId = await resolveHospitalId(input.hospitalId);
    const hospital = await hospitalRepository.getHospital(hospitalId);
    const created = await requestRepository.createRequest({
      ...input,
      hospitalId,
      municipality: input.municipality ?? hospital.municipality,
      province: input.province ?? hospital.province
    });
    const donors = await donorRepository.listDonors();
    const matches = matchingAgent(created, donors)
      .filter((item) => item.recommendation === "Notificar")
      .slice(0, 12);
    const request = await requestRepository.updateRequestStatus(
      created.id,
      "Em Correspondência"
    );

    const notifications = await Promise.allSettled(matches.map((match) =>
      notificationRepository.createNotification({
        donorId: match.donor.id,
        title: "Pedido urgente de sangue",
        body: `Pedido urgente ${request.bloodType} em ${hospital?.province ?? "Angola"}.`,
        type: "urgent"
      })
    ));
    const sent = notifications.filter((item) => item.status === "fulfilled").length;
    await sendRequestPushes(request, matches.map((match) => match.donor));
    await auditRepository.createAuditLog(
      "Hospital",
      `Criou pedido ${request.bloodType} e notificou ${sent} dadores`
    );
    publishRealtimeEvent("REQUEST_CREATED", { request });
    publishRealtimeEvent("DONOR_MATCHED", {
      donors: matches.map((match) => match.donor),
      requestId: request.id
    });

    return { ok: true, request, matches };
  },
  async acceptRequest(donorId: string, requestId: string) {
    const realDonorId = await resolveDonorId(donorId);
    const appointment = await requestRepository.acceptRequest(realDonorId, requestId);
    await auditRepository.createAuditLog("Dador", `Aceitou pedido ${requestId}`);
    publishRealtimeEvent("DONOR_ACCEPTED", { donorId: realDonorId, requestId });
    publishRealtimeEvent("APPOINTMENT_CREATED", { appointment });
    return appointment;
  },
  async completeRequest(donorId: string, requestId: string) {
    const realDonorId = await resolveDonorId(donorId);
    const request = await requestRepository.completeRequest(realDonorId, requestId);
    await notificationRepository.markAllNotificationsRead(realDonorId);
    await notificationRepository.createNotification({
      donorId: realDonorId,
      title: "Doação concluída",
      body: "Obrigado. Os seus pontos foram atualizados.",
      type: "appointment"
    });
    await auditRepository.createAuditLog("Hospital", `Concluiu pedido ${requestId}`);
    publishRealtimeEvent("REQUEST_COMPLETED", {
      donorId: realDonorId,
      requestId,
      rewardPoints: 120
    });
    publishRealtimeEvent("REQUEST_UPDATED", { request });
    return request;
  },
  async updateRequestStatus(requestId: string, status: BloodRequest["status"]) {
    const request = await requestRepository.updateRequestStatus(requestId, status);
    await auditRepository.createAuditLog("Sistema", `Atualizou ${requestId} para ${status}`);
    publishRealtimeEvent("REQUEST_UPDATED", { request });
    return request;
  },
  async validatePin(pin: string, requestId?: string) {
    const appointment = await requestRepository.validatePin(pin, requestId);
    await auditRepository.createAuditLog("Hospital", "Validou PIN de dador");
    publishRealtimeEvent("PIN_VALIDATED", { appointment, pin });
    return appointment;
  },
  listNotifications(donorId: string) {
    return resolveDonorId(donorId).then((id) =>
      notificationRepository.listNotifications(id)
    );
  },
  createAuditLog(actor: string, action: string) {
    return auditRepository.createAuditLog(actor, action);
  },
  createNotification(donorId: string, title: string, body: string) {
    return resolveDonorId(donorId).then((id) =>
      notificationRepository.createNotification({
        donorId: id,
        title,
        body,
        type: "urgent"
      })
    );
  }
};

async function resolveDonorId(donorId: string) {
  if (donorId !== "d1") return donorId;
  const donors = await donorRepository.listDonors();
  return donors[0]?.id ?? donorId;
}

async function resolveHospitalId(hospitalId: string) {
  if (hospitalId !== "h1") return hospitalId;
  const hospitals = await hospitalRepository.listHospitals();
  return hospitals[0]?.id ?? hospitalId;
}
