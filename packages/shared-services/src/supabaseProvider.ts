import { matchingAgent } from "@doe-sangue-angola/agents";
import type { BloodRequest } from "@doe-sangue-angola/shared-types";
import type { DataProvider } from "./mockProvider";
import { auditRepository } from "./repositories/auditRepository";
import { donorRepository } from "./repositories/donorRepository";
import { hospitalRepository } from "./repositories/hospitalRepository";
import { notificationRepository } from "./repositories/notificationRepository";
import { sendRequestPushes } from "./pushService";
import { requestRepository } from "./repositories/requestRepository";

type CreateRequestInput = Omit<BloodRequest, "createdAt" | "id" | "status">;

export const supabaseProvider: DataProvider = {
  listDonors() {
    return donorRepository.listDonors();
  },
  listHospitals() {
    return hospitalRepository.listHospitals();
  },
  listRequests() {
    return requestRepository.listRequests();
  },
  async createRequest(input: CreateRequestInput) {
    const request = await requestRepository.createRequest(input);
    const donors = await donorRepository.listDonors();
    const hospital = await hospitalRepository.getHospital(request.hospitalId);
    const matches = matchingAgent(request, donors)
      .filter((item) => item.recommendation === "Notificar")
      .slice(0, 12);

    await Promise.all(matches.map((match) =>
      notificationRepository.createNotification({
        donorId: match.donor.id,
        title: "Pedido urgente de sangue",
        body: `Pedido urgente ${request.bloodType} em ${hospital?.province ?? "Angola"}.`,
        type: "urgent"
      })
    ));
    await sendRequestPushes(request, matches.map((match) => match.donor));
    await auditRepository.createAuditLog(
      "Hospital",
      `Criou pedido ${request.bloodType} e notificou ${matches.length} dadores`
    );

    return { ok: true, request, matches };
  },
  async acceptRequest(donorId: string, requestId: string) {
    const appointment = await requestRepository.acceptRequest(donorId, requestId);
    await auditRepository.createAuditLog("Dador", `Aceitou pedido ${requestId}`);
    return appointment;
  },
  async completeRequest(donorId: string, requestId: string) {
    const request = await requestRepository.completeRequest(donorId, requestId);
    await notificationRepository.createNotification({
      donorId,
      title: "Doação concluída",
      body: "Obrigado. Os seus pontos foram atualizados.",
      type: "appointment"
    });
    await auditRepository.createAuditLog("Hospital", `Concluiu pedido ${requestId}`);
    return request;
  },
  async validatePin(pin: string) {
    const appointment = await requestRepository.validatePin(pin);
    await auditRepository.createAuditLog("Hospital", "Validou PIN de dador");
    return appointment;
  },
  listNotifications(donorId: string) {
    return notificationRepository.listNotifications(donorId);
  },
  createAuditLog(actor: string, action: string) {
    return auditRepository.createAuditLog(actor, action);
  },
  createNotification(donorId: string, title: string, body: string) {
    return notificationRepository.createNotification({
      donorId,
      title,
      body,
      type: "urgent"
    });
  }
};
