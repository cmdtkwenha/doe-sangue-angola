import {
  alerts,
  appointments,
  auditLogs,
  communications,
  donors,
  hospitals,
  inventory,
  requests
} from "./mockStore";
import type { Appointment, BloodRequest, Donor } from "@doe-sangue-angola/shared-types";
import type { MockNotification } from "./notificationService";
import { getDataProvider } from "./dataProvider";
import { listNotifications } from "./notificationService";

export type DonorHomeSnapshot = {
  appointment?: Appointment;
  donor: Donor;
  history: Appointment[];
  nearbyRequests: BloodRequest[];
  notifications: MockNotification[];
  unreadCount: number;
};

// TODO(production): replace dashboard summaries with aggregated repository queries or views.
export function getNationalSummary() {
  const critical = requests.filter((request) => request.urgency === "Critica");
  const available = donors.filter((donor) => donor.available);

  return {
    hospitals: hospitals.length,
    activeRequests: requests.length,
    criticalRequests: critical.length,
    availableDonors: available.length,
    auditLogs,
    alerts
  };
}

export function getHospitalSummary(hospitalId: string) {
  const hospitalRequests = requests.filter(
    (request) => request.hospitalId === hospitalId
  );
  const hospitalAppointments = appointments.filter(
    (appointment) => appointment.hospitalId === hospitalId
  );

  return {
    requests: hospitalRequests,
    appointments: hospitalAppointments,
    communications,
    inventory,
    openCount: hospitalRequests.filter((request) => request.status === "Aberto").length
  };
}

export function getDonorHome(donorId: string) {
  const donor = donors.find((item) => item.id === donorId) ?? donors[0];
  if (!donor) throw new Error("Perfil ainda não configurado.");
  const appointment = appointments.find((item) => item.donorId === donor.id);
  const notifications = listNotifications(donor.id);

  return {
    donor,
    appointment,
    nearbyRequests: requests.slice(0, 2),
    history: appointments.filter((item) => item.donorId === donor.id),
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length
  };
}

export async function getDonorHomeAsync(donorId: string): Promise<DonorHomeSnapshot> {
  const provider = getDataProvider();
  const donorList = await provider.listDonors() as Donor[];
  const donor = donorList.find((item) => item.id === donorId) ?? donorList[0] ?? donors[0];
  if (!donor) throw new Error("Perfil ainda não configurado.");
  const [nearbyRequests, history, notifications] = await Promise.all([
    provider.listRequestsForDonor(donor.id) as Promise<BloodRequest[]>,
    provider.listAppointmentsForDonor(donor.id) as Promise<Appointment[]>,
    provider.listNotifications(donor.id) as Promise<MockNotification[]>
  ]);

  return {
    donor,
    appointment: history[0],
    nearbyRequests,
    history,
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length
  };
}
