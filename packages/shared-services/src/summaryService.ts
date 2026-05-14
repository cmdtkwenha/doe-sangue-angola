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
  const appointment = appointments.find((item) => item.donorId === donor.id);

  return {
    donor,
    appointment,
    nearbyRequests: requests.slice(0, 2),
    history: appointments.filter((item) => item.donorId === donor.id)
  };
}
