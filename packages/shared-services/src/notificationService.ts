import { matchingAgent, reminderAgent } from "@doe-sangue-angola/agents";
import type { Appointment, BloodRequest, Donor } from "@doe-sangue-angola/shared-types";
import { appointments, donors, hospitals } from "./mockStore";
import { recordAudit } from "./auditService";
import { publishRealtimeEvent } from "./realtimeService";

export type NotificationType = "stock" | "eligibility" | "urgent" | "appointment";
export type PushProvider = "mock" | "expo" | "fcm";

export type MockNotification = {
  id: string;
  donorId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: NotificationType;
  channel: "push" | "in-app";
};

type PushPayload = {
  donor: Donor;
  title: string;
  body: string;
  type: NotificationType;
};

const notificationHistory: MockNotification[] = [
  createNotification("d1", "Pedido urgente", "Pedido urgente O- perto de si.", "urgent"),
  createNotification("d1", "Escassez em Luanda", "Há falta de A+ em Luanda.", "stock"),
  createNotification("d1", "Agendamento", "Seu agendamento é amanhã.", "appointment"),
  createNotification("d1", "Elegibilidade", "Já pode doar novamente.", "eligibility")
];

// TODO(production): send production notifications via backend worker, never directly from UI.
export function buildDonorAlert(donor: Donor, hospitalName: string, request?: BloodRequest) {
  const bloodType = request?.bloodType ?? donor.bloodType;

  return {
    to: donor.id,
    title: "Pedido urgente de sangue",
    body: `Pedido urgente ${bloodType} perto de si. ${hospitalName} precisa de ajuda.`
  };
}

export function sendPushNotification(payload: PushPayload, provider: PushProvider = "mock") {
  if (provider === "expo") return sendExpoPushConnectorPreview(payload);
  if (provider === "fcm") return sendFcmConnectorPreview(payload);

  const item = createNotification(
    payload.donor.id,
    payload.title,
    payload.body,
    payload.type,
    "push"
  );
  notificationHistory.unshift(item);
  publishRealtimeEvent("NOTIFICATION_SENT", { donorId: payload.donor.id, notification: item });

  return { delivered: true, provider, notification: item };
}

export function sendMockNotification(donor: Donor, hospitalName: string, request?: BloodRequest) {
  const notification = buildDonorAlert(donor, hospitalName, request);

  return sendPushNotification({
    donor,
    title: notification.title,
    body: notification.body,
    type: "urgent"
  });
}

export function notifyCompatibleDonors(request: BloodRequest) {
  const hospital = hospitals.find((item) => item.id === request.hospitalId);
  const matches = matchingAgent(request, donors).filter(
    (item) => item.recommendation === "Notificar"
  );
  const sent = matches.map((match) =>
    sendMockNotification(match.donor, hospital?.name ?? "Hospital", request)
  );

  recordAudit("notificationService", `Enviou ${sent.length} alertas para ${request.id}`);

  return sent;
}

export function createInAppNotification(
  donorId: string,
  title: string,
  body: string,
  type: NotificationType
) {
  const item = createNotification(donorId, title, body, type, "in-app");
  notificationHistory.unshift(item);
  publishRealtimeEvent("NOTIFICATION_SENT", { donorId, notification: item });

  return item;
}

export function listNotifications(donorId: string) {
  return notificationHistory.filter((item) => item.donorId === donorId);
}

export function getUnreadNotificationCount(donorId: string) {
  return listNotifications(donorId).filter((item) => !item.read).length;
}

export function markNotificationRead(id: string) {
  const item = notificationHistory.find((notification) => notification.id === id);
  if (item) item.read = true;

  return item;
}

export function markAllNotificationsRead(donorId: string) {
  listNotifications(donorId).forEach((item) => {
    item.read = true;
  });

  return getUnreadNotificationCount(donorId);
}

export function buildReminderCards(donorId: string) {
  const donor = donors.find((item) => item.id === donorId) ?? donors[0];
  const donorAppointments = appointments.filter((item) => item.donorId === donor.id);
  const appointmentCards = donorAppointments.map((appointment) =>
    buildReminderFromAppointment(donor, appointment)
  );

  return [
    ...appointmentCards,
    {
      donorId: donor.id,
      title: "Elegibilidade",
      body: "Já pode doar novamente.",
      action: donor.available ? "Notificar agora" : "Aguardar"
    }
  ];
}

function buildReminderFromAppointment(donor: Donor, appointment: Appointment) {
  return {
    ...reminderAgent(donor, appointment),
    action: appointment.status === "Confirmado" ? "Confirmado" : "Confirmar presença"
  };
}

function sendExpoPushConnectorPreview(payload: PushPayload) {
  return {
    delivered: false,
    provider: "expo" as const,
    message: "Expo Push Notifications preparado, ainda não ligado.",
    payload
  };
}

function sendFcmConnectorPreview(payload: PushPayload) {
  return {
    delivered: false,
    provider: "fcm" as const,
    message: "Firebase Cloud Messaging preparado, ainda não ligado.",
    payload
  };
}

function createNotification(
  donorId: string,
  title: string,
  body: string,
  type: NotificationType,
  channel: MockNotification["channel"] = "push"
): MockNotification {
  return {
    id: `not-${donorId}-${type}-${Date.now()}-${title.length}`,
    donorId,
    title,
    body,
    createdAt: "Agora",
    read: type === "eligibility",
    type,
    channel
  };
}
